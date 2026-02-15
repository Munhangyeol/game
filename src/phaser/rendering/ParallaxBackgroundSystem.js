const QUALITY_CONFIG = {
    high:   { fogBands: 7, dustCount: 140, shafts: 5 },
    medium: { fogBands: 5, dustCount: 90,  shafts: 3 },
    low:    { fogBands: 3, dustCount: 50,  shafts: 2 }
};

// ── 테마 팔레트 ──────────────────────────────────────────────────────────────
// nearDark/nearLight: Near Objects 전용 색상 (midObjects보다 어둡고 대비 높음)
// cloudColor: 구름 색상 (테마마다 다름)
const THEME_CONFIG = {
    dusk_forest: {
        skyTop: 0x2d325a, skyBottom: 0x576891,
        horizonGlow: 0x8ca6cf,
        mountainNear: 0x3b4a6e, mountainFar: 0x2a3553,
        objectDark: 0x243444,   objectLight: 0x38556b,
        nearDark:   0x1c2d3c,   nearLight:   0x2d4455,
        grassDark: 0x2e5a38,   grassLight: 0x4e865f,
        cloudColor: 0x8aabcc,
    },
    night_ruins: {
        skyTop: 0x15182f, skyBottom: 0x29345e,
        horizonGlow: 0x5b7bb8,
        mountainNear: 0x252f52, mountainFar: 0x1a223f,
        objectDark: 0x2a2f44,   objectLight: 0x3f4d66,
        nearDark:   0x1e2438,   nearLight:   0x2c3450,
        grassDark: 0x34434d,   grassLight: 0x556670,
        cloudColor: 0x3a4466,
    },
    // ── 신규 테마 ──
    dawn: {
        skyTop: 0xff7744, skyBottom: 0xffcc88,
        horizonGlow: 0xffa040,
        mountainNear: 0x7a5040, mountainFar: 0x5a4030,
        objectDark: 0x4a3828,   objectLight: 0x7a6248,
        nearDark:   0x3c2e1e,   nearLight:   0x6a5238,
        grassDark: 0x3a5828,   grassLight: 0x6a9048,
        cloudColor: 0xffddaa,
    },
    cave: {
        skyTop: 0x0d0810, skyBottom: 0x1a1030,
        horizonGlow: 0x442266,
        mountainNear: 0x2a1e3c, mountainFar: 0x1a1424,
        objectDark: 0x1e1628,   objectLight: 0x2e2244,
        nearDark:   0x18101e,   nearLight:   0x261a38,
        grassDark: 0x1a2018,   grassLight: 0x2a3428,
        cloudColor: 0x2a1840,   // 어두운 종유석 느낌
    },
};

function wrapX(value, loopWidth) {
    let x = value % loopWidth;
    if (x < 0) x += loopWidth;
    return x;
}

// ── 레이어 깊이 순서 (뒤 → 앞) ────────────────────────────────────────────
// sky(-20) → mountains(-16) → clouds(-14) → midObjects(-12)
// → ambienceFog(-10) → ambienceShafts(-9)
// → frontGrass(-6) → nearObjects(-4)
// → [game world: drawLayer(10), uiLayer(11), fxLayer(12)]
// → [grade(14): color grading via AmbienceFxSystem]

export class ParallaxBackgroundSystem {
    constructor(scene, config = {}) {
        this.scene = scene;
        this.worldWidth  = config.worldWidth  || 1000;
        this.worldHeight = config.worldHeight || 600;
        this.parallaxStrength = config.parallaxStrength ?? 1;
        this.theme   = config.theme   || 'dusk_forest';
        this.quality = config.quality || 'high';
        this.time    = 0;
        this.loopWidth   = this.worldWidth * 2;
        this.windStrength = 1.0;  // 0.1 ~ 1.5, 8초 주기 사인파

        this.layers = {
            sky:         this.scene.add.graphics().setDepth(-20),
            mountains:   this.scene.add.graphics().setDepth(-16),
            clouds:      this.scene.add.graphics().setDepth(-14),  // ★ 신규
            objects:     this.scene.add.graphics().setDepth(-12),
            frontGrass:  this.scene.add.graphics().setDepth(-6),
            nearObjects: this.scene.add.graphics().setDepth(-4),   // ★ 신규
        };

        this.generateGeometry();
    }

