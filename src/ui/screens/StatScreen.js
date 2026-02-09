import { game, player } from '../../core/game/GameState.js';
import { JOBS } from '../../../data/jobs.js';

let statScreenElement = null;
let isStatScreenOpen = false;

export function initStatScreen() {
    statScreenElement = document.getElementById('statScreen');
    if (!statScreenElement) {
        statScreenElement = document.createElement('div');
        statScreenElement.id = 'statScreen';
        statScreenElement.className = 'stat-screen';
        statScreenElement.style.display = 'none';
        document.querySelector('.game-container').appendChild(statScreenElement);
    }

    // 클릭 시 닫기
    statScreenElement.addEventListener('click', (e) => {
        if (e.target === statScreenElement) {
            closeStatScreen();
        }
    });
}

export function toggleStatScreen() {
    if (!statScreenElement) initStatScreen();

    if (isStatScreenOpen) {
        closeStatScreen();
    } else {
        openStatScreen();
    }
}

export function openStatScreen() {
    if (!statScreenElement) initStatScreen();
    if (!game.started) return;

    updateStatScreenContent();
    statScreenElement.style.display = 'flex';
    isStatScreenOpen = true;
}

export function closeStatScreen() {
    if (statScreenElement) {
        statScreenElement.style.display = 'none';
    }
    isStatScreenOpen = false;
}

export function isStatScreenActive() {
    return isStatScreenOpen;
}

function updateStatScreenContent() {
    const job = JOBS[player.job];
    const currentTier = job.tiers[player.tier];
    const jobColor = job.color;

    // 플레이 시간 계산 (초 단위)
    const playTimeSec = Math.floor(game.playTime / 60);
    const playTimeMin = Math.floor(playTimeSec / 60);
    const playTimeSec2 = playTimeSec % 60;

    // 실제 공격력 (버프 포함)
    const actualAttack = Math.floor(player.attack * (player.buffs.rage ? player.buffs.rage.attackBonus : 1) * (player.buffs.holyLight ? player.buffs.holyLight.attackBonus : 1));

    // 실제 이동속도 (버프 포함)
    let actualSpeed = player.speed;
    if (player.buffs.haste) actualSpeed = Math.floor(actualSpeed * player.buffs.haste.speedBonus);
    if (player.buffs.swiftness) actualSpeed = Math.floor(actualSpeed * player.buffs.swiftness.speedBonus);

    const html = `
        <div class="stat-screen-content">
            <div class="stat-screen-header" style="color: ${jobColor}">
                <span class="stat-screen-icon">${currentTier.icon}</span>
                <span class="stat-screen-title">${currentTier.name} Lv.${player.level}</span>
            </div>

            <div class="stat-screen-divider"></div>

            <div class="stat-screen-section">
                <div class="stat-screen-section-title">⚔️ 기본 스탯</div>
                <div class="stat-row">
                    <span class="stat-label">❤️ HP</span>
                    <span class="stat-value">${Math.floor(player.hp)} / ${player.maxHp}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">💧 MP</span>
                    <span class="stat-value">${Math.floor(player.mp)} / ${player.maxMp}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">⚔️ 공격력</span>
                    <span class="stat-value">${actualAttack}${actualAttack !== player.attack ? ' (' + player.attack + ')' : ''}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">💥 크리티컬</span>
                    <span class="stat-value">${player.critChance}%</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">💨 이동속도</span>
                    <span class="stat-value">${actualSpeed}${actualSpeed !== player.speed ? ' (' + player.speed + ')' : ''}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">🦘 점프력</span>
                    <span class="stat-value">${Math.abs(player.jumpPower)}</span>
                </div>
            </div>

            <div class="stat-screen-divider"></div>

            <div class="stat-screen-section">
                <div class="stat-screen-section-title">📊 플레이 통계</div>
                <div class="stat-row">
                    <span class="stat-label">💀 처치</span>
                    <span class="stat-value">${player.kills}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">💰 메소</span>
                    <span class="stat-value">${game.meso || 0}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">📈 경험치</span>
                    <span class="stat-value">${player.exp} / ${player.expToLevel}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">⏱️ 플레이 시간</span>
                    <span class="stat-value">${playTimeMin}m ${playTimeSec2}s</span>
                </div>
            </div>

            <div class="stat-screen-divider"></div>

            <div class="stat-screen-footer">
                <div class="stat-screen-hint">C키 또는 배경 클릭으로 닫기</div>
            </div>
        </div>
    `;

    statScreenElement.innerHTML = html;
}
