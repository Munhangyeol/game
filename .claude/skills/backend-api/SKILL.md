# Express API 엔드포인트 작성

## 설명
RESTful API 엔드포인트를 작성하는 스킬입니다. Express 라우트, 서비스 레이어, 데이터 모델을 포함한 완전한 백엔드 API를 구현합니다.

## 사용법
```bash
/backend-api [엔드포인트명 또는 리소스명]
```

옵션 지정:
```bash
/backend-api prices --method=GET           # GET 엔드포인트만
/backend-api news --with-validation        # 요청 검증 포함
/backend-api trends --with-service         # 서비스 레이어 포함
/backend-api alerts --with-model           # 데이터 모델 포함
```

## 동작 과정

1. **요구사항 분석**
   - API 목적과 기능 파악
   - HTTP 메서드 결정 (GET/POST/PUT/DELETE)
   - 요청/응답 데이터 구조 설계
   - 비즈니스 로직 식별

2. **아키텍처 설계**
   - 레이어 분리 (Route → Service → Model)
   - 서비스 로직 설계
   - 데이터베이스 스키마 확인
   - 에러 처리 전략

3. **코드 생성**
   - 라우트 파일 생성
   - 서비스 레이어 구현
   - 데이터 모델 작성
   - 유효성 검증 미들웨어

4. **통합**
   - server.js에 라우트 등록
   - CORS 설정
   - 에러 핸들링 적용

## API 아키텍처 패턴

### 3-Layer 아키텍처

```
┌─────────────────┐
│   Route Layer   │  → 요청/응답 처리
│  (routes/*.js)  │     파라미터 검증
└────────┬────────┘     HTTP 상태 코드
         │
┌────────▼────────┐
│  Service Layer  │  → 비즈니스 로직
│ (services/*.js) │     외부 API 호출
└────────┬────────┘     데이터 가공
         │
┌────────▼────────┐
│   Model Layer   │  → 데이터베이스 작업
│  (models/*.js)  │     CRUD 작업
└─────────────────┘     쿼리 실행
```

### 1. Route Layer (라우트 레이어)

**역할:**
- HTTP 요청 수신
- 파라미터 추출 및 검증
- 서비스 레이어 호출
- HTTP 응답 반환

**예시:**
```javascript
// backend/src/routes/prices.js
const express = require('express');
const router = express.Router();
const coinGeckoService = require('../services/coinGeckoService');

/**
 * GET /api/prices
 * 여러 코인의 현재 가격 조회
 */
router.get('/', async (req, res) => {
  try {
    const coinIds = ['bitcoin', 'ethereum', 'solana'];
    const prices = await coinGeckoService.getPrices(coinIds);

    res.json({
      success: true,
      data: prices,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('가격 조회 실패:', error);
    res.status(500).json({
      success: false,
      error: '가격 정보를 불러오는데 실패했습니다.'
    });
  }
});

/**
 * GET /api/prices/:coinId
 * 특정 코인의 가격 조회
 */
router.get('/:coinId', async (req, res) => {
  try {
    const { coinId } = req.params;

    // 유효성 검증
    const validCoins = ['bitcoin', 'ethereum', 'solana'];
    if (!validCoins.includes(coinId)) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 코인 ID입니다.'
      });
    }

    const price = await coinGeckoService.getSinglePrice(coinId);

    res.json({
      success: true,
      data: price
    });
  } catch (error) {
    console.error(`${req.params.coinId} 가격 조회 실패:`, error);
    res.status(500).json({
      success: false,
      error: '가격 조회에 실패했습니다.'
    });
  }
});

module.exports = router;
```

### 2. Service Layer (서비스 레이어)

**역할:**
- 핵심 비즈니스 로직
- 외부 API 호출
- 데이터 가공 및 변환
- 복잡한 계산

**예시:**
```javascript
// backend/src/services/coinGeckoService.js
const axios = require('axios');

const COINGECKO_API_URL = process.env.COINGECKO_API_URL || 'https://api.coingecko.com/api/v3';

/**
 * 여러 코인의 가격 정보 조회
 * @param {string[]} coinIds - 코인 ID 배열
 * @returns {Promise<Object[]>} 가격 정보 배열
 */
async function getPrices(coinIds) {
  try {
    const ids = coinIds.join(',');
    const url = `${COINGECKO_API_URL}/simple/price`;

    const response = await axios.get(url, {
      params: {
        ids: ids,
        vs_currencies: 'usd',
        include_24hr_change: true,
        include_market_cap: true
      }
    });

    // 데이터 포맷 변환
    return Object.entries(response.data).map(([id, data]) => ({
      id,
      current_price: data.usd,
      price_change_percentage_24h: data.usd_24h_change,
      market_cap: data.usd_market_cap
    }));
  } catch (error) {
    console.error('CoinGecko API 호출 실패:', error);
    throw new Error('가격 데이터를 가져오는데 실패했습니다.');
  }
}

/**
 * 단일 코인의 상세 가격 정보 조회
 */
async function getSinglePrice(coinId) {
  try {
    const url = `${COINGECKO_API_URL}/coins/${coinId}`;

    const response = await axios.get(url, {
      params: {
        localization: false,
        tickers: false,
        community_data: false,
        developer_data: false
      }
    });

    const coin = response.data;

    return {
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      current_price: coin.market_data.current_price.usd,
      price_change_24h: coin.market_data.price_change_24h,
      price_change_percentage_24h: coin.market_data.price_change_percentage_24h,
      market_cap: coin.market_data.market_cap.usd,
      total_volume: coin.market_data.total_volume.usd,
      high_24h: coin.market_data.high_24h.usd,
      low_24h: coin.market_data.low_24h.usd
    };
  } catch (error) {
    console.error(`${coinId} 상세 정보 조회 실패:`, error);
    throw new Error('코인 정보를 가져오는데 실패했습니다.');
  }
}

module.exports = {
  getPrices,
  getSinglePrice
};
```

