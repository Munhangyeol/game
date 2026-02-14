# MapleQuest RPG — UI/UX & Phaser.js 마이그레이션 계획

## 현재 UI 상태 (Phase 3 완료 시점)

### 구현된 UI 요소
- ✅ HUD: HP/MP/EXP 바, 레벨, 직업명, 공격력, 크리티컬, 처치수
- ✅ 스킬바: 원형 쿨다운 진행바, 키 표시, 슬롯 애니메이션
- ✅ 버프바: 버프 아이콘, 남은 시간 표시, 경고 색상
- ✅ 직업 선택: 3직업 카드, 스탯/스킬 정보
- ✅ 레벨업/전직: 팝업 UI, 스탯 증가 표시
- ✅ 대미지 텍스트: 외곽선, 색상 구분, 분산 배치
- ✅ 전투 피드백: 콤보 시스템, EXP 획득 팝업, 메소 드랍
- ✅ 타격감: 화면 흔들림, 히트스톱, 크리티컬 이펙트
- ✅ 미니맵: 플랫폼, 플레이어, 몬스터 표시

### 부족한 UI 요소
- ❌ 스킬 툴팁 (설명, 데미지, 쿨타임)
- ❌ 캐릭터 스탯 창
- ❌ 게임오버/재시작 화면
- ❌ 일시정지 메뉴
- ❌ 퀘스트 시스템
- ❌ 채팅/로그 시스템
- ❌ 상점 UI
- ❌ 업적/도전과제

---

## Phase 2.5 — 핵심 UI 보완 (Phaser 마이그레이션 전)

### 목표
Phaser 마이그레이션 전에도 완성도 높은 게임으로 만들기. 바닐라 Canvas로 구현 가능한 핵심 UI 요소 추가.

### A. 스킬 툴팁 시스템 ⭐⭐⭐

**구현 내용**
- 스킬 슬롯 호버 시 툴팁 표시
- 표시 정보: 스킬명, 데미지, 쿨타임, MP 소모량, 추가 효과

**UI 디자인**
```
┌─────────────────────┐
│ 💥 파워 스트라이크  │
│ ─────────────────── │
│ 데미지: 공격력×2.5  │
│ 쿨타임: 5초         │
│ MP: 15              │
│ ─────────────────── │
│ 강력한 일격으로     │
│ 적을 3칸 밀쳐냅니다 │
└─────────────────────┘
```

**구현 파일**
- `src/ui/components/SkillBar.js`: 툴팁 표시 로직
- `public/css/style.css`: 툴팁 스타일
- `public/index.html`: 툴팁 컨테이너

**임팩트**: ⭐⭐⭐ (초보 플레이어 이해도 향상, 전문적인 UI)

---

### B. 캐릭터 스탯 창 (C키) ⭐⭐⭐

**구현 내용**
- C키 또는 좌상단 버튼 클릭 시 스탯 창 표시
- 표시 정보: 기본 스탯, 플레이 통계

**UI 디자인**
```
┌─ ⚔️ 전사 Lv.15 ──────┐
│ ═══ 기본 스탯 ═══    │
│ HP: 450/450          │
│ MP: 75/75            │
│ 공격력: 95           │
│ 크리티컬: 17.5%      │
│ 이동속도: 5          │
│ ═══ 플레이 통계 ═══  │
│ 💀 처치: 127         │
│ 💰 메소: 1,250       │
│ ⏱️ 플레이: 15m 23s   │
│                      │
│      [닫기 (C)]      │
└──────────────────────┘
```

**구현 파일**
- `src/ui/screens/StatScreen.js`: 새 파일 생성
- `src/infrastructure/input/InputHandler.js`: C키 바인딩
- `public/css/style.css`: 스탯 창 스타일

**임팩트**: ⭐⭐⭐ (플레이어 성장 시각화, 몰입도 향상)

---

### C. 게임오버/재시작 화면 ⭐⭐⭐

**구현 내용**
- HP 0 시 게임오버 화면 표시
- 플레이 통계 표시
- 재시작 및 직업 변경 옵션

**UI 디자인**
```
┌─────────────────────┐
│    💀 GAME OVER     │
│                     │
│  도달 레벨: 25      │
│  처치한 몬스터: 245 │
│  획득 메소: 3,450   │
│  플레이 시간: 42m   │
│                     │
│   [재시작 (R)]      │
│   [직업 변경 (J)]   │
└─────────────────────┘
```

