const canvas = document.getElementById('game');
const context = canvas.getContext('2d');

const pauseBtn = document.getElementById('pauseBtn');
const solImg = new Image();
solImg.src = "images/sol.png";

const coinbaseImg = new Image();
coinbaseImg.src = "images/coinbase.png";

const snakepos = 160;
const applepos = 320
const sqrtgrid = 25;

const grid = 16;
let count = 0;

let score = 0;

let snake = {
    x: snakepos,
    y: snakepos,

    // snake velocity. moves one grid length every frame in either the x or y direction
    dx: grid,
    dy: 0,

    // keep track of all grids the snake body occupies
    cells: [],

    // length of the snake. grows when eating an apple
    maxCells: 4
};
let apple = {
    x: applepos,
    y: applepos
};

let paused = false;
let msg1 = "Status: PENDING";
let msg2 = "The Solana network is currently experiencing delays!"; 
// get random whole numbers in a specific range
// @see https://stackoverflow.com/a/1527820/2124254
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

// game loop
function loop() {
    requestAnimationFrame(loop);

    // slow game loop to 15 fps instead of 60 (60/15 = 4)
    if (++count < 4) {
        return;
    }

    count = 0;
    
    if (paused) {
        // Optional: draw an overlay message on the canvas
        context.fillStyle = 'rgba(0, 0, 0, 0.3)';
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = 'white';
        context.font = '15px Arial';
        context.fillText(msg1, 140, 100);
        context.fillText(msg2, 20, 130);
        context.fillText("Press 'R' to Restart", 130, 230);
        return;
    }
    context.clearRect(0,0,canvas.width,canvas.height);

    // move snake by it's velocity
    snake.x += snake.dx;
    snake.y += snake.dy;

    // wrap snake position horizontally on edge of screen
    if (snake.x < 0) {
        snake.x = canvas.width - grid;
    }
    else if (snake.x >= canvas.width) {
        snake.x = 0;
    }

    // wrap snake position vertically on edge of screen
    if (snake.y < 0) {
        snake.y = canvas.height - grid;
    }
    else if (snake.y >= canvas.height) {
        snake.y = 0;
    }

    // keep track of where snake has been. front of the array is always the head
    snake.cells.unshift({x: snake.x, y: snake.y});

    // remove cells as we move away from them
    if (snake.cells.length > snake.maxCells) {
        snake.cells.pop();
    }

    // draw apple
    context.drawImage(coinbaseImg, apple.x, apple.y, grid, grid);
    

    // draw snake one cell at a time
    snake.cells.forEach(function(cell, index) {

        context.drawImage(solImg, cell.x, cell.y, grid-1, grid-1);

        // snake ate apple
        if (cell.x === apple.x && cell.y === apple.y) {
            snake.maxCells++;
            score++;
            document.getElementById('score').textContent = score;
            // canvas is 400x400 which is 25x25 grids 
            apple.x = getRandomInt(0, sqrtgrid) * grid;
            apple.y = getRandomInt(0, sqrtgrid) * grid;
        }

        // check collision with all cells after this one (modified bubble sort)
        for (var i = index + 1; i < snake.cells.length; i++) {
        
            // snake occupies same space as a body part. reset game
            if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
                paused = true;
            }
            
        }
    });
}

// listen to keyboard events to move the snake
document.addEventListener('keydown', function(e) {
    // prevent snake from backtracking on itself by checking that it's 
    // not already moving on the same axis (pressing left while moving
    // left won't do anything, and pressing right while moving left
    // shouldn't let you collide with your own body)
    if (paused && (e.key === 'r' || e.key === 'R')) {
        restartGame();
        return;
    }
    if (!paused) {
        // left arrow key
        if (e.which === 37 && snake.dx === 0) {
            snake.dx = -grid;
            snake.dy = 0;
        }
        // up arrow key
        else if (e.which === 38 && snake.dy === 0) {
            snake.dy = -grid;
            snake.dx = 0;
        }
        // right arrow key
        else if (e.which === 39 && snake.dx === 0) {
            snake.dx = grid;
            snake.dy = 0;
        }
        // down arrow key
        else if (e.which === 40 && snake.dy === 0) {
            snake.dy = grid;
            snake.dx = 0;
        }
        else if (e.which === 32) {
            paused = !paused;
            console.log(paused);
        }
    }
});

/**
 * ---------------------
 * Mobile Swipe Support
 * ---------------------
 * We'll track the initial touch (xDown, yDown) and compare
 * to final position on touchend to see which direction
 * the user swiped.
 */
let xDown = null;
let yDown = null;

function handleTouchStart(e) {
    xDown = e.touches[0].clientX;
    yDown = e.touches[0].clientY;
}

function handleTouchEnd(e) {
    if( !xDown || !yDown ) {
        return;
    }


    const changedTouch = e.changedTouches[0];
    let xUp = changedTouch.clientX;
    let yUp = changedTouch.clientY;

    let xDiff = xUp - xDown;
    let yDiff = yUp - yDown;

    if (paused) {s
        restartGame();
        xDown = null;
        yDown = null;
        return;
    }

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
        // left or right swipe
        if (xDiff > 0) {
            // right swipe
            if (snake.dx === 0) {
                snake.dx = grid;
                snake.dy = 0;
            }
        } else {
            // left swipe
            if (snake.dx === 0) {
                snake.dx = -grid;
                snake.dy = 0;
            }
        }
    } else {
        // up or down swipe
        if (yDiff > 0) {
            // down swipe
            if (snake.dy === 0) {
                snake.dy = grid;
                snake.dx = 0;
            }
        } else {
            // up swipe
            if (snake.dy === 0) {
                snake.dy = -grid;
                snake.dx = 0;
            }
        }
    }
}

document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchend', handleTouchEnd, false);

pauseBtn.addEventListener('click', function() {
    // If the game is paused due to collision, we interpret pressing
    // the button as a desire to "restart" instead of just toggling.
    if (paused) {
        restartGame();
    } else {
        paused = true; // Pause if currently running
    }
});

function restartGame() {
    paused = false;
    score = 0;
    document.getElementById('score').textContent = score;
    snake.x = snakepos;
    snake.y = snakepos;
    snake.dx = grid;
    snake.dy = 0;
    snake.cells = [];
    snake.maxCells = 4;

    apple.x = applepos;
    apple.y = applepos;
}

requestAnimationFrame(loop);