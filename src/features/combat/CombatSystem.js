import { game, player } from '../../core/game/GameState.js';
import { JOBS } from '../../../data/jobs.js';
import { Effect } from '../visual/Effect.js';
import { Projectile } from '../visual/Projectile.js';

export function createParticles(x, y, color, count = 10, isCrit = false) {
    for (let i = 0; i < count; i++) {
        game.particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8 - 3,
            life: 30,
            color,
            size: Math.random() * 5 + 2,
            isStar: isCrit && Math.random() > 0.5
        });
    }

    // 크리티컬 버스트 이펙트
    if (isCrit) {
        game.effects.push(new Effect('critBurst', x, y, 1, { maxFrames: 15 }));
    }
}

export function createDamageText(x, y, damage, color, isCrit = false, isBackstab = false) {
    // 좌우 분산 배치 (여러 대미지 동시 발생 시 겹치지 않게)
    const offsetX = (Math.random() - 0.5) * 30;
    game.damageTexts.push({ x: x + offsetX, y, damage, color, life: 60, vy: -2, isCrit, isBackstab });
}

export function createExpText(x, y, exp) {
    game.damageTexts.push({
        x, y,
        damage: `+${exp} EXP`,
        color: '#ffff00',
        life: 90,
        vy: -1.5,
        isExp: true
    });
}

export function createSkillNameText(skillName) {
    const job = JOBS[player.job];
    game.skillNames.push({
        x: player.x + player.width/2,
        y: player.y - 20,
        name: skillName,
        color: job.color,
        life: 60,
        vy: -1
    });
}

export function createHealText(amount, type) {
    const color = type === 'hp' ? '#44ff44' : '#4444ff';
    const text = type === 'hp' ? `+${amount} HP` : `+${amount} MP`;
    game.damageTexts.push({
        x: player.x + player.width/2,
        y: player.y,
        damage: text,
        color,
        life: 60,
        vy: -2,
        isHeal: true
    });
}

// 기본 공격
export function basicAttack() {
    if (!game.started || player.attackCooldown > 0) return;

    const job = JOBS[player.job];
    const basic = job.basicAttack;
    const attackMultiplier = player.buffs.rage ? player.buffs.rage.attackBonus : 1;
    const damage = player.attack * basic.damage * attackMultiplier;

    player.isAttacking = true;
    player.attackCooldown = basic.cooldown || 20;
    setTimeout(() => player.isAttacking = false, basic.animDuration || 150);

    if (basic.type === 'sword') {
        // 전사 기본 공격 - 검 휘두르기
        game.effects.push(new Effect('swordSlash', player.x + player.width/2, player.y + player.height/2, player.direction, { maxFrames: 15 }));

        const attackBox = {
            x: player.direction === 1 ? player.x + player.width : player.x - basic.range,
            y: player.y - 10,
            width: basic.range,
            height: player.height + 20
        };

        for (const monster of game.monsters) {
            if (!monster.isDead && attackBox.x < monster.x + monster.width && attackBox.x + attackBox.width > monster.x &&
                attackBox.y < monster.y + monster.height && attackBox.y + attackBox.height > monster.y) {
                monster.takeDamage(damage, Math.random() * 100 < player.critChance);
                monster.vx = player.direction * 8;
                monster.vy = -4;
            }
        }
    } else if (basic.type === 'dagger') {
        // 도적 기본 공격 - 빠른 단검
        game.effects.push(new Effect('daggerSlash', player.x + player.width/2, player.y + player.height/2, player.direction, { maxFrames: 12 }));

        const attackBox = {
            x: player.direction === 1 ? player.x + player.width : player.x - basic.range,
            y: player.y - 5,
            width: basic.range,
            height: player.height + 10
        };

        for (let h = 0; h < basic.hits; h++) {
            setTimeout(() => {
                for (const monster of game.monsters) {
                    if (!monster.isDead && attackBox.x < monster.x + monster.width && attackBox.x + attackBox.width > monster.x &&
                        attackBox.y < monster.y + monster.height && attackBox.y + attackBox.height > monster.y) {
                        monster.takeDamage(damage, Math.random() * 100 < player.critChance);
                    }
                }
            }, h * 80);
        }
    } else if (basic.type === 'arrow') {
        // 궁수 기본 공격 - 화살 발사
        game.effects.push(new Effect('arrowTrail', player.x + player.width/2, player.y + player.height/2, player.direction, { maxFrames: 10 }));

        const piercing = player.buffs.soul && player.buffs.soul.duration > 0;
        game.projectiles.push(new Projectile(
            player.x + (player.direction === 1 ? player.width : 0),
            player.y + player.height/2,
            player.direction,
            damage,
            'arrow',
            piercing
        ));
    }
}