**구현 파일**
- `src/ui/screens/GameOverScreen.js`: 새 파일 생성
- `src/core/game/GameLoop.js`: HP 0 체크 및 화면 전환
- `public/css/style.css`: 게임오버 화면 스타일

**임팩트**: ⭐⭐⭐ (필수 기능, 플레이어 경험 완성도)

---

### D. 일시정지 메뉴 (ESC/P키) ⭐⭐

**구현 내용**
- ESC 또는 P키로 일시정지
- 게임 루프 멈춤, 반투명 오버레이

**UI 디자인**
```
┌─────────────────────┐
│    ⏸️ 일시정지      │
│                     │
│   [계속하기 (P)]    │
│   [설정 (O)]        │
│   [메인으로 (M)]    │
└─────────────────────┘
```

**구현 파일**
- `src/ui/screens/PauseScreen.js`: 새 파일 생성
- `src/infrastructure/input/InputHandler.js`: ESC/P키 바인딩
- `src/core/game/GameLoop.js`: 일시정지 상태 관리

**임팩트**: ⭐⭐ (기본 UX 개선)

---

### E. 대미지 넘버 강화 ⭐⭐

**구현 내용**
- 크리티컬: "CRITICAL!" 텍스트 추가
- 고콤보: 50+ 콤보 시 "EXCELLENT!" 표시
- Miss: 회피 시 "MISS" 표시

**구현 파일**
- `src/features/combat/CombatSystem.js`: 대미지 텍스트 로직 강화
- `src/features/visual/Effect.js`: 텍스트 스타일 추가

**임팩트**: ⭐⭐ (타격감 강화, 시각적 피드백)

---

### F. 간단한 퀘스트 시스템 ⭐⭐⭐

**구현 내용**
- 우상단에 진행 중 퀘스트 표시
- 퀘스트 완료 시 보상 지급 및 알림

**UI 디자인**
```
┌─ 📜 진행 중 퀘스트 ───┐
│ 슬라임 사냥꾼        │
│ 슬라임 처치          │
│ 진행: 15/50 ▓░░░░░  │
│ 보상: EXP +500       │
│      메소 +1,000     │
└──────────────────────┘
```

**퀘스트 예시**
1. 슬라임 사냥꾼 (슬라임 50마리)
2. 초보 모험가 (레벨 10 달성)
3. 크리티컬 마스터 (크리티컬 100회)
4. 전직의 길 (첫 전직 완료)

**구현 파일**
- `src/features/quest/QuestSystem.js`: 새 파일 생성
- `data/quests.js`: 퀘스트 데이터
- `src/ui/components/QuestTracker.js`: UI 컴포넌트

**임팩트**: ⭐⭐⭐ (게임 목표 제시, 리텐션 향상)

---

### G. 채팅/로그 시스템 ⭐⭐

**구현 내용**
- 좌하단 반투명 로그창
- 최근 5개 메시지 표시, 3초 후 페이드아웃

**UI 디자인**
```
[15:23] 슬라임을 처치했습니다! (+25 EXP)
[15:24] 레벨 업! Lv.10 달성
[15:24] 기사로 전직했습니다!
[15:25] 퀘스트 완료: 슬라임 사냥꾼
```

**구현 파일**
- `src/ui/components/ChatLog.js`: 새 파일 생성
- `src/core/game/GameState.js`: 로그 메시지 배열 추가
- `public/css/style.css`: 로그창 스타일

**임팩트**: ⭐⭐ (정보 전달, 몰입감)

---

### H. 간단한 상점 UI ⭐⭐

**구현 내용**
- S키 또는 버튼 클릭 시 상점 표시
- HP/MP 포션 구매

**UI 디자인**
```
┌─ 🏪 상점 ─────────┐
│ 🧪 HP 포션        │
│    HP 50% 회복    │
│    💰 50메소      │
│    [구매 (1)]     │
├───────────────────┤
│ 💙 MP 포션        │
│    MP 50% 회복    │
│    💰 30메소      │
│    [구매 (2)]     │
└───────────────────┘
```

**구현 파일**
- `src/ui/screens/ShopScreen.js`: 새 파일 생성
- `data/items.js`: 아이템 데이터
- `src/infrastructure/input/InputHandler.js`: S키 바인딩

**임팩트**: ⭐⭐ (메소 활용처, 전략성 추가)

---

### I. 업적/도전과제 ⭐

**구현 내용**
- 특정 조건 달성 시 업적 해금
- 우상단에 알림 표시