### 3. Model Layer (모델 레이어)

**역할:**
- 데이터베이스 CRUD 작업
- SQL 쿼리 실행
- 데이터 검증

**예시:**
```javascript
// backend/src/models/newsModel.js
const db = require('../config/database');

/**
 * 뉴스 저장
 */
async function saveNews(newsData) {
  const query = `
    INSERT INTO news (
      external_id, title, url, published_at,
      source, coins, sentiment
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    newsData.external_id,
    newsData.title,
    newsData.url,
    newsData.published_at,
    newsData.source,
    JSON.stringify(newsData.coins),
    newsData.sentiment
  ];

  try {
    const result = await db.run(query, params);
    return { id: result.lastID, ...newsData };
  } catch (error) {
    // 중복 키 에러 무시 (이미 존재하는 뉴스)
    if (error.code === 'SQLITE_CONSTRAINT') {
      console.log(`중복 뉴스 무시: ${newsData.external_id}`);
      return null;
    }
    throw error;
  }
}

/**
 * 특정 코인의 뉴스 조회
 */
async function getNewsByCoin(coin, limit = 10) {
  const query = `
    SELECT * FROM news
    WHERE coins LIKE ?
    ORDER BY published_at DESC
    LIMIT ?
  `;

  const coinPattern = `%"${coin}"%`;

  try {
    const rows = await db.all(query, [coinPattern, limit]);

    // JSON 문자열을 배열로 파싱
    return rows.map(row => ({
      ...row,
      coins: JSON.parse(row.coins)
    }));
  } catch (error) {
    console.error('뉴스 조회 실패:', error);
    throw error;
  }
}

/**
 * 최근 뉴스 조회
 */
async function getRecentNews(hours = 24, limit = 50) {
  const query = `
    SELECT * FROM news
    WHERE published_at >= datetime('now', '-${hours} hours')
    ORDER BY published_at DESC
    LIMIT ?
  `;

  try {
    const rows = await db.all(query, [limit]);
    return rows.map(row => ({
      ...row,
      coins: JSON.parse(row.coins)
    }));
  } catch (error) {
    console.error('최근 뉴스 조회 실패:', error);
    throw error;
  }
}

/**
 * 뉴스 삭제 (오래된 데이터 정리)
 */
async function deleteOldNews(days = 30) {
  const query = `
    DELETE FROM news
    WHERE published_at < datetime('now', '-${days} days')
  `;

  try {
    const result = await db.run(query);
    console.log(`${result.changes}개의 오래된 뉴스 삭제`);
    return result.changes;
  } catch (error) {
    console.error('뉴스 삭제 실패:', error);
    throw error;
  }
}

module.exports = {
  saveNews,
  getNewsByCoin,
  getRecentNews,
  deleteOldNews
};
```

## HTTP 메서드별 구현

### GET - 조회
```javascript
// 목록 조회
router.get('/news', async (req, res) => {
  const { coin, limit = 10 } = req.query;
  const news = await newsService.getNews(coin, limit);
  res.json(news);
});

