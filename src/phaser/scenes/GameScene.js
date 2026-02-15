import { JOBS } from '../../../data/jobs.js';
import { ParallaxBackgroundSystem } from '../rendering/ParallaxBackgroundSystem.js';
import { AmbienceFxSystem } from '../rendering/AmbienceFxSystem.js';

// ???????????????? ?뚮옯???덉씠?꾩썐 ????????????????
const WORLD_WIDTH = 2000;

const PLATFORMS = [
    // ── 지면 (2000px 전체) ──
    { x: 0,    y: 500, w: 2000, h: 100 },

    // ── 왼쪽 구역 ──
    { x: 120,  y: 400, w: 160, h: 20 },
    { x: 380,  y: 330, w: 140, h: 20 },

    // ── 중간-왼 구역 ──
    { x: 680,  y: 420, w: 150, h: 20 },
    { x: 880,  y: 320, w: 130, h: 20 },

    // ── 중간 구역 ──
    { x: 1080, y: 380, w: 160, h: 20 },
    { x: 1280, y: 280, w: 130, h: 20 },

    // ── 중간-오 구역 ──
    { x: 1450, y: 420, w: 150, h: 20 },
    { x: 1650, y: 340, w: 140, h: 20 },

    // ── 오른쪽 구역 ──
    { x: 1820, y: 400, w: 160, h: 20 },
];

// 紐ъ뒪??????뺤쓽
const MONSTER_TYPES = {
    slime: { name: '슬라임', color: 0x44ff44, w: 36, h: 30, hpMult: 1.0, atkMult: 0.8, expMult: 1.0, mesoMult: 1 },
    mushroom: { name: '버섯', color: 0xff4422, w: 40, h: 50, hpMult: 1.4, atkMult: 1.0, expMult: 1.4, mesoMult: 2 },
    stump: { name: '나무 몬스터', color: 0xaa7744, w: 38, h: 55, hpMult: 2.0, atkMult: 1.2, expMult: 2.0, mesoMult: 3 },
    fireBug: { name: '불꽃 버그', color: 0xff6600, w: 44, h: 35, hpMult: 2.8, atkMult: 1.5, expMult: 3.0, mesoMult: 4 },
    rockWhale: { name: '바위 고래', color: 0x8899aa, w: 70, h: 50, hpMult: 5.0, atkMult: 2.0, expMult: 6.0, mesoMult: 8 },
    dragon: { name: '고룡', color: 0x8844ff, w: 80, h: 65, hpMult: 10.0, atkMult: 3.0, expMult: 15.0, mesoMult: 20 },
};

