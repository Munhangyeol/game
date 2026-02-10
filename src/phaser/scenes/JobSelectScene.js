import { JOBS } from '../../../data/jobs.js';

export default class JobSelectScene extends Phaser.Scene {
    constructor() {
        super('JobSelectScene');
    }

    create() {
        const W = 1000, H = 600;

        // 배경 그라디언트
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x1a1a3e, 0x1a1a3e, 0x2a1a4e, 0x2a1a4e, 1);
        bg.fillRect(0, 0, W, H);

        // 별 배경
        for (let i = 0; i < 80; i++) {
            const sx = (i * 127 + 53) % W;
            const sy = (i * 97 + 17) % H;
            const sa = 0.3 + (i % 5) * 0.14;
            this.add.circle(sx, sy, (i % 3) + 1, 0xffffff, sa);
        }

        // 제목
        this.add.text(W / 2, 55, '⚔ MapleQuest RPG', {
            fontSize: '38px', fontFamily: 'Segoe UI, sans-serif',
            color: '#ffffff', stroke: '#4466ff', strokeThickness: 4
        }).setOrigin(0.5);

        this.add.text(W / 2, 95, '직업을 선택하세요', {
            fontSize: '18px', fontFamily: 'Segoe UI, sans-serif',
            color: '#aaaadd'
        }).setOrigin(0.5);

        // 직업 카드 생성
        const jobs = [
            { id: 'warrior', x: 170 },
            { id: 'thief',   x: 500 },
            { id: 'archer',  x: 830 }
        ];

        jobs.forEach(({ id, x }) => {
            this.createJobCard(x, 330, id);
        });

        // 버전 표시
        this.add.text(W - 10, H - 10, 'Phaser Edition v6.0', {
            fontSize: '11px', color: '#445566'
        }).setOrigin(1, 1);
    }

    createJobCard(cx, cy, jobId) {
        const job = JOBS[jobId];
        const W = 260, H = 370;
        const x = cx - W / 2, y = cy - H / 2;

        // 카드 배경 (둥근 사각형 시뮬레이션)
        const cardBg = this.add.graphics();
        const colorHex = parseInt(job.color.replace('#', ''), 16);

        cardBg.lineStyle(2, colorHex, 0.8);
        cardBg.fillStyle(0x0a0a2a, 0.92);
        cardBg.strokeRoundedRect(x, y, W, H, 12);
        cardBg.fillRoundedRect(x, y, W, H, 12);

        // 직업 아이콘
        this.add.text(cx, y + 50, job.icon, { fontSize: '50px' }).setOrigin(0.5);

        // 직업명
        this.add.text(cx, y + 100, job.tiers[0].name, {
            fontSize: '26px', fontFamily: 'Segoe UI, sans-serif',
            color: job.color, fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 2
        }).setOrigin(0.5);

        // 스탯 바
        const stats = [
            { label: '❤️ HP', value: job.baseHp / 150 * 100 },
            { label: '⚡ 속도', value: job.speed / 7 * 100 },
            { label: '💪 공격', value: job.baseAttack / 18 * 100 }
        ];

        stats.forEach((stat, i) => {
            const sy = y + 130 + i * 32;
            this.add.text(x + 20, sy, stat.label, {
                fontSize: '14px', color: '#ccccee'
            });
            // 바 배경
            this.add.graphics()
                .fillStyle(0x333355)
                .fillRoundedRect(x + 90, sy + 2, 140, 14, 6);
            // 바 채우기
            this.add.graphics()
                .fillStyle(colorHex, 1)
                .fillRoundedRect(x + 90, sy + 2, Math.max(4, 140 * stat.value / 100), 14, 6);
        });

        // 스킬 목록
        this.add.text(cx, y + 230, '【 스킬 】', {
            fontSize: '13px', color: '#8888bb', fontStyle: 'bold'
        }).setOrigin(0.5);

        const t0 = job.tiers[0];
        t0.skills.forEach((skill, i) => {
            this.add.text(cx, y + 252 + i * 26, `${skill.icon || '•'} [${skill.key}] ${skill.name}`, {
                fontSize: '13px', color: '#aaaacc'
            }).setOrigin(0.5);
        });

        // 선택 버튼
        const btn = this.add.graphics();
        btn.fillStyle(colorHex, 1);
        btn.fillRoundedRect(x + 20, y + H - 55, W - 40, 40, 8);

        const btnText = this.add.text(cx, y + H - 35, '선택하기', {
            fontSize: '18px', fontFamily: 'Segoe UI, sans-serif',
            color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        // 클릭 영역 (인터랙티브)
        const zone = this.add.zone(cx, y + H - 35, W - 40, 40).setInteractive({ useHandCursor: true });

        // 호버 효과
        zone.on('pointerover', () => {
            btn.clear();
            btn.fillStyle(0xffffff, 0.15);
            btn.fillRoundedRect(x + 20, y + H - 55, W - 40, 40, 8);
            btn.fillStyle(colorHex, 1);
            btn.fillRoundedRect(x + 20, y + H - 55, W - 40, 40, 8);
            btnText.setScale(1.05);

            // 카드 글로우
            cardBg.clear();
            cardBg.lineStyle(3, 0xffffff, 0.5);
            cardBg.fillStyle(0x0a0a2a, 0.95);
            cardBg.strokeRoundedRect(x, y, W, H, 12);
            cardBg.fillRoundedRect(x, y, W, H, 12);
        });

        zone.on('pointerout', () => {
            btnText.setScale(1);
            cardBg.clear();
            cardBg.lineStyle(2, colorHex, 0.8);
            cardBg.fillStyle(0x0a0a2a, 0.92);
            cardBg.strokeRoundedRect(x, y, W, H, 12);
            cardBg.fillRoundedRect(x, y, W, H, 12);
        });

        zone.on('pointerdown', () => this.selectJob(jobId));
    }

    selectJob(jobId) {
        // 선택 플래시 효과
        const flash = this.add.graphics()
            .fillStyle(0xffffff, 0.7)
            .fillRect(0, 0, 1000, 600);

        this.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 400,
            onComplete: () => {
                flash.destroy();
                // GameScene이 HUDScene을 launch() 하므로 여기서는 GameScene만 시작
                this.scene.start('GameScene', { job: jobId });
            }
        });
    }
}
