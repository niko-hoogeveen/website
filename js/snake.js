const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 25; // size of each 'tile' on the grid
const tileCount = canvas.width / gridSize;

// Snake's initial position
let snakePosX = 10;
let snakePosY = 10;

// Velocity (direction)
let xVelocity = 0;
let yVelocity = 0;

// Keep track of where the snake has been
let snakeTrail = [];
let tailLength = 5;

// Apple (food) location
let appleX = 15;
let appleY = 15;

// Main game loop
function gameLoop() {
    // Move snake in the direction of velocity
    snakePosX += xVelocity;
    snakePosY += yVelocity;

    // Wrap snake around edges
    if (snakePosX < 0) {
        snakePosX = tileCount - 1;
    } else if (snakePosX > tileCount - 1) {
        snakePosX = 0;
    }
    if (snakePosY < 0) {
        snakePosY = tileCount - 1;
    } else if (snakePosY > tileCount - 1) {
        snakePosY = 0;
    }

    // Draw background
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    ctx.fillStyle = 'lime';
    for (let i = 0; i < snakeTrail.length; i++) {
        const trail = snakeTrail[i];
        ctx.fillRect(
            trail.x * gridSize,
            trail.y * gridSize,
            gridSize - 2,
            gridSize - 2
        );

        // Check collision with tail
        if (trail.x === snakePosX && trail.y === snakePosY) {
            // Reset tail length
            tailLength = 5;
        }
    }

    // Push current snake position to the trail
    snakeTrail.push({ x: snakePosX, y: snakePosY });
    // Keep the tail at the correct length
    while (snakeTrail.length > tailLength) {
        snakeTrail.shift();
    }

    // Check for apple collision
    if (snakePosX === appleX && snakePosY === appleY) {
        tailLength++;
        appleX = Math.floor(Math.random() * tileCount);
        appleY = Math.floor(Math.random() * tileCount);
    }

    // Draw apple
    ctx.fillStyle = 'red';
    ctx.fillRect(
        appleX * gridSize,
        appleY * gridSize,
        gridSize - 2,
        gridSize - 2
    );
}

// Listen for arrow keys
document.addEventListener('keydown', function (evt) {
    switch (evt.key) {
        case 'ArrowLeft':
            if (xVelocity === 1) break; // Prevent reverse direction
            xVelocity = -1;
            yVelocity = 0;
            break;
        case 'ArrowUp':
            if (yVelocity === 1) break;
            xVelocity = 0;
            yVelocity = -1;
            break;
        case 'ArrowRight':
            if (xVelocity === -1) break;
            xVelocity = 1;
            yVelocity = 0;
            break;
        case 'ArrowDown':
            if (yVelocity === -1) break;
            xVelocity = 0;
            yVelocity = 1;
            break;
    }
});

// Run the game at 10 frames per second
setInterval(gameLoop, 100);
