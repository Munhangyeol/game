# 코드 리팩토링

## 설명
코드의 외부 동작은 유지하면서 내부 구조를 개선하는 스킬입니다. 가독성, 유지보수성, 성능을 향상시키고 기술 부채를 줄입니다.

## 사용법
```bash
/refactor [파일경로 또는 폴더경로]
```

특정 리팩토링 유형 지정:
```bash
/refactor --type=naming backend/src/services/
/refactor --type=duplication frontend/src/components/
/refactor --type=complexity backend/src/services/sentimentService.js
```

## 동작 과정

1. **코드 분석**
   - 대상 파일/폴더의 코드 읽기
   - 코드 스멜(Code Smell) 탐지
   - 개선 가능한 부분 식별

2. **리팩토링 계획 수립**
   - 발견된 문제점 정리
   - 개선 방법 제안
   - 사용자 확인 요청

3. **리팩토링 실행**
   - 코드 수정 적용
   - 기존 기능 유지 확인
   - 테스트 실행 (있는 경우)

4. **결과 보고**
   - 변경 사항 요약
   - 개선된 메트릭 제시
   - 추가 권장사항 제공

## 리팩토링 유형

### 1. 네이밍 개선 (naming)
**대상:**
- 불명확한 변수명
- 일관성 없는 명명 규칙
- 약어나 축약어 남용

**예시:**
```javascript
// Before
const d = new Date();
const tmp = getData();
function proc(x) { ... }

// After
const currentDate = new Date();
const newsArticles = getData();
function processNewsData(newsData) { ... }
```

### 2. 중복 제거 (duplication)
**대상:**
- 반복되는 코드 블록
- 유사한 함수들
- 중복된 상수/설정

**예시:**
```javascript
// Before
function getBitcoinPrice() {
  const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
  return response.data.bitcoin.usd;
}
function getEthereumPrice() {
  const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
  return response.data.ethereum.usd;
}

// After
async function getCoinPrice(coinId) {
  const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`);
  return response.data[coinId].usd;
}
```

### 3. 복잡도 감소 (complexity)
**대상:**
- 긴 함수 (50줄 이상)
- 깊은 중첩 (3단계 이상)
- 많은 파라미터 (4개 이상)

**예시:**
```javascript
// Before
function analyzeSentiment(title, keywords) {
  let score = 0;
  if (keywords.positive.high.some(k => title.includes(k))) {
    score += 3;
  } else if (keywords.positive.medium.some(k => title.includes(k))) {
    score += 2;
  }
  if (keywords.negative.high.some(k => title.includes(k))) {
    score -= 3;
  } else if (keywords.negative.medium.some(k => title.includes(k))) {
    score -= 2;
  }
  return score;
}

// After
function calculateKeywordScore(title, keywordList, weight) {
  return keywordList.some(k => title.includes(k)) ? weight : 0;
}

function analyzeSentiment(title, keywords) {
  const positiveScore =
    calculateKeywordScore(title, keywords.positive.high, 3) +
    calculateKeywordScore(title, keywords.positive.medium, 2);

  const negativeScore =
    calculateKeywordScore(title, keywords.negative.high, -3) +
    calculateKeywordScore(title, keywords.negative.medium, -2);

  return positiveScore + negativeScore;
}
```

### 4. 서비스 레이어 분리 (layering)
**대상:**
- 라우트에 비즈니스 로직 포함
- 컴포넌트에 API 호출 직접 작성
- 데이터베이스 쿼리 분산

**예시:**
```javascript
// Before (라우트에 로직 포함)
router.get('/news', async (req, res) => {
  const response = await fetch('https://cryptopanic.com/api/v1/posts/');
  const news = response.data.results;
  const filtered = news.filter(n => n.coins.includes('BTC'));
  res.json(filtered);
});

// After (서비스 레이어 분리)
// routes/news.js
router.get('/news', async (req, res) => {
  const news = await newsService.getBitcoinNews();
  res.json(news);
});

// services/newsService.js
async function getBitcoinNews() {
  const allNews = await cryptoPanicService.fetchNews();
  return allNews.filter(n => n.coins.includes('BTC'));
}
```

### 5. 에러 처리 개선 (error-handling)
**대상:**
- try-catch 누락
- 일반적인 에러 메시지
- 에러 무시 (빈 catch 블록)

**예시:**
```javascript
// Before
async function getPrice(coinId) {
  const response = await fetch(`/api/prices/${coinId}`);
  return response.data;
}

// After
async function getPrice(coinId) {
  try {
    const response = await fetch(`/api/prices/${coinId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch price for ${coinId}: ${response.statusText}`);
    }

    return response.data;
  } catch (error) {
    console.error(`Error in getPrice for ${coinId}:`, error);
    throw new Error(`Unable to retrieve ${coinId} price. Please try again later.`);
  }
}
```

### 6. 상수 추출 (constants)
**대상:**
- 매직 넘버/문자열
- 반복되는 설정 값
- 하드코딩된 URL/키

**예시:**
```javascript
// Before
if (score > 0.15) {
  trend = 'UP';
} else if (score < -0.15) {
  trend = 'DOWN';
}

