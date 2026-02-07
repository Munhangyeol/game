import { canvas, ctx, game, player } from '../../core/game/GameState.js';

// 투사체 클래스
export class Projectile {
    constructor(x, y, direction, damage, type = 'arrow', piercing = false, vy = 0) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.speed = 14;
        this.damage = damage;
        this.type = type;
        this.piercing = piercing;
        this.hitMonsters = new Set();
        this.life = 100;
        this.trail = [];
        this.vy = vy;
    }

    update() {
        // 궤적 저장
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 10) this.trail.shift();

        this.x += this.speed * this.direction;
        this.y += this.vy;
        this.life--;

        if (this.x < -50 || this.x > canvas.width + 50) return true;

        for (const monster of game.monsters) {
            if (!monster.isDead && !this.hitMonsters.has(monster) &&
                this.x > monster.x && this.x < monster.x + monster.width &&
                this.y > monster.y && this.y < monster.y + monster.height) {
                const isCrit = Math.random() * 100 < player.critChance;
                monster.takeDamage(this.damage, isCrit);
                this.hitMonsters.add(monster);

                // 히트 이펙트 - particles are created in monster.takeDamage()

                if (!this.piercing) return true;
            }
        }

        return this.life <= 0;
    }

    draw() {
        ctx.save();

        // 궤적 그리기
        if (this.trail.length > 1) {
            ctx.strokeStyle = player.buffs.soul ? 'rgba(0, 255, 255, 0.3)' : 'rgba(68, 255, 102, 0.3)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            ctx.stroke();
        }

        ctx.translate(this.x, this.y);
        if (this.direction === -1) ctx.scale(-1, 1);

        // 화살 본체
        const arrowColor = player.buffs.soul ? '#00ffff' : '#8B4513';

        // 화살대
        ctx.fillStyle = arrowColor;
        ctx.fillRect(-20, -2, 25, 4);

        // 화살촉
        ctx.fillStyle = '#aaaaaa';
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(0, -5);
        ctx.lineTo(0, 5);
        ctx.fill();

        // 깃털
        ctx.fillStyle = '#44ff66';
        ctx.beginPath();
        ctx.moveTo(-20, 0);
        ctx.lineTo(-28, -6);
        ctx.lineTo(-25, 0);
        ctx.lineTo(-28, 6);
        ctx.fill();

        // 소울 애로우 이펙트
        if (player.buffs.soul && player.buffs.soul.duration > 0) {
            ctx.fillStyle = 'rgba(0, 255, 255, 0.4)';
            ctx.beginPath();
            ctx.arc(0, 0, 12, 0, Math.PI * 2);
            ctx.fill();

            // 빛나는 입자
            for (let i = 0; i < 3; i++) {
                const angle = Date.now() / 200 + i * Math.PI * 2 / 3;
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(Math.cos(angle) * 8, Math.sin(angle) * 8, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.restore();
    }
}
