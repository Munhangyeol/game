# 전투 연출 레이어링 개선 계획
## Single Effect → Multi Layer

---

## 왜 인디 느낌이 나는가?

현재 구조:
- 스킬 1개 = `drawLayer`에 Graphics 1개 이펙트
- `fxLayer`(ADD blend) 글로우는 일부 스킬만 적용 (비일관적)

운영 게임 구조:
```
Base Slash  → drawLayer    (기존)
+ Glow      → fxLayer      (기존, 확장 필요)
+ Trail     → trailLayer   (신규)
+ Hit Spark → 파티클 개선  (방향성 스파크)
+ Dust      → groundLayer  (신규)
```

---

## 목표 레이어 구조

```
depth  8  trailLayer      — 무기 궤적 / 잔상 (ADD blend)
depth  9  groundLayer     — 지면 먼지 / 충격파 링
depth 10  drawLayer       — 기존: 스킬 본체 이펙트 (유지)
depth 11  uiLayer         — 기존: HUD 고정 (유지)
depth 12  fxLayer         — 기존: ADD 글로우 (확장)
depth 13  superFxLayer    — 신규: 크리티컬 화이트 플래시 (ADD, scrollFactor:0)
depth 100 Floating Text   — 기존: 데미지 숫자 (유지)
```

---

## 핵심 수정 파일

`src/phaser/scenes/GameScene.js`
- `create()` ~라인 138: 레이어 초기화
- `drawAll()` 라인 1467: clear() 순서 + drawTrails() 호출
- `drawEffect()` 라인 2086-2455: 각 케이스에 레이어 호출 추가
- `dealDamage()` 라인 1101: addHitSparks() 추가
- `drawParticles()`: isLine 파티클 분기 추가

---

## Step 1 — 레이어 신설

`create()` 내부, fxLayer 선언 직후:
```javascript
this.trailLayer = this.add.graphics();
this.trailLayer.setDepth(8);
this.trailLayer.setBlendMode(Phaser.BlendModes.ADD);

this.groundLayer = this.add.graphics();
this.groundLayer.setDepth(9);

this.superFxLayer = this.add.graphics();
this.superFxLayer.setDepth(13);
this.superFxLayer.setBlendMode(Phaser.BlendModes.ADD);
this.superFxLayer.setScrollFactor(0);
```

`drawAll()` clear 블록에 추가:
```javascript
if (this.trailLayer)   this.trailLayer.clear();
if (this.groundLayer)  this.groundLayer.clear();
if (this.superFxLayer) this.superFxLayer.clear();
```

---

## Step 2 — Trail 시스템 (무기 잔상)

공격 포인트 좌표를 3~5프레임 저장 → trailLayer에 fade 선으로 연결

```javascript
// 데이터
this.trailPoints = []; // { x, y, color, life, maxLife }

addTrail(x, y, color, maxLife = 6) {
    this.trailPoints.push({ x, y, color, life: maxLife, maxLife });
}

drawTrails(layer) {
    for (let i = this.trailPoints.length - 1; i > 0; i--) {
        const a = this.trailPoints[i];
        const b = this.trailPoints[i - 1];
        const alpha = (a.life / a.maxLife) * 0.7;
        layer.lineStyle(4 * (a.life / a.maxLife), a.color, alpha);
        layer.lineBetween(a.x, a.y, b.x, b.y);
    }
    this.trailPoints = this.trailPoints.filter(t => --t.life > 0);
}
```

drawAll()에서 `this.drawTrails(this.trailLayer)` 호출.
`drawEffect()` 내 swordSlash / daggerSlash / arrowTrail 케이스에서
매 프레임 `this.addTrail(tipX, tipY, color)` 호출.

---

## Step 3 — Hit Spark 개선 (방향성)

현재 `addBurstParticles`: 원형 랜덤 방향 (구형 느낌)
개선: 공격 방향으로 모이는 선 형태 스파크

```javascript
addHitSparks(x, y, dir, color, count = 6) {
    for (let i = 0; i < count; i++) {
        const angle = (dir > 0 ? 0 : Math.PI) + (Math.random() - 0.5) * 1.6;
        const spd = 4 + Math.random() * 6;
        this.particles.push({
            x, y,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd - 2,
            life: 8 + Math.random() * 8,
            maxLife: 16,
            color,
            size: 2,
            isLine: true,
            length: 6 + Math.random() * 8,
        });
    }
}
```

