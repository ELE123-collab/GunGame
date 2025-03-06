const gameContainer = document.getElementById('game-container');
const player = document.getElementById('player');
const ammoDisplay = document.getElementById('ammo');
const healthDisplay = document.getElementById('health');
const killsDisplay = document.getElementById('kills');
const deathsDisplay = document.getElementById('deaths');
const highScoreDisplay = document.getElementById('high-score');

let ammo = 100;
const maxAmmo = 100; // Maximum ammo capacity
let health = 100;
let kills = 0; // Track number of kills
let deaths = 0; // Track number of deaths
let highScore = 0; // Track high score
let gameOver = false;
let isReloading = false; // Track if the player is currently reloading

// Load saved game state and high score
function loadGame() {
    const savedGame = JSON.parse(localStorage.getItem('savedGame'));
    if (savedGame) {
        ammo = savedGame.ammo;
        health = savedGame.health;
        kills = savedGame.kills;
        deaths = savedGame.deaths;
        updateUI();
    }

    const savedHighScore = localStorage.getItem('highScore');
    if (savedHighScore) {
        highScore = parseInt(savedHighScore);
        highScoreDisplay.textContent = `High Score: ${highScore}`;
    }
}

// Save game state
function saveGame() {
    const gameState = {
        ammo: ammo,
        health: health,
        kills: kills,
        deaths: deaths,
    };
    localStorage.setItem('savedGame', JSON.stringify(gameState));
    alert("Game saved!");
}

// Update high score
function updateHighScore() {
    if (kills > highScore) {
        highScore = kills;
        localStorage.setItem('highScore', highScore);
        highScoreDisplay.textContent = `High Score: ${highScore}`;
    }
}

// Update UI with current game state
function updateUI() {
    ammoDisplay.textContent = `Ammo: ${ammo}`;
    healthDisplay.textContent = `Health: ${health}`;
    killsDisplay.textContent = `Kills: ${kills}`;
    deathsDisplay.textContent = `Deaths: ${deaths}`;
    updateHighScore(); // Check and update high score
}

// Player movement
document.addEventListener('mousemove', (e) => {
    if (!gameOver) {
        player.style.left = `${e.clientX - player.offsetWidth / 2}px`;
    }
});

// Shooting logic
function shoot() {
    if (ammo > 0 && !gameOver && !isReloading) {
        ammo--;
        updateUI();

        const bullet = document.createElement('div');
        bullet.classList.add('bullet');
        bullet.style.left = `${player.offsetLeft + player.offsetWidth / 2 - 5}px`;
        bullet.style.bottom = `${player.offsetHeight}px`;
        gameContainer.appendChild(bullet);

        const bulletInterval = setInterval(() => {
            const bulletBottom = parseInt(bullet.style.bottom);
            if (bulletBottom > window.innerHeight) {
                bullet.remove();
                clearInterval(bulletInterval);
            } else {
                bullet.style.bottom = `${bulletBottom + 10}px`;
            }

            // Check for collision with enemies
            document.querySelectorAll('.enemy').forEach(enemy => {
                if (checkCollision(bullet, enemy)) {
                    enemy.remove();
                    bullet.remove();
                    clearInterval(bulletInterval);
                    kills++; // Increment kills counter
                    updateUI();
                }
            });
        }, 20);
    }
}

// Reload function
function reload() {
    if (!isReloading && ammo < maxAmmo) {
        isReloading = true;
        ammoDisplay.textContent = `Reloading...`;
        setTimeout(() => {
            ammo = maxAmmo;
            updateUI();
            isReloading = false;
        }, 2000); // 2-second reload time
    }
}

// Manual shooting with spacebar or mouse click
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !gameOver) {
        shoot();
    }
    if (e.code === 'KeyR' && !gameOver) { // Reload with 'R' key
        reload();
    }
    if (e.code === 'KeyS' && !gameOver) { // Save game with 'S' key
        saveGame();
    }
});

document.addEventListener('click', () => {
    if (!gameOver) {
        shoot();
    }
});

// Enemy spawning
function spawnEnemy() {
    if (!gameOver) {
        const enemy = document.createElement('div');
        enemy.classList.add('enemy');
        enemy.style.left = `${Math.random() * (window.innerWidth - 40)}px`;
        enemy.style.top = `0px`; // Start at the top of the screen
        gameContainer.appendChild(enemy);

        const enemyInterval = setInterval(() => {
            const enemyTop = parseInt(enemy.style.top);
            if (enemyTop > window.innerHeight) {
                enemy.remove();
                clearInterval(enemyInterval);
            } else {
                enemy.style.top = `${enemyTop + 2}px`; // Move enemy downward

                // Check for collision with player
                if (checkCollision(player, enemy)) {
                    takeDamage(10); // Player takes damage when touched by enemy
                    enemy.remove(); // Remove the enemy after touching the player
                    clearInterval(enemyInterval);
                }
            }
        }, 50);
    }
}

// Player takes damage
function takeDamage(damage) {
    health -= damage;
    updateUI();
    if (health <= 0) {
        respawn();
    }
}

// Respawn player and clear enemies
function respawn() {
    deaths++; // Increment deaths counter
    updateUI();

    // Reset player health and ammo
    health = 100;
    ammo = maxAmmo;
    updateUI();

    // Clear all enemies
    document.querySelectorAll('.enemy').forEach(enemy => enemy.remove());
}

setInterval(spawnEnemy, 1000);

// Collision detection
function checkCollision(element1, element2) {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();

    return !(
        rect1.top > rect2.bottom ||
        rect1.bottom < rect2.top ||
        rect1.left > rect2.right ||
        rect1.right < rect2.left
    );
}

// Load saved game and high score when the page loads
loadGame();
