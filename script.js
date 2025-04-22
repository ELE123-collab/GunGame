// Game state
const gameContainer = document.getElementById('game-container');
const player = document.getElementById('player');
const ammoDisplay = document.getElementById('ammo');
const healthDisplay = document.getElementById('health');
const killsDisplay = document.getElementById('kills');
const waveCounter = document.getElementById('wave-counter');
const highScoreDisplay = document.getElementById('high-score');
const currentWeaponDisplay = document.getElementById('current-weapon');
const deathScreen = document.getElementById('death-screen');
const finalWaveDisplay = document.getElementById('final-wave');
const finalKillsDisplay = document.getElementById('final-kills');
const pointsEarnedDisplay = document.getElementById('points-earned');
const respawnBtn = document.getElementById('respawn-btn');
const deathToMenuBtn = document.getElementById('death-to-menu');
const modeSelector = document.getElementById('mode-selector');
const classicModeBtn = document.getElementById('classic-mode');
const zombieModeBtn = document.getElementById('zombie-mode');
const classicDesc = document.getElementById('classic-desc');
const zombieDesc = document.getElementById('zombie-desc');
const backToMenuBtn = document.getElementById('back-to-menu');
const mainMenu = document.getElementById('main-menu');
const playBtn = document.getElementById('play-btn');
const shopBtn = document.getElementById('shop-btn');
const settingsBtn = document.getElementById('settings-btn');
const shopScreen = document.getElementById('shop-screen');
const settingsScreen = document.getElementById('settings-screen');
const backFromShopBtn = document.getElementById('back-from-shop');
const backFromSettingsBtn = document.getElementById('back-from-settings');
const pointsDisplay = document.getElementById('points-display');
const buyButtons = document.querySelectorAll('.buy-btn');
const volumeControl = document.getElementById('volume-control');
const difficultySelect = document.getElementById('difficulty');
const goreToggle = document.getElementById('gore-toggle');
const gunshotSound = document.getElementById('gunshot-sound');
const reloadSound = document.getElementById('reload-sound');
const explosionSound = document.getElementById('explosion-sound');
const menuMusic = document.getElementById('menu-music');
const purchaseSound = document.getElementById('purchase-sound');
const equipSound = document.getElementById('equip-sound');
const firemodeSwitchSound = document.getElementById('firemode-switch-sound');
const fireModeDisplay = document.getElementById('fire-mode-text');
const fireModeBtn = document.getElementById('fire-mode-btn');
const menuBtn = document.getElementById('menu-btn');

// Game variables
let ammo = 30;
let health = 100;
let kills = 0;
let deaths = 0;
let highScore = 0;
let gameOver = false;
let isReloading = false;
let isInvulnerable = false;
let currentMode = 'classic';
let audioEnabled = false;
let projectiles = [];
let playerPoints = 0;
let isFiring = false;
let fireInterval;
let burstCount = 0;
let burstDelay = 100;
let isGamePaused = false;
let classicModeInterval;
let targetX = window.innerWidth / 2; // Mouse tracking

// Zombie mode variables
let zombieWave = 0;
let zombiesInWave = 0;
let zombiesAlive = 0;
let waveComplete = false;
const BASE_ZOMBIES = 12;
const ZOMBIES_INCREMENT = 8;
const INTERMISSION_TIME = 5000;

// Weapons system
const weapons = [
    { 
        name: "Luger P08", 
        type: "pistol",
        fireModes: ["semi"],
        currentFireMode: 0,
        fireRate: 500,
        damage: 20,
        ammoCapacity: 8,
        reloadTime: 1500,
        sound: "sounds/luger.wav",
        owned: true,
        key: "1",
        icon: "⚔️"
    }
];

const armoryWeapons = [
    {
        name: "MP40",
        type: "smg",
        fireModes: ["semi", "auto"],
        currentFireMode: 0,
        fireRate: 300,
        damage: 15,
        ammoCapacity: 32,
        reloadTime: 2000,
        sound: "sounds/mp40.wav",
        price: 200,
        owned: false,
        key: "2",
        icon: "🔫"
    },
    {
        name: "STG44",
        type: "rifle",
        fireModes: ["semi", "burst", "auto"],
        currentFireMode: 0,
        fireRate: 500,
        damage: 25,
        ammoCapacity: 20,
        reloadTime: 2500,
        sound: "sounds/stg44.wav",
        price: 300,
        owned: false,
        key: "3",
        icon: "💥"
    },
    {
        name: "MG42",
        type: "machinegun",
        fireModes: ["auto"],
        currentFireMode: 0,
        fireRate: 100,
        damage: 10,
        ammoCapacity: 50,
        reloadTime: 3500,
        sound: "sounds/mg42.wav",
        price: 400,
        owned: false,
        key: "4",
        icon: "🔥"
    }
];

