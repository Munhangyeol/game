import { getBackgroundQualityConfig } from './ParallaxBackgroundSystem.js';

// Color grade: MULTIPLY blend으로 씬 전체에 색조 통일 (light color × scene color)
const THEME_GRADE_CONFIG = {
    dusk_forest: { color: 0xe4d8ff, alpha: 0.80 },  // 연한 라벤더 → 보라-파랑 틴트
    night_ruins:  { color: 0xc8d4ff, alpha: 0.78 },  // 아이스 블루 → 심야 파랑 틴트
    dawn:         { color: 0xffe8cc, alpha: 0.80 },  // 연한 복숭아 → 따뜻한 주황 틴트
    cave:         { color: 0xd4b8ff, alpha: 0.72 },  // 연한 보라 → 던전 어두운 틴트
};

// 테마별 안개·빛줄기·먼지 색상
const THEME_AMBIENCE = {
    dusk_forest: { fogColor: 0xbfd3ff, shaftColor: 0xb9d9ff, dustColor: 0xf6e8bf },
    night_ruins:  { fogColor: 0x7090cc, shaftColor: 0x8899cc, dustColor: 0xd0d8f0 },
    dawn:         { fogColor: 0xffcc88, shaftColor: 0xffaa44, dustColor: 0xffe8a0 },
    cave:         { fogColor: 0x5a1a8a, shaftColor: 0x7722bb, dustColor: 0xcc99ff },
};

export class AmbienceFxSystem {
    constructor(scene, config = {}) {
        this.scene = scene;
        this.worldWidth = config.worldWidth || 1000;
        this.worldHeight = config.worldHeight || 600;
        this.quality = config.quality || 'high';
        this.theme = config.theme || 'dusk_forest';
        this.enabled = config.ambienceEnabled ?? true;
        this.time = 0;

        this.layers = {
            fog:    this.scene.add.graphics().setDepth(-10),
            shafts: this.scene.add.graphics().setDepth(-9),
            dust:   this.scene.add.graphics().setDepth(9),
            grade:  this.scene.add.graphics().setDepth(14),
        };
        this.layers.dust.setBlendMode(Phaser.BlendModes.ADD);
        this.layers.grade.setBlendMode(Phaser.BlendModes.MULTIPLY);

        this.fogBands = [];
        this.lightShafts = [];
        this.dustParticles = [];
        this.rebuildForQuality();
    }

    rebuildForQuality() {
        const cfg = getBackgroundQualityConfig(this.quality);

        this.fogBands = Array.from({ length: cfg.fogBands }, (_, i) => ({
            x: (i * 180) % this.worldWidth,
            y: 280 + (i % 4) * 60,
            w: 260 + (i % 3) * 80,
            h: 85 + (i % 4) * 14,
            speed: 0.015 + (i % 3) * 0.007,
            alpha: 0.05 + (i % 4) * 0.015,
            phase: Math.random() * Math.PI * 2
        }));

        this.lightShafts = Array.from({ length: cfg.shafts }, (_, i) => ({
            x: 80 + i * 190,
            w: 70 + (i % 2) * 20,
            speed: 0.02 + i * 0.004,
            alpha: 0.05 + (i % 2) * 0.02,
            phase: Math.random() * Math.PI * 2
        }));

        this.dustParticles = Array.from({ length: cfg.dustCount }, () => ({
            x: Math.random() * this.worldWidth,
            y: 80 + Math.random() * 460,
            vx: 0.04 + Math.random() * 0.12,
            vy: -0.02 + Math.random() * 0.04,
            size: 1 + Math.random() * 2.4,
            alpha: 0.15 + Math.random() * 0.25,
            twinkle: Math.random() * Math.PI * 2
        }));
    }

    setProfile({ quality, theme, ambienceEnabled } = {}) {
        let rebuild = false;
        if (quality && quality !== this.quality) {
            this.quality = quality;
            rebuild = true;
        }
        if (theme) this.theme = theme;
        if (typeof ambienceEnabled === 'boolean') this.enabled = ambienceEnabled;
        if (rebuild) this.rebuildForQuality();
    }