**UI 디자인**
```
┌─ 🏆 업적 ──────────┐
│ ☑ 첫 몬스터 처치   │
│ ☑ 레벨 10 달성     │
│ ☐ 크리 100회       │
│    (73/100)        │
│ ☐ 전직 달성        │
└────────────────────┘
```

**구현 파일**
- `src/features/achievement/AchievementSystem.js`: 새 파일 생성
- `data/achievements.js`: 업적 데이터
- `src/ui/components/AchievementNotification.js`: 알림 UI

**임팩트**: ⭐ (수집 요소, 재미 요소)

---

### Phase 2.5 구현 우선순위

**1주차 (필수)**
- [x] 스킬 툴팁
- [x] 캐릭터 스탯 창
- [x] 게임오버 화면

**2주차 (권장)**
- [ ] 일시정지 메뉴
- [ ] 대미지 넘버 강화
- [ ] 퀘스트 시스템 (기본)

**3주차 (선택)**
- [ ] 채팅/로그
- [ ] 상점 UI
- [ ] 업적 시스템

---

## Phase 6 - Phaser.js 마이그레이션

### 배경

현재 바닐라 Canvas 2D 구조는 기능 확장과 성능 최적화에 한계가 있습니다. 메이플스토리 수준의 퀄리티를 위해서는 전문 게임 엔진이 필요합니다.

### Phaser.js 선택 이유

**성능**
- 렌더링: Canvas 2D → WebGL (3-5배 향상)
- FPS: 안정적 60fps 보장 (현재: 간헐적 드롭)
- 메모리: GC 부담 70% 감소 (Object Pooling)

**개발 경험**
- HMR: 코드 수정 즉시 반영 (현재: 수동 새로고침)
- 타입 체크: 런타임 에러 사전 방지
- 디버깅: Phaser Debug 플러그인 활용

**확장성**
- 신규 기능: Scene 단위 추가 (JobSelectScene, GameOverScene, ...)
- 플러그인: Phaser 커뮤니티 플러그인 활용 (Particle, UI, ...)
- 멀티플레이: Socket.io + Phaser 통합 가능

---

## Phase 6+ — 장기 개선 (Phaser 마이그레이션 후)

### 단기 (1-2주) - 기능 완성

**목표**: Phase 4-5 완료 (재변직·최종변직, 신규 몬스터)

1. **전직 시스템 완성** (기존 plan.md Phase 4)
   - 재변직 (Lv.30): 다크나이트, 어쌔신, 레인저
   - 최종변직 (Lv.70): 히어로, 나이트로드, 보우마스터
   - 각 단계별 스킬 및 이펙트

2. **신규 몬스터 타입** (기존 plan.md Phase 5)
   - 불타는 버그 (Lv.15+): 불 피해
   - 바위 고래 (Lv.35+): 탱커형
   - 고대 드래곤 (Lv.60+): 보스형

3. **사운드 시스템**
   - BGM: 메인, 전투, 보스전
   - 효과음: 공격, 스킬, 레벨업, 전직
   - 음원: Freesound.org, OpenGameArt.org

---

### 중기 (1개월) - 월드 확장

**목표**: 단일 맵 → 다중 맵, 아이템/장비 시스템

1. **맵 시스템**
   - Tiled 맵 에디터 연동
   - 3-5개 지역 (초보자 마을, 숲, 던전, ...)
   - 지역별 몬스터 레벨 차등
   - 포탈 시스템

2. **인벤토리 시스템** ⭐⭐⭐
   - I키로 인벤토리 열기
   - 슬롯 기반 (20-30칸)
   - 아이템 사용/버리기
   - 무게 제한 (선택)

3. **아이템/장비 시스템** ⭐⭐⭐
   - 장비 슬롯: 무기, 방어구, 악세서리
   - 장비 스탯 (공격력+, HP+, 크리티컬+)
   - 드랍 시스템 (몬스터별 드랍 테이블)
   - 장비 등급: 일반, 레어, 에픽

4. **NPC 시스템**
   - 대화창
   - 퀘스트 제공 NPC
   - 상점 NPC

---

### 장기 (3개월+) - 소셜/온라인 기능

**목표**: 싱글플레이 → 멀티플레이, 경쟁 요소

1. **멀티플레이** ⭐⭐⭐
   - Socket.io 연동
   - 실시간 협동 플레이 (2-4인)
   - 파티 시스템: HP 공유, 경험치 분배
   - 채팅 시스템

2. **랭킹 시스템** ⭐⭐
   - 백엔드 (Node.js + MongoDB/PostgreSQL)
   - 레벨 랭킹, 처치수 랭킹
   - 주간/월간 리더보드
   - 랭킹 보상

