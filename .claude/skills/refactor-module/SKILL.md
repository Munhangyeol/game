# 파일 분리 (Module Refactoring)

## 설명
plan.md Phase 5의 파일 분리 작업을 단계적으로 진행하는 스킬입니다. 단일 파일 `game.html` (~1770 lines)을 ESM 모듈 구조로 분리하여 유지보수성을 향상시킵니다.

## 사용법
```bash
/refactor-module
```

특정 단계만 실행:
```bash
/refactor-module --step=1    # CSS 분리
/refactor-module --step=2    # 데이터 분리
/refactor-module --step=3    # 엔티티 분리
```

전체 진행 상황 확인:
```bash
/refactor-module --status
```

## 동작 과정

1. **현재 진행 상황 파악**
   - 이미 분리된 모듈 확인
   - 다음 단계 결정
   - 의존성 체크

2. **분리 단계 선택**
   - 6단계 순차 진행 (CSS → 데이터 → 엔티티 → 시스템 → UI → 메인)
   - 사용자 확인 후 실행

3. **코드 추출 및 모듈 생성**
   - 대상 코드 블록 추출
   - 새 파일에 모듈로 작성
   - export 구문 추가

4. **import 연결**
   - 의존하는 파일에 import 추가
   - 상대 경로 계산

5. **원본 파일 정리**
   - 추출된 코드 제거
   - import 구문 추가
   - 주석으로 이동 표시

6. **테스트 및 검증**
   - 게임 실행 확인
   - 기능 회귀 테스트
   - 에러 콘솔 확인

## 분리 단계 (Phase 5 로드맵 기반)

### Step 1: CSS 분리
```
목표: <style> 태그 내용을 외부 CSS 파일로 분리
난이도: ★☆☆☆☆ (가장 안전, 의존성 없음)

작업:
1. css/style.css 파일 생성
2. <style> 내용 복사
3. <link rel="stylesheet" href="css/style.css"> 추가
4. 원본 <style> 태그 제거

검증:
- 게임 UI 스타일 유지
- 직업 선택 카드 애니메이션 작동
- 스킬바/버프바 레이아웃 정상
```

### Step 2: 데이터 분리
```
목표: JOBS 객체와 정적 데이터를 별도 모듈로 분리
난이도: ★★☆☆☆ (순수 데이터, 로직 없음)

작업:
1. js/data/jobs.js 생성
   - JOBS 객체 export
   - PROMOTION_LEVELS 상수 export (전직 구현 시)

2. js/data/monsters.js 생성 (선택)
   - 몬스터 타입 정의 객체 export

3. index.html에서 import
   - <script type="module">로 변경
   - import { JOBS } from './js/data/jobs.js';

검증:
- 직업 선택 화면 정상
- 스킬 정보 표시 정상
- 스킬 실행 정상
```

### Step 3: 엔티티 클래스 분리
```
목표: Effect, Projectile, Monster 클래스를 별도 파일로 분리
난이도: ★★★☆☆ (의존성 시작, import/export 복잡)

작업:
1. js/entities/effect.js
   - Effect 클래스 export
   - createParticles 함수 포함 가능

2. js/entities/projectile.js
   - Projectile 클래스 export

3. js/entities/monster.js
   - Monster 클래스 export
   - 몬스터 타입 정의 포함

4. 각 클래스에서 필요한 상태 import
   - import { game, player, canvas, ctx } from '../state.js';

검증:
- 몬스터 스폰 및 이동
- 투사체 발사 및 충돌
- 이펙트 렌더링
- 파티클 생성
```

### Step 4: 시스템 함수 분리
```
목표: 전투/레벨업/파티클 로직을 별도 모듈로 분리
난이도: ★★★★☆ (로직 복잡, 함수 간 의존성 많음)

작업:
1. js/systems/combat.js
   - basicAttack() export
   - useSkill() export
   - perform*() 함수들 전부 export

2. js/systems/levelup.js
   - checkLevelUp() export
   - 전직 트리거 로직 (구현 시)

3. js/systems/particles.js
   - createParticles() export
   - createDamageText() export

4. 함수 간 호출 확인
   - useSkill → perform* 호출
   - combat → particles 호출

검증:
- 기본공격 작동
- 스킬 실행 정상
- 레벨업 시스템
- 파티클 효과
```

