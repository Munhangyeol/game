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

    // 크리티컬 시 "CRITICAL!" 텍스트 추가
    if (isCrit) {
        game.damageTexts.push({
            x: x + offsetX,
            y: y - 30,
            damage: 'CRITICAL!',
            color: '#ffff00',
            life: 40,
            vy: -1,
            isCritText: true
        });
    }

    // 고콤보 시 "EXCELLENT!" 텍스트 추가
    if (game.combo >= 50 && game.combo % 10 === 0) {
        game.damageTexts.push({
            x: x + offsetX,
            y: y - 50,
            damage: 'EXCELLENT!',
            color: '#ff44ff',
            life: 50,
            vy: -1.5,
            isComboText: true
        });
    }
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
    console.log(`[Attack] basicAttack called! game.started=${game.started}, player.job=${player.job}, cooldown=${player.attackCooldown}`);
    if (!game.started || player.attackCooldown > 0) return;

    if (!player.job) {
        console.error('[Attack] ERROR: No job selected!');
        return;
    }

    const job = JOBS[player.job];
    if (!job) {
        console.error(`[Attack] ERROR: Invalid job: ${player.job}`);
        return;
    }
    const basic = job.basicAttack;
    console.log(`[Attack] Attacking with ${player.job}, damage multiplier: ${basic.damage}`);
    let attackMultiplier = 1;
    if (player.buffs.rage) attackMultiplier *= player.buffs.rage.attackBonus;
    if (player.buffs.holyLight) attackMultiplier *= player.buffs.holyLight.attackBonus;
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
    const currentTier = job.tiers[player.tier];  // NEW: Get current tier
    const skill = currentTier.skills[skillIndex];  // MODIFIED: Use tier-based skill
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
    let attackMultiplier = 1;
    if (player.buffs.rage) attackMultiplier *= player.buffs.rage.attackBonus;
    if (player.buffs.holyLight) attackMultiplier *= player.buffs.holyLight.attackBonus;
    const baseDamage = player.attack * skill.damage * attackMultiplier;

    // 스킬 실행
    let skillExecuted = false;
    switch (skill.type) {
        case 'powerStrike':
            performPowerStrike(baseDamage);
            skillExecuted = true;
            break;
        case 'powerStrikePlus':
            performPowerStrikePlus(baseDamage);
            skillExecuted = true;
            break;
        case 'shieldCounter':
            performShieldCounter(baseDamage, skill.duration);
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
        case 'quadStab':
            performQuadStab(baseDamage, skill.hits);
            skillExecuted = true;
            break;
        case 'stealthBackstab':
            performStealthBackstab(baseDamage);
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
        case 'tripleShot':
            performTripleShot(baseDamage, skill.arrows, skill.spread);
            skillExecuted = true;
            break;
        case 'explosiveArrow':
            performExplosiveArrow(baseDamage, skill.radius);
            skillExecuted = true;
            break;
        case 'arrowRain':
            performArrowRain(baseDamage);
            skillExecuted = true;
            break;

        // Tier 2-3 Warrior Skills
        case 'darkStrike':
            performPowerStrikePlus(baseDamage * 1.3); // Stronger version
            skillExecuted = true;
            break;
        case 'bloodBlade':
            performSlashBlast(baseDamage, skill.range || 200);
            skillExecuted = true;
            break;
        case 'heroStrike':
            performPowerStrikePlus(baseDamage * 1.7); // Ultimate version
            skillExecuted = true;
            break;
        case 'giantRampage':
            performSlashBlast(baseDamage, skill.range || 250);
            skillExecuted = true;
            break;

        // Tier 2-3 Thief Skills
        case 'poisonStab':
            performQuadStab(baseDamage, skill.hits);
            skillExecuted = true;
            break;
        case 'deadlyBlow':
            performStealthBackstab(baseDamage * 1.3);
            skillExecuted = true;
            break;
        case 'hundredDaggers':
            performQuadStab(baseDamage, skill.hits);
            skillExecuted = true;
            break;
        case 'soulStrike':
            performStealthBackstab(baseDamage * 1.4);
            skillExecuted = true;
            break;

        // Tier 2-3 Archer Skills
        case 'windShot':
            performTripleShot(baseDamage, skill.arrows);
            skillExecuted = true;
            break;
        case 'enhancedRain':
            performArrowRain(baseDamage * 1.5);
            skillExecuted = true;
            break;
        case 'infiniteShot':
            performTripleShot(baseDamage, skill.arrows);
            skillExecuted = true;
            break;
        case 'allDayRain':
            performArrowRain(baseDamage * 2.0);
            skillExecuted = true;
            break;
    }

    if (skill.buff) {
        player.buffs[skill.buff] = { duration: skill.duration, icon: skill.icon, ...skill };

        // Apply immediate buff effects
        if (skill.buff === 'keenEyes' && skill.critBonus) {
            player.critChance += skill.critBonus;
        }

        const buffEffects = {
            rage: 'rageActivate',
            haste: 'hasteActivate',
            soul: 'soulActivate',
            holyLight: 'holyLightActivate',
            swiftness: 'hasteActivate',  // Reuse haste effect
            keenEyes: 'soulActivate',  // Reuse soul effect
            berserker: 'rageActivate',  // Tier 2 warrior
            heroicWill: 'rageActivate',  // Tier 3 warrior
            shadowShift: 'hasteActivate',  // Tier 2 thief
            darkClone: 'hasteActivate',  // Tier 3 thief
            natureBless: 'holyLightActivate',  // Tier 2 archer
            archerSoul: 'soulActivate'  // Tier 3 archer
        };
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

// Tier 1 Skills - Warrior
export function performPowerStrikePlus(damage) {
    game.effects.push(new Effect('powerStrikePlus', player.x + player.width/2, player.y + player.height/2, player.direction, { maxFrames: 30 }));

    const attackBox = {
        x: player.direction === 1 ? player.x + player.width - 20 : player.x - 120,
        y: player.y - 30,
        width: 140,
        height: player.height + 60
    };

    for (const monster of game.monsters) {
        if (!monster.isDead && attackBox.x < monster.x + monster.width && attackBox.x + attackBox.width > monster.x &&
            attackBox.y < monster.y + monster.height && attackBox.y + attackBox.height > monster.y) {
            monster.takeDamage(damage, Math.random() * 100 < player.critChance);
            monster.vx = player.direction * 20;
            monster.vy = -10;
        }
    }
}

export function performShieldCounter(damage, duration) {
    game.effects.push(new Effect('shieldCounter', player.x + player.width/2, player.y + player.height/2, player.direction, { maxFrames: 25 }));

    // Apply counter buff
    player.buffs.shieldCounter = { duration: duration, icon: '🛡️', damageReduction: 0.5 };

    // Delayed attack
    setTimeout(() => {
        const attackBox = {
            x: player.direction === 1 ? player.x + player.width - 10 : player.x - 90,
            y: player.y - 10,
            width: 100,
            height: player.height + 20
        };

        for (const monster of game.monsters) {
            if (!monster.isDead && attackBox.x < monster.x + monster.width && attackBox.x + attackBox.width > monster.x &&
                attackBox.y < monster.y + monster.height && attackBox.y + attackBox.height > monster.y) {
                monster.takeDamage(damage, Math.random() * 100 < player.critChance);
                monster.vx = player.direction * 12;
                monster.vy = -6;
            }
        }
    }, 200);
}

// Tier 1 Skills - Thief
export function performQuadStab(damage, hits) {
    game.effects.push(new Effect('quadStab', player.x + player.width/2, player.y + player.height/2, player.direction, { maxFrames: 30, hits: hits }));

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

export function performStealthBackstab(damage) {
    // Apply stealth effect
    game.effects.push(new Effect('stealthActivate', player.x + player.width/2, player.y + player.height/2, player.direction, { maxFrames: 20 }));

    // Delayed backstab
    setTimeout(() => {
        game.effects.push(new Effect('stealthBackstab', player.x + player.width/2, player.y + player.height/2, player.direction, { maxFrames: 30 }));

        const attackBox = {
            x: player.direction === 1 ? player.x + player.width : player.x - 120,
            y: player.y - 10,
            width: 120,
            height: player.height + 20
        };

        for (const monster of game.monsters) {
            if (!monster.isDead && attackBox.x < monster.x + monster.width && attackBox.x + attackBox.width > monster.x &&
                attackBox.y < monster.y + monster.height && attackBox.y + attackBox.height > monster.y) {
                monster.takeDamage(damage, Math.random() * 100 < player.critChance, true);  // backstab = true
            }
        }
    }, 300);
}

// Tier 1 Skills - Archer
export function performTripleShot(damage, arrows, spread) {
    game.effects.push(new Effect('tripleShot', player.x + player.width/2, player.y + player.height/2, player.direction, { maxFrames: 18 }));

    const piercing = player.buffs.soul && player.buffs.soul.duration > 0;
    for (let i = 0; i < arrows; i++) {
        setTimeout(() => {
            const offsetY = (i - (arrows-1)/2) * 18;
            const vy = spread ? (i - (arrows-1)/2) * 3 : 0;
            game.projectiles.push(new Projectile(
                player.x + (player.direction === 1 ? player.width : 0),
                player.y + player.height/2 + offsetY,
                player.direction, damage, 'arrow', piercing, vy
            ));
        }, i * 70);
    }
}

export function performExplosiveArrow(damage, radius) {
    game.effects.push(new Effect('explosiveArrowCharge', player.x + player.width/2, player.y + player.height/2, player.direction, { maxFrames: 15 }));

    // Create explosive projectile
    const projectile = new Projectile(
        player.x + (player.direction === 1 ? player.width : 0),
        player.y + player.height/2,
        player.direction,
        damage,
        'explosiveArrow',
        false
    );
    projectile.isExplosive = true;
    projectile.explosionRadius = radius;
    game.projectiles.push(projectile);
}
