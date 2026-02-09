import { game, player } from '../../core/game/GameState.js';
import { JOBS } from '../../../data/jobs.js';
import { Effect } from '../visual/Effect.js';
import { createHealText } from '../combat/CombatSystem.js';
import { createSkillBar } from '../../ui/components/SkillBar.js';
import { checkQuestCompletion, updateQuestProgress } from '../quest/QuestSystem.js';
import { logLevelUp, logPromotion } from '../../ui/components/ChatLog.js';

export function checkLevelUp() {
    console.log(`[LevelUp] checkLevelUp called - EXP: ${player.exp}/${player.expToLevel}`);
    while (player.exp >= player.expToLevel) {
        console.log(`[LevelUp] LEVELING UP! ${player.level} -> ${player.level + 1}`);
        player.exp -= player.expToLevel;
        player.level++;

        // 레벨업 퀘스트 확인
        checkQuestCompletion('level', player.level);

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

        // Promotion check
        const PROMOTION_LEVELS = [10, 30, 70];
        const promotionIndex = PROMOTION_LEVELS.indexOf(player.level);

        if (promotionIndex !== -1 && player.tier === promotionIndex) {
            // Apply promotion bonus
            const bonus = job.promotionBonus[promotionIndex];
            player.maxHp += bonus.hp;
            player.hp = player.maxHp;
            player.maxMp += bonus.mp;
            player.mp = player.maxMp;

            // Advance tier
            player.tier++;

            console.log(`[Promotion] Tier ${player.tier - 1} → ${player.tier}`);

            // 전직 퀘스트 업데이트
            updateQuestProgress('promotion', 1);

            // Show promotion UI
            showPromotionUI(job, player.tier);

            // Promotion takes priority, skip normal level-up display
            continue;
        }

        // 회복 텍스트 표시
        createHealText(hpGain, 'hp');
        setTimeout(() => createHealText(mpGain, 'mp'), 150);

        // 레벨업 빛기둥
        game.effects.push(new Effect('levelUpPillar', player.x + player.width/2, player.y, 1, { maxFrames: 180 }));

        // 로그 추가
        logLevelUp(player.level);

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

function showPromotionUI(job, newTier) {
    const tierData = job.tiers[newTier];
    const bonusIndex = newTier - 1;
    const bonus = job.promotionBonus[bonusIndex];

    // 로그 추가
    logPromotion(tierData.name);

    // Create promotion pillar effect
    game.effects.push(new Effect('promotionPillar', player.x + player.width/2, player.y, 1, { maxFrames: 200 }));

    // Create 100 particles for dramatic effect
    for (let i = 0; i < 100; i++) {
        game.particles.push({
            x: player.x + player.width/2 + (Math.random() - 0.5) * 150,
            y: player.y + player.height/2 + (Math.random() - 0.5) * 150,
            vx: (Math.random() - 0.5) * 6,
            vy: -Math.random() * 8,
            life: 80,
            color: '#ffd700',
            size: Math.random() * 8 + 4
        });
    }

    // Show promotion popup
    const promotionUI = document.getElementById('promotionUI');
    if (promotionUI) {
        promotionUI.innerHTML = `
            <h1>전직!</h1>
            <div class="promotion-icon">${tierData.icon}</div>
            <h2 style="font-size: 36px; color: ${job.color}">${tierData.name}</h2>
            <div class="promotion-stats">
                HP +${bonus.hp} | MP +${bonus.mp}
            </div>
            <div class="promotion-skills">
                <div style="font-weight: bold; margin-bottom: 10px;">새로운 스킬:</div>
                ${tierData.skills.map(s => `[${s.key}] ${s.icon} ${s.name}`).join('<br>')}
            </div>
        `;
        promotionUI.style.display = 'block';
        promotionUI.style.animation = 'promotionAppear 3s ease-out forwards';

        // Update HUD job name/icon
        const jobName = document.getElementById('jobName');
        const jobIcon = document.getElementById('jobIcon');
        if (jobName) jobName.textContent = tierData.name;
        if (jobIcon) jobIcon.textContent = tierData.icon;

        // Refresh skill bar
        createSkillBar();

        // Hide after 3 seconds
        setTimeout(() => {
            promotionUI.style.display = 'none';
        }, 3000);
    }

    // Heal texts for promotion bonuses
    createHealText(bonus.hp, 'hp');
    setTimeout(() => createHealText(bonus.mp, 'mp'), 150);
}
