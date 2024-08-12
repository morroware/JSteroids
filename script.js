// JavaScript code to control the game logic and rendering

// Get references to the canvas and its context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Get references to the score and lives display elements
const scoreElement = document.getElementById('scoreValue');
const livesElement = document.getElementById('livesValue');

// Get references to the game overlay and buttons
const gameOverlay = document.getElementById('gameOverlay');
const message = document.getElementById('message');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');

// Define the ship's properties
let ship = {
    x: canvas.width / 2, // Start at the center of the canvas
    y: canvas.height / 2,
    radius: 15, // Radius of the ship's triangular shape
    angle: 0, // Ship's rotation angle in radians
    rotation: 0, // Rotation speed, adjusted by player input
    thrusting: false, // Whether the ship is currently thrusting
    thrust: { x: 0, y: 0 }, // Thrust vector, affected by the ship's angle
    invulnerable: false, // Invulnerability status after respawning
    exploding: false, // Whether the ship is currently exploding
    explosionParticles: [] // Particles generated during an explosion
};

// Arrays to hold the asteroids, bullets, and explosion particles
let asteroids = [];
let bullets = [];
let particles = [];

// Initialize the score and lives
let score = 0;
let lives = 3;

// The current state of the game ('start', 'playing', or 'gameOver')
let gameState = 'start';

// Function to create a new asteroid with random properties
function createAsteroid() {
    return {
        x: Math.random() * canvas.width, // Random starting position
        y: Math.random() * canvas.height,
        radius: Math.random() * 20 + 10, // Random radius between 10 and 30
        speedX: Math.random() * 2 - 1, // Random speed in the X direction
        speedY: Math.random() * 2 - 1 // Random speed in the Y direction
    };
}

// Function to create a particle (used for explosions)
function createParticle(x, y) {
    return {
        x: x, // Starting position (usually where an asteroid or ship explodes)
        y: y,
        radius: Math.random() * 3 + 1, // Random size for the particle
        speedX: (Math.random() - 0.5) * 5, // Random speed in X direction
        speedY: (Math.random() - 0.5) * 5, // Random speed in Y direction
        life: 60 // Lifespan of the particle (frames before it disappears)
    };
}

// Function to initialize or reset the game state
function initializeGame() {
    // Reset the ship to its initial state
    ship = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 15,
        angle: 0,
        rotation: 0,
        thrusting: false,
        thrust: { x: 0, y: 0 },
        invulnerable: false,
        exploding: false,
        explosionParticles: []
    };

    // Clear the asteroids, bullets, and particles arrays
    asteroids = [];
    bullets = [];
    particles = [];

    // Reset score and lives
    score = 0;
    lives = 3;
    scoreElement.textContent = score; // Update the displayed score
    livesElement.textContent = lives; // Update the displayed lives

    // Create initial asteroids
    for (let i = 0; i < 5; i++) {
        asteroids.push(createAsteroid());
    }
}

// Function to draw the player's ship on the canvas
function drawShip() {
    if (ship.exploding) {
        // If the ship is exploding, draw the explosion particles
        ctx.fillStyle = '#e74c3c'; // Red color for the explosion
        ship.explosionParticles.forEach(particle => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fill();
        });
    } else {
        // If the ship is not exploding, draw it normally
        ctx.strokeStyle = ship.invulnerable ? '#ff0' : '#3498db'; // Yellow if invulnerable, blue otherwise
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(
            ship.x + ship.radius * Math.cos(ship.angle), // Front of the ship
            ship.y - ship.radius * Math.sin(ship.angle)
        );
        ctx.lineTo(
            ship.x - ship.radius * (Math.cos(ship.angle) + Math.sin(ship.angle)), // Back left corner
            ship.y + ship.radius * (Math.sin(ship.angle) - Math.cos(ship.angle))
        );
        ctx.lineTo(
            ship.x - ship.radius * (Math.cos(ship.angle) - Math.sin(ship.angle)), // Back right corner
            ship.y + ship.radius * (Math.sin(ship.angle) + Math.cos(ship.angle))
        );
        ctx.closePath();
        ctx.stroke();

        // Draw the thrust flame if the ship is thrusting
        if (ship.thrusting) {
            ctx.beginPath();
            ctx.moveTo(
                ship.x - ship.radius * (Math.cos(ship.angle) + 0.5 * Math.sin(ship.angle)),
                ship.y + ship.radius * (Math.sin(ship.angle) - 0.5 * Math.cos(ship.angle))
            );
            ctx.lineTo(
                ship.x - ship.radius * 1.5 * Math.cos(ship.angle),
                ship.y + ship.radius * 1.5 * Math.sin(ship.angle)
            );
            ctx.lineTo(
                ship.x - ship.radius * (Math.cos(ship.angle) - 0.5 * Math.sin(ship.angle)),
                ship.y + ship.radius * (Math.sin(ship.angle) + 0.5 * Math.cos(ship.angle))
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
        ctx.arc(asteroid.x, asteroid.y, asteroid.radius, 0, Math.PI * 2);
        ctx.stroke();
    });
}

