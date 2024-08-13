// JavaScript code to control the game logic and rendering

// Get references to the canvas element and its 2D drawing context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Get references to the elements that display the player's score and remaining lives
const scoreElement = document.getElementById('scoreValue');
const livesElement = document.getElementById('livesValue');

// Get references to the game overlay and control buttons (start and restart)
const gameOverlay = document.getElementById('gameOverlay');
const message = document.getElementById('message');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');

// Define the initial properties of the player's ship
let ship = {
    x: canvas.width / 2, // Horizontal position, starting at the center of the canvas
    y: canvas.height / 2, // Vertical position, also centered
    radius: 15, // Radius of the ship's triangle shape
    angle: 0, // Initial rotation angle in radians (pointing upward)
    rotation: 0, // Rotation speed, modified by player input (left/right keys)
    thrusting: false, // Indicates if the ship is currently thrusting forward
    thrust: { x: 0, y: 0 }, // Thrust vector, determines movement based on ship's angle
    invulnerable: false, // Whether the ship is temporarily invulnerable (e.g., after respawning)
    exploding: false, // Whether the ship is currently exploding (after a collision)
    explosionParticles: [] // Array to hold particles generated during an explosion
};

// Arrays to manage the asteroids, bullets fired by the ship, and explosion particles
let asteroids = [];
let bullets = [];
let particles = [];

// Initialize the player's score and remaining lives
let score = 0;
let lives = 3;

// Define the current state of the game ('start', 'playing', or 'gameOver')
let gameState = 'start';

// Function to create a new asteroid with random properties (position, size, and speed)
function createAsteroid() {
    return {
        x: Math.random() * canvas.width, // Random horizontal starting position
        y: Math.random() * canvas.height, // Random vertical starting position
        radius: Math.random() * 20 + 10, // Random radius between 10 and 30 pixels
        speedX: Math.random() * 2 - 1, // Random horizontal speed (-1 to 1)
        speedY: Math.random() * 2 - 1 // Random vertical speed (-1 to 1)
    };
}

// Function to create a particle, typically used for explosion effects
function createParticle(x, y) {
    return {
        x: x, // Horizontal starting position, typically where an explosion occurs
        y: y, // Vertical starting position, also where an explosion occurs
        radius: Math.random() * 3 + 1, // Random radius between 1 and 4 pixels
        speedX: (Math.random() - 0.5) * 5, // Random horizontal speed
        speedY: (Math.random() - 0.5) * 5, // Random vertical speed
        life: 60 // Lifespan of the particle in frames before it disappears
    };
}

// Function to initialize or reset the game state when starting a new game
function initializeGame() {
    // Reset the ship's properties to their initial state
    ship = {
        x: canvas.width / 2, // Reset ship to the center of the canvas
        y: canvas.height / 2, // Center the ship vertically as well
        radius: 15, // Ship's size remains the same
        angle: 0, // Reset rotation angle to 0 (pointing up)
        rotation: 0, // No initial rotation
        thrusting: false, // Ship is not thrusting initially
        thrust: { x: 0, y: 0 }, // No movement initially
        invulnerable: false, // Ship is vulnerable to collisions
        exploding: false, // Ship is not exploding
        explosionParticles: [] // No explosion particles initially
    };

    // Clear the arrays that store asteroids, bullets, and particles
    asteroids = [];
    bullets = [];
    particles = [];

    // Reset the score and lives to their initial values
    score = 0;
    lives = 3;
    scoreElement.textContent = score; // Update the displayed score
    livesElement.textContent = lives; // Update the displayed lives

    // Create an initial set of 5 asteroids to start the game
    for (let i = 0; i < 5; i++) {
        asteroids.push(createAsteroid());
    }
}

