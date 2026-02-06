# 몬스터 타입 추가

## 설명
새로운 몬스터 타입을 게임에 추가하는 스킬입니다. Monster 클래스 정의, 스케일링 공식, 렌더링, 스폰 조건을 자동으로 생성합니다.

## 사용법
```bash
/add-monster
```

특정 몬스터 직접 지정:
```bash
/add-monster "불타는 버그"
/add-monster "바위 고래"
```

몬스터 정보 조회:
```bash
/add-monster --list     # 계획된 몬스터 목록
/add-monster --current  # 현재 구현된 몬스터
```

## 동작 과정

1. **몬스터 선택**
   - plan.md에서 제안된 몬스터 목록 표시
   - 사용자 선택 또는 커스텀 정의

2. **스케일링 공식 설정**
   - HP: `baseHp + level × hpPerLevel`
   - 피해: `baseDamage + level × damagePerLevel`
   - 경험치: `baseExp + level × expBonus`

3. **출현 조건 정의**
   - 최소 레벨 설정
   - 스폰 확률 (선택)
   - 특정 맵/구역 (미래 확장)

4. **렌더링 코드 생성**
   - Monster 클래스 draw() 메서드에 케이스 추가
   - 이모지 또는 도형 렌더링
   - HP 바 표시

5. **특수 행동 구현 (선택)**
   - 커스텀 AI 패턴
   - 특수 공격 (원거리, 폭발 등)
   - 상태 이상 효과

6. **spawnMonster() 연결**
   - 출현 조건 로직 추가
   - 스폰 간격 조정

## 계획된 몬스터 (plan.md 기반)

### 현재 구현됨

#### 🟢 슬라임 (Slime)
```
출현:     Lv1+
HP:       30 + Lv×10
피해:     8 + Lv×2
경험치:   25
행동:     기본 추적
```

#### 🔴 머쉬룸 (Mushroom)
```
출현:     Lv1+
HP:       50 + Lv×15
피해:     12 + Lv×3
경험치:   40
행동:     기본 추적
```

#### 🟤 스텀프 (Stump)
```
출현:     Lv3+
HP:       80 + Lv×20
피해:     15 + Lv×4
경험치:   60
행동:     기본 추적
```

### 구현 예정

#### 🔥 불타는 버그 (Burning Bug)
```
출현:     Lv15+
HP:       120 + Lv×25
피해:     20 + Lv×5
경험치:   100
특수효과: 불 피해 (HP 회복 무효 3초)
행동:     빠른 추적 (speed × 1.3)
```

**구현 포인트:**
- 플레이어 충돌 시 `player.burning = 180` (3초)
- burning 상태에서 HP 회복 차단
- 붉은 불꽃 파티클 생성
- 빠른 이동 속도

#### 🪨 바위 고래 (Rock Golem)
```
출현:     Lv35+
HP:       300 + Lv×50
피해:     30 + Lv×8
경험치:   200
특수효과: 하단 강타 (지면 충격파)
행동:     느린 추적 (speed × 0.7) + 주기적 강타
```

**구현 포인트:**
- 높은 HP, 느린 속도
- 3초마다 하단 강타 실행
- 강타: 가로 200px 범위 피해 + 1초 스턴
- 회색 바위 텍스처, 큰 사이즈

#### 🐉 고대 드래곤 (Ancient Dragon)
```
출현:     Lv60+
HP:       800 + Lv×100
피해:     50 + Lv×12
경험치:   500
특수효과: 폭발 공격 (원거리 투사체)
행동:     공중 비행 + 원거리 공격
```

**구현 포인트:**
- 보스급 몬스터 (화면당 1마리 제한)
- 3초마다 폭발 투사체 발사
- 투사체: 플레이어 추적, 충돌 시 반경 50px AoE
- 비행: 플랫폼 충돌 무시
- 용 이모지 또는 커스텀 렌더링

## 구현 패턴

### 1. Monster 생성자에 타입 추가

```javascript
// Monster 클래스 생성자 내
const monsterTypes = {
  // 기존 타입들...

  burningBug: {
    emoji: '🔥',
    hp: 120 + level * 25,
    damage: 20 + level * 5,
    exp: 100,
    speed: 1.3,          // 빠른 이동
    special: 'burning'   // 특수 효과 식별자
  }
};
```

### 2. 특수 행동 구현

```javascript
// Monster.update() 메서드 내
if (this.type === 'burningBug' && this.specialTimer <= 0) {
  // 충돌 시 burning 효과 적용은 충돌 블록에서 처리
  this.specialTimer = 60; // 쿨다운
}

// 충돌 블록 (player와 충돌 시)
if (this.special === 'burning') {
  player.burning = 180; // 3초 동안 HP 회복 무효
  createParticles(this.x, this.y, 8, '#FF4500'); // 붉은 불꽃
}
```

