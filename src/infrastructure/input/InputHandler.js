import { game } from '../../core/game/GameState.js';
import { basicAttack, useSkill } from '../../features/combat/CombatSystem.js';
import { toggleStatScreen } from '../../ui/screens/StatScreen.js';
import { togglePause } from '../../ui/screens/PauseScreen.js';
import { toggleShop } from '../../ui/screens/ShopScreen.js';

export function setupInputHandlers() {
    document.addEventListener('keydown', (e) => {
        // ESC/P키는 일시정지 전용 (게임 중일 때만)
        if ((e.code === 'Escape' || e.code === 'KeyP') && !e.repeat && game.started) {
            console.log('[Input] Pause key pressed');
            togglePause();
            e.preventDefault();
            return;
        }

        // 일시정지 중에는 다른 입력 무시
        if (game.paused) return;

        game.keys[e.code] = true;
        if (e.code === 'KeyA' && !e.repeat) {
            console.log('[Input] A key pressed, calling basicAttack()');
            basicAttack();
        }
        if (e.code === 'KeyZ') {
            console.log('[Input] Z key pressed, calling useSkill(0)');
            useSkill(0);
        }
        if (e.code === 'KeyX') {
            console.log('[Input] X key pressed, calling useSkill(1)');
            useSkill(1);
        }
        if (e.code === 'KeyC') {
            console.log('[Input] C key pressed, calling useSkill(2)');
            useSkill(2);
        }
        if (e.code === 'KeyI' && !e.repeat) {
            console.log('[Input] I key pressed, toggling stat screen');
            toggleStatScreen();
        }
        if (e.code === 'KeyS' && !e.repeat) {
            console.log('[Input] S key pressed, toggling shop');
            toggleShop();
        }
        if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    });

    document.addEventListener('keyup', (e) => {
        game.keys[e.code] = false;
    });
}
