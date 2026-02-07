import { canvas, ctx, game, player } from '../../core/game/GameState.js';
import { Coin } from '../visual/Coin.js';

// 몬스터 클래스
export class Monster {
    constructor(x, y, type = 'slime') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.spawnLevel = player.level; // 생성 시점 플레이어 레벨 저장

        const monsterTypes = {
            slime: { width: 50, height: 40, hp: 30 + player.level * 10, damage: 8 + player.level * 2, exp: 25, color: '#44dd44' },
            mushroom: { width: 55, height: 50, hp: 50 + player.level * 15, damage: 12 + player.level * 3, exp: 40, color: '#dd4444' },
            stump: { width: 60, height: 55, hp: 80 + player.level * 20, damage: 15 + player.level * 4, exp: 60, color: '#8B4513' }
        };

        const mt = monsterTypes[type];
        Object.assign(this, mt);
        this.baseExp = this.exp; // 기본 경험치 저장
        this.maxHp = this.hp;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = 0;
        this.isDead = false;
        this.deathTimer = 0;
        this.animFrame = 0;
        this.hitFlash = 0;
    }

    update() {
        if (this.isDead) {
            this.deathTimer++;
            return this.deathTimer > 30;
        }

        if (this.hitFlash > 0) this.hitFlash--;
        this.animFrame += 0.1;

        if (Math.random() < 0.02) this.vx = (Math.random() - 0.5) * 3;

        const dx = player.x - this.x;
        if (Math.abs(dx) < 300) this.vx += Math.sign(dx) * 0.1;
        this.vx = Math.max(-2, Math.min(2, this.vx));

        this.x += this.vx;
        this.vy += game.gravity;
        this.y += this.vy;

        for (const p of game.platforms) {
            if (this.y + this.height > p.y && this.y + this.height < p.y + p.height + 10 &&
                this.x + this.width > p.x && this.x < p.x + p.width && this.vy >= 0) {
                this.y = p.y - this.height;
                this.vy = 0;
            }
        }

        if (this.x < 0) { this.x = 0; this.vx *= -1; }
        if (this.x + this.width > canvas.width) { this.x = canvas.width - this.width; this.vx *= -1; }

        if (player.invincible <= 0 && this.checkCollision(player)) {
            player.hp -= this.damage;
            player.invincible = 60;
            player.vx = Math.sign(player.x - this.x) * 8;
            player.vy = -5;
            // Damage text and UI update handled in game loop
        }

        return false;
    }

    checkCollision(obj) {
        return this.x < obj.x + obj.width && this.x + this.width > obj.x &&
               this.y < obj.y + obj.height && this.y + this.height > obj.y;
    }

    draw() {
        ctx.save();
        if (this.isDead) ctx.globalAlpha = 1 - this.deathTimer / 30;
        if (this.hitFlash > 0) ctx.filter = 'brightness(2)';

        const bounce = Math.sin(this.animFrame) * 3;

        if (this.type === 'slime') {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.ellipse(this.x + this.width/2, this.y + this.height - 15 + bounce, this.width/2 - 5, this.height/2 - 5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.beginPath();
            ctx.ellipse(this.x + this.width/2 - 8, this.y + this.height - 25 + bounce, 8, 6, -0.3, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'mushroom') {
            ctx.fillStyle = '#DEB887';
            ctx.fillRect(this.x + 18, this.y + 28 + bounce, 20, 22);
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.ellipse(this.x + this.width/2, this.y + 22 + bounce, 28, 22, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(this.x + 18, this.y + 18 + bounce, 6, 0, Math.PI * 2);
            ctx.arc(this.x + 38, this.y + 20 + bounce, 5, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'stump') {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x + 10, this.y + 15 + bounce, 40, 40);
            ctx.fillStyle = '#654321';
            ctx.beginPath();
            ctx.arc(this.x + 30, this.y + 35 + bounce, 12, 0, Math.PI * 2);
            ctx.fill();
        }

        // 눈
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2 - 8, this.y + this.height/2 + bounce, 3, 0, Math.PI * 2);
        ctx.arc(this.x + this.width/2 + 8, this.y + this.height/2 + bounce, 3, 0, Math.PI * 2);
        ctx.fill();

        // HP 바 (메이플스타일)
        if (!this.isDead) {
            // 몬스터 이름
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            const names = { slime: '슬라임', mushroom: '머쉬룸', stump: '스텀프' };
            ctx.strokeText(names[this.type] || this.type, this.x + this.width/2, this.y - 18);
            ctx.fillText(names[this.type] || this.type, this.x + this.width/2, this.y - 18);

            // HP 바 배경 (검은색)
            ctx.fillStyle = '#000';
            ctx.fillRect(this.x - 2, this.y - 12, this.width + 4, 8);

            // HP 바 (빨간색, 부드러운 트랜지션)
            const hpPercent = this.hp / this.maxHp;
            ctx.fillStyle = hpPercent > 0.5 ? '#ff4444' : hpPercent > 0.2 ? '#ff8844' : '#ffaa44';
            ctx.fillRect(this.x, this.y - 10, hpPercent * this.width, 5);

            // HP 바 테두리
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.strokeRect(this.x - 2, this.y - 12, this.width + 4, 8);
        }

        ctx.restore();
    }

    takeDamage(dmg, isCrit = false, isBackstab = false) {
        let finalDmg = Math.floor(dmg * (isCrit ? 1.5 : 1) * (isBackstab ? 2 : 1));
        this.hp -= finalDmg;
        this.hitFlash = 10;

        // 콤보 시스템
        const now = Date.now();
        if (now - game.lastHitTime < 1000) {
            game.combo++;
        } else {
            game.combo = 1;
        }
        game.lastHitTime = now;

        // 크리티컬 타격 시 화면 흔들림
        if (isCrit) {
            const intensity = isBackstab ? 8 : 6;
            game.screenShake = {
                x: (Math.random() - 0.5) * intensity,
                y: (Math.random() - 0.5) * intensity,
                frames: 10
            };
            game.hitStop = 3;
        }

        const color = isBackstab ? '#ff00ff' : (isCrit ? '#ffaa00' : '#ffff00');
        game.damageTexts.push({
            x: this.x + this.width/2 + (Math.random() - 0.5) * 30,
            y: this.y,
            damage: finalDmg + (isCrit ? '!' : ''),
            color,
            life: 60,
            vy: -2,
            isCrit,
            isBackstab
        });

        // 크리티컬 시 더 많은 파티클
        const particleCount = isCrit ? 20 : 8;
        for (let i = 0; i < particleCount; i++) {
            game.particles.push({
                x: this.x + this.width/2,
                y: this.y + this.height/2,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8 - 3,
                life: 30,
                color: this.color,
                size: Math.random() * 5 + 2,
                isStar: isCrit && Math.random() > 0.5
            });
        }

        // 크리티컬 버스트 이펙트
        if (isCrit && game.effectClass?.Effect) {
            const { Effect } = game.effectClass;
            game.effects.push(new Effect('critBurst', this.x + this.width/2, this.y + this.height/2, 1, { maxFrames: 15 }));
        }

        if (this.hp <= 0) {
            this.isDead = true;

            // 비선형 EXP 스케일링: 레벨 차이에 따른 보상 조정
            const levelDiff = player.level - this.spawnLevel;
            let expMultiplier = 1 + (levelDiff * 0.15); // 레벨 차이당 ±15%
            expMultiplier = Math.max(0.3, Math.min(2.0, expMultiplier)); // 최소 30%, 최대 200%
            const finalExp = Math.floor(this.baseExp * expMultiplier);

            console.log(`[EXP] Monster killed! Before: ${player.exp}, Adding: ${finalExp}, After: ${player.exp + finalExp}`);
            player.exp += finalExp;
            player.kills++;
            console.log(`[EXP] Confirmed: player.exp = ${player.exp}, kills = ${player.kills}`);

            // EXP 텍스트 표시
            game.damageTexts.push({
                x: this.x + this.width/2,
                y: this.y,
                damage: `+${finalExp} EXP`,
                color: '#ffff00',
                life: 90,
                vy: -1.5,
                isExp: true
            });

            // 메소 드랍 (1-3개)
            const coinCount = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < coinCount; i++) {
                game.coins.push(new Coin(this.x + this.width/2, this.y + this.height/2));
            }

            // Level up check is handled in game loop
        }
    }
}
