import BootScene from './scenes/BootScene.js';
import JobSelectScene from './scenes/JobSelectScene.js';
import GameScene from './scenes/GameScene.js';
import HUDScene from './scenes/HUDScene.js';
import GameOverScene from './scenes/GameOverScene.js';

const config = {
    type: Phaser.AUTO,   // WebGL 우선, 폴백 Canvas
    width: 1000,
    height: 600,
    backgroundColor: '#1a1a3e',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1400 },
            debug: false
        }
    },
    scene: [BootScene, JobSelectScene, GameScene, HUDScene, GameOverScene]
};

const game = new Phaser.Game(config);
export default game;
