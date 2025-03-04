const gameContainer = document.getElementById('game-container');
const player = document.getElementById('player');
const ammoDisplay = document.getElementById('ammo');
const healthDisplay = document.getElementById('health');
const killsDisplay = document.getElementById('kills');
const deathsDisplay = document.getElementById('deaths');

let ammo = 30;
const maxAmmo = 30; // Maximum ammo capacity
let health = 100;
let kills = 0; // Track number of kills
let deaths = 0; // Track number of deaths
let gameOver = false;
let isReloading = false; // Track if the player is currently reloading

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
        ammoDisplay.textContent = `Ammo: ${ammo}`;

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
                    killsDisplay.textContent = `Kills: ${kills}`;
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
            ammoDisplay.textContent = `Ammo: ${ammo}`;
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
        gameContainer.appendChild(enemy);

        const enemyInterval = setInterval(() => {
            const enemyTop = parseInt(enemy.style.top);
            if (enemyTop > window.innerHeight) {
                enemy.remove();
                clearInterval(enemyInterval);
                takeDamage(10); // Player takes damage when enemy reaches the bottom
            } else {
                enemy.style.top = `${enemyTop + 2}px`;
            }
        }, 50);
    }
}

// Player takes damage
function takeDamage(damage) {
    health -= damage;
    healthDisplay.textContent = `Health: ${health}`;
    deaths++; // Increment deaths counter
    deathsDisplay.textContent = `Deaths: ${deaths}`;
    if (health <= 0) {
        gameOver = true;
        alert("Health depleted! Game Over!");
    }
}

setInterval(spawnEnemy, 1000);

// Collision detection
function checkCollision(bullet, enemy) {
    const bulletRect = bullet.getBoundingClientRect();
    const enemyRect = enemy.getBoundingClientRect();

    return !(
        bulletRect.top > enemyRect.bottom ||
        bulletRect.bottom < enemyRect.top ||
        bulletRect.left > enemyRect.right ||
        bulletRect.right < enemyRect.left
    );
}