let currentWeapon = weapons[0];

// Initialize game
function initGame() {
    // Load saved progress
    const savedHighScore = localStorage.getItem('highScore');
    const savedPoints = localStorage.getItem('playerPoints');
    
    if (savedHighScore) {
        highScore = parseInt(savedHighScore);
        highScoreDisplay.textContent = `HIGH SCORE: ${highScore}`;
    }
    
    if (savedPoints) {
        playerPoints = parseInt(savedPoints);
    }
    
    // Load owned weapons
    armoryWeapons.forEach(weapon => {
        if (localStorage.getItem(`weapon_${weapon.name.toLowerCase()}`) === 'owned') {
            weapon.owned = true;
            weapons.push(weapon);
        }
    });
    
    // Set initial weapon
    currentWeapon = weapons[0];
    ammo = currentWeapon.ammoCapacity;
    
    // Setup controls
    setupEventListeners();
    initFireModeSystem();
    
    // Show main menu
    showMainMenu();
    
    // Audio initialization
    document.addEventListener('click', unlockAudio, { once: true });
}

function unlockAudio() {
    gunshotSound.volume = 0.5;
    gunshotSound.play()
        .then(() => {
            gunshotSound.pause();
            gunshotSound.currentTime = 0;
            audioEnabled = true;
        })
        .catch(e => console.log("Audio unlock failed:", e));
}

// Menu navigation
function showMainMenu() {
    mainMenu.style.display = 'flex';
    modeSelector.style.display = 'none';
    gameContainer.style.display = 'none';
    shopScreen.style.display = 'none';
    settingsScreen.style.display = 'none';
    deathScreen.style.display = 'none';
    
    // Play menu music
    menuMusic.volume = 0.3;
    menuMusic.play().catch(e => console.log("Menu music error:", e));
}

function showModeSelector() {
    mainMenu.style.display = 'none';
    modeSelector.style.display = 'flex';
    menuMusic.pause();
}

function showShop() {
    mainMenu.style.display = 'none';
    shopScreen.style.display = 'flex';
    pointsDisplay.textContent = playerPoints;
    updateShopDisplay();
}

function showSettings() {
    mainMenu.style.display = 'none';
    settingsScreen.style.display = 'flex';
}

// Mode selection
classicModeBtn.addEventListener('click', () => {
    currentMode = 'classic';
    startGame();
});

zombieModeBtn.addEventListener('click', () => {
    currentMode = 'zombie';
    startGame();
});

// Show mode descriptions
classicModeBtn.addEventListener('mouseover', () => {
    classicDesc.style.display = 'block';
    zombieDesc.style.display = 'none';
});

zombieModeBtn.addEventListener('mouseover', () => {
    zombieDesc.style.display = 'block';
    classicDesc.style.display = 'none';
});

// Start the game
function startGame() {
    modeSelector.style.display = 'none';
    gameContainer.style.display = 'block';
    deathScreen.style.display = 'none';
    
    // Reset game state
    ammo = currentWeapon.ammoCapacity;
    health = 100;
    kills = 0;
    gameOver = false;
    isReloading = false;
    isInvulnerable = false;
    targetX = window.innerWidth / 2; // Reset mouse position
    
    // Clear existing game elements
    document.querySelectorAll('.enemy, .bullet, .explosion, .power-up, .zombie-projectile').forEach(el => el.remove());
    projectiles = [];
    
    // Reset player position
    player.style.left = '50%';
    player.style.transform = 'translateX(-50%)';
    
    if (currentMode === 'zombie') {
        waveCounter.style.display = 'block';
        zombieWave = 1;
        zombiesInWave = BASE_ZOMBIES;
        startZombieWave();
    } else {
        // Classic mode - spawn enemies with cleanup
        if (classicModeInterval) clearInterval(classicModeInterval);
        classicModeInterval = setInterval(spawnEnemy, 1000);
    }
    
    updateUI();
}

// Zombie mode functions
function startZombieWave() {
    waveComplete = false;
    zombiesAlive = zombiesInWave;
    updateWaveCounter();
    
    // Clear existing zombies
    document.querySelectorAll('.enemy.zombie').forEach(z => z.remove());
    
    // Spawn zombies with staggered timing
    for (let i = 0; i < zombiesInWave; i++) {
        setTimeout(() => {
            if (!gameOver) spawnZombie();
        }, i * 500);
    }
    
    // Check wave completion
    const waveCheck = setInterval(() => {
        if (zombiesAlive <= 0 && !waveComplete) {
            waveComplete = true;
            clearInterval(waveCheck);
            startIntermission();
        }
    }, 500);
}

