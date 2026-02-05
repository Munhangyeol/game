# Git 커밋 자동화

## 설명
Git 워크플로우를 자동화하는 스킬입니다. 변경사항 확인, 스테이징, 의미있는 커밋 메시지 생성, 커밋, 원격 저장소 푸시까지 한 번에 처리합니다.

## 사용법
```bash
/git-commit
```

사용자는 추가로 커밋 메시지를 지정할 수도 있습니다:
```bash
/git-commit "feat: 새로운 기능 추가"
```

## 동작 과정

1. **변경사항 확인**
   - `git status`로 수정/추가/삭제된 파일 목록 확인
   - 변경사항이 없으면 작업 종료

2. **변경사항 분석**
   - 수정된 파일들의 내용을 분석
   - 작업 유형 파악 (기능 추가, 버그 수정, 리팩토링 등)

3. **커밋 메시지 생성**
   - 작업 유형에 따른 prefix 자동 선택:
     - `feat:` - 새로운 기능 추가
     - `fix:` - 버그 수정
     - `docs:` - 문서 수정
     - `refactor:` - 코드 리팩토링
     - `test:` - 테스트 코드 추가/수정
     - `style:` - 코드 포맷팅, 세미콜론 누락 등
     - `chore:` - 빌드 업무, 패키지 관리자 설정 등
   - 변경 내용을 간결하게 요약

4. **파일 스테이징**
   - 관련 파일들을 `git add`로 스테이징
   - 민감한 파일(.env, credentials 등)은 제외

5. **커밋 실행**
   - Co-Authored-By 태그와 함께 커밋
   - 형식:
     ```
     type: 간결한 설명

     Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
     ```

6. **원격 푸시 (선택사항)**
   - 사용자 확인 후 `git push` 실행
   - 현재 브랜치를 원격 저장소에 푸시

## 옵션

- `--no-push` - 커밋만 하고 푸시하지 않음
- `--amend` - 이전 커밋에 변경사항 추가
- `-m "메시지"` - 커스텀 커밋 메시지 사용

## 예시

### 예시 1: 기본 사용
```bash
/git-commit
```

**결과:**
```
변경된 파일:
- backend/src/services/sentimentService.js
- backend/src/utils/keywords.js

커밋 메시지: refactor: 감성 분석 키워드 로직 개선

파일 스테이징 중...
커밋 생성 중...
[main abc1234] refactor: 감성 분석 키워드 로직 개선
 2 files changed, 45 insertions(+), 23 deletions(-)

원격 저장소에 푸시하시겠습니까? (y/n)
```

### 예시 2: 커스텀 메시지
```bash
/git-commit "feat: Bitcoin 가격 알림 기능 추가"
```

**결과:**
```
[main def5678] feat: Bitcoin 가격 알림 기능 추가
 3 files changed, 78 insertions(+), 5 deletions(-)
```

### 예시 3: 푸시 없이 커밋
```bash
/git-commit --no-push
```

## 주의사항

1. **민감한 파일 제외**
   - `.env`, `credentials.json`, `*.key` 등은 자동으로 제외
   - 실수로 커밋되지 않도록 `.gitignore` 확인

2. **커밋 전 확인**
   - 변경사항이 의도한 대로인지 확인
   - 불필요한 디버그 코드나 주석이 포함되지 않았는지 체크

3. **커밋 메시지 규칙**
   - 명령형 현재 시제 사용 ("추가함" X, "추가" O)
   - 50자 이내로 간결하게 작성
   - 상세 설명이 필요한 경우 본문에 추가

4. **브랜치 확인**
   - main/master 브랜치에 직접 푸시하는 경우 주의
   - 협업 시 feature 브랜치 사용 권장

5. **충돌 처리**
   - 원격 저장소와 충돌 시 수동 해결 필요
   - pull 후 다시 시도

## 프로젝트 특화 팁

### 백엔드 작업
```bash
# 서비스 로직 수정 시
/git-commit  # → "refactor: [서비스명] 로직 개선"

# API 엔드포인트 추가 시
/git-commit  # → "feat: [기능명] API 엔드포인트 추가"
```

### 프론트엔드 작업
```bash
# 컴포넌트 추가 시
/git-commit  # → "feat: [컴포넌트명] 컴포넌트 추가"

# 스타일 수정 시
/git-commit  # → "style: [컴포넌트명] 스타일링 개선"
```

### 데이터베이스 작업
```bash
# 스키마 변경 시
/git-commit  # → "chore: 데이터베이스 스키마 업데이트"
```

## 관련 명령어

- `git status` - 변경사항 수동 확인
- `git log` - 커밋 히스토리 조회
- `git diff` - 변경 내용 상세 보기
- `git reset HEAD~1` - 마지막 커밋 취소