### Step 5: UI 함수 분리
```
목표: HUD 및 직업 선택 UI를 별도 모듈로 분리
난이도: ★★★☆☆ (DOM 조작, 상태 읽기 의존)

작업:
1. js/ui/hud.js
   - updateUI() export
   - updateSkillBar() export
   - updateBuffBar() export

2. js/ui/jobselect.js
   - selectJob() export
   - createSkillBar() export
   - 직업 선택 화면 로직

검증:
- 직업 선택 화면
- HP/MP/EXP 바 업데이트
- 스킬바 쿨다운 표시
- 버프 아이콘 표시
```

### Step 6: 상태 및 메인 진입점
```
목표: 공유 상태를 state.js로 통합, main.js 진입점 생성
난이도: ★★★★★ (전체 구조 변경, 의존성 총정리)

작업:
1. js/state.js 생성
   - game 객체 export
   - player 객체 export
   - canvas, ctx export
   - 모든 모듈에서 import

2. js/main.js 생성
   - 모든 모듈 import 종합
   - gameLoop() 정의
   - 키 이벤트 바인딩
   - init() 함수로 진입

3. index.html 최종 정리
   - <script type="module" src="js/main.js">만 남김
   - 기존 <script> 태그 제거

검증:
- 전체 게임 플레이 테스트
- 모든 직업 테스트
- 회귀 버그 없음 확인
```

## 목표 파일 구조

```
game/
├── index.html                  # HTML 구조만 (canvas, UI 오버레이)
├── css/
│   └── style.css               # 기존 <style> 내용 전부
└── js/
    ├── state.js                # 공유 상태: game, player, canvas, ctx
    ├── main.js                 # 진입점: gameLoop, 키 이벤트
    ├── data/
    │   ├── jobs.js             # JOBS (tiers 포함)
    │   └── monsters.js         # 몬스터 타입 정의
    ├── entities/
    │   ├── monster.js          # Monster 클래스
    │   ├── projectile.js       # Projectile 클래스
    │   └── effect.js           # Effect 클래스
    ├── systems/
    │   ├── combat.js           # basicAttack, useSkill, perform*
    │   ├── levelup.js          # checkLevelUp
    │   └── particles.js        # createParticles, createDamageText
    └── ui/
        ├── hud.js              # updateUI, updateSkillBar, updateBuffBar
        └── jobselect.js        # selectJob, 직업 선택 화면
```

## 진행 상황 추적

```
Phase 5 진행도:
[✓] Step 1: CSS 분리               (완료)
[✓] Step 2: 데이터 분리             (완료)
[ ] Step 3: 엔티티 클래스 분리       (다음 단계)
[ ] Step 4: 시스템 함수 분리
[ ] Step 5: UI 함수 분리
[ ] Step 6: 상태 및 메인 진입점

현재 파일:
- game.html: 1770 lines
- css/style.css: 250 lines
- js/data/jobs.js: 180 lines
```

## 예시

### 예시 1: 자동 진행 (다음 단계 실행)
```bash
/refactor-module
```

**결과:**
```
=== 파일 분리 진행 상황 ===

현재 완료:
✓ Step 1: CSS 분리
✓ Step 2: 데이터 분리

다음 단계:
→ Step 3: 엔티티 클래스 분리

세부 작업:
1. js/entities/effect.js 생성
2. js/entities/projectile.js 생성
3. js/entities/monster.js 생성
4. game.html에서 클래스 추출
5. import/export 연결

예상 소요 시간: 15~20분
난이도: ★★★☆☆

진행하시겠습니까? (y/n): y

[작업 진행...]

=== Step 3 완료 ===

생성된 파일:
✓ js/entities/effect.js (420 lines)
✓ js/entities/projectile.js (85 lines)
✓ js/entities/monster.js (240 lines)

변경된 파일:
✓ game.html (1770 → 1025 lines, -745 lines)

테스트 가이드:
1. 게임 실행 (/game-test)
2. 확인 사항:
   □ 몬스터 스폰 및 이동
   □ 투사체 발사 (궁수)
   □ 이펙트 렌더링
   □ 콘솔 에러 없음

다음 단계: /refactor-module (Step 4 진행)
커밋: /git-auto
```

### 예시 2: 특정 단계만 실행
```bash
/refactor-module --step=1
```

**결과:**
```
=== Step 1: CSS 분리 ===

작업 내용:
1. css/style.css 생성
2. <style> 태그 내용 이동 (250 lines)
3. <link> 태그 추가
4. 원본 <style> 제거

실행 중...
✓ css/ 디렉토리 생성
✓ css/style.css 작성 완료
✓ game.html에 <link> 추가
✓ 원본 <style> 제거

테스트:
브라우저에서 game.html 열기...
✓ UI 스타일 정상
✓ 애니메이션 작동
✓ 레이아웃 유지

=== Step 1 완료 ===
game.html: 1770 → 1520 lines (-250)
```

