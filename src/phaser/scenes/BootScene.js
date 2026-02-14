export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    drawJobFrame(g, job, anim, frame, w, h) {
        const cx = w / 2;
        const groundY = h - 8;
        const bob = anim === 'walk' ? Math.sin((frame / Math.max(1, 5)) * Math.PI * 2) * 2 : 0;
        const attackPush = anim === 'attack' ? (frame >= 2 ? 4 : 0) : 0;
        const jumpLift = anim === 'jump' ? (frame === 0 ? -8 : -14) : 0;
        const y = groundY + bob + jumpLift;

        const bodyY = y - 24;
        const headY = y - 42;

        g.fillStyle(0x000000, 0.35);
        g.fillEllipse(cx, y + 4, 24, 6);

        const palette = {
            warrior: { body: 0xc84a3f, armor: 0x8e8e99, weapon: 0xd6d9de },
            thief: { body: 0x8e49c8, armor: 0x2f2f3f, weapon: 0xcfd3db },
            archer: { body: 0x3ea862, armor: 0x2f6d45, weapon: 0x8a5a2f },
        }[job];

        g.fillStyle(palette.body, 1);
        g.fillRect(cx - 10 + attackPush, bodyY, 20, 24);

        const legStride = anim === 'walk' ? ((frame % 2 === 0) ? 2 : -2) : 0;
        g.fillStyle(0x1e1f2b, 1);
        g.fillRect(cx - 8 + legStride + attackPush, y - 2, 6, 8);
        g.fillRect(cx + 2 - legStride + attackPush, y - 2, 6, 8);

        g.fillStyle(0xffdeb3, 1);
        g.fillCircle(cx + attackPush, headY, 8);

        g.fillStyle(0x111111, 1);
        g.fillRect(cx + 2 + attackPush, headY - 2, 2, 2);

        if (job === 'warrior') {
            g.fillStyle(palette.armor, 1);
            g.fillRect(cx - 11 + attackPush, headY - 9, 22, 7);
            if (anim === 'attack') {
                g.fillStyle(palette.weapon, 1);
                g.fillRect(cx + 12, headY - 2, 3, 24);
            } else {
                g.fillStyle(palette.weapon, 1);
                g.fillRect(cx + 9 + attackPush, bodyY + 2, 2, 16);
            }
        } else if (job === 'thief') {
            g.fillStyle(palette.armor, 1);
            g.fillTriangle(cx - 9 + attackPush, headY - 10, cx + attackPush, headY - 16, cx + 9 + attackPush, headY - 10);
            if (anim === 'attack') {
                g.fillStyle(palette.weapon, 1);
                g.fillRect(cx + 10, bodyY + 2, 2, 14);
                g.fillRect(cx + 14, bodyY + 4, 2, 12);
            }
        } else if (job === 'archer') {
            g.fillStyle(palette.armor, 1);
            g.fillRect(cx - 11 + attackPush, headY - 10, 22, 7);
            g.lineStyle(2, palette.weapon, 1);
            const bowOffset = anim === 'attack' ? 5 : 0;
            g.beginPath();
            g.arc(cx + 11 + bowOffset, bodyY + 8, 8, -0.9, 0.9, false);
            g.strokePath();
            if (anim === 'attack') {
                g.lineStyle(1, 0xffffaa, 1);
                g.lineBetween(cx + 8, bodyY + 8, cx + 24, bodyY + 8);
            }
        }
    }

    drawMonsterFrame(g, type, frame, w, h) {
        const cx = w / 2;
        const by = h - 4;
        const bob = Math.sin((frame / 4) * Math.PI * 2) * 1.8;

        const colors = {
            slime: [0x44cc44, 0x74ec74],
            mushroom: [0xcc9966, 0xdd3311],
            stump: [0xaa7744, 0x8a5a33],
            fireBug: [0xff6600, 0xff3300],
            rockWhale: [0x8899aa, 0x6677aa],
            dragon: [0x8844ff, 0x5e2cc0],
        };
        const [c1, c2] = colors[type];

        g.fillStyle(0x000000, 0.25);
        g.fillEllipse(cx, by + 2, Math.max(20, w - 8), 6);

        if (type === 'slime') {
            g.fillStyle(c1, 1);
            g.fillEllipse(cx, by - 8 + bob, w - 2, h - 8);
        } else if (type === 'mushroom') {
            g.fillStyle(c1, 1);
            g.fillRect(cx - 9, by - 16, 18, 16);
            g.fillStyle(c2, 1);
            g.fillEllipse(cx, by - 20 + bob, w, 18);
        } else if (type === 'stump') {
            g.fillStyle(c1, 1);
            g.fillRect(cx - w / 2 + 2, by - h + 8 + bob, w - 4, h - 8);
            g.fillStyle(c2, 1);
            g.fillRect(cx - w / 2 + 5, by - h + 16 + bob, w - 10, 4);
        } else if (type === 'fireBug') {
            g.fillStyle(c1, 1);
            g.fillEllipse(cx, by - 12 + bob, w, h - 8);
            g.fillStyle(c2, 0.85);
            for (let i = -2; i <= 2; i++) {
                const fx = cx + i * 6;
                const fh = 6 + ((frame + i + 4) % 3);
                g.fillTriangle(fx - 3, by - h + 8, fx, by - h + 8 - fh, fx + 3, by - h + 8);
            }
        } else if (type === 'rockWhale') {
            g.fillStyle(c1, 1);
            g.fillEllipse(cx, by - 12 + bob, w, h - 6);
            g.fillStyle(c2, 1);
            g.fillRect(cx - w / 2 + ((frame % 2) * 2), by - 8, 16, 10);
        } else if (type === 'dragon') {
            g.fillStyle(c1, 1);
            g.fillEllipse(cx, by - 18 + bob, w, h - 8);
            g.fillStyle(c2, 0.85);
            g.fillTriangle(cx - 22, by - 20, cx - 10, by - 38, cx - 6, by - 16);
            g.fillTriangle(cx + 22, by - 20, cx + 10, by - 38, cx + 6, by - 16);
        }

        g.fillStyle(0x111111, 0.9);
        g.fillCircle(cx - 6, by - 20 + bob, 2);
        g.fillCircle(cx + 6, by - 20 + bob, 2);
    }

    createSpriteTexturesAndAnims() {
        const jobs = ['warrior', 'thief', 'archer'];
        const jobAnims = [
            { name: 'idle', frames: 4, w: 48, h: 64, frameRate: 6 },
            { name: 'walk', frames: 6, w: 48, h: 64, frameRate: 12 },
            { name: 'attack', frames: 4, w: 48, h: 64, frameRate: 18, repeat: 0 },
            { name: 'jump', frames: 2, w: 48, h: 64, frameRate: 6, repeat: 0 },
        ];

        for (const job of jobs) {
            for (const anim of jobAnims) {
                for (let i = 0; i < anim.frames; i++) {
                    const key = `${job}_${anim.name}_${i}`;
                    const g = this.add.graphics();
                    this.drawJobFrame(g, job, anim.name, i, anim.w, anim.h);
                    g.generateTexture(key, anim.w, anim.h);
                    g.destroy();
                }

                const animKey = `anim_${job}_${anim.name}`;
                if (!this.anims.exists(animKey)) {
                    this.anims.create({
                        key: animKey,
                        frames: Array.from({ length: anim.frames }, (_, i) => ({ key: `${job}_${anim.name}_${i}` })),
                        frameRate: anim.frameRate,
                        repeat: anim.repeat ?? -1,
                    });
                }
            }
        }

        const monsters = [
            { type: 'slime', w: 36, h: 30 },
            { type: 'mushroom', w: 40, h: 50 },
            { type: 'stump', w: 38, h: 55 },
            { type: 'fireBug', w: 44, h: 35 },
            { type: 'rockWhale', w: 70, h: 50 },
            { type: 'dragon', w: 80, h: 65 },
        ];

        for (const m of monsters) {
            for (let i = 0; i < 4; i++) {
                const key = `${m.type}_idle_${i}`;
                const g = this.add.graphics();
                this.drawMonsterFrame(g, m.type, i, m.w, m.h);
                g.generateTexture(key, m.w, m.h);
                g.destroy();
            }
            const animKey = `anim_${m.type}_idle`;
            if (!this.anims.exists(animKey)) {
                this.anims.create({
                    key: animKey,
                    frames: Array.from({ length: 4 }, (_, i) => ({ key: `${m.type}_idle_${i}` })),
                    frameRate: 8,
                    repeat: -1,
                });
            }
        }
    }

    create() {
        const g = this.add.graphics();
        g.fillStyle(0xffffff, 1);
        g.fillRect(0, 0, 1, 1);
        g.generateTexture('pixel', 1, 1);
        g.destroy();

        this.createSpriteTexturesAndAnims();

        document.getElementById('job-select-screen').style.display = 'flex';

        window.addEventListener('jobSelected', e => {
            document.getElementById('job-select-screen').style.display = 'none';
            document.getElementById('hud').style.display               = 'block';
            document.getElementById('game-over-screen').style.display  = 'none';
            if (this.scene.isActive('GameScene')) this.scene.stop('GameScene');
            this.scene.launch('GameScene', { job: e.detail.job });
        });

        window.addEventListener('gameRestart', e => {
            document.getElementById('game-over-screen').style.display = 'none';
            document.getElementById('hud').style.display              = 'block';
            if (this.scene.isActive('GameScene')) this.scene.stop('GameScene');
            this.scene.launch('GameScene', { job: e.detail.job });
        });

        window.addEventListener('gameChangeJob', () => {
            document.getElementById('game-over-screen').style.display = 'none';
            document.getElementById('hud').style.display              = 'none';
            if (this.scene.isActive('GameScene')) this.scene.stop('GameScene');
            document.getElementById('job-select-screen').style.display = 'flex';
        });
    }
}