3. **모바일 대응** ⭐⭐
   - 터치 입력
   - 가상 조이스틱
   - 반응형 UI
   - 세로/가로 모드

4. **길드 시스템** ⭐
   - 길드 생성/가입
   - 길드 퀘스트
   - 길드 랭킹

5. **PvP 시스템** ⭐
   - 1:1 대전
   - 아레나 모드
   - 랭킹 포인트

---

## 참고 자료

### Phaser 공식

- 공식 문서: https://phaser.io/docs
- 튜토리얼: https://phaser.io/tutorials/making-your-first-phaser-3-game
- 예제: https://phaser.io/examples

### 메이플스토리 스타일 레퍼런스

- MapleStory Worlds (공식 에디터)
- Itch.io 2D 횡스크롤 게임
- GitHub Phaser 예제 (platformer, rpg)

### 에셋 리소스

- 스프라이트: OpenGameArt.org, Itch.io
- 사운드: Freesound.org, OpenGameArt.org
- 폰트: Google Fonts (Nanum Gothic)

---

## Critical Files Summary

### 기존 파일 (Phase 1-3 완료)

| Phase | 파일 | 용도 |
|-------|------|------|
| Phase 1 | src/core/game/GameState.js | 상태 구조 참조 |
| Phase 1 | src/core/game/GameLoop.js | 업데이트 로직 |
| Phase 1 | data/jobs.js | 직업 데이터 |
| Phase 2 | src/features/physics/MovementSystem.js | 이동 로직 |
| Phase 2 | src/features/combat/CombatSystem.js | 전투 로직 |
| Phase 2 | src/features/monster/Monster.js | AI 로직 |
| Phase 3 | src/ui/components/HUD.js | 레이아웃 |
| Phase 3 | src/ui/components/SkillBar.js | 쿨다운 시각화 |
| Phase 3 | src/features/visual/Effect.js | 이펙트 로직 |

### 추가 파일 (Phase 2.5)

| 기능 | 파일 | 설명 |
|------|------|------|
| 스킬 툴팁 | src/ui/components/SkillTooltip.js | 스킬 설명 표시 |
| 스탯 창 | src/ui/screens/StatScreen.js | 캐릭터 스탯 화면 |
| 게임오버 | src/ui/screens/GameOverScreen.js | 게임오버 화면 |
| 일시정지 | src/ui/screens/PauseScreen.js | 일시정지 메뉴 |
| 퀘스트 | src/features/quest/QuestSystem.js | 퀘스트 로직 |
| 퀘스트 | data/quests.js | 퀘스트 데이터 |
| 채팅/로그 | src/ui/components/ChatLog.js | 로그 시스템 |
| 상점 | src/ui/screens/ShopScreen.js | 상점 UI |
| 상점 | data/items.js | 아이템 데이터 |
| 업적 | src/features/achievement/AchievementSystem.js | 업적 로직 |
| 업적 | data/achievements.js | 업적 데이터 |

---

## 전체 로드맵 요약

```
현재 상태: Phase 3 완료 ✅
           (전직 시스템, 메이플스타일 UI/UX)

↓

Phase 2.5: 핵심 UI 보완 (1-3주)
           - 스킬 툴팁
           - 스탯 창
           - 게임오버 화면
           - 퀘스트 시스템
           - 상점 UI

↓

Phase 4-5: 전직 완성 + 몬스터 추가 (2-3주)
           (기존 plan.md 참조)

↓

Phase 6: Phaser.js 마이그레이션 (4-6주)
         - 성능 3-5배 향상
         - WebGL 렌더링
         - Scene 기반 구조

↓

Phase 6+: 장기 확장 (3개월+)
          - 맵 시스템
          - 인벤토리/장비
          - 멀티플레이
          - 랭킹/길드/PvP
```

---

## 다음 액션

### 즉시 시작 가능 (Phase 2.5-A)
1. **스킬 툴팁 구현**
   - 예상 시간: 2-3시간
   - 파일: `src/ui/components/SkillTooltip.js`
   - 난이도: ⭐☆☆

2. **캐릭터 스탯 창 구현**
   - 예상 시간: 3-4시간
   - 파일: `src/ui/screens/StatScreen.js`
   - 난이도: ⭐⭐☆

3. **게임오버 화면 구현**
   - 예상 시간: 2-3시간
   - 파일: `src/ui/screens/GameOverScreen.js`
   - 난이도: ⭐☆☆

