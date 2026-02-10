export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    init(data) {
        this.stats = data || {};
    }

    create() {
        const W = 1000, H = 600;

        // 반투명 배경
        this.add.graphics()
            .fillStyle(0x000000, 0.8)
            .fillRect(0, 0, W, H);

        // 패널
        this.add.graphics()
            .fillStyle(0x1a0a0a, 0.95)
            .fillRoundedRect(300, 100, 400, 400, 16);
        this.add.graphics()
            .lineStyle(2, 0xff2222, 1)
            .strokeRoundedRect(300, 100, 400, 400, 16);

        // 타이틀
        this.add.text(W / 2, 155, '💀 GAME OVER', {
            fontSize: '38px', color: '#ff4444', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5);

        // 통계
        const s = this.stats;
        const playTime = Math.floor((s.playFrames || 0) / 60);
        const mins = Math.floor(playTime / 60);
        const secs = playTime % 60;

        const stats = [
            { label: '도달 레벨',     value: `Lv.${s.level || 1}` },
            { label: '처치한 몬스터', value: `${s.kills || 0}마리` },
            { label: '획득 메소',     value: `${s.meso || 0}메소` },
            { label: '플레이 시간',   value: `${mins}분 ${secs}초` },
        ];

        stats.forEach(({ label, value }, i) => {
            const sy = 220 + i * 42;
            this.add.text(350, sy, label, { fontSize: '17px', color: '#aaaacc' });
            this.add.text(650, sy, value, { fontSize: '17px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(1, 0);
            if (i < stats.length - 1) {
                this.add.graphics().lineStyle(1, 0x333355).lineBetween(330, sy + 32, 670, sy + 32);
            }
        });

        // 버튼
        this.createButton(W / 2 - 90, 400, '재시작',   0x44aa44, () => this.restart());
        this.createButton(W / 2 + 90, 400, '직업 변경', 0x4444aa, () => this.changeJob());

        this.add.text(W / 2, 460, '[R] 재시작   [J] 직업 변경', {
            fontSize: '14px', color: '#556677'
        }).setOrigin(0.5);

        // 키보드 단축키
        this.input.keyboard.once('keydown-R', () => this.restart());
        this.input.keyboard.once('keydown-J', () => this.changeJob());

        // 입장 페이드인
        this.cameras.main.setAlpha(0);
        this.tweens.add({ targets: this.cameras.main, alpha: 1, duration: 600, ease: 'Power2' });
    }

    restart() {
        this.scene.stop('HUDScene');
        this.scene.stop('GameScene');
        this.scene.stop('GameOverScene');
        this.scene.start('GameScene', { job: this.stats.job || 'warrior' });
    }

    changeJob() {
        this.scene.stop('HUDScene');
        this.scene.stop('GameScene');
        this.scene.stop('GameOverScene');
        this.scene.start('JobSelectScene');
    }

    createButton(x, y, label, color, callback) {
        const W = 150, H = 44;
        const g = this.add.graphics()
            .fillStyle(color, 1)
            .fillRoundedRect(x - W / 2, y - H / 2, W, H, 8);

        const txt = this.add.text(x, y, label, {
            fontSize: '18px', color: '#ffffff', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 2
        }).setOrigin(0.5);

        const zone = this.add.zone(x, y, W, H).setInteractive({ useHandCursor: true });
        zone.on('pointerover', () => {
            g.clear()
                .fillStyle(0xffffff, 0.2)
                .fillRoundedRect(x - W / 2, y - H / 2, W, H, 8)
                .fillStyle(color, 1)
                .fillRoundedRect(x - W / 2, y - H / 2, W, H, 8);
            txt.setScale(1.05);
        });
        zone.on('pointerout', () => {
            g.clear().fillStyle(color, 1).fillRoundedRect(x - W / 2, y - H / 2, W, H, 8);
            txt.setScale(1);
        });
        zone.on('pointerdown', callback);
    }
}
