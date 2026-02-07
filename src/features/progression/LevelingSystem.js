import { game, player } from '../../core/game/GameState.js';
import { JOBS } from '../../../data/jobs.js';
import { Effect } from '../visual/Effect.js';
import { createHealText } from '../combat/CombatSystem.js';

export function checkLevelUp() {
    console.log(`[LevelUp] checkLevelUp called - EXP: ${player.exp}/${player.expToLevel}`);
    while (player.exp >= player.expToLevel) {
        console.log(`[LevelUp] LEVELING UP! ${player.level} -> ${player.level + 1}`);
        player.exp -= player.expToLevel;
        player.level++;

        const job = JOBS[player.job];
        const hpGain = job.hpPerLevel;
        const mpGain = job.mpPerLevel;

        player.maxHp += hpGain;
        player.hp = player.maxHp;
        player.maxMp += mpGain;
        player.mp = player.maxMp;
        player.attack += job.attackPerLevel;
        player.critChance += 0.5; // 레벨당 크리티컬 확률 +0.5%
        player.expToLevel = Math.floor(player.expToLevel * 1.5);

        // 회복 텍스트 표시
        createHealText(hpGain, 'hp');
        setTimeout(() => createHealText(mpGain, 'mp'), 150);

        // 레벨업 빛기둥
        game.effects.push(new Effect('levelUpPillar', player.x + player.width/2, player.y, 1, { maxFrames: 180 }));

        // 레벨업 텍스트 (레벨 숫자 포함)
        const levelUpText = document.getElementById('levelUpText');
        if (levelUpText) {
            levelUpText.textContent = `LEVEL UP! Lv.${player.level}`;
            levelUpText.style.display = 'block';
            levelUpText.style.animation = 'none';
            levelUpText.offsetHeight;
            levelUpText.style.animation = 'levelUp 2s ease-out forwards';
            setTimeout(() => levelUpText.style.display = 'none', 2000);
        }

        // 스탯 증가분 표시
        const statGainText = document.getElementById('statGainText');
        if (statGainText) {
            statGainText.textContent = `HP +${hpGain} | MP +${mpGain} | ATK +${job.attackPerLevel} | CRIT +0.5%`;
            statGainText.style.display = 'block';
            statGainText.style.animation = 'none';
            statGainText.offsetHeight;
            statGainText.style.animation = 'levelUp 1.5s ease-out forwards';
            setTimeout(() => statGainText.style.display = 'none', 1500);
        }

        for (let i = 0; i < 50; i++) {
            game.particles.push({
                x: player.x + player.width/2 + (Math.random() - 0.5) * 100,
                y: player.y + player.height/2 + (Math.random() - 0.5) * 100,
                vx: (Math.random() - 0.5) * 4,
                vy: -Math.random() * 5,
                life: 60,
                color: '#ffff00',
                size: Math.random() * 6 + 3
            });
        }
    }
}
