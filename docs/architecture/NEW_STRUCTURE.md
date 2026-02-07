# 🏗️ 새로운 파일 구조 - 도메인 기반 아키텍처

**업데이트:** 2026-02-07
**원칙:** SRP, 도메인 기준, 단방향 의존성, 관심사 분리

---

## 📁 최종 디렉토리 구조

```
game/
├── src/                           # 소스 코드
│   ├── core/                      # 🎯 핵심 게임 로직 (도메인 중립)
│   │   └── game/
│   │       ├── GameState.js       # 전역 상태 (game, player, canvas, ctx)
│   │       └── GameLoop.js        # 메인 게임 루프 (requestAnimationFrame)
│   │
│   ├── features/                  # 🎮 도메인별 기능 모듈
│   │   ├── combat/                # ⚔️ 전투 도메인
│   │   │   └── CombatSystem.js    # 공격, 스킬, 데미지 계산
│   │   │
│   │   ├── monster/               # 👾 몬스터 도메인
│   │   │   ├── Monster.js         # 몬스터 엔티티 (AI, 체력, 이동)
│   │   │   └── MonsterSpawner.js  # 몬스터 스폰 로직
│   │   │
│   │   ├── progression/           # 📈 성장 도메인
│   │   │   └── LevelingSystem.js  # 경험치, 레벨업, 스탯 증가
│   │   │
│   │   ├── physics/               # ⚙️ 물리 도메인
│   │   │   └── MovementSystem.js  # 이동, 점프, 충돌 감지
│   │   │
│   │   └── visual/                # ✨ 시각 효과 도메인
│   │       ├── Effect.js          # 스킬 이펙트, 파티클
│   │       ├── Projectile.js      # 투사체 (화살 등)
│   │       └── Coin.js            # 코인 (보상)
│   │
│   ├── infrastructure/            # 🔌 인프라 계층 (외부 시스템 연동)
│   │   ├── input/
│   │   │   └── InputHandler.js    # 키보드 입력 처리
│   │   │
│   │   └── rendering/
│   │       ├── BackgroundRenderer.js # 배경 렌더링
│   │       ├── PlayerRenderer.js     # 플레이어 렌더링
│   │       └── MinimapRenderer.js    # 미니맵 렌더링
│   │
│   ├── ui/                        # 🖼️ 표현 계층 (사용자 인터페이스)
│   │   ├── screens/
│   │   │   └── JobSelectScreen.js # 직업 선택 화면
│   │   │
│   │   └── components/
│   │       ├── HUD.js             # HP/MP/EXP 바, 스탯 표시
│   │       └── SkillBar.js        # 스킬 슬롯, 쿨다운 UI
│   │
│   └── main.js                    # 🚀 진입점 (엔트리 포인트)
│
├── data/                          # 📊 게임 데이터 (정적)
│   └── jobs.js                    # 직업 정의 (전사, 도적, 궁수)
│
├── docs/                          # 📚 프로젝트 문서
│   ├── architecture/
│   │   ├── NEW_STRUCTURE.md       # 이 파일
│   │   └── MODULAR_STRUCTURE.md   # 모듈 구조 설명
│   │
│   ├── guides/
│   │   ├── QUICK_TEST_GUIDE.md           # 빠른 테스트 가이드
│   │   └── INTEGRATION_TEST_SUMMARY.md   # 통합 테스트 요약
│   │
│   ├── CLAUDE.md                  # Claude Code 가이드
│   └── README.md                  # 프로젝트 README
│
├── test/                          # 🧪 테스트
│   ├── integration/               # 통합 테스트
│   │   ├── integration-test.js    # 자동화 테스트 스위트
│   │   └── test-harness.html      # 시각적 테스트 UI
│   │
│   ├── unit/                      # 단위 테스트 (향후)
│   │
│   └── docs/
│       ├── README.md              # 테스트 문서
│       └── BUG_FIXES_REPORT.md    # 버그 수정 보고서
│
├── public/                        # 🌐 배포용 정적 파일
│   ├── index.html                 # 메인 HTML
│   └── css/
│       └── style.css              # 스타일시트
│
├── scripts/                       # 🛠️ 개발 스크립트
│   └── server.bat                 # HTTP 서버 시작
│
├── .claude/                       # Claude Code 설정
│   ├── docs/
│   └── skills/
│
└── RESTRUCTURE_PLAN.md            # 재구성 계획 문서
```

---

## 🎯 설계 원칙 적용

### 1. SRP (Single Responsibility Principle) - 같이 바뀌는 것끼리
- ✅ **Combat 도메인**: 공격, 스킬, 데미지 계산이 함께
- ✅ **Monster 도메인**: Monster 엔티티 + 스폰 로직
- ✅ **UI 계층**: 화면과 컴포넌트 분리

### 2. Domain 기준 구조화
- ✅ `features/` 디렉토리에 도메인별 모듈 구성
- ✅ 각 도메인은 독립적으로 이해 가능
- ✅ 도메인 경계가 명확함

### 3. 의존 방향 단방향
```
main.js
  ↓
ui/ (표현)
  ↓
infrastructure/ (인프라)
  ↓
features/ (도메인 기능)
  ↓
core/ (핵심 상태)
  ↓
data/ (정적 데이터)
```
- ✅ 하위 계층이 상위 계층을 import하지 않음
- ✅ 순환 참조 방지

