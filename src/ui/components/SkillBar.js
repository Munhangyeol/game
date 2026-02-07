import { player } from '../../core/game/GameState.js';
import { JOBS } from '../../../data/jobs.js';

export function createSkillBar() {
    const skillBar = document.getElementById('skillBar');
    const job = JOBS[player.job];
    skillBar.innerHTML = '';

    // 기본 공격 슬롯
    const basicSlot = document.createElement('div');
    basicSlot.className = 'skill-slot ready';
    basicSlot.id = 'basicAttack';
    const basicIcons = { warrior: '⚔', thief: '🗡', archer: '🏹' };
    basicSlot.innerHTML = `<div class="key">A</div><div style="font-size: 20px">${basicIcons[player.job] || '⚔'}</div><div style="font-size: 9px">기본</div>`;

    // Canvas 오버레이 추가
    const basicCanvas = document.createElement('canvas');
    basicCanvas.className = 'cd-overlay';
    basicCanvas.width = 50;
    basicCanvas.height = 50;
    basicSlot.appendChild(basicCanvas);
    skillBar.appendChild(basicSlot);

    job.skills.forEach((skill, i) => {
        const slot = document.createElement('div');
        slot.className = 'skill-slot ready';
        slot.id = `skill${i}`;
        slot.innerHTML = `<div class="key">${skill.key}</div><div style="font-size: 20px">${skill.icon}</div><div style="font-size: 9px">${skill.name.substring(0, 4)}</div>`;

        // Canvas 오버레이 추가
        const canvas = document.createElement('canvas');
        canvas.className = 'cd-overlay';
        canvas.width = 50;
        canvas.height = 50;
        slot.appendChild(canvas);
        skillBar.appendChild(slot);
    });
}

export function updateSkillBar() {
    const job = JOBS[player.job];

    // 기본 공격 쿨다운
    const basicSlot = document.getElementById('basicAttack');
    const basicCanvas = basicSlot.querySelector('canvas.cd-overlay');
    if (player.attackCooldown > 0) {
        basicSlot.className = 'skill-slot';
        drawCooldownArc(basicCanvas, player.attackCooldown, job.basicAttack.cooldown);
    } else {
        basicSlot.className = 'skill-slot ready';
        if (basicCanvas) {
            const ctx = basicCanvas.getContext('2d');
            ctx.clearRect(0, 0, 50, 50);
        }
    }

    job.skills.forEach((skill, i) => {
        const slot = document.getElementById(`skill${i}`);
        const canvas = slot.querySelector('canvas.cd-overlay');
        const cooldown = player.skillCooldowns[i];
        if (cooldown > 0) {
            slot.className = 'skill-slot';
            let cdDiv = slot.querySelector('.cooldown');
            if (!cdDiv) {
                cdDiv = document.createElement('div');
                cdDiv.className = 'cooldown';
                slot.appendChild(cdDiv);
            }
            cdDiv.textContent = Math.ceil(cooldown / 60);

            // 원형 진행바 그리기
            drawCooldownArc(canvas, cooldown, skill.cooldown);
        } else {
            slot.className = 'skill-slot ready';
            const cdDiv = slot.querySelector('.cooldown');
            if (cdDiv) cdDiv.remove();

            // Canvas 클리어
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, 50, 50);
            }
        }
    });
}

// 원형 쿨다운 진행바 그리기 (메이플스타일)
function drawCooldownArc(canvas, currentCd, maxCd) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const centerX = 25, centerY = 25, radius = 23;

    ctx.clearRect(0, 0, 50, 50);

    // 쿨다운 비율 계산 (0 = 완료, 1 = 시작)
    const progress = currentCd / maxCd;

    // 반투명 검은색 오버레이 (원형)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // 진행바 (시계방향, 12시 방향부터)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * progress));
    ctx.stroke();
}

export function updateBuffBar() {
    const buffBar = document.getElementById('buffBar');
    buffBar.innerHTML = '';
    for (const [buffName, buffData] of Object.entries(player.buffs)) {
        if (buffData.duration > 0) {
            const buffIcon = document.createElement('div');
            buffIcon.className = 'buff-icon';
            const seconds = Math.ceil(buffData.duration / 60);

            // 아이콘 + 남은 시간 텍스트
            buffIcon.innerHTML = `
                ${buffData.icon}
                <div class="buff-time ${seconds <= 10 ? 'warning' : ''} ${seconds <= 3 ? 'critical' : ''}">${seconds}s</div>
            `;
            buffIcon.title = buffName;
            buffBar.appendChild(buffIcon);
        }
    }
}
