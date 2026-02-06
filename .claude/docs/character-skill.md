# Character Skill — 추가 스킬 제안

현재 코드의 스킬 구조와 빈 영역을 분석하여 직업당 2건씩, 총 6건 제안.

---

## 현재 직업별 갭 분석

| 직업 | 있는 것 | 없는 것 |
|------|---------|---------|
| 전사 | 단일 강타, 원형 AoE, 공격 버프 | 지면 AoE, 방어·생존 |
| 도적 | 다중 강타, 백스탭 단일 강타, 속도 버프 | 원거리, DoT, 군집 처리 |
| 궁수 | 다발 투사체, 지면 화살비, 관통 버프 | 단일 강타, 트랩·영역 부정 |

---

## 전사군

### 지진 타격 (Earthquake Strike)

지면 기반 가로 AoE + 스턴.
`slashBlast`가 원형이라 몬스터가 왼쪽·오른쪽으로 도망가면 빗나가는 상황을 커버.

```
type:       'earthquakeStrike'
damage:     2.0×  (player.attack 기준 ~30)
AoE:        플레이어 발밑 기준 가로 250px, 수직 80px 직사각형
효과:       범위 내 몬스터 피해 + vx=0·vy=0 (1.5초 스턴)
mp:         12
cooldown:   100프레임
```

구현 경로:
- `performSlashBlast`의 원형 판정 → 직사각형 판정으로 변경 (기존 `powerStrike`의 hitbox 패턴 재사용)
- 스턴: `monster.stunTimer = 90` 속성 추가 → `Monster.update()`에서 `stunTimer > 0`이면 vx 변경 블록
- Effect: 지면에서 올라오는 먼지 파티클 + 가로 크랙 라인 렌더링

---

### 방어 자세 (Guard Stance)

유일한 생존 옵션 추가.
현재 피해 회피 수단은 무적 프레임(60프레임) 전부.
`rage`·`haste`와 같은 버프 구조로 구현 가능.

```
type:       buff ('guard')
피해 감소:  50% (피해받은 순간 반격도 트리거)
반격:       충돌 시 주변 원형 15px 범위 몬스터에 1.0× 피해
duration:   180프레임 (3초)
mp:         12
cooldown:   360프레임
```

구현 경로:
- `player.buffs.guard` 저장 (rage·haste와 동일한 패턴)
- `Monster.update()` → 플레이어 충돌 블록에서 `player.buffs.guard` 체크:
  - `damage *= 0.5`
  - 충돌 시 즉시 주변 몬스터에 반격 피해 + Effect('guardCounter') 생성
- 기존 패턴과의 차이: 버프 효과가 "피해받을 때" 트리거되는 리액티브 타입 (rage·haste는 매프레임 적용)

---

## 도적군

### 독 단검 (Poison Dagger)

도적의 유일한 단점 2건을 동시에 해결: 원거리 공격 없음, 지속 피해 없음.

```
type:       'poisonDagger' (투사체 + DoT)
초격 피해:  1.5×  (~18)
DoT:        0.8× × 4회 (0.5초 간격, 총 2초)
투사체 속도: 12 (기본 화살 14보다 느림 → 단거리 위주)
mp:         8
cooldown:   80프레임
```

구현 경로:
- `performPoisonDagger()`: `new Projectile(...)` 생성 (기존 궁수 basicAttack과 동일한 패턴)
- Projectile 충돌 시 `monster.poison = { damage, ticksLeft: 4, interval: 30 }` 저장
- `Monster.update()`에 poison 처리 추가:

```js
if (this.poison) {
  this.poison.interval--;
  if (this.poison.interval <= 0) {
    this.takeDamage(this.poison.damage);
    this.poison.ticksLeft--;
    this.poison.interval = 30;
  }
  if (this.poison.ticksLeft <= 0) this.poison = null;
}
```