### 권장 진행 순서
1. Phase 2.5 (1-3주) → 바닐라 버전 완성도 향상
2. Phase 4-5 (2-3주) → 전직/몬스터 콘텐츠 완성
3. Phase 6 (4-6주) → Phaser 마이그레이션
4. Phase 6+ (3개월+) → 장기 확장

---

**Note**: Phase 2.5부터 시작하여 바닐라 Canvas 버전의 완성도를 높인 후, Phaser 마이그레이션을 진행하는 것을 권장합니다.

---

## Phase 7 — 캐릭터 퀄리티 향상 (에셋 없이 코드만)

### 목표
외부 에셋 없이 애니메이션 타이밍·물리·이펙트 코드만으로 캐릭터의 체감 퀄리티를 AAA급으로 끌어올린다.

---

### 1. 애니메이션 타이밍 개선 (Attack Windup / Hit / Recovery)

**현재 문제**
공격 애니메이션이 4프레임 고정 frameRate(16fps)로 균등 재생 → 타격감 없음.

**구현 내용**
- Attack 애니메이션을 3구간으로 분리
  - Windup (Frame 0-1): 30% 시간, 느리게 (frameRate ↓)
  - Hit (Frame 2): 10% 시간, 순간 (frameRate ↑↑)
  - Recovery (Frame 3): 60% 시간, 서서히 (frameRate ↓)
- HitStop: Hit frame 도달 시 `this.time.delayedCall(60, ...)` 로 60ms 프레임 고정
- 구현: `useSkill()`·`basicAttack()` 호출 시 `this.anims.msPerFrame` 동적 변경

**구현 파일**
- `src/phaser/scenes/GameScene.js`: `updatePlayerSprite()`, `basicAttack()`, `useSkill()`
- `src/phaser/scenes/BootScene.js`: `createSpriteTexturesAndAnims()` frameRate 세분화

**임팩트**: ⭐⭐⭐ (타격감 핵심, 가장 효과 큰 단일 변경)

---

### 2. Secondary Motion (망토·머리카락 후행 움직임)

**현재 문제**
망토·머리카락이 캐릭터 스프라이트 텍스처에 베이크되어 있어 독립 움직임 없음.

**구현 내용**
- `drawAll()` 내 drawLayer에 캐릭터 위치 기반 실시간 오버레이 추가
- 물리 변수: `capeAngle`, `hairAngle` — 이전 프레임 각도에서 목표값으로 선형 보간(lerp)
  - 이동 중: 반대 방향으로 최대 15° 기울기
  - 멈출 때: 0°로 서서히 복귀 (감쇠 계수 0.85)
  - 공격 시: 순간 20° 후방 스냅 → 복귀
- 망토: `g.fillTriangle()` 2~3개 삼각형 조합으로 물결 표현
- 머리카락: 2~3개 선분 각도 변환으로 흩날림 표현

**구현 파일**
- `src/phaser/scenes/GameScene.js`: `drawPlayerOverlays()` — capeAngle/hairAngle 계산 및 그리기

**임팩트**: ⭐⭐⭐ (정지 중에도 살아있는 느낌, 즉각적 퀄 상승)

---

### 3. Idle Animation 강화 (숨쉬기 + 장비 흔들림)

**현재 문제**
4프레임 1px 세로 bob만 있음 — 너무 단조로움.

**구현 내용**
- 숨쉬기: `sin(time * 0.0015) * 1.5` — 1.5px 스케일 기반 세로 움직임 (현재 1px보다 자연스러운 주기)
- 무기 미세 흔들림: 대기 중 무기에 `sin(time * 0.002) * 2°` 회전 추가
- 눈 깜빡임: 3~6초 간격으로 0.1초간 눈 가리기 (Graphics 오버레이로 눈 위치에 직사각형)
- 발 미세 무게이동: 좌우 발에 번갈아 0.5px 높이 차이

**구현 파일**
- `src/phaser/scenes/BootScene.js`: `drawJobFrame()` — idleBob 로직 확장
- `src/phaser/scenes/GameScene.js`: `drawPlayerOverlays()` — time 기반 무기 흔들림·눈 깜빡임

**임팩트**: ⭐⭐ (정지 시 생동감, 완성도 향상)

---

### 4. Hit Reaction 강화 (플레이어)

**현재 문제**
플레이어가 피격 시 알파 깜빡임만 있음 — 시각적 임팩트 없음.

