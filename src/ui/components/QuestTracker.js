import { getActiveQuest } from '../../features/quest/QuestSystem.js';
import { game } from '../../core/game/GameState.js';

let questTrackerElement = null;

export function initQuestTracker() {
    questTrackerElement = document.getElementById('questTracker');
    if (!questTrackerElement) {
        questTrackerElement = document.createElement('div');
        questTrackerElement.id = 'questTracker';
        questTrackerElement.className = 'quest-tracker';
        questTrackerElement.style.display = 'none';
        document.querySelector('.game-container').appendChild(questTrackerElement);
    }
}

export function updateQuestTracker() {
    if (!questTrackerElement) initQuestTracker();
    if (!game.started) {
        questTrackerElement.style.display = 'none';
        return;
    }

    const quest = getActiveQuest();

    if (!quest) {
        questTrackerElement.style.display = 'none';
        return;
    }

    questTrackerElement.style.display = 'block';

    const progressBar = Math.floor(quest.percentage / 10);
    const progressBarFilled = '▓'.repeat(progressBar);
    const progressBarEmpty = '░'.repeat(10 - progressBar);

    const html = `
        <div class="quest-tracker-header">
            <span class="quest-icon">${quest.icon}</span>
            <span class="quest-title">${quest.name}</span>
        </div>
        <div class="quest-description">${quest.description}</div>
        <div class="quest-progress">
            <div class="quest-progress-text">${quest.progress} / ${quest.required}</div>
            <div class="quest-progress-bar-container">
                <div class="quest-progress-bar" style="width: ${quest.percentage}%"></div>
            </div>
        </div>
        <div class="quest-rewards">
            ${quest.rewards.exp ? `<span>💫 +${quest.rewards.exp} EXP</span>` : ''}
            ${quest.rewards.meso ? `<span>💰 +${quest.rewards.meso} 메소</span>` : ''}
        </div>
    `;

    questTrackerElement.innerHTML = html;
}
