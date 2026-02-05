# 테스트 자동화

## 설명
자동화된 테스트 코드를 작성하고 실행하는 스킬입니다. 단위 테스트, 통합 테스트, E2E 테스트를 지원하며 코드 품질과 안정성을 보장합니다.

## 사용법
```bash
/test [파일경로 또는 테스트명]
```

특정 테스트 유형 실행:
```bash
/test --unit                    # 단위 테스트만
/test --integration             # 통합 테스트만
/test --e2e                     # E2E 테스트만
/test --coverage                # 커버리지 포함
```

테스트 작성:
```bash
/test --write backend/src/services/sentimentService.js
/test --write frontend/src/components/Dashboard.js
```

## 동작 과정

### 테스트 실행 모드

1. **테스트 파일 탐색**
   - `*.test.js`, `*.spec.js` 파일 찾기
   - 테스트 스위트 분류 (unit/integration/e2e)

2. **테스트 실행**
   - Jest 또는 지정된 테스트 러너 실행
   - 실시간 결과 출력

3. **결과 분석**
   - 통과/실패 테스트 집계
   - 실패 원인 상세 분석
   - 커버리지 리포트 생성 (옵션)

4. **피드백 제공**
   - 실패한 테스트 수정 제안
   - 커버리지 개선 권장사항

### 테스트 작성 모드

1. **코드 분석**
   - 대상 파일의 함수/메서드 파악
   - 의존성 및 외부 호출 확인
   - 테스트 가능한 단위 식별

2. **테스트 케이스 설계**
   - 정상 케이스 (Happy Path)
   - 엣지 케이스 (Boundary Conditions)
   - 에러 케이스 (Error Handling)

3. **테스트 코드 생성**
   - Jest 테스트 스위트 작성
   - Mock/Stub 설정
   - Assertion 구현

4. **검증**
   - 생성된 테스트 실행
   - 커버리지 확인
   - 필요시 추가 테스트 작성

## 테스트 유형

### 1. 단위 테스트 (Unit Test)
**대상:**
- 개별 함수/메서드
- 비즈니스 로직
- 유틸리티 함수

**프로젝트 예시:**
```javascript
// backend/src/services/sentimentService.test.js
describe('sentimentService', () => {
  describe('analyzeSentiment', () => {
    test('긍정 키워드가 포함된 제목은 양수 점수 반환', () => {
      const title = 'Bitcoin price surges to new high';
      const score = analyzeSentiment(title);
      expect(score).toBeGreaterThan(0);
    });

    test('부정 키워드가 포함된 제목은 음수 점수 반환', () => {
      const title = 'Ethereum crash continues';
      const score = analyzeSentiment(title);
      expect(score).toBeLessThan(0);
    });

    test('키워드가 없는 제목은 0 반환', () => {
      const title = 'Cryptocurrency market update';
      const score = analyzeSentiment(title);
      expect(score).toBe(0);
    });
  });

  describe('calculateTrend', () => {
    test('점수 > 0.15는 UP 트렌드', () => {
      const trend = calculateTrend(0.5);
      expect(trend).toBe('UP');
    });

    test('점수 < -0.15는 DOWN 트렌드', () => {
      const trend = calculateTrend(-0.3);
      expect(trend).toBe('DOWN');
    });

    test('-0.15 <= 점수 <= 0.15는 NEUTRAL', () => {
      const trend = calculateTrend(0.1);
      expect(trend).toBe('NEUTRAL');
    });
  });
});
```

### 2. 통합 테스트 (Integration Test)
**대상:**
- API 엔드포인트
- 데이터베이스 작업
- 외부 서비스 연동

**프로젝트 예시:**
```javascript
// backend/src/routes/news.test.js
const request = require('supertest');
const app = require('../server');

describe('News API', () => {
  test('GET /api/news - 뉴스 목록 반환', async () => {
    const response = await request(app)
      .get('/api/news?coin=btc&limit=10')
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeLessThanOrEqual(10);
    expect(response.body[0]).toHaveProperty('title');
    expect(response.body[0]).toHaveProperty('sentiment');
  });

  test('GET /api/news - 잘못된 코인 파라미터는 400 반환', async () => {
    const response = await request(app)
      .get('/api/news?coin=invalid')
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });

  test('POST /api/news/refresh - 뉴스 갱신 성공', async () => {
    const response = await request(app)
      .post('/api/news/refresh')
      .expect(200);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('refreshed');
  });
});
```

### 3. React 컴포넌트 테스트
**대상:**
- 컴포넌트 렌더링
- 사용자 인터랙션
- Props 변경 시 동작