// Function to draw the player's ship on the canvas
function drawShip() {
    if (ship.exploding) {
        // If the ship is exploding, draw the explosion particles
        ctx.fillStyle = '#e74c3c'; // Use red color for explosion particles
        ship.explosionParticles.forEach(particle => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fill();
        });
    } else {
        // If the ship is not exploding, draw it normally as a triangle
        ctx.strokeStyle = ship.invulnerable ? '#ff0' : '#3498db'; // Yellow if invulnerable, blue otherwise
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(
            ship.x + ship.radius * Math.cos(ship.angle), // Front point of the ship
            ship.y - ship.radius * Math.sin(ship.angle) // Corresponding y-coordinate
        );
        ctx.lineTo(
            ship.x - ship.radius * (Math.cos(ship.angle) + Math.sin(ship.angle)), // Back left corner of the triangle
            ship.y + ship.radius * (Math.sin(ship.angle) - Math.cos(ship.angle)) // Corresponding y-coordinate
        );
        ctx.lineTo(
            ship.x - ship.radius * (Math.cos(ship.angle) - Math.sin(ship.angle)), // Back right corner of the triangle
            ship.y + ship.radius * (Math.sin(ship.angle) + Math.cos(ship.angle)) // Corresponding y-coordinate
        );
        ctx.closePath();
        ctx.stroke();

        // If the ship is thrusting, draw the thrust flame
        if (ship.thrusting) {
            ctx.beginPath();
            ctx.moveTo(
                ship.x - ship.radius * (Math.cos(ship.angle) + 0.5 * Math.sin(ship.angle)), // Base left point of thrust flame
                ship.y + ship.radius * (Math.sin(ship.angle) - 0.5 * Math.cos(ship.angle)) // Corresponding y-coordinate
            );
            ctx.lineTo(
                ship.x - ship.radius * 1.5 * Math.cos(ship.angle), // Tip of the thrust flame (behind the ship)
                ship.y + ship.radius * 1.5 * Math.sin(ship.angle) // Corresponding y-coordinate
            );
            ctx.lineTo(
                ship.x - ship.radius * (Math.cos(ship.angle) - 0.5 * Math.sin(ship.angle)), // Base right point of thrust flame
                ship.y + ship.radius * (Math.sin(ship.angle) + 0.5 * Math.cos(ship.angle)) // Corresponding y-coordinate
            );
            ctx.closePath();
            ctx.fillStyle = '#e74c3c'; // Red color for the thrust flame
            ctx.fill();
        }
    }
}

// Function to draw all the asteroids on the canvas
function drawAsteroids() {
    ctx.strokeStyle = '#2ecc71'; // Green color for the asteroids
    ctx.lineWidth = 2;
    asteroids.forEach(asteroid => {
        ctx.beginPath();
        ctx.arc(asteroid.x, asteroid.y, asteroid.radius, 0, Math.PI * 2); // Draw each asteroid as a circle
        ctx.stroke();
    });
}

// Function to draw all the bullets on the canvas
function drawBullets() {
    ctx.fillStyle = '#e74c3c'; // Red color for the bullets
    bullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 3, 0, Math.PI * 2); // Draw each bullet as a small circle
        ctx.fill();
    });
}

// Function to draw all the particles on the canvas (used for explosion effects)
function drawParticles() {
    particles.forEach(particle => {
        ctx.fillStyle = `rgba(46, 204, 113, ${particle.life / 60})`; // Green color that fades as particle life decreases
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2); // Draw each particle as a small circle
        ctx.fill();
    });
}

