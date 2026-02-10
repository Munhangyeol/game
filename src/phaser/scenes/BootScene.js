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

        this.scene.start('JobSelectScene');
    }
}