**프로젝트 예시:**
```javascript
// frontend/src/components/PriceCard.test.js
import { render, screen } from '@testing-library/react';
import PriceCard from './PriceCard';

describe('PriceCard', () => {
  const mockData = {
    name: 'Bitcoin',
    symbol: 'BTC',
    price: 50000,
    change24h: 5.2,
    trend: 'UP'
  };

  test('가격 정보를 올바르게 표시', () => {
    render(<PriceCard {...mockData} />);

    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.getByText('$50,000')).toBeInTheDocument();
    expect(screen.getByText('+5.2%')).toBeInTheDocument();
  });

  test('양수 변동률은 녹색으로 표시', () => {
    render(<PriceCard {...mockData} />);

    const changeElement = screen.getByText('+5.2%');
    expect(changeElement).toHaveClass('positive');
  });

  test('음수 변동률은 빨간색으로 표시', () => {
    const negativeData = { ...mockData, change24h: -3.5 };
    render(<PriceCard {...negativeData} />);

    const changeElement = screen.getByText('-3.5%');
    expect(changeElement).toHaveClass('negative');
  });

  test('UP 트렌드는 상승 화살표 표시', () => {
    render(<PriceCard {...mockData} />);
    expect(screen.getByText('↑')).toBeInTheDocument();
  });
});
```

### 4. 데이터베이스 테스트
**대상:**
- CRUD 작업
- 쿼리 로직
- 트랜잭션 처리

**프로젝트 예시:**
```javascript
// backend/src/models/newsModel.test.js
const newsModel = require('./newsModel');
const db = require('../config/database');

describe('newsModel', () => {
  beforeEach(async () => {
    // 테스트용 임시 데이터베이스 설정
    await db.run('DELETE FROM news');
  });

  test('saveNews - 뉴스 저장 성공', async () => {
    const newsData = {
      external_id: 'test123',
      title: 'Test News',
      url: 'https://example.com',
      published_at: new Date().toISOString(),
      source: 'Test Source',
      coins: JSON.stringify(['BTC']),
      sentiment: 'positive'
    };

    const result = await newsModel.saveNews(newsData);
    expect(result).toHaveProperty('id');
  });

  test('getNewsByCoin - 특정 코인 뉴스 조회', async () => {
    // 테스트 데이터 삽입
    await newsModel.saveNews({
      external_id: 'btc1',
      title: 'Bitcoin News',
      coins: JSON.stringify(['BTC'])
    });
    await newsModel.saveNews({
      external_id: 'eth1',
      title: 'Ethereum News',
      coins: JSON.stringify(['ETH'])
    });

    const btcNews = await newsModel.getNewsByCoin('BTC', 10);
    expect(btcNews.length).toBe(1);
    expect(btcNews[0].title).toBe('Bitcoin News');
  });
});
```

## 옵션

- `--unit` - 단위 테스트만 실행
- `--integration` - 통합 테스트만 실행
- `--e2e` - E2E 테스트만 실행
- `--watch` - 파일 변경 감지 모드
- `--coverage` - 코드 커버리지 리포트 생성
- `--verbose` - 상세 출력 모드
- `--bail` - 첫 실패 시 중단
- `--write` - 테스트 코드 작성 모드

## 예시

### 예시 1: 전체 테스트 실행
```bash
/test
```

**결과:**
```
Running tests...

 PASS  backend/src/services/sentimentService.test.js
 PASS  backend/src/routes/news.test.js
 PASS  frontend/src/components/PriceCard.test.js
 FAIL  frontend/src/components/Dashboard.test.js
   ● Dashboard › 30초마다 가격 갱신

Test Suites: 3 passed, 1 failed, 4 total
Tests:       15 passed, 1 failed, 16 total
Time:        4.523s

Failed Test:
- Dashboard.test.js:45 - 타이머 모킹 필요
```

### 예시 2: 커버리지 포함 실행
```bash
/test --coverage
```

**결과:**
```
--------------------------|---------|----------|---------|---------|
File                      | % Stmts | % Branch | % Funcs | % Lines |
--------------------------|---------|----------|---------|---------|
services/
  sentimentService.js     |   95.23 |    88.88 |     100 |   94.44 |
  coinGeckoService.js     |   78.57 |    66.66 |   83.33 |   77.77 |
routes/
  news.js                 |   100   |    100   |     100 |     100 |
  prices.js               |   85.71 |    75.00 |     100 |   85.71 |
--------------------------|---------|----------|---------|---------|
All files                 |   89.21 |    82.50 |   95.65 |   88.88 |
--------------------------|---------|----------|---------|---------|

Coverage threshold:
- Statements: 89.21% (목표: 80%) ✓
- Functions: 95.65% (목표: 80%) ✓
```

