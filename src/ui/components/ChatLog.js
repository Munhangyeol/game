import { game } from '../../core/game/GameState.js';

let chatLogElement = null;
const MAX_LOGS = 5;
const LOG_FADE_TIME = 5000; // 5초 후 페이드아웃

export function initChatLog() {
    chatLogElement = document.getElementById('chatLog');
    if (!chatLogElement) {
        chatLogElement = document.createElement('div');
        chatLogElement.id = 'chatLog';
        chatLogElement.className = 'chat-log';
        document.querySelector('.game-container').appendChild(chatLogElement);
    }

    game.chatLogs = [];
}

export function addLog(message, color = '#ffffff', icon = '') {
    if (!game.chatLogs) game.chatLogs = [];

    const timestamp = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

    game.chatLogs.push({
        message,
        color,
        icon,
        timestamp,
        fadeTime: Date.now() + LOG_FADE_TIME
    });

    // 최대 로그 수 제한
    if (game.chatLogs.length > MAX_LOGS) {
        game.chatLogs.shift();
    }

    updateChatLog();
}

export function updateChatLog() {
    if (!chatLogElement || !game.chatLogs) return;
    if (!game.started) {
        chatLogElement.style.display = 'none';
        return;
    }

    chatLogElement.style.display = 'block';

    // 페이드아웃된 로그 제거
    const now = Date.now();
    game.chatLogs = game.chatLogs.filter(log => now < log.fadeTime);

    // 로그 렌더링
    chatLogElement.innerHTML = game.chatLogs.map((log, index) => {
        const timeLeft = log.fadeTime - now;
        const opacity = timeLeft < 1000 ? timeLeft / 1000 : 1; // 마지막 1초는 페이드아웃

        return `
            <div class="chat-log-entry" style="color: ${log.color}; opacity: ${opacity}">
                <span class="chat-log-time">[${log.timestamp}]</span>
                ${log.icon ? `<span class="chat-log-icon">${log.icon}</span>` : ''}
                <span class="chat-log-message">${log.message}</span>
            </div>
        `;
    }).join('');
}

// 게임 이벤트 로그 헬퍼 함수들
export function logKill(monsterType, count) {
    const monsterNames = {
        slime: '슬라임',
        mushroom: '머쉬룸',
        stump: '스텀프'
    };
    const name = monsterNames[monsterType] || monsterType;
    addLog(`${name}을(를) 처치했습니다! (${count}마리)`, '#ffff88', '💀');
}

export function logLevelUp(level) {
    addLog(`레벨 업! Lv.${level} 달성`, '#44ff44', '⭐');
}

export function logPromotion(jobName) {
    addLog(`${jobName}(으)로 전직했습니다!`, '#ffaa44', '🌟');
}

export function logQuestComplete(questName) {
    addLog(`퀘스트 완료: ${questName}`, '#ffcc88', '📜');
}

export function logQuestAccept(questName) {
    addLog(`새 퀘스트: ${questName}`, '#aaddff', '📜');
}

export function logItemBuy(itemName, cost) {
    addLog(`${itemName} 구매 (-${cost}메소)`, '#ffcc44', '🛒');
}

export function logDeath() {
    addLog('사망했습니다...', '#ff4444', '💀');
}
