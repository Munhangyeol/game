# React UI 컴포넌트 작성

## 설명
React 함수형 컴포넌트와 UI 요소를 생성하는 스킬입니다. Hooks, 이벤트 처리, API 연동, 스타일링을 포함한 완전한 프론트엔드 컴포넌트를 작성합니다.

## 사용법
```bash
/frontend-ui [컴포넌트명]
```

옵션 지정:
```bash
/frontend-ui PriceCard --with-state       # 상태 관리 포함
/frontend-ui NewsFeed --with-api          # API 호출 포함
/frontend-ui TrendChart --with-style      # 스타일링 포함
```

## 🎨 미니멀 디자인 원칙

### 1. 레이아웃
- **중앙 정렬**: 최대 너비 제한 (max-width: 1200px)
- **넉넉한 여백**: 충분한 padding과 margin
- **공간감**: 요소 간 간격 최소 16px
- **그리드**: 명확하고 예측 가능한 레이아웃
- **반응형**: 모바일 우선 접근

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}
```

### 2. 컬러 팔레트

**라이트 모드 (기본):**
```css
:root {
  /* 배경 */
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --bg-tertiary: #e9ecef;

  /* 텍스트 */
  --text-primary: #212529;
  --text-secondary: #6c757d;
  --text-tertiary: #adb5bd;

  /* 주요 색상 - 블루/그레이 */
  --color-primary: #4a90e2;
  --color-primary-light: #6ba3e8;
  --color-primary-dark: #3a7bc8;

  /* 상태 색상 */
  --color-success: #10b981;
  --color-danger: #ef4444;
  --color-warning: #f59e0b;

  /* 테두리 & 그림자 */
  --border-color: #dee2e6;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 30px rgba(0, 0, 0, 0.12);
}
```

### 3. 타이포그래피

**폰트 선택:**
```css
:root {
  --font-primary: -apple-system, BlinkMacSystemFont, 'Inter', 'SF Pro Display',
                  'Segoe UI', 'Roboto', sans-serif;
  --font-mono: 'SF Mono', 'Monaco', 'Consolas', monospace;
}
```

**크기 체계:**
```css
/* 제목 */
h1 { font-size: 36px; font-weight: 700; line-height: 1.2; }
h2 { font-size: 28px; font-weight: 600; line-height: 1.3; }
h3 { font-size: 22px; font-weight: 600; line-height: 1.4; }

/* 본문 */
body { font-size: 16px; line-height: 1.6; }
small { font-size: 14px; line-height: 1.5; }

/* 가독성 */
p { margin-bottom: 16px; }
```

### 4. 카드 디자인

```css
.card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}
```

### 5. 버튼 스타일

```css
.button {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.button-primary {
  background: var(--color-primary);
  color: white;
}

.button-primary:hover {
  background: var(--color-primary-dark);
  transform: scale(1.02);
}

.button-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}
```

### 6. 인터랙션

**호버 효과:**
```css
/* 부드러운 전환 */
.interactive {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.interactive:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* 링크 */
a {
  color: var(--color-primary);
  text-decoration: none;
  transition: color 0.2s ease;
}

a:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
}
```

**마이크로 애니메이션:**
```css
/* 페이드 인 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.4s ease-out;
}

/* 로딩 스피너 */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--bg-tertiary);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
```

## 컴포넌트 패턴

### 프레젠테이셔널 컴포넌트 예시

```javascript
import React from 'react';
import './PriceCard.css';

function PriceCard({ name, symbol, price, change24h }) {
  const isPositive = change24h >= 0;

  return (
    <div className="price-card">
      <div className="card-header">
        <h3>{name}</h3>
        <span className="symbol">{symbol}</span>
      </div>

      <div className="card-body">
        <div className="price">
          ${price.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </div>

        <div className={`change ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? '+' : ''}{change24h.toFixed(2)}%
        </div>
      </div>
    </div>
  );
}

export default PriceCard;
```

```css
.price-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.price-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-4px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.symbol {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  padding: 4px 10px;
  border-radius: 6px;
}

.price {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
  font-variant-numeric: tabular-nums;
}

.change {
  font-size: 16px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.change.positive {
  color: var(--color-success);
}

.change.negative {
  color: var(--color-danger);
}
```

### 컨테이너 컴포넌트 예시

```javascript
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import PriceCard from './PriceCard';
import './Dashboard.css';

function Dashboard() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await api.getPrices();
        setPrices(response.data);
      } catch (error) {
        console.error('가격 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>데이터를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>암호화폐 가격 대시보드</h1>
        <p>실시간 가격 및 트렌드 분석</p>
      </header>

      <div className="price-grid">
        {prices.map(coin => (
          <PriceCard
            key={coin.id}
            name={coin.name}
            symbol={coin.symbol}
            price={coin.current_price}
            change24h={coin.price_change_percentage_24h}
          />
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
```

## 접근성 (A11y)

```css
/* 포커스 표시 */
*:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* 스킵 네비게이션 */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--color-primary);
  color: white;
  padding: 8px;
  text-decoration: none;
}

.skip-link:focus {
  top: 0;
}
```

## 반응형 디자인

```css
/* 모바일 우선 */
.container {
  padding: 16px;
}

.grid {
  grid-template-columns: 1fr;
  gap: 16px;
}

/* 태블릿 */
@media (min-width: 768px) {
  .container {
    padding: 32px;
  }

  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

/* 데스크톱 */
@media (min-width: 1024px) {
  .container {
    padding: 40px;
  }

  .grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
}
```

## 체크리스트

컴포넌트 생성 시 확인사항:
- [ ] 깔끔한 화이트 배경 사용
- [ ] 넉넉한 여백 (최소 16px)
- [ ] 라운드 처리된 모서리 (8-12px)
- [ ] 부드러운 그림자 효과
- [ ] Inter 또는 시스템 폰트 사용
- [ ] 명확한 텍스트 계층 구조
- [ ] 호버 효과 (부드러운 전환)
- [ ] 반응형 레이아웃
- [ ] 접근성 고려 (포커스, ARIA)

## 관련 명령어

- `/test --write [컴포넌트]` - 컴포넌트 테스트 작성
- `/refactor [컴포넌트]` - 컴포넌트 리팩토링
- `/git-commit` - 컴포넌트 작성 후 커밋
