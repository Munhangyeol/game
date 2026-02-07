import { canvas, ctx, game, player } from '../../core/game/GameState.js';

export function drawMinimap() {
    const mapX = canvas.width - 160;
    const mapY = 10;
    const mapW = 150;
    const mapH = 100;
    const scale = 1 / 6.67;

    ctx.save();

    // 배경
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(mapX, mapY, mapW, mapH);
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    ctx.strokeRect(mapX, mapY, mapW, mapH);

    // 플랫폼
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    for (const p of game.platforms) {
        const x = mapX + p.x * scale;
        const y = mapY + p.y * scale;
        const w = p.width * scale;
        const h = p.height * scale;
        ctx.strokeRect(x, y, w, h);
    }

    // 몬스터 (빨간 점)
    ctx.fillStyle = '#ff4444';
    for (const m of game.monsters) {
        if (!m.isDead) {
            ctx.beginPath();
            ctx.arc(mapX + (m.x + m.width/2) * scale, mapY + (m.y + m.height/2) * scale, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // 플레이어 (파란 점)
    ctx.fillStyle = '#4444ff';
    ctx.beginPath();
    ctx.arc(mapX + (player.x + player.width/2) * scale, mapY + (player.y + player.height/2) * scale, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}
