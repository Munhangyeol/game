import { game } from '../../core/game/GameState.js';
import { basicAttack, useSkill } from '../../features/combat/CombatSystem.js';

export function setupInputHandlers() {
    document.addEventListener('keydown', (e) => {
        game.keys[e.code] = true;
        if (e.code === 'KeyA' && !e.repeat) basicAttack();
        if (e.code === 'KeyZ') useSkill(0);
        if (e.code === 'KeyX') useSkill(1);
        if (e.code === 'KeyC') useSkill(2);
        if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    });

    document.addEventListener('keyup', (e) => {
        game.keys[e.code] = false;
    });
}