// 스킬 사용
export function useSkill(skillIndex) {
    if (!game.started || player.skillCooldowns[skillIndex] > 0) return;

    const job = JOBS[player.job];
    const skill = job.skills[skillIndex];
    const slot = document.getElementById(`skill${skillIndex}`);

    // MP 부족 시 흔들림 애니메이션
    if (player.mp < skill.mp) {
        if (slot) {
            slot.classList.add('shake');
            setTimeout(() => slot.classList.remove('shake'), 300);
        }
        return;
    }

    // 스킬 사용 시 눌림 애니메이션
    if (slot) {
        slot.classList.add('press');
        setTimeout(() => slot.classList.remove('press'), 200);
    }

    // MP와 쿨다운은 스킬 실행 성공 후 차감
    const attackMultiplier = player.buffs.rage ? player.buffs.rage.attackBonus : 1;
    const baseDamage = player.attack * skill.damage * attackMultiplier;

    // 스킬 실행
    let skillExecuted = false;
    switch (skill.type) {
        case 'powerStrike':
            performPowerStrike(baseDamage);
            skillExecuted = true;
            break;
        case 'slashBlast':
            performSlashBlast(baseDamage, skill.range);
            skillExecuted = true;
            break;
        case 'doubleStab':
            performDoubleStab(baseDamage, skill.hits);
            skillExecuted = true;
            break;
        case 'assassinate':
            performAssassinate(baseDamage, skill.backstab);
            skillExecuted = true;
            break;
        case 'doubleShot':
            performDoubleShot(baseDamage, skill.arrows, skill.spread);
            skillExecuted = true;
            break;
        case 'arrowRain':
            performArrowRain(baseDamage);
            skillExecuted = true;
            break;
    }

    if (skill.buff) {
        player.buffs[skill.buff] = { duration: skill.duration, icon: skill.icon, ...skill };
        const buffEffects = { rage: 'rageActivate', haste: 'hasteActivate', soul: 'soulActivate' };
        if (buffEffects[skill.buff]) {
            game.effects.push(new Effect(buffEffects[skill.buff], player.x + player.width/2, player.y + player.height/2, player.direction, { maxFrames: 40 }));
        }
        skillExecuted = true;
    }

    // 스킬이 성공적으로 실행되었을 때만 MP 차감 및 쿨다운 적용
    if (skillExecuted) {
        player.mp -= skill.mp;
        player.skillCooldowns[skillIndex] = skill.cooldown;
        player.isAttacking = true;
        setTimeout(() => player.isAttacking = false, 200);

        // 스킬명 표시
        createSkillNameText(skill.name);
    }

    // UI update is handled in game loop
}

export function performPowerStrike(damage) {
    game.effects.push(new Effect('powerStrike', player.x + player.width/2, player.y + player.height/2, player.direction, { maxFrames: 25 }));

    const attackBox = {
        x: player.direction === 1 ? player.x + player.width - 20 : player.x - 80,
        y: player.y - 20,
        width: 100,
        height: player.height + 40
    };

    for (const monster of game.monsters) {
        if (!monster.isDead && attackBox.x < monster.x + monster.width && attackBox.x + attackBox.width > monster.x &&
            attackBox.y < monster.y + monster.height && attackBox.y + attackBox.height > monster.y) {
            monster.takeDamage(damage, Math.random() * 100 < player.critChance);
            monster.vx = player.direction * 15;
            monster.vy = -8;
        }
    }
}