function spawnZombie() {
    const zombie = document.createElement('div');
    zombie.className = 'enemy zombie';
    zombie.style.left = `${Math.random() * (window.innerWidth - 40)}px`;
    zombie.style.top = `0px`;
    gameContainer.appendChild(zombie);

    let health = Math.max(1, Math.floor(zombieWave / 3));
    const speed = 0.5 + (zombieWave * 0.05);
    const damage = 10 + (zombieWave * 0.5);
    
    // Throwing variables
    let canThrow = Math.random() > 0.7;
    let throwCooldown = 0;

    const zombieInterval = setInterval(() => {
        if (gameOver || isGamePaused) {
            clearInterval(zombieInterval);
            return;
        }

        const zombieRect = zombie.getBoundingClientRect();
        const zombieTop = zombieRect.top;
        const zombieLeft = zombieRect.left;

        // Movement
        zombie.style.top = `${zombieTop + speed}px`;

        // Remove if off-screen
        if (zombieTop > window.innerHeight) {
            zombie.remove();
            clearInterval(zombieInterval);
            zombiesAlive--;
            takeDamage(damage);
            return;
        }

        // Collision with player
        if (checkCollision(player, zombie)) {
            takeDamage(damage);
            zombie.remove();
            clearInterval(zombieInterval);
            zombiesAlive--;
            return;
        }

        // Throwing logic
        if (canThrow && zombieTop < window.innerHeight - 100 && zombieTop > 0) {
            throwCooldown--;
            if (throwCooldown <= 0) {
                throwProjectile(zombie);
                throwCooldown = 100 + Math.random() * 100;
            }
        }

    }, 50);

    zombie.addEventListener('click', (e) => {
        e.stopPropagation();
        health--;
        if (health <= 0) {
            zombie.remove();
            clearInterval(zombieInterval);
            createExplosion(zombie.offsetLeft, zombie.offsetTop);
            kills++;
            zombiesAlive--;
            updateUI();
        }
    });
}

function throwProjectile(zombie) {
    const projectileTypes = [
        { name: "bone", damage: 10, speed: 5, color: "#f5f5dc", size: 15 },
        { name: "rock", damage: 15, speed: 7, color: "#777", size: 20 },
        { name: "grenade", damage: 25, speed: 4, color: "#8B0000", size: 18, explosive: true }
    ];
    
    const projectileType = projectileTypes[Math.floor(Math.random() * projectileTypes.length)];
    const projectile = document.createElement('div');
    projectile.className = 'zombie-projectile';
    
    // Get zombie and player positions
    const zombieRect = zombie.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();
    
    // Calculate direction to player
    const dx = playerRect.left - zombieRect.left;
    const dy = playerRect.top - zombieRect.top;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const direction = {
        x: dx / distance,
        y: dy / distance
    };
    
    // Set projectile position and style
    projectile.style.left = `${zombieRect.left + zombieRect.width/2 - projectileType.size/2}px`;
    projectile.style.top = `${zombieRect.top + zombieRect.height/2 - projectileType.size/2}px`;
    projectile.style.width = `${projectileType.size}px`;
    projectile.style.height = `${projectileType.size}px`;
    projectile.style.backgroundColor = projectileType.color;
    projectile.dataset.damage = projectileType.damage;
    projectile.dataset.explosive = projectileType.explosive || false;
    
    gameContainer.appendChild(projectile);
    projectiles.push(projectile);
    
    // Projectile movement
    const projectileSpeed = projectileType.speed;
    const updateProjectile = () => {
        if (gameOver || isGamePaused) return;
        
        const currentLeft = parseFloat(projectile.style.left);
        const currentTop = parseFloat(projectile.style.top);
        
        // Update position
        projectile.style.left = `${currentLeft + direction.x * projectileSpeed}px`;
        projectile.style.top = `${currentTop + direction.y * projectileSpeed}px`;
        
        // Check collision with player
        if (checkCollision(player, projectile)) {
            takeDamage(parseInt(projectile.dataset.damage));
            if (projectile.dataset.explosive === "true") {
                createExplosion(currentLeft, currentTop);
            }
            projectile.remove();
            projectiles = projectiles.filter(p => p !== projectile);
            return;
        }
        
        // Remove if off-screen
        if (currentTop < 0 || currentTop > window.innerHeight || 
            currentLeft < 0 || currentLeft > window.innerWidth) {
            projectile.remove();
            projectiles = projectiles.filter(p => p !== projectile);
            return;
        }
        
        requestAnimationFrame(updateProjectile);
    };
    
    requestAnimationFrame(updateProjectile);
}

