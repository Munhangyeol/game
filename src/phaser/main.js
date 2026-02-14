import BootScene from './scenes/BootScene.js';
import GameScene from './scenes/GameScene.js';

const config = {
    type: Phaser.AUTO,   // WebGL 우선, 폴백 Canvas
    width: 1000,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#1a1a3e',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1400 },
            debug: false
        }
    },
    scene: [BootScene, GameScene]
};

const game = new Phaser.Game(config);
export default game;
