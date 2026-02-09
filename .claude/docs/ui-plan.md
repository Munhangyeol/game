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