// 단일 조회
router.get('/news/:id', async (req, res) => {
  const news = await newsService.getNewsById(req.params.id);
  if (!news) {
    return res.status(404).json({ error: '뉴스를 찾을 수 없습니다.' });
  }
  res.json(news);
});
```

### POST - 생성
```javascript
router.post('/news', async (req, res) => {
  try {
    // 요청 바디 검증
    const { title, url, source } = req.body;

    if (!title || !url) {
      return res.status(400).json({
        error: '필수 필드가 누락되었습니다.'
      });
    }

    const news = await newsService.createNews(req.body);
    res.status(201).json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### PUT/PATCH - 수정
```javascript
router.put('/news/:id', async (req, res) => {
  try {
    const updated = await newsService.updateNews(req.params.id, req.body);

    if (!updated) {
      return res.status(404).json({ error: '뉴스를 찾을 수 없습니다.' });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### DELETE - 삭제
```javascript
router.delete('/news/:id', async (req, res) => {
  try {
    const deleted = await newsService.deleteNews(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: '뉴스를 찾을 수 없습니다.' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## 미들웨어

### 유효성 검증 미들웨어
```javascript
// backend/src/middleware/validation.js

function validateCoinId(req, res, next) {
  const validCoins = ['bitcoin', 'ethereum', 'solana', 'btc', 'eth', 'sol'];
  const coin = req.query.coin || req.params.coin;

  if (coin && !validCoins.includes(coin.toLowerCase())) {
    return res.status(400).json({
      error: '유효하지 않은 코인입니다.',
      validCoins: validCoins
    });
  }

  next();
}

function validatePagination(req, res, next) {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;

  if (limit < 1 || limit > 100) {
    return res.status(400).json({
      error: 'limit은 1-100 사이여야 합니다.'
    });
  }

  if (offset < 0) {
    return res.status(400).json({
      error: 'offset은 0 이상이어야 합니다.'
    });
  }

  req.pagination = { limit, offset };
  next();
}

module.exports = {
  validateCoinId,
  validatePagination
};
```

**사용 예시:**
```javascript
const { validateCoinId, validatePagination } = require('../middleware/validation');

router.get('/news', validateCoinId, validatePagination, async (req, res) => {
  const { limit, offset } = req.pagination;
  // ...
});
```

### 에러 핸들링 미들웨어
```javascript
// backend/src/middleware/errorHandler.js

function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // 운영 환경에서는 상세 에러 숨김
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(err.status || 500).json({
    success: false,
    error: err.message || '서버 에러가 발생했습니다.',
    ...(isDevelopment && { stack: err.stack })
  });
}

module.exports = errorHandler;
```

## 옵션

- `--method=GET` - GET 엔드포인트만 생성
- `--method=POST` - POST 엔드포인트만 생성
- `--with-validation` - 유효성 검증 포함
- `--with-service` - 서비스 레이어 생성
- `--with-model` - 데이터 모델 생성
- `--with-test` - API 테스트 생성
- `--crud` - CRUD 전체 엔드포인트 생성

## 예시

### 예시 1: 간단한 GET 엔드포인트
```bash
/backend-api health --method=GET
```

**결과:**
```javascript
// routes/health.js
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

### 예시 2: CRUD 전체 생성
```bash
/backend-api alerts --crud --with-service --with-model
```

**결과:**
```
✓ routes/alerts.js 생성 (CRUD 엔드포인트)
✓ services/alertService.js 생성
✓ models/alertModel.js 생성
✓ server.js에 라우트 등록

생성된 엔드포인트:
- GET    /api/alerts
- GET    /api/alerts/:id
- POST   /api/alerts
- PUT    /api/alerts/:id
- DELETE /api/alerts/:id
```

## 주의사항

### 1. HTTP 상태 코드
```javascript
// 성공
200 OK          // 일반 성공
201 Created     // 생성 성공
204 No Content  // 삭제 성공

// 클라이언트 에러
400 Bad Request      // 잘못된 요청
401 Unauthorized     // 인증 필요
403 Forbidden        // 권한 없음
404 Not Found        // 리소스 없음

// 서버 에러
500 Internal Server Error  // 서버 에러
503 Service Unavailable    // 서비스 불가
```

### 2. 응답 형식 일관성
```javascript
// 성공 응답
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-02-05T12:00:00Z"
}

// 에러 응답
{
  "success": false,
  "error": "에러 메시지",
  "code": "ERROR_CODE"
}
```

### 3. 비동기 에러 처리
```javascript
// try-catch로 모든 비동기 작업 감싸기
router.get('/data', async (req, res) => {
  try {
    const data = await service.getData();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
```

### 4. CORS 설정
```javascript
// backend/src/server.js
const cors = require('cors');

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

### 5. Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100 // 최대 100 요청
});

app.use('/api/', limiter);
```

## 프로젝트 특화 API

### 감성 분석 API
```javascript
// routes/sentiment.js
router.get('/sentiment/:coin', async (req, res) => {
  try {
    const { coin } = req.params;
    const analysis = await sentimentService.analyzeCoin(coin);

    res.json({
      coin,
      trend: analysis.trend,
      score: analysis.score,
      breakdown: {
        positive: analysis.positive_count,
        negative: analysis.negative_count,
        neutral: analysis.neutral_count
      },
      analyzed_at: analysis.analyzed_at
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 자동 갱신 트리거
```javascript
// routes/refresh.js
router.post('/refresh/news', async (req, res) => {
  try {
    const result = await cryptoPanicService.refreshNews();

    res.json({
      message: '뉴스 갱신 완료',
      count: result.count,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: '뉴스 갱신 실패' });
  }
});
```

## 관련 명령어

- `/test --integration` - API 통합 테스트 실행
- `/refactor routes/` - 라우트 리팩토링
- `/git-commit` - API 작성 후 커밋
