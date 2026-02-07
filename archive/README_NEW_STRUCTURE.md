# 🎮 MapleQuest RPG - 도메인 기반 아키텍처

메이플스토리 스타일의 2D 횡스크롤 RPG 브라우저 게임 (순수 HTML5 + Vanilla JS)

**버전:** 2.0 (재구성 완료)
**날짜:** 2026-02-07
**상태:** ✅ 프로덕션 준비 완료

---

## 🚀 빠른 시작

### 게임 실행
```bash
# 방법 1: 간단 실행 (Windows)
cd C:\claude-code\game
start "" "http://localhost:8000"
python -m http.server 8000

# 방법 2: 스크립트 사용
scripts\server.bat
```

### 브라우저에서 열기
```
http://localhost:8000/public/index.html
```

---

## 📁 새로운 프로젝트 구조

### 핵심 디렉토리
```
game/
├── src/                       # 소스 코드
│   ├── core/                  # 핵심 게임 로직
│   ├── features/              # 도메인별 기능
│   ├── infrastructure/        # 외부 시스템
│   └── ui/                    # 사용자 인터페이스
├── data/                      # 게임 데이터
├── docs/                      # 문서
├── test/                      # 테스트
├── public/                    # 배포 파일
└── scripts/                   # 개발 스크립트
```

### 상세 구조
자세한 내용은 [`docs/architecture/NEW_STRUCTURE.md`](docs/architecture/NEW_STRUCTURE.md) 참조

---

## 🎯 주요 기능

### ✅ 완료된 기능 (Phase 1-2)

#### 직업 시스템
- **3개 직업**: 전사 ⚔️, 도적 🗡️, 궁수 🏹
- 직업별 고유 스탯 (HP, MP, 속도, 크리티컬)
- 직업별 기본 공격 (데미지, 쿨다운, 범위 차별화)

#### 스킬 시스템
- 직업당 3개 스킬 (9개 스킬 전체)
- MP 소모 및 쿨다운 시스템
- 버프 스킬: 레이지(공격↑), 헤이스트(속도↑), 소울 애로우(관통)

#### 전투 시스템
- 실시간 액션 전투
- 크리티컬 히트 (직업별 확률)
- 넉백, 관통, 다단히트 등 다양한 메커니즘

#### 몬스터 시스템
- AI 기반 적 추적
- 레벨별 스폰 및 난이도 조절
- 보상 (경험치, 메소)

#### 성장 시스템
- 경험치 및 레벨업
- 레벨당 스탯 증가 (HP, MP, 공격력, 크리티컬)
- 비선형 EXP 스케일링

#### UI/UX
- 메이플스토리 스타일 UI
- HP/MP/EXP 바
- 스킬 쿨다운 시각화
- 버프 아이콘 표시

---

## 🏗️ 아키텍처 원칙

### 적용된 설계 원칙
1. **SRP** - 같이 바뀌는 것끼리
2. **Domain** - 도메인 기준 구조화
3. **의존 방향** - 단방향 (하위 → 상위)
4. **Common 최소화** - 공통 모듈 최소화
5. **Infra 격리** - 외부 연동 분리
6. **네이밍 통일** - PascalCase, ~System 접미사
7. **도메인 경계** - 명확한 경계
8. **테스트 미러링** - 구조 반영
9. **스크립트 격리** - 개발/배포 분리
10. **배포 단위** - public/ 분리

### 계층 구조
```
main.js
  ↓
ui/ (표현)
  ↓
infrastructure/ (인프라)
  ↓
features/ (도메인)
  ↓
core/ (핵심)
  ↓
data/ (데이터)
```

---

## 🧪 테스트

### 통합 테스트 실행
```bash
# 방법 1: 시각적 테스트 하네스
http://localhost:8000/test/integration/test-harness.html

# 방법 2: 콘솔 테스트
# F12 → Console
# integration-test.js 복사-붙여넣기
await runIntegrationTests('warrior')
```