### 예시 3: 테스트 코드 작성
```bash
/test --write backend/src/services/coinGeckoService.js
```

**결과:**
```
Analyzing coinGeckoService.js...

발견된 함수:
- getPrices(coinIds)
- getSinglePrice(coinId)
- formatPriceData(rawData)

테스트 케이스 생성 중...

✓ coinGeckoService.test.js 생성 완료
  - 6개 테스트 케이스 작성
  - Mock 설정 포함
  - 에러 처리 테스트 포함

테스트 실행 결과:
 PASS  backend/src/services/coinGeckoService.test.js
   ✓ getPrices - 여러 코인 가격 조회 (52ms)
   ✓ getPrices - API 에러 시 예외 발생 (28ms)
   ✓ getSinglePrice - 단일 코인 가격 조회 (15ms)
   ✓ formatPriceData - 데이터 포맷 변환 (8ms)
   ...
```

### 예시 4: Watch 모드
```bash
/test --watch
```

**결과:**
```
Watch mode enabled. Press 'q' to quit.

Watching for file changes...

File changed: backend/src/services/sentimentService.js
Re-running related tests...

 PASS  backend/src/services/sentimentService.test.js

Tests: 8 passed, 8 total
```

## 주의사항

1. **독립성 유지**
   - 각 테스트는 독립적으로 실행 가능해야 함
   - 테스트 간 의존성 금지
   - 실행 순서에 무관하게 동작

2. **Mock 사용**
   - 외부 API 호출은 Mock 처리
   - 데이터베이스는 테스트용 DB 사용
   - 시간 의존적 코드는 Jest의 타이머 Mock 활용

3. **테스트 데이터 정리**
   - `beforeEach`로 초기화
   - `afterEach`로 정리
   - 테스트 격리 보장

4. **의미있는 테스트**
   - 구현이 아닌 동작을 테스트
   - 엣지 케이스 포함
   - 실패 시나리오 테스트

5. **커버리지 목표**
   - 최소 80% 이상 유지
   - 핵심 비즈니스 로직은 100%
   - 커버리지보다 품질 우선

## 테스트 작성 가이드

### AAA 패턴
```javascript
test('설명', () => {
  // Arrange (준비)
  const input = 'test data';
  const expected = 'expected result';

  // Act (실행)
  const result = functionToTest(input);

  // Assert (검증)
  expect(result).toBe(expected);
});
```

### Given-When-Then 패턴
```javascript
test('사용자가 뉴스를 요청하면 최신 10개 반환', async () => {
  // Given: 데이터베이스에 15개 뉴스 존재
  await seedNews(15);

  // When: 10개 뉴스 요청
  const response = await request(app).get('/api/news?limit=10');

  // Then: 10개 뉴스 반환
  expect(response.body.length).toBe(10);
});
```

## Mock 예시

### API Mock
```javascript
jest.mock('../services/coinGeckoService');

coinGeckoService.getPrices.mockResolvedValue({
  bitcoin: { usd: 50000, usd_24h_change: 5.2 },
  ethereum: { usd: 3000, usd_24h_change: -2.1 }
});
```

### 데이터베이스 Mock
```javascript
jest.mock('../config/database');

db.all.mockResolvedValue([
  { id: 1, title: 'Test News 1' },
  { id: 2, title: 'Test News 2' }
]);
```

### 시간 Mock
```javascript
jest.useFakeTimers();

// 30초 후 실행되는 코드 테스트
jest.advanceTimersByTime(30000);

jest.useRealTimers();
```

## 프로젝트 특화 테스트

### sentimentService.js 테스트
```javascript
// 핵심 알고리즘 검증
test('트렌드 임계값 정확성', () => {
  expect(calculateTrend(0.15)).toBe('NEUTRAL');  // 경계값
  expect(calculateTrend(0.151)).toBe('UP');
  expect(calculateTrend(-0.15)).toBe('NEUTRAL'); // 경계값
  expect(calculateTrend(-0.151)).toBe('DOWN');
});
```

### Dashboard.js 테스트
```javascript
// 자동 갱신 테스트
test('30초마다 가격 갱신', () => {
  jest.useFakeTimers();
  render(<Dashboard />);

  expect(fetchPrices).toHaveBeenCalledTimes(1);

  jest.advanceTimersByTime(30000);
  expect(fetchPrices).toHaveBeenCalledTimes(2);

  jest.useRealTimers();
});
```

## 관련 명령어

- `/refactor` - 테스트 가능한 코드로 리팩토링
- `/git-commit` - 테스트 통과 후 커밋
- `npm test` - 직접 Jest 실행
- `npm run test:watch` - Watch 모드로 실행