    update(focusX, deltaMs = 16, paused = false) {
        if (!this.enabled) {
            this.clear();
            return;
        }

        this.time += paused ? 0 : deltaMs;
        const scrollOffset = (focusX - this.worldWidth * 0.5);

        this.drawFog(scrollOffset, paused);
        this.drawLightShafts(scrollOffset, paused);
        this.drawDust(scrollOffset, paused);
        this.drawColorGrade(paused);
    }

    drawFog(scrollOffset, paused) {
        const g = this.layers.fog;
        g.clear();
        const amb = THEME_AMBIENCE[this.theme] || THEME_AMBIENCE.dusk_forest;

        for (const band of this.fogBands) {
            if (!paused) band.x += band.speed;
            if (band.x > this.worldWidth + band.w) band.x = -band.w;

            const wobble = Math.sin(this.time / 1900 + band.phase) * 6;
            const x = band.x - scrollOffset * 0.08;
            const y = band.y + wobble;

            g.fillStyle(amb.fogColor, band.alpha);
            g.fillEllipse(x, y, band.w, band.h);
        }
    }

    drawLightShafts(scrollOffset, paused) {
        const g = this.layers.shafts;
        g.clear();
        const amb = THEME_AMBIENCE[this.theme] || THEME_AMBIENCE.dusk_forest;

        for (const shaft of this.lightShafts) {
            if (!paused) shaft.x += shaft.speed;
            if (shaft.x > this.worldWidth + shaft.w) shaft.x = -shaft.w;

            const pulse = 0.75 + 0.25 * Math.sin(this.time / 1600 + shaft.phase);
            const alpha = shaft.alpha * pulse;
            const x = shaft.x - scrollOffset * 0.12;

            g.fillStyle(amb.shaftColor, alpha);
            g.fillTriangle(x, 0, x + shaft.w * 0.5, this.worldHeight, x + shaft.w * 1.2, this.worldHeight);
        }
    }

    drawDust(scrollOffset, paused) {
        const g = this.layers.dust;
        g.clear();
        const amb = THEME_AMBIENCE[this.theme] || THEME_AMBIENCE.dusk_forest;

        for (const p of this.dustParticles) {
            if (!paused) {
                p.x += p.vx;
                p.y += p.vy;
            }
            if (p.x > this.worldWidth + 12) p.x = -12;
            if (p.x < -12) p.x = this.worldWidth + 12;
            if (p.y < 60) p.y = this.worldHeight - 20;
            if (p.y > this.worldHeight + 10) p.y = 70;

            const twinkle = 0.7 + 0.3 * Math.sin(this.time / 600 + p.twinkle);
            const alpha = p.alpha * twinkle;
            const x = p.x - scrollOffset * 0.2;

            g.fillStyle(amb.dustColor, alpha);
            g.fillCircle(x, p.y, p.size);
        }
    }

    // Color grade: MULTIPLY blend으로 테마별 색조 통일
    drawColorGrade(paused) {
        const cfg = THEME_GRADE_CONFIG[this.theme] || THEME_GRADE_CONFIG.dusk_forest;
        // 부드러운 펄스로 살아있는 느낌 (±8% 강도 변화)
        const pulse = 1 + 0.08 * Math.sin(this.time / 4000);
        const g = this.layers.grade;
        g.clear();
        g.fillStyle(cfg.color, cfg.alpha * pulse);
        g.fillRect(0, 0, this.worldWidth, this.worldHeight);
    }

    clear() {
        this.layers.fog.clear();
        this.layers.shafts.clear();
        this.layers.dust.clear();
        this.layers.grade.clear();
    }

    destroy() {
        Object.values(this.layers).forEach(layer => {
            if (layer) layer.destroy();
        });
    }
}
