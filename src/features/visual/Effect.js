import { canvas, ctx, player } from '../../core/game/GameState.js';

// 이펙트 클래스
export class Effect {
    constructor(type, x, y, direction, data = {}) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.frame = 0;
        this.maxFrames = data.maxFrames || 20;
        this.data = data;
    }

    update() {
        this.frame++;
        return this.frame >= this.maxFrames;
    }

    draw() {
        ctx.save();
        const progress = this.frame / this.maxFrames;

        switch(this.type) {
            case 'swordSlash':
                this.drawSwordSlash(progress);
                break;
            case 'powerStrike':
                this.drawPowerStrike(progress);
                break;
            case 'slashBlast':
                this.drawSlashBlast(progress);
                break;
            case 'daggerSlash':
                this.drawDaggerSlash(progress);
                break;
            case 'doubleStab':
                this.drawDoubleStab(progress);
                break;
            case 'assassinate':
                this.drawAssassinate(progress);
                break;
            case 'arrowTrail':
                this.drawArrowTrail(progress);
                break;
            case 'doubleShot':
                this.drawDoubleShot(progress);
                break;
            case 'arrowRain':
                this.drawArrowRain(progress);
                break;
            case 'rageActivate':
                this.drawRageActivate(progress);
                break;
            case 'hasteActivate':
                this.drawHasteActivate(progress);
                break;
            case 'soulActivate':
                this.drawSoulActivate(progress);
                break;
            case 'critBurst':
                this.drawCritBurst(progress);
                break;
            case 'levelUpPillar':
                this.drawLevelUpPillar(progress);
                break;
        }

        ctx.restore();
    }

    drawSwordSlash(progress) {
        const alpha = 1 - progress;
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = '#ffaa44';
        ctx.lineWidth = 4 - progress * 3;
        ctx.lineCap = 'round';

        const startAngle = this.direction === 1 ? -Math.PI/3 : Math.PI + Math.PI/3;
        const endAngle = this.direction === 1 ? Math.PI/3 : Math.PI - Math.PI/3;
        const currentAngle = startAngle + (endAngle - startAngle) * Math.min(1, progress * 2);

        ctx.beginPath();
        ctx.arc(this.x, this.y, 50 + progress * 20, startAngle, currentAngle);
        ctx.stroke();

        // 검 궤적 빛
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 45 + progress * 20, startAngle, currentAngle);
        ctx.stroke();
    }

    drawPowerStrike(progress) {
        const alpha = 1 - progress;
        ctx.globalAlpha = alpha;

        // 강력한 충격파
        const radius = 30 + progress * 80;
        ctx.strokeStyle = '#ff6644';
        ctx.lineWidth = 8 - progress * 6;
        ctx.beginPath();
        ctx.arc(this.x + this.direction * 40, this.y, radius, 0, Math.PI * 2);
        ctx.stroke();

        // 내부 폭발
        ctx.fillStyle = `rgba(255, 150, 50, ${alpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(this.x + this.direction * 40, this.y, radius * 0.6, 0, Math.PI * 2);
        ctx.fill();

        // 스파크
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + progress * 2;
            const dist = radius * 0.8;
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.arc(
                this.x + this.direction * 40 + Math.cos(angle) * dist,
                this.y + Math.sin(angle) * dist,
                4 - progress * 3, 0, Math.PI * 2
            );
            ctx.fill();
        }
    }

    drawSlashBlast(progress) {
        const alpha = 1 - progress;
        ctx.globalAlpha = alpha;

        // 다중 원형 슬래시
        for (let i = 0; i < 3; i++) {
            const delay = i * 0.15;
            const p = Math.max(0, progress - delay) / (1 - delay);
            if (p > 0 && p < 1) {
                const radius = 50 + p * 100;
                ctx.strokeStyle = i === 0 ? '#ff6644' : (i === 1 ? '#ff9966' : '#ffcc88');
                ctx.lineWidth = 6 - p * 5;
                ctx.beginPath();
                ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
                ctx.stroke();
            }
        }

        // 슬래시 라인들
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const len = 60 + progress * 80;
            ctx.strokeStyle = '#ffaa44';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(this.x + Math.cos(angle) * 20, this.y + Math.sin(angle) * 20);
            ctx.lineTo(this.x + Math.cos(angle) * len, this.y + Math.sin(angle) * len);
            ctx.stroke();
        }
    }

    drawDaggerSlash(progress) {
        const alpha = 1 - progress;
        ctx.globalAlpha = alpha;

        // 빠른 단검 궤적 (2개)
        for (let i = 0; i < 2; i++) {
            const offset = i * 0.3;
            const p = Math.max(0, Math.min(1, (progress - offset) * 2));

            ctx.strokeStyle = i === 0 ? '#aa44ff' : '#dd88ff';
            ctx.lineWidth = 3 - p * 2;
            ctx.lineCap = 'round';

            const startX = this.x + this.direction * 10;
            const endX = this.x + this.direction * (40 + p * 20);
            const offsetY = (i - 0.5) * 20;

            ctx.beginPath();
            ctx.moveTo(startX, this.y + offsetY - 10);
            ctx.lineTo(endX, this.y + offsetY + 10);
            ctx.stroke();
        }

        // 스피드 라인
        ctx.strokeStyle = 'rgba(170, 68, 255, 0.5)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            const y = this.y - 20 + i * 10;
            ctx.beginPath();
            ctx.moveTo(this.x - this.direction * 30, y);
            ctx.lineTo(this.x + this.direction * 20, y);
            ctx.stroke();
        }
    }

    drawDoubleStab(progress) {
        const alpha = 1 - progress;
        ctx.globalAlpha = alpha;
        const numHits = this.data.hits || 2;
        const colors = ['#aa44ff', '#cc66ff', '#ee88ff'];
        const gap = 0.75 / numHits;

        for (let i = 0; i < numHits; i++) {
            const offset = i * gap;
            const p = Math.max(0, Math.min(1, (progress - offset) / (1 - offset) * 1.8));

            if (p > 0) {
                const length = 60 * (1 - Math.abs(p - 0.5) * 2);
                const yOff = (i - numHits * 0.3) * 10;
                ctx.fillStyle = colors[i] || '#ee88ff';
                ctx.beginPath();
                ctx.moveTo(this.x + this.direction * 20, this.y - 5 + yOff);
                ctx.lineTo(this.x + this.direction * (20 + length), this.y + yOff);
                ctx.lineTo(this.x + this.direction * 20, this.y + 5 + yOff);
                ctx.fill();

                if (p > 0.4 && p < 0.6) {
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(this.x + this.direction * 80, this.y + yOff, 10, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }

    drawAssassinate(progress) {
        const alpha = 1 - progress;
        ctx.globalAlpha = alpha;

        // 그림자 분신
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.7})`;
        for (let i = 0; i < 3; i++) {
            const offsetX = this.direction * (i * 30 - progress * 60);
            ctx.beginPath();
            ctx.ellipse(this.x + offsetX, this.y, 25 - i * 5, 35 - i * 8, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // 치명적 일격
        const strikeProgress = Math.max(0, progress - 0.3) / 0.7;
        if (strikeProgress > 0) {
            // X자 슬래시
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 5 - strikeProgress * 4;
            ctx.lineCap = 'round';

            const size = 40 + strikeProgress * 30;
            const cx = this.x + this.direction * 60;

            ctx.beginPath();
            ctx.moveTo(cx - size, this.y - size);
            ctx.lineTo(cx + size, this.y + size);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(cx + size, this.y - size);
            ctx.lineTo(cx - size, this.y + size);
            ctx.stroke();

            // 해골 이펙트
            if (strikeProgress > 0.5) {
                ctx.font = `${30 + strikeProgress * 20}px Arial`;
                ctx.fillStyle = `rgba(255, 0, 0, ${1 - strikeProgress})`;
                ctx.textAlign = 'center';
                ctx.fillText('💀', cx, this.y + 10);
            }
        }
    }

    drawArrowTrail(progress) {
        const alpha = 1 - progress;
        ctx.globalAlpha = alpha;

        // 화살 궤적
        ctx.strokeStyle = '#44ff66';
        ctx.lineWidth = 3 - progress * 2;
        ctx.lineCap = 'round';

        const length = 40;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.direction * length, this.y);
        ctx.stroke();

        // 바람 효과
        ctx.strokeStyle = 'rgba(200, 255, 200, 0.5)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            const offsetY = (i - 1) * 8;
            ctx.beginPath();
            ctx.moveTo(this.x - this.direction * 20, this.y + offsetY);
            ctx.lineTo(this.x - this.direction * 50, this.y + offsetY);
            ctx.stroke();
        }
    }

    drawDoubleShot(progress) {
        const alpha = 1 - progress;
        ctx.globalAlpha = alpha;

        // 두 개의 화살 궤적
        for (let i = 0; i < 2; i++) {
            const offsetY = (i - 0.5) * 20;
            const trailLength = 80 * (1 - progress);

            // 화살 빛 궤적
            const gradient = ctx.createLinearGradient(
                this.x, this.y + offsetY,
                this.x + this.direction * trailLength, this.y + offsetY
            );
            gradient.addColorStop(0, 'rgba(68, 255, 102, 0)');
            gradient.addColorStop(1, `rgba(68, 255, 102, ${alpha})`);

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + offsetY);
            ctx.lineTo(this.x + this.direction * trailLength, this.y + offsetY);
            ctx.stroke();

            // 화살촉
            ctx.fillStyle = '#88ff88';
            ctx.beginPath();
            ctx.moveTo(this.x + this.direction * trailLength, this.y + offsetY);
            ctx.lineTo(this.x + this.direction * (trailLength - 15), this.y + offsetY - 5);
            ctx.lineTo(this.x + this.direction * (trailLength - 15), this.y + offsetY + 5);
            ctx.fill();
        }
    }

    drawArrowRain(progress) {
        const alpha = 1 - progress * 0.5;
        ctx.globalAlpha = alpha;

        // 하늘에서 내리는 화살들
        const numArrows = 15;
        for (let i = 0; i < numArrows; i++) {
            const delay = (i / numArrows) * 0.6;
            const p = Math.max(0, (progress - delay) / (1 - delay));

            if (p > 0 && p < 1) {
                const x = this.data.startX + (i / numArrows) * this.data.width;
                const startY = -50;
                const endY = this.data.groundY || 480;
                const y = startY + (endY - startY) * p;

                // 화살
                ctx.fillStyle = '#44ff66';
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x - 4, y - 25);
                ctx.lineTo(x + 4, y - 25);
                ctx.fill();

                // 화살 꼬리
                ctx.strokeStyle = 'rgba(68, 255, 102, 0.5)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x, y - 25);
                ctx.lineTo(x, y - 60);
                ctx.stroke();

                // 착지 이펙트
                if (p > 0.9) {
                    ctx.fillStyle = `rgba(68, 255, 102, ${(1 - p) * 5})`;
                    ctx.beginPath();
                    ctx.arc(x, endY, 20 * (p - 0.9) * 10, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }

    drawRageActivate(progress) {
        const alpha = 1 - progress;
        ctx.globalAlpha = alpha;

        const radius = 10 + progress * 65;
        ctx.strokeStyle = '#ff4400';
        ctx.lineWidth = 7 - progress * 6;
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = `rgba(255, 80, 0, ${alpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius * 0.45, 0, Math.PI * 2);
        ctx.fill();

        for (let i = 0; i < 14; i++) {
            const angle = (i / 14) * Math.PI * 2 + progress * 5;
            const dist = 15 + progress * 55;
            ctx.fillStyle = i % 2 === 0 ? '#ff6600' : '#ffaa00';
            ctx.beginPath();
            ctx.arc(
                this.x + Math.cos(angle) * dist,
                this.y + Math.sin(angle) * dist,
                5 - progress * 4, 0, Math.PI * 2
            );
            ctx.fill();
        }
    }

    drawHasteActivate(progress) {
        const alpha = 1 - progress;
        ctx.globalAlpha = alpha;

        for (let i = 0; i < 10; i++) {
            const angle = (i / 10) * Math.PI * 2 + progress * 3;
            const startDist = 8 + progress * 15;
            const endDist = 25 + progress * 55;

            ctx.strokeStyle = `rgba(170, 68, 255, ${alpha * (1 - progress * 0.5)})`;
            ctx.lineWidth = 3 - progress * 2;
            ctx.beginPath();
            ctx.moveTo(
                this.x + Math.cos(angle) * startDist,
                this.y + Math.sin(angle) * startDist
            );
            ctx.lineTo(
                this.x + Math.cos(angle) * endDist,
                this.y + Math.sin(angle) * endDist
            );
            ctx.stroke();
        }

        ctx.strokeStyle = `rgba(200, 160, 255, ${alpha * 0.6})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 20 + progress * 40, 0, Math.PI * 2);
        ctx.stroke();
    }

    drawSoulActivate(progress) {
        const alpha = 1 - progress;
        ctx.globalAlpha = alpha;

        for (let i = 0; i < 3; i++) {
            const delay = i * 0.22;
            const p = Math.max(0, (progress - delay) / (1 - delay));
            if (p > 0) {
                const radius = 8 + p * 65;
                ctx.strokeStyle = `rgba(68, 255, 200, ${alpha * (1 - p * 0.4)})`;
                ctx.lineWidth = 4 - p * 3;
                ctx.beginPath();
                ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
                ctx.stroke();
            }
        }

        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + progress * 4;
            const dist = 12 + progress * 42;
            ctx.fillStyle = `rgba(150, 255, 220, ${alpha})`;
            ctx.beginPath();
            ctx.arc(
                this.x + Math.cos(angle) * dist,
                this.y + Math.sin(angle) * dist,
                3 - progress * 2.5, 0, Math.PI * 2
            );
            ctx.fill();
        }
    }

    drawCritBurst(progress) {
        const alpha = 1 - progress;
        ctx.globalAlpha = alpha;

        // 번개 효과
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const len = 30 + progress * 40;
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(
                this.x + Math.cos(angle) * len + (Math.random() - 0.5) * 10,
                this.y + Math.sin(angle) * len + (Math.random() - 0.5) * 10
            );
            ctx.stroke();
        }

        // 별 효과
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2 + progress * 4;
            const dist = 20 + progress * 30;
            this.drawStar(
                this.x + Math.cos(angle) * dist,
                this.y + Math.sin(angle) * dist,
                5, 8, 4
            );
        }
    }

    drawStar(x, y, arms, outerRadius, innerRadius) {
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        for (let i = 0; i < arms * 2; i++) {
            const angle = (i * Math.PI) / arms;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const px = x + Math.cos(angle - Math.PI / 2) * radius;
            const py = y + Math.sin(angle - Math.PI / 2) * radius;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
    }

    drawLevelUpPillar(progress) {
        const alpha = 1 - progress;
        ctx.globalAlpha = alpha * 0.8;

        // 빛 기둥
        const gradient = ctx.createLinearGradient(this.x, this.y + 60, this.x, this.y - 200);
        gradient.addColorStop(0, 'rgba(255, 255, 0, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.6)');
        gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(this.x - 30, this.y - 200, 60, 260);

        // 반짝이는 별 파티클
        for (let i = 0; i < 12; i++) {
            const yPos = this.y + 60 - (progress + (i / 12)) * 260;
            const xOffset = Math.sin(yPos / 20 + i) * 25;
            const size = 3 + Math.sin(Date.now() / 100 + i) * 2;

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(this.x + xOffset, yPos, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}