**구현 내용**
- 피격 순간 즉각 White Flash: `playerSprite.setTint(0xffffff)` → 80ms 후 클리어
- 피격 방향 반대로 짧은 노크백: 피격 시 `ps.vx += direction * -300` (80ms 감쇠)
- 피격 Squash: `playerSprite.setScale(1.2, 0.8)` → 100ms 내 원복
- 화면 흔들림: 이미 존재(`cameras.main.shake(150, 0.012)`) — 유지
- 피격 파티클: 혈흔 대신 흰색/붉은색 광채 파티클 5개 방출 (기존 `addBurstParticles` 활용)

**구현 파일**
- `src/phaser/scenes/GameScene.js`: `takeDamage()` 또는 피격 처리 구간 (line ~677)

**임팩트**: ⭐⭐⭐ (피격 피드백 없으면 싸구려 — 필수 수정)

---

### 5. Camera Interaction 강화 (Zoom + Slow-Mo)

**현재 문제**
카메라 Shake만 있고 Zoom·Slow-Motion 없음.

**구현 내용**
- **스킬 시전 시 Punch-In Zoom**: `cameras.main.zoomTo(1.05, 80)` → `zoomTo(1.0, 200)`
  - 스킬 타입별 zoom 강도 차등 (일반 1.05, 궁극기 1.1)
- **히트스톱 연동 Slow-Mo**: 강공격 HitStop 구간에 `this.physics.world.timeScale = 0.3` 60ms 적용
- **레벨업/전직 시 Zoom Burst**: `zoomTo(1.15, 150)` → `zoomTo(1.0, 500)` 천천히 복귀
- **보스 처치 Slow-Mo**: 처치 판정 후 300ms간 timeScale 0.2 → 원복

**구현 파일**
- `src/phaser/scenes/GameScene.js`: `useSkill()`, `dealDamage()`, `checkLevelUp()`, `handlePromotion()`

**임팩트**: ⭐⭐⭐ (영화적 연출, 고퀄 RPG 필수 요소)

---

### 6. Lighting / Glow 강화 (무기·캐릭터 Rim Light)

**현재 문제**
Glow가 스킬 이펙트에만 있고, 기본공격 중 무기·캐릭터 자체 발광 없음.

**구현 내용**
- **무기 Glow (기본공격 직전 Windup)**: fxLayer (ADD 블렌드)에 무기 위치에 소형 glow 원 그리기
  - 전사 검: 주황색 `0xff8800` 반경 8px glow
  - 도적 단검: 보라색 `0xaa00ff` 반경 5px × 2
  - 궁수 화살: 노란색 `0xffff00` 화살 끝에 6px glow
- **캐릭터 Rim Light**: 피격 직후 혹은 버프 중 캐릭터 테두리 얇은 glow 오버레이
  - 래지(Rage): 붉은 테두리 `0xff2200` 펄스
  - 헤이스트(Haste): 보라 테두리 `0x9900ff` 펄스
  - 버프 없을 때: 기본 흰색 미세 glow (alpha 0.1~0.2 사인파)
- **레벨업 Burst**: 레벨업 시 캐릭터 주변에 방사형 흰색 glow 원 확장 (0 → 80px, alpha 1→0)

**구현 파일**
- `src/phaser/scenes/GameScene.js`: `drawPlayerOverlays()`, `basicAttack()`, `useSkill()`
- `src/phaser/scenes/BootScene.js`: fxLayer 관련 텍스처 없음, 순수 Graphics로 구현

**임팩트**: ⭐⭐ (존재감·시각적 완성도, 직업별 개성 강조)

---

### Phase 7 구현 우선순위

| 우선순위 | 항목 | 임팩트 | 난이도 |
|---------|------|--------|--------|
| 1 | 애니메이션 타이밍 (HitStop 포함) | ⭐⭐⭐ | ⭐⭐ |
| 2 | Hit Reaction 강화 (플레이어) | ⭐⭐⭐ | ⭐ |
| 3 | Camera Zoom + Slow-Mo | ⭐⭐⭐ | ⭐ |
| 4 | Secondary Motion | ⭐⭐⭐ | ⭐⭐ |
| 5 | Lighting / Glow 강화 | ⭐⭐ | ⭐⭐ |
| 6 | Idle Animation 강화 | ⭐⭐ | ⭐ |

### 핵심 구현 파일 요약

| 파일 | 수정 항목 |
|------|-----------|
| `src/phaser/scenes/GameScene.js` | 모든 항목 (타이밍·리액션·카메라·glow) |
| `src/phaser/scenes/BootScene.js` | 애니메이션 frameRate 세분화, drawJobFrame 확장 |