const DEFAULT_BACKGROUND_PROFILE = {
    quality: 'high',
    theme: 'dusk_forest',
    ambienceEnabled: true,
    parallaxStrength: 1,
};

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    init(data) {
        this.selectedJob = data.job || 'warrior';
    }

    getSkillDisplayName(skill) {
        const byType = {
            powerStrike: '파워 스트라이크',
            powerStrikePlus: '강화 타격',
            slashBlast: '슬래시 블래스트',
            shieldCounter: '실드 카운터',
            doubleStab: '더블 스탭',
            quadStab: '쿼드 스탭',
            assassinate: '어쌔시네이트',
            stealthBackstab: '스텔스 백스탭',
            doubleShot: '더블 샷',
            tripleShot: '트리플 샷',
            explosiveArrow: '폭발 화살',
            arrowRain: '애로우 레인',
        };
        const byBuff = {
            rage: '레이지',
            holyLight: '홀리 라이트',
            haste: '헤이스트',
            swiftness: '신속',
            soul: '소울 애로우',
            keenEyes: '명중의 눈',
        };
        if (!skill) return '스킬';
        return byType[skill.type] || byBuff[skill.buff] || skill.name || '스킬';
    }

    getTierDisplayName(jobId, tier) {
        const names = {
            warrior: ['전사', '기사', '버서커', '히어로'],
            thief: ['도적', '로그', '나이트', '섀도우'],
            archer: ['궁수', '헌터', '레인저', '보우마스터'],
        };
        return (names[jobId] && names[jobId][tier]) || `${jobId} ${tier}`;
    }

    create() {
        this.cameras.main.setBackgroundColor('#1a1a3e');
        this.backgroundProfile = { ...DEFAULT_BACKGROUND_PROFILE };
        this.cheats = { godMode: false };
        this.skillHoldNextFireAt = [0, 0, 0];

        // ?? 寃뚯엫 ?곹깭 珥덇린????
        this.initState();

        // ?? 諛곌꼍 洹몃━湲???
        this.createBackground();

        // ?? 臾쇰━ ?붾뱶 寃쎄퀎 紐낆떆 ?ㅼ젙 ??
        this.physics.world.setBounds(0, 0, WORLD_WIDTH, 600);

        // ?? ?뚮옯???앹꽦 (staticGroup ?ъ슜) ??
        this.platformGroup = this.physics.add.staticGroup();
        this.createPlatforms();

        // ?? ?뚮젅?댁뼱 ?앹꽦 ??
        this.createPlayer();

        // 카메라 추종 (2000px 월드 스크롤)
        this.cameras.main.setBounds(0, 0, WORLD_WIDTH, 600);
        this.cameras.main.startFollow(this.playerBody, true, 0.12, 0.12);

        // ?? 紐ъ뒪??洹몃９ ??
        this.monsterGroup = this.add.group();

        // ?? 異⑸룎 ?ㅼ젙 ??
        this.physics.add.collider(this.playerBody, this.platformGroup);

        // ?? ?낅젰 ?ㅼ젙 ??
        this.setupInput();

        // ?? ??대㉧: 紐ъ뒪???ㅽ룿 ??
        this.monsterSpawnTimer = this.time.addEvent({
            delay: 2500,
            callback: this.spawnMonster,
            callbackScope: this,
            loop: true
        });

        // ?? ?뚮뜑留곸슜 洹몃옒?쎌뒪 ?덉씠????
        this.drawLayer = this.add.graphics();
        this.drawLayer.setDepth(10);
        this.uiLayer   = this.add.graphics();
        this.uiLayer.setDepth(11);
        this.uiLayer.setScrollFactor(0);
        // ADD blend FX layer for glow effects
        this.fxLayer = this.add.graphics();
        this.fxLayer.setDepth(12);
        this.fxLayer.setBlendMode(Phaser.BlendModes.ADD);
        this.setupBackgroundProfileListener();
        this.setupCheatListener();
        this.events.once('shutdown', this.handleSceneShutdown, this);
        this.events.once('destroy', this.handleSceneShutdown, this);

        // ?? DOM HUD??gameHudUpdate CustomEvent濡??낅뜲?댄듃????

        // ?? 珥덇린 紐ъ뒪??利됱떆 ?ㅽ룿 ??
        this.time.delayedCall(500, this.spawnMonster, [], this);

        console.log('[GameScene] Started with job:', this.selectedJob);

    }

    // ??????????????????????????????????????????????????????????
    //  ?곹깭 珥덇린??    // ??????????????????????????????????????????????????????????
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
            capeSwingX: 0,  // 망토 끝점의 월드 X 오프셋 (Secondary Motion)
            hairSwingX: 0,  // 머리카락/깃털/후드 끝점의 월드 X 오프셋
            nextBlinkAt: 0, // 다음 눈 깜빡임 타임스탬프 (ms)
            blinkEndAt: 0,  // 눈 깜빡임 종료 타임스탬프 (ms)
            squashEndAt: 0, // 피격 Squash 종료 타임스탬프 (ms)
            squashDur: 150, // Squash 총 지속시간 (ms)
        };
        this.gs = {   // game state
            combo: 0,
            lastHitTime: 0,
            hitStop: 0,
            paused: false,
            gameOver: false,
            levelUpGlowStart: 0,
            levelUpGlowDur: 800,
        };
        this.monsters = [];
        this.activeEffects = [];
        this.particles = [];
        this.chatMessages = [];
        this.projectiles = [];
        this.playerSprite = null;
        this.monsterNameTexts = new Map();  // id ??Text ?ㅻ툕?앺듃 ?
    }

    // ??????????????????????????????????????????????????????????
    //  諛곌꼍 (?뺤쟻 ?쒕줈?? create ??1??
    // ??????????????????????????????????????????????????????????
    createBackground() {
        this.backgroundSystem = new ParallaxBackgroundSystem(this, {
            worldWidth: 1000,
            worldHeight: 600,
            quality: this.backgroundProfile.quality,
            theme: this.backgroundProfile.theme,
            parallaxStrength: this.backgroundProfile.parallaxStrength,
        });

        this.ambienceSystem = new AmbienceFxSystem(this, {
            worldWidth: 1000,
            worldHeight: 600,
            quality: this.backgroundProfile.quality,
            theme: this.backgroundProfile.theme,
            ambienceEnabled: this.backgroundProfile.ambienceEnabled,
        });
    }

    setupBackgroundProfileListener() {
        this.onBackgroundProfileChange = (e) => {
            const detail = e?.detail || {};
            this.applyBackgroundProfile(detail);
        };
        window.addEventListener('backgroundProfileChange', this.onBackgroundProfileChange);
    }

    setupCheatListener() {
        this.onCheatCommand = (e) => {
            const detail = e?.detail || {};
            this.applyCheatCommand(detail);
        };
        window.addEventListener('mqCheatCommand', this.onCheatCommand);
    }

    applyBackgroundProfile(detail = {}) {
        const merged = {
            ...this.backgroundProfile,
            ...detail,
        };
        this.backgroundProfile = merged;
        if (this.backgroundSystem) this.backgroundSystem.setProfile(merged);
        if (this.ambienceSystem) this.ambienceSystem.setProfile(merged);
    }

    updateBackgroundLayers(delta, paused = false) {
        const focusX = 500; // 고정값: 플레이어 이동에 따른 배경 시프트 없음
        if (this.backgroundSystem) this.backgroundSystem.update(focusX, delta);
        if (this.ambienceSystem) this.ambienceSystem.update(focusX, delta, paused);
    }

    applyCheatCommand(detail = {}) {
        const cmd = String(detail.command || '').toLowerCase();
        const value = detail.value;

        switch (cmd) {
            case 'setlevel': {
                const target = Math.max(1, Math.floor(Number(value) || 1));
                if (target < this.ps.level) {
                    this.addChatMessage(`치트: 현재 레벨(${this.ps.level})보다 낮게 설정할 수 없습니다.`);
                    return;
                }
                while (this.ps.level < target) {
                    this.ps.exp = this.ps.expToLevel;
                    this.checkLevelUp();
                }
                this.addChatMessage(`치트: 레벨을 ${this.ps.level}(으)로 설정했습니다.`);
                break;
            }
            case 'setmeso': {
                this.ps.meso = Math.max(0, Math.floor(Number(value) || 0));
                this.addChatMessage(`치트: 메소를 ${this.ps.meso}(으)로 설정했습니다.`);
                break;
            }
            case 'addmeso': {
                this.ps.meso = Math.max(0, this.ps.meso + Math.floor(Number(value) || 0));
                this.addChatMessage(`치트: 메소가 ${this.ps.meso}(으)로 변경되었습니다.`);
                break;
            }
            case 'heal': {
                this.ps.hp = this.ps.maxHp;
                this.ps.mp = this.ps.maxMp;
                this.addChatMessage('치트: HP/MP를 모두 회복했습니다.');
                break;
            }
            case 'godmode': {
                this.cheats.godMode = !!value;
                this.addChatMessage(`치트: 무적 모드 ${this.cheats.godMode ? 'ON' : 'OFF'}`);
                break;
            }
        }
        this.updateHUD();
    }

    handleSceneShutdown() {
        if (this.onBackgroundProfileChange) {
            window.removeEventListener('backgroundProfileChange', this.onBackgroundProfileChange);
            this.onBackgroundProfileChange = null;
        }
        if (this.onCheatCommand) {
            window.removeEventListener('mqCheatCommand', this.onCheatCommand);
            this.onCheatCommand = null;
        }
        if (this.backgroundSystem) {
            this.backgroundSystem.destroy();
            this.backgroundSystem = null;
        }
        if (this.ambienceSystem) {
            this.ambienceSystem.destroy();
            this.ambienceSystem = null;
        }
    }

    // ??????????????????????????????????????????????????????????
    //  ?뚮옯???앹꽦
    // ??????????????????????????????????????????????????????????
    createPlatforms() {
        PLATFORMS.forEach(p => {
            // ?쒓컖???쒗쁽 (Graphics濡?洹몃━湲?
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

            // 臾쇰━ 諛붾뵒: staticGroup.create() ???띿뒪泥섍? 1횞1?대?濡?body.setSize()濡?紐낆떆 吏??
            const img = this.platformGroup.create(p.x + p.w / 2, p.y + p.h / 2, 'pixel');
            img.setDisplaySize(p.w, p.h);
            img.body.setSize(p.w, p.h);   // ???꾩닔: 1횞1 湲곕낯媛????ㅼ젣 ?ш린濡?援먯껜
            img.refreshBody();
            img.setAlpha(0);
        });
    }

    // ??????????????????????????????????????????????????????????
    //  ?뚮젅?댁뼱 ?앹꽦
    // ??????????????????????????????????????????????????????????
    createPlayer() {
        // setDisplaySize瑜??ъ슜?섎㈃ DynamicBody.setSize媛 scaleX/Y瑜?怨깊빐
        // body ?ш린媛 40*40=1600, 60*60=3600???섎뒗 踰꾧렇 諛쒖깮.
        // ?뚮젅?댁뼱??setAlpha(0)?쇰줈 ?щ챸?섎?濡?setDisplaySize 遺덊븘??
        // scale=1 ?곹깭?먯꽌 setSize(40,60) ??body ?뺥솗??40횞60?쇰줈 ?ㅼ젙??
        this.playerBody = this.physics.add.image(200, 420, 'pixel');
        this.playerBody.body.setSize(40, 60);
        this.playerBody.body.setMaxVelocityY(1800);
        this.playerBody.setAlpha(0);
        this.playerBody.setCollideWorldBounds(true);

        const startFrame = `${this.ps.job}_idle_0`;
        this.playerSprite = this.add.sprite(this.playerBody.x, this.playerBody.y, startFrame);
        this.playerSprite.setOrigin(0.5, 0.72);
        this.playerSprite.setDepth(6);
        this.playerSprite.play(`anim_${this.ps.job}_idle`);
    }

    // ??????????????????????????????????????????????????????????
    //  ?낅젰 ?ㅼ젙
    // ??????????????????????????????????????????????????????????
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

        // 1?뚯꽦 ??(just pressed)
        this.input.keyboard.on('keydown-ESC', () => this.togglePause());
        this.input.keyboard.on('keydown-P',   () => this.togglePause());
        this.input.keyboard.on('keydown-Z',   () => this.useSkill(0));
        this.input.keyboard.on('keydown-X',   () => this.useSkill(1));
        this.input.keyboard.on('keydown-C',   () => this.useSkill(2));
        this.input.keyboard.on('keydown-A',   () => this.basicAttack());
        this.input.keyboard.on('keyup-Z',     () => { this.skillHoldNextFireAt[0] = 0; });
        this.input.keyboard.on('keyup-X',     () => { this.skillHoldNextFireAt[1] = 0; });
        this.input.keyboard.on('keyup-C',     () => { this.skillHoldNextFireAt[2] = 0; });
    }

    isArcherRapidFireSkill(skill) {
        if (!skill || this.ps.job !== 'archer') return false;
        return skill.type === 'doubleShot' || skill.type === 'tripleShot';
    }

    updateArcherHoldSkills(time) {
        if (this.ps.job !== 'archer') return;

        const job = JOBS[this.ps.job];
        const tier = job.tiers[this.ps.tier];
        const keyBySlot = [this.keys.z, this.keys.x, this.keys.c];

        for (let idx = 0; idx < 3; idx++) {
            const keyObj = keyBySlot[idx];
            const skill = tier.skills[idx];

            if (!keyObj?.isDown || !this.isArcherRapidFireSkill(skill)) {
                this.skillHoldNextFireAt[idx] = 0;
                continue;
            }

            if (this.skillHoldNextFireAt[idx] === 0) {
                this.skillHoldNextFireAt[idx] = time + 180;
                continue;
            }

            if (time >= this.skillHoldNextFireAt[idx]) {
                this.useSkill(idx);
                const repeat = skill.type === 'tripleShot' ? 55 : 80;
                this.skillHoldNextFireAt[idx] = time + repeat;
            }
        }
    }

    // ??????????????????????????????????????????????????????????
    //  硫붿씤 猷⑦봽
    // ??????????????????????????????????????????????????????????
    update(time, delta) {
        if (this.gs.gameOver) return;
        if (this.gs.paused) {
            this.updateBackgroundLayers(delta, true);
            this.drawAll(time);  // ?뺤? ?붾㈃留??뚮뜑留?
            this.updateHUD();
            return;
        }

        this.ps.playFrames++;

        // 히트스톱 (게임 루프 일시정지)
        if (this.gs.hitStop > 0) {
            this.gs.hitStop--;
            // 스프라이트 애니메이션도 동결 → HIT 프레임 유지 효과
            if (this.playerSprite && !this.playerSprite.anims.isPaused) {
                this.playerSprite.anims.pause();
            }
            this.updateBackgroundLayers(delta, false);
            this.drawAll(time);
            return;
        }
        // 히트스톱 종료 → 스프라이트 애니메이션 재개
        if (this.playerSprite?.anims.isPaused) {
            this.playerSprite.anims.resume();
        }

        if (this.cheats?.godMode) {
            this.ps.hp = this.ps.maxHp;
            this.ps.mp = this.ps.maxMp;
            this.ps.invincible = Math.max(this.ps.invincible, 60);
        }

        // 肄ㅻ낫 由ъ뀑 (1.2珥??댁긽 ?덊듃 ?놁쓣 ??
        if (this.gs.combo > 0 && time - this.gs.lastHitTime > 1200) {
            this.gs.combo = 0;
        }

        // 荑⑤떎??媛먯냼 (?꾨젅??湲곕컲 ??delta 湲곕컲?쇰줈 蹂??
        const dt = delta / (1000 / 60);  // 60fps 湲곗? ?꾨젅????
        if (this.ps.attackCooldown > 0) this.ps.attackCooldown -= dt;
        for (let i = 0; i < 3; i++) {
            if (this.ps.skillCooldowns[i] > 0) this.ps.skillCooldowns[i] -= dt;
        }
        if (this.ps.invincible > 0) this.ps.invincible -= dt;

        // 踰꾪봽 ?낅뜲?댄듃
        this.updateBuffs(dt);

        // MP ?먮룞 ?뚮났
        if (this.ps.mp < this.ps.maxMp) {
            this.ps.mp = Math.min(this.ps.maxMp, this.ps.mp + 0.05 * dt);
        }

        // ?뚮젅?댁뼱 ?대룞
        this.updateMovement();
        this.updateArcherHoldSkills(time);

        // 紐ъ뒪???낅뜲?댄듃
        this.updateMonsters(time, delta);
        this.updateMonsterSprite();
        this.updatePlayerSprite();

        // ?뚰떚???낅뜲?댄듃
        this.updateParticles(dt);

        // ?댄럺???낅뜲?댄듃
        for (let i = this.activeEffects.length - 1; i >= 0; i--) {
            this.activeEffects[i].frame += dt;
            if (this.activeEffects[i].frame >= this.activeEffects[i].maxFrames) {
                this.activeEffects.splice(i, 1);
            }
        }

        // ?꾨줈?앺????낅뜲?댄듃
        this.updateProjectiles(delta / (1000 / 60));
        // ?덈꺼??泥댄겕
        this.checkLevelUp();

        // Secondary Motion (망토·머리카락 물리)
        this.updateSecondaryMotion(dt);

        this.updateBackgroundLayers(delta, false);

        // ?뚮뜑留?
        this.drawAll(time);

        // HUD ?낅뜲?댄듃
        this.updateHUD();
    }

    // ??????????????????????????????????????????????????????????
    //  ?대룞 泥섎━
    // ??????????????????????????????????????????????????????????
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

        // ?먰봽
        if ((this.keys.up.isDown || this.keys.space.isDown || this.keys.w.isDown) && onGround) {
            const jumpVel = Math.abs(job.jumpPower) * 54;
            body.setVelocityY(-jumpVel);
        }

        // ?ㅼ씠?ㅽ듃 ?몃젅??
        if (this.ps.buffs.haste || this.ps.buffs.swiftness) {
            this.ps.trail.unshift({ x: body.x, y: body.y });
            if (this.ps.trail.length > 5) this.ps.trail.pop();
        } else {
            this.ps.trail = [];
        }

        // 월드 경계 클램프
        if (body.x < 20) { body.x = 20; body.setVelocityX(0); }
        if (body.x > WORLD_WIDTH - 20) { body.x = WORLD_WIDTH - 20; body.setVelocityX(0); }
    }

    // ??????????????????????????????????????????????????????????
    //  踰꾪봽 ?낅뜲?댄듃
    // ??????????????????????????????????????????????????????????
    updateBuffs(dt) {
        for (const [name, buff] of Object.entries(this.ps.buffs)) {
            buff.duration -= dt;
            // ?깆뒪?ъ슫 鍮? 珥덈떦 HP ?뚮났
            if (name === 'holyLight' && this.ps.playFrames % 60 < dt + 1) {
                const heal = Math.floor(buff.healPerSec || 5);
                this.ps.hp = Math.min(this.ps.maxHp, this.ps.hp + heal);
                this.showFloatText(this.playerBody.x, this.playerBody.y - 30,
                    `+${heal} HP`, '#44ff44');
            }
            if (buff.duration <= 0) {
                // ?좎뭅濡쒖슫 ??留뚮즺 ???щ━?곗뺄 蹂듦뎄
                if (name === 'keenEyes' && buff.critBonus) {
                    this.ps.critChance -= buff.critBonus;
                }
                delete this.ps.buffs[name];
            }
        }
    }

    // ??????????????????????????????????????????????????????????
    //  紐ъ뒪???ㅽ룿
    // ??????????????????????????????????????????????????????????
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
        // 플레이어 기준 화면 밖(500~700px)에서 스폰
        const playerX = this.playerBody ? this.playerBody.x : WORLD_WIDTH / 2;
        const side = Math.random() > 0.5;
        const dist = 520 + Math.random() * 200;
        const spawnX = Math.max(20, Math.min(WORLD_WIDTH - 20,
            side ? playerX + dist : playerX - dist));

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
        this.spawnMonsterSprite(m);
    }

    // ??????????????????????????????????????????????????????????
    //  紐ъ뒪???낅뜲?댄듃 (AI + 臾쇰━)
    // ??????????????????????????????????????????????????????????
    updateMonsters(time, delta) {
        const dt = delta / (1000 / 60);
        const G = 0.7;
        const px = this.playerBody.x;
        const py = this.playerBody.y;

        for (let i = this.monsters.length - 1; i >= 0; i--) {
            const m = this.monsters[i];
            if (m.dead) {
                if (m.fadingOut) {
                    // Sprite is still fading out via tween — wait for it to finish
                    continue;
                }
                if (m.sprite) {
                    m.sprite.destroy();
                    m.sprite = null;
                }
                const nt = this.monsterNameTexts.get(m.id);
                if (nt) {
                    nt.destroy();
                    this.monsterNameTexts.delete(m.id);
                }
                this.monsters.splice(i, 1);
                continue;
            }
            m.animFrame += 0.12 * dt;
            if (m.invincible > 0) m.invincible -= dt;

            // 以묐젰
            m.vy += G * dt;

            // AI: ?뚮젅?댁뼱 異붿쟻
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

            // ?뚮옯??異⑸룎
            let onPlatform = false;
            for (const p of PLATFORMS) {
                if (m.x - m.w / 2 < p.x + p.w && m.x + m.w / 2 > p.x &&
                    m.y + m.h / 2 > p.y && m.y + m.h / 2 - m.vy * dt <= p.y + 2) {
                    m.y = p.y - m.h / 2;
                    m.vy = 0;
                    onPlatform = true;
                }
            }

            // 寃쎄퀎 泥섎━
            if (m.x < 0 || m.x > WORLD_WIDTH) { m.vx *= -1; }
            if (m.y > 700) { m.dead = true; continue; }

            // ?뚮젅?댁뼱 怨듦꺽 (?묒큺)
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
                    // ── Hit Reaction 강화 ──────────────────────────────────────
                    // 1) White Flash: 스프라이트를 즉시 흰색으로 → 80ms 후 클리어
                    if (this.playerSprite) {
                        this.playerSprite.setTint(0xffffff);
                        this.time.delayedCall(80, () => {
                            if (this.playerSprite) this.playerSprite.clearTint();
                        });
                    }

                    // 2) 노크백: 몬스터 반대 방향으로 속도 충격
                    const hitDir = px > m.x ? 1 : -1;
                    this.playerBody.setVelocityX(
                        this.playerBody.body.velocity.x + hitDir * 220
                    );
                    if (this.playerBody.body.blocked.down) {
                        this.playerBody.setVelocityY(-160);  // 살짝 튀어오름
                    }

                    // 3) Squash & Stretch: 가로 확장, 세로 압축 → 150ms 복귀
                    this.ps.squashEndAt = this.time.now + 150;

                    // 4) 피격 파티클: 흰색 광채 + 붉은 파편
                    this.addBurstParticles(px, py - 20, 0xffffff, 4);
                    this.addBurstParticles(px, py - 20, 0xff2222, 3);


                    if (this.ps.hp <= 0) {
                        this.ps.hp = 0;
                        this.triggerGameOver();
                    }
                }
            }
        }
    }

    // ??????????????????????????????????????????????????????????
    //  ?뚰떚???낅뜲?댄듃
    // ??????????????????????????????????????????????????????????
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

    // ??????????????????????????????????????????????????????????
    //  湲곕낯 怨듦꺽
    // ??????????????????????????????????????????????????????????
    basicAttack() {
        if (this.gs.gameOver || this.gs.paused) return;
        if (this.ps.attackCooldown > 0) return;

        const job = JOBS[this.ps.job];
        const basic = job.basicAttack;
        this.ps.attackCooldown = basic.cooldown;
        this.ps.isAttacking = true;
        this.time.delayedCall(basic.animDuration || 350, () => { this.ps.isAttacking = false; });

        // Frame 2 HitStop: 윈드업 완료 시점에 히트스톱 발동 (공격 스냅감)
        // warrior: 90+80=170ms, thief: 50+40=90ms, archer: 70+60=130ms
        const f2Delay = { warrior: 170, thief: 90, archer: 130 }[this.ps.job] || 150;
        this.time.delayedCall(f2Delay, () => {
            if (!this.gs.gameOver && !this.gs.paused && this.ps.isAttacking) {
                this.gs.hitStop = Math.max(this.gs.hitStop, 4); // ~66ms @ 60fps
            }
        });

        let atkMult = 1;
        if (this.ps.buffs.rage)      atkMult *= this.ps.buffs.rage.attackBonus      || 1.5;
        if (this.ps.buffs.holyLight) atkMult *= this.ps.buffs.holyLight.attackBonus || 1.2;
        if (this.ps.buffs.berserker) atkMult *= this.ps.buffs.berserker.attackBonus || 1.8;
        if (this.ps.buffs.heroicWill)atkMult *= this.ps.buffs.heroicWill.attackBonus|| 2.0;
        const dmg = this.ps.attack * basic.damage * atkMult;

        const cx = this.playerBody.x;
        const cy = this.playerBody.y;

        // Attack lunge: 공격 방향으로 미세 전진
        const lungePower = { warrior: 70, thief: 90, archer: 0 }[this.ps.job] || 0;
        if (lungePower > 0) {
            this.playerBody.setVelocityX(this.playerBody.body.velocity.x + this.ps.direction * lungePower);
        }

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

    // ??????????????????????????????????????????????????????????
    //  ?ㅽ궗 ?ъ슜
    // ??????????????????????????????????????????????????????????
    useSkill(idx) {
        if (this.gs.gameOver || this.gs.paused) return;
        if (this.ps.skillCooldowns[idx] > 0) return;

        const job = JOBS[this.ps.job];
        const tier = job.tiers[this.ps.tier];
        const skill = tier.skills[idx];
        if (!skill) return;
        if (this.ps.mp < skill.mp) {
            this.showFloatText(this.playerBody.x, this.playerBody.y - 30, 'MP 부족', '#4488ff');
            return;
        }

        this.ps.mp -= skill.mp;
        const skillCooldown = (skill.type === 'tripleShot')
            ? Math.max(8, Math.floor(skill.cooldown * 0.8))
            : skill.cooldown;
        this.ps.skillCooldowns[idx] = skillCooldown;
        this.ps.isAttacking = true;
        this.time.delayedCall(350, () => { this.ps.isAttacking = false; });

        // Frame 2 HitStop: 스킬도 동일한 공격 애니메이션 사용
        const f2DelaySkill = { warrior: 170, thief: 90, archer: 130 }[this.ps.job] || 150;
        this.time.delayedCall(f2DelaySkill, () => {
            if (!this.gs.gameOver && !this.gs.paused && this.ps.isAttacking) {
                this.gs.hitStop = Math.max(this.gs.hitStop, 4);
            }
        });

        let atkMult = 1;
        if (this.ps.buffs.rage)      atkMult *= this.ps.buffs.rage.attackBonus       || 1.5;
        if (this.ps.buffs.holyLight) atkMult *= this.ps.buffs.holyLight.attackBonus  || 1.2;
        if (this.ps.buffs.berserker) atkMult *= this.ps.buffs.berserker.attackBonus  || 1.8;
        if (this.ps.buffs.heroicWill)atkMult *= this.ps.buffs.heroicWill.attackBonus || 2.0;
        const baseDmg = this.ps.attack * skill.damage * atkMult;

        const cx = this.playerBody.x;
        const cy = this.playerBody.y;

        // 스킬 lunge: 공격 방향으로 미세 전진
        const skillLunge = { warrior: 50, thief: 70, archer: 0 }[this.ps.job] || 0;
        if (skillLunge > 0 && !skill.buff) {
            this.playerBody.setVelocityX(this.playerBody.body.velocity.x + this.ps.direction * skillLunge);
        }

        this.execSkill(skill, baseDmg, cx, cy);
    }

    execSkill(skill, dmg, cx, cy) {
        // 踰꾪봽 ?ㅽ궗 泥섎━
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
                this.hitMonstersRadius(cx, cy, range, dmg, true, 7, -3);
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
                    // 마지막 타격에 knockback 적용
                    const isLast = h === hits - 1;
                    this.time.delayedCall(h * 80, () => this.hitMonsters(box, dmg, isLast, isLast ? 6 : 0, isLast ? -2 : 0));
                }
                break;
            }
            case 'assassinate':
            case 'deadlyBlow':
            case 'soulStrike': {
                this.addEffect('assassinate', cx, cy, dir, 30);
                const mult = skill.type === 'deadlyBlow' ? 1.3 : skill.type === 'soulStrike' ? 1.4 : 1.0;
                const box = this.makeAttackBox(cx, cy, 100, 70);
                this.time.delayedCall(200, () => this.hitMonsters(box, dmg * mult, true, 8, -6, true));
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
                const isTriple = skill.type === 'tripleShot';
                this.addEffect(isTriple ? 'tripleShot' : 'doubleShot', cx, cy, dir, isTriple ? 18 : 15);
                const arrows = skill.arrows || 2;
                for (let i = 0; i < arrows; i++) {
                    this.time.delayedCall(i * (isTriple ? 45 : 80), () => {
                        this.fireProjectile(cx, cy, dmg, 0, false, 80, isTriple ? 1.2 : 1.0);
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
                const laneCount = 15;
                const width = 400;
                const startX = Math.max(0, Math.min(WORLD_WIDTH - width, cx - width / 2));
                const topY = 40;
                const impactY = 520;

                this.addEffect('arrowRain', cx, cy, dir, 60, {
                    startX,
                    width,
                    laneCount,
                    topY,
                    impactY,
                });

                for (let i = 0; i < laneCount; i++) {
                    const delay = (i / laneCount) * 600 + 300;
                    const rx = startX + ((i + 0.5) / laneCount) * width;
                    this.time.delayedCall(delay, () => {
                        this.addEffect('arrowRainImpact', rx, impactY, 1, 14);
                        this.hitMonstersRainStrike(rx, impactY, dmg * mult, 44, 110);
                    });
                }
                break;
            }
        }
    }

    // ??????????????????????????????????????????????????????????
    //  ?꾪닾 ?좏떥
    // ??????????????????????????????????????????????????????????
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

    hitMonstersRadius(cx, cy, range, dmg, knockback = false, kvx = 0, kvy = 0) {
        for (const m of this.monsters) {
            if (m.dead || m.invincible > 0) continue;
            const dx = m.x - cx, dy = m.y - cy;
            if (Math.sqrt(dx * dx + dy * dy) < range) {
                this.dealDamage(m, dmg, false);
                if (knockback) {
                    const mdir = dx >= 0 ? 1 : -1;
                    m.vx = mdir * kvx;
                    m.vy = kvy;
                }
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

    hitMonstersRainStrike(rx, ry, dmg, xRange, yRange) {
        for (const m of this.monsters) {
            if (m.dead || m.invincible > 0) continue;
            if (Math.abs(m.x - rx) < xRange && Math.abs(m.y - ry) < yRange) {
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
        // Monster hit flash: white burst → red damage tint
        if (m.sprite) {
            m.sprite.setTint(0xffffff);
            this.time.delayedCall(50, () => {
                if (m.sprite) m.sprite.setTint(0xff4444);
                this.time.delayedCall(60, () => {
                    if (m.sprite) m.sprite.clearTint();
                });
            });
        }
        this.gs.combo++;
        this.gs.lastHitTime = this.time.now;
        this.gs.hitStop = Math.max(this.gs.hitStop, 4);  // ~66ms, 기존 3→4프레임

        // ?誘몄? ?띿뒪??
        const color = backstab ? '#ff44ff' : isCrit ? '#ffff00' : '#ffffff';
        this.showFloatText(m.x + (Math.random() - 0.5) * 30, m.y - m.h / 2 - 10,
            String(dmg), color, isCrit);
        if (isCrit) this.showFloatText(m.x, m.y - m.h / 2 - 40, 'CRITICAL!', '#ffff00', false, true);
        if (this.gs.combo >= 50 && this.gs.combo % 10 === 0) {
            this.showFloatText(m.x, m.y - m.h / 2 - 60, 'EXCELLENT!', '#ff44ff', false, true);
        }

        // ?뚰떚??
        this.addBurstParticles(m.x, m.y, isCrit ? 0xffff00 : 0xff8800, isCrit ? 15 : 8);

        // ?붾㈃ ?붾뱾由?(?щ━?곗뺄)
        if (isCrit) this.cameras.main.shake(100, 0.008);

        // ?щ쭩 泥섎━
        if (m.hp <= 0) {
            m.dead = true;
            m.fadingOut = true;
            this.ps.kills++;
            this.ps.exp += m.exp * 4;
            this.ps.meso += m.meso;
            this.addEffect('monsterDie', m.x, m.y, 1, 20);
            this.showFloatText(m.x, m.y - m.h / 2 - 20, `+${m.exp} EXP`, '#ffff44');
            this.addBurstParticles(m.x, m.y, 0xffaa00, 28);
            if (m.mt.hpMult >= 5) {
                this.cameras.main.shake(140, 0.007);
                this.physics.world.timeScale = 0.2;
                this.time.delayedCall(300, () => { this.physics.world.timeScale = 1.0; });
            }
            // 이름 텍스트 제거
            const nt = this.monsterNameTexts.get(m.id);
            if (nt) { nt.destroy(); this.monsterNameTexts.delete(m.id); }
            // Sprite fade-out: 위로 떠오르며 사라짐
            if (m.sprite) {
                this.tweens.add({
                    targets: m.sprite,
                    alpha: 0,
                    y: m.sprite.y - 20,
                    duration: 400,
                    ease: 'Power2',
                    onComplete: () => {
                        if (m.sprite) { m.sprite.destroy(); m.sprite = null; }
                        m.fadingOut = false;
                    }
                });
            } else {
                m.fadingOut = false;
            }
        }
    }

    fireProjectile(cx, cy, dmg, vyOffset, explosive = false, radius = 80, speedMult = 1) {
        const dir = this.ps.direction;
        const piercing = !!(this.ps.buffs.soul);
        this.projectiles.push({
            x: cx + dir * 22, y: cy,
            vx: dir * 14 * speedMult,
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

            if (proj.x < 0 || proj.x > WORLD_WIDTH || proj.y < 0 || proj.y > 620 || proj.frame > 90) {
                proj.dead = true;
                continue;
            }

            // 紐ъ뒪??異⑸룎
            for (const m of this.monsters) {
                if (m.dead || m.invincible > 0) continue;
                if (Math.abs(proj.x - m.x) < m.w / 2 + 8 && Math.abs(proj.y - m.y) < m.h / 2 + 8) {
                    if (proj.explosive) {
                        this.addEffect('explosion', proj.x, proj.y, 1, 25);
                        this.hitMonstersRadius(proj.x, proj.y, proj.radius, proj.dmg, true, 9, -7);
                    } else {
                        this.dealDamage(m, proj.dmg, false);
                    }
                    if (!proj.piercing) proj.dead = true;
                    break;
                }
            }
        }
    }

    // ??????????????????????????????????????????????????????????
    //  ?댄럺???쒖뒪??    // ??????????????????????????????????????????????????????????
    addEffect(type, x, y, dir, maxFrames, data = null) {
        this.activeEffects.push({ type, x, y, dir, frame: 0, maxFrames: maxFrames || 20, ...(data || {}) });
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

    // ??????????????????????????????????????????????????????????
    //  ?덈꺼??/ ?꾩쭅 泥댄겕
    // ??????????????????????????????????????????????????????????
    checkLevelUp() {
        while (this.ps.exp >= this.ps.expToLevel) {
            this.ps.exp -= this.ps.expToLevel;
            this.ps.level++;
            this.ps.expToLevel = Math.floor(100 * Math.pow(this.ps.level, 1.1));

            const job = JOBS[this.ps.job];
            this.ps.maxHp += job.hpPerLevel;
            this.ps.hp = this.ps.maxHp;
            this.ps.maxMp += job.mpPerLevel;
            this.ps.mp = this.ps.maxMp;
            this.ps.attack += job.attackPerLevel;

            // ?덈꺼???댄럺??
            const cx = this.playerBody.x;
            const cy = this.playerBody.y;
            this.addEffect('levelUp', cx, cy, 1, 40);
            this.addBurstParticles(cx, cy, 0xffff00, 20);
            this.cameras.main.shake(200, 0.01);
            this.cameras.main.zoomTo(1.12, 150);
            this.time.delayedCall(150, () => { this.cameras.main.zoomTo(1.0, 500); });
            this.gs.levelUpGlowStart = this.time.now;
            this.gs.levelUpGlowDur   = 800;
            this.showFloatText(cx, cy - 60, 'LEVEL UP!', '#ffff00', false, true);

            // ?꾩쭅 泥댄겕
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
        this.cameras.main.zoomTo(1.18, 200);
        this.time.delayedCall(200, () => { this.cameras.main.zoomTo(1.0, 700); });
        this.gs.levelUpGlowStart = this.time.now;
        this.gs.levelUpGlowDur   = 1200;
        this.showFloatText(cx, cy - 80, `전직! ${this.getTierDisplayName(this.ps.job, this.ps.tier)}`, '#ffffff', false, true);

        this.addChatMessage(`${tier.name}(으)로 전직했습니다!`);
    }

    // ??????????????????????????????????????????????????????????
    //  遺???띿뒪??(?곕?吏, ?? ?ㅽ궗紐???
    // ??????????????????????????????????????????????????????????
    showFloatText(x, y, text, color, isCrit = false, isBig = false) {
        const num = parseInt(text);
        let size;
        if (isBig) {
            size = '22px';
        } else if (isCrit) {
            size = num >= 500 ? '36px' : num >= 200 ? '30px' : '26px';
        } else {
            size = num >= 500 ? '24px' : num >= 100 ? '20px' : '17px';
        }
        const strokeColor = isCrit ? '#aa4400' : '#000000';
        const style = {
            fontSize: size,
            fontFamily: 'Arial, sans-serif',
            color: color || '#ffffff',
            stroke: strokeColor,
            strokeThickness: isCrit ? 5 : 3,
            fontStyle: 'bold',
        };
        const t = this.add.text(x, y, String(text), style).setOrigin(0.5, 1).setDepth(100);

        if (isCrit) {
            t.setScale(1.6);
            this.tweens.add({
                targets: t,
                scaleX: 1.0,
                scaleY: 1.0,
                duration: 180,
                ease: 'Back.easeOut',
                onComplete: () => {
                    this.tweens.add({
                        targets: t,
                        y: y - 85,
                        alpha: 0,
                        duration: 1200,
                        ease: 'Power1',
                        onComplete: () => t.destroy()
                    });
                }
            });
        } else {
            this.tweens.add({
                targets: t,
                y: y - 65,
                alpha: 0,
                duration: 900,
                ease: 'Power1',
                onComplete: () => t.destroy()
            });
        }
    }


    // ??????????????????????????????????????????????????????????
    //  梨꾪똿 濡쒓렇
    // ??????????????????????????????????????????????????????????
    addChatMessage(msg) {
        this.chatMessages.unshift({ text: msg, life: 600 });
        if (this.chatMessages.length > 5) this.chatMessages.pop();
    }

    // ??????????????????????????????????????????????????????????
    //  ?쇱떆?뺤? / 寃뚯엫?ㅻ쾭
    // ??????????????????????????????????????????????????????????
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
        for (const m of this.monsters) {
            if (m.sprite) {
                m.sprite.destroy();
                m.sprite = null;
            }
        }
        if (this.playerSprite) {
            this.playerSprite.destroy();
            this.playerSprite = null;
        }
        this.monsterNameTexts.forEach(t => t.destroy());
        this.monsterNameTexts.clear();
        this.cameras.main.shake(500, 0.03);
        this.time.delayedCall(800, () => {
            window.dispatchEvent(new CustomEvent('gameOver', { detail: {
                level: this.ps.level,
                kills: this.ps.kills,
                meso: this.ps.meso,
                playFrames: this.ps.playFrames,
                job: this.ps.job,
                tier: this.ps.tier,
            }}));
        });
    }

    // ??????????????????????????????????????????????????????????
    //  HUD ?낅뜲?댄듃 (DOM??CustomEvent 諛쒖넚)
    // ??????????????????????????????????????????????????????????
    updateHUD() {
        const job  = JOBS[this.ps.job];
        const tier = job.tiers[this.ps.tier];
        window.dispatchEvent(new CustomEvent('gameHudUpdate', { detail: {
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
            skills: tier.skills.map(s => ({ name: this.getSkillDisplayName(s), icon: s.icon || '?', mp: s.mp, cooldown: s.cooldown })),
            job: this.ps.job,
            tier: this.ps.tier,
            paused: this.gs.paused,
            chatMessages: this.chatMessages,
        }}));
    }

    // ??????????????????????????????????????????????????????????
    //  ?꾩껜 ?뚮뜑留?    // ??????????????????????????????????????????????????????????
    drawAll(time) {
        const g = this.drawLayer;
        const u = this.uiLayer;
        g.clear();
        u.clear();
        if (this.fxLayer) this.fxLayer.clear();

        // projectiles
        this.drawProjectiles(g);

        // effects
        for (const e of this.activeEffects) {
            const p = e.frame / e.maxFrames;
            this.drawEffect(g, e, p);
        }

        this.drawPlayerOverlays(g, time);
        this.drawMonsterOverlays(g);

        // particles
        this.drawParticles(g);

        // UI (화면 고정 레이어)
        this.drawMinimap(u);
        this.drawCombo(u, time);
        this.drawMesoCounter(u);
        if (this.gs.paused) this.drawPauseOverlay(u);
    }

    // ??????????????????????????????????????????????????????????
    //  ?뚮젅?댁뼱 ?뚮뜑留?    // ??????????????????????????????????????????????????????????
    spawnMonsterSprite(m) {
        const key = `${m.type}_idle_0`;
        m.sprite = this.add.sprite(m.x, m.y, key);
        m.sprite.setOrigin(0.5, 0.75);
        m.sprite.setDepth(5);
        m.sprite.play(`anim_${m.type}_idle`);
    }

    updateMonsterSprite() {
        for (const m of this.monsters) {
            if (m.dead) continue;  // dead/fading sprites managed by tween
            if (!m.sprite) this.spawnMonsterSprite(m);
            if (!m.sprite) continue;
            m.sprite.setPosition(m.x, m.y);
            if (Math.abs(m.vx) > 0.15) {
                m.sprite.setFlipX(m.vx < 0);
            }
            if (m.invincible > 6) m.sprite.setTint(0xff4444);
            else m.sprite.clearTint();
        }
    }

    updatePlayerSprite() {
        if (!this.playerBody || !this.playerSprite) return;

        const onGround = this.playerBody.body.blocked.down;
        const vx = this.playerBody.body.velocity.x;

        let state = 'idle';
        if (!onGround) state = 'jump';
        else if (this.ps.isAttacking) state = 'attack';
        else if (Math.abs(vx) > 10) state = 'walk';

        const animKey = `anim_${this.ps.job}_${state}`;
        if (this.playerSprite.anims.currentAnim?.key !== animKey) {
            this.playerSprite.play(animKey, true);
        }

        this.playerSprite.setPosition(this.playerBody.x, this.playerBody.y + 2);
        this.playerSprite.setFlipX(this.ps.direction < 0);
        this.playerSprite.setAlpha(
            (this.ps.invincible > 0 && Math.floor(this.ps.invincible / 5) % 2 === 0) ? 0.35 : 1
        );

        // 피격 Squash & Stretch: squashEndAt 동안 스케일 변형 후 복귀
        let sqX = 1.0, sqY = 1.0;
        if (this.ps.squashEndAt > 0) {
            const remain = this.ps.squashEndAt - this.time.now;
            if (remain > 0) {
                const t = remain / this.ps.squashDur;  // 1(직후) → 0(복귀)
                sqX = 1.0 + 0.20 * t;   // 1.2 → 1.0
                sqY = 1.0 - 0.20 * t;   // 0.8 → 1.0
            } else {
                this.ps.squashEndAt = 0;
            }
        }

        // Idle 숨쉬기: 1.5% 세로 스케일 변화 (squash와 합성)
        if (state === 'idle') {
            const breathe = 1.0 + Math.sin(this.time.now * 0.0015) * 0.015;
            this.playerSprite.setScale(sqX, sqY * breathe);
        } else {
            this.playerSprite.setScale(sqX, sqY);
        }
    }

    // Secondary Motion: 망토·머리카락 물리 시뮬레이션
    updateSecondaryMotion(dt) {
        if (!this.playerBody) return;
        const vx  = this.playerBody.body.velocity.x;
        const spd = Math.min(Math.abs(vx) / 250, 1.0);

        // ─── 망토 ─────────────────────────────────────────────────────
        // 이동 반대 방향으로 지연 추종, 공격 시 순간 후방 스냅
        let capeTarget;
        if (this.ps.isAttacking) {
            capeTarget = -this.ps.direction * 15;
        } else {
            capeTarget = -Math.sign(vx) * spd * 12;
        }
        const capeFactor = this.ps.isAttacking ? 0.65 : (Math.abs(vx) > 10 ? 0.12 : 0.06);
        this.ps.capeSwingX += (capeTarget - this.ps.capeSwingX) * capeFactor * dt;

        // ─── 머리카락 / 깃털 / 후드 ───────────────────────────────────
        // 망토보다 작은 진폭, 약간 더 빠른 반응
        let hairTarget;
        if (this.ps.isAttacking) {
            hairTarget = -this.ps.direction * 8;
        } else {
            hairTarget = -Math.sign(vx) * spd * 5;
        }
        const hairFactor = this.ps.isAttacking ? 0.50 : (Math.abs(vx) > 10 ? 0.10 : 0.05);
        this.ps.hairSwingX += (hairTarget - this.ps.hairSwingX) * hairFactor * dt;

        // ─── 눈 깜빡임 타이머 (3~6초 랜덤 간격) ─────────────────────────
        const now = this.time.now;
        if (now > this.ps.nextBlinkAt) {
            this.ps.blinkEndAt  = now + 100;  // 0.1초 동안 눈 감기
            this.ps.nextBlinkAt = now + 3000 + Math.random() * 3000;
        }
    }


    drawPlayerOverlays(g, time) {
        const bx = this.playerBody.x;
        const by = this.playerBody.y;
        const colorHex = parseInt(JOBS[this.ps.job].color.replace('#', ''), 16);

        // ─── Secondary Motion: 망토 / 깃털 / 머리카락 ──────────────────────
        // drawLayer(depth 10)에 그려서 스프라이트의 정적 망토를 덮어씀
        // 좌표 변환: worldX = sprX + (texX - 24) * dir, worldY = sprY + texY - 46
        //   (스프라이트 origin = (0.5, 0.72), 텍스처 크기 48×64 기준)
        if (this.playerSprite) {
            const sprX = this.playerSprite.x;
            const sprY = this.playerSprite.y;
            const dir  = this.ps.direction;
            const csX  = this.ps.capeSwingX;   // 망토 끝점 월드 X 오프셋
            const hsX  = this.ps.hairSwingX;   // 머리카락/깃털 끝점 월드 X 오프셋

            if (this.ps.job === 'warrior') {
                // ── 전사 망토 (짙은 빨강) ───────────────────────────────────
                // 텍스처 내 망토: fillTriangle(13,18), (7,42), (20,36)
                const a1x = sprX - dir * 11, a1y = sprY - 28;  // 어깨 상단
                const a2x = sprX - dir *  4, a2y = sprY - 10;  // 어깨 하단
                const midX = sprX - dir * 14 + csX * 0.5;      // 중간 포인트 (절반 스윙)
                const midY = sprY - 16;
                const tipX = sprX - dir * 17 + csX;            // 끝점 (전체 스윙)
                const tipY = sprY - 4 - Math.abs(csX) * 0.2;   // 스윙 시 살짝 올라감

                g.fillStyle(0x991111, 0.90);
                g.fillTriangle(a1x, a1y, a2x, a2y, midX, midY);  // 상단 삼각형
                g.fillStyle(0x771111, 0.84);
                g.fillTriangle(a2x, a2y, midX, midY, tipX, tipY); // 하단 삼각형
                g.lineStyle(1, 0xcc1111, 0.45);
                g.lineBetween(a1x, a1y, tipX, tipY);               // 테두리 하이라이트

                // ── 투구 깃털 흔들림 ─────────────────────────────────────
                const px = sprX + hsX * 0.6;   // 깃털 끝 X
                g.fillStyle(0xff2222, 0.88);
                g.fillTriangle(px - 3, sprY - 47, px + 3, sprY - 47, px + hsX * 0.4, sprY - 54);
                g.lineStyle(2, 0xff5555, 0.65);
                g.lineBetween(sprX, sprY - 47, px + hsX * 0.5, sprY - 54);

            } else if (this.ps.job === 'thief') {
                // ── 도적 망토 (짙은 보라) ──────────────────────────────────
                const a1x = sprX - dir * 11, a1y = sprY - 28;
                const a2x = sprX - dir *  3, a2y = sprY - 10;
                const midX = sprX - dir * 13 + csX * 0.5;
                const midY = sprY - 16;
                const tipX = sprX - dir * 16 + csX;
                const tipY = sprY - 3 - Math.abs(csX) * 0.2;

                g.fillStyle(0x2a0044, 0.88);
                g.fillTriangle(a1x, a1y, a2x, a2y, midX, midY);
                g.fillStyle(0x330055, 0.82);
                g.fillTriangle(a2x, a2y, midX, midY, tipX, tipY);
                g.lineStyle(1, 0x550077, 0.40);
                g.lineBetween(a1x, a1y, tipX, tipY);

                // ── 삼각 모자 끝 흔들림 ──────────────────────────────────
                // 모자 원뿔: 눈에 보이는 위치 기준 sprY-38 ~ sprY-50
                const hatBaseY = sprY - 38;
                const htx = sprX + dir * 1 + hsX * 0.55;
                g.fillStyle(0x1f0f38, 0.90);
                g.fillTriangle(
                    sprX - dir * 7, hatBaseY,
                    sprX + dir * 7, hatBaseY,
                    htx, hatBaseY - 12
                );

            } else if (this.ps.job === 'archer') {
                // ── 궁수 후드 측면 플랩 ──────────────────────────────────
                const flapAX = sprX - dir * 8, flapAY = sprY - 36;
                const flapBX = sprX - dir * 4, flapBY = sprY - 38;
                const flapTX = sprX - dir * 11 + csX * 0.30;
                const flapTY = sprY - 28;
                g.fillStyle(0x1a5a28, 0.78);
                g.fillTriangle(flapAX, flapAY, flapBX, flapBY, flapTX, flapTY);

                // ── 머리카락 가닥 (후드 아래에서 삐져나옴) ──────────────
                g.fillStyle(0x5a3300, 0.82);
                g.fillRect(sprX + dir * 2 + hsX * 0.35, sprY - 46, 3, 6);
                g.fillRect(sprX - dir * 3 + hsX * 0.25, sprY - 44, 2, 4);
            }
        }

        // ─── Idle 강화: 눈 깜빡임 + 무기 광채 흔들림 ──────────────────────
        // 조건: 지상, 비공격, 비이동 상태
        if (this.playerSprite && this.playerBody?.body.blocked.down &&
            !this.ps.isAttacking && Math.abs(this.playerBody.body.velocity.x) < 10) {

            const sprX = this.playerSprite.x;
            const sprY = this.playerSprite.y;
            const dir  = this.ps.direction;

            // ── 눈 깜빡임: 피부색 rect로 눈 영역 덮기 ─────────────────────
            // 눈 위치 (스프라이트 텍스처 좌표 → 월드): (sprX+dir*2, sprY-42), 3×3px
            if (this.time.now < this.ps.blinkEndAt) {
                g.fillStyle(0xffdeb3, 1.0);
                const eyeX = dir > 0 ? sprX + 2 : sprX - 5;
                g.fillRect(eyeX, sprY - 42, 3, 3);
            }

            // ── 무기 광채 흔들림: 칼날/화살 위를 이동하는 하이라이트 ────────
            // shimmer: -1..1 사인파, 주기 ~3.1초
            const shimmer = Math.sin(time * 0.002);

            if (this.ps.job === 'warrior') {
                // 검 날 따라 이동하는 흰색 광채 (blade: sprY-50 ~ sprY-28, dir측 x+12)
                const bladeProgress = (shimmer + 1) / 2;          // 0..1
                const glowY = sprY - 50 + bladeProgress * 22;
                g.fillStyle(0xffffff, 0.55 + shimmer * 0.15);
                g.fillRect(sprX + dir * 12, glowY, 2, 4);

            } else if (this.ps.job === 'thief') {
                // 단검 2자루 끝점 반짝임
                const alpha = 0.5 + shimmer * 0.25;
                g.fillStyle(0xffffff, alpha);
                g.fillRect(sprX + dir * 12, sprY - 20 + shimmer * 2, 2, 2);
                g.fillRect(sprX + dir * 12, sprY -  8 + shimmer * 2, 2, 2);

            } else if (this.ps.job === 'archer') {
                // 활 끝 포인트 glow (bowX 근처, 위아래로 미세 이동)
                const bowX = sprX + dir * 24;
                g.fillStyle(0xffffaa, 0.40 + shimmer * 0.20);
                g.fillCircle(bowX, sprY - 28 + shimmer * 3, 2);
            }
        }

        for (let i = 0; i < this.ps.trail.length; i++) {
            const t = this.ps.trail[i];
            const alpha = 0.2 - i * 0.04;
            g.fillStyle(colorHex, alpha);
            g.fillRect(t.x - 12, t.y - 25, 24, 50);
        }

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
        // ─── fxLayer Glow (ADD blend mode) ──────────────────────────────
        const fx = this.fxLayer;
        if (fx && this.playerSprite) {
            const sprX = this.playerSprite.x;
            const sprY = this.playerSprite.y;
            const dir  = this.ps.direction;

            // 1) 무기 윈드업 Glow: 공격 중 무기 끝 발광
            if (this.ps.isAttacking) {
                if (this.ps.job === 'warrior') {
                    fx.fillStyle(0xff8800, 0.40);
                    fx.fillCircle(sprX + dir * 14, sprY - 38, 10);
                    fx.fillStyle(0xffffff, 0.20);
                    fx.fillCircle(sprX + dir * 14, sprY - 38, 5);
                } else if (this.ps.job === 'thief') {
                    fx.fillStyle(0xaa00ff, 0.40);
                    fx.fillCircle(sprX + dir * 13, sprY - 20, 7);
                    fx.fillStyle(0xaa00ff, 0.30);
                    fx.fillCircle(sprX + dir * 13, sprY - 8,  6);
                } else if (this.ps.job === 'archer') {
                    fx.fillStyle(0xffff00, 0.40);
                    fx.fillCircle(sprX + dir * 20, sprY - 34, 7);
                    fx.fillStyle(0xffffff, 0.20);
                    fx.fillCircle(sprX + dir * 20, sprY - 34, 3);
                }
            }

            // 2) 캐릭터 Rim Light: 버프/피격 무적 상태에 따른 외곽 발광
            let rimColor = 0, rimAlpha = 0;
            if (this.ps.buffs.rage || this.ps.buffs.berserker || this.ps.buffs.heroicWill) {
                rimColor = 0xff2200;
                rimAlpha = 0.22 + Math.sin(time * 0.01) * 0.10;
            } else if (this.ps.buffs.haste || this.ps.buffs.swiftness || this.ps.buffs.shadowShift) {
                rimColor = 0x9900ff;
                rimAlpha = 0.20 + Math.sin(time * 0.01) * 0.08;
            } else if (this.ps.buffs.soul || this.ps.buffs.archerSoul || this.ps.buffs.keenEyes) {
                rimColor = 0x00ff88;
                rimAlpha = 0.18 + Math.sin(time * 0.01) * 0.08;
            } else if (this.ps.buffs.holyLight || this.ps.buffs.natureBless) {
                rimColor = 0xffffaa;
                rimAlpha = 0.20 + Math.sin(time * 0.008) * 0.07;
            } else if ((this.ps.invincible || 0) > 20) {
                rimColor = 0xff4444;
                rimAlpha = 0.18;
            }
            if (rimAlpha > 0) {
                fx.fillStyle(rimColor, rimAlpha * 0.7);
                fx.fillCircle(bx, by - 25, 30);
                fx.fillStyle(rimColor, rimAlpha * 0.35);
                fx.fillCircle(bx, by - 25, 42);
            }
        }

        // 3) 레벨업/전직 Glow Burst: 방사형 흰색 원 확장 (levelUpGlowStart 기반)
        if (this.gs.levelUpGlowStart > 0 && this.fxLayer) {
            const elapsed = time - this.gs.levelUpGlowStart;
            const dur = this.gs.levelUpGlowDur;
            if (elapsed < dur) {
                const t = elapsed / dur;
                const r = t * 90;
                const alpha = (1 - t) * 0.85;
                this.fxLayer.fillStyle(0xffffff, alpha * 0.6);
                this.fxLayer.fillCircle(bx, by - 25, r);
                this.fxLayer.fillStyle(0xffffaa, alpha * 0.3);
                this.fxLayer.fillCircle(bx, by - 25, r * 0.6);
            } else {
                this.gs.levelUpGlowStart = 0;
            }
        }
    }

    drawMonsterOverlays(g) {
        for (const m of this.monsters) {
            if (m.dead) continue;
            const mx = m.x;
            const my = m.y;

            if (m.hp < m.maxHp) {
                const bw = m.w + 10;
                g.fillStyle(0x333333, 1);
                g.fillRect(mx - bw / 2, my - m.h / 2 - 14, bw, 7);
                const hpRatio = m.hp / m.maxHp;
                const hpCol = hpRatio > 0.5 ? 0x44ff44 : hpRatio > 0.25 ? 0xffaa00 : 0xff2222;
                g.fillStyle(hpCol, 1);
                g.fillRect(mx - bw / 2, my - m.h / 2 - 14, Math.max(1, bw * hpRatio), 7);
            }

            let nameTxt = this.monsterNameTexts.get(m.id);
            if (!nameTxt) {
                nameTxt = this.add.text(0, 0, m.mt.name, {
                    fontSize: '11px', color: '#cccccc', stroke: '#000000', strokeThickness: 2
                }).setOrigin(0.5).setDepth(50);
                this.monsterNameTexts.set(m.id, nameTxt);
            }
            nameTxt.setPosition(mx, my - m.h / 2 - 18);
        }
    }
    drawPlayer(g, time) {
        const bx = this.playerBody.x;
        const by = this.playerBody.y;
        const job = JOBS[this.ps.job];

        // Shadow under character
        g.fillStyle(0x000000, 0.28);
        g.fillEllipse(bx, by + 28, 38, 8);

        // Haste/swiftness afterimage trail
        if (this.ps.buffs.haste || this.ps.buffs.swiftness) {
            for (let i = 0; i < this.ps.trail.length; i++) {
                const t = this.ps.trail[i];
                const alpha = (0.18 - i * 0.04) * 0.8;
                g.fillStyle(0xaa44ff, alpha);
                g.fillEllipse(t.x, t.y - 20, 30, 50);
            }
        }

        // Buff aura rings
        if (this.ps.buffs.rage || this.ps.buffs.berserker || this.ps.buffs.heroicWill) {
            const r = 32 + Math.sin(time / 80) * 5;
            g.lineStyle(4, 0xff4400, 0.55);
            g.strokeCircle(bx, by - 10, r);
            for (let k = 0; k < 4; k++) {
                const ang = (k / 4) * Math.PI * 2 + time / 200;
                g.fillStyle(0xff6600, 0.4);
                g.fillCircle(bx + Math.cos(ang) * (r + 4), by - 10 + Math.sin(ang) * (r + 4) * 0.5, 4);
            }
        }
        if (this.ps.buffs.haste || this.ps.buffs.swiftness) {
            const r = 30 + Math.sin(time / 60) * 4;
            g.lineStyle(3, 0xaa44ff, 0.5);
            g.strokeCircle(bx, by - 10, r);
        }
        if (this.ps.buffs.soul || this.ps.buffs.archerSoul || this.ps.buffs.keenEyes) {
            const r = 32 + Math.sin(time / 90) * 4;
            g.lineStyle(3, 0x44ff88, 0.5);
            g.strokeCircle(bx, by - 10, r);
            for (let k = 0; k < 3; k++) {
                const ang = (k / 3) * Math.PI * 2 + time / 300;
                g.fillStyle(0x44ffaa, 0.35);
                g.fillCircle(bx + Math.cos(ang) * (r - 4), by - 10 + Math.sin(ang) * (r - 4) * 0.5, 3);
            }
        }
        if (this.ps.buffs.holyLight || this.ps.buffs.natureBless) {
            const r = 35 + Math.sin(time / 120) * 4;
            g.lineStyle(3, 0xffffaa, 0.45);
            g.strokeCircle(bx, by - 10, r);
            g.lineStyle(2, 0xffff88, 0.3);
            g.lineBetween(bx, by - 10 - r - 6, bx, by - 10 + r + 6);
            g.lineBetween(bx - r - 6, by - 10, bx + r + 6, by - 10);
        }

        // Tier 2+ orbiting particles
        if (this.ps.tier >= 2) {
            const auraColor = this.ps.tier >= 3 ? 0xffd700 : 0xaaaaff;
            const pulseR = 3 + Math.sin(time / 150) * 1.5;
            const orbitCount = this.ps.tier >= 3 ? 4 : 2;
            for (let k = 0; k < orbitCount; k++) {
                const ang = (k / orbitCount) * Math.PI * 2 + time / 400;
                g.fillStyle(auraColor, 0.7);
                g.fillCircle(bx + Math.cos(ang) * 22, by - 18 + Math.sin(ang) * 10, pulseR);
            }
        }
    }

    // ??????????????????????????????????????????????????????????
    //  紐ъ뒪???뚮뜑留?    // ??????????????????????????????????????????????????????????
    drawMonster(g, m, time) {
        const bounce = Math.sin(m.animFrame) * 3;
        const mx = m.x, my = m.y;
        const mt = m.mt;
        const col = mt.color;

        // HP 諛?
        if (m.hp < m.maxHp) {
            const bw = m.w + 10;
            g.fillStyle(0x333333, 1);
            g.fillRect(mx - bw / 2, my - m.h / 2 - 14, bw, 7);
            const hpRatio = m.hp / m.maxHp;
            const hpCol = hpRatio > 0.5 ? 0x44ff44 : hpRatio > 0.25 ? 0xffaa00 : 0xff2222;
            g.fillStyle(hpCol, 1);
            g.fillRect(mx - bw / 2, my - m.h / 2 - 14, Math.max(1, bw * hpRatio), 7);
        }

        // 臾댁쟻 源쒕묀??
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
                // 以꾧린
                g.fillStyle(0xcc9966, 1);
                g.fillRect(mx - 12, my, 24, 25);
                // 紐⑥옄
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
                // 遺덇퐙
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
                // 紐명넻
                g.fillStyle(0x8844ff, 1);
                g.fillEllipse(mx, my + bounce / 2, m.w, m.h);
                // ?좉컻
                g.fillStyle(0x6622dd, 0.7);
                g.fillTriangle(mx - 40, my - 10, mx - 20, my - 30, mx - 10, my);
                g.fillTriangle(mx + 40, my - 10, mx + 20, my - 30, mx + 10, my);
                // 肉?                g.fillStyle(0x222222, 1);
                g.fillTriangle(mx - 20, my - m.h / 2, mx - 25, my - m.h / 2 - 20, mx - 15, my - m.h / 2);
                g.fillTriangle(mx + 20, my - m.h / 2, mx + 15, my - m.h / 2 - 20, mx + 25, my - m.h / 2);
                // ??                g.fillStyle(0xff0000, 1);
                g.fillCircle(mx - 20, my - m.h / 2 + 15, 7);
                g.fillCircle(mx + 20, my - m.h / 2 + 15, 7);
                break;
            }
        }

        // ?대쫫 ?덉씠釉?(??먯꽌 ?ъ궗??
        let nameTxt = this.monsterNameTexts.get(m.id);
        if (!nameTxt) {
            nameTxt = this.add.text(0, 0, mt.name, {
                fontSize: '11px', color: '#cccccc', stroke: '#000000', strokeThickness: 2
            }).setOrigin(0.5).setDepth(50);
            this.monsterNameTexts.set(m.id, nameTxt);
        }
        nameTxt.setPosition(mx, my - m.h / 2 - 18);
    }

    // ??????????????????????????????????????????????????????????
    //  ?댄럺???뚮뜑留?    // ??????????????????????????????????????????????????????????
    drawEffect(g, e, p) {
        const { x, y, dir, type } = e;
        const inv = 1 - p;

        switch (type) {
            case 'swordSlash': {
                const r = 55 + p * 30;
                const startA = dir === 1 ? -0.5 : Math.PI + 0.5;
                const endA   = dir === 1 ?  0.9 : Math.PI - 0.9;
                g.lineStyle(7 * inv, 0xffffff, 0.8 * inv);
                g.beginPath(); g.arc(x, y, r,      startA, endA, dir !== 1); g.strokePath();
                g.lineStyle(4 * inv, 0xffdd88, 0.7 * inv);
                g.beginPath(); g.arc(x, y, r - 10, startA, endA, dir !== 1); g.strokePath();
                g.lineStyle(2 * inv, 0xaaddff, 0.5 * inv);
                g.beginPath(); g.arc(x, y, r + 12, startA, endA, dir !== 1); g.strokePath();
                const ex = x + dir * (r * 0.8);
                const ey = y - r * 0.3;
                g.fillStyle(0xffffff, inv * 0.8);
                g.fillCircle(ex, ey, 5 * inv);
                // ADD glow: white spark at hit tip
                if (p > 0.6 && this.fxLayer) {
                    const glowAlpha = (p - 0.6) / 0.4;
                    this.fxLayer.fillStyle(0xffffff, glowAlpha * 0.6);
                    this.fxLayer.fillCircle(ex, ey, 10);
                    this.fxLayer.fillStyle(0xffeedd, glowAlpha * 0.4);
                    this.fxLayer.fillCircle(ex, ey, 18);
                }
                break;
            }
            case 'daggerSlash': {
                const r2 = 40 + p * 20;
                const offsets = [[-1, -1], [1, 1], [-1, 1], [1, -1]];
                offsets.forEach(([ox, oy], idx) => {
                    const kp = Math.max(0, inv - idx * 0.1);
                    g.lineStyle(4 * kp, idx < 2 ? 0xcc66ff : 0xaa44dd, kp);
                    g.lineBetween(x + dir * ox * 5, y + oy * 5,
                                  x + dir * ox * r2, y + oy * r2 * 0.7);
                });
                g.fillStyle(0xeeddff, inv * 0.6);
                g.fillCircle(x, y, 8 * inv);
                break;
            }
            case 'arrowTrail': {
                const al = 30 + p * 25;
                g.lineStyle(3 * inv, 0xffcc44, inv);
                g.lineBetween(x - dir * 10, y, x + dir * al, y);
                g.fillStyle(0xffee88, inv);
                g.fillTriangle(x + dir * al, y, x + dir * (al - 8), y - 4, x + dir * (al - 8), y + 4);
                g.lineStyle(1, 0xffaa00, inv * 0.5);
                g.lineBetween(x - dir * 20, y - 3, x + dir * al, y - 3);
                g.lineBetween(x - dir * 15, y + 3, x + dir * al, y + 3);
                break;
            }
            case 'powerStrike': {
                const sz = 40 + p * 80;
                const tx = x + dir * 35;
                g.fillStyle(0xffaa00, 0.4 * inv);
                g.fillCircle(tx, y, sz * 0.55);
                g.lineStyle(5 * inv, 0xffff00, inv);
                for (let k = 0; k < 8; k++) {
                    const ang = (k / 8) * Math.PI * 2;
                    const rl = sz * (0.4 + (k % 2) * 0.25);
                    g.lineBetween(tx, y, tx + Math.cos(ang) * rl, y + Math.sin(ang) * rl);
                }
                g.lineStyle(3 * inv, 0xff8800, 0.7 * inv);
                g.strokeCircle(tx, y, sz * 0.7);
                g.fillStyle(0xffffff, 0.9 * inv * inv);
                g.fillCircle(tx, y, 12 * inv);
                // ADD glow: orange explosion core
                if (this.fxLayer) {
                    this.fxLayer.fillStyle(0xff8800, inv * 0.8);
                    this.fxLayer.fillCircle(tx, y, 20 * inv);
                    this.fxLayer.fillStyle(0xffffff, inv * inv * 0.6);
                    this.fxLayer.fillCircle(tx, y, 8 * inv);
                }
                break;
            }
            case 'slashBlast': {
                const r4 = p * 160;
                g.lineStyle(8 * inv, 0x4466ff, 0.75 * inv);
                g.strokeCircle(x, y, r4);
                g.lineStyle(4 * inv, 0x88aaff, 0.5 * inv);
                g.strokeCircle(x, y, r4 * 0.72);
                g.lineStyle(2 * inv, 0xaaccff, 0.35 * inv);
                g.strokeCircle(x, y, r4 * 0.45);
                if (p < 0.4) {
                    const cf = 1 - p / 0.4;
                    g.fillStyle(0x6688ff, cf * 0.55);
                    g.fillCircle(x, y, r4 * 0.3);
                    g.fillStyle(0xffffff, cf * 0.4);
                    g.fillCircle(x, y, r4 * 0.1);
                }
                for (let k = 0; k < 6; k++) {
                    const sa = (k / 6) * Math.PI * 2 + p * 2;
                    const sl = r4 * 0.85;
                    g.fillStyle(0x8899ff, inv * 0.7);
                    g.fillCircle(x + Math.cos(sa) * sl, y + Math.sin(sa) * sl * 0.6, 4 * inv);
                }
                // ADD glow: blue inner core
                if (this.fxLayer && p < 0.5) {
                    const cf2 = 1 - p / 0.5;
                    this.fxLayer.fillStyle(0x4488ff, cf2 * 0.7);
                    this.fxLayer.fillCircle(x, y, r4 * 0.35);
                    this.fxLayer.fillStyle(0xaaccff, cf2 * 0.4);
                    this.fxLayer.fillCircle(x, y, r4 * 0.15);
                }
                break;
            }
            case 'doubleStab':
            case 'quadStab': {
                const count = type === 'quadStab' ? 4 : 3;
                for (let k = 0; k < count; k++) {
                    const kp = Math.max(0, p - k * 0.18);
                    const kl = 45 + kp * 25;
                    const ki = 1 - kp;
                    g.lineStyle(4 * ki, 0xcc66ff, ki * 0.85);
                    g.lineBetween(x, y + k * 9 - 13, x + dir * kl, y + k * 9 - 13);
                    g.lineStyle(1, 0x9933cc, ki * 0.4);
                    g.lineBetween(x, y + k * 9 - 13, x + dir * kl, y + k * 9 - 13);
                }
                g.fillStyle(0xeeaaff, inv * 0.7);
                g.fillCircle(x + dir * (45 + p * 25), y - 4, 5 * inv);
                break;
            }
            case 'assassinate':
            case 'stealthBackstab': {
                g.fillStyle(0x220033, 0.55 * inv);
                g.fillCircle(x, y, 60 * p + 15);
                const boltCount = type === 'stealthBackstab' ? 5 : 3;
                for (let k = 0; k < boltCount; k++) {
                    const ba = (k / boltCount) * Math.PI * 2 + p * 3;
                    const bl = 45 + p * 35;
                    g.lineStyle(2 * inv, 0xff44ff, inv * 0.85);
                    g.lineBetween(x, y, x + Math.cos(ba) * bl, y + Math.sin(ba) * bl * 0.7);
                }
                g.lineStyle(4 * inv, 0xff00ff, inv);
                g.lineBetween(x, y - 45, x + dir * 85 * p, y + 18);
                g.fillStyle(0xaa00cc, inv * 0.45);
                g.fillCircle(x, y, 20 * inv);
                // ADD glow: purple assassin core
                if (this.fxLayer) {
                    this.fxLayer.fillStyle(0xcc00ff, inv * 0.7);
                    this.fxLayer.fillCircle(x, y, 14 * inv);
                    this.fxLayer.fillStyle(0xff88ff, inv * inv * 0.5);
                    this.fxLayer.fillCircle(x, y, 6 * inv);
                }
                break;
            }
            case 'doubleShot': {
                for (let lane = -1; lane <= 1; lane += 2) {
                    const al2 = 30 + p * 28;
                    const ly  = y + lane * 7;
                    g.lineStyle(3 * inv, 0xffcc44, inv);
                    g.lineBetween(x - dir * 8, ly, x + dir * al2, ly);
                    g.fillStyle(0xffee88, inv);
                    g.fillTriangle(x + dir * al2, ly,
                                   x + dir * (al2 - 8), ly - 4,
                                   x + dir * (al2 - 8), ly + 4);
                }
                break;
            }
            case 'arrowRain': {
                const laneCount = e.laneCount || 15;
                const startX = e.startX ?? (e.x - 200);
                const width = e.width || 400;
                const topY = e.topY ?? 40;
                const impactY = e.impactY ?? 520;
                const ay = topY + p * (impactY - topY);
                for (let k = 0; k < laneCount; k++) {
                    const ax = startX + ((k + 0.5) / laneCount) * width;
                    const a  = (1 - p) * 0.9;
                    g.lineStyle(2, 0xffcc44, a);
                    g.lineBetween(ax, ay - 34, ax, ay);
                    g.fillStyle(0xffee88, a);
                    g.fillTriangle(ax - 4, ay, ax + 4, ay, ax, ay + 10);
                    g.fillStyle(0xff8800, a * 0.7);
                    g.fillTriangle(ax - 3, ay - 30, ax, ay - 22, ax + 3, ay - 30);
                }
                break;
            }
            case 'tripleShot': {
                const angles = [-0.28, 0, 0.28];
                const coreLen = 36 + p * 38;
                angles.forEach((ang, idx) => {
                    const ex2 = x + dir * Math.cos(ang) * coreLen;
                    const ey2 = y + Math.sin(ang) * coreLen;
                    const laneAlpha = inv * (idx === 1 ? 1 : 0.85);
                    g.lineStyle(4 * laneAlpha, 0xffd766, laneAlpha);
                    g.lineBetween(x, y, ex2, ey2);
                    g.lineStyle(2 * laneAlpha, 0xfff4b0, laneAlpha * 0.85);
                    g.lineBetween(x + dir * 4, y, ex2 + dir * 4, ey2);
                    const nx = (ex2 - x) / coreLen;
                    const ny = (ey2 - y) / coreLen;
                    g.fillStyle(0xfff0a8, laneAlpha);
                    g.fillTriangle(ex2, ey2, ex2 - nx * 10 - ny * 5, ey2 - ny * 10 + nx * 5,
                                              ex2 - nx * 10 + ny * 5, ey2 - ny * 10 - nx * 5);
                });
                g.lineStyle(2 * inv, 0xffe899, inv * 0.6);
                g.strokeCircle(x, y, 8 + p * 18);
                if (this.fxLayer) {
                    this.fxLayer.fillStyle(0xffcc66, inv * 0.6);
                    this.fxLayer.fillCircle(x + dir * 8, y, 12 * inv);
                    this.fxLayer.fillStyle(0xffffff, inv * inv * 0.55);
                    this.fxLayer.fillCircle(x + dir * 11, y, 5 * inv);
                }
                break;
            }
            case 'arrowRainImpact': {
                const ir = 12 + p * 28;
                g.fillStyle(0xffaa33, (1 - p) * 0.45);
                g.fillCircle(x, y, ir);
                g.lineStyle(3 * inv, 0xffdd66, inv);
                g.strokeCircle(x, y, ir * 1.1);
                if (this.fxLayer) {
                    this.fxLayer.fillStyle(0xffeeaa, inv * 0.6);
                    this.fxLayer.fillCircle(x, y, ir * 0.55);
                }
                break;
            }
            case 'explosion': {
                const er = 25 + p * 90;
                g.fillStyle(0xff4400, (1 - p) * 0.65);
                g.fillCircle(x, y, er);
                g.fillStyle(0xff9900, (1 - p) * 0.55);
                g.fillCircle(x, y, er * 0.65);
                g.fillStyle(0xffff88, (1 - p) * 0.45);
                g.fillCircle(x, y, er * 0.35);
                g.lineStyle(3 * inv, 0xff8800, 0.6 * inv);
                g.strokeCircle(x, y, er * 1.2);
                // ADD glow: white hot core
                if (this.fxLayer) {
                    this.fxLayer.fillStyle(0xffffff, inv * inv * 0.9);
                    this.fxLayer.fillCircle(x, y, er * 0.25);
                    this.fxLayer.fillStyle(0xffaa44, inv * 0.6);
                    this.fxLayer.fillCircle(x, y, er * 0.5);
                }
                break;
            }
            case 'rageActivate': {
                const rr = 25 + p * 50;
                g.fillStyle(0xff2200, 0.35 * inv);
                g.fillCircle(x, y, rr * 1.1);
                for (let k = 0; k < 10; k++) {
                    const ang = (k / 10) * Math.PI * 2 + p * Math.PI;
                    g.lineStyle(4 * inv, 0xff4400, inv);
                    g.lineBetween(x, y, x + Math.cos(ang) * rr, y + Math.sin(ang) * rr * 0.7);
                    g.fillStyle(0xffaa00, inv * 0.8);
                    g.fillCircle(x + Math.cos(ang) * rr * 0.85, y + Math.sin(ang) * rr * 0.6, 3);
                }
                for (let k = 0; k < 5; k++) {
                    const fx = x - 20 + k * 10;
                    const fy = y - 10 - p * 40 - k * 4;
                    g.fillStyle(0xff6600, inv * 0.6);
                    g.fillTriangle(fx - 4, fy + 16, fx, fy, fx + 4, fy + 16);
                }
                break;
            }
            case 'hasteActivate': {
                for (let k = 0; k < 8; k++) {
                    const hy = y - 20 + k * 8;
                    const hl = 20 + k * 3;
                    g.lineStyle(3 * inv, 0xaa44ff, inv * (1 - k * 0.1));
                    g.lineBetween(x - hl - p * 20, hy, x + hl + p * 10, hy);
                }
                for (let k = 0; k < 6; k++) {
                    const sang = (k / 6) * Math.PI * 2;
                    const sl = 25 + p * 20;
                    g.lineStyle(2 * inv, 0xcc88ff, inv * 0.6);
                    g.lineBetween(x, y, x + Math.cos(sang) * sl, y + Math.sin(sang) * sl * 0.5);
                }
                break;
            }
            case 'soulActivate': {
                for (let k = 0; k < 8; k++) {
                    const sang = (k / 8) * Math.PI * 2 + p * Math.PI * 2;
                    const sr2 = 20 + p * 30;
                    const salpha = (1 - k / 8) * inv * 0.7;
                    g.fillStyle(0x44ff88, salpha);
                    g.fillCircle(x + Math.cos(sang) * sr2, y + Math.sin(sang) * sr2 * 0.5, 4);
                }
                g.lineStyle(2 * inv, 0x44ffaa, inv * 0.5);
                g.strokeCircle(x, y, 30 + p * 25);
                break;
            }
            case 'holyLightActivate': {
                const hr = 30 + p * 40;
                g.fillStyle(0xffff88, (1 - p) * 0.45);
                g.fillCircle(x, y, hr * 1.2);
                g.lineStyle(5 * inv, 0xffffaa, inv);
                g.strokeCircle(x, y, hr * 0.7);
                for (let k = 0; k < 4; k++) {
                    const ca = (k / 4) * Math.PI * 2;
                    g.lineStyle(4 * inv, 0xffffff, inv * 0.9);
                    g.lineBetween(x, y, x + Math.cos(ca) * hr, y + Math.sin(ca) * hr);
                }
                for (let k = 0; k < 6; k++) {
                    const ka = (k / 6) * Math.PI * 2 + p;
                    g.fillStyle(0xffffff, inv * 0.7);
                    g.fillCircle(x + Math.cos(ka) * hr * 0.7, y + Math.sin(ka) * hr * 0.7, 3);
                }
                break;
            }
            case 'levelUp': {
                const lr = p * 70;
                g.lineStyle(6 * inv, 0xffff00, inv);
                g.strokeCircle(x, y, lr);
                g.lineStyle(3 * inv, 0xffffff, inv * 0.6);
                g.strokeCircle(x, y, lr * 0.65);
                g.fillStyle(0xffff00, inv * 0.35);
                g.fillCircle(x, y - 55 - p * 45, 22 * inv);
                for (let k = 0; k < 8; k++) {
                    const la = (k / 8) * Math.PI * 2;
                    g.lineStyle(3 * inv, 0xffff44, inv * 0.7);
                    g.lineBetween(x, y, x + Math.cos(la) * lr * 0.7, y + Math.sin(la) * lr * 0.7);
                }
                break;
            }
            case 'promotion': {
                for (let k = 0; k < 16; k++) {
                    const pang = (k / 16) * Math.PI * 2 + p * 2;
                    const pr2 = 45 + p * 70;
                    const pk  = k % 2 === 0 ? 1 : 0.6;
                    g.lineStyle(4 * inv * pk, 0xffffff, inv * pk);
                    g.lineBetween(x, y, x + Math.cos(pang) * pr2 * pk, y + Math.sin(pang) * pr2 * pk);
                }
                g.lineStyle(3 * inv, 0xffcc00, inv * 0.7);
                g.strokeCircle(x, y, 50 + p * 60);
                break;
            }
            case 'critBurst': {
                const cr = p * 45;
                g.lineStyle(4 * inv, 0xffff00, inv);
                for (let k = 0; k < 8; k++) {
                    const ca = (k / 8) * Math.PI * 2;
                    g.lineBetween(x, y, x + Math.cos(ca) * cr, y + Math.sin(ca) * cr);
                }
                g.fillStyle(0xffffff, inv * 0.5);
                g.fillCircle(x, y, 10 * inv);
                break;
            }
            case 'shieldCounter': {
                const bw2 = 55 * inv, bh2 = 65 * inv;
                g.lineStyle(5 * inv, 0x8888ff, inv);
                g.strokeRect(x - bw2 / 2, y - bh2 / 2, bw2, bh2);
                g.fillStyle(0x4444ff, 0.25 * inv);
                g.fillRect(x - bw2 / 2, y - bh2 / 2, bw2, bh2);
                break;
            }
            case 'stealthActivate': {
                g.fillStyle(0x330044, 0.55 * inv);
                g.fillCircle(x, y, 45 * p + 10);
                g.lineStyle(2 * inv, 0xaa00cc, inv * 0.6);
                g.strokeCircle(x, y, 40 * p + 8);
                break;
            }
            case 'monsterDie': {
                const dr = p * 60;
                for (let k = 0; k < 8; k++) {
                    const da = (k / 8) * Math.PI * 2;
                    const dl = dr * (0.7 + (k % 2) * 0.3);
                    g.lineStyle(4 * inv, 0xffaa00, inv);
                    g.lineBetween(x, y, x + Math.cos(da) * dl, y + Math.sin(da) * dl);
                    g.fillStyle(0xff6600, inv * 0.7);
                    g.fillCircle(x + Math.cos(da) * dl, y + Math.sin(da) * dl, 4 * inv);
                }
                g.fillStyle(0xffff00, inv * 0.5);
                g.fillCircle(x, y, 20 * inv);
                break;
            }
        }
    }

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

    // ??????????????????????????????????????????????????????????
    //  ?뚰떚???뚮뜑留?    // ??????????????????????????????????????????????????????????
    drawParticles(g) {
        for (const p of this.particles) {
            const alpha = p.life / (p.maxLife || 40);
            g.fillStyle(p.color, alpha);
            g.fillCircle(p.x, p.y, p.size);
        }
    }

    // ??????????????????????????????????????????????????????????
    //  誘몃땲留?    // ??????????????????????????????????????????????????????????
    drawMinimap(g) {
        const MX = 800, MY = 530, MW = 180, MH = 60;
        const scaleX = MW / WORLD_WIDTH, scaleY = MH / 600;

        g.fillStyle(0x000000, 0.6);
        g.fillRect(MX, MY, MW, MH);
        g.lineStyle(1, 0x4466aa, 0.8);
        g.strokeRect(MX, MY, MW, MH);

        // ?뚮옯??        g.fillStyle(0x3a6b3a, 1);
        for (const p of PLATFORMS) {
            g.fillRect(MX + p.x * scaleX, MY + p.y * scaleY, p.w * scaleX, Math.max(2, p.h * scaleY));
        }

        // 紐ъ뒪??        g.fillStyle(0xff2222, 1);
        for (const m of this.monsters) {
            if (!m.dead) g.fillCircle(MX + m.x * scaleX, MY + m.y * scaleY, 3);
        }

        // ?뚮젅?댁뼱
        g.fillStyle(0x44ff44, 1);
        g.fillCircle(MX + this.playerBody.x * scaleX, MY + this.playerBody.y * scaleY, 4);
    }

    // ??????????????????????????????????????????????????????????
    //  肄ㅻ낫 移댁슫??    // ??????????????????????????????????????????????????????????
    drawCombo(g, time) {
        if (this.gs.combo < 2) return;
        const pulse = 1 + Math.sin(time / 150) * 0.08;
        const col = this.gs.combo >= 50 ? 0xff2244 : this.gs.combo >= 20 ? 0xff8800 : 0xffffff;
        // 肄ㅻ낫 ?띿뒪?몃뒗 Phaser Text濡?蹂꾨룄 泥섎━媛 ?섏뼱 ?덉뼱 ?ш린?쒕뒗 諛곌꼍 諛뺤뒪留?洹몃┝
        g.fillStyle(0x000000, 0.4);
        g.fillRoundedRect(900 - 80, 140, 95, 50, 6);
    }

    drawMesoCounter(g) {
        g.fillStyle(0x000000, 0.4);
        g.fillRoundedRect(900 - 80, 200, 95, 35, 6);
    }

    // ??????????????????????????????????????????????????????????
    //  ?쇱떆?뺤? ?ㅻ쾭?덉씠
    // ??????????????????????????????????????????????????????????
    drawPauseOverlay(g) {
        g.fillStyle(0x000000, 0.5);
        g.fillRect(0, 0, 1000, 600);
        g.fillStyle(0x1a1a4a, 0.9);
        g.fillRoundedRect(350, 200, 300, 200, 16);
        g.lineStyle(2, 0x4466ff, 1);
        g.strokeRoundedRect(350, 200, 300, 200, 16);
    }
}