    generateGeometry() {
        // 별 (dawn/cave 에서는 숨김)
        this.stars = Array.from({ length: 40 }, (_, i) => ({
            x: (i * 71 + 31) % this.worldWidth,
            y: 20 + ((i * 37 + 11) % 230),
            r: (i % 2) + 1,
            phase: Math.random() * Math.PI * 2
        }));

        // 산봉우리
        this.mountainPeaks = Array.from({ length: 20 }, (_, i) => ({
            x:      i * 120,
            width:  160 + (i % 4) * 30,
            height:  90 + (i % 5) * 22,
            y:      380 + (i % 3) * 8
        }));

        // ★ 구름 (8개, 느리게 이동)
        this.cloudData = Array.from({ length: 8 }, (_, i) => ({
            x:     50 + i * 150,
            y:     70 + (i % 4) * 40,
            w:    110 + (i % 3) * 30,
            h:     28 + (i % 4) * 8,
            speed: 0.04 + (i % 3) * 0.025,
            alpha: 0.12 + (i % 3) * 0.05,
            phase: Math.random() * Math.PI * 2
        }));

        // 중간 거리 오브젝트 (나무·뾰족나무·덤불)
        // phase 추가 → canopy sway에 사용
        this.midObjects = Array.from({ length: 26 }, (_, i) => ({
            x:    40 + i * 80,
            y:   436 + (i % 4) * 6,
            w:    22 + (i % 3) * 8,
            h:    42 + (i % 5) * 10,
            kind: i % 3,
            phase: Math.random() * Math.PI * 2
        }));

        // ★ Near Objects 레이어 (14개, 더 크고 고대비)
        this.nearObjects = Array.from({ length: 14 }, (_, i) => ({
            x:    25 + i * 95,
            y:   450 + (i % 3) * 10,
            w:    32 + (i % 4) * 10,
            h:    65 + (i % 5) * 14,
            kind: i % 3,
            phase: Math.random() * Math.PI * 2
        }));

        // 전경 풀잎
        this.frontBlades = Array.from({ length: 85 }, (_, i) => ({
            x:    i * 28,
            y:   494 + (i % 3) * 3,
            h:    16 + (i % 5) * 5,
            sway: (Math.random() * 2 - 1) * 0.8
        }));
    }

    setProfile({ quality, theme, parallaxStrength } = {}) {
        if (quality && QUALITY_CONFIG[quality]) this.quality = quality;
        if (theme && THEME_CONFIG[theme]) this.theme = theme;
        if (typeof parallaxStrength === 'number') this.parallaxStrength = parallaxStrength;
    }

    update(focusX, deltaMs = 16) {
        this.time += deltaMs;
        // ★ 바람 세기: 8초 주기, 범위 0.1 ~ 1.5
        this.windStrength = 0.8 + 0.7 * Math.sin(this.time / 8000);

        const palette      = THEME_CONFIG[this.theme] || THEME_CONFIG.dusk_forest;
        const centerOffset = (focusX - this.worldWidth * 0.5) * this.parallaxStrength;

        this.drawSky(palette,         centerOffset * 0.08);
        this.drawMountains(palette,   centerOffset * 0.20);
        this.drawClouds(palette,      centerOffset * 0.15);   // ★
        this.drawMidObjects(palette,  centerOffset * 0.38);
        this.drawFrontGrass(palette,  centerOffset * 0.65);
        this.drawNearObjects(palette, centerOffset * 0.55);   // ★
    }

    // ── 하늘 ──────────────────────────────────────────────────────────────
    drawSky(palette, offset) {
        const g = this.layers.sky;
        g.clear();

        // 기본 그라데이션
        g.fillGradientStyle(palette.skyTop, palette.skyTop, palette.skyBottom, palette.skyBottom, 1);
        g.fillRect(0, 0, this.worldWidth, this.worldHeight);

        // ★ Horizon Haze: 수평선 대기원근감 그라데이션
        g.fillGradientStyle(
            palette.horizonGlow, palette.horizonGlow,
            palette.horizonGlow, palette.horizonGlow,
            0.0, 0.0, 0.20, 0.20
        );
        g.fillRect(0, 330, this.worldWidth, 90);

        // 기존 타원형 지평선 글로우 (약화)
        g.fillStyle(palette.horizonGlow, 0.10);
        g.fillEllipse(this.worldWidth / 2 - offset, 410, this.worldWidth * 1.1, 180);

        // ★ 태양(dawn) / 달(dusk·night) / cave는 없음
        if (this.theme === 'dawn') {
            const sx = this.worldWidth * 0.72 - offset * 0.3;
            const sy = 355;
            g.fillStyle(0xffee44, 0.88);  g.fillCircle(sx, sy, 22);
            g.fillStyle(0xffdd66, 0.28);  g.fillCircle(sx, sy, 40);
            g.fillStyle(0xffcc44, 0.10);  g.fillCircle(sx, sy, 62);
        } else if (this.theme !== 'cave') {
            const mx = this.worldWidth * 0.20 - offset * 0.3;
            const my = 75;
            g.fillStyle(0xe8e0d0, 0.82);  g.fillCircle(mx, my, 16);
            g.fillStyle(0xddd8c0, 0.14);  g.fillCircle(mx, my, 32);
        }

        // ★ 별: dawn(낮)과 cave(동굴)에서는 숨김
        const hideStar = this.theme === 'dawn' || this.theme === 'cave';
        if (!hideStar) {
            for (const star of this.stars) {
                const px    = wrapX(star.x - offset * 0.5, this.worldWidth);
                const alpha = 0.2 + 0.25 * Math.sin(this.time / 950 + star.phase);
                g.fillStyle(0xffffff, Math.max(0.06, alpha));
                g.fillCircle(px, star.y, star.r);
            }
        }
    }

