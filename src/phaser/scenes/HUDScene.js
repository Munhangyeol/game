import { JOBS } from '../../../data/jobs.js';

export default class HUDScene extends Phaser.Scene {
    constructor() {
        super('HUDScene');
    }

    create() {
        // GameScene이 HUD 뒤로 보이도록 카메라 배경을 명시적으로 투명하게 설정
        this.cameras.main.setBackgroundColor('rgba(0,0,0,0)');

        // HUD 요소들 생성
        this.createHPMPBars();
        this.createSkillBar();
        this.createBuffDisplay();
        this.createInfoLabels();
        this.createComboText();
        this.createMesoText();
        this.createChatLog();

        // 일시정지 텍스트
        this.pauseGroup = this.add.group();
        this.createPauseUI();
    }

    // ──────────────────────────────────────────────────────────
    //  HP / MP / EXP 바
    // ──────────────────────────────────────────────────────────
    createHPMPBars() {
        const x = 10, y = 10;

        // 레벨/직업 표시
        this.levelText = this.add.text(x, y, 'Lv.1 전사', {
            fontSize: '16px', color: '#ffffff', stroke: '#000', strokeThickness: 3, fontStyle: 'bold'
        });

        // HP 바
        this.hpBg    = this.add.graphics();
        this.hpBar   = this.add.graphics();
        this.hpText  = this.add.text(x, y + 30, 'HP', { fontSize: '13px', color: '#ff6666', fontStyle: 'bold' });
        this.hpVal   = this.add.text(x + 210, y + 30, '200/200', { fontSize: '13px', color: '#ffffff' });

        // MP 바
        this.mpBg    = this.add.graphics();
        this.mpBar   = this.add.graphics();
        this.mpText  = this.add.text(x, y + 52, 'MP', { fontSize: '13px', color: '#6688ff', fontStyle: 'bold' });
        this.mpVal   = this.add.text(x + 210, y + 52, '50/50', { fontSize: '13px', color: '#ffffff' });

        // EXP 바
        this.expBg   = this.add.graphics();
        this.expBar  = this.add.graphics();
        this.expText = this.add.text(x, y + 74, 'EXP', { fontSize: '13px', color: '#66ff66', fontStyle: 'bold' });
        this.expVal  = this.add.text(x + 210, y + 74, '0/100', { fontSize: '13px', color: '#aaaaaa' });
    }

    // ──────────────────────────────────────────────────────────
    //  스킬 바 (하단 중앙)
    // ──────────────────────────────────────────────────────────
    createSkillBar() {
        this.skillSlots        = [];
        this.skillLabels       = [];
        this.skillKeys         = [];
        this.skillCoolGraphics = [];
        this.skillIconTexts    = [];  // 스킬 아이콘 (이모지)
        this.skillCoolTexts    = [];  // 쿨다운 숫자

        const keys = ['Z', 'X', 'C'];
        for (let i = 0; i < 3; i++) {
            const sx = 370 + i * 90;
            const sy = 540;

            const slot = this.add.graphics();
            this.skillSlots.push(slot);

            const coolGfx = this.add.graphics();
            this.skillCoolGraphics.push(coolGfx);

            // 키 레이블 (정적)
            this.skillKeys.push(this.add.text(sx, sy - 12, keys[i], {
                fontSize: '13px', color: '#ffffff', stroke: '#000', strokeThickness: 2, fontStyle: 'bold'
            }).setOrigin(0.5));

            // 스킬 아이콘 (영구 텍스트)
            this.skillIconTexts.push(this.add.text(sx, sy + 29, '', { fontSize: '26px' }).setOrigin(0.5));

            // 쿨다운 숫자 (영구 텍스트)
            this.skillCoolTexts.push(this.add.text(sx, sy + 29, '', {
                fontSize: '18px', color: '#ffffff', stroke: '#000', strokeThickness: 3
            }).setOrigin(0.5));

            // 스킬명 레이블
            this.skillLabels.push(this.add.text(sx, sy + 68, '', {
                fontSize: '10px', color: '#cccccc'
            }).setOrigin(0.5));
        }
    }

    // ──────────────────────────────────────────────────────────
    //  버프 표시 (우상단)
    // ──────────────────────────────────────────────────────────
    createBuffDisplay() {
        this.buffTexts = [];
    }

