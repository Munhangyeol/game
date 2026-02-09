import { game, player } from '../../core/game/GameState.js';
import { ACHIEVEMENTS } from '../../../data/achievements.js';

export function initAchievementSystem() {
    game.achievements = {
        unlocked: [],
        progress: {}
    };
}

export function checkAchievement(type, currentValue) {
    if (!game.achievements) initAchievementSystem();

    for (const [achievementId, achievement] of Object.entries(ACHIEVEMENTS)) {
        // 이미 해금된 업적은 스킵
        if (game.achievements.unlocked.includes(achievementId)) continue;

        // 타입이 맞는지 확인
        if (achievement.type !== type) continue;

        // 조건 달성 확인
        if (currentValue >= achievement.required) {
            unlockAchievement(achievementId);
        }
    }
}

function unlockAchievement(achievementId) {
    const achievement = ACHIEVEMENTS[achievementId];
    if (!achievement) return;

    console.log(`🏆 Achievement unlocked: ${achievement.name}`);

    // 업적 해금
    game.achievements.unlocked.push(achievementId);

    // 알림 표시
    showAchievementNotification(achievement);
}

function showAchievementNotification(achievement) {
    if (!game.achievementNotifications) game.achievementNotifications = [];

    game.achievementNotifications.push({
        achievement,
        life: 180, // 3초
        y: 120
    });
}

export function getUnlockedCount() {
    if (!game.achievements) return 0;
    return game.achievements.unlocked.length;
}

export function getTotalCount() {
    return Object.keys(ACHIEVEMENTS).length;
}