function startIntermission() {
    const waveMsg = document.createElement('div');
    waveMsg.className = 'wave-message';
    waveMsg.textContent = `WAVE ${zombieWave} CLEARED!\nPREPARE FOR WAVE ${zombieWave + 1}`;
    gameContainer.appendChild(waveMsg);
    
    // Spawn power-up every 3 waves
    if (zombieWave % 3 === 0) {
        setTimeout(spawnPowerUp, 1000);
    }
    
    // Start next wave after intermission
    setTimeout(() => {
        waveMsg.remove();
        zombieWave++;
        zombiesInWave = BASE_ZOMBIES + (zombieWave - 1) * ZOMBIES_INCREMENT;
        startZombieWave();
    }, INTERMISSION_TIME);
}

// Power-ups
function spawnPowerUp() {
    const powerUp = document.createElement('div');
    powerUp.className = 'power-up';
    powerUp.style.left = `${Math.random() * (window.innerWidth - 30)}px`;
    powerUp.style.top = `${Math.random() * (window.innerHeight - 30)}px`;
    
    const types = ['ammo', 'health', 'weapon'];
    const type = types[Math.floor(Math.random() * types.length)];
    powerUp.dataset.type = type;
    
    if (type === 'weapon') {
        powerUp.textContent = "↑";
        powerUp.style.fontSize = "20px";
        powerUp.style.textAlign = "center";
        powerUp.style.lineHeight = "30px";
    }
    
    gameContainer.appendChild(powerUp);
    
    const powerUpCheck = setInterval(() => {
        if (checkCollision(player, powerUp)) {
            clearInterval(powerUpCheck);
            collectPowerUp(powerUp, type);
        }
    }, 100);
}

function collectPowerUp(powerUp, type) {
    powerUp.remove();
    let message = "";
    
    switch(type) {
        case 'ammo':
            ammo = Math.min(ammo + currentWeapon.ammoCapacity, currentWeapon.ammoCapacity * 2);
            message = "AMMO CRATE!";
            break;
        case 'health':
            health = Math.min(health + 30, 150);
            message = "MEDKIT!";
            break;
        case 'weapon':
            const randomWeapon = weapons[Math.floor(Math.random() * weapons.length)];
            switchWeapon(weapons.indexOf(randomWeapon));
            message = `${randomWeapon.name} ACQUIRED!`;
            break;
    }
    
    showPowerUpMessage(message);
    updateUI();
}

function showPowerUpMessage(text) {
    const msg = document.createElement('div');
    msg.className = 'wave-message';
    msg.style.fontSize = '18px';
    msg.style.padding = '10px 20px';
    msg.textContent = text;
    gameContainer.appendChild(msg);
    
    setTimeout(() => {
        msg.remove();
    }, 1500);
}

// Enemy spawning for classic mode
function spawnEnemy() {
    if (!gameOver && !isGamePaused) {
        const enemy = document.createElement('div');
        enemy.className = 'enemy';
        enemy.style.left = `${Math.random() * (window.innerWidth - 40)}px`;
        enemy.style.top = `0px`;
        gameContainer.appendChild(enemy);

        const speed = 1.5;
        const damage = 10;

        const enemyInterval = setInterval(() => {
            if (gameOver || isGamePaused) {
                clearInterval(enemyInterval);
                return;
            }

            const enemyTop = parseInt(enemy.style.top);
            if (enemyTop > window.innerHeight) {
                enemy.remove();
                clearInterval(enemyInterval);
                takeDamage(damage);
            } else {
                enemy.style.top = `${enemyTop + speed}px`;
            }

            if (checkCollision(player, enemy)) {
                takeDamage(damage);
                enemy.remove();
                clearInterval(enemyInterval);
            }
        }, 50);
    }
}

// Fire mode system
function initFireModeSystem() {
    updateFireModeDisplay();
    fireModeBtn.addEventListener('click', toggleFireMode);
    
    // Mouse controls
    document.addEventListener('mousedown', startShooting);
    document.addEventListener('mouseup', stopShooting);
    
    // Touch controls for mobile
    document.addEventListener('touchstart', startShooting);
    document.addEventListener('touchend', stopShooting);
}