// Function to draw all the bullets on the canvas
function drawBullets() {
    ctx.fillStyle = '#e74c3c'; // Red color for the bullets
    bullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 3, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Function to draw all the particles on the canvas (used for explosion effects)
function drawParticles() {
    particles.forEach(particle => {
        ctx.fillStyle = `rgba(46, 204, 113, ${particle.life / 60})`; // Green color that fades with time
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Function to update the game state (movement, collision detection, etc.)
function update() {
    if (gameState !== 'playing') return; // Only update if the game is in 'playing' state

    if (ship.exploding) {
        // If the ship is exploding, update the explosion
        updateExplosion();
    } else {
        // Update ship's position based on thrust
        ship.x += ship.thrust.x;
        ship.y += ship.thrust.y;

        // Wrap the ship around the screen edges
        if (ship.x < 0) ship.x = canvas.width;
        if (ship.x > canvas.width) ship.x = 0;
        if (ship.y < 0) ship.y = canvas.height;
        if (ship.y > canvas.height) ship.y = 0;

        // Update the ship's rotation
        ship.angle += ship.rotation;

        // Update the ship's thrust
        if (ship.thrusting) {
            ship.thrust.x += 0.1 * Math.cos(ship.angle);
            ship.thrust.y -= 0.1 * Math.sin(ship.angle);
        } else {
            ship.thrust.x *= 0.99; // Apply friction to slow down the ship
            ship.thrust.y *= 0.99;
        }

        // Check for collisions with asteroids if the ship is not invulnerable
        if (!ship.invulnerable) {
            asteroids.forEach(asteroid => {
                const dx = ship.x - asteroid.x;
                const dy = ship.y - asteroid.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < ship.radius + asteroid.radius) {
                    // If collision detected, explode the ship
                    explodeShip();
                }
            });
        }
    }

    // Update each asteroid's position
    asteroids.forEach(asteroid => {
        asteroid.x += asteroid.speedX;
        asteroid.y += asteroid.speedY;

        // Wrap asteroids around the screen edges
        if (asteroid.x < 0) asteroid.x = canvas.width;
        if (asteroid.x > canvas.width) asteroid.x = 0;
        if (asteroid.y < 0) asteroid.y = canvas.height;
        if (asteroid.y > canvas.height) asteroid.y = 0;
    });

    // Update each bullet's position and check for collisions with asteroids
    bullets.forEach((bullet, index) => {
        bullet.x += bullet.speedX;
        bullet.y += bullet.speedY;

        // Remove the bullet if it goes off-screen
        if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
            bullets.splice(index, 1);
        }

        // Check for collisions with asteroids
        asteroids.forEach((asteroid, asteroidIndex) => {
            const dx = bullet.x - asteroid.x;
            const dy = bullet.y - asteroid.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < asteroid.radius) {
                // If collision detected, create explosion particles
                for (let i = 0; i < 20; i++) {
                    particles.push(createParticle(asteroid.x, asteroid.y));
                }

                // Remove the bullet and the asteroid
                bullets.splice(index, 1);
                asteroids.splice(asteroidIndex, 1);
                score += 10; // Increase the score
                scoreElement.textContent = score;

                // If the asteroid is large, split it into two smaller asteroids
                if (asteroid.radius > 10) {
                    for (let i = 0; i < 2; i++) {
                        asteroids.push({
                            x: asteroid.x,
                            y: asteroid.y,
                            radius: asteroid.radius / 2,
                            speedX: Math.random() * 2 - 1,
                            speedY: Math.random() * 2 - 1
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

    // Update each particle's position and reduce its lifespan
    particles.forEach((particle, index) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.life--;

        // Remove the particle if its life is over
        if (particle.life <= 0) {
            particles.splice(index, 1);
        }
    });
}

// Function to handle the ship's explosion
function explodeShip() {
    ship.exploding = true; // Set the ship to exploding state
    ship.explosionParticles = [];
    for (let i = 0; i < 30; i++) {
        // Create explosion particles
        ship.explosionParticles.push({
            x: ship.x,
            y: ship.y,
            radius: Math.random() * 3 + 1,
            speedX: (Math.random() - 0.5) * 5,
            speedY: (Math.random() - 0.5) * 5,
            life: 60
        });
    }
    setTimeout(loseLife, 1000); // After the explosion, call loseLife
}

// Function to update the explosion particles
function updateExplosion() {
    ship.explosionParticles.forEach((particle, index) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.life--;

        // Remove the particle if its life is over
        if (particle.life <= 0) {
            ship.explosionParticles.splice(index, 1);
        }
    });

    // Once all particles are gone, reset the ship
    if (ship.explosionParticles.length === 0) {
        ship.exploding = false;
        resetShip();
    }
}

// Function to draw the current frame
function draw() {
    // Clear the canvas by filling it with the background color
    ctx.fillStyle = '#0f0f1f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw game elements only when in 'playing' state
    if (gameState === 'playing') {
        drawShip();
        drawAsteroids();
        drawBullets();
        drawParticles();
    }
}

// Main game loop: update the game state and draw the next frame
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop); // Recursively call gameLoop for the next frame
}

// Function to start the game
function startGame() {
    gameState = 'playing'; // Set the game state to 'playing'
    initializeGame(); // Initialize the game state
    gameOverlay.style.display = 'none'; // Hide the overlay
}

// Function to handle losing a life
function loseLife() {
    lives--; // Decrease the number of lives
    livesElement.textContent = lives;

    // If no lives remain, end the game
    if (lives <= 0) {
        gameOver();
    }
}

// Function to reset the ship's position after losing a life
function resetShip() {
    const safeSpot = findSafeSpot(); // Find a safe spot for the ship
    ship.x = safeSpot.x;
    ship.y = safeSpot.y;
    ship.thrust = { x: 0, y: 0 };
    ship.invulnerable = true; // Make the ship invulnerable temporarily
    setTimeout(() => {
        ship.invulnerable = false; // Remove invulnerability after 3 seconds
    }, 3000);
}

// Function to find a safe spot for the ship to respawn
function findSafeSpot() {
    let safeSpot;
    let attempts = 0;
    const maxAttempts = 100; // Maximum attempts to find a safe spot

    while (!safeSpot && attempts < maxAttempts) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        let safe = true;

        // Check if the spot is safe from asteroids
        for (const asteroid of asteroids) {
            const dx = x - asteroid.x;
            const dy = y - asteroid.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < ship.radius + asteroid.radius + 50) {
                safe = false;
                break;
            }
        }

        // If the spot is safe, set it as the respawn location
        if (safe) {
            safeSpot = { x, y };
        }

        attempts++;
    }

    // Return the found safe spot, or the center of the screen if none was found
    return safeSpot || { x: canvas.width / 2, y: canvas.height / 2 };
}

// Function to handle game over state
function gameOver() {
    gameState = 'gameOver'; // Set the game state to 'gameOver'
    message.textContent = `Game Over! Score: ${score}`; // Display the final score
    gameOverlay.style.display = 'flex'; // Show the overlay
    startButton.style.display = 'none'; // Hide the start button
    restartButton.style.display = 'block'; // Show the restart button
}

// Event listener for keydown events to control the ship
document.addEventListener('keydown', (e) => {
    if (gameState !== 'playing') return; // Ignore input if not playing

    if (e.key === 'ArrowLeft') ship.rotation = 0.1; // Rotate left
    if (e.key === 'ArrowRight') ship.rotation = -0.1; // Rotate right
    if (e.key === 'ArrowUp') ship.thrusting = true; // Start thrusting
    if (e.key === ' ') {
        // Fire a bullet
        bullets.push({
            x: ship.x + ship.radius * Math.cos(ship.angle),
            y: ship.y - ship.radius * Math.sin(ship.angle),
            speedX: 5 * Math.cos(ship.angle),
            speedY: -5 * Math.sin(ship.angle)
        });
    }
});

// Event listener for keyup events to stop ship's movement
document.addEventListener('keyup', (e) => {
    if (gameState !== 'playing') return; // Ignore input if not playing

    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') ship.rotation = 0; // Stop rotation
    if (e.key === 'ArrowUp') ship.thrusting = false; // Stop thrusting
});

// Event listeners for start and restart buttons
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);

// Display the initial message and start the game loop
message.textContent = 'Modern Asteroids';
gameLoop();
