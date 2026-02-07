// Main entry point for the game
import { game } from './core/game/GameState.js';
import { Effect } from './features/visual/Effect.js';
import { setupInputHandlers } from './infrastructure/input/InputHandler.js';
import { gameLoop } from './core/game/GameLoop.js';
import './ui/screens/JobSelectScreen.js';

// Store Effect class reference to avoid circular dependencies
game.effectClass = { Effect };

// Start the game loop
gameLoop();

// Setup input handlers
setupInputHandlers();

console.log('MapleQuest RPG - Game initialized!');
