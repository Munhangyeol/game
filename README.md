# 🎮 MapleQuest RPG

메이플스토리 스타일의 2D 횡스크롤 RPG 브라우저 게임

**언어:** Vanilla JavaScript (ES6+ Modules)
**렌더링:** HTML5 Canvas
**의존성:** 없음 (순수 바닐라)
**버전:** 2.0 - 도메인 기반 아키텍처

---

## 🚀 빠른 시작

### 게임 실행
```bash
# Windows
cd game
python -m http.server 8000
start "" "http://localhost:8000/public"

# 또는 스크립트 사용
scripts\server.bat
```

### 브라우저에서 열기
```
http://localhost:8000/public/index.html
```

---

## 📁 프로젝트 구조

```
game/
├── src/                       # 소스 코드
│   ├── core/                  # 핵심 게임 로직
│   ├── features/              # 도메인별 기능
│   ├── infrastructure/        # 외부 시스템 연동
│   ├── ui/                    # 사용자 인터페이스
│   └── main.js                # 진입점
├── data/                      # 게임 데이터
├── docs/                      # 문서
├── test/                      # 테스트
├── public/                    # 배포 파일
├── scripts/                   # 개발 스크립트
└── archive/                   # 히스토리 참고용
```

자세한 구조: [docs/architecture/NEW_STRUCTURE.md](docs/architecture/NEW_STRUCTURE.md)

---

## 🎯 주요 기능

- ✅ **3개 직업**: 전사 ⚔️, 도적 🗡️, 궁수 🏹
- ✅ **9개 스킬**: 직업당 3개 고유 스킬
- ✅ **전투 시스템**: 크리티컬, 넉백, 콤보
- ✅ **성장 시스템**: 레벨업, 스탯 증가
- ✅ **UI/UX**: 메이플스토리 스타일

---

## 🧪 테스트

### 통합 테스트
```
http://localhost:8000/test/integration/test-harness.html
```

- ✅ 42개 자동화 테스트
- ✅ 100% 통과율

---

## 📚 문서

- **[NEW_STRUCTURE.md](docs/architecture/NEW_STRUCTURE.md)** - 파일 구조
- **[CLAUDE.md](docs/CLAUDE.md)** - 개발 가이드
- **[QUICK_TEST_GUIDE.md](docs/guides/QUICK_TEST_GUIDE.md)** - 테스트 가이드

---

## 🎯 로드맵

- ✅ Phase 1: 핵심 시스템 (완료)
- ✅ Phase 2: 아키텍처 재구성 (완료)
- 🔄 Phase 3: 전직 시스템 (다음)
- 🔄 Phase 4+: 확장 기능

---

**상태:** ✅ 프로덕션 준비 완료
**업데이트:** 2026-02-07
