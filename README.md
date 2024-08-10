# JSeroids: Modern Asteroids Game

JSeroids is a modern take on the classic Asteroids game, implemented using HTML5 Canvas and JavaScript. This project demonstrates how to create a simple yet engaging browser-based game with smooth animations and responsive controls.

## Features

- Responsive ship controls (rotation and thrust)
- Shooting mechanism to destroy asteroids
- Collision detection between ship, bullets, and asteroids
- Particle effects for explosions
- Score tracking and lives system
- Game states: Start, Playing, and Game Over
- Responsive design that works on various screen sizes

## How to Play

1. Open the `index.html` file in a modern web browser.
2. Click the "Start Game" button to begin.
3. Use the arrow keys to control the ship:
   - Left Arrow: Rotate left
   - Right Arrow: Rotate right
   - Up Arrow: Thrust forward
4. Press the Spacebar to shoot bullets and destroy asteroids.
5. Avoid colliding with asteroids to stay alive.
6. Destroy all asteroids to advance and increase your score.

## Technical Details

- The game is built using vanilla JavaScript and HTML5 Canvas.
- No external libraries or frameworks are used.
- The game loop is implemented using `requestAnimationFrame` for smooth animation.
- Collision detection is handled using simple distance calculations.
- The project structure is contained in a single HTML file for simplicity, with inline JavaScript and CSS.

## Customization

You can easily customize various aspects of the game by modifying the JavaScript code:

- Adjust the `canvas.width` and `canvas.height` to change the game area size.
- Modify the `ship` object properties to alter the player's ship characteristics.
- Change the number and properties of asteroids in the `createAsteroid` function.
- Adjust scoring system in the update loop where collisions are detected.

## Future Improvements

- Add sound effects and background music
- Implement levels with increasing difficulty
- Add power-ups and special weapons
- Create a high score system with local storage
- Optimize for mobile devices with touch controls

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).