// After
const TREND_THRESHOLDS = {
  UP: 0.15,
  DOWN: -0.15
};

if (score > TREND_THRESHOLDS.UP) {
  trend = 'UP';
} else if (score < TREND_THRESHOLDS.DOWN) {
  trend = 'DOWN';
}
```

## 옵션

- `--type=naming` - 네이밍만 개선
- `--type=duplication` - 중복 코드만 제거
- `--type=complexity` - 복잡도만 감소
- `--type=layering` - 레이어 분리만 수행
- `--type=error-handling` - 에러 처리만 개선
- `--type=constants` - 상수 추출만 수행
- `--dry-run` - 변경 사항 미리보기 (실제 수정 X)
- `--aggressive` - 더 적극적인 리팩토링 수행

## 예시

### 예시 1: 서비스 전체 리팩토링
```bash
/refactor backend/src/services/sentimentService.js
```

**분석 결과:**
```
리팩토링 기회 발견:
1. [복잡도] analyzeTrend 함수가 80줄로 너무 김
2. [중복] 키워드 매칭 로직이 3곳에서 반복
3. [네이밍] 변수명 'tmp', 'res' 등이 불명확
4. [상수] 감성 점수 가중치가 하드코딩됨

개선 계획:
- analyzeTrend를 3개 함수로 분리
- calculateKeywordScore 헬퍼 함수 생성
- 변수명을 명확하게 변경
- SENTIMENT_WEIGHTS 상수 객체 생성

진행하시겠습니까? (y/n)
```

### 예시 2: 컴포넌트 폴더 리팩토링
```bash
/refactor --type=duplication frontend/src/components/
```

**결과:**
```
중복 코드 발견:
- PriceCard.js, TrendIndicator.js에서 색상 결정 로직 중복
- Dashboard.js, NewsFeed.js에서 API 호출 패턴 중복

개선 사항:
✓ utils/colorHelper.js 생성 (색상 로직 통합)
✓ hooks/useApi.js 생성 (API 호출 추상화)

제거된 중복 코드: 45줄
```

### 예시 3: 특정 문제만 수정
```bash
/refactor --type=error-handling backend/src/routes/
```

## 주의사항

1. **테스트 필수**
   - 리팩토링 후 반드시 테스트 실행
   - 기존 기능이 정상 작동하는지 확인
   - 회귀 버그 주의

2. **점진적 개선**
   - 한 번에 모든 것을 바꾸지 말 것
   - 작은 단위로 리팩토링 후 커밋
   - 문제 발생 시 되돌리기 쉽게

3. **의미 보존**
   - 코드 동작이 변경되지 않도록 주의
   - 엣지 케이스 처리 유지
   - 성능 영향 최소화

4. **팀 컨벤션 준수**
   - 프로젝트의 코딩 스타일 따르기
   - 기존 아키텍처 패턴 존중
   - 일관성 유지

5. **문서 업데이트**
   - 함수 시그니처 변경 시 주석 수정
   - README나 CLAUDE.md 업데이트
   - API 문서 갱신

## 리팩토링 체크리스트

### Before (리팩토링 전)
- [ ] 현재 코드의 동작 이해
- [ ] 테스트 코드 존재 확인
- [ ] 변경 범위 파악
- [ ] 백업 또는 브랜치 생성

### During (리팩토링 중)
- [ ] 작은 단위로 수정
- [ ] 각 단계마다 테스트
- [ ] 컴파일/린트 에러 확인
- [ ] 커밋 메시지 명확히 작성

### After (리팩토링 후)
- [ ] 전체 테스트 실행
- [ ] 성능 비교 (필요시)
- [ ] 코드 리뷰 요청
- [ ] 문서 업데이트

## 프로젝트 특화 가이드

### sentimentService.js 리팩토링
```javascript
// 핵심 알고리즘 유지 필수
// - 키워드 가중치 (high=3, medium=2)
// - 트렌드 임계값 (±0.15)
// - 정규화 계산 공식
```

### React 컴포넌트 리팩토링
```javascript
// 재사용 가능한 컴포넌트로 분리
// - 프레젠테이셔널 vs 컨테이너
// - Props drilling 최소화
// - Custom hooks 활용
```

### API 라우트 리팩토링
```javascript
// 레이어 분리 원칙
// - 라우트: 요청/응답 처리
// - 서비스: 비즈니스 로직
// - 모델: 데이터 접근
```

## 관련 명령어

- `/test` - 리팩토링 후 테스트 실행
- `/git-commit` - 리팩토링 결과 커밋
- `/docs` - 변경된 코드 문서화