    // ── 산 + Depth Blur 시뮬레이션 ───────────────────────────────────────
    drawMountains(palette, offset) {
        const g = this.layers.mountains;
        g.clear();

        for (let pass = 0; pass < 2; pass++) {
            const color = pass === 0 ? palette.mountainFar : palette.mountainNear;
            const alpha = pass === 0 ? 0.75 : 0.92;
            const shift = pass === 0 ? offset * 0.7 : offset;

            // 메인 패스
            g.fillStyle(color, alpha);
            for (const peak of this.mountainPeaks) {
                const px = wrapX(peak.x - shift, this.loopWidth) - peak.width;
                const py = peak.y + (pass * 14);
                g.fillTriangle(px, py, px + peak.width * 0.5, py - peak.height, px + peak.width, py);
            }

            // ★ Soften Pass (원거리 산만): 미세 오프셋 반투명 복사 → 대기 블러 효과
            if (pass === 0) {
                g.fillStyle(color, alpha * 0.28);
                for (const peak of this.mountainPeaks) {
                    const px = wrapX(peak.x - shift + 2, this.loopWidth) - peak.width;
                    const py = peak.y + 2;
                    g.fillTriangle(px, py, px + peak.width * 0.5, py - peak.height, px + peak.width, py);
                }
            }
        }
    }

    // ★ 구름 레이어 ─────────────────────────────────────────────────────
    drawClouds(palette, offset) {
        const g = this.layers.clouds;
        g.clear();
        const cc = palette.cloudColor || 0x9ab4d4;

        for (const cloud of this.cloudData) {
            cloud.x += cloud.speed;
            if (cloud.x > this.loopWidth + cloud.w) cloud.x = -cloud.w;

            const pulse = 1 + 0.06 * Math.sin(this.time / 3000 + cloud.phase);
            const a     = cloud.alpha * pulse;
            const cx    = wrapX(cloud.x - offset, this.loopWidth) - cloud.w * 0.5;

            // 3개 타원 겹쳐 볼륨감 표현
            g.fillStyle(cc, a);
            g.fillEllipse(cx, cloud.y, cloud.w, cloud.h);
            g.fillStyle(cc, a * 0.85);
            g.fillEllipse(cx - cloud.w * 0.25, cloud.y + cloud.h * 0.12, cloud.w * 0.70, cloud.h * 0.80);
            g.fillEllipse(cx + cloud.w * 0.22, cloud.y + cloud.h * 0.06, cloud.w * 0.65, cloud.h * 0.75);
            // 상단 밝은 하이라이트
            g.fillStyle(cc, a * 0.38);
            g.fillEllipse(cx + cloud.w * 0.04, cloud.y - cloud.h * 0.16, cloud.w * 0.52, cloud.h * 0.52);
        }
    }

    // ── 중간 거리 오브젝트 + ★ Canopy 흔들림 ──────────────────────────
    drawMidObjects(palette, offset) {
        const g = this.layers.objects;
        g.clear();

        for (const item of this.midObjects) {
            const px = wrapX(item.x - offset, this.loopWidth) - item.w;

            if (item.kind === 0) {
                // 나무: 수관 ellipse에 windOff 적용 (canopy sway)
                const windOff = Math.sin(this.time / 900 + item.phase) * 2.5 * this.windStrength;
                g.fillStyle(palette.objectDark, 0.95);
                g.fillRect(px + 8, item.y - item.h, 8, item.h);
                g.fillStyle(palette.objectLight, 0.80);
                g.fillEllipse(px + 12 + windOff,        item.y - item.h - 8, item.w + 22, 26);
                g.fillEllipse(px - 2  + windOff * 0.65, item.y - item.h + 2, item.w + 18, 22);

            } else if (item.kind === 1) {
                // 뾰족나무: tip 흔들림
                const tipSway = Math.sin(this.time / 700 + item.phase) * 1.8 * this.windStrength;
                g.fillStyle(palette.objectDark, 0.85);
                g.fillTriangle(px, item.y, px + item.w * 0.5 + tipSway, item.y - item.h, px + item.w, item.y);
                g.fillStyle(palette.objectLight, 0.70);
                g.fillTriangle(px + 3, item.y - 2, px + item.w * 0.5 + tipSway, item.y - item.h + 12, px + item.w - 3, item.y - 2);

            } else {
                // 덤불/바위
                g.fillStyle(palette.objectDark, 0.75);
                g.fillEllipse(px + item.w * 0.5, item.y - 4, item.w + 16, 14);
                g.fillStyle(palette.objectLight, 0.55);
                g.fillEllipse(px + item.w * 0.5, item.y - 6, item.w + 6, 8);
            }
        }
    }

