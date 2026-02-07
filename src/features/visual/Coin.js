import { ctx, game, player } from '../../core/game/GameState.js';

// 코인(메소) 클래스
export class Coin {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 6;
        this.vy = -Math.random() * 8 - 4;
        this.value = Math.floor(Math.random() * 10) + 5; // 5-14 메소
        this.life = 600; // 10초 후 사라짐
        this.bounces = 0;
        this.collected = false;
        this.collectFrame = 0;
    }

    update() {
        if (this.collected) {
            // 플레이어에게 빨려들어가는 효과
            const dx = player.x + player.width/2 - this.x;
            const dy = player.y + player.height/2 - this.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 10) return true; // 수집 완료

            this.x += dx / dist * 8;
            this.y += dy / dist * 8;
            this.collectFrame++;
            return false;
        }

        this.vy += game.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.98;
        this.life--;

        // 바닥 충돌
        for (const p of game.platforms) {
            if (this.y + 10 > p.y && this.y + 10 < p.y + p.height + 10 &&
                this.x > p.x && this.x < p.x + p.width && this.vy > 0) {
                this.y = p.y - 10;
                this.vy *= -0.5; // 바운스
                this.vx *= 0.8;
                this.bounces++;
                if (this.bounces > 3) {
                    this.vy = 0;
                    this.vx = 0;
                }
            }
        }

        // 플레이어 근처면 자동 수집
        const dx = player.x + player.width/2 - this.x;
        const dy = player.y + player.height/2 - this.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 100) {
            this.collected = true;
            game.meso += this.value;
        }

        return this.life <= 0;
    }

    draw() {
        ctx.save();
        if (this.collected) {
            ctx.globalAlpha = 1 - this.collectFrame / 20;
        } else if (this.life < 120) {
            ctx.globalAlpha = (Math.sin(this.life / 10) + 1) / 2; // 깜빡임
        }

        // 메소 동전
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ff9900';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 메소 기호
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('M', this.x, this.y);

        ctx.restore();
    }
}
