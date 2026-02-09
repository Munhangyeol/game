import { game, player } from '../../core/game/GameState.js';
import { JOBS } from '../../../data/jobs.js';

let gameOverElement = null;
let isGameOver = false;

export function initGameOverScreen() {
    gameOverElement = document.getElementById('gameOverScreen');
    if (!gameOverElement) {
        gameOverElement = document.createElement('div');
        gameOverElement.id = 'gameOverScreen';
        gameOverElement.className = 'game-over-screen';
        gameOverElement.style.display = 'none';
        document.querySelector('.game-container').appendChild(gameOverElement);
    }
}

export function showGameOver() {
    if (!gameOverElement) initGameOverScreen();
    if (isGameOver) return;

    isGameOver = true;
    game.started = false; // Stop game loop updates

    const job = JOBS[player.job];
    const currentTier = job.tiers[player.tier];

    // 플레이 시간 계산
    const playTimeSec = Math.floor(game.playTime / 60);
    const playTimeMin = Math.floor(playTimeSec / 60);
    const playTimeSec2 = playTimeSec % 60;

    const html = `
        <div class="game-over-content">
            <div class="game-over-skull">💀</div>
            <div class="game-over-title">GAME OVER</div>

            <div class="game-over-divider"></div>

            <div class="game-over-stats">
                <div class="game-over-job">${currentTier.icon} ${currentTier.name}</div>
                <div class="game-over-stat-row">
                    <span>도달 레벨</span>
                    <span class="stat-highlight">Lv.${player.level}</span>
                </div>
                <div class="game-over-stat-row">
                    <span>처치한 몬스터</span>
                    <span class="stat-highlight">${player.kills}마리</span>
                </div>
                <div class="game-over-stat-row">
                    <span>획득 메소</span>
                    <span class="stat-highlight">${game.meso || 0}메소</span>
                </div>
                <div class="game-over-stat-row">
                    <span>플레이 시간</span>
                    <span class="stat-highlight">${playTimeMin}m ${playTimeSec2}s</span>
                </div>
            </div>

            <div class="game-over-divider"></div>

            <div class="game-over-buttons">
                <button class="game-over-btn restart-btn" id="restartBtn">
                    🔄 재시작 (R)
                </button>
                <button class="game-over-btn change-job-btn" id="changeJobBtn">
                    👤 직업 변경 (J)
                </button>
            </div>
        </div>
    `;

    gameOverElement.innerHTML = html;
    gameOverElement.style.display = 'flex';

    // 버튼 이벤트 리스너
    document.getElementById('restartBtn').addEventListener('click', restartGame);
    document.getElementById('changeJobBtn').addEventListener('click', changeJob);

    // 키보드 이벤트
    const keyHandler = (e) => {
        if (e.code === 'KeyR') {
            restartGame();
            document.removeEventListener('keydown', keyHandler);
        } else if (e.code === 'KeyJ') {
            changeJob();
            document.removeEventListener('keydown', keyHandler);
        }
    };
    document.addEventListener('keydown', keyHandler);
}

function restartGame() {
    // 플레이어 상태 초기화 (직업 유지)
    const savedJob = player.job;
    const savedTier = player.tier;

    resetPlayerStats(savedJob, savedTier);
    resetGameState();

    // 게임오버 화면 숨기기
    gameOverElement.style.display = 'none';
    isGameOver = false;

    // 게임 재시작
    game.started = true;

    console.log('🔄 Game restarted with same job');
}

function changeJob() {
    // 완전 초기화
    resetPlayerStats(null, 0);
    resetGameState();

    // 게임오버 화면 숨기기
    gameOverElement.style.display = 'none';
    isGameOver = false;

    // 직업 선택 화면 표시
    document.getElementById('jobSelect').style.display = 'flex';
    document.getElementById('gameUI').style.display = 'none';
    game.started = false;

    console.log('👤 Returning to job selection');
}

function resetPlayerStats(job, tier) {
    if (job) {
        const jobData = JOBS[job];
        const currentTier = jobData.tiers[tier];

        // 직업 유지, 스탯만 초기화
        player.job = job;
        player.tier = tier;
        player.level = 1;
        player.exp = 0;
        player.expToLevel = 100;
        player.kills = 0;

        // 스탯 초기화
        player.maxHp = jobData.baseHp;
        player.hp = player.maxHp;
        player.maxMp = jobData.baseMp;
        player.mp = player.maxMp;
        player.attack = jobData.baseAttack;
        player.critChance = jobData.critChance;
        player.speed = jobData.speed;
        player.jumpPower = jobData.jumpPower;

        // 위치 초기화
        player.x = 100;
        player.y = 400;
        player.vx = 0;
        player.vy = 0;
        player.direction = 1;

        // 쿨다운/버프 초기화
        player.attackCooldown = 0;
        player.skillCooldowns = [0, 0, 0];
        player.buffs = {};
        player.invincible = 0;
        player.trail = [];
    } else {
        // 완전 초기화
        player.job = null;
        player.tier = 0;
        player.level = 1;
        player.exp = 0;
        player.expToLevel = 100;
        player.hp = 200;
        player.maxHp = 200;
        player.mp = 50;
        player.maxMp = 50;
        player.attack = 10;
        player.critChance = 10;
        player.speed = 5;
        player.jumpPower = -14;
        player.kills = 0;
        player.x = 100;
        player.y = 400;
        player.vx = 0;
        player.vy = 0;
        player.direction = 1;
        player.attackCooldown = 0;
        player.skillCooldowns = [0, 0, 0];
        player.buffs = {};
        player.invincible = 0;
        player.trail = [];
    }
}

function resetGameState() {
    // 게임 상태 초기화
    game.monsters = [];
    game.particles = [];
    game.damageTexts = [];
    game.projectiles = [];
    game.effects = [];
    game.coins = [];
    game.skillNames = [];
    game.combo = 0;
    game.lastHitTime = 0;
    game.screenShake = { x: 0, y: 0, frames: 0 };
    game.hitStop = 0;
    game.meso = 0;
    game.playTime = 0;
    game.lastMonsterSpawn = 0;
}

export function isGameOverActive() {
    return isGameOver;
}