`drawParticles()` 내 분기:
```javascript
if (p.isLine) {
    const alpha = p.life / p.maxLife;
    g.lineStyle(1.5, p.color, alpha);
    g.lineBetween(p.x, p.y, p.x - p.vx * p.length / 6, p.y - p.vy * p.length / 6);
} else { /* 기존 원형 */ }
```

`dealDamage()` 에서 기존 `addBurstParticles` 옆에:
```javascript
this.addHitSparks(m.x, m.y, dir, isCrit ? 0xffff44 : 0xff8800, isCrit ? 10 : 6);
```

---

## Step 4 — Ground Dust & Impact Ring

지면 근처(y > 460) 공격 시 groundLayer에 렌더:

```javascript
// drawEffect() 내 신규 케이스
case 'impactRing': {
    const r = p * 80;
    this.groundLayer.lineStyle(3 * (1-p), 0xffcc66, (1-p) * 0.6);
    this.groundLayer.strokeEllipse(x, y, r * 2, r * 0.35);
    break;
}
case 'groundDust': {
    for (let k = 0; k < 5; k++) {
        const ox = (k - 2) * 18 * (1 + p);
        const sz = (8 + k * 4) * p;
        this.groundLayer.fillStyle(0xccaa88, (1-p) * 0.4);
        this.groundLayer.fillEllipse(x + ox * dir, y - sz * 0.6, sz * 1.4, sz * 0.7);
    }
    break;
}
```

basicAttack() + powerStrike + slashBlast + giantRampage에 addEffect() 추가.

---

## Step 5 — Screen Flash (크리티컬)

```javascript
addScreenFlash(duration = 4, intensity = 0.35, color = 0xffffff) {
    this.screenFlash = { life: duration, maxLife: duration, intensity, color };
}

// drawAll() 내:
if (this.screenFlash && this.superFxLayer) {
    const sf = this.screenFlash;
    const alpha = (sf.life / sf.maxLife) * sf.intensity;
    this.superFxLayer.fillStyle(sf.color, alpha);
    this.superFxLayer.fillRect(0, 0, this.scale.width, this.scale.height);
    if (--sf.life <= 0) this.screenFlash = null;
}
```

`dealDamage()` 크리티컬 분기: `this.addScreenFlash(4, 0.25, 0xffff88)`

---

## 스킬별 레이어 적용 매핑

| 스킬/공격 | Trail | Hit Spark | Ground Dust | Flash |
|-----------|:-----:|:---------:|:-----------:|:-----:|
| swordSlash | ✅ 황금 | ✅ 흰색 | ✅ | — |
| daggerSlash | ✅ 보라 | ✅ 분홍 | — | — |
| arrowTrail | ✅ 황색 | — | — | — |
| powerStrike | — | ✅ 주황 | ✅ | ✅ 약 |
| slashBlast | ✅ 파랑 | ✅ 파랑 | ✅ | ✅ |
| assassinate | ✅ 보라 | ✅ 분홍 | — | — |
| arrowRain | — | ✅ 황색×N | ✅ | ✅ 약 |
| 크리티컬 히트 | — | ✅ 황금 | — | ✅ 황금 |

---

## 구현 순서

1. Step 1 (레이어 신설) — 먼저, 5분
2. Step 3 (Hit Spark) — 즉각 효과, dealDamage 1곳
3. Step 4 (Ground Dust) — 기본공격 + 전사 스킬 2개 우선
4. Step 2 (Trail) — swordSlash 1종만 먼저
5. Step 5 (Screen Flash) — 크리티컬 한정
6. 나머지 스킬 확장 적용

---

## 검증

```bash
start "" "phaser.html"
```
- 전사 기본공격(A): 황금 잔상 + 지면 먼지
- Z키 powerStrike: 충격 링 + 방향성 스파크
- 크리티컬: 황금 플래시 확인
- 도적 assassinate: 보라 잔상 + 분홍 스파크
- FPS 드롭 없음 (파티클 상한 기존 유지)
