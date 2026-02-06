# 캐릭터 스킬 추가

## 설명
`.claude/docs/character-skill.md`의 제안을 기반으로 새로운 캐릭터 스킬을 구현하는 스킬입니다. JOBS 정의, perform 함수, Effect 렌더링, useSkill switch 케이스를 자동으로 생성합니다.

## 사용법
```bash
/add-character-skill
```

특정 스킬 직접 지정:
```bash
/add-character-skill "지진 타격"
/add-character-skill "독 단검"
```

직업 지정:
```bash
/add-character-skill --job=warrior
/add-character-skill --job=thief
/add-character-skill --job=archer
```

## 동작 과정

1. **스킬 선택**
   - `character-skill.md`에서 제안된 6개 스킬 목록 표시
   - 사용자가 구현할 스킬 선택
   - 또는 커스텀 스킬 정의 입력

2. **스킬 정의 생성**
   - JOBS 객체에 스킬 추가
   - 필수 속성 설정:
     - `name`: 스킬명
     - `key`: 키 바인딩 (Z/X/C)
     - `mp`: MP 소모량
     - `cooldown`: 쿨다운 (프레임)
     - `damage`: 피해 배율
     - `type`: 스킬 타입 (실행 함수 연결)
     - `icon`: 이모지 아이콘

3. **perform 함수 구현**
   - `perform[SkillName]()` 함수 생성
   - 히트박스 판정 로직 추가
   - 피해 적용 및 특수 효과
   - 이펙트 생성 호출

4. **Effect 클래스 확장**
   - 새 이펙트 타입 추가
   - `draw()` 메서드에 렌더링 코드 추가
   - 파티클 효과 구현

5. **useSkill 연결**
   - `useSkill()` 함수의 switch에 케이스 추가
   - 스킬 실행 로직 연결

6. **테스트 가이드 제공**
   - 구현 완료 후 테스트 체크리스트 생성
   - 예상 동작 설명

## 제안 스킬 목록

### 전사군 (Warrior)

#### 1. 지진 타격 (Earthquake Strike)
```
타입:       지면 AoE + 스턴
피해:       2.0× (~30)
범위:       가로 250px × 세로 80px (플레이어 발밑)
효과:       1.5초 스턴
MP:         12
쿨다운:     100프레임
```

**구현 포인트:**
- 직사각형 히트박스 (powerStrike 패턴 재사용)
- 몬스터에 `stunTimer = 90` 속성 추가
- Monster.update()에서 stunTimer 체크
- 이펙트: 지면 크랙 + 먼지 파티클

#### 2. 방어 자세 (Guard Stance)
```
타입:       리액티브 버프
효과:       피해 50% 감소 + 반격
반격:       충돌 시 주변 15px 몬스터에 1.0× 피해
지속:       180프레임 (3초)
MP:         12
쿨다운:     360프레임
```

**구현 포인트:**
- `player.buffs.guard` 저장 (rage 패턴)
- Monster.update() 충돌 블록에서 체크
- 피해 감소: `damage *= 0.5`
- 반격 판정: 주변 원형 AoE
- 이펙트: 방패 아우라 + 반격 플래시

### 도적군 (Thief)

#### 3. 독 단검 (Poison Dagger)
```
타입:       투사체 + DoT
초격:       1.5× (~18)
DoT:        0.8× × 4회 (0.5초 간격)
속도:       12 (기본 화살보다 느림)
MP:         8
쿨다운:     80프레임
```

**구현 포인트:**
- Projectile 생성 (궁수 arrow 패턴)
- 충돌 시 `monster.poison = { damage, ticksLeft, interval }`
- Monster.update()에 DoT 처리 루프 추가
- 이펙트: 녹색 안개 파티클 지속 생성

#### 4. 분신 공격 (Shadow Clone)
```
타입:       3연타 + 밀치기
피해:       1.2× × 3회 (100ms 간격)
밀치기:     각 히트마다 vx=±10, vy=-6
범위:       100px × (height+30)
MP:         10
쿨다운:     100프레임
```

**구현 포인트:**
- doubleStab 패턴 재사용
- 각 히트마다 밀치기 적용
- 이펙트: 분신 그림자 3개 순차 표시

### 궁수군 (Archer)