### 4. Common 최소화
- ✅ 공통 유틸리티 없음 (필요시 `src/shared/` 추가 예정)
- ✅ 각 도메인이 자급자족

### 5. 외부 연동은 Infra로 격리
- ✅ `infrastructure/input/` - 키보드 입력
- ✅ `infrastructure/rendering/` - Canvas 렌더링
- ✅ DOM 조작은 UI 계층에서만

### 6. 네이밍 통일
- ✅ 파일명: PascalCase (GameState.js, Monster.js)
- ✅ 디렉토리: kebab-case 또는 단수형 (combat, monster)
- ✅ 시스템: ~System 접미사 (CombatSystem, LevelingSystem)

### 7. 도메인 경계는 이벤트/인터페이스
- ✅ 도메인 간 직접 참조 최소화
- ✅ GameState를 통한 상태 공유
- 🔄 향후: 이벤트 버스 도입 예정

### 8. 테스트 구조 미러링
```
test/
├── integration/      # src/ 전체 통합 테스트
└── unit/            # (향후) src/ 구조 미러링
    ├── core/
    ├── features/
    └── ...
```

### 9. 실험/스크립트 격리
- ✅ `scripts/` - 개발용 스크립트
- ✅ `.claude/` - Claude Code 설정
- ✅ 프로덕션 코드와 분리

### 10. 배포 단위 고려
- ✅ `public/` - 배포 시 필요한 파일만
- ✅ `src/` - 번들링 대상 (향후 Vite/Webpack 도입 시)
- ✅ `docs/`, `test/` - 배포 제외

---

## 🔄 하위 호환성 (Backward Compatibility)

기존 import 경로를 유지하기 위해 **배럴 파일(Barrel Files)** 사용:

```javascript
// src/state.js - 배럴 파일
export * from './core/game/GameState.js';
```

### 배럴 파일 목록
```
src/state.js                  → src/core/game/GameState.js
src/systems/gameloop.js       → src/core/game/GameLoop.js
src/systems/combat.js         → src/features/combat/CombatSystem.js
src/entities/monster.js       → src/features/monster/Monster.js
src/systems/spawning.js       → src/features/monster/MonsterSpawner.js
src/systems/leveling.js       → src/features/progression/LevelingSystem.js
src/systems/movement.js       → src/features/physics/MovementSystem.js
src/entities/effect.js        → src/features/visual/Effect.js
src/entities/projectile.js    → src/features/visual/Projectile.js
src/entities/coin.js          → src/features/visual/Coin.js
src/systems/input.js          → src/infrastructure/input/InputHandler.js
src/rendering/background.js   → src/infrastructure/rendering/BackgroundRenderer.js
src/rendering/player.js       → src/infrastructure/rendering/PlayerRenderer.js
src/rendering/minimap.js      → src/infrastructure/rendering/MinimapRenderer.js
src/ui/jobselect.js           → src/ui/screens/JobSelectScreen.js
src/ui/hud.js                 → src/ui/components/HUD.js
src/ui/skillbar.js            → src/ui/components/SkillBar.js
```

**장점:**
- ✅ 기존 코드 수정 없이 즉시 작동
- ✅ 점진적 마이그레이션 가능
- ✅ 테스트 깨지지 않음

---

## 📊 계층별 책임

### Core (핵심)
- **책임**: 게임의 기본 상태와 루프
- **의존성**: 없음 (최하위)
- **변경 빈도**: 낮음

### Features (기능)
- **책임**: 도메인별 비즈니스 로직
- **의존성**: Core, Data
- **변경 빈도**: 중간

### Infrastructure (인프라)
- **책임**: 외부 시스템 연동
- **의존성**: Core, Features
- **변경 빈도**: 낮음

### UI (표현)
- **책임**: 사용자 인터페이스
- **의존성**: 모든 하위 계층
- **변경 빈도**: 높음

---

## 🚀 다음 단계

### 단기 (Phase 2)
1. ✅ 배럴 파일 유지하면서 점진적 마이그레이션
2. 🔄 각 도메인에 README 추가
3. 🔄 단위 테스트 작성 (test/unit/)

### 중기 (Phase 3)
1. 🔄 이벤트 버스 도입 (도메인 간 통신)
2. 🔄 공통 유틸리티 분리 (src/shared/)
3. 🔄 번들러 도입 (Vite)

### 장기 (Phase 4+)
1. 🔄 TypeScript 전환
2. 🔄 의존성 주입 (DI) 도입
3. 🔄 마이크로 프론트엔드 고려

---

## 📝 마이그레이션 가이드

### 새 코드 작성 시
```javascript
// ✅ 권장: 새 경로 직접 사용
import { game } from './core/game/GameState.js';
import { Monster } from './features/monster/Monster.js';

// ⚠️ 가능: 배럴 사용 (하지만 점진적으로 제거 예정)
import { game } from './state.js';
import { Monster } from './entities/monster.js';
```

### 기존 코드 수정 시
- 배럴을 통한 import는 그대로 유지 (동작 보장)
- 새 기능 추가 시 새 경로 사용
- 리팩터링 시 점진적으로 새 경로로 전환

---

**작성일:** 2026-02-07
**상태:** ✅ 완료 및 동작 확인
**다음 작업:** Phase 2 전직 시스템 개발