// Function to update the game state, including movement, collisions, and explosions
function update() {
    if (gameState !== 'playing') return; // Only update if the game is in the 'playing' state

    if (ship.exploding) {
        // If the ship is exploding, update the explosion particles
        updateExplosion();
    } else {
        // Update the ship's position based on its thrust vector
        ship.x += ship.thrust.x;
        ship.y += ship.thrust.y;

        // Wrap the ship around the screen edges (teleport from one side to the other)
        if (ship.x < 0) ship.x = canvas.width;
        if (ship.x > canvas.width) ship.x = 0;
        if (ship.y < 0) ship.y = canvas.height;
        if (ship.y > canvas.height) ship.y = 0;

        // Update the ship's rotation angle based on player input
        ship.angle += ship.rotation;

        // Update the ship's thrust vector when thrusting
        if (ship.thrusting) {
            ship.thrust.x += 0.1 * Math.cos(ship.angle); // Thrust in the direction of the ship's nose
            ship.thrust.y -= 0.1 * Math.sin(ship.angle); // Thrust in the opposite direction of gravity
        } else {
            // Apply friction to the ship's movement when not thrusting
            ship.thrust.x *= 0.99;
            ship.thrust.y *= 0.99;
        }

        // Check for collisions with asteroids, but only if the ship is not invulnerable
        if (!ship.invulnerable) {
            asteroids.forEach(asteroid => {
                const dx = ship.x - asteroid.x; // Calculate horizontal distance
                const dy = ship.y - asteroid.y; // Calculate vertical distance
                const distance = Math.sqrt(dx * dx + dy * dy); // Calculate total distance

                if (distance < ship.radius + asteroid.radius) {
                    // If the distance is less than the sum of their radii, they have collided
                    explodeShip(); // Trigger the ship's explosion
                }
            });
        }
    }

    // Update the position of each asteroid
    asteroids.forEach(asteroid => {
        asteroid.x += asteroid.speedX; // Move asteroid horizontally
        asteroid.y += asteroid.speedY; // Move asteroid vertically

        // Wrap asteroids around the screen edges
        if (asteroid.x < 0) asteroid.x = canvas.width;
        if (asteroid.x > canvas.width) asteroid.x = 0;
        if (asteroid.y < 0) asteroid.y = canvas.height;
        if (asteroid.y > canvas.height) asteroid.y = 0;
    });

    // Update the position of each bullet and check for collisions with asteroids
    bullets.forEach((bullet, index) => {
        bullet.x += bullet.speedX; // Move bullet horizontally
        bullet.y += bullet.speedY; // Move bullet vertically

        // Remove the bullet if it goes off-screen
        if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
            bullets.splice(index, 1);
        }

        // Check for collisions between bullets and asteroids
        asteroids.forEach((asteroid, asteroidIndex) => {
            const dx = bullet.x - asteroid.x; // Calculate horizontal distance
            const dy = bullet.y - asteroid.y; // Calculate vertical distance
            const distance = Math.sqrt(dx * dx + dy * dy); // Calculate total distance

            if (distance < asteroid.radius) {
                // If the distance is less than the asteroid's radius, a collision has occurred
                for (let i = 0; i < 20; i++) {
                    particles.push(createParticle(asteroid.x, asteroid.y)); // Create explosion particles
                }

                // Remove the bullet and the asteroid from their respective arrays
                bullets.splice(index, 1);
                asteroids.splice(asteroidIndex, 1);
                score += 10; // Increase the player's score for destroying an asteroid
                scoreElement.textContent = score; // Update the displayed score

                // If the asteroid is large, split it into two smaller asteroids
                if (asteroid.radius > 10) {
                    for (let i = 0; i < 2; i++) {
                        asteroids.push({
                            x: asteroid.x, // New asteroid starts at the location of the destroyed one
                            y: asteroid.y,
                            radius: asteroid.radius / 2, // Smaller size
                            speedX: Math.random() * 2 - 1, // Random new speed
                            speedY: Math.random() * 2 - 1 // Random new speed
                        });
                    }
                }

                // Ensure there are always at least 5 asteroids on the screen
                if (asteroids.length < 5) {
                    asteroids.push(createAsteroid());
                }
            }
        });
    });

    // Update the position and life of each particle (used for explosions)
    particles.forEach((particle, index) => {
        particle.x += particle.speedX; // Move particle horizontally
        particle.y += particle.speedY; // Move particle vertically
        particle.life--; // Decrease particle life

        // Remove the particle if its life is over
        if (particle.life <= 0) {
            particles.splice(index, 1);
        }
    });
}

// Function to handle the ship's explosion when it collides with an asteroid
function explodeShip() {
    ship.exploding = true; // Set the ship's state to exploding
    ship.explosionParticles = []; // Clear any previous explosion particles
    for (let i = 0; i < 30; i++) {
        // Create a set of explosion particles at the ship's location
        ship.explosionParticles.push({
            x: ship.x, // Particle starts at the ship's position
            y: ship.y,
            radius: Math.random() * 3 + 1, // Random particle size
            speedX: (Math.random() - 0.5) * 5, // Random horizontal speed
            speedY: (Math.random() - 0.5) * 5, // Random vertical speed
            life: 60 // Particle lifespan
        });
    }
    setTimeout(loseLife, 1000); // After 1 second, trigger the loss of a life
}

// Function to update the explosion particles and reset the ship after the explosion ends
function updateExplosion() {
    ship.explosionParticles.forEach((particle, index) => {
        particle.x += particle.speedX; // Move particle horizontally
        particle.y += particle.speedY; // Move particle vertically
        particle.life--; // Decrease particle life

        // Remove the particle if its life is over
        if (particle.life <= 0) {
            ship.explosionParticles.splice(index, 1);
        }
    });

    // Once all explosion particles are gone, reset the ship
    if (ship.explosionParticles.length === 0) {
        ship.exploding = false; // Stop the explosion
        resetShip(); // Reset the ship's position and state
    }
}

// Function to draw the current frame of the game
function draw() {
    // Clear the entire canvas by filling it with a dark background color
    ctx.fillStyle = '#0f0f1f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Only draw game elements if the game is in the 'playing' state
    if (gameState === 'playing') {
        drawShip(); // Draw the player's ship
        drawAsteroids(); // Draw all the asteroids
        drawBullets(); // Draw all the bullets
        drawParticles(); // Draw all the explosion particles
    }
}