### 테스트 커버리지
- ✅ 42개 자동화 테스트
- ✅ 8개 테스트 단계
- ✅ 100% 통과율

자세한 내용은 [`test/docs/README.md`](test/docs/README.md) 참조

---

## 📚 문서

### 아키텍처
- [`NEW_STRUCTURE.md`](docs/architecture/NEW_STRUCTURE.md) - 새 구조 설명
- [`MODULAR_STRUCTURE.md`](docs/architecture/MODULAR_STRUCTURE.md) - 모듈 구조

### 가이드
- [`QUICK_TEST_GUIDE.md`](docs/guides/QUICK_TEST_GUIDE.md) - 빠른 테스트
- [`INTEGRATION_TEST_SUMMARY.md`](docs/guides/INTEGRATION_TEST_SUMMARY.md) - 테스트 요약

### 프로젝트
- [`CLAUDE.md`](docs/CLAUDE.md) - Claude Code 가이드
- [`RESTRUCTURE_COMPLETE.md`](docs/RESTRUCTURE_COMPLETE.md) - 재구성 완료 보고서

---

## 🛠️ 개발

### 기술 스택
- **언어**: Vanilla JavaScript (ES6+ 모듈)
- **렌더링**: HTML5 Canvas
- **의존성**: 없음 (순수 바닐라)
- **아키텍처**: 도메인 주도 설계 (DDD) 영감

### 새 기능 추가
```javascript
// 1. 도메인 결정 (combat, monster, progression 등)
// 2. features/ 아래에 모듈 생성
// 3. GameState 사용하여 상태 접근
// 4. 테스트 작성

// 예시: 새 스킬 추가
// src/features/combat/새스킬.js
import { game, player } from '../../core/game/GameState.js';

export function perform새스킬(damage) {
    // 구현
}
```

### Import 경로
```javascript
// ✅ 새 코드: 새 경로 직접 사용
import { game } from './core/game/GameState.js';

// ✅ 기존 호환: 배럴 파일 (동작함)
import { game } from './state.js';
```

---

## 🐛 버그 수정 내역

### Phase 1 통합 테스트 (5개 수정)
1. ✅ 코인 스폰 경쟁 조건
2. ✅ Effect 클래스 null 참조
3. ✅ 직업 선택 타이밍
4. ✅ DOM 요소 검증 누락
5. ✅ MP 차감 타이밍

자세한 내용은 [`test/docs/BUG_FIXES_REPORT.md`](test/docs/BUG_FIXES_REPORT.md) 참조

---

## 🎯 로드맵

### Phase 2 (다음) - 전직 시스템
- [ ] Lv 10/30/70 전직
- [ ] 전직별 스킬 변경
- [ ] 전직 시각 효과

### Phase 3 - 몬스터 확장
- [ ] 새 몬스터 타입
- [ ] 보스 몬스터
- [ ] 특수 공격 패턴

### Phase 4+ - 추가 기능
- [ ] 장비 시스템
- [ ] 인벤토리
- [ ] 저장/로드 기능
- [ ] 멀티플레이어 (장기)

---

## 🤝 기여

### 코드 스타일
- ESLint 설정 없음 (향후 추가 예정)
- 일관된 네이밍: PascalCase 파일, camelCase 변수
- 한글 주석 권장

### 커밋 메시지
```
feat: 새 기능 추가
fix: 버그 수정
docs: 문서 업데이트
refactor: 리팩터링
test: 테스트 추가

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

---

## 📄 라이선스

이 프로젝트는 교육 목적으로 제작되었습니다.

---

## 🙏 감사의 말

- **메이플스토리**: UI/UX 영감
- **Claude Code**: 개발 지원
- **통합 테스트 시스템**: 품질 보증

---

**프로젝트 상태:** ✅ 프로덕션 준비
**마지막 업데이트:** 2026-02-07
**다음 작업:** Phase 2 전직 시스템 개발
