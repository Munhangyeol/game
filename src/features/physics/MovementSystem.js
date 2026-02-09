import { canvas, game, player } from '../../core/game/GameState.js';

export function handlePlayerMovement() {
    // 이동
    let speedBonus = 1;
    if (player.buffs.haste) speedBonus = player.buffs.haste.speedBonus;
    if (player.buffs.swiftness) speedBonus = player.buffs.swiftness.speedBonus;
    let currentSpeed = player.speed * speedBonus;
    if (game.keys['ArrowLeft']) {
        player.vx = -currentSpeed;
        player.direction = -1;
    } else if (game.keys['ArrowRight'] || game.keys['KeyD']) {
        player.vx = currentSpeed;
        player.direction = 1;
    } else {
        player.vx *= 0.8;
    }

    if ((game.keys['ArrowUp'] || game.keys['Space'] || game.keys['KeyW']) && !player.isJumping) {
        player.vy = player.jumpPower;
        player.isJumping = true;
    }

    player.x += player.vx;
    player.vy += game.gravity;
    player.y += player.vy;

    // 플랫폼 충돌
    player.isJumping = true;
    for (const p of game.platforms) {
        if (player.y + player.height > p.y && player.y + player.height < p.y + p.height + 10 &&
            player.x + player.width > p.x && player.x < p.x + p.width && player.vy >= 0) {
            player.y = p.y - player.height;
            player.vy = 0;
            player.isJumping = false;
        }
    }

    // 경계
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    if (player.y > canvas.height) {
        player.y = 100;
        // No HP penalty for falling
        // UI update is handled in game loop
    }
}
