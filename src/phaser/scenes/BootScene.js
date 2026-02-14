export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    create() {
        // 물리 바디에 사용할 투명 1px 텍스처 생성
        const g = this.add.graphics();
        g.fillStyle(0xffffff, 1);
        g.fillRect(0, 0, 1, 1);
        g.generateTexture('pixel', 1, 1);
        g.destroy();

        // 직업 선택 DOM 화면 표시
        document.getElementById('job-select-screen').style.display = 'flex';

        // ── 직업 선택 → GameScene 시작 ──
        window.addEventListener('jobSelected', e => {
            document.getElementById('job-select-screen').style.display = 'none';
            document.getElementById('hud').style.display               = 'block';
            document.getElementById('game-over-screen').style.display  = 'none';
            if (this.scene.isActive('GameScene')) this.scene.stop('GameScene');
            this.scene.launch('GameScene', { job: e.detail.job });
        });

        // ── 재시작 ──
        window.addEventListener('gameRestart', e => {
            document.getElementById('game-over-screen').style.display = 'none';
            document.getElementById('hud').style.display              = 'block';
            if (this.scene.isActive('GameScene')) this.scene.stop('GameScene');
            this.scene.launch('GameScene', { job: e.detail.job });
        });

        // ── 직업 변경 ──
        window.addEventListener('gameChangeJob', () => {
            document.getElementById('game-over-screen').style.display = 'none';
            document.getElementById('hud').style.display              = 'none';
            if (this.scene.isActive('GameScene')) this.scene.stop('GameScene');
            document.getElementById('job-select-screen').style.display = 'flex';
        });
    }
}
