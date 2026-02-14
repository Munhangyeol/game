export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    // ─── Character sprite drawing ───────────────────────────────
    drawJobFrame(g, job, anim, frame, w, h) {
        const cx = w / 2;
        const gy = h - 6;  // ground y (feet level)

        const isWalk   = anim === 'walk';
        const isAttack = anim === 'attack';
        const isJump   = anim === 'jump';
        const isIdle   = anim === 'idle';

        // Walk cycle
        const walkPhase  = isWalk ? (frame / 6) : 0;
        const legSwing   = isWalk ? Math.sin(walkPhase * Math.PI * 2) * 6 : 0;
        const armSwing   = isWalk ? -Math.sin(walkPhase * Math.PI * 2) * 4 : 0;
        const idleBob    = isIdle ? Math.sin((frame / 4) * Math.PI * 2) * 1 : 0;
        const jumpLift   = isJump ? (frame === 0 ? -4 : -9) : 0;
        const legBend    = isJump ? (frame === 0 ? 4 : -2) : 0;
        const atkPush    = isAttack && frame >= 2 ? 5 : (isAttack && frame < 2 ? -2 : 0);

        const feetY    = gy + jumpLift + idleBob;
        const kneeY    = feetY - 12;
        const hipY     = feetY - 20;
        const shoulderY = hipY - 20;
        const neckY    = shoulderY - 2;
        const headCY   = neckY - 10;

        // Shadow
        const shadowAlpha = isJump ? 0.18 : 0.32;
        g.fillStyle(0x000000, shadowAlpha);
        g.fillEllipse(cx, gy + 3, isJump ? 18 : 26, 5);

        const P = {
            warrior: {
                skin: 0xffdeb3, hair: 0x553300,
                body: 0xb82828, armor: 0x959599, armorDk: 0x6a6a77,
                pants: 0x2a2a55, boots: 0x3a2a1a,
                weapon: 0xe0e0e8, shine: 0xffffff, cape: 0x991111
            },
            thief: {
                skin: 0xffdeb3, hair: 0x1a1a1a,
                body: 0x3d1c6a, armor: 0x1f0f38, armorDk: 0x110820,
                pants: 0x181828, boots: 0x151515,
                weapon: 0xcccccc, shine: 0xffffff, cape: 0x2a0044
            },
            archer: {
                skin: 0xffdeb3, hair: 0x5a3300,
                body: 0x277a38, armor: 0x1a5a28, armorDk: 0x0f3a18,
                pants: 0x334418, boots: 0x283314,
                weapon: 0x8a5a28, shine: 0xd4a050, cape: 0x1a5a22
            }
        }[job];

        // ── Boots ──
        g.fillStyle(P.boots, 1);
        if (isWalk) {
            // left/right boot alternating
            g.fillRect(cx - 12 + legSwing, feetY - 9, 10, 9);
            g.fillRect(cx + 2  - legSwing, feetY - 9, 10, 9);
            // boot toe cap
            g.fillStyle(P.armorDk, 1);
            g.fillRect(cx - 12 + legSwing, feetY - 3, 10, 3);
            g.fillRect(cx + 2  - legSwing, feetY - 3, 10, 3);
        } else if (isJump) {
            g.fillRect(cx - 12, feetY - 8 + legBend, 10, 8);
            g.fillRect(cx + 2,  feetY - 8 - legBend, 10, 8);
            g.fillStyle(P.armorDk, 1);
            g.fillRect(cx - 12, feetY - 3 + legBend, 10, 3);
            g.fillRect(cx + 2,  feetY - 3 - legBend, 10, 3);
        } else {
            g.fillRect(cx - 12, feetY - 9, 10, 9);
            g.fillRect(cx + 2,  feetY - 9, 10, 9);
            g.fillStyle(P.armorDk, 1);
            g.fillRect(cx - 12, feetY - 3, 10, 3);
            g.fillRect(cx + 2,  feetY - 3, 10, 3);
        }

        // ── Pants/legs ──
        g.fillStyle(P.pants, 1);
        if (isWalk) {
            g.fillRect(cx - 11 + legSwing, kneeY, 9, 13);
            g.fillRect(cx + 2  - legSwing, kneeY, 9, 13);
        } else {
            g.fillRect(cx - 11, kneeY, 9, 13);
            g.fillRect(cx + 2,  kneeY, 9, 13);
        }

        // ── Body/torso ──
        const bx = cx + atkPush;
        g.fillStyle(P.body, 1);
        g.fillRect(bx - 11, shoulderY, 22, 20);
        // chest plate highlight
        g.fillStyle(P.armor, 1);
        g.fillRect(bx - 8, shoulderY + 3, 16, 14);
        // chest center crease
        g.fillStyle(P.armorDk, 1);
        g.fillRect(bx - 1, shoulderY + 3, 2, 14);

        // ── Arms ──
        g.fillStyle(P.skin, 1);
        if (isAttack && frame >= 2) {
            g.fillRect(bx + 10, shoulderY + 3, 7, 5); // right arm extended
            g.fillRect(bx - 16, shoulderY + 5, 6, 8); // left arm back
        } else if (isWalk) {
            g.fillRect(bx - 15 + armSwing, shoulderY + 4, 5, 9);
            g.fillRect(bx + 10 - armSwing, shoulderY + 4, 5, 9);
        } else {
            g.fillRect(bx - 14, shoulderY + 4, 5, 9);
            g.fillRect(bx + 9,  shoulderY + 4, 5, 9);
        }

        // ── Neck ──
        g.fillStyle(P.skin, 1);
        g.fillRect(bx - 2, neckY, 4, 4);

        // ── Head ──
        g.fillStyle(P.skin, 1);
        g.fillCircle(bx, headCY, 9);
        // hair top
        g.fillStyle(P.hair, 1);
        g.fillRect(bx - 9, headCY - 9, 18, 8);
        g.fillRect(bx - 9, headCY - 3, 2, 5); // hair side left
        // eye
        g.fillStyle(0x111111, 1);
        g.fillRect(bx + 2, headCY - 2, 3, 3);
        // eye shine
        g.fillStyle(0xffffff, 1);
        g.fillRect(bx + 2, headCY - 2, 1, 1);

        // ── Job-specific equipment ──
        if (job === 'warrior') {
            // Helmet
            g.fillStyle(P.armor, 1);
            g.fillRect(bx - 10, headCY - 11, 20, 10);
            g.fillStyle(P.armorDk, 1);
            g.fillRect(bx - 10, headCY + 0, 20, 4); // visor
            // Red plume
            g.fillStyle(0xff2222, 1);
            g.fillRect(bx - 1, headCY - 16, 2, 7);
            g.fillTriangle(bx - 3, headCY - 16, bx + 3, headCY - 16, bx, headCY - 22);
            // Pauldrons
            g.fillStyle(P.armorDk, 1);
            g.fillRect(bx - 17, shoulderY - 1, 8, 7);
            g.fillRect(bx + 9,  shoulderY - 1, 8, 7);
            // Cape
            g.fillStyle(P.cape, 0.85);
            g.fillTriangle(bx - 11, shoulderY, bx - 17, hipY + 4, bx - 4, shoulderY + 18);
            // Sword
            if (isAttack && frame >= 2) {
                const sx = bx + 20;
                g.fillStyle(P.armorDk, 1);
                g.fillRect(sx - 1, shoulderY - 5, 4, 4); // crossguard
                g.fillStyle(P.weapon, 1);
                g.fillRect(sx, shoulderY - 32, 2, 28); // blade
                g.fillStyle(P.shine, 1);
                g.fillRect(sx, shoulderY - 32, 1, 28); // shine
            } else {
                g.fillStyle(P.armorDk, 1);
                g.fillRect(bx + 11, shoulderY - 2, 5, 4); // crossguard
                g.fillStyle(P.weapon, 1);
                g.fillRect(bx + 12, shoulderY - 22, 3, 22); // blade
                g.fillStyle(P.shine, 1);
                g.fillRect(bx + 12, shoulderY - 22, 1, 22);
            }

        } else if (job === 'thief') {
            // Pointed hat
            g.fillStyle(P.armor, 1);
            g.fillRect(bx - 11, headCY - 5, 22, 6); // brim
            g.fillStyle(P.armorDk, 1);
            g.fillTriangle(bx - 7, headCY - 5, bx, headCY - 18, bx + 7, headCY - 5); // cone
            g.fillStyle(0xaa44ff, 1);
            g.fillRect(bx - 5, headCY - 9, 10, 3); // hat band
            // Mask
            g.fillStyle(P.armorDk, 0.75);
            g.fillRect(bx - 8, headCY + 1, 16, 5);
            // Cape
            g.fillStyle(P.cape, 0.8);
            g.fillTriangle(bx - 11, shoulderY, bx - 16, hipY + 5, bx - 3, shoulderY + 18);
            // Daggers
            if (isAttack && frame >= 2) {
                g.fillStyle(P.weapon, 1);
                g.fillRect(bx + 10, shoulderY - 6, 2, 18);
                g.fillRect(bx + 14, shoulderY - 4, 2, 16);
                g.fillStyle(P.shine, 1);
                g.fillRect(bx + 10, shoulderY - 6, 1, 18);
            } else {
                g.fillStyle(P.weapon, 1);
                g.fillRect(bx + 10, shoulderY + 8, 2, 12);
                g.fillRect(bx - 12, shoulderY + 8, 2, 12);
            }

        } else if (job === 'archer') {
            // Hood
            g.fillStyle(P.armor, 1);
            g.fillCircle(bx, headCY - 4, 10);
            g.fillRect(bx - 10, headCY - 6, 20, 8);
            // Hood point
            g.fillStyle(P.armorDk, 1);
            g.fillTriangle(bx - 4, headCY - 12, bx + 4, headCY - 12, bx, headCY - 18);
            // Quiver on back
            g.fillStyle(P.armorDk, 1);
            g.fillRect(bx - 16, shoulderY + 2, 6, 15);
            g.fillStyle(P.shine, 1);
            g.fillRect(bx - 15, shoulderY, 2, 4); // arrow feather
            g.fillRect(bx - 13, shoulderY + 1, 2, 4);
            // Bow
            const bowX = bx + 13;
            g.lineStyle(3, P.weapon, 1);
            g.beginPath();
            g.arc(bowX, shoulderY + 8, 13, -0.9, 0.9, false);
            g.strokePath();
            // Bow grip
            g.fillStyle(P.armorDk, 1);
            g.fillRect(bowX - 2, shoulderY + 4, 4, 8);
            if (isAttack && frame >= 2) {
                // Drawn bow: string pulled back
                g.lineStyle(1, 0xdddddd, 0.9);
                g.lineBetween(bowX + 12, shoulderY - 4, bowX - 3, shoulderY + 8);
                g.lineBetween(bowX - 3, shoulderY + 8, bowX + 12, shoulderY + 20);
                // Arrow nocked
                g.fillStyle(0xffcc44, 1);
                g.fillRect(bowX - 8, shoulderY + 6, 14, 2);
                g.fillTriangle(bowX + 6, shoulderY + 7, bowX + 11, shoulderY + 5, bowX + 11, shoulderY + 9);
            } else {
                g.lineStyle(1, 0xcccccc, 0.8);
                g.lineBetween(bowX + 12, shoulderY - 4, bowX + 12, shoulderY + 20);
            }
        }
    }

    // ─── Monster sprite drawing ──────────────────────────────────
    drawMonsterFrame(g, type, frame, w, h) {
        const cx = w / 2;
        const gy = h - 4;
        const t  = frame / 4;
        const bob = Math.sin(t * Math.PI * 2) * 2;

        // Shadow
        g.fillStyle(0x000000, 0.22);
        g.fillEllipse(cx, gy + 2, Math.max(18, w - 6), 5);

        if (type === 'slime') {
            // Main body — squish/stretch animation
            const squishX = w - 2 + Math.sin(t * Math.PI * 2) * 4;
            const squishY = h - 6 - Math.sin(t * Math.PI * 2) * 4;
            g.fillStyle(0x33bb33, 1);
            g.fillEllipse(cx, gy - squishY / 2 + bob, squishX, squishY);
            // Inner highlight (lighter green)
            g.fillStyle(0x77ee77, 0.6);
            g.fillEllipse(cx - 3, gy - squishY / 2 - 3 + bob, squishX * 0.5, squishY * 0.45);
            // Shine dot
            g.fillStyle(0xeeffee, 0.85);
            g.fillCircle(cx - 5, gy - squishY / 2 - 4 + bob, 3);
            // Eyes — big and cute
            const eyeY = gy - squishY * 0.38 + bob;
            g.fillStyle(0xffffff, 1);
            g.fillCircle(cx - 5, eyeY, 5);
            g.fillCircle(cx + 5, eyeY, 5);
            g.fillStyle(0x111111, 1);
            g.fillCircle(cx - 4, eyeY, 3);
            g.fillCircle(cx + 6, eyeY, 3);
            g.fillStyle(0xffffff, 1);
            g.fillCircle(cx - 4, eyeY - 1, 1);
            g.fillCircle(cx + 6, eyeY - 1, 1);

        } else if (type === 'mushroom') {
            // Stem — beige
            g.fillStyle(0xddcc99, 1);
            g.fillRect(cx - 8, gy - 20, 16, 20);
            // Stem shading
            g.fillStyle(0xccbb88, 1);
            g.fillRect(cx + 4, gy - 20, 4, 20);
            // Cap — deep red
            g.fillStyle(0xcc2211, 1);
            g.fillEllipse(cx, gy - 22 + bob, w + 4, 26);
            // Cap highlight
            g.fillStyle(0xee4422, 0.6);
            g.fillEllipse(cx - 5, gy - 28 + bob, (w + 4) * 0.55, 14);
            // White spots on cap
            g.fillStyle(0xffffff, 0.9);
            g.fillCircle(cx,     gy - 30 + bob, 4);
            g.fillCircle(cx - 10, gy - 24 + bob, 3);
            g.fillCircle(cx + 10, gy - 24 + bob, 3);
            // Eyes (angry)
            const eyeBaseY = gy - 8;
            g.fillStyle(0xffffff, 1);
            g.fillRect(cx - 8, eyeBaseY - 3, 7, 5);
            g.fillRect(cx + 1,  eyeBaseY - 3, 7, 5);
            g.fillStyle(0x111111, 1);
            g.fillRect(cx - 7, eyeBaseY - 2, 4, 3);
            g.fillRect(cx + 3,  eyeBaseY - 2, 4, 3);
            // Angry eyebrows
            g.fillStyle(0x111111, 1);
            g.fillRect(cx - 9, eyeBaseY - 6, 8, 2);
            g.fillRect(cx + 1,  eyeBaseY - 6, 8, 2);

        } else if (type === 'stump') {
            // Trunk — brown wood
            g.fillStyle(0x7a5530, 1);
            g.fillRect(cx - 15, gy - h + 6 + bob, 30, h - 6);
            // Bark grain lines
            g.fillStyle(0x5a3a1a, 0.55);
            for (let i = 0; i < 4; i++) {
                g.fillRect(cx - 14, gy - h + 14 + i * 11 + bob, 28, 2);
            }
            // Knot
            g.fillStyle(0x5a3a1a, 0.7);
            g.fillCircle(cx + 4, gy - h / 2 + bob, 4);
            // Leaf crown on top
            g.fillStyle(0x228833, 1);
            g.fillEllipse(cx,     gy - h + 5 + bob, 28, 16);
            g.fillEllipse(cx - 10, gy - h + 8 + bob, 18, 12);
            g.fillEllipse(cx + 10, gy - h + 8 + bob, 18, 12);
            // Eyes
            const eyeY2 = gy - h + 18 + bob;
            g.fillStyle(0xffffff, 1);
            g.fillRect(cx - 8, eyeY2, 6, 5);
            g.fillRect(cx + 2,  eyeY2, 6, 5);
            g.fillStyle(0x111111, 1);
            g.fillRect(cx - 7, eyeY2 + 1, 4, 3);
            g.fillRect(cx + 3,  eyeY2 + 1, 4, 3);

        } else if (type === 'fireBug') {
            // Fire wings/flames behind
            const flameColors = [0xff3300, 0xff6600, 0xffaa00];
            for (let f = 0; f < 5; f++) {
                const fx = cx - 12 + f * 6;
                const fh = 8 + Math.sin(t * Math.PI * 2 + f * 0.8) * 4;
                const ci = (f + frame) % 3;
                g.fillStyle(flameColors[ci], 0.8);
                g.fillTriangle(fx - 4, gy - h + 10, fx, gy - h + 10 - fh, fx + 4, gy - h + 10);
            }
            // Main bug body
            g.fillStyle(0xdd4400, 1);
            g.fillEllipse(cx, gy - h / 2 + 3 + bob, w - 4, h - 6);
            // Body shine
            g.fillStyle(0xff8844, 0.5);
            g.fillEllipse(cx - 4, gy - h / 2 - 2 + bob, (w - 4) * 0.55, (h - 6) * 0.45);
            // Antennae
            g.lineStyle(2, 0xcc3300, 1);
            g.lineBetween(cx - 4, gy - h + 12 + bob, cx - 10, gy - h + 4 + bob);
            g.lineBetween(cx + 4, gy - h + 12 + bob, cx + 10, gy - h + 4 + bob);
            g.fillStyle(0xff2200, 1);
            g.fillCircle(cx - 10, gy - h + 4 + bob, 2);
            g.fillCircle(cx + 10, gy - h + 4 + bob, 2);
            // Eyes (red glow)
            const eyeY3 = gy - h / 2 + bob;
            g.fillStyle(0xff0000, 1);
            g.fillCircle(cx - 6, eyeY3, 4);
            g.fillCircle(cx + 6, eyeY3, 4);
            g.fillStyle(0xffaa00, 0.7);
            g.fillCircle(cx - 5, eyeY3 - 1, 2);
            g.fillCircle(cx + 7, eyeY3 - 1, 2);

        } else if (type === 'rockWhale') {
            // Main body
            g.fillStyle(0x7a8899, 1);
            g.fillEllipse(cx, gy - h / 2 + bob * 0.5, w, h - 4);
            // Rocky spikes on back
            g.fillStyle(0x5a6677, 1);
            for (let s = 0; s < 4; s++) {
                const sx = cx - 20 + s * 14;
                const sh = 8 + s % 2 * 4;
                g.fillTriangle(sx - 4, gy - h + 4 + bob * 0.5, sx, gy - h + 4 - sh + bob * 0.5, sx + 4, gy - h + 4 + bob * 0.5);
            }
            // Belly (lighter)
            g.fillStyle(0xaabbc0, 0.6);
            g.fillEllipse(cx, gy - h / 2 + 6 + bob * 0.5, w * 0.65, h * 0.45);
            // Side fins
            g.fillStyle(0x6a7788, 1);
            g.fillTriangle(cx - w / 2, gy - h / 3 + bob * 0.5, cx - w / 2 - 10, gy - 8 + bob * 0.5, cx - w / 3, gy - 8 + bob * 0.5);
            g.fillTriangle(cx + w / 2, gy - h / 3 + bob * 0.5, cx + w / 2 + 10, gy - 8 + bob * 0.5, cx + w / 3, gy - 8 + bob * 0.5);
            // Eyes
            const eyeY4 = gy - h / 2 - 4 + bob * 0.5;
            g.fillStyle(0xffffff, 1);
            g.fillCircle(cx - 14, eyeY4, 5);
            g.fillCircle(cx + 14, eyeY4, 5);
            g.fillStyle(0x111111, 1);
            g.fillCircle(cx - 13, eyeY4, 3);
            g.fillCircle(cx + 15, eyeY4, 3);

        } else if (type === 'dragon') {
            // Wings (behind body)
            g.fillStyle(0x5522aa, 0.75);
            // Left wing
            g.fillTriangle(cx - 10, gy - h / 2 + bob * 0.5,
                           cx - w / 2 - 16, gy - h + bob * 0.5,
                           cx - w / 2 - 8, gy - 8 + bob * 0.5);
            g.fillTriangle(cx - 10, gy - h / 2 + bob * 0.5,
                           cx - w / 2 - 8, gy - h + bob * 0.5,
                           cx - 6, gy - 4 + bob * 0.5);
            // Right wing
            g.fillTriangle(cx + 10, gy - h / 2 + bob * 0.5,
                           cx + w / 2 + 16, gy - h + bob * 0.5,
                           cx + w / 2 + 8, gy - 8 + bob * 0.5);
            g.fillTriangle(cx + 10, gy - h / 2 + bob * 0.5,
                           cx + w / 2 + 8, gy - h + bob * 0.5,
                           cx + 6, gy - 4 + bob * 0.5);
            // Wing veins
            g.lineStyle(1, 0x7733cc, 0.5);
            g.lineBetween(cx - 10, gy - h / 2 + bob * 0.5, cx - w / 2 - 14, gy - h + 4 + bob * 0.5);
            g.lineBetween(cx + 10, gy - h / 2 + bob * 0.5, cx + w / 2 + 14, gy - h + 4 + bob * 0.5);
            // Main body
            g.fillStyle(0x3a1a7a, 1);
            g.fillEllipse(cx, gy - h / 2 + bob * 0.5, w - 6, h - 4);
            // Body scale pattern
            g.fillStyle(0x5533aa, 0.45);
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 4; col++) {
                    const sx = cx - 18 + col * 12 + (row % 2) * 6;
                    const sy = gy - h + 10 + row * 12 + bob * 0.5;
                    g.fillCircle(sx, sy, 4);
                }
            }
            // Belly
            g.fillStyle(0x6644aa, 0.5);
            g.fillEllipse(cx, gy - h / 2 + 8 + bob * 0.5, (w - 6) * 0.55, (h - 4) * 0.5);
            // Horns
            g.fillStyle(0x221155, 1);
            g.fillTriangle(cx - 14, gy - h + 8 + bob * 0.5, cx - 18, gy - h - 10 + bob * 0.5, cx - 8, gy - h + 8 + bob * 0.5);
            g.fillTriangle(cx + 14, gy - h + 8 + bob * 0.5, cx + 18, gy - h - 10 + bob * 0.5, cx + 8,  gy - h + 8 + bob * 0.5);
            // Eyes (glowing red)
            const eyeY5 = gy - h / 2 - 6 + bob * 0.5;
            g.fillStyle(0xff2200, 1);
            g.fillCircle(cx - 14, eyeY5, 6);
            g.fillCircle(cx + 14, eyeY5, 6);
            g.fillStyle(0xff8800, 0.8);
            g.fillCircle(cx - 13, eyeY5 - 1, 3);
            g.fillCircle(cx + 15, eyeY5 - 1, 3);
            g.fillStyle(0xffcc00, 0.5);
            g.fillCircle(cx - 13, eyeY5 - 1, 1);
            g.fillCircle(cx + 15, eyeY5 - 1, 1);
            // Flame breath (on attack frame 2-3 or frame 2)
            if (frame >= 2) {
                g.fillStyle(0xff6600, 0.7);
                g.fillTriangle(cx + 20, gy - h / 2 + 4 + bob * 0.5, cx + w / 2 + 20, gy - h / 2 - 4 + bob * 0.5, cx + w / 2 + 20, gy - h / 2 + 12 + bob * 0.5);
                g.fillStyle(0xffaa00, 0.5);
                g.fillTriangle(cx + 22, gy - h / 2 + 5 + bob * 0.5, cx + w / 2 + 16, gy - h / 2 - 1 + bob * 0.5, cx + w / 2 + 16, gy - h / 2 + 10 + bob * 0.5);
            }
        }
    }

    createSpriteTexturesAndAnims() {
        const jobs = ['warrior', 'thief', 'archer'];
        const jobAnims = [
            { name: 'idle',   frames: 4, w: 48, h: 64, frameRate: 5 },
            { name: 'walk',   frames: 6, w: 48, h: 64, frameRate: 12 },
            { name: 'attack', frames: 4, w: 48, h: 64, frameRate: 16, repeat: 0 },
            { name: 'jump',   frames: 2, w: 48, h: 64, frameRate: 6,  repeat: 0 },
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
            { type: 'slime',     w: 36, h: 30 },
            { type: 'mushroom',  w: 40, h: 50 },
            { type: 'stump',     w: 38, h: 55 },
            { type: 'fireBug',   w: 44, h: 35 },
            { type: 'rockWhale', w: 70, h: 50 },
            { type: 'dragon',    w: 80, h: 65 },
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
