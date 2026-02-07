import { canvas, ctx, game } from '../../core/game/GameState.js';

export function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a3e');
    gradient.addColorStop(0.5, '#2a2a5e');
    gradient.addColorStop(1, '#3a3a7e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 50; i++) {
        const x = (i * 73) % canvas.width;
        const y = (i * 37) % (canvas.height - 200);
        ctx.globalAlpha = 0.3 + Math.sin(Date.now() / 1000 + i) * 0.3;
        ctx.beginPath();
        ctx.arc(x, y, (i % 3) + 1, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    for (const p of game.platforms) {
        const platGradient = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.height);
        platGradient.addColorStop(0, '#5a8a5a');
        platGradient.addColorStop(1, '#3a6a3a');
        ctx.fillStyle = platGradient;
        ctx.fillRect(p.x, p.y, p.width, p.height);
        ctx.fillStyle = '#7aba7a';
        ctx.fillRect(p.x, p.y, p.width, 5);
        ctx.fillStyle = '#4a9a4a';
        for (let i = 0; i < p.width; i += 10) {
            ctx.beginPath();
            ctx.moveTo(p.x + i, p.y);
            ctx.lineTo(p.x + i + 5, p.y - 8);
            ctx.lineTo(p.x + i + 10, p.y);
            ctx.fill();
        }
    }
}
