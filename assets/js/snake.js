const canvas = document.getElementById('game');
const context = canvas.getContext('2d');

canvas.addEventListener('touchstart', (e) => { e.preventDefault(); }, { passive: false });
canvas.addEventListener('touchmove', (e) => { e.preventDefault(); }, { passive: false });

const pauseBtn = document.getElementById('pauseBtn');
const startBtn = document.getElementById('startBtn');
const solImg = new Image();
solImg.src = "images/solicon.png";

const coinbaseImg = new Image();
coinbaseImg.src = "images/coinbase.png";

let imagesLoaded = 0;
solImg.onload = () => { imagesLoaded++; checkImagesLoaded(); };
coinbaseImg.onload = () => { imagesLoaded++; checkImagesLoaded(); };

function checkImagesLoaded() {
    if (imagesLoaded === 2) {
        // Once images are loaded, the user can click Start
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    }
}

const snakepos = 160;
const applepos = 320;
const sqrtgrid = 25;

const grid = 16;
let count = 0;

let score = 0;
let highscore = 0;

let snake = {
    x: snakepos,
    y: snakepos,
    dx: grid,
    dy: 0,
    cells: [],
    maxCells: 4
};

let apple = {
    x: applepos,
    y: applepos
};

let paused = true;
let msg = "Game Over: You go Sol'D!";



let timer = 0;
let timerInterval = null;
// get random whole numbers in a specific range
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

// game loop
function loop() {
    if (paused) {
        drawCanvas(msg);
        return;
    }
    
    requestAnimationFrame(loop);

    // slow game loop to 15 fps instead of 60 (60/15 = 4)
    if (++count < 4) {
        return;
    }

    count = 0;
    
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
    context.drawImage(solImg, apple.x, apple.y, grid, grid);
    

    // draw snake one cell at a time
    snake.cells.forEach(function(cell, index) {

        context.drawImage(coinbaseImg, cell.x, cell.y, grid-1, grid-1);

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
                if (score > highscore) {
                    highscore = score;
                    document.getElementById('highscore').textContent = highscore;
                }
                paused = true;
                stopTimer();
                startBtn.disabled = false;
                pauseBtn.disabled = true;
                // Set the new messasge from the array
                currentMsg = "GAME OVER";
            }
            
        }
    });
}

// listen to keyboard events to move the snake
document.addEventListener('keydown', function(e) {
    
    if (!paused) {
        // left arrow key
        if (e.which === 37 && snake.dx === 0) {
            e.preventDefault();
            snake.dx = -grid;
            snake.dy = 0;
        }
        // up arrow key
        else if (e.which === 38 && snake.dy === 0) {
            e.preventDefault();
            snake.dy = -grid;
            snake.dx = 0;
        }
        // right arrow key
        else if (e.which === 39 && snake.dx === 0) {
            e.preventDefault();
            snake.dx = grid;
            snake.dy = 0;
        }
        // down arrow key
        else if (e.which === 40 && snake.dy === 0) {
            e.preventDefault();
            snake.dy = grid;
            snake.dx = 0;
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

canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

startBtn.addEventListener('click', handleStart, { passive: false });
startBtn.addEventListener('touchstart', handleStart, { passive: false });

pauseBtn.addEventListener('click', handlePause, { passive: false });
pauseBtn.addEventListener('touchstart', handlePause, { passive: false });

function handleStart(e) {
    e.preventDefault();
    if (paused) {
        restartGame();
        paused = false;
        requestAnimationFrame(loop);
        startBtn.disabled = true;
        pauseBtn.disabled = false;
    }
}

function handlePause(e) {
    e.preventDefault();
    if (!paused) {
        paused = true;
        stopTimer();
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    }
}

function restartGame() {
    paused = false;
    score = 0;
    timer = 0;
    document.getElementById('score').textContent = score;
    document.getElementById('time').textContent = timer;
    snake.x = snakepos;
    snake.y = snakepos;
    snake.dx = grid;
    snake.dy = 0;
    snake.cells = [];
    snake.maxCells = 4;

    apple.x = getRandomInt(0, sqrtgrid) * grid;
    apple.y = getRandomInt(0, sqrtgrid) * grid;
    startTimer();
}

function startTimer() {
    if (!timerInterval) {
        timerInterval = setInterval(function() {
            timer++;
            document.getElementById('time').textContent = timer;
        }, 1000);
    }
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function drawCanvas(msg) {
    context.fillStyle = 'rgba(0, 0, 0, 0.3)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = 'white';
        context.font = '1.2rem megamax';
        context.fillText(msg, 30, 150);
        context.fillText('Press Start to Play Again!', 25, 200);
}

document.getElementById('time').textContent = timer;


window.addEventListener("load", () => {
    startBtn.disabled = false;
    pauseBtn.disabled = true;
});