    // ★ Near Objects 레이어 (5번째 패럴랙스, 더 크고 고대비) ──────────
    drawNearObjects(palette, offset) {
        const g = this.layers.nearObjects;
        g.clear();
        const nd = palette.nearDark  || palette.objectDark;
        const nl = palette.nearLight || palette.objectLight;

        for (const item of this.nearObjects) {
            const px = wrapX(item.x - offset, this.loopWidth) - item.w;
            const windOff = Math.sin(this.time / 850 + item.phase) * 4 * this.windStrength;

            if (item.kind === 0) {
                // 대형 나무 실루엣 (가까울수록 크고 선명)
                g.fillStyle(nd, 1.0);
                g.fillRect(px + item.w * 0.38, item.y - item.h, item.w * 0.22, item.h);
                g.fillStyle(nl, 0.92);
                g.fillEllipse(px + item.w * 0.50 + windOff,        item.y - item.h - 12, item.w + 30, 36);
                g.fillEllipse(px + item.w * 0.30 + windOff * 0.70, item.y - item.h + 10, item.w + 24, 30);
                // ★ Soft edge: 미세 offset 복사로 전경 depth blur 시뮬레이션
                g.fillStyle(nl, 0.16);
                g.fillEllipse(px + item.w * 0.50 + windOff + 2, item.y - item.h - 11, item.w + 38, 44);

            } else if (item.kind === 1) {
                // 바위 클러스터
                g.fillStyle(nd, 0.96);
                g.fillEllipse(px + item.w * 0.50, item.y - item.h * 0.32, item.w,        item.h * 0.42);
                g.fillEllipse(px + item.w * 0.72, item.y - item.h * 0.38, item.w * 0.80, item.h * 0.36);
                g.fillStyle(nl, 0.58);
                g.fillEllipse(px + item.w * 0.34, item.y - item.h * 0.40, item.w * 0.48, item.h * 0.22);

            } else {
                // 두꺼운 덤불 (가까울수록 크게 흔들림)
                g.fillStyle(nd, 0.92);
                g.fillEllipse(px + item.w * 0.50,                 item.y - item.h * 0.28, item.w + 12, item.h * 0.48);
                g.fillStyle(nl, 0.68);
                g.fillEllipse(px + item.w * 0.38 + windOff * 0.5, item.y - item.h * 0.32, item.w,       item.h * 0.38);
                g.fillEllipse(px + item.w * 0.65 + windOff * 0.3, item.y - item.h * 0.30, item.w * 0.82, item.h * 0.32);
            }
        }
    }

    // ── 전경 풀 + ★ 전경 Depth 비네트 ──────────────────────────────────
    drawFrontGrass(palette, offset) {
        const g = this.layers.frontGrass;
        g.clear();
        g.fillStyle(palette.grassDark, 0.95);
        g.fillRect(0, 492, this.worldWidth, 108);

        // ★ Foreground vignette: 가까운 지면 경계를 부드럽게 (depth blur)
        g.fillStyle(palette.grassDark, 0.12);
        g.fillRect(0, 480, this.worldWidth, 18);

        // 풀잎: windStrength 연동
        const wave = Math.sin(this.time / 700) * 1.4 * this.windStrength;
        for (const blade of this.frontBlades) {
            const px   = wrapX(blade.x - offset, this.loopWidth);
            const tipX = px + blade.sway * 6 + wave;
            const tipY = blade.y - blade.h;

            g.lineStyle(2, palette.grassLight, 0.75);
            g.lineBetween(px, blade.y, tipX, tipY);
            g.lineStyle(1, palette.grassLight, 0.40);
            g.lineBetween(px + 2, blade.y, tipX + 2, tipY + 2);
        }
    }

    destroy() {
        Object.values(this.layers).forEach(layer => {
            if (layer) layer.destroy();
        });
    }
}

export function getBackgroundQualityConfig(quality) {
    return QUALITY_CONFIG[quality] || QUALITY_CONFIG.high;
}
