# MapleQuest RPG - Custom Skills

이 폴더에는 MapleQuest RPG 개발을 위한 커스텀 Claude Code 스킬이 포함되어 있습니다.

## 사용 가능한 스킬

### 1. `/integration-test` - 통합 테스트 ⭐ 추천

게임의 전체 플레이 플로우를 실제로 테스트합니다. 실제 플레이어 경험을 시뮬레이션하여 모든 시스템이 통합적으로 작동하는지 확인합니다.

**테스트 시나리오:**
- ✅ Phase 1: 게임 초기화 & 직업 선택
- ✅ Phase 2: 이동 & 물리 (좌우 이동, 점프, 플랫폼 충돌)
- ✅ Phase 3: 기본 공격 (3개 직업 각각 다른 공격)
- ✅ Phase 4: 스킬 시스템 (9개 스킬 전체 테스트)
- ✅ Phase 5: 몬스터 전투 & 레벨링 (EXP, 레벨업, 메소)
- ✅ Phase 6: 고급 전투 (콤보, 히트 이펙트, 다수 몬스터)
- ✅ Phase 7: 버프 시스템 (3개 버프 통합 테스트)
- ✅ Phase 8: 성능 & 안정성 (60 FPS, 메모리 누수)
- ✅ Phase 9: 직업별 밸런스 비교
- ✅ Phase 10: 최종 통합 체크

**사용 방법:**
```
/integration-test
```

**결과:**
- ✅ 통과한 테스트 목록
- ⚠️ 경고 (마이너 이슈)
- ❌ 실패 (크리티컬 버그)
- 📊 성능 메트릭 (FPS, 메모리, 에러)
- 🎮 게임플레이 평가
- 🐛 발견된 버그 리스트
- ✨ 개선 권장사항

---

### 2. `/ui-test` - UI 컴포넌트 테스트

게임의 모든 UI 요소가 정상 작동하는지 종합적으로 테스트합니다.

**테스트 항목:**
- ✅ 직업 선택 화면 (Job Selection)
- ✅ HUD (HP/MP/EXP 바, 레벨, 스탯)
- ✅ 스킬 바 (쿨다운, 애니메이션)
- ✅ 버프 바 (버프 아이콘, 타이머)
- ✅ 캔버스 렌더링 (플레이어, 몬스터, 배경)
- ✅ 키보드 입력 (이동, 점프, 공격, 스킬)
- ✅ 시각 효과 (파티클, 이펙트, 애니메이션)
- ✅ 성능 (FPS, 렉 체크)

**사용 방법:**
```
/ui-test
```

**결과:**
- ✅ 정상 작동 컴포넌트 목록
- ⚠️ 발견된 문제점
- ❌ 고장난 기능
- 📊 성능 메트릭

---

### 3. `/api-test` - 서버 및 API 테스트

HTTP 서버와 모듈 로딩이 정상 작동하는지 테스트합니다. 향후 API 엔드포인트 개발을 준비합니다.

**테스트 항목:**
- ✅ HTTP 서버 상태 (포트 8000)
- ✅ ES 모듈 로딩 (CORS 체크)
- ✅ 정적 파일 서빙 (CSS, JS)
- ✅ 네트워크 성능 (응답 시간)
- 📋 향후 API 설계 (Save/Load, Leaderboard)
- 📋 WebSocket 준비 (멀티플레이어)

**사용 방법:**
```
/api-test
```

**결과:**
- ✅ 서버 상태
- ✅ 모듈 로딩 성공/실패
- ⚠️ CORS/네트워크 이슈
- 📋 향후 API 권장사항
- 📊 성능 메트릭

---

## 스킬 사용 예시

### 게임 전체가 정상 작동하는지 확인하고 싶을 때 (추천):
```
사용자: /integration-test
Claude: [전체 게임 플레이 시뮬레이션]
        Phase 1: 직업 선택 테스트 ✅
        Phase 2: 이동 & 점프 테스트 ✅
        Phase 3: 전사/도적/궁수 기본공격 ✅
        Phase 4: 9개 스킬 전체 테스트 ✅
        Phase 5: 몬스터 처치 & 레벨업 ✅
        Phase 6-10: 고급 기능 테스트 ✅

        📊 테스트 리포트:
        ✅ 통과: 47/50 테스트
        ⚠️ 경고: 2개 (마이너 이슈)
        ❌ 실패: 1개 (버그 발견)

        🐛 발견된 버그:
        - 전사 Power Strike 왼쪽 공격 위치 어긋남

        → 상세 리포트 제공
```

### UI가 잘 작동하는지 확인하고 싶을 때:
```
사용자: /ui-test
Claude: [UI 컴포넌트 전체 테스트 수행]
        - 직업 선택 화면 확인
        - HUD 렌더링 확인
        - 스킬 바 쿨다운 확인
        - 키보드 입력 테스트
        - FPS 측정
        → 결과 리포트 제공
```

### 서버와 모듈이 정상인지 확인하고 싶을 때:
```
사용자: /api-test
Claude: [서버 및 API 테스트 수행]
        - HTTP 서버 상태 확인
        - 모든 ES 모듈 로딩 확인
        - CORS 설정 확인
        - 네트워크 탭 점검
        → 결과 리포트 제공
```

---

## 스킬 파일 구조

```
.claude/skills/
├── README.md              # 이 파일
├── ui-test/
│   └── skill.md           # UI 테스트 스킬 정의
└── api-test/
    └── skill.md           # API 테스트 스킬 정의
```

---

## 스킬 추가 방법

새로운 스킬을 만들려면:

1. `.claude/skills/` 폴더에 새 디렉토리 생성
   ```bash
   mkdir .claude/skills/my-skill
   ```

2. `skill.md` 파일 생성
   ```bash
   touch .claude/skills/my-skill/skill.md
   ```

3. `skill.md`에 스킬 정의 작성
   ```markdown
   # My Skill

   Brief description of what this skill does.

   ## Instructions

   When the user invokes this skill, perform these actions:
   - [ ] Action 1
   - [ ] Action 2
   - [ ] Action 3
   ```

4. Claude Code 재시작 (스킬 인식)

5. 사용
   ```
   /my-skill
   ```

---

## 유용한 팁

### 빠른 테스트 워크플로우

**전체 검증 (권장):**
```
1. 코드 수정
2. /integration-test 실행 (종합 테스트)
3. 리포트 확인 → 문제 수정
4. 완료!
```

**세부 디버깅:**
```
1. 코드 수정
2. /api-test 실행 (모듈 로딩 확인)
3. /ui-test 실행 (UI 렌더링 확인)
4. /integration-test 실행 (통합 테스트)
5. 브라우저 새로고침 (Ctrl+F5)
6. 수동 플레이 테스트
```

### 문제 발생 시
```
1. /api-test로 서버 상태 확인
2. 콘솔 에러 확인
3. /ui-test로 UI 렌더링 확인
4. DevTools Network 탭 확인
```

---

## 관련 파일

- **게임 코드:** `C:\claude-code\game\src\`
- **스타일:** `C:\claude-code\game\css\style.css`
- **데이터:** `C:\claude-code\game\data\jobs.js`
- **진입점:** `C:\claude-code\game\index.html`
- **서버:** `C:\claude-code\game\server.bat`
