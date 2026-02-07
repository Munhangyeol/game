import { ctx, player } from '../../core/game/GameState.js';
import { JOBS } from '../../../data/jobs.js';

export function drawPlayer() {
    const px = player.x, py = player.y, dir = player.direction;
    const job = JOBS[player.job];

    // 그림자 (점프 높이에 반비례)
    const groundY = 500;
    const jumpHeight = Math.max(0, groundY - (py + player.height));
    const shadowSize = Math.max(15, 30 - jumpHeight / 10);
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(px + player.width/2, groundY, shadowSize, shadowSize/2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 잔상 효과 (헤이스트 버프 시)
    if (player.buffs.haste && player.buffs.haste.duration > 0 && player.trail.length > 0) {
        for (let i = 0; i < player.trail.length; i++) {
            const t = player.trail[i];
            ctx.save();
            ctx.globalAlpha = 0.2 * (i / player.trail.length);
            ctx.fillStyle = job.color;
            ctx.fillRect(t.x + 8, t.y + 20, 24, 30);
            ctx.restore();
        }
    }

    ctx.save();
    if (player.invincible > 0 && Math.floor(player.invincible / 5) % 2 === 0) ctx.globalAlpha = 0.5;

    ctx.translate(px + player.width/2, py);
    ctx.scale(dir, 1);
    ctx.translate(-(px + player.width/2), -py);

    // 버프 이펙트
    if (player.buffs.rage && player.buffs.rage.duration > 0) {
        ctx.fillStyle = 'rgba(255, 100, 50, 0.3)';
        ctx.beginPath();
        ctx.arc(px + player.width/2, py + player.height/2, 40 + Math.sin(Date.now()/100) * 5, 0, Math.PI * 2);
        ctx.fill();
    }
    if (player.buffs.haste && player.buffs.haste.duration > 0) {
        ctx.fillStyle = 'rgba(170, 68, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(px + player.width/2, py + player.height/2, 35, 0, Math.PI * 2);
        ctx.fill();
    }
    if (player.buffs.soul && player.buffs.soul.duration > 0) {
        ctx.fillStyle = 'rgba(68, 255, 102, 0.3)';
        ctx.beginPath();
        ctx.arc(px + player.width/2, py + player.height/2, 35, 0, Math.PI * 2);
        ctx.fill();
    }

    const bodyColor = job ? job.color : '#4488ff';

    // 몸통
    ctx.fillStyle = bodyColor;
    ctx.fillRect(px + 8, py + 20, 24, 30);

    // 머리
    ctx.fillStyle = '#ffcc99';
    ctx.beginPath();
    ctx.arc(px + player.width/2, py + 15, 15, 0, Math.PI * 2);
    ctx.fill();

    // 직업별 헤어/모자
    if (player.job === 'warrior') {
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(px + player.width/2, py + 8, 14, Math.PI, Math.PI * 2);
        ctx.fill();
    } else if (player.job === 'thief') {
        ctx.fillStyle = '#442266';
        ctx.beginPath();
        ctx.moveTo(px + 5, py + 15);
        ctx.lineTo(px + 20, py - 5);
        ctx.lineTo(px + 35, py + 15);
        ctx.fill();
    } else if (player.job === 'archer') {
        ctx.fillStyle = '#228844';
        ctx.beginPath();
        ctx.arc(px + player.width/2, py + 10, 13, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#116633';
        ctx.beginPath();
        ctx.moveTo(px + 10, py + 5);
        ctx.lineTo(px + 20, py - 10);
        ctx.lineTo(px + 30, py + 5);
        ctx.fill();
    }

    // 눈
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(px + player.width/2 + 5, py + 15, 2, 0, Math.PI * 2);
    ctx.fill();

    // 다리
    ctx.fillStyle = '#333';
    ctx.fillRect(px + 10, py + 50, 8, 10);
    ctx.fillRect(px + 22, py + 50, 8, 10);

    // 무기
    if (player.job === 'warrior') {
        ctx.fillStyle = '#888';
        ctx.fillRect(px + 35, py + 25, 8, 35);
        ctx.fillStyle = '#ffcc00';
        ctx.fillRect(px + 33, py + 22, 12, 8);
    } else if (player.job === 'thief') {
        ctx.fillStyle = '#666';
        ctx.beginPath();
        ctx.moveTo(px + 40, py + 30);
        ctx.lineTo(px + 55, py + 25);
        ctx.lineTo(px + 55, py + 35);
        ctx.fill();
    } else if (player.job === 'archer') {
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(px + 35, py + 30, 20, -Math.PI/2, Math.PI/2);
        ctx.stroke();
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px + 35, py + 10);
        ctx.lineTo(px + 35, py + 50);
        ctx.stroke();
    }

    ctx.restore();
}