function toggleFireMode() {
    if (currentWeapon.fireModes.length <= 1) return;
    
    // Cycle fire mode with wrap-around
    currentWeapon.currentFireMode = 
        (currentWeapon.currentFireMode + 1) % currentWeapon.fireModes.length;
    
    // Play switch sound
    playSound("sounds/firemode_switch.wav", 0.3);
    
    // Update UI
    updateFireModeDisplay();
    
    // Visual feedback
    const fireModeUI = document.getElementById('fire-mode-display');
    fireModeUI.classList.add('mode-switch-active');
    setTimeout(() => {
        fireModeUI.classList.remove('mode-switch-active');
    }, 200);
}

function updateFireModeDisplay() {
    const mode = currentWeapon.fireModes[currentWeapon.currentFireMode];
    fireModeDisplay.textContent = mode.toUpperCase();
    
    // Update icon
    const icon = document.querySelector('.fire-mode-icon');
    switch(mode) {
        case 'semi':
            icon.textContent = '○';
            icon.style.color = '#ffd700';
            break;
        case 'burst':
            icon.textContent = '●●●';
            icon.style.color = '#ff5555';
            break;
        case 'auto':
            icon.textContent = '⇶';
            icon.style.color = '#ff5555';
            break;
    }
    
    // Hide for single-mode weapons
    document.getElementById('fire-mode-display').style.display = 
        currentWeapon.fireModes.length > 1 ? 'flex' : 'none';
}

// Shooting mechanics
function startShooting() {
    if (ammo <= 0 || isReloading || gameOver || isGamePaused) return;
    
    const mode = currentWeapon.fireModes[currentWeapon.currentFireMode];
    
    switch(mode) {
        case "semi":
            fireShot();
            break;
            
        case "burst":
            if (burstCount === 0) {
                burstCount = 3;
                fireBurst();
            }
            break;
            
        case "auto":
            if (!isFiring) {
                isFiring = true;
                fireAuto();
            }
            break;
    }
}

function stopShooting() {
    isFiring = false;
    clearInterval(fireInterval);
}

function fireShot() {
    if (ammo <= 0 || isReloading || gameOver || isGamePaused) return;
    
    ammo--;
    updateUI();

    // Play weapon sound
    gunshotSound.src = currentWeapon.sound;
    gunshotSound.currentTime = 0;
    gunshotSound.volume = 0.5;
    gunshotSound.play().catch(e => console.log("Sound error:", e));

    // Create bullet
    const bullet = document.createElement('div');
    bullet.className = 'bullet';
    bullet.style.left = `${player.offsetLeft + player.offsetWidth / 2 - 4}px`;
    bullet.style.bottom = `${player.offsetHeight + 100}px`;
    gameContainer.appendChild(bullet);

    const bulletInterval = setInterval(() => {
        const bulletBottom = parseInt(bullet.style.bottom);
        if (bulletBottom > window.innerHeight) {
            bullet.remove();
            clearInterval(bulletInterval);
        } else {
            bullet.style.bottom = `${bulletBottom + 15}px`;
        }

        document.querySelectorAll('.enemy').forEach(enemy => {
            if (checkCollision(bullet, enemy)) {
                explosionSound.currentTime = 0;
                explosionSound.volume = 0.5;
                explosionSound.play();
                
                createExplosion(
                    enemy.offsetLeft + enemy.offsetWidth/2,
                    enemy.offsetTop + enemy.offsetHeight/2
                );
                enemy.remove();
                bullet.remove();
                clearInterval(bulletInterval);
                kills++;
                updateUI();
                
                if (currentMode === 'zombie') {
                    zombiesAlive--;
                    updateWaveCounter();
                }
            }
        });
    }, 20);
    
    // Visual feedback
    const icon = document.querySelector('.fire-mode-icon');
    icon.classList.add('shot-fired');
    setTimeout(() => icon.classList.remove('shot-fired'), 100);
}

function fireAuto() {
    if (!isFiring) return;
    
    fireShot();
    
    if (isFiring && ammo > 0 && !isReloading && !gameOver && !isGamePaused) {
        fireInterval = setTimeout(() => {
            fireAuto();
        }, currentWeapon.fireRate);
    }
}

function fireBurst() {
    if (burstCount <= 0 || ammo <= 0 || isReloading || gameOver || isGamePaused) {
        burstCount = 0;
        return;
    }
    
    fireShot();
    burstCount--;
    
    if (burstCount > 0) {
        setTimeout(() => {
            fireBurst();
        }, burstDelay);
    }
}