#### 5. 강화 화살 (Charged Arrow)
```
타입:       단일 강타 투사체
피해:       4.0× (~72)
관통:       true (soul 불필요)
속도:       22 (1.5배)
MP:         10
쿨다운:     90프레임
```

**구현 포인트:**
- basicAttack arrow 패턴 재사용
- piercing: true, speed: 22
- 이펙트: 발사 시 백색 폭발원

#### 6. 함진 화살 (Trap Arrow)
```
타입:       지면 트랩
피해:       2.5× (~45)
스턴:       60프레임 (1초)
수명:       300프레임 (5초)
제한:       최대 1개
MP:         12
쿨다운:     200프레임
```

**구현 포인트:**
- `game.trap` 단일 객체 (x, y, life, damage)
- gameLoop()에 trap 업데이트 추가
- 몬스터 AABB 충돌 체크
- 이펙트: 삼각형 함진 + 깜빡 효과

## 구현 패턴

### 1. JOBS 객체에 스킬 추가

```javascript
// 예시: 전사 - 지진 타격
JOBS.warrior.skills[0] = {
  name: '지진 타격',
  key: 'Z',
  mp: 12,
  cooldown: 100,
  damage: 2.0,
  type: 'earthquakeStrike',
  icon: '🌍'
};
```

### 2. perform 함수 구현

```javascript
function performEarthquakeStrike() {
  // 히트박스 정의
  const hitbox = {
    x: player.x - 125,
    y: player.y,
    width: 250,
    height: 80
  };

  // 몬스터 피해 및 스턴
  game.monsters.forEach(monster => {
    if (checkCollision(monster, hitbox)) {
      const damage = player.attack * 2.0;
      monster.takeDamage(damage);
      monster.stunTimer = 90; // 1.5초 스턴
    }
  });

  // 이펙트 생성
  game.effects.push(new Effect('earthquakeStrike', player.x, player.y, player.direction));
}
```

### 3. Effect 타입 추가

```javascript
// Effect 클래스 draw() 메서드 내
case 'earthquakeStrike':
  // 지면 크랙 렌더링
  ctx.strokeStyle = '#8B4513';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(this.x - 125, this.y + 40);
  ctx.lineTo(this.x + 125, this.y + 40);
  ctx.stroke();

  // 먼지 파티클
  createParticles(this.x, this.y, 15, '#B8860B');
  break;
```

### 4. useSkill switch 연결

```javascript
case 'earthquakeStrike':
  performEarthquakeStrike();
  break;
```

### 5. Monster 클래스 확장 (필요 시)

```javascript
// Monster.update() 내 스턴 처리
if (this.stunTimer > 0) {
  this.stunTimer--;
  this.vx = 0; // 이동 정지
  return; // 다른 로직 스킵
}
```

## 옵션

- `--dry-run` - 변경사항 미리보기 (실제 수정 X)
- `--job=warrior|thief|archer` - 특정 직업만 선택
- `--tier=0` - 전직 단계 지정 (현재는 tier 0만 지원)

## 예시

### 예시 1: 대화형 스킬 선택
```bash
/add-character-skill
```

**선택 화면:**
```
=== 캐릭터 스킬 추가 ===

제안된 스킬 목록:

전사군 (Warrior):
  1. 지진 타격 (Earthquake Strike) - 지면 AoE + 스턴
  2. 방어 자세 (Guard Stance) - 피해 감소 + 반격

도적군 (Thief):
  3. 독 단검 (Poison Dagger) - 투사체 + DoT
  4. 분신 공격 (Shadow Clone) - 3연타 + 밀치기

궁수군 (Archer):
  5. 강화 화살 (Charged Arrow) - 단일 강타 투사체
  6. 함진 화살 (Trap Arrow) - 지면 트랩

구현할 스킬을 선택하세요 (1-6): 3
```

