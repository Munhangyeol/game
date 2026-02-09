import { canvas, game, player } from '../../core/game/GameState.js';
import { Monster } from './Monster.js';

export function spawnMonster() {
    const now = Date.now();
    if (now - game.lastMonsterSpawn > game.monsterSpawnInterval && game.monsters.length < 10) {
        const x = Math.random() * (canvas.width - 100) + 50;
        const rand = Math.random();
        let type = 'slime';

        // 레벨별 몬스터 스폰
        if (player.level >= 60 && rand > 0.85) {
            type = 'ancientDragon';  // Lv60+: 고대 드래곤 (15%)
        } else if (player.level >= 35 && rand > 0.7) {
            type = 'rockWhale';  // Lv35+: 바위 고래 (15%)
        } else if (player.level >= 15 && rand > 0.6) {
            type = 'fireBug';  // Lv15+: 불타는 버그 (10%)
        } else if (player.level >= 3 && rand > 0.7) {
            type = 'stump';  // Lv3+: 스텀프
        } else if (rand > 0.4) {
            type = 'mushroom';  // 머쉬룸
        }

        game.monsters.push(new Monster(x, 50, type));
        game.lastMonsterSpawn = now;
        game.monsterSpawnInterval = Math.max(1000, 2500 - player.level * 100);
    }
}
