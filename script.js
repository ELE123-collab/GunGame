const gameArea = document.getElementById('game-area');
const player = document.getElementById('player');
const healthBar = document.getElementById('health-bar');
const scoreDisplay = document.getElementById('score');

const GAME_WIDTH = 600; // Match the CSS width
const GAME_HEIGHT = 400; // Match the CSS height

let playerX = GAME_WIDTH / 2 - 15; // Center player horizontally
let playerSpeed = 600; // Faster player speed (pixels per second)
let bullets = [];
let enemies = [];
let health = 100;
let score = 0;
let lastTime = 0;

// Move player left and right
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft' && playerX > 0) {
    playerX -= playerSpeed / 60; // Adjust for smooth movement
  }
  if (event.key === 'ArrowRight' && playerX < GAME_WIDTH - 30) {
    playerX += playerSpeed / 60; // Adjust for smooth movement
  }
  player.style.left = `${playerX}px`;
});

// Shoot shotgun
document.addEventListener('keydown', (event) => {
  if (event.key === ' ') { // Spacebar to shoot
    const spreadAngle = 30; // Spread angle in degrees
    const numPellets = 5; // Number of pellets per shot
    const angleStep = spreadAngle / (numPellets - 1); // Angle between pellets

    for (let i = 0; i < numPellets; i++) {
      const angle = -spreadAngle / 2 + angleStep * i; // Calculate pellet angle
      const bullet = document.createElement('div');
      bullet.classList.add('bullet');
      bullet.style.left = `${playerX + 12}px`; // Position bullet at player's center
      bullet.style.bottom = '40px'; // Position bullet above player
      gameArea.appendChild(bullet);

      // Calculate bullet velocity based on angle
      const radians = (angle * Math.PI) / 180; // Convert angle to radians
      const bulletSpeedX = Math.sin(radians) * 200; // Horizontal speed
      const bulletSpeedY = -Math.cos(radians) * 400; // Vertical speed (upward)

      bullets.push({
        element: bullet,
        speedX: bulletSpeedX,
        speedY: bulletSpeedY,
      });
    }
  }
});

// Main game loop
function gameLoop(timestamp) {
  const deltaTime = (timestamp - lastTime) / 1000; // Convert to seconds
  lastTime = timestamp;

  // Move bullets
  bullets.forEach((bullet, index) => {
    const bulletBottom = parseFloat(bullet.element.style.bottom);
    const bulletLeft = parseFloat(bullet.element.style.left);

    if (bulletBottom > GAME_HEIGHT || bulletLeft < 0 || bulletLeft > GAME_WIDTH) {
      bullet.element.remove(); // Remove bullet if it goes off-screen
      bullets.splice(index, 1);
    } else {
      bullet.element.style.bottom = `${bulletBottom + bullet.speedY * deltaTime}px`; // Move vertically
      bullet.element.style.left = `${bulletLeft + bullet.speedX * deltaTime}px`; // Move horizontally
    }
  });

  // Move enemies
  enemies.forEach((enemy, index) => {
    const enemyTop = parseFloat(enemy.style.top);
    if (enemyTop > GAME_HEIGHT) {
      enemy.remove(); // Remove enemy if it goes off-screen
      enemies.splice(index, 1);
      reduceHealth(10); // Reduce health when an enemy reaches the bottom
    } else {
      enemy.style.top = `${enemyTop + 100 * deltaTime}px`; // Reduced enemy speed (100 pixels per second)
    }

    // Check for collisions between bullets and enemies
    bullets.forEach((bullet, bulletIndex) => {
      const bulletRect = bullet.element.getBoundingClientRect();
      const enemyRect = enemy.getBoundingClientRect();

      if (
        bulletRect.left < enemyRect.right &&
        bulletRect.right > enemyRect.left &&
        bulletRect.top < enemyRect.bottom &&
        bulletRect.bottom > enemyRect.top
      ) {
        // Collision detected
        enemy.remove();
        bullet.element.remove();
        enemies.splice(index, 1);
        bullets.splice(bulletIndex, 1);
        increaseScore(10); // Increase score when an enemy is killed
      }
    });
  });

  requestAnimationFrame(gameLoop);
}

// Create enemies at random intervals
function spawnEnemies() {
  const interval = Math.random() * 1000 + 500; // Random interval between 500ms and 1500ms
  setTimeout(() => {
    const enemy = document.createElement('div');
    enemy.classList.add('enemy');
    enemy.style.left = `${Math.random() * (GAME_WIDTH - 30)}px`;
    enemy.style.top = '0';
    gameArea.appendChild(enemy);
    enemies.push(enemy);
    spawnEnemies(); // Continue spawning enemies
  }, interval);
}

// Reduce health
function reduceHealth(amount) {
  health -= amount;
  healthBar.textContent = `Health: ${health}`;
  if (health <= 0) {
    endGame();
  }
}

// Increase score
function increaseScore(amount) {
  score += amount;
  scoreDisplay.textContent = `Score: ${score}`;
}

// End the game
function endGame() {
  alert(`Game Over! Your score is ${score}.`);
  window.location.reload(); // Reload the page to restart the game
}

// Start the game
spawnEnemies();
requestAnimationFrame(gameLoop);
