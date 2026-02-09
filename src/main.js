// Main entry point for the game
console.log('🎮 [MAIN.JS] Loading... VERSION 2.0 - CACHE BUST!');
import { game, player } from './core/game/GameState.js';
import { Effect } from './features/visual/Effect.js';
import { setupInputHandlers } from './infrastructure/input/InputHandler.js';
import { gameLoop } from './core/game/GameLoop.js';
import { initSkillTooltip } from './ui/components/SkillTooltip.js';
import { initStatScreen } from './ui/screens/StatScreen.js';
import { initGameOverScreen } from './ui/screens/GameOverScreen.js';
import { initPauseScreen } from './ui/screens/PauseScreen.js';
import { initShopScreen } from './ui/screens/ShopScreen.js';
import { initQuestTracker } from './ui/components/QuestTracker.js';
import { initChatLog } from './ui/components/ChatLog.js';
import { initQuestSystem } from './features/quest/QuestSystem.js';
import { initAchievementSystem } from './features/achievement/AchievementSystem.js';
import './ui/screens/JobSelectScreen.js';

// Store Effect class reference to avoid circular dependencies
game.effectClass = { Effect };

// Initialize UI components
initSkillTooltip();
initStatScreen();
initGameOverScreen();
initPauseScreen();
initShopScreen();
initQuestTracker();
initChatLog();

// Initialize game systems
initQuestSystem();
initAchievementSystem();

// Start the game loop
gameLoop();

// Setup input handlers
setupInputHandlers();

// 개발자 치트: 전역으로 player 노출
window.player = player;
window.setLevel = (level) => {
    player.level = level;
    player.exp = player.expToLevel - 10; // 레벨업 직전
    console.log(`✅ 레벨 ${level}로 설정! 경험치 ${player.exp}/${player.expToLevel}`);
};

console.log('MapleQuest RPG - Game initialized!');
console.log('💡 개발자 치트: 콘솔에서 setLevel(9) 입력');