### 3. 렌더링 추가

```javascript
// Monster.draw() 메서드 내
draw() {
  // 기본 렌더링
  ctx.fillText(this.emoji, this.x, this.y);

  // 특수 이펙트
  if (this.special === 'burning') {
    // 불꽃 오라
    ctx.strokeStyle = '#FF4500';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x + this.width/2, this.y + this.height/2,
            this.width/2 + 5, 0, Math.PI * 2);
    ctx.stroke();
  }

  // HP 바
  this.drawHealthBar();
}
```

### 4. spawnMonster() 조건 추가

```javascript
function spawnMonster() {
  let type;

  if (player.level >= 60) {
    // 고레벨 몬스터 우선
    type = Math.random() < 0.3 ? 'ancientDragon' :
           Math.random() < 0.5 ? 'rockGolem' :
           'burningBug';
  } else if (player.level >= 35) {
    type = Math.random() < 0.4 ? 'rockGolem' :
           Math.random() < 0.6 ? 'burningBug' :
           ['stump', 'mushroom', 'slime'][Math.floor(Math.random() * 3)];
  } else if (player.level >= 15) {
    type = Math.random() < 0.3 ? 'burningBug' :
           ['stump', 'mushroom', 'slime'][Math.floor(Math.random() * 3)];
  } else if (player.level >= 3) {
    type = ['stump', 'mushroom', 'slime'][Math.floor(Math.random() * 3)];
  } else {
    type = Math.random() < 0.5 ? 'slime' : 'mushroom';
  }

  game.monsters.push(new Monster(type));
}
```

### 5. 플레이어 상태 확장 (burning 예시)

```javascript
// player 객체에 추가
player.burning = 0;

// gameLoop() 내 업데이트
if (player.burning > 0) {
  player.burning--;
  // 불꽃 파티클 표시
  if (frameCount % 10 === 0) {
    createParticles(player.x, player.y, 3, '#FF4500');
  }
}

// checkLevelUp() 또는 HP 회복 로직에서
if (player.burning > 0) {
  // HP 자동 회복 차단
  return;
}
```

## 옵션

- `--list` - 계획된 몬스터 목록 표시
- `--current` - 현재 구현된 몬스터 표시
- `--balance` - 밸런스 계산 자동 수행

## 예시

### 예시 1: 대화형 몬스터 추가
```bash
/add-monster
```

**선택 화면:**
```
=== 몬스터 타입 추가 ===

계획된 몬스터:
1. 🔥 불타는 버그 (Burning Bug) - Lv15+
2. 🪨 바위 고래 (Rock Golem) - Lv35+
3. 🐉 고대 드래곤 (Ancient Dragon) - Lv60+

추가할 몬스터를 선택하세요 (1-3): 1
```

**구현 진행:**
```
=== 불타는 버그 구현 중 ===

1. Monster 생성자에 타입 정의 추가
   ✓ HP: 120 + Lv×25
   ✓ 피해: 20 + Lv×5
   ✓ 경험치: 100
   ✓ 속도: 1.3 (기본의 130%)

2. 특수 효과 구현
   ✓ burning 상태 추가 (3초 지속)
   ✓ HP 회복 무효 로직
   ✓ 불꽃 파티클 생성

3. 렌더링 코드 추가
   ✓ 이모지: 🔥
   ✓ 불꽃 오라 이펙트
   ✓ HP 바 표시

4. 스폰 조건 추가
   ✓ Lv15+ 출현
   ✓ 30% 확률

5. 밸런스 계산
   ✓ Lv15 기준 HP: 495
   ✓ 예상 처치 시간: 8~12초
   ✓ 경험치 효율: 양호

=== 구현 완료 ===

테스트 가이드:
1. 레벨 15까지 플레이
2. 불타는 버그 출현 확인 (🔥)
3. 확인 사항:
   □ 빠른 이동 속도
   □ 충돌 시 불꽃 이펙트
   □ HP 회복 차단 (3초)
   □ HP 바 정상 표시
   □ 경험치 100 획득

다음 단계:
/game-test --focus=monsters  # 몬스터 테스트
/balance-calc                # 밸런스 재계산
/git-auto                    # 커밋
```

### 예시 2: 특정 몬스터 직접 지정
```bash
/add-monster "바위 고래"
```

**결과:**
```
'바위 고래' 몬스터 구현을 시작합니다.

레벨 제한: Lv35+
HP: 300 + Lv×50 (Lv35 기준: 2050)
특수 공격: 하단 강타 (지면 충격파)

[구현 진행...]
```

### 예시 3: 커스텀 몬스터
```bash
/add-monster --custom
```