function createExplosion(x, y) {
    const explosion = document.createElement('div');
    explosion.className = 'explosion';
    explosion.style.left = `${x - 30}px`;
    explosion.style.top = `${y - 30}px`;
    gameContainer.appendChild(explosion);
    
    setTimeout(() => {
        explosion.remove();
    }, 500);
}

// Reloading
function reload() {
    if (!isReloading && ammo < currentWeapon.ammoCapacity) {
        isReloading = true;
        player.classList.add('reloading');
        ammoDisplay.textContent = `RELOADING...`;
        
        reloadSound.currentTime = 0;
        reloadSound.volume = 0.5;
        reloadSound.play().catch(e => console.log("Reload sound error:", e));
        
        setTimeout(() => {
            ammo = currentWeapon.ammoCapacity;
            updateUI();
            isReloading = false;
            player.classList.remove('reloading');
        }, currentWeapon.reloadTime);
    }
}

// Damage system
function takeDamage(damage) {
    if (!isInvulnerable && !isGamePaused) {
        health -= damage;
        updateUI();
        
        // Visual feedback
        player.classList.add('hit');
        setTimeout(() => {
            player.classList.remove('hit');
        }, 200);
        
        if (health <= 0) {
            health = 0;
            updateUI();
            respawn();
        }
    }
}

// Dodge mechanic
function dodge() {
    if (isReloading || isGamePaused) return;
    
    player.classList.add('dodging');
    
    // Make player temporarily invulnerable
    isInvulnerable = true;
    
    setTimeout(() => {
        player.classList.remove('dodging');
        isInvulnerable = false;
    }, 300);
}

// Weapon switching
function switchWeapon(weaponIndex) {
    // Prevent switching during critical actions
    if (isReloading || isFiring || gameOver || isGamePaused) {
        playSound("sounds/error.wav", 0.2);
        return;
    }

    const availableWeapons = weapons.filter(w => w.owned);
    const newWeapon = availableWeapons[weaponIndex];
    
    // Validate weapon exists and is owned
    if (!newWeapon || newWeapon.name === currentWeapon.name) {
        playSound("sounds/click.wav", 0.2);
        return;
    }

    // Switch weapon
    currentWeapon = newWeapon;
    ammo = currentWeapon.ammoCapacity;
    
    // Update UI elements
    updateUI();
    updateFireModeDisplay();
    
    // Visual and audio feedback
    player.classList.add('weapon-switch');
    playSound("sounds/weapon_switch.wav", 0.4);
    
    setTimeout(() => {
        player.classList.remove('weapon-switch');
    }, 300);
    
    // Special handling for machine guns
    if (currentWeapon.type === "machinegun") {
        playSound("sounds/mg_cock.wav", 0.3);
    }
}

// Shop functionality
function updateShopDisplay() {
    document.querySelectorAll('.shop-item').forEach(item => {
        const weaponKey = item.dataset.weapon;
        const weapon = armoryWeapons.find(w => w.name.toLowerCase().includes(weaponKey));
        const buyBtn = item.querySelector('.buy-btn');
        
        if (weapon.owned) {
            item.classList.add('owned');
            buyBtn.classList.add('owned');
        } else {
            item.classList.remove('owned');
            buyBtn.classList.remove('owned');
            buyBtn.textContent = `${weapon.price} POINTS`;
        }
    });
}

buyButtons.forEach(button => {
    button.addEventListener('click', function() {
        const item = this.dataset.item;
        const weapon = armoryWeapons.find(w => 
            w.name.toLowerCase() === item || 
            w.name.toLowerCase().includes(item)
        );
        
        if (!weapon) return;
        
        if (weapon.owned) {
            showAlert("You already own this weapon!");
            return;
        }
        
        if (playerPoints < weapon.price) {
            showAlert("Not enough points!");
            return;
        }
        
        // Successful purchase
        playerPoints -= weapon.price;
        weapon.owned = true;
        weapons.push(weapon);
        
        // Update UI
        pointsDisplay.textContent = playerPoints;
        this.innerHTML = `<span class="checkmark">✓</span> PURCHASED`;
        this.disabled = true;
        this.classList.add('owned');
        
        // Save progress
        localStorage.setItem('playerPoints', playerPoints);
        localStorage.setItem(`weapon_${weapon.name.toLowerCase()}`, 'owned');
        
        // Play purchase sound
        playSound("sounds/purchase.wav", 0.5);
        
        // Update weapon availability
        updateWeaponSelectors();
    });
});

function updateWeaponSelectors() {
    // This would update any UI elements showing available weapons
}

