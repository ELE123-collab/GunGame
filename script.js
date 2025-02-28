// Game Variables
let health = 100;
let ammo = 30;
const maxAmmo = 30;
let isReloading = false;
let fireMode = "semi"; // Can be "semi" or "auto"

// DOM Elements
const healthDisplay = document.getElementById("health");
const ammoDisplay = document.getElementById("ammo");
const fireModeDisplay = document.getElementById("fire-mode");
const fireBtn = document.getElementById("fire-btn");
const reloadBtn = document.getElementById("reload-btn");
const modeBtn = document.getElementById("mode-btn");

// Update Stats Display
function updateStats() {
  healthDisplay.textContent = health;
  ammoDisplay.textContent = ammo;
  fireModeDisplay.textContent = fireMode === "semi" ? "Semi-Auto" : "Auto";
}

// Fire Gun
function fire() {
  if (isReloading) {
    console.log("Can't fire while reloading!");
    return;
  }
  if (ammo > 0) {
    ammo--;
    console.log("Bang!");
    updateStats();
  } else {
    console.log("Out of ammo!");
    reload();
  }
}

// Reload Gun
function reload() {
  if (ammo === maxAmmo || isReloading) return;
  isReloading = true;
  console.log("Reloading...");
  setTimeout(() => {
    ammo = maxAmmo;
    isReloading = false;
    console.log("Reloaded!");
    updateStats();
  }, 2000); // 2 seconds reload time
}

// Switch Fire Mode
function switchMode() {
  fireMode = fireMode === "semi" ? "auto" : "semi";
  modeBtn.textContent = fireMode === "semi" ? "Switch to Auto" : "Switch to Semi";
  updateStats();
}

// Event Listeners
fireBtn.addEventListener("click", () => {
  if (fireMode === "semi") {
    fire();
  }
});

modeBtn.addEventListener("click", switchMode);

reloadBtn.addEventListener("click", reload);

// Auto Fire (Hold Fire Button)
let autoFireInterval;
fireBtn.addEventListener("mousedown", () => {
  if (fireMode === "auto") {
    autoFireInterval = setInterval(fire, 200); // Fire every 200ms
  }
});

fireBtn.addEventListener("mouseup", () => {
  clearInterval(autoFireInterval);
});

// Initialize
updateStats();