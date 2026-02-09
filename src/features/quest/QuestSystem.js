import { game, player } from '../../core/game/GameState.js';
import { QUESTS, QUEST_ORDER } from '../../../data/quests.js';
import { createExpText } from '../combat/CombatSystem.js';
import { logQuestAccept, logQuestComplete } from '../../ui/components/ChatLog.js';

export function initQuestSystem() {
    game.quests = {
        active: null,
        completed: [],
        progress: {}
    };

    // 첫 퀘스트 자동 수령
    acceptNextQuest();
}

export function acceptNextQuest() {
    if (!game.quests) initQuestSystem();

    // 다음 퀘스트 찾기
    for (const questId of QUEST_ORDER) {
        if (!game.quests.completed.includes(questId) && game.quests.active !== questId) {
            game.quests.active = questId;
            game.quests.progress[questId] = 0;
            console.log(`📜 Quest accepted: ${QUESTS[questId].name}`);
            logQuestAccept(QUESTS[questId].name);
            showQuestNotification(`새 퀘스트: ${QUESTS[questId].name}`);
            return;
        }
    }

    console.log('📜 All quests completed!');
}

export function updateQuestProgress(type, value = 1, target = null) {
    if (!game.quests || !game.quests.active) return;

    const questId = game.quests.active;
    const quest = QUESTS[questId];

    if (!quest) return;

    // 퀘스트 타입 확인
    if (quest.type !== type) return;

    // 타겟 확인 (kill 타입인 경우)
    if (type === 'kill' && quest.target && quest.target !== target) return;

    // 진행도 업데이트
    game.quests.progress[questId] = (game.quests.progress[questId] || 0) + value;

    // 퀘스트 완료 확인
    if (game.quests.progress[questId] >= quest.required) {
        completeQuest(questId);
    }
}

export function checkQuestCompletion(type, currentValue) {
    if (!game.quests || !game.quests.active) return;

    const questId = game.quests.active;
    const quest = QUESTS[questId];

    if (!quest) return;
    if (quest.type !== type) return;

    // 현재 값이 요구치를 충족하면 완료
    if (currentValue >= quest.required) {
        completeQuest(questId);
    }
}

function completeQuest(questId) {
    const quest = QUESTS[questId];
    if (!quest) return;

    console.log(`✅ Quest completed: ${quest.name}`);
    logQuestComplete(quest.name);

    // 보상 지급
    if (quest.rewards.exp) {
        player.exp += quest.rewards.exp;
        createExpText(player.x + player.width/2, player.y, quest.rewards.exp);
    }
    if (quest.rewards.meso) {
        game.meso = (game.meso || 0) + quest.rewards.meso;
    }

    // 퀘스트 완료 처리
    game.quests.completed.push(questId);
    game.quests.active = null;

    // 완료 알림
    showQuestNotification(`퀘스트 완료: ${quest.name}!`, '#44ff44');

    // 다음 퀘스트 자동 수령 (1초 후)
    setTimeout(() => acceptNextQuest(), 1000);
}

function showQuestNotification(message, color = '#ffcc88') {
    if (!game.questNotifications) game.questNotifications = [];

    game.questNotifications.push({
        message,
        color,
        life: 120,
        y: 80
    });
}

export function getActiveQuest() {
    if (!game.quests || !game.quests.active) return null;

    const questId = game.quests.active;
    const quest = QUESTS[questId];
    const progress = game.quests.progress[questId] || 0;

    return {
        ...quest,
        progress,
        percentage: Math.min(100, (progress / quest.required) * 100)
    };
}