    // ──────────────────────────────────────────────────────────
    //  정보 레이블 (좌상단)
    // ──────────────────────────────────────────────────────────
    createInfoLabels() {
        this.attackText = this.add.text(10, 100, '공격력: 10', {
            fontSize: '13px', color: '#ffffff', stroke: '#000', strokeThickness: 2
        });
        this.critText = this.add.text(10, 118, '크리티컬: 10%', {
            fontSize: '13px', color: '#ffcc44', stroke: '#000', strokeThickness: 2
        });
        this.killText = this.add.text(10, 136, '처치: 0', {
            fontSize: '13px', color: '#ff8888', stroke: '#000', strokeThickness: 2
        });
    }

    createComboText() {
        this.comboText = this.add.text(947, 165, '', {
            fontSize: '26px', color: '#ffffff', stroke: '#000', strokeThickness: 4,
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.comboLabel = this.add.text(947, 188, '', {
            fontSize: '13px', color: '#aaaaaa'
        }).setOrigin(0.5);
    }

    createMesoText() {
        this.mesoText = this.add.text(947, 220, '💰 0', {
            fontSize: '15px', color: '#ffcc44', stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5);
    }

    createChatLog() {
        this.chatTexts = [];
        for (let i = 0; i < 5; i++) {
            const t = this.add.text(10, 490 - i * 18, '', {
                fontSize: '12px', color: '#cccccc', stroke: '#000', strokeThickness: 2
            });
            this.chatTexts.push(t);
        }
    }

    createPauseUI() {
        const g = this.pauseGroup;
        const pauseBg   = this.add.graphics().setVisible(false);
        const pauseTitle = this.add.text(500, 260, '⏸ 일시정지', {
            fontSize: '32px', color: '#ffffff', fontStyle: 'bold',
            stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5).setVisible(false);
        const pauseHint = this.add.text(500, 310, '[P] 또는 [ESC] 계속하기', {
            fontSize: '18px', color: '#aaaadd'
        }).setOrigin(0.5).setVisible(false);
        const pauseHint2 = this.add.text(500, 340, 'Phaser Edition', {
            fontSize: '14px', color: '#556677'
        }).setOrigin(0.5).setVisible(false);

        this.pauseBg    = pauseBg;
        this.pauseTitle = pauseTitle;
        this.pauseHint  = pauseHint;
        this.pauseHint2 = pauseHint2;
    }

    // ──────────────────────────────────────────────────────────
    //  메인 업데이트
    // ──────────────────────────────────────────────────────────
    update() {
        const data = this.registry.get('hud');
        if (!data) return;

        this.updateBars(data);
        this.updateSkillBar(data);
        this.updateLabels(data);
        this.updateCombo(data);
        this.updateBuffs(data);
        this.updateChat(data);
        this.updatePause(data);
    }

    updateBars(d) {
        const x = 10, y = 10;
        const BAR_W = 200, BAR_H = 14;

        // 레벨/직업 텍스트
        const job = JOBS[d.job];
        const tier = job.tiers[d.tier];
        this.levelText.setText(`Lv.${d.level} ${tier.icon}${tier.name}`);

        // HP 바
        this.hpBg.clear();
        this.hpBg.fillStyle(0x330000, 1);
        this.hpBg.fillRoundedRect(x + 28, y + 30, BAR_W, BAR_H, 4);

        const hpRatio = d.hp / d.maxHp;
        const hpColor = hpRatio > 0.5 ? 0xff4444 : hpRatio > 0.25 ? 0xff8800 : 0xff2222;
        this.hpBar.clear();
        this.hpBar.fillStyle(hpColor, 1);
        this.hpBar.fillRoundedRect(x + 28, y + 30, Math.max(2, BAR_W * hpRatio), BAR_H, 4);
        this.hpVal.setText(`${Math.ceil(d.hp)}/${d.maxHp}`);

        // MP 바
        this.mpBg.clear();
        this.mpBg.fillStyle(0x000033, 1);
        this.mpBg.fillRoundedRect(x + 28, y + 52, BAR_W, BAR_H, 4);

        const mpRatio = d.mp / d.maxMp;
        this.mpBar.clear();
        this.mpBar.fillStyle(0x4466ff, 1);
        this.mpBar.fillRoundedRect(x + 28, y + 52, Math.max(2, BAR_W * mpRatio), BAR_H, 4);
        this.mpVal.setText(`${Math.ceil(d.mp)}/${d.maxMp}`);

        // EXP 바
        this.expBg.clear();
        this.expBg.fillStyle(0x003300, 1);
        this.expBg.fillRoundedRect(x + 28, y + 74, BAR_W, BAR_H, 4);

        const expRatio = d.exp / d.expToLevel;
        this.expBar.clear();
        this.expBar.fillStyle(0x44ff44, 1);
        this.expBar.fillRoundedRect(x + 28, y + 74, Math.max(2, BAR_W * expRatio), BAR_H, 4);
        this.expVal.setText(`${d.exp}/${d.expToLevel}`);
    }

    updateSkillBar(d) {
        if (!d.job) return;
        const job = JOBS[d.job];
        const tier = job.tiers[d.tier];

        for (let i = 0; i < 3; i++) {
            const sx = 370 + i * 90;
            const sy = 540;
            const skill = tier.skills[i];
            const cd = Math.max(0, d.skillCooldowns[i]);
            const slot = this.skillSlots[i];
            const coolGfx = this.skillCoolGraphics[i];
            const isReady = cd <= 0;

            // 슬롯 배경
            slot.clear();
            const glow = 0.4 + 0.3 * Math.sin(this.time.now / 400);
            const borderColor = isReady ? 0x4488ff : 0x444455;
            slot.lineStyle(2, borderColor, 1);
            slot.fillStyle(0x0a0a2a, 0.9);
            slot.fillRoundedRect(sx - 34, sy - 2, 68, 68, 6);
            slot.strokeRoundedRect(sx - 34, sy - 2, 68, 68, 6);

            if (isReady) {
                slot.lineStyle(3, 0x44ffff, glow);
                slot.strokeRoundedRect(sx - 36, sy - 4, 72, 72, 8);
            }

            // 스킬 아이콘 (영구 텍스트 업데이트)
            if (skill) {
                this.skillIconTexts[i].setText(cd > 0 ? '' : (skill.icon || '?'));
                this.skillLabels[i].setText(skill.name.length > 6 ? skill.name.slice(0, 6) : skill.name);
            }

            // 쿨다운 오버레이
            coolGfx.clear();
            if (cd > 0 && skill) {
                const cdRatio = Math.min(1, cd / skill.cooldown);
                coolGfx.fillStyle(0x000000, 0.7 * cdRatio);
                coolGfx.fillRoundedRect(sx - 34, sy - 2, 68, 68 * cdRatio, 6);
                this.skillCoolTexts[i].setText((cd / 60).toFixed(1));
            } else {
                this.skillCoolTexts[i].setText('');
            }
        }
    }

    updateLabels(d) {
        this.attackText.setText(`공격력: ${Math.floor(d.attack)}`);
        this.critText.setText(`크리티컬: ${d.critChance.toFixed(1)}%`);
        this.killText.setText(`처치: ${d.kills}`);
    }

    updateCombo(d) {
        if (d.combo >= 2) {
            const col = d.combo >= 50 ? '#ff2244' : d.combo >= 20 ? '#ffaa00' : '#ffffff';
            this.comboText.setText(String(d.combo)).setColor(col);
            this.comboLabel.setText('COMBO').setColor('#888888');
        } else {
            this.comboText.setText('');
            this.comboLabel.setText('');
        }
        this.mesoText.setText(`💰 ${d.meso}`);
    }

    updateBuffs(d) {
        // 기존 버프 텍스트 제거
        this.buffTexts.forEach(t => t.destroy());
        this.buffTexts = [];

        const buffNames = Object.keys(d.buffs);
        buffNames.forEach((name, i) => {
            const buff = d.buffs[name];
            const secs = Math.ceil(buff.duration / 60);
            const icon = buff.icon || '✨';
            const t = this.add.text(10 + i * 70, 160, `${icon}\n${secs}s`, {
                fontSize: '11px', color: '#ffcc44', stroke: '#000', strokeThickness: 2,
                align: 'center'
            }).setOrigin(0.5, 0);
            t.x = 35 + i * 70;
            this.buffTexts.push(t);
        });
    }

    updateChat(d) {
        if (!d.chatMessages) return;
        for (let i = 0; i < this.chatTexts.length; i++) {
            const msg = d.chatMessages[i];
            this.chatTexts[i].setText(msg ? msg.text : '');
        }
    }

    updatePause(d) {
        const paused = d.paused;
        this.pauseBg.setVisible(paused);
        this.pauseTitle.setVisible(paused);
        this.pauseHint.setVisible(paused);
        this.pauseHint2.setVisible(paused);

        if (paused) {
            this.pauseBg.clear();
            this.pauseBg.fillStyle(0x000000, 0.5);
            this.pauseBg.fillRect(0, 0, 1000, 600);
        }
    }
}
