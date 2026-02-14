import { JOBS } from '../../../data/jobs.js';

// ──────────────── 플랫폼 레이아웃 ────────────────
const PLATFORMS = [
    { x: 0,   y: 500, w: 1000, h: 100 },   // 지면
    { x: 150, y: 400, w: 150,  h: 20  },
    { x: 420, y: 350, w: 160,  h: 20  },
    { x: 700, y: 400, w: 150,  h: 20  },
    { x: 50,  y: 280, w: 120,  h: 20  },
    { x: 550, y: 250, w: 120,  h: 20  },
    { x: 820, y: 280, w: 120,  h: 20  },
];

// 몬스터 타입 정의
const MONSTER_TYPES = {
    slime:   { name: '슬라임',       color: 0x44ff44, w: 36, h: 30, hpMult: 1.0, atkMult: 0.8, expMult: 1.0, mesoMult: 1 },
    mushroom:{ name: '버섯',         color: 0xff4422, w: 40, h: 50, hpMult: 1.4, atkMult: 1.0, expMult: 1.4, mesoMult: 2 },
    stump:   { name: '나무토막',     color: 0xaa7744, w: 38, h: 55, hpMult: 2.0, atkMult: 1.2, expMult: 2.0, mesoMult: 3 },
    fireBug: { name: '불타는 버그',  color: 0xff6600, w: 44, h: 35, hpMult: 2.8, atkMult: 1.5, expMult: 3.0, mesoMult: 4 },
    rockWhale:{ name: '바위 고래',   color: 0x8899aa, w: 70, h: 50, hpMult: 5.0, atkMult: 2.0, expMult: 6.0, mesoMult: 8 },
    dragon:  { name: '고대 드래곤',  color: 0x8844ff, w: 80, h: 65, hpMult: 10.0, atkMult: 3.0, expMult: 15.0, mesoMult: 20 },
};

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    init(data) {
        this.selectedJob = data.job || 'warrior';
    }

    create() {
        this.cameras.main.setBackgroundColor('#1a1a3e');

        // ── 게임 상태 초기화 ──
        this.initState();

        // ── 배경 그리기 ──
        this.createBackground();

        // ── 물리 월드 경계 명시 설정 ──
        this.physics.world.setBounds(0, 0, 1000, 600);

        // ── 플랫폼 생성 (staticGroup 사용) ──
        this.platformGroup = this.physics.add.staticGroup();
        this.createPlatforms();

        // ── 플레이어 생성 ──
        this.createPlayer();

        // ── 몬스터 그룹 ──
        this.monsterGroup = this.add.group();

        // ── 충돌 설정 ──
        this.physics.add.collider(this.playerBody, this.platformGroup);

        // ── 입력 설정 ──
        this.setupInput();

        // ── 타이머: 몬스터 스폰 ──
        this.monsterSpawnTimer = this.time.addEvent({
            delay: 2500,
            callback: this.spawnMonster,
            callbackScope: this,
            loop: true
        });

        // ── 렌더링용 그래픽스 레이어 ──
        this.drawLayer = this.add.graphics();
        this.drawLayer.setDepth(10);
        this.uiLayer   = this.add.graphics();   // 추가 UI 그래픽
        this.uiLayer.setDepth(11);

        // ── 스타 배경 데이터 (정적) ──
        this.stars = Array.from({ length: 60 }, (_, i) => ({
            x: (i * 137 + 41) % 1000,
            y: (i * 97  + 23) % 490,
            r: (i % 3) + 1,
            phase: Math.random() * Math.PI * 2
        }));

        // ── HUD 씬에 초기 데이터 전달 ──
        this.scene.launch('HUDScene', { gameScene: this });

        // ── 초기 몬스터 즉시 스폰 ──
        this.time.delayedCall(500, this.spawnMonster, [], this);

        console.log('[GameScene] Started with job:', this.selectedJob);

    }

    // ──────────────────────────────────────────────────────────
    //  상태 초기화
    // ──────────────────────────────────────────────────────────
    initState() {
        const job = JOBS[this.selectedJob];
        this.ps = {   // player state
            job: this.selectedJob,
            tier: 0,
            hp: job.baseHp, maxHp: job.baseHp,
            mp: job.baseMp, maxMp: job.baseMp,
            level: 1,
            attack: job.baseAttack,
            critChance: job.critChance,
            exp: 0, expToLevel: 100,
            kills: 0,
            meso: 0,
            invincible: 0,
            attackCooldown: 0,
            skillCooldowns: [0, 0, 0],
            buffs: {},
            direction: 1,
            isAttacking: false,
            trail: [],
            critCount: 0,
            playFrames: 0,
        };
        this.gs = {   // game state
            combo: 0,
            lastHitTime: 0,
            hitStop: 0,
            paused: false,
            gameOver: false,
        };
        this.monsters = [];
        this.activeEffects = [];
        this.particles = [];
        this.chatMessages = [];
        this.projectiles = [];
        this.monsterNameTexts = new Map();  // id → Text 오브젝트 풀
    }

    // ──────────────────────────────────────────────────────────
    //  배경 (정적 드로잉, create 시 1회)
    // ──────────────────────────────────────────────────────────
    createBackground() {
        // 배경은 별도 레이어에 1회만 그림 (drawLayer와 분리해 fillGradientStyle 혼용 버그 방지)
        this.bgLayer = this.add.graphics();
        this.bgLayer.setDepth(-1);
        this.bgLayer.fillGradientStyle(0x1a1a3e, 0x1a1a3e, 0x2a2a5e, 0x2a2a5e, 1);
        this.bgLayer.fillRect(0, 0, 1000, 600);
    }

    // ──────────────────────────────────────────────────────────
    //  플랫폼 생성
    // ──────────────────────────────────────────────────────────
    createPlatforms() {
        PLATFORMS.forEach(p => {
            // 시각적 표현 (Graphics로 그리기)
            const g = this.add.graphics();
            g.fillStyle(0x3a6b3a, 1);
            g.fillRect(p.x, p.y, p.w, p.h);
            g.fillStyle(0x4a7c4a, 1);
            g.fillRect(p.x, p.y, p.w, 8);
            if (p.h <= 20) {
                g.fillStyle(0x5a9a5a, 1);
                for (let gx = p.x; gx < p.x + p.w; gx += 12) {
                    g.fillTriangle(gx, p.y, gx + 6, p.y - 6, gx + 12, p.y);
                }
            }

            // 물리 바디: staticGroup.create() — 텍스처가 1×1이므로 body.setSize()로 명시 지정
            const img = this.platformGroup.create(p.x + p.w / 2, p.y + p.h / 2, 'pixel');
            img.setDisplaySize(p.w, p.h);
            img.body.setSize(p.w, p.h);   // ← 필수: 1×1 기본값 → 실제 크기로 교체
            img.refreshBody();
            img.setAlpha(0);
        });
    }

    // ──────────────────────────────────────────────────────────
    //  플레이어 생성
    // ──────────────────────────────────────────────────────────
    createPlayer() {
        // setDisplaySize를 사용하면 DynamicBody.setSize가 scaleX/Y를 곱해
        // body 크기가 40*40=1600, 60*60=3600이 되는 버그 발생.
        // 플레이어는 setAlpha(0)으로 투명하므로 setDisplaySize 불필요.
        // scale=1 상태에서 setSize(40,60) → body 정확히 40×60으로 설정됨.
        this.playerBody = this.physics.add.image(200, 420, 'pixel');
        this.playerBody.body.setSize(40, 60);
        this.playerBody.body.setMaxVelocityY(1800);
        this.playerBody.setAlpha(0);
        this.playerBody.setCollideWorldBounds(true);
    }

    // ──────────────────────────────────────────────────────────
    //  입력 설정
    // ──────────────────────────────────────────────────────────
    setupInput() {
        const kb = this.input.keyboard;
        this.keys = {
            left:  kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
            right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
            up:    kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
            space: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
            w:     kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            d:     kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            a:     kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            z:     kb.addKey(Phaser.Input.Keyboard.KeyCodes.Z),
            x:     kb.addKey(Phaser.Input.Keyboard.KeyCodes.X),
            c:     kb.addKey(Phaser.Input.Keyboard.KeyCodes.C),
            esc:   kb.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
            p:     kb.addKey(Phaser.Input.Keyboard.KeyCodes.P),
            i:     kb.addKey(Phaser.Input.Keyboard.KeyCodes.I),
            s:     kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            r:     kb.addKey(Phaser.Input.Keyboard.KeyCodes.R),
        };

        // 1회성 키 (just pressed)
        this.input.keyboard.on('keydown-ESC', () => this.togglePause());
        this.input.keyboard.on('keydown-P',   () => this.togglePause());
        this.input.keyboard.on('keydown-Z',   () => this.useSkill(0));
        this.input.keyboard.on('keydown-X',   () => this.useSkill(1));
        this.input.keyboard.on('keydown-C',   () => this.useSkill(2));
        this.input.keyboard.on('keydown-A',   () => this.basicAttack());
    }

    // ──────────────────────────────────────────────────────────
    //  메인 루프
    // ──────────────────────────────────────────────────────────
    update(time, delta) {
        if (this.gs.gameOver) return;
        if (this.gs.paused) {
            this.drawAll(time);  // 정지 화면만 렌더링
            this.updateHUD();
            return;
        }

        this.ps.playFrames++;

        // 히트스톱 (프레임 스킵)
        if (this.gs.hitStop > 0) {
            this.gs.hitStop--;
            this.drawAll(time);
            return;
        }

        // 콤보 리셋 (1.2초 이상 히트 없을 시)
        if (this.gs.combo > 0 && time - this.gs.lastHitTime > 1200) {
            this.gs.combo = 0;
        }

        // 쿨다운 감소 (프레임 기반 → delta 기반으로 변환)
        const dt = delta / (1000 / 60);  // 60fps 기준 프레임 수
        if (this.ps.attackCooldown > 0) this.ps.attackCooldown -= dt;
        for (let i = 0; i < 3; i++) {
            if (this.ps.skillCooldowns[i] > 0) this.ps.skillCooldowns[i] -= dt;
        }
        if (this.ps.invincible > 0) this.ps.invincible -= dt;

        // 버프 업데이트
        this.updateBuffs(dt);

        // MP 자동 회복
        if (this.ps.mp < this.ps.maxMp) {
            this.ps.mp = Math.min(this.ps.maxMp, this.ps.mp + 0.05 * dt);
        }

        // 플레이어 이동
        this.updateMovement();

        // 몬스터 업데이트
        this.updateMonsters(time, delta);

        // 파티클 업데이트
        this.updateParticles(dt);

        // 이펙트 업데이트
        for (let i = this.activeEffects.length - 1; i >= 0; i--) {
            this.activeEffects[i].frame += dt;
            if (this.activeEffects[i].frame >= this.activeEffects[i].maxFrames) {
                this.activeEffects.splice(i, 1);
            }
        }

        // 프로젝타일 업데이트
        this.updateProjectiles(delta / (1000 / 60));

        // 레벨업 체크
        this.checkLevelUp();

        // 렌더링
        this.drawAll(time);

        // HUD 업데이트
        this.updateHUD();
    }

    // ──────────────────────────────────────────────────────────
    //  이동 처리
    // ──────────────────────────────────────────────────────────
    updateMovement() {
        const job = JOBS[this.ps.job];
        let spd = job.speed;
        if (this.ps.buffs.haste)     spd *= this.ps.buffs.haste.speedBonus     || 1.5;
        if (this.ps.buffs.swiftness) spd *= this.ps.buffs.swiftness.speedBonus || 1.8;
        const velX = spd * 50;  // px/s

        const body = this.playerBody;
        const onGround = body.body.blocked.down;

        let moving = false;
        if (this.keys.left.isDown) {
            body.setVelocityX(-velX);
            this.ps.direction = -1;
            moving = true;
        } else if (this.keys.right.isDown || this.keys.d.isDown) {
            body.setVelocityX(velX);
            this.ps.direction = 1;
            moving = true;
        } else {
            body.setVelocityX(0);
        }

        // 점프
        if ((this.keys.up.isDown || this.keys.space.isDown || this.keys.w.isDown) && onGround) {
            const jumpVel = Math.abs(job.jumpPower) * 54;
            body.setVelocityY(-jumpVel);
        }

        // 헤이스트 트레일
        if (this.ps.buffs.haste || this.ps.buffs.swiftness) {
            this.ps.trail.unshift({ x: body.x, y: body.y });
            if (this.ps.trail.length > 5) this.ps.trail.pop();
        } else {
            this.ps.trail = [];
        }

        // 월드 경계 수동 클램프
        if (body.x < 20) { body.x = 20; body.setVelocityX(0); }
        if (body.x > 980) { body.x = 980; body.setVelocityX(0); }
    }

    // ──────────────────────────────────────────────────────────
    //  버프 업데이트
    // ──────────────────────────────────────────────────────────
    updateBuffs(dt) {
        for (const [name, buff] of Object.entries(this.ps.buffs)) {
            buff.duration -= dt;
            // 성스러운 빛: 초당 HP 회복
            if (name === 'holyLight' && this.ps.playFrames % 60 < dt + 1) {
                const heal = Math.floor(buff.healPerSec || 5);
                this.ps.hp = Math.min(this.ps.maxHp, this.ps.hp + heal);
                this.showFloatText(this.playerBody.x, this.playerBody.y - 30,
                    `+${heal} HP`, '#44ff44');
            }
            if (buff.duration <= 0) {
                // 날카로운 눈 만료 시 크리티컬 복구
                if (name === 'keenEyes' && buff.critBonus) {
                    this.ps.critChance -= buff.critBonus;
                }
                delete this.ps.buffs[name];
            }
        }
    }

    // ──────────────────────────────────────────────────────────
    //  몬스터 스폰
    // ──────────────────────────────────────────────────────────
    spawnMonster() {
        if (this.gs.gameOver || this.gs.paused) return;
        const lv = this.ps.level;
        let type;
        if (lv < 6)       type = 'slime';
        else if (lv < 11) type = 'mushroom';
        else if (lv < 15) type = 'stump';
        else if (lv < 35) type = 'fireBug';
        else if (lv < 60) type = 'rockWhale';
        else              type = 'dragon';

        const mt = MONSTER_TYPES[type];
        const side = Math.random() > 0.5;
        const spawnX = side ? 20 + Math.random() * 100 : 880 + Math.random() * 100;

        const baseHp = 30 + lv * 10;
        const baseAtk = 5 + lv * 2;
        const m = {
            id: Date.now() + Math.random(),
            type, mt,
            x: spawnX, y: -60,
            vx: 0, vy: 0,
            w: mt.w, h: mt.h,
            hp: Math.floor(baseHp * mt.hpMult),
            maxHp: Math.floor(baseHp * mt.hpMult),
            atk: Math.floor(baseAtk * mt.atkMult),
            exp: Math.floor((15 + lv * 3) * mt.expMult),
            meso: Math.floor((5 + lv) * mt.mesoMult),
            dead: false,
            animFrame: 0,
            invincible: 0,
            aggroed: false,
        };
        this.monsters.push(m);
    }

    // ──────────────────────────────────────────────────────────
    //  몬스터 업데이트 (AI + 물리)
    // ──────────────────────────────────────────────────────────
    updateMonsters(time, delta) {
        const dt = delta / (1000 / 60);
        const G = 0.7;
        const px = this.playerBody.x;
        const py = this.playerBody.y;

        for (let i = this.monsters.length - 1; i >= 0; i--) {
            const m = this.monsters[i];
            if (m.dead) {
                this.monsters.splice(i, 1);
                continue;
            }
            m.animFrame += 0.12 * dt;
            if (m.invincible > 0) m.invincible -= dt;

            // 중력
            m.vy += G * dt;

            // AI: 플레이어 추적
            const dx = px - m.x;
            const dist = Math.abs(dx);
            if (dist < 400) {
                m.aggroed = true;
            }
            if (m.aggroed) {
                const spd = 1.2 + this.ps.level * 0.03;
                m.vx += (dx > 0 ? 1 : -1) * spd * 0.15 * dt;
                m.vx = Math.max(-3.5, Math.min(3.5, m.vx)) * 0.95;
            }

            m.x += m.vx * dt;
            m.y += m.vy * dt;

            // 플랫폼 충돌
            let onPlatform = false;
            for (const p of PLATFORMS) {
                if (m.x - m.w / 2 < p.x + p.w && m.x + m.w / 2 > p.x &&
                    m.y + m.h / 2 > p.y && m.y + m.h / 2 - m.vy * dt <= p.y + 2) {
                    m.y = p.y - m.h / 2;
                    m.vy = 0;
                    onPlatform = true;
                }
            }

            // 경계 처리
            if (m.x < 0 || m.x > 1000) { m.vx *= -1; }
            if (m.y > 700) { m.dead = true; continue; }

            // 플레이어 공격 (접촉)
            if (this.ps.invincible <= 0) {
                const ddx = Math.abs(px - m.x);
                const ddy = Math.abs(py - m.y);
                if (ddx < (m.w / 2 + 22) && ddy < (m.h / 2 + 32)) {
                    const dmg = m.atk;
                    const reduction = this.ps.buffs.shieldCounter ? 0.5 :
                                      (this.ps.buffs.heroicWill ? 0.5 : 1.0);
                    this.ps.hp -= Math.floor(dmg * reduction);
                    this.ps.invincible = 60;
                    this.cameras.main.shake(150, 0.012);
                    this.showFloatText(px, py - 40, `-${Math.floor(dmg * reduction)}`, '#ff4444');

                    if (this.ps.hp <= 0) {
                        this.ps.hp = 0;
                        this.triggerGameOver();
                    }
                }
            }
        }
    }

    // ──────────────────────────────────────────────────────────
    //  파티클 업데이트
    // ──────────────────────────────────────────────────────────
    updateParticles(dt) {
        const G = 0.25;
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.vy += G * dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    // ──────────────────────────────────────────────────────────
    //  기본 공격
    // ──────────────────────────────────────────────────────────
    basicAttack() {
        if (this.gs.gameOver || this.gs.paused) return;
        if (this.ps.attackCooldown > 0) return;

        const job = JOBS[this.ps.job];
        const basic = job.basicAttack;
        this.ps.attackCooldown = basic.cooldown;
        this.ps.isAttacking = true;
        this.time.delayedCall(basic.animDuration || 150, () => { this.ps.isAttacking = false; });

        let atkMult = 1;
        if (this.ps.buffs.rage)      atkMult *= this.ps.buffs.rage.attackBonus      || 1.5;
        if (this.ps.buffs.holyLight) atkMult *= this.ps.buffs.holyLight.attackBonus || 1.2;
        if (this.ps.buffs.berserker) atkMult *= this.ps.buffs.berserker.attackBonus || 1.8;
        if (this.ps.buffs.heroicWill)atkMult *= this.ps.buffs.heroicWill.attackBonus|| 2.0;
        const dmg = this.ps.attack * basic.damage * atkMult;

        const cx = this.playerBody.x;
        const cy = this.playerBody.y;

        if (basic.type === 'sword') {
            this.addEffect('swordSlash', cx, cy, this.ps.direction, 15);
            const box = this.makeAttackBox(cx, cy, basic.range, 80);
            this.hitMonsters(box, dmg, true, 8, -4);
        } else if (basic.type === 'dagger') {
            this.addEffect('daggerSlash', cx, cy, this.ps.direction, 12);
            const box = this.makeAttackBox(cx, cy, basic.range, 70);
            for (let h = 0; h < (basic.hits || 2); h++) {
                this.time.delayedCall(h * 80, () => this.hitMonsters(box, dmg, false, 0, 0));
            }
        } else if (basic.type === 'arrow') {
            this.addEffect('arrowTrail', cx, cy, this.ps.direction, 10);
            this.fireProjectile(cx, cy, dmg, 0);
        }
    }

    // ──────────────────────────────────────────────────────────
    //  스킬 사용
    // ──────────────────────────────────────────────────────────
    useSkill(idx) {
        if (this.gs.gameOver || this.gs.paused) return;
        if (this.ps.skillCooldowns[idx] > 0) return;

        const job = JOBS[this.ps.job];
        const tier = job.tiers[this.ps.tier];
        const skill = tier.skills[idx];
        if (!skill) return;
        if (this.ps.mp < skill.mp) {
            this.showFloatText(this.playerBody.x, this.playerBody.y - 30, 'MP 부족!', '#4488ff');
            return;
        }

        this.ps.mp -= skill.mp;
        this.ps.skillCooldowns[idx] = skill.cooldown;
        this.ps.isAttacking = true;
        this.time.delayedCall(200, () => { this.ps.isAttacking = false; });

        let atkMult = 1;
        if (this.ps.buffs.rage)      atkMult *= this.ps.buffs.rage.attackBonus       || 1.5;
        if (this.ps.buffs.holyLight) atkMult *= this.ps.buffs.holyLight.attackBonus  || 1.2;
        if (this.ps.buffs.berserker) atkMult *= this.ps.buffs.berserker.attackBonus  || 1.8;
        if (this.ps.buffs.heroicWill)atkMult *= this.ps.buffs.heroicWill.attackBonus || 2.0;
        const baseDmg = this.ps.attack * skill.damage * atkMult;

        const cx = this.playerBody.x;
        const cy = this.playerBody.y;

        // 스킬명 표시
        this.showFloatText(cx, cy - 50, skill.name, JOBS[this.ps.job].color, false, true);

        this.execSkill(skill, baseDmg, cx, cy);
    }

    execSkill(skill, dmg, cx, cy) {
        // 버프 스킬 처리
        if (skill.buff) {
            this.ps.buffs[skill.buff] = { ...skill, duration: skill.duration };
            if (skill.buff === 'keenEyes' && skill.critBonus) {
                this.ps.critChance += skill.critBonus;
            }
            const buffFx = {
                rage: 'rageActivate', berserker: 'rageActivate', heroicWill: 'rageActivate',
                haste: 'hasteActivate', swiftness: 'hasteActivate', shadowShift: 'hasteActivate', darkClone: 'hasteActivate',
                soul: 'soulActivate', keenEyes: 'soulActivate', archerSoul: 'soulActivate',
                holyLight: 'holyLightActivate', natureBless: 'holyLightActivate',
            };
            this.addEffect(buffFx[skill.buff] || 'rageActivate', cx, cy, this.ps.direction, 40);
            this.addBurstParticles(cx, cy, 0xffffff, 15);
            return;
        }

        const dir = this.ps.direction;
        switch (skill.type) {
            case 'powerStrike':
            case 'powerStrikePlus':
            case 'darkStrike':
            case 'heroStrike': {
                const mult = skill.type === 'darkStrike' ? 1.3 : skill.type === 'heroStrike' ? 1.7 : 1.0;
                this.addEffect('powerStrike', cx, cy, dir, 25);
                const box = this.makeAttackBox(cx, cy, 120, 100);
                this.hitMonsters(box, dmg * mult, true, 20, -10);
                if (skill.shockwave) {
                    this.time.delayedCall(100, () => {
                        const box2 = this.makeAttackBox(cx, cy, 200, 120);
                        this.hitMonsters(box2, dmg * 0.5, false, 5, -5);
                    });
                }
                break;
            }
            case 'slashBlast':
            case 'bloodBlade':
            case 'giantRampage': {
                this.addEffect('slashBlast', cx, cy, dir, 30);
                const range = skill.range || 150;
                this.hitMonstersRadius(cx, cy, range, dmg);
                break;
            }
            case 'shieldCounter': {
                this.addEffect('shieldCounter', cx, cy, dir, 25);
                this.ps.buffs.shieldCounter = { duration: skill.duration || 300, icon: '🛡️', damageReduction: 0.5 };
                const box = this.makeAttackBox(cx, cy, 100, 80);
                this.time.delayedCall(200, () => this.hitMonsters(box, dmg, false, 12, -6));
                break;
            }
            case 'doubleStab':
            case 'poisonStab': {
                this.addEffect('doubleStab', cx, cy, dir, 25);
                const box = this.makeAttackBox(cx, cy, 80, 70);
                const hits = skill.hits || 3;
                for (let h = 0; h < hits; h++) {
                    this.time.delayedCall(h * 100, () => this.hitMonsters(box, dmg, false, 0, 0));
                }
                break;
            }
            case 'quadStab':
            case 'hundredDaggers': {
                this.addEffect('quadStab', cx, cy, dir, 30);
                const box = this.makeAttackBox(cx, cy, 80, 70);
                const hits = skill.hits || 4;
                for (let h = 0; h < hits; h++) {
                    this.time.delayedCall(h * 80, () => this.hitMonsters(box, dmg, false, 0, 0));
                }
                break;
            }
            case 'assassinate':
            case 'deadlyBlow':
            case 'soulStrike': {
                this.addEffect('assassinate', cx, cy, dir, 30);
                const mult = skill.type === 'deadlyBlow' ? 1.3 : skill.type === 'soulStrike' ? 1.4 : 1.0;
                const box = this.makeAttackBox(cx, cy, 100, 70);
                this.time.delayedCall(200, () => this.hitMonsters(box, dmg * mult, true, 0, 0, true));
                break;
            }
            case 'stealthBackstab': {
                this.addEffect('stealthActivate', cx, cy, dir, 20);
                const box = this.makeAttackBox(cx, cy, 120, 70);
                this.time.delayedCall(300, () => {
                    this.addEffect('stealthBackstab', cx, cy, dir, 30);
                    this.hitMonsters(box, dmg, true, 0, 0, true);
                });
                break;
            }
            case 'doubleShot':
            case 'tripleShot':
            case 'windShot':
            case 'infiniteShot': {
                this.addEffect('doubleShot', cx, cy, dir, 15);
                const arrows = skill.arrows || 2;
                for (let i = 0; i < arrows; i++) {
                    this.time.delayedCall(i * 80, () => {
                        const oy = (i - (arrows - 1) / 2) * 18;
                        this.fireProjectile(cx, cy + oy, dmg, (i - (arrows - 1) / 2) * 100);
                    });
                }
                break;
            }
            case 'explosiveArrow': {
                this.addEffect('explosiveArrowCharge', cx, cy, dir, 15);
                this.fireProjectile(cx, cy, dmg, 0, true, skill.radius || 80);
                break;
            }
            case 'arrowRain':
            case 'enhancedRain':
            case 'allDayRain': {
                const mult = skill.type === 'enhancedRain' ? 1.5 : skill.type === 'allDayRain' ? 2.0 : 1.0;
                this.addEffect('arrowRain', cx, cy, dir, 60);
                const startX = Math.max(0, cx - 200);
                const width = 400;
                for (let i = 0; i < 15; i++) {
                    const delay = (i / 15) * 600 + 300;
                    const rx = startX + (i / 15) * width;
                    this.time.delayedCall(delay, () => {
                        this.hitMonstersNear(rx, dmg * mult, 40);
                    });
                }
                break;
            }
        }
    }

    // ──────────────────────────────────────────────────────────
    //  전투 유틸
    // ──────────────────────────────────────────────────────────
    makeAttackBox(cx, cy, w, h) {
        const dir = this.ps.direction;
        return {
            x: dir === 1 ? cx : cx - w,
            y: cy - h / 2,
            w, h
        };
    }

    hitMonsters(box, dmg, knockback = false, kvx = 0, kvy = 0, backstab = false) {
        for (const m of this.monsters) {
            if (m.dead || m.invincible > 0) continue;
            if (box.x < m.x + m.w / 2 && box.x + box.w > m.x - m.w / 2 &&
                box.y < m.y + m.h / 2 && box.y + box.h > m.y - m.h / 2) {
                this.dealDamage(m, dmg, backstab);
                if (knockback) { m.vx = this.ps.direction * kvx; m.vy = kvy; }
            }
        }
    }

    hitMonstersRadius(cx, cy, range, dmg) {
        for (const m of this.monsters) {
            if (m.dead || m.invincible > 0) continue;
            const dx = m.x - cx, dy = m.y - cy;
            if (Math.sqrt(dx * dx + dy * dy) < range) {
                this.dealDamage(m, dmg, false);
            }
        }
    }

    hitMonstersNear(rx, dmg, range) {
        for (const m of this.monsters) {
            if (m.dead || m.invincible > 0) continue;
            if (Math.abs(m.x - rx) < range) {
                this.dealDamage(m, dmg, false);
            }
        }
    }

    dealDamage(m, baseDmg, backstab = false) {
        const isCrit = Math.random() * 100 < this.ps.critChance;
        let dmg = baseDmg;
        if (isCrit) { dmg *= 1.5; this.ps.critCount++; }
        if (backstab) dmg *= 2;
        dmg = Math.floor(dmg);

        m.hp -= dmg;
        m.invincible = 10;
        this.gs.combo++;
        this.gs.lastHitTime = this.time.now;
        this.gs.hitStop = 3;

        // 대미지 텍스트
        const color = backstab ? '#ff44ff' : isCrit ? '#ffff00' : '#ffffff';
        this.showFloatText(m.x + (Math.random() - 0.5) * 30, m.y - m.h / 2 - 10,
            String(dmg), color, isCrit);
        if (isCrit) this.showFloatText(m.x, m.y - m.h / 2 - 40, 'CRITICAL!', '#ffff00', false, true);
        if (this.gs.combo >= 50 && this.gs.combo % 10 === 0) {
            this.showFloatText(m.x, m.y - m.h / 2 - 60, 'EXCELLENT!', '#ff44ff', false, true);
        }

        // 파티클
        this.addBurstParticles(m.x, m.y, isCrit ? 0xffff00 : 0xff8800, isCrit ? 15 : 8);

        // 화면 흔들림 (크리티컬)
        if (isCrit) this.cameras.main.shake(100, 0.008);

        // 사망 처리
        if (m.hp <= 0) {
            m.dead = true;
            this.ps.kills++;
            this.ps.exp += m.exp;
            this.ps.meso += m.meso;
            this.addEffect('monsterDie', m.x, m.y, 1, 20);
            this.showFloatText(m.x, m.y - m.h / 2 - 20, `+${m.exp} EXP`, '#ffff44');
            this.addBurstParticles(m.x, m.y, 0xffaa00, 20);
            // 이름 텍스트 정리
            const nt = this.monsterNameTexts.get(m.id);
            if (nt) { nt.destroy(); this.monsterNameTexts.delete(m.id); }
        }
    }

    fireProjectile(cx, cy, dmg, vyOffset, explosive = false, radius = 80) {
        const dir = this.ps.direction;
        const piercing = !!(this.ps.buffs.soul);
        this.projectiles.push({
            x: cx + dir * 22, y: cy,
            vx: dir * 14,
            vy: vyOffset / 60,
            dmg,
            dir,
            piercing,
            explosive,
            radius,
            dead: false,
            frame: 0,
        });
    }

    updateProjectiles(dt) {
        if (!this.projectiles) return;
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            if (proj.dead) { this.projectiles.splice(i, 1); continue; }

            proj.x += proj.vx * dt;
            proj.y += proj.vy * dt;
            proj.frame += dt;

            if (proj.x < 0 || proj.x > 1000 || proj.y < 0 || proj.y > 620 || proj.frame > 90) {
                proj.dead = true;
                continue;
            }

            // 몬스터 충돌
            for (const m of this.monsters) {
                if (m.dead || m.invincible > 0) continue;
                if (Math.abs(proj.x - m.x) < m.w / 2 + 8 && Math.abs(proj.y - m.y) < m.h / 2 + 8) {
                    if (proj.explosive) {
                        this.addEffect('explosion', proj.x, proj.y, 1, 25);
                        this.hitMonstersRadius(proj.x, proj.y, proj.radius, proj.dmg);
                    } else {
                        this.dealDamage(m, proj.dmg, false);
                    }
                    if (!proj.piercing) proj.dead = true;
                    break;
                }
            }
        }
    }

    // ──────────────────────────────────────────────────────────
    //  이펙트 시스템
    // ──────────────────────────────────────────────────────────
    addEffect(type, x, y, dir, maxFrames) {
        this.activeEffects.push({ type, x, y, dir, frame: 0, maxFrames: maxFrames || 20 });
    }

    addBurstParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 9,
                vy: (Math.random() - 0.5) * 9 - 3,
                life: 25 + Math.random() * 15,
                maxLife: 40,
                color,
                size: Math.random() * 5 + 2,
            });
        }
    }

    // ──────────────────────────────────────────────────────────
    //  레벨업 / 전직 체크
    // ──────────────────────────────────────────────────────────
    checkLevelUp() {
        while (this.ps.exp >= this.ps.expToLevel) {
            this.ps.exp -= this.ps.expToLevel;
            this.ps.level++;
            this.ps.expToLevel = Math.floor(100 * Math.pow(this.ps.level, 1.1));

            const job = JOBS[this.ps.job];
            this.ps.maxHp += job.hpPerLevel;
            this.ps.hp = Math.min(this.ps.hp + job.hpPerLevel, this.ps.maxHp);
            this.ps.maxMp += job.mpPerLevel;
            this.ps.mp = Math.min(this.ps.mp + job.mpPerLevel, this.ps.maxMp);
            this.ps.attack += job.attackPerLevel;

            // 레벨업 이펙트
            const cx = this.playerBody.x;
            const cy = this.playerBody.y;
            this.addEffect('levelUp', cx, cy, 1, 40);
            this.addBurstParticles(cx, cy, 0xffff00, 20);
            this.cameras.main.shake(200, 0.01);
            this.showFloatText(cx, cy - 60, 'LEVEL UP!', '#ffff00', false, true);

            // 전직 체크
            this.checkPromotion();
        }
    }

    checkPromotion() {
        const job = JOBS[this.ps.job];
        const nextTier = this.ps.tier + 1;
        if (nextTier >= job.tiers.length) return;
        const promo = job.promotionBonus[this.ps.tier];
        if (!promo || this.ps.level < promo.level) return;

        this.ps.tier = nextTier;
        this.ps.maxHp += promo.hp || 100;
        this.ps.hp = Math.min(this.ps.hp + (promo.hp || 100), this.ps.maxHp);
        this.ps.maxMp += promo.mp || 20;
        this.ps.mp = Math.min(this.ps.mp + (promo.mp || 20), this.ps.maxMp);
        this.ps.skillCooldowns = [0, 0, 0];

        const tier = job.tiers[this.ps.tier];
        const cx = this.playerBody.x;
        const cy = this.playerBody.y;
        this.addEffect('promotion', cx, cy, 1, 60);
        this.addBurstParticles(cx, cy, 0xffffff, 40);
        this.cameras.main.shake(400, 0.02);
        this.showFloatText(cx, cy - 80, `전직! ${tier.name}`, '#ffffff', false, true);

        this.addChatMessage(`✨ ${tier.name}(으)로 전직했습니다!`);
    }

    // ──────────────────────────────────────────────────────────
    //  부유 텍스트 (데미지, 힐, 스킬명 등)
    // ──────────────────────────────────────────────────────────
    showFloatText(x, y, text, color, isCrit = false, isBig = false) {
        const size = isBig ? '22px' : (isCrit ? '30px' : '18px');
        const style = {
            fontSize: size,
            fontFamily: 'Arial, sans-serif',
            color: color || '#ffffff',
            stroke: '#000000',
            strokeThickness: isCrit ? 4 : 3,
            fontStyle: 'bold',
        };
        const t = this.add.text(x, y, String(text), style).setOrigin(0.5, 1).setDepth(100);
        if (isCrit) t.setScale(1.3);

        this.tweens.add({
            targets: t,
            y: y - 70,
            alpha: 0,
            scaleX: isCrit ? 1.0 : 1,
            scaleY: isCrit ? 1.0 : 1,
            duration: isCrit ? 1200 : 900,
            ease: 'Power1',
            onComplete: () => t.destroy()
        });
    }

    // ──────────────────────────────────────────────────────────
    //  채팅 로그
    // ──────────────────────────────────────────────────────────
    addChatMessage(msg) {
        this.chatMessages.unshift({ text: msg, life: 600 });
        if (this.chatMessages.length > 5) this.chatMessages.pop();
    }

    // ──────────────────────────────────────────────────────────
    //  일시정지 / 게임오버
    // ──────────────────────────────────────────────────────────
    togglePause() {
        if (this.gs.gameOver) return;
        this.gs.paused = !this.gs.paused;
        if (this.gs.paused) {
            this.monsterSpawnTimer.paused = true;
        } else {
            this.monsterSpawnTimer.paused = false;
        }
    }

    triggerGameOver() {
        this.gs.gameOver = true;
        this.monsterSpawnTimer.paused = true;
        this.monsterNameTexts.forEach(t => t.destroy());
        this.monsterNameTexts.clear();
        this.cameras.main.shake(500, 0.03);
        this.time.delayedCall(800, () => {
            this.scene.launch('GameOverScene', {
                level: this.ps.level,
                kills: this.ps.kills,
                meso: this.ps.meso,
                playFrames: this.ps.playFrames,
                job: this.ps.job,
                tier: this.ps.tier,
            });
        });
    }

    // ──────────────────────────────────────────────────────────
    //  HUD 업데이트 (HUDScene에 데이터 전달)
    // ──────────────────────────────────────────────────────────
    updateHUD() {
        this.registry.set('hud', {
            hp: this.ps.hp, maxHp: this.ps.maxHp,
            mp: this.ps.mp, maxMp: this.ps.maxMp,
            exp: this.ps.exp, expToLevel: this.ps.expToLevel,
            level: this.ps.level,
            attack: this.ps.attack,
            critChance: this.ps.critChance,
            kills: this.ps.kills,
            meso: this.ps.meso,
            combo: this.gs.combo,
            buffs: this.ps.buffs,
            skillCooldowns: this.ps.skillCooldowns,
            job: this.ps.job,
            tier: this.ps.tier,
            paused: this.gs.paused,
            chatMessages: this.chatMessages,
        });
    }

    // ──────────────────────────────────────────────────────────
    //  전체 렌더링
    // ──────────────────────────────────────────────────────────
    drawAll(time) {
        const g = this.drawLayer;
        g.clear();

        // 별 (트윙클) — alpha 음수 방지 클램핑
        for (const star of this.stars) {
            const alpha = Math.max(0, 0.3 + 0.4 * Math.sin(time / 1000 + star.phase));
            g.fillStyle(0xffffff, alpha);
            g.fillCircle(star.x, star.y, star.r);
        }

        // 프로젝타일
        this.drawProjectiles(g);

        // 이펙트 (플레이어 뒤)
        for (const e of this.activeEffects) {
            const p = e.frame / e.maxFrames;
            this.drawEffect(g, e, p);
        }

        // 몬스터
        for (const m of this.monsters) {
            if (!m.dead) this.drawMonster(g, m, time);
        }

        // 플레이어
        try {
            this.drawPlayer(g, time);
        } catch (e) {
            if (!this._playerDrawError) {
                console.error('[drawPlayer ERROR]', e.message, e.stack);
                this._playerDrawError = true;
            }
            g.fillStyle(0xff0000, 1);
            g.fillCircle(this.playerBody?.x ?? 200, this.playerBody?.y ?? 300, 20);
        }

        // 파티클
        this.drawParticles(g);

        // 미니맵
        this.drawMinimap(g);

        // 콤보
        this.drawCombo(g, time);

        // 메소
        this.drawMesoCounter(g);

        // 일시정지 오버레이
        if (this.gs.paused) this.drawPauseOverlay(g);
    }

    // ──────────────────────────────────────────────────────────
    //  플레이어 렌더링
    // ──────────────────────────────────────────────────────────
    drawPlayer(g, time) {
        const bx = this.playerBody.x;
        const by = this.playerBody.y;
        const dir = this.ps.direction;
        const job = JOBS[this.ps.job];
        const colorHex = parseInt(job.color.replace('#', ''), 16);
        const isInvincible = this.ps.invincible > 0;

        // 무적 시 깜빡임
        if (isInvincible && Math.floor(this.ps.invincible / 5) % 2 === 0) return;

        // 헤이스트 트레일
        for (let i = 0; i < this.ps.trail.length; i++) {
            const t = this.ps.trail[i];
            const alpha = 0.2 - i * 0.04;
            g.fillStyle(colorHex, alpha);
            g.fillRect(t.x - 12, t.y - 25, 24, 50);
        }

        // 버프 오라
        if (this.ps.buffs.rage || this.ps.buffs.berserker || this.ps.buffs.heroicWill) {
            const r = 35 + Math.sin(time / 100) * 5;
            g.lineStyle(3, 0xff4400, 0.6);
            g.strokeCircle(bx, by, r);
        }
        if (this.ps.buffs.haste || this.ps.buffs.swiftness) {
            g.lineStyle(3, 0xaa44ff, 0.6);
            g.strokeCircle(bx, by, 35);
        }
        if (this.ps.buffs.soul || this.ps.buffs.archerSoul || this.ps.buffs.keenEyes) {
            g.lineStyle(3, 0x44ff88, 0.6);
            g.strokeCircle(bx, by, 35);
        }
        if (this.ps.buffs.holyLight || this.ps.buffs.natureBless) {
            const r = 38 + Math.sin(time / 120) * 4;
            g.lineStyle(3, 0xffffaa, 0.5);
            g.strokeCircle(bx, by, r);
        }

        // 그림자
        g.fillStyle(0x000000, 0.3);
        g.fillEllipse(bx, by + 30, 40, 10);

        // 몸통
        g.fillStyle(colorHex, 1);
        g.fillRect(bx - 12, by - 10, 24, 30);

        // 머리
        g.fillStyle(0xFFDEB3, 1);
        g.fillCircle(bx, by - 20, 15);

        // 눈
        g.fillStyle(0x000000, 1);
        g.fillCircle(bx + dir * 5, by - 21, 3);

        // 직업별 헤어/무기
        if (this.ps.job === 'warrior') {
            // 투구
            g.fillStyle(0x888888, 1);
            g.fillRect(bx - 16, by - 36, 32, 16);
            g.fillStyle(0xaaaaaa, 1);
            g.fillRect(bx - 16, by - 38, 32, 6);
            // 검
            if (this.ps.isAttacking) {
                const sx = bx + dir * 20;
                g.fillStyle(0xdddddd, 1);
                g.fillRect(sx - 3 + (dir === 1 ? 0 : -20), by - 25, 4, 35);
            }
        } else if (this.ps.job === 'thief') {
            // 스파이크 헤어
            g.fillStyle(0x222222, 1);
            for (let s = -1; s <= 1; s++) {
                g.fillTriangle(bx + s * 8, by - 35, bx + s * 8 - 5, by - 28, bx + s * 8 + 5, by - 28);
            }
            // 단검
            if (this.ps.isAttacking) {
                const dx2 = bx + dir * 22;
                g.fillStyle(0xcccccc, 1);
                g.fillRect(dx2 - 2 + (dir === 1 ? 0 : -12), by - 15, 3, 22);
            }
        } else if (this.ps.job === 'archer') {
            // 후드
            g.fillStyle(0x226644, 1);
            g.fillCircle(bx, by - 20, 16);
            g.fillStyle(0x226644, 1);
            g.fillRect(bx - 14, by - 34, 28, 14);
            // 활
            if (this.ps.isAttacking) {
                const ax = bx - dir * 16;
                g.lineStyle(3, 0x884400, 1);
                g.beginPath();
                g.arc(ax, by - 10, 18, -0.8, 0.8, false);
                g.strokePath();
            }
        }

        // 전직 단계 표시 (어깨 장식)
        if (this.ps.tier >= 2) {
            const auraColor = this.ps.tier >= 3 ? 0xffd700 : 0xaaaaff;
            g.fillStyle(auraColor, 0.8);
            g.fillCircle(bx - 14, by - 5, 5);
            g.fillCircle(bx + 14, by - 5, 5);
        }
    }

    // ──────────────────────────────────────────────────────────
    //  몬스터 렌더링
    // ──────────────────────────────────────────────────────────
    drawMonster(g, m, time) {
        const bounce = Math.sin(m.animFrame) * 3;
        const mx = m.x, my = m.y;
        const mt = m.mt;
        const col = mt.color;

        // HP 바
        if (m.hp < m.maxHp) {
            const bw = m.w + 10;
            g.fillStyle(0x333333, 1);
            g.fillRect(mx - bw / 2, my - m.h / 2 - 14, bw, 7);
            const hpRatio = m.hp / m.maxHp;
            const hpCol = hpRatio > 0.5 ? 0x44ff44 : hpRatio > 0.25 ? 0xffaa00 : 0xff2222;
            g.fillStyle(hpCol, 1);
            g.fillRect(mx - bw / 2, my - m.h / 2 - 14, Math.max(1, bw * hpRatio), 7);
        }

        // 무적 깜빡임
        if (m.invincible > 0 && Math.floor(m.invincible / 3) % 2 === 0) return;

        switch (m.type) {
            case 'slime': {
                g.fillStyle(0x44cc44, 0.8);
                g.fillEllipse(mx, my + bounce, m.w + Math.sin(m.animFrame) * 4, m.h - Math.sin(m.animFrame) * 4);
                g.fillStyle(0xffffff, 0.6);
                g.fillCircle(mx - 5, my - 5 + bounce, 6);
                g.fillStyle(0x000000, 0.8);
                g.fillCircle(mx - 6, my - 2 + bounce, 3);
                g.fillCircle(mx + 5, my - 2 + bounce, 3);
                break;
            }
            case 'mushroom': {
                // 줄기
                g.fillStyle(0xcc9966, 1);
                g.fillRect(mx - 12, my, 24, 25);
                // 모자
                g.fillStyle(0xdd3311, 1);
                g.fillEllipse(mx, my - 5 + bounce, m.w + 6, 30);
                g.fillStyle(0xffffff, 0.9);
                for (let d = -1; d <= 1; d++) g.fillCircle(mx + d * 13, my - 8 + bounce, 5);
                g.fillStyle(0x000000, 0.9);
                g.fillCircle(mx - 6, my + 10, 3);
                g.fillCircle(mx + 6, my + 10, 3);
                break;
            }
            case 'stump': {
                g.fillStyle(0xaa7744, 1);
                g.fillRect(mx - 19, my - m.h / 2, 38, m.h + bounce);
                g.fillStyle(0x884422, 1);
                for (let b = 0; b < 3; b++) g.fillRect(mx - 14, my - m.h / 2 + 10 + b * 16, 28, 4);
                g.fillStyle(0x000000, 0.8);
                g.fillCircle(mx - 7, my - m.h / 2 + 8, 4);
                g.fillCircle(mx + 7, my - m.h / 2 + 8, 4);
                break;
            }
            case 'fireBug': {
                g.fillStyle(0xff6600, 1);
                g.fillEllipse(mx, my + bounce, m.w, m.h - 4);
                // 불꽃
                for (let f = 0; f < 5; f++) {
                    const fx = mx + (f - 2) * 8;
                    const fh = 8 + Math.sin(m.animFrame + f) * 4;
                    g.fillStyle(0xff4400, 0.8);
                    g.fillTriangle(fx - 4, my - m.h / 2, fx, my - m.h / 2 - fh, fx + 4, my - m.h / 2);
                }
                g.fillStyle(0x000000, 0.9);
                g.fillCircle(mx - 8, my - 5 + bounce, 4);
                g.fillCircle(mx + 8, my - 5 + bounce, 4);
                break;
            }
            case 'rockWhale': {
                g.fillStyle(0x8899aa, 1);
                g.fillEllipse(mx, my + bounce / 2, m.w, m.h);
                g.fillStyle(0x6677aa, 1);
                g.fillRect(mx - 35 + (m.vx > 0 ? -10 : 10), my + 10 + bounce / 2, 20, 15);
                g.fillStyle(0x000000, 0.9);
                g.fillCircle(mx - 15, my - 10 + bounce / 2, 5);
                g.fillCircle(mx + 15, my - 10 + bounce / 2, 5);
                break;
            }
            case 'dragon': {
                // 몸통
                g.fillStyle(0x8844ff, 1);
                g.fillEllipse(mx, my + bounce / 2, m.w, m.h);
                // 날개
                g.fillStyle(0x6622dd, 0.7);
                g.fillTriangle(mx - 40, my - 10, mx - 20, my - 30, mx - 10, my);
                g.fillTriangle(mx + 40, my - 10, mx + 20, my - 30, mx + 10, my);
                // 뿔
                g.fillStyle(0x222222, 1);
                g.fillTriangle(mx - 20, my - m.h / 2, mx - 25, my - m.h / 2 - 20, mx - 15, my - m.h / 2);
                g.fillTriangle(mx + 20, my - m.h / 2, mx + 15, my - m.h / 2 - 20, mx + 25, my - m.h / 2);
                // 눈
                g.fillStyle(0xff0000, 1);
                g.fillCircle(mx - 20, my - m.h / 2 + 15, 7);
                g.fillCircle(mx + 20, my - m.h / 2 + 15, 7);
                break;
            }
        }

        // 이름 레이블 (풀에서 재사용)
        let nameTxt = this.monsterNameTexts.get(m.id);
        if (!nameTxt) {
            nameTxt = this.add.text(0, 0, mt.name, {
                fontSize: '11px', color: '#cccccc', stroke: '#000000', strokeThickness: 2
            }).setOrigin(0.5).setDepth(50);
            this.monsterNameTexts.set(m.id, nameTxt);
        }
        nameTxt.setPosition(mx, my - m.h / 2 - 18);
    }

    // ──────────────────────────────────────────────────────────
    //  이펙트 렌더링
    // ──────────────────────────────────────────────────────────
    drawEffect(g, e, p) {
        const { x, y, dir, type } = e;
        const inv = 1 - p;

        switch (type) {
            case 'swordSlash': {
                const r = 60 + p * 20;
                g.lineStyle(4 * inv, 0xffffff, 0.9 * inv);
                g.beginPath();
                g.arc(x, y, r, dir === 1 ? -0.4 : Math.PI + 0.4, dir === 1 ? 0.8 : Math.PI - 0.8, dir !== 1);
                g.strokePath();
                g.lineStyle(2 * inv, 0xffcc66, 0.7 * inv);
                g.beginPath();
                g.arc(x, y, r - 8, dir === 1 ? -0.3 : Math.PI + 0.3, dir === 1 ? 0.7 : Math.PI - 0.7, dir !== 1);
                g.strokePath();
                break;
            }
            case 'daggerSlash': {
                const r2 = 45 + p * 15;
                g.lineStyle(3 * inv, 0xaa44ff, 0.9 * inv);
                for (let k = 0; k < 3; k++) {
                    g.beginPath();
                    g.arc(x, y, r2 + k * 5, dir === 1 ? -0.2 + k * 0.1 : Math.PI + 0.2 - k * 0.1,
                        dir === 1 ? 0.5 + k * 0.1 : Math.PI - 0.5 - k * 0.1, dir !== 1);
                    g.strokePath();
                }
                break;
            }
            case 'powerStrike': {
                const sz = (40 + p * 60) * inv;
                g.fillStyle(0xffaa00, 0.5 * inv);
                g.fillCircle(x + dir * 30, y, sz / 2);
                g.lineStyle(5 * inv, 0xffff00, inv);
                for (let k = 0; k < 5; k++) {
                    const ang = (k / 5) * Math.PI * 2;
                    const r3 = sz / 2;
                    g.lineBetween(x + dir * 30, y, x + dir * 30 + Math.cos(ang) * r3, y + Math.sin(ang) * r3);
                }
                break;
            }
            case 'slashBlast': {
                const r4 = p * 150;
                g.lineStyle(6 * inv, 0x6688ff, 0.8 * inv);
                g.strokeCircle(x, y, r4);
                g.lineStyle(3 * inv, 0xaabbff, 0.5 * inv);
                g.strokeCircle(x, y, r4 * 0.7);
                break;
            }
            case 'doubleStab':
            case 'quadStab': {
                for (let k = 0; k < (type === 'quadStab' ? 4 : 3); k++) {
                    const kp = Math.max(0, p - k * 0.2);
                    const kl = 40 + kp * 20;
                    g.lineStyle(3 * (1 - kp), 0xaa44ff, (1 - kp) * 0.9);
                    g.lineBetween(x, y + k * 8 - 12, x + dir * kl, y + k * 8 - 12);
                }
                break;
            }
            case 'assassinate':
            case 'stealthBackstab': {
                g.fillStyle(0x440066, 0.4 * inv);
                g.fillCircle(x, y, 50 * p + 20);
                g.lineStyle(4 * inv, 0xff00ff, inv);
                g.lineBetween(x, y - 40, x + dir * 80 * p, y + 20);
                break;
            }
            case 'doubleShot':
            case 'arrowTrail': {
                g.lineStyle(3 * inv, 0xffcc44, inv);
                g.lineBetween(x, y, x + dir * (40 + p * 20), y);
                break;
            }
            case 'arrowRain': {
                for (let k = 0; k < 12; k++) {
                    const ax = e.x - 200 + k * 34;
                    const ay = 50 + p * 400;
                    g.lineStyle(2, 0xffcc44, (1 - p) * 0.8);
                    g.lineBetween(ax, ay - 30, ax, ay);
                    g.fillStyle(0xffcc44, (1 - p) * 0.8);
                    g.fillTriangle(ax - 4, ay, ax + 4, ay, ax, ay + 8);
                }
                break;
            }
            case 'explosion': {
                const er = 30 + p * 70;
                g.fillStyle(0xff6600, (1 - p) * 0.7);
                g.fillCircle(x, y, er);
                g.fillStyle(0xffff00, (1 - p) * 0.5);
                g.fillCircle(x, y, er * 0.6);
                break;
            }
            case 'rageActivate': {
                for (let k = 0; k < 8; k++) {
                    const ang = (k / 8) * Math.PI * 2 + p * Math.PI;
                    const r5 = 30 + p * 40;
                    g.lineStyle(3 * inv, 0xff4400, inv);
                    g.lineBetween(x, y, x + Math.cos(ang) * r5, y + Math.sin(ang) * r5);
                }
                break;
            }
            case 'hasteActivate': {
                for (let k = 0; k < 6; k++) {
                    const hy = y - k * 10 * p;
                    g.lineStyle(2 * inv, 0xaa44ff, inv);
                    g.lineBetween(x - 15, hy, x + 15, hy);
                }
                break;
            }
            case 'soulActivate': {
                const sr = 35 + p * 25;
                g.lineStyle(3 * inv, 0x44ff88, inv * 0.8);
                for (let k = 0; k < 5; k++) {
                    const sang = (k / 5) * Math.PI * 2 + p * Math.PI;
                    g.lineBetween(x, y, x + Math.cos(sang) * sr, y + Math.sin(sang) * sr);
                }
                break;
            }
            case 'holyLightActivate': {
                g.fillStyle(0xffff88, (1 - p) * 0.5);
                g.fillCircle(x, y, 50 + p * 30);
                g.lineStyle(4 * inv, 0xffffaa, inv);
                g.strokeCircle(x, y, 35 + p * 20);
                break;
            }
            case 'levelUp': {
                const lr = p * 60;
                g.lineStyle(5 * inv, 0xffff00, inv);
                g.strokeCircle(x, y, lr);
                g.fillStyle(0xffff00, inv * 0.3);
                g.fillCircle(x, y - 50 - p * 40, 20 * inv);
                break;
            }
            case 'promotion': {
                for (let k = 0; k < 12; k++) {
                    const pang = (k / 12) * Math.PI * 2 + p * 2;
                    const pr2 = 40 + p * 60;
                    g.lineStyle(4 * inv, 0xffffff, inv);
                    g.lineBetween(x, y, x + Math.cos(pang) * pr2, y + Math.sin(pang) * pr2);
                }
                break;
            }
            case 'critBurst': {
                const cr = p * 40;
                g.lineStyle(4 * inv, 0xffff00, inv);
                for (let k = 0; k < 8; k++) {
                    const ca = (k / 8) * Math.PI * 2;
                    g.lineBetween(x, y, x + Math.cos(ca) * cr, y + Math.sin(ca) * cr);
                }
                break;
            }
            case 'shieldCounter': {
                const bw2 = 50 * inv, bh2 = 60 * inv;
                g.lineStyle(4 * inv, 0x8888ff, inv);
                g.strokeRect(x - bw2 / 2, y - bh2 / 2, bw2, bh2);
                break;
            }
            case 'stealthActivate': {
                g.fillStyle(0x330044, 0.5 * inv);
                g.fillCircle(x, y, 40 * p + 10);
                break;
            }
            case 'monsterDie': {
                for (let k = 0; k < 6; k++) {
                    const da = (k / 6) * Math.PI * 2;
                    const dr = p * 50;
                    g.lineStyle(3 * inv, 0xffaa00, inv);
                    g.lineBetween(x, y, x + Math.cos(da) * dr, y + Math.sin(da) * dr);
                }
                break;
            }
        }
    }

    // ──────────────────────────────────────────────────────────
    //  프로젝타일 렌더링
    // ──────────────────────────────────────────────────────────
    drawProjectiles(g) {
        if (!this.projectiles) return;
        for (const proj of this.projectiles) {
            if (proj.dead) continue;
            if (proj.explosive) {
                g.fillStyle(0xff6600, 0.9);
                g.fillCircle(proj.x, proj.y, 8);
                g.fillStyle(0xffff00, 0.7);
                g.fillCircle(proj.x, proj.y, 4);
            } else {
                g.fillStyle(0xffcc44, 1);
                g.fillRect(proj.x - 10, proj.y - 2, 20, 4);
                g.fillStyle(0xffff88, 1);
                g.fillTriangle(proj.x + proj.dir * 10, proj.y, proj.x + proj.dir * 10 - proj.dir * 6, proj.y - 4, proj.x + proj.dir * 10 - proj.dir * 6, proj.y + 4);
            }
        }
    }

    // ──────────────────────────────────────────────────────────
    //  파티클 렌더링
    // ──────────────────────────────────────────────────────────
    drawParticles(g) {
        for (const p of this.particles) {
            const alpha = p.life / (p.maxLife || 40);
            g.fillStyle(p.color, alpha);
            g.fillCircle(p.x, p.y, p.size);
        }
    }

    // ──────────────────────────────────────────────────────────
    //  미니맵
    // ──────────────────────────────────────────────────────────
    drawMinimap(g) {
        const MX = 800, MY = 530, MW = 180, MH = 60;
        const scaleX = MW / 1000, scaleY = MH / 600;

        g.fillStyle(0x000000, 0.6);
        g.fillRect(MX, MY, MW, MH);
        g.lineStyle(1, 0x4466aa, 0.8);
        g.strokeRect(MX, MY, MW, MH);

        // 플랫폼
        g.fillStyle(0x3a6b3a, 1);
        for (const p of PLATFORMS) {
            g.fillRect(MX + p.x * scaleX, MY + p.y * scaleY, p.w * scaleX, Math.max(2, p.h * scaleY));
        }

        // 몬스터
        g.fillStyle(0xff2222, 1);
        for (const m of this.monsters) {
            if (!m.dead) g.fillCircle(MX + m.x * scaleX, MY + m.y * scaleY, 3);
        }

        // 플레이어
        g.fillStyle(0x44ff44, 1);
        g.fillCircle(MX + this.playerBody.x * scaleX, MY + this.playerBody.y * scaleY, 4);
    }

    // ──────────────────────────────────────────────────────────
    //  콤보 카운터
    // ──────────────────────────────────────────────────────────
    drawCombo(g, time) {
        if (this.gs.combo < 2) return;
        const pulse = 1 + Math.sin(time / 150) * 0.08;
        const col = this.gs.combo >= 50 ? 0xff2244 : this.gs.combo >= 20 ? 0xff8800 : 0xffffff;
        // 콤보 텍스트는 Phaser Text로 별도 처리가 되어 있어 여기서는 배경 박스만 그림
        g.fillStyle(0x000000, 0.4);
        g.fillRoundedRect(900 - 80, 140, 95, 50, 6);
    }

    drawMesoCounter(g) {
        g.fillStyle(0x000000, 0.4);
        g.fillRoundedRect(900 - 80, 200, 95, 35, 6);
    }

    // ──────────────────────────────────────────────────────────
    //  일시정지 오버레이
    // ──────────────────────────────────────────────────────────
    drawPauseOverlay(g) {
        g.fillStyle(0x000000, 0.5);
        g.fillRect(0, 0, 1000, 600);
        g.fillStyle(0x1a1a4a, 0.9);
        g.fillRoundedRect(350, 200, 300, 200, 16);
        g.lineStyle(2, 0x4466ff, 1);
        g.strokeRoundedRect(350, 200, 300, 200, 16);
    }
}