// Main game loop: updates the game state and renders the next frame
function gameLoop() {
    update(); // Update the game state (movement, collisions, etc.)
    draw(); // Render the updated state onto the canvas
    requestAnimationFrame(gameLoop); // Recursively call gameLoop for the next frame
}

// Function to start the game
function startGame() {
    gameState = 'playing'; // Set the game state to 'playing'
    initializeGame(); // Initialize the game state (reset variables, create asteroids, etc.)
    gameOverlay.style.display = 'none'; // Hide the game overlay
}

// Function to handle the player losing a life
function loseLife() {
    lives--; // Decrease the number of lives by one
    livesElement.textContent = lives; // Update the displayed lives

    // If no lives remain, end the game
    if (lives <= 0) {
        gameOver();
    }
}

// Function to reset the ship's position and state after losing a life
function resetShip() {
    const safeSpot = findSafeSpot(); // Find a safe spot on the screen to respawn the ship
    ship.x = safeSpot.x; // Place the ship at the safe spot's x-coordinate
    ship.y = safeSpot.y; // Place the ship at the safe spot's y-coordinate
    ship.thrust = { x: 0, y: 0 }; // Reset the ship's thrust to zero
    ship.invulnerable = true; // Make the ship invulnerable temporarily
    setTimeout(() => {
        ship.invulnerable = false; // Remove invulnerability after 3 seconds
    }, 3000);
}

// Function to find a safe spot on the screen for the ship to respawn
function findSafeSpot() {
    let safeSpot;
    let attempts = 0;
    const maxAttempts = 100; // Maximum number of attempts to find a safe spot

    while (!safeSpot && attempts < maxAttempts) {
        const x = Math.random() * canvas.width; // Random horizontal position
        const y = Math.random() * canvas.height; // Random vertical position
        let safe = true;

        // Check if the randomly chosen spot is safe from asteroids
        for (const asteroid of asteroids) {
            const dx = x - asteroid.x; // Calculate horizontal distance
            const dy = y - asteroid.y; // Calculate vertical distance
            const distance = Math.sqrt(dx * dx + dy * dy); // Calculate total distance

            if (distance < ship.radius + asteroid.radius + 50) {
                // If the distance is too small, the spot is not safe
                safe = false;
                break;
            }
        }

        // If the spot is determined to be safe, use it as the respawn location
        if (safe) {
            safeSpot = { x, y };
        }

        attempts++;
    }

    // If no safe spot was found, default to the center of the screen
    return safeSpot || { x: canvas.width / 2, y: canvas.height / 2 };
}

// Function to handle the game over state when the player loses all lives
function gameOver() {
    gameState = 'gameOver'; // Set the game state to 'gameOver'
    message.textContent = `Game Over! Score: ${score}`; // Display the final score to the player
    gameOverlay.style.display = 'flex'; // Show the game overlay
    startButton.style.display = 'none'; // Hide the start button
    restartButton.style.display = 'block'; // Show the restart button
}

// Event listener for keydown events to control the ship
document.addEventListener('keydown', (e) => {
    if (gameState !== 'playing') return; // Ignore input if the game is not in 'playing' state

    if (e.key === 'ArrowLeft') ship.rotation = 0.1; // Rotate the ship left
    if (e.key === 'ArrowRight') ship.rotation = -0.1; // Rotate the ship right
    if (e.key === 'ArrowUp') ship.thrusting = true; // Start thrusting the ship forward
    if (e.key === ' ') {
        // Fire a bullet from the ship's nose
        bullets.push({
            x: ship.x + ship.radius * Math.cos(ship.angle), // Starting position of the bullet (front of the ship)
            y: ship.y - ship.radius * Math.sin(ship.angle), // Corresponding y-coordinate
            speedX: 5 * Math.cos(ship.angle), // Bullet speed in the x-direction
            speedY: -5 * Math.sin(ship.angle) // Bullet speed in the y-direction
        });
    }
});

// Event listener for keyup events to stop the ship's movement
document.addEventListener('keyup', (e) => {
    if (gameState !== 'playing') return; // Ignore input if the game is not in 'playing' state

    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') ship.rotation = 0; // Stop rotating the ship
    if (e.key === 'ArrowUp') ship.thrusting = false; // Stop thrusting the ship forward
});

// Event listeners for the start and restart buttons
startButton.addEventListener('click', startGame); // Start the game when the start button is clicked
restartButton.addEventListener('click', startGame); // Restart the game when the restart button is clicked

// Display the initial message and start the main game loop
message.textContent = 'Modern Asteroids'; // Set the initial message
gameLoop(); // Start the game loop, which will continue running until the game ends