function showAlert(message) {
    const alert = document.createElement('div');
    alert.className = 'game-alert';
    alert.textContent = message;
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.classList.add('fade-out');
        setTimeout(() => alert.remove(), 500);
    }, 1500);
}

// Respawn logic
function respawn() {
    // Calculate points earned
    const pointsEarned = kills * 10 + zombieWave * 5;
    playerPoints += pointsEarned;
    pointsEarnedDisplay.textContent = pointsEarned;
    
    // Save points to localStorage
    localStorage.setItem('playerPoints', playerPoints);
    
    // Show death screen
    finalWaveDisplay.textContent = zombieWave;
    finalKillsDisplay.textContent = kills;
    deathScreen.style.display = 'flex';
    gameOver = true;
    
    // Clear all enemies and projectiles
    document.querySelectorAll('.enemy, .power-up, .zombie-projectile').forEach(el => el.remove());
    projectiles = [];
    
    // Setup respawn button
    respawnBtn.onclick = () => {
        deathScreen.style.display = 'none';
        gameOver = false;
        
        // Reset game state
        health = 100;
        ammo = currentWeapon.ammoCapacity;
        kills = 0;
        zombieWave = 1;
        zombiesInWave = BASE_ZOMBIES;
        zombiesAlive = 0;
        
        updateUI();
        
        if (currentMode === 'zombie') {
            startZombieWave();
        }
    };
}

// UI updates
function updateUI() {
    if (isReloading) {
        ammoDisplay.textContent = `RELOADING...`;
    } else {
        ammoDisplay.textContent = `${currentWeapon.name}: ${ammo}/${currentWeapon.ammoCapacity}`;
    }
    
    currentWeaponDisplay.innerHTML = `${currentWeapon.icon} ${currentWeapon.name}`;
    healthDisplay.textContent = `HEALTH: ${health}`;
    killsDisplay.textContent = `KILLS: ${kills}`;
    
    if (kills > highScore) {
        highScore = kills;
        localStorage.setItem('highScore', highScore);
        highScoreDisplay.textContent = `HIGH SCORE: ${highScore}`;
    }
    
    if (currentMode === 'zombie') {
        updateWaveCounter();
    }
}

function updateWaveCounter() {
    waveCounter.textContent = `WAVE: ${zombieWave} | ENEMIES: ${zombiesAlive}`;
    
    if (zombiesAlive <= 3 && zombiesAlive > 0) {
        waveCounter.style.animation = 'pulse 0.5s infinite';
        waveCounter.style.color = '#ff0';
    } else {
        waveCounter.style.animation = '';
        waveCounter.style.color = '#fff';
    }
}

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

// Mouse movement controls
function setupEventListeners() {
    // Mouse movement
    gameContainer.addEventListener('mousemove', (e) => {
        if (isGamePaused || gameOver) return;
        targetX = e.clientX;
        clampTargetPosition();
    });

    // Touch movement
    gameContainer.addEventListener('touchmove', (e) => {
        if (isGamePaused || gameOver) return;
        e.preventDefault();
        if (e.touches.length > 0) {
            targetX = e.touches[0].clientX;
            clampTargetPosition();
        }
    }, { passive: false });

    // Existing event listeners...
    playBtn.addEventListener('click', showModeSelector);
    shopBtn.addEventListener('click', showShop);
    settingsBtn.addEventListener('click', showSettings);
    backToMenuBtn.addEventListener('click', showMainMenu);
    backFromShopBtn.addEventListener('click', showMainMenu);
    backFromSettingsBtn.addEventListener('click', showMainMenu);
    deathToMenuBtn.addEventListener('click', showMainMenu);
    menuBtn.addEventListener('click', togglePauseMenu);

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (gameOver || isGamePaused) return;
        
        if (e.key === 'ArrowLeft') {
            targetX = Math.max(0, targetX - 20);
        }
        else if (e.key === 'ArrowRight') {
            targetX = Math.min(window.innerWidth, targetX + 20);
        }
        else if (e.key === ' ' || e.key === 'Spacebar') {
            startShooting();
        }
        else if (e.key.toLowerCase() === 'r') {
            reload();
        }
        else if (e.key === 'Shift') {
            dodge();
        }
        else if (e.key === '1') {
            switchWeapon(0); // Luger
        }
        else if (e.key === '2') {
            switchWeapon(1); // MP40
        }
        else if (e.key === '3') {
            switchWeapon(2); // STG44
        }
        else if (e.key === '4') {
            switchWeapon(3); // MG42
        }
        else if (e.key.toLowerCase() === 'v') {
            toggleFireMode();
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.key === ' ' || e.key === 'Spacebar') {
            stopShooting();
        }
    });
}

