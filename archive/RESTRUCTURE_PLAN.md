# 📁 파일 구조 재구성 계획

## 현재 구조 → 새 구조 매핑

### Core (핵심 게임 로직)
```
src/state.js                      → src/core/game/GameState.js
src/systems/gameloop.js           → src/core/game/GameLoop.js
```

### Features (도메인별 기능)

#### Combat (전투 도메인)
```
src/systems/combat.js             → src/features/combat/CombatSystem.js
```

#### Monster (몬스터 도메인)
```
src/entities/monster.js           → src/features/monster/Monster.js
src/systems/spawning.js           → src/features/monster/MonsterSpawner.js
```

#### Progression (성장 도메인)
```
src/systems/leveling.js           → src/features/progression/LevelingSystem.js
```

#### Physics (물리 도메인)
```
src/systems/movement.js           → src/features/physics/MovementSystem.js
```

#### Visual (시각 효과 도메인)
```
src/entities/effect.js            → src/features/visual/Effect.js
src/entities/projectile.js        → src/features/visual/Projectile.js
src/entities/coin.js              → src/features/visual/Coin.js
```

### Infrastructure (인프라 계층)

#### Input
```
src/systems/input.js              → src/infrastructure/input/InputHandler.js
```

#### Rendering
```
src/rendering/background.js       → src/infrastructure/rendering/BackgroundRenderer.js
src/rendering/player.js           → src/infrastructure/rendering/PlayerRenderer.js
src/rendering/minimap.js          → src/infrastructure/rendering/MinimapRenderer.js
```

### UI (표현 계층)

#### Screens
```
src/ui/jobselect.js               → src/ui/screens/JobSelectScreen.js
```

#### Components
```
src/ui/hud.js                     → src/ui/components/HUD.js
src/ui/skillbar.js                → src/ui/components/SkillBar.js
```

### Data
```
data/jobs.js                      → data/jobs/JobDefinitions.js
```

---

## 문서 재구성

### Docs 통합
```
CLAUDE.md                         → docs/CLAUDE.md
QUICK_TEST_GUIDE.md               → docs/guides/QUICK_TEST_GUIDE.md
INTEGRATION_TEST_SUMMARY.md      → docs/guides/INTEGRATION_TEST_SUMMARY.md
MODULAR_STRUCTURE.md              → docs/architecture/MODULAR_STRUCTURE.md
README.md                         → docs/README.md
```

### Test 정리
```
test/integration-test.js          → test/integration/integration-test.js
test/test-harness.html            → test/integration/test-harness.html
test/README.md                    → test/docs/README.md
test/BUG_FIXES_REPORT.md          → test/docs/BUG_FIXES_REPORT.md
```

### Public 분리
```
index.html                        → public/index.html
css/                              → public/css/
(게임 assets은 향후 추가)
```

### Scripts
```
server.bat                        → scripts/server.bat
```

---

## Import 경로 업데이트 필요

모든 파일에서 import 경로를 업데이트해야 함:

### 예시
```javascript
// Before
import { game, player } from './state.js';
import { Monster } from './entities/monster.js';

// After
import { game, player } from '../../core/game/GameState.js';
import { Monster } from '../../features/monster/Monster.js';
```

---

## 새 디렉토리 구조 (최종)

```
game/
├── src/
│   ├── core/
│   │   ├── game/
│   │   │   ├── GameState.js
│   │   │   └── GameLoop.js
│   │   └── player/
│   │       └── PlayerState.js (향후)
│   ├── features/
│   │   ├── combat/
│   │   │   └── CombatSystem.js
│   │   ├── monster/
│   │   │   ├── Monster.js
│   │   │   └── MonsterSpawner.js
│   │   ├── progression/
│   │   │   └── LevelingSystem.js
│   │   ├── physics/
│   │   │   └── MovementSystem.js
│   │   └── visual/
│   │       ├── Effect.js
│   │       ├── Projectile.js
│   │       └── Coin.js
│   ├── infrastructure/
│   │   ├── input/
│   │   │   └── InputHandler.js
│   │   └── rendering/
│   │       ├── BackgroundRenderer.js
│   │       ├── PlayerRenderer.js
│   │       └── MinimapRenderer.js
│   ├── ui/
│   │   ├── screens/
│   │   │   └── JobSelectScreen.js
│   │   └── components/
│   │       ├── HUD.js
│   │       └── SkillBar.js
│   └── main.js
├── data/
│   └── jobs/
│       └── JobDefinitions.js
├── docs/
│   ├── architecture/
│   │   └── MODULAR_STRUCTURE.md
│   ├── guides/
│   │   ├── QUICK_TEST_GUIDE.md
│   │   └── INTEGRATION_TEST_SUMMARY.md
│   ├── CLAUDE.md
│   └── README.md
├── test/
│   ├── integration/
│   │   ├── integration-test.js
│   │   └── test-harness.html
│   ├── unit/ (향후)
│   └── docs/
│       ├── README.md
│       └── BUG_FIXES_REPORT.md
├── public/
│   ├── index.html
│   └── css/
│       └── style.css
├── scripts/
│   └── server.bat
├── .claude/
│   ├── docs/
│   └── skills/
└── game.html (구버전 - 삭제 예정)
```

---

## 실행 계획

1. ✅ 새 디렉토리 구조 생성
2. 🔄 파일 이동 (복사 후 검증)
3. 🔄 Import 경로 일괄 업데이트
4. 🔄 main.js 업데이트
5. 🔄 테스트 실행 및 검증
6. 🔄 구버전 파일 삭제
7. ✅ 문서 업데이트

---

## 의존성 원칙 검증

### 계층 구조 (상위 → 하위)
```
main.js
  ↓
ui/ (화면, 컴포넌트)
  ↓
infrastructure/ (입력, 렌더링)
  ↓
features/ (도메인 기능)
  ↓
core/ (핵심 상태)
  ↓
data/ (정적 데이터)
```

### 규칙
- 하위 계층은 상위 계층을 import하지 않음
- 같은 계층 내에서는 상호 참조 가능 (단, 순환 참조 금지)
- 도메인 간 통신은 이벤트/인터페이스를 통해