export function performSlashBlast(damage, range) {
    game.effects.push(new Effect('slashBlast', player.x + player.width/2, player.y + player.height/2, player.direction, { maxFrames: 30 }));

    for (const monster of game.monsters) {
        if (!monster.isDead) {
            const dx = monster.x + monster.width/2 - (player.x + player.width/2);
            const dy = monster.y + monster.height/2 - (player.y + player.height/2);
            if (Math.sqrt(dx*dx + dy*dy) < range) {
                monster.takeDamage(damage, Math.random() * 100 < player.critChance);
            }
        }
    }
}

export function performDoubleStab(damage, hits) {
    game.effects.push(new Effect('doubleStab', player.x + player.width/2, player.y + player.height/2, player.direction, { maxFrames: 25, hits: hits }));

    const attackBox = {
        x: player.direction === 1 ? player.x + player.width : player.x - 80,
        y: player.y - 10,
        width: 80,
        height: player.height + 20
    };

    for (let h = 0; h < hits; h++) {
        setTimeout(() => {
            for (const monster of game.monsters) {
                if (!monster.isDead && attackBox.x < monster.x + monster.width && attackBox.x + attackBox.width > monster.x &&
                    attackBox.y < monster.y + monster.height && attackBox.y + attackBox.height > monster.y) {
                    monster.takeDamage(damage, Math.random() * 100 < player.critChance);
                }
            }
        }, h * 100);
    }
}

export function performAssassinate(damage, backstab) {
    game.effects.push(new Effect('assassinate', player.x + player.width/2, player.y + player.height/2, player.direction, { maxFrames: 30 }));

    const attackBox = {
        x: player.direction === 1 ? player.x + player.width : player.x - 100,
        y: player.y - 10,
        width: 100,
        height: player.height + 20
    };

    setTimeout(() => {
        for (const monster of game.monsters) {
            if (!monster.isDead && attackBox.x < monster.x + monster.width && attackBox.x + attackBox.width > monster.x &&
                attackBox.y < monster.y + monster.height && attackBox.y + attackBox.height > monster.y) {
                monster.takeDamage(damage, Math.random() * 100 < player.critChance, backstab);
            }
        }
    }, 200);
}

export function performDoubleShot(damage, arrows, spread) {
    game.effects.push(new Effect('doubleShot', player.x + player.width/2, player.y + player.height/2, player.direction, { maxFrames: 15 }));

    const piercing = player.buffs.soul && player.buffs.soul.duration > 0;
    for (let i = 0; i < arrows; i++) {
        setTimeout(() => {
            const offsetY = (i - (arrows-1)/2) * 15;
            const vy = spread ? (i - (arrows-1)/2) * 3 : 0;
            game.projectiles.push(new Projectile(
                player.x + (player.direction === 1 ? player.width : 0),
                player.y + player.height/2 + offsetY,
                player.direction, damage, 'arrow', piercing, vy
            ));
        }, i * 80);
    }
}

export function performArrowRain(damage) {
    const startX = Math.max(0, player.x - 200);
    const width = 400;

    game.effects.push(new Effect('arrowRain', player.x, player.y, player.direction, {
        maxFrames: 60,
        startX: startX,
        width: width,
        groundY: 480
    }));

    // 시간차 데미지
    for (let i = 0; i < 15; i++) {
        const delay = (i / 15) * 600 + 300;
        const x = startX + (i / 15) * width;
        setTimeout(() => {
            for (const monster of game.monsters) {
                if (!monster.isDead && Math.abs(monster.x + monster.width/2 - x) < 40) {
                    monster.takeDamage(damage, Math.random() * 100 < player.critChance);
                }
            }
        }, delay);
    }
}