---

## Phase 8 — 배경 퀄리티 향상 (Parallax + Atmosphere + Color Grading)

### 현재 구현 상태

**이미 구현된 것**
- `ParallaxBackgroundSystem.js`: 4개 레이어 (sky / mountains / midObjects / frontGrass), 2개 테마
- `AmbienceFxSystem.js`: 안개(Fog ellipse), 빛줄기(Light Shaft triangle), 먼지(Dust ADD blend 파티클)

**부족한 것 (유저 요청 기반)**
- Near Objects 레이어 누락 (현재 4레이어 → 목표 5레이어)
- 구름 레이어 없음 (Micro Motion)
- Color Grading / Tone 통일 없음
- 나무 수관(canopy) 흔들림 없음 (잔디만 흔들림)
- Depth Blur 시뮬레이션 없음
- 테마 2개뿐 (dawn / cave 등 추가 필요)

---

### 1. 5레이어 Parallax — Near Objects 추가 ⭐⭐⭐

**현재**: sky / mountains / midObjects / frontGrass (4레이어)
**목표**: sky / farMountains / clouds / midObjects / nearObjects / foreground (6레이어)

**추가 레이어: nearObjects (depth -4, scrollRate 0.55)**
- 더 크고 대비 높은 나무 실루엣 (캐릭터 바로 뒤)
- 바위·덤불·버섯 실루엣, 플랫폼 주변 장식
- scrollRate: 0.55 (midObjects 0.38보다 빠름, foreground 0.65보다 느림)

**거리별 시각 처리 원칙**

| 레이어 | Alpha | 느낌 | Scroll Rate |
|--------|-------|------|-------------|
| sky | 1.0 | 저채도·저대비 | 0.08 |
| farMountains | 0.75 | 저채도·저대비 | 0.20 |
| clouds | 0.15~0.25 | 반투명 | 0.15 |
| midObjects | 0.90 | 중간 | 0.38 |
| nearObjects | 1.0 | 고채도·고대비 | 0.55 |
| foreground | 1.0 | 고채도 | 0.65 |

**구현 파일**: `src/phaser/rendering/ParallaxBackgroundSystem.js`
- `this.layers.nearObjects` Graphics 추가 (depth -4)
- `drawNearObjects(palette, offset)` 메서드 추가
- `update()` 에서 `drawNearObjects(palette, centerOffset * 0.55)` 호출

---

### 2. 구름 레이어 (Micro Motion) ⭐⭐⭐

**현재**: 구름 없음
**목표**: 느리게 이동하는 반투명 구름

**구현 내용**
- Layer depth: -14 (mountains와 midObjects 사이)
- 구름 6~8개, 타원 2~3개 겹쳐 볼륨감 표현
- 이동 속도: 0.05~0.12 px/frame (매우 느림)
- 패럴랙스 배율: 0.15 (산보다 살짝 빠름)
- Alpha: 0.12~0.25 (반투명 실루엣)
- 밝기 펄스: `sin(time/3000)` × 0.05 로 구름 테두리 미세 발광

**구현 파일**: `src/phaser/rendering/ParallaxBackgroundSystem.js`
- `this.layers.clouds` Graphics 추가 (depth -14)
- `this.cloudData` 배열 (x, y, w, h, speed, alpha, phase) — `generateGeometry()` 확장
- `drawClouds(palette, offset)` 메서드 추가

---

### 3. Color Grading / Post-Process Overlay ⭐⭐⭐

**현재**: 없음
**목표**: 전체 화면에 Color Grade 적용 — 인디 → 프로 느낌

**방법**: Phaser fullscreen Rectangle + BlendMode.MULTIPLY
- Depth: 999 (최상단, UI 레이어 아래)
- Alpha: 0.06~0.12 (약하게 적용)
- 매 프레임 강도 sin 펄스 (±0.01) — 살아있는 느낌

**테마별 Color Grade**

| 테마 | Overlay 색상 | 효과 |
|------|-------------|------|
| dusk_forest | 0x4a3f80 (보라빛) | 황혼 차가운 그림자 통일 |
| night_ruins | 0x0a0a2a (진청) | 심야 압박감 |
| dawn (신규) | 0xff9944 (주황) | 새벽 따뜻한 빛 |
| cave (신규) | 0x1a0a2a (심자주) | 던전 공포 분위기 |

