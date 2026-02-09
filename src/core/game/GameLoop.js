import { canvas, ctx, game, player } from './GameState.js';
import { handlePlayerMovement } from '../../features/physics/MovementSystem.js';
import { spawnMonster } from '../../features/monster/MonsterSpawner.js';
import { checkLevelUp } from '../../features/progression/LevelingSystem.js';
import { updateUI } from '../../ui/components/HUD.js';
import { updateSkillBar, updateBuffBar } from '../../ui/components/SkillBar.js';
import { updateQuestTracker } from '../../ui/components/QuestTracker.js';
import { updateChatLog } from '../../ui/components/ChatLog.js';
import { checkQuestCompletion } from '../../features/quest/QuestSystem.js';
import { checkAchievement } from '../../features/achievement/AchievementSystem.js';
import { drawBackground } from '../../infrastructure/rendering/BackgroundRenderer.js';
import { drawPlayer } from '../../infrastructure/rendering/PlayerRenderer.js';
import { drawMinimap } from '../../infrastructure/rendering/MinimapRenderer.js';
import { showGameOver } from '../../ui/screens/GameOverScreen.js';

export function gameLoop() {
    if (!game.started) {
        requestAnimationFrame(gameLoop);
        return;
    }

    // 일시정지 상태에서는 렌더링만 수행
    if (game.paused) {
        // 렌더링만 실행 (업데이트는 스킵)
        ctx.save();
        if (game.screenShake.frames > 0) {
            ctx.translate(game.screenShake.x, game.screenShake.y);
        }
        drawBackground();
        for (const monster of game.monsters) monster.draw();
        for (const coin of game.coins) coin.draw();
        drawPlayer();
        for (const proj of game.projectiles) proj.draw();
        for (const effect of game.effects) effect.draw();
        ctx.restore();

        // 파티클, 데미지 텍스트 등도 렌더링
        for (const p of game.particles) {
            ctx.globalAlpha = p.life / 30;
            ctx.fillStyle = p.color;
            if (p.isStar) {
                ctx.beginPath();
                for (let i = 0; i < 8; i++) {
                    const angle = (i * Math.PI) / 4;
                    const radius = i % 2 === 0 ? p.size : p.size/2;
                    const px = p.x + Math.cos(angle - Math.PI / 2) * radius;
                    const py = p.y + Math.sin(angle - Math.PI / 2) * radius;
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1;

        drawMinimap();
        requestAnimationFrame(gameLoop);
        return;
    }

    // 플레이 시간 증가
    game.playTime++;

    // 히트스톱 (크리티컬 타격 시 프레임 정지)
    if (game.hitStop > 0) {
        game.hitStop--;
        drawBackground();
        drawPlayer();
        for (const m of game.monsters) m.draw();
        for (const e of game.effects) e.draw();
        for (const p of game.projectiles) p.draw();
        for (const c of game.coins) c.draw();
        requestAnimationFrame(gameLoop);
        return;
    }

    // 콤보 리셋 체크
    if (game.combo > 0 && Date.now() - game.lastHitTime > 1000) {
        game.combo = 0;
    }

    // 콤보 퀘스트 체크
    if (game.combo > 0) {
        checkQuestCompletion('combo', game.combo);
        checkAchievement('combo', game.combo);
    }

    // 업적 체크 (매 프레임)
    checkAchievement('kills', player.kills);
    checkAchievement('level', player.level);
    checkAchievement('meso', game.meso || 0);

    // 화면 흔들림 감소
    if (game.screenShake.frames > 0) {
        game.screenShake.frames--;
        if (game.screenShake.frames === 0) {
            game.screenShake.x = 0;
            game.screenShake.y = 0;
        }
    }

    // 플레이어 잔상 업데이트 (헤이스트 버프 시)
    if (player.buffs.haste && player.buffs.haste.duration > 0) {
        player.trail.push({ x: player.x, y: player.y });
        if (player.trail.length > 3) player.trail.shift();
    } else {
        player.trail = [];
    }

    // MP 자동 회복
    if (player.mp < player.maxMp) player.mp += 0.05;

    // 쿨다운
    if (player.attackCooldown > 0) player.attackCooldown--;
    for (let i = 0; i < player.skillCooldowns.length; i++) {
        if (player.skillCooldowns[i] > 0) player.skillCooldowns[i]--;
    }

    // 버프 업데이트
    for (const [buffName, buffData] of Object.entries(player.buffs)) {
        if (buffData.duration > 0) {
            buffData.duration--;

            // Holy Light healing over time
            if (buffName === 'holyLight' && buffData.healPerSec && buffData.duration % 60 === 0) {
                const healAmount = buffData.healPerSec;
                player.hp = Math.min(player.hp + healAmount, player.maxHp);
            }

            if (buffData.duration <= 0) {
                // Remove buff-specific effects on expiry
                if (buffName === 'keenEyes' && buffData.critBonus) {
                    player.critChance -= buffData.critBonus;
                }
                delete player.buffs[buffName];
            }
        }
    }
    updateBuffBar();
    updateSkillBar();

    // 플레이어 이동
    handlePlayerMovement();

    if (player.invincible > 0) player.invincible--;

    // 업데이트
    spawnMonster();

    // Track previous exp to check for level ups after monster updates
    const prevMonsterCount = game.monsters.length;
    game.monsters = game.monsters.filter(m => !m.update());
    const newMonsterCount = game.monsters.length;

    if (prevMonsterCount !== newMonsterCount) {
        console.log(`[GameLoop] Monsters: ${prevMonsterCount} -> ${newMonsterCount}`);
    }

    // ALWAYS check for level up and update UI every frame
    // (exp can change from attacks outside Monster.update())
    checkLevelUp();
    updateUI();
    updateQuestTracker();
    updateChatLog();

    game.projectiles = game.projectiles.filter(p => !p.update());
    game.effects = game.effects.filter(e => !e.update());
    game.coins = game.coins.filter(c => !c.update());

    game.particles = game.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2;
        p.life--;
        return p.life > 0;
    });

    game.damageTexts = game.damageTexts.filter(t => {
        t.y += t.vy;
        t.life--;
        return t.life > 0;
    });

    game.skillNames = game.skillNames.filter(s => {
        s.y += s.vy;
        s.life--;
        return s.life > 0;
    });

    // 사망
    if (player.hp <= 0) {
        console.log(`[DEATH] Player died! HP: ${player.hp}, Level: ${player.level}, Kills: ${player.kills}`);
        showGameOver();
        // 게임오버 화면이 표시되면 game.started = false가 되어 루프가 멈춤
    }

    // 렌더링
    ctx.save();

    // 화면 흔들림 적용
    if (game.screenShake.frames > 0) {
        ctx.translate(game.screenShake.x, game.screenShake.y);
    }

    drawBackground();
    for (const monster of game.monsters) monster.draw();
    for (const coin of game.coins) coin.draw();
    drawPlayer();
    for (const proj of game.projectiles) proj.draw();
    for (const effect of game.effects) effect.draw();

    ctx.restore();

    // 파티클
    for (const p of game.particles) {
        ctx.globalAlpha = p.life / 30;
        ctx.fillStyle = p.color;

        if (p.isStar) {
            // 별 모양 파티클
            ctx.beginPath();
            for (let i = 0; i < 8; i++) {
                const angle = (i * Math.PI) / 4;
                const radius = i % 2 === 0 ? p.size : p.size/2;
                const px = p.x + Math.cos(angle - Math.PI / 2) * radius;
                const py = p.y + Math.sin(angle - Math.PI / 2) * radius;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    ctx.globalAlpha = 1;

    // 데미지 텍스트
    for (const t of game.damageTexts) {
        ctx.globalAlpha = t.life / 60;
        ctx.fillStyle = t.color;

        // 크리티컬: 폰트 크기 1.5배, 백스탭: 볼드체 강화, EXP: 크게, 회복: 중간
        let fontSize = 20;
        let fontWeight = 'bold';
        if (t.isCrit) fontSize = 30;
        if (t.isBackstab) fontWeight = '900';
        if (t.isExp) fontSize = 24;
        if (t.isHeal) fontSize = 22;
        if (t.isCritText) fontSize = 22;  // "CRITICAL!" 텍스트
        if (t.isComboText) fontSize = 26; // "EXCELLENT!" 텍스트

        ctx.font = `${fontWeight} ${fontSize}px Arial`;
        ctx.textAlign = 'center';

        // 외곽선 (메이플스타일)
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText(t.damage, t.x, t.y);

        // 텍스트
        ctx.fillText(t.damage, t.x, t.y);
    }
    ctx.globalAlpha = 1;

    // 스킬명 텍스트
    for (const s of game.skillNames) {
        ctx.globalAlpha = s.life / 60;
        ctx.fillStyle = s.color;
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';

        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText(s.name, s.x, s.y);
        ctx.fillText(s.name, s.x, s.y);
    }
    ctx.globalAlpha = 1;

    // 업적 알림
    if (game.achievementNotifications) {
        game.achievementNotifications = game.achievementNotifications.filter(notif => {
            notif.life--;
            if (notif.life <= 0) return false;

            const alpha = notif.life > 30 ? 1 : notif.life / 30;
            ctx.globalAlpha = alpha;

            // 배경
            ctx.fillStyle = 'rgba(20, 20, 40, 0.95)';
            ctx.fillRect(canvas.width / 2 - 150, notif.y, 300, 60);
            ctx.strokeStyle = '#ffaa00';
            ctx.lineWidth = 3;
            ctx.strokeRect(canvas.width / 2 - 150, notif.y, 300, 60);

            // 아이콘 + 텍스트
            ctx.fillStyle = '#ffaa00';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.strokeText('🏆 업적 해금!', canvas.width / 2, notif.y + 25);
            ctx.fillText('🏆 업적 해금!', canvas.width / 2, notif.y + 25);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px Arial';
            const achievementText = `${notif.achievement.icon} ${notif.achievement.name}`;
            ctx.strokeText(achievementText, canvas.width / 2, notif.y + 45);
            ctx.fillText(achievementText, canvas.width / 2, notif.y + 45);

            ctx.globalAlpha = 1;
            return true;
        });
    }

    // 콤보 카운터 (우상단)
    if (game.combo > 0) {
        const comboColor = game.combo >= 30 ? '#ff4444' : (game.combo >= 10 ? '#ffaa00' : '#ffffff');
        const comboScale = 1 + Math.sin(Date.now() / 100) * 0.1;

        ctx.save();
        ctx.translate(canvas.width - 80, 40);
        ctx.scale(comboScale, comboScale);
        ctx.translate(-canvas.width + 80, -40);

        ctx.fillStyle = comboColor;
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'right';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText(`${game.combo} COMBO!`, canvas.width - 20, 40);
        ctx.fillText(`${game.combo} COMBO!`, canvas.width - 20, 40);
        ctx.restore();
    }

    // 메소 카운터 (우상단, 콤보 아래)
    ctx.fillStyle = '#ffcc00';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'right';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeText(`💰 메소: ${game.meso}`, canvas.width - 20, 70);
    ctx.fillText(`💰 메소: ${game.meso}`, canvas.width - 20, 70);

    // 미니맵
    drawMinimap();

    requestAnimationFrame(gameLoop);
}