**구현 결과:**
```
=== 독 단검 스킬 구현 중 ===

1. JOBS.thief.skills에 스킬 정의 추가
   ✓ name: '독 단검'
   ✓ type: 'poisonDagger'
   ✓ mp: 8, cooldown: 80

2. performPoisonDagger() 함수 생성
   ✓ Projectile 생성 (속도: 12)
   ✓ 충돌 시 poison 속성 부여

3. Monster.update() DoT 처리 추가
   ✓ poison.interval 카운트다운
   ✓ 0.5초마다 0.8× 피해
   ✓ 4회 반복 후 제거

4. Effect 'poisonCloud' 타입 추가
   ✓ 녹색 안개 파티클
   ✓ 몬스터 주변 지속 생성

5. useSkill() switch 연결
   ✓ case 'poisonDagger' 추가

=== 구현 완료 ===

테스트 가이드:
1. 도적 선택 후 게임 시작
2. Z키로 독 단검 발사
3. 확인 사항:
   □ 녹색 투사체 발사
   □ 몬스터 충돌 시 초격 피해
   □ 녹색 안개 이펙트 지속
   □ 0.5초마다 작은 피해 4회
   □ MP 8 소모, 쿨다운 80프레임

다음 단계:
/game-test --focus=skills  # 스킬 테스트
/git-auto                  # 커밋
```

### 예시 2: 특정 스킬 직접 지정
```bash
/add-character-skill "지진 타격"
```

**결과:**
```
'지진 타격' 스킬 구현을 시작합니다.

직업: 전사 (Warrior)
타입: 지면 AoE + 스턴

[구현 진행...]
```

### 예시 3: 커스텀 스킬 정의
```bash
/add-character-skill --custom
```

**입력 프롬프트:**
```
커스텀 스킬 정의:

스킬명: 회오리 베기
직업 (warrior/thief/archer): warrior
키 바인딩 (Z/X/C): X
MP 소모: 15
쿨다운 (프레임): 120
피해 배율: 1.8
타입 식별자: whirlwindSlash
아이콘 (emoji): 🌪️

특수 효과 설명:
- 플레이어 중심 원형 AoE (반경 150px)
- 적을 중앙으로 끌어당김 (vx = 방향×(-5))
- 회전 이펙트 2초간 지속
```

## 주의사항

1. **기존 스킬 충돌**
   - 키 바인딩이 겹치지 않도록 주의
   - 스킬 슬롯은 직업당 3개로 제한

2. **밸런스 고려**
   - 피해/MP/쿨다운 비율 확인
   - 기존 스킬과 DPS 비교 필요
   - `/balance-calc`로 사전 계산 권장

3. **코드 위치 확인**
   - game.html 내 적절한 위치에 삽입
   - 주석으로 구분 명확히

4. **테스트 필수**
   - 구현 후 즉시 `/game-test` 실행
   - 모든 직업에서 영향 없는지 확인

5. **Effect 복잡도**
   - 너무 복잡한 렌더링은 성능 저하
   - 파티클 수 제한 (20개 이하)

## 스킬 밸런스 가이드

### DPS 기준치 (Lv1, 공격력 15 기준)

**전사:**
- 기본공격 DPS: ~9 (1.4× / 28프레임)
- 스킬 DPS 목표: 12~18

**도적:**
- 기본공격 DPS: ~12 (0.4×2 / 10프레임)
- 스킬 DPS 목표: 15~22

**궁수:**
- 기본공격 DPS: ~15 (1.0× / 18프레임)
- 스킬 DPS 목표: 18~25

### MP 효율 기준
```
단일 강타: 15~20 피해당 MP 1
범위 공격: 10~15 피해당 MP 1 (적 수 배율 적용)
버프: 10초 지속당 MP 10~15
```

### 쿨다운 기준
```
단일 강타: 60~100프레임 (1~1.7초)
범위 공격: 80~150프레임 (1.3~2.5초)
버프: 300~600프레임 (5~10초)
```

## 관련 명령어

- `/game-test --focus=skills` - 스킬 테스트
- `/balance-calc` - 밸런스 계산
- `/git-auto` - 구현 후 커밋

## 트러블슈팅

### 스킬이 실행 안됨
```javascript
// useSkill() switch에 케이스 추가 확인
// perform함수명 오타 확인
// MP/쿨다운 조건 확인
```

### 피해가 적용 안됨
```javascript
// 히트박스 좌표 확인 (console.log로 디버깅)
// monster.takeDamage() 호출 확인
// 충돌 판정 로직 확인
```

### 이펙트가 안보임
```javascript
// Effect 생성 확인 (game.effects 배열에 push)
// draw() 메서드의 switch에 케이스 추가 확인
// 좌표 계산 확인
```

### DoT가 작동 안함
```javascript
// monster.poison 속성 저장 확인
// Monster.update() 루프 추가 확인
// interval/ticksLeft 카운트다운 로직 확인
```