**구현 파일**: `src/phaser/rendering/AmbienceFxSystem.js`
- `this.layers.grade` 추가 (fullscreen rect)
- `drawColorGrade(paused)` 메서드
- `THEME_GRADE_CONFIG` 상수로 테마별 색상·알파 관리

---

### 4. 나무 수관(Canopy) Micro Motion ⭐⭐

**현재**: 잔디 blade만 흔들림
**목표**: midObjects·nearObjects 나무 수관이 바람에 흔들림

**구현 내용**
- `windStrength` 글로벌 변수: `0.8 + 0.7 * sin(time / 8000)` — 바람 세기 변화
- 나무(kind === 0) 수관 ellipse의 cx에 `sin(time/900 + phase) * 3 * windStrength` 오프셋
- 뾰족한 나무(kind === 1) tip에 `±2px` 진동
- nearObjects 나무 동일 적용 (배율 × 1.3 — 가까울수록 크게 흔들림)

**구현 파일**: `src/phaser/rendering/ParallaxBackgroundSystem.js`
- `drawMidObjects()` 수정
- `drawNearObjects()` 에서 동일 패턴 적용
- `this.windPhase` 내부 상태 추가

---

### 5. Depth Blur 시뮬레이션 ⭐⭐

**현재**: 거리별 Alpha 차이만 존재
**목표**: "흐림" 느낌 (GPU 셰이더 없이)

**방법**: Soften Pass (동일 shape를 미세 offset으로 2회 그리기)
- Far Mountains: 동일 shape를 x+1.5, y+1에 `alpha × 0.35`로 추가 그리기 → 부드러운 윤곽
- Horizon Haze: 수평선 바로 위에 지평선 색 gradient 직사각형 추가 (alpha 0.18) → 대기원근감
- Near Objects 전경: foreground 색 얇은 gradient strip overlay (depth -3, alpha 0.12) → 전경 흐림

**구현 파일**: `src/phaser/rendering/ParallaxBackgroundSystem.js`
- `drawMountains()` 내 soften pass 루프 추가
- `drawHorizonHaze(palette)` 헬퍼 메서드
- `drawForegroundVignette(palette)` 전경 오버레이

---

### 6. 신규 테마 추가 ⭐⭐

**현재**: dusk_forest / night_ruins (2개)
**추가**: dawn (새벽), cave (동굴/던전)

**dawn 팔레트**
```js
dawn: {
    skyTop: 0xff7744, skyBottom: 0xffcc88,
    horizonGlow: 0xffa040,
    mountainFar: 0x5a4030, mountainNear: 0x7a5040,
    objectDark: 0x4a3828, objectLight: 0x7a6248,
    grassDark: 0x3a5828, grassLight: 0x6a9048
}
```

**cave 팔레트**
```js
cave: {
    skyTop: 0x0d0810, skyBottom: 0x1a1030,
    horizonGlow: 0x442266,
    mountainFar: 0x1a1424, mountainNear: 0x2a1e3c,
    objectDark: 0x1e1628, objectLight: 0x2e2244,
    grassDark: 0x1a2018, grassLight: 0x2a3428
}
```

**cave 특이사항**: 별 → 종유석 포인트로 교체, 빛줄기 → 용암 반사로 교체

**구현 파일**: `src/phaser/rendering/ParallaxBackgroundSystem.js` — `THEME_CONFIG` 확장

---

### Phase 8 구현 우선순위

| 순위 | 항목 | 임팩트 | 파일 |
|------|------|--------|------|
| 1 | Color Grading Overlay | ⭐⭐⭐ | AmbienceFxSystem.js |
| 2 | 구름 레이어 (Micro Motion) | ⭐⭐⭐ | ParallaxBackgroundSystem.js |
| 3 | Near Objects 5번째 레이어 | ⭐⭐⭐ | ParallaxBackgroundSystem.js |
| 4 | 나무 Canopy 흔들림 (windStrength) | ⭐⭐ | ParallaxBackgroundSystem.js |
| 5 | Depth Blur 시뮬레이션 | ⭐⭐ | ParallaxBackgroundSystem.js |
| 6 | 신규 테마 (dawn / cave) | ⭐⭐ | ParallaxBackgroundSystem.js |

### 핵심 구현 파일

| 파일 | 수정 항목 |
|------|-----------|
| `src/phaser/rendering/ParallaxBackgroundSystem.js` | 구름·nearObjects·Depth Blur·새 테마·Canopy Motion |
| `src/phaser/rendering/AmbienceFxSystem.js` | Color Grading Overlay |