### 예시 3: 진행 상황만 확인
```bash
/refactor-module --status
```

**결과:**
```
=== Phase 5 파일 분리 진행 상황 ===

Step 1: CSS 분리                [✓ 완료]
  - css/style.css (250 lines)

Step 2: 데이터 분리              [✓ 완료]
  - js/data/jobs.js (180 lines)

Step 3: 엔티티 클래스 분리        [진행 중]
  - js/entities/effect.js
  - js/entities/projectile.js
  - js/entities/monster.js

Step 4: 시스템 함수 분리          [대기]
Step 5: UI 함수 분리             [대기]
Step 6: 상태 및 메인 진입점       [대기]

전체 진행도: ██████░░░░░░░░░░ 30%

다음 명령어:
/refactor-module          # 다음 단계 진행
/game-test               # 현재 상태 테스트
```

## 주의사항

1. **순서 엄수**
   - 반드시 Step 1 → 2 → 3 → 4 → 5 → 6 순서로 진행
   - 단계 건너뛰기 시 의존성 문제 발생

2. **각 단계마다 테스트**
   - 분리 후 즉시 게임 실행 테스트
   - 에러 발생 시 다음 단계로 넘어가지 말 것
   - 콘솔 에러 확인 필수

3. **import/export 경로**
   - 상대 경로 정확히 계산
   - 순환 의존성 주의
   - state.js를 공통 소스로 활용

4. **Git 커밋 전략**
   - 각 단계마다 개별 커밋 권장
   - 커밋 메시지: `refactor: Step X - [설명]`
   - 문제 시 롤백 용이

5. **성능 영향**
   - ESM import는 초기 로딩이 약간 느림 (무시 가능)
   - 런타임 성능은 동일
   - 브라우저 캐싱으로 이후 빠름

## ESM 모듈 패턴

### export 패턴

```javascript
// 단일 export
export class Monster { ... }

// 다중 export
export function basicAttack() { ... }
export function useSkill() { ... }

// default export (권장 안함)
export default class Effect { ... }
```

### import 패턴

```javascript
// named import (권장)
import { game, player } from './state.js';
import { Monster } from './entities/monster.js';

// 전체 import
import * as Combat from './systems/combat.js';

// default import
import Effect from './entities/effect.js';
```

### 공유 상태 패턴

```javascript
// state.js
export let game = {
  platforms: [],
  monsters: [],
  // ...
};

export let player = {
  x: 400,
  y: 300,
  // ...
};

// 다른 모듈에서
import { game, player } from './state.js';

// 읽기/쓰기 가능
player.x = 500;
game.monsters.push(new Monster());
```

## 트러블슈팅

### import 경로 에러
```
Error: Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of "text/html"

해결:
1. 파일 경로 확인 (상대 경로 정확한가?)
2. 파일 확장자 .js 명시
3. <script type="module"> 확인
```

### 순환 의존성
```
ReferenceError: Cannot access 'X' before initialization

해결:
1. state.js에 공유 상태 통합
2. 함수 호출 순서 확인
3. import 순서 조정
```

### 브라우저 호환성
```
IE11은 ESM 미지원

해결:
- 모던 브라우저 사용 (Chrome, Firefox, Edge, Safari)
- 또는 Babel + Webpack 빌드 (불필요, 프로젝트 목표와 맞지 않음)
```

### CORS 에러 (파일:// 프로토콜)
```
Access to script at 'file:///.../main.js' from origin 'null' has been blocked by CORS policy

해결:
1. 로컬 서버 실행:
   python -m http.server 8000

2. 브라우저에서 http://localhost:8000/game.html 접속

또는:

3. VS Code Live Server 확장 사용
```

## 관련 명령어

- `/game-test` - 분리 후 테스트
- `/git-auto` - 각 단계 커밋
- `/refactor` - 코드 품질 개선 (분리 완료 후)

## 체크리스트

### 각 단계 완료 후 확인

- [ ] 새 파일 생성 확인
- [ ] export 구문 추가 확인
- [ ] import 구문 추가 확인
- [ ] 원본 파일 정리 확인
- [ ] 게임 실행 테스트
- [ ] 콘솔 에러 없음
- [ ] Git 커밋
- [ ] plan.md 체크리스트 업데이트