**입력 프롬프트:**
```
커스텀 몬스터 정의:

몬스터명: 독 거미
타입 식별자: poisonSpider
이모지: 🕷️

출현 레벨: 20
기본 HP: 150
HP/레벨: 30
기본 피해: 18
피해/레벨: 6
경험치: 120

특수 효과: (선택, 엔터로 건너뛰기)
- poison (중독 DoT)

이동 속도 배율: 1.0
크기 (width×height): 50×50

특수 행동 설명:
- 충돌 시 독 DoT 부여 (0.5× × 6회, 0.5초 간격)
```

## 몬스터 밸런스 가이드

### HP 설정 기준
```
일반 몬스터: 처치 시간 5~8초
엘리트 몬스터: 처치 시간 10~15초
보스 몬스터: 처치 시간 30~60초

공식:
HP = 플레이어 DPS × 목표 처치 시간 × 레벨 배율

예시 (Lv15 전사, DPS ~12):
일반: 12 × 6 = 72 → baseHp=30, hpPerLevel=10 → 30+15×10=180
엘리트: 12 × 12 = 144 → baseHp=80, hpPerLevel=20 → 80+15×20=380
```

### 피해 설정 기준
```
플레이어 HP의 5~10% (1~2초당 1회 충돌 가정)

예시 (Lv15 전사, maxHp=480):
일반: 480 × 0.06 = 29 → baseDamage=8, damagePerLevel=2 → 8+15×2=38
엘리트: 480 × 0.10 = 48 → baseDamage=12, damagePerLevel=3 → 12+15×3=57
```

### 경험치 설정 기준
```
처치 난이도에 비례
일반: baseExp × level × 1.0
엘리트: baseExp × level × 1.5
보스: baseExp × level × 3.0

레벨업 필요 경험치 기준:
Lv1→2: 100exp
Lv10→11: 300exp
Lv20→21: 600exp

일반 몬스터 처치 수:
Lv1: 4마리 (25exp/마리)
Lv10: 7마리 (40~60exp/마리)
```

## 주의사항

1. **출현 레벨 조정**
   - 너무 이른 레벨에 강한 몬스터 출현 금지
   - 플레이어 DPS를 고려한 밸런스

2. **특수 효과 남용 주의**
   - 모든 몬스터에 특수 효과 필요 없음
   - 일부만 특별하게 만들어야 차별화

3. **렌더링 성능**
   - 복잡한 렌더링은 FPS 저하
   - 파티클 수 제한 (몬스터당 5개 이하)

4. **AI 패턴 다양화**
   - 모두 추적만 하면 단조로움
   - 일부는 순찰, 대기, 도망 등 추가

5. **보스 몬스터 제한**
   - 화면당 1마리만 스폰
   - 다른 몬스터와 별도 관리

## 특수 행동 패턴 예시

### 원거리 공격
```javascript
// Monster.update() 내
if (this.type === 'ancientDragon' && this.attackTimer <= 0) {
  // 플레이어 방향으로 투사체 발사
  const dx = player.x - this.x;
  const dy = player.y - this.y;
  const distance = Math.sqrt(dx*dx + dy*dy);

  game.projectiles.push(new Projectile(
    this.x, this.y,
    dx / distance,  // 정규화된 방향
    this.damage,
    'fireball',
    false,
    dy / distance   // vy
  ));

  this.attackTimer = 180; // 3초 쿨다운
}
this.attackTimer--;
```

### 순찰 패턴
```javascript
// Monster 생성 시
this.patrolLeft = this.x - 200;
this.patrolRight = this.x + 200;
this.patrolDirection = 1;

// update() 내
if (distance > 300) { // 플레이어가 멀면 순찰
  this.vx = this.speed * this.patrolDirection;
  if (this.x >= this.patrolRight) this.patrolDirection = -1;
  if (this.x <= this.patrolLeft) this.patrolDirection = 1;
} else {
  // 플레이어 가까우면 추적
  this.vx = this.speed * direction;
}
```

### 도망 패턴
```javascript
// HP 30% 이하일 때 도망
if (this.hp < this.maxHp * 0.3) {
  this.vx = -this.speed * direction; // 반대 방향
  this.speed = 3; // 빠르게 도망
}
```

## 관련 명령어

- `/game-test --focus=monsters` - 몬스터 테스트
- `/balance-calc` - 밸런스 계산
- `/git-auto` - 구현 후 커밋

## 트러블슈팅

### 몬스터가 안나타남
```javascript
// spawnMonster() 조건 확인
console.log('player.level:', player.level);
console.log('spawn type:', type);

// Monster 생성 확인
console.log('monsters:', game.monsters.length);
```

### 특수 효과가 작동 안함
```javascript
// 상태 확인
console.log('player.burning:', player.burning);
console.log('monster.special:', this.special);

// 충돌 블록 실행 확인
console.log('collision detected');
```

### 밸런스 문제 (너무 강함/약함)
```bash
# 밸런스 계산기로 재계산
/balance-calc

# 수치 조정 후 테스트
/game-test
```