- Effect: 녹색 안개 파티클이 몬스터 주변에 지속적으로 생성 (파티클은 기존 `createParticles` 재사용)

---

### 분신 공격 (Shadow Clone)

`doubleStab`과 동일한 multi-hit setTimeout 패턴이지만
밀치기를 각 히트마다 추가하여 군집 처리를 실질적으로 강화.

```
type:       'shadowClone'
damage:     1.2× × 3회 (100ms 간격)
밀치기:     각 히트마다 vx = direction×10, vy = -6
AoE 범위:   방향 기준 100px × (height+30)
mp:         10
cooldown:   100프레임
```

구현 경로:
- `performShadowClone()`: `performDoubleStab`과 구조가 거의 동일
- 차이점 2건: (1) 각 히트 시 몬스터에 밀치기 적용, (2) Effect는 분신 그림자 3개가 순차적으로 나타나는 타입
- `doubleStab`의 코드를 직접 재사용 가능한 수준

---

## 궁수군

### 강화 화살 (Charged Arrow)

현재 궁수의 단일 강타는 soul 버프 여부에 달린 구조.
soul은 10초 버프이므로 강타를 원할 때 항상 쓸 수 없음.
soul 없이도 쓸 수 있는 독립 강타 추가.

```
type:       'chargedArrow' (단일 관통 투사체)
damage:     4.0×  (~72)
piercing:   항상 true (soul 버프 불필요)
속도:       22 (기본 화살 14의 1.5배)
mp:         10
cooldown:   90프레임
```

구현 경로:
- `performChargedArrow()`: basicAttack의 arrow 생성 코드와 동일.
  `new Projectile(x, y, dir, damage, 'arrow', true, 0)` + speed 덮어쓰기
- Effect: 발사 순간 밝은 백색·황색 폭발 원 (기존 `powerStrike` Effect의 팽창 원 패턴 재사용)
- Projectile 자체 수정 불필요 — speed와 damage만 다른 값

---

### 함진 화살 (Trap Arrow)

게임 전체에 영역 부정(area denial) 수단이 없음.
함진은 유일하게 몬스터의 이동 경로를 강제할 수 있는 스킬.

```
type:       'trapArrow'
트랩 피해:  2.5×  (~45)
스턴:       충돌 몬스터에 stunTimer = 60 (1초)
트랩 수명:  300프레임 (5초) 후 자동 소멸
유지 가능:  최대 1개 (새 배치 시 기존 트랩 즉시 소멸)
mp:         12
cooldown:   200프레임
```

구현 경로:
- `game.trap` 단일 객체 (배열 아님, 최대 1개): `{ x, y, life, damage, stunDuration }`
- `performTrapArrow()`: trap 객체 생성 (player 발밑 좌표)
- `gameLoop()`에 trap 업데이트 추가:

```js
if (game.trap) {
  game.trap.life--;
  if (game.trap.life <= 0) { game.trap = null; }
  // 몬스터 AABB 충돌 체크 → 피해 + stunTimer
}
```

- draw: 지면에 작은 삼각형 함진 그림자 + 활성 시 깜빡 효과

---

## 구현 난이도 정리

| 스킬 | 새로운 패턴 | 기존 패턴 재사용 |
|------|------------|-----------------|
| 지진 타격 | stunTimer (몬스터 속성 1건) | hitbox, AoE 판정 |
| 방어 자세 | 리액티브 버프 (충돌 시 트리거) | buff 저장·만료 |
| 독 단검 | poison (몬스터 속성 1건 + update 루프) | Projectile 생성 |
| 분신 공격 | 없음 | multi-hit setTimeout 전부 재사용 |
| 강화 화살 | 없음 | Projectile 생성 전부 재사용 |
| 함진 화살 | game.trap 엔티티 | 충돌 판정, stunTimer |

**분신 공격과 강화 화살**이 가장 가볍고,
**독 단검**이 장기적으로 가장 큰 시스템 변경(DoT 루프)을 가져옵니다.
