let score = 0;
let timer = 30;
let level = 1;
let gameInterval;
let targetInterval;
let hasSecondChance = true; // Track if the player has used their second chance
let isPaused = false; // Track if the game is paused

const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const levelElement = document.getElementById('level');
const gameArea = document.getElementById('game-area');

// Load the click sound
const clickSound = document.getElementById('click-sound');

// Define base target score and target score increment
const baseTargetScore = 5; // Starting target score for level 1
const targetScoreIncrement = 5; // Amount to increase the target score per level

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('pause-btn').addEventListener('click', togglePause);
document.getElementById('restart-btn').addEventListener('click', restartGame);

function startGame() {
    resetScore();
    resetTimer();
    hasSecondChance = true; // Reset second chance status for each new game
    isPaused = false;
    updateDisplay();
    gameInterval = setInterval(updateTimer, 1000);
    spawnTarget();
}

function togglePause() {
    if (isPaused) {
        resumeGame();
    } else {
        pauseGame();
    }
}

function pauseGame() {
    isPaused = true;
    clearInterval(gameInterval);
    clearInterval(targetInterval);
    document.getElementById('pause-btn').innerText = 'Resume';
    gameArea.innerHTML = '';
}

function resumeGame() {
    isPaused = false;
    gameInterval = setInterval(updateTimer, 1000);
    spawnTarget();
    document.getElementById('pause-btn').innerText = 'Pause';
}

function restartGame() {
    clearInterval(gameInterval);
    clearInterval(targetInterval);
    score = 0;
    timer = 30;
    level = 1;
    hasSecondChance = true;
    updateDisplay();
    gameArea.innerHTML = '';
    startGame();
}

function updateTimer() {
    if (!isPaused) {
        if (timer > 0) {
            timer--;
            timerElement.innerText = `Time: ${timer}s`;
        } else {
            clearInterval(gameInterval);
            clearInterval(targetInterval);
            if (hasSecondChance) {
                let retry = confirm('Game Over! Your score is ' + score + '. Do you want to try again?');
                if (retry) {
                    // Allow second chance by restarting the current level
                    prepareNextLevel();
                    hasSecondChance = false; // Mark second chance as used
                } else {
                    // Restart the entire game if the player chooses not to retry
                    restartGame();
                }
            } else {
                alert('Game Over! Your score is ' + score + '.');
                restartGame();
            }
        }
    }
}

function checkLevelCompletion() {
    const targetScore = baseTargetScore + (level - 1) * targetScoreIncrement;
    if (score >= targetScore) {
        clearInterval(targetInterval);
        clearInterval(gameInterval);
        alert(`Congratulations! Level ${level} completed.`);
        level++;
        levelElement.innerText = `Level: ${level}`;
        prepareNextLevel();
    }
}

function prepareNextLevel() {
    resetScore();
    resetTimer();
    setTimeout(startGame, 1000);
}

function resetScore() {
    score = 0;
    scoreElement.innerText = `Score: ${score}`;
}

function resetTimer() {
    timer = 30;
    timerElement.innerText = `Time: ${timer}s`;
}

function updateDisplay() {
    scoreElement.innerText = `Score: ${score}`;
    timerElement.innerText = `Time: ${timer}s`;
    levelElement.innerText = `Level: ${level}`;
}

function spawnTarget() {
    if (isPaused) return; // Do not spawn targets if the game is paused

    targetInterval = setInterval(() => {
        if (isPaused) return; // Stop spawning targets if the game is paused
        
        const target = document.createElement('div');
        target.classList.add('target');
        target.textContent = 'Tap'; // Optional text inside the bubble

        // Generate random position without overlap
        let position;
        do {
            position = generateRandomPosition();
        } while (isOverlapping(position));
        
        target.style.top = position.top + 'px';
        target.style.left = position.left + 'px';

        // Add the target to the game area
        gameArea.appendChild(target);

        // Add an event listener to handle the click
        target.addEventListener('click', () => {
            if (!isPaused) { // Only process click if the game is not paused
                score++;
                scoreElement.innerText = `Score: ${score}`;

                // Play the click sound
                clickSound.play();

                target.remove();

                // Check if the current level is completed
                checkLevelCompletion();
            }
        });
        setTimeout(() => {
            if (target.parentNode === gameArea) {
                target.remove();
            }
        }, 2000);

    }, Math.max(1000 / level, 200)); 
}

function generateRandomPosition() {
    const size = 60; // 
    const top = Math.random() * (gameArea.clientHeight - size);
    const left = Math.random() * (gameArea.clientWidth - size);
    return { top, left };
}

function isOverlapping(position) {
    const targets = document.querySelectorAll('.target');
    for (const target of targets) {
        const rect = target.getBoundingClientRect();
        const gameRect = gameArea.getBoundingClientRect();

        // Check for overlap
        if (
            position.top < rect.bottom - gameRect.top &&
            position.top + 60 > rect.top - gameRect.top &&
            position.left < rect.right - gameRect.left &&
            position.left + 60 > rect.left - gameRect.left
        ) {
            return true;
        }
    }
    return false; 
}