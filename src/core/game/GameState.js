// Shared state for all modules

export const canvas = document.getElementById('gameCanvas');
if (!canvas) {
    throw new Error('Canvas element #gameCanvas not found. Make sure HTML is loaded before this module.');
}
export const ctx = canvas.getContext('2d');
if (!ctx) {
    throw new Error('Failed to get 2D rendering context from canvas.');
}

// 게임 상태
export const game = {
    started: false,
    gravity: 0.6,
    platforms: [
        { x: 0, y: 500, width: 1000, height: 100 },
        { x: 150, y: 400, width: 150, height: 20 },
        { x: 420, y: 350, width: 160, height: 20 },
        { x: 700, y: 400, width: 150, height: 20 },
        { x: 50, y: 280, width: 120, height: 20 },
        { x: 550, y: 250, width: 120, height: 20 },
        { x: 820, y: 280, width: 120, height: 20 },
    ],
    monsters: [],
    particles: [],
    damageTexts: [],
    projectiles: [],
    effects: [],
    coins: [],
    skillNames: [],
    keys: {},
    lastMonsterSpawn: 0,
    monsterSpawnInterval: 2500,
    combo: 0,
    lastHitTime: 0,
    screenShake: { x: 0, y: 0, frames: 0 },
    hitStop: 0,
    meso: 0,
    effectClass: null, // Will be set in main.js to avoid circular dependencies
};

// 플레이어
export const player = {
    x: 100, y: 400,
    width: 40, height: 60,
    vx: 0, vy: 0,
    speed: 5,
    jumpPower: -14,
    isJumping: false,
    direction: 1,
    isAttacking: false,
    attackCooldown: 0,
    hp: 100, maxHp: 100,
    mp: 50, maxMp: 50,
    exp: 0, expToLevel: 100,
    level: 1,
    attack: 10,
    critChance: 10,
    kills: 0,
    invincible: 0,
    job: null,
    skillCooldowns: [0, 0, 0],
    buffs: {},
    trail: [],
};
