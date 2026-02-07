import { canvas, game, player } from '../../core/game/GameState.js';
import { Monster } from './Monster.js';

export function spawnMonster() {
    const now = Date.now();
    if (now - game.lastMonsterSpawn > game.monsterSpawnInterval && game.monsters.length < 10) {
        const x = Math.random() * (canvas.width - 100) + 50;
        const rand = Math.random();
        let type = 'slime';
        if (rand > 0.7 && player.level >= 3) type = 'stump';
        else if (rand > 0.4) type = 'mushroom';
        game.monsters.push(new Monster(x, 50, type));
        game.lastMonsterSpawn = now;
        game.monsterSpawnInterval = Math.max(1000, 2500 - player.level * 100);
    }
}