function clampTargetPosition() {
    const playerWidth = player.offsetWidth;
    targetX = Math.max(playerWidth/2, Math.min(targetX, window.innerWidth - playerWidth/2));
}

// Game loop with mouse movement
function gameLoop() {
    if (!isGamePaused && !gameOver) {
        // Smooth player movement toward mouse
        const currentX = parseInt(player.style.left || window.innerWidth / 2);
        const newX = currentX + (targetX - currentX) * 0.2; // Adjust 0.2 for speed
        player.style.left = `${newX}px`;
        
        // Toggle moving animation
        player.classList.toggle('moving', Math.abs(targetX - currentX) > 5);
    }
    requestAnimationFrame(gameLoop);
}

// Settings functionality
volumeControl.addEventListener('input', function() {
    const volume = parseFloat(this.value);
    gunshotSound.volume = volume;
    reloadSound.volume = volume;
    explosionSound.volume = volume;
    menuMusic.volume = volume * 0.6;
});

// Pause menu
function togglePauseMenu() {
    isGamePaused = !isGamePaused;
    
    if (isGamePaused) {
        // Create pause overlay
        const pauseOverlay = document.createElement('div');
        pauseOverlay.id = 'pause-overlay';
        pauseOverlay.innerHTML = `
            <div class="pause-menu">
                <h2>GAME PAUSED</h2>
                <button id="resume-btn">RESUME</button>
                <button id="quit-btn">QUIT TO MENU</button>
            </div>
        `;
        gameContainer.appendChild(pauseOverlay);
        
        // Style the pause menu
        const style = document.createElement('style');
        style.textContent = `
            #pause-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 999;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .pause-menu {
                background: rgba(0, 0, 0, 0.9);
                border: 3px solid #d4af37;
                padding: 30px;
                text-align: center;
                border-radius: 10px;
            }
            .pause-menu h2 {
                color: #ff0;
                margin-bottom: 30px;
                font-size: 2.5rem;
            }
            .pause-menu button {
                background: linear-gradient(to bottom, #654321, #3a2511);
                border: 2px solid #d4af37;
                color: #ffd700;
                padding: 12px 25px;
                margin: 10px;
                font-size: 1.2rem;
                cursor: pointer;
                border-radius: 5px;
                transition: all 0.3s;
            }
            .pause-menu button:hover {
                transform: scale(1.05);
                box-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
            }
        `;
        document.head.appendChild(style);
        
        // Button functionality
        document.getElementById('resume-btn').addEventListener('click', togglePauseMenu);
        document.getElementById('quit-btn').addEventListener('click', () => {
            if (classicModeInterval) clearInterval(classicModeInterval);
            showMainMenu();
        });
        
        // Pause audio
        gunshotSound.pause();
        reloadSound.pause();
        explosionSound.pause();
        menuMusic.pause();
    } else {
        // Remove pause elements
        const overlay = document.getElementById('pause-overlay');
        if (overlay) overlay.remove();
        
        // Resume audio
        if (audioEnabled && !gameOver) {
            gunshotSound.play().catch(e => console.log("Audio error:", e));
        }
    }
}

// Helper functions
function playSound(src, volume = 1) {
    if (!audioEnabled) return;
    
    const sound = new Audio(src);
    sound.volume = volume;
    sound.play().catch(e => console.log("Audio error:", e));
}

// Initialize game
function initGame() {
    // Load saved progress
    const savedHighScore = localStorage.getItem('highScore');
    const savedPoints = localStorage.getItem('playerPoints');
    
    if (savedHighScore) {
        highScore = parseInt(savedHighScore);
        highScoreDisplay.textContent = `HIGH SCORE: ${highScore}`;
    }
    
    if (savedPoints) {
        playerPoints = parseInt(savedPoints);
    }
    
    // Load owned weapons
    armoryWeapons.forEach(weapon => {
        if (localStorage.getItem(`weapon_${weapon.name.toLowerCase()}`) === 'owned') {
            weapon.owned = true;
            weapons.push(weapon);
        }
    });
    
    // Set initial weapon
    currentWeapon = weapons[0];
    ammo = currentWeapon.ammoCapacity;
    
    // Setup controls
    setupEventListeners();
    initFireModeSystem();
    
    // Start game loop
    requestAnimationFrame(gameLoop);
    
    // Show main menu
    showMainMenu();
    
    // Audio initialization
    document.addEventListener('click', unlockAudio, { once: true });
}

initGame();
