# MSTR MNAV Pro Tracker 📊

**업그레이드된 프로 버전** - MicroStrategy(MSTR)의 순자산가치를 실시간 분석하고 투자 의사결정을 돕는 고급 웹 앱

## 🚀 새로운 기능 (Pro)

### 1. **실시간 탭**
- BTC & MSTR 실시간 가격
- MNAV 자동 계산 (희석주식수 포함)
- 프리미엄/디스카운트 분석
- 매매 신호 제공

### 2. **계산기 탭** 💰
- **BTC 가격 → MSTR 예측**: BTC가 특정 가격이 되면 MSTR은?
- **MSTR 목표가 → 필요 BTC**: MSTR이 특정 가격이 되려면 BTC는?
- **적정가 분석**: 다양한 프리미엄 시나리오별 적정가 테이블

### 3. **차트 탭** 📈
- **프리미엄 추이 그래프**: 7일/1개월/3개월/1년
- **가격 비교 차트**: BTC vs MSTR 이중 축 차트
- **통계 대시보드**: 평균/최고/최저 프리미엄, 변동성

## 📱 설치 방법

### 1. GitHub Pages에 배포

1. GitHub 저장소 생성 (예: `mstr-pro`)
2. 모든 파일 업로드:
   - index.html
   - style.css
   - script.js
   - manifest.json
   - icon-192.png
   - icon-512.png

3. GitHub Pages 설정:
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: main, / (root)
   - Save

4. 5-10분 후 접속: `https://[username].github.io/mstr-pro/`

### 2. 모바일 홈화면에 추가

**iOS (Safari):**
1. 사이트 접속
2. 공유 버튼 클릭
3. "홈 화면에 추가"

**Android (Chrome):**
1. 사이트 접속
2. 메뉴 → "홈 화면에 추가"

## 💡 주요 사용법

### 실시간 모니터링
- 앱을 열면 자동으로 최신 데이터 로드
- 1분마다 자동 새로고침
- 프리미엄이 30% 이상: 🔴 매도 고려
- 디스카운트 -10% 이하: 🟢 매수 고려

### 계산기 활용
**예시 1**: "BTC가 $120,000이 되면 MSTR은?"
1. 계산기 탭 열기
2. BTC 가격에 120000 입력
3. 예상 프리미엄 50% 입력
4. 계산하기 → 예상 MSTR 가격 확인

**예시 2**: "MSTR $500 달성하려면 BTC는?"
1. 두 번째 계산기
2. 목표 MSTR 가격 500 입력
3. 프리미엄 50% 가정
4. 계산하기 → 필요한 BTC 가격 확인

### 차트 분석
- 차트 탭에서 과거 추이 확인
- 기간 버튼(7일/1개월/3개월/1년) 클릭
- 프리미엄 평균이 높으면 과열
- 프리미엄이 낮아지는 추세면 매수 기회

## 📊 MNAV 계산 방식

```
희석주식수 사용 (더 보수적):
MNAV = (BTC 보유량 × BTC 가격) / 희석주식수

프리미엄 = ((MSTR 가격 - MNAV) / MNAV) × 100
```

### 현재 설정:
- **BTC 보유량**: 444,262 BTC (2025년 1월 기준)
- **희석주식수**: 253M (전환사채 포함)
- **기본주식수**: 239.5M

## 🔄 데이터 업데이트

### MSTR BTC 보유량 업데이트 (중요!)

MSTR은 주기적으로 BTC 매수를 발표합니다. 최신 보유량으로 업데이트하세요:

1. `script.js` 파일 열기
2. 상단 `MSTR_DATA` 수정:

```javascript
const MSTR_DATA = {
    btcHoldings: 444262, // 최신 보유량 입력
    sharesOutstanding: 239.5,
    dilutedShares: 253.0, // 희석주식수
    useDiluted: true // true: 희석주식수 사용 (추천)
};
```

3. 저장 후 GitHub에 푸시

### 데이터 출처 확인:
- [MicroStrategy 공식 발표](https://www.strategy.com/)
- [Bitcoin Treasuries](https://bitcointreasuries.net/)
- [MSTR Investor Relations](https://www.microstrategy.com/en/investor-relations)

## 📈 과거 데이터 관리

- 앱은 자동으로 과거 데이터를 로컬에 저장
- 최근 365일 데이터 유지
- 브라우저 LocalStorage 사용
- 처음 사용 시 샘플 데이터 자동 생성

## 🎯 프리미엄 해석 가이드

| 프리미엄 범위 | 의미 | 투자 액션 |
|-------------|------|---------|
| +75% 이상 | 심각한 고평가 | 🔴 강력 매도 |
| +50~75% | 고평가 | 🔴 매도 고려 |
| +30~50% | 과열 | 🟡 비중 축소 |
| +10~30% | 적정 프리미엄 | 🟡 관망 |
| -10~+10% | 공정가치 | 🟡 중립 |
| -10~-20% | 저평가 | 🟢 매수 고려 |
| -20% 이하 | 심각한 저평가 | 🟢 강력 매수 |

**참고**: 역사적으로 MSTR은 +30~70% 프리미엄에서 거래되는 경우가 많음

## 🔧 고급 설정

### 자동 새로고침 간격 변경
`script.js`에서:
```javascript
autoRefreshInterval = setInterval(loadData, 60000); // 60000 = 1분
```

### 차트 색상 커스터마이징
`style-pro.css`에서 색상 변수 수정

## ⚠️ 중요 고지사항

1. **투자 조언 아님**: 이 앱은 정보 제공 목적이며 투자 조언이 아닙니다
2. **데이터 정확성**: API 제공업체의 데이터 지연이 있을 수 있습니다
3. **MNAV 제한사항**: 
   - BTC 자산만 고려 (부채, 운영비용 제외)
   - 간단한 계산 모델
   - 실제 내재가치는 더 복잡함
4. **수동 업데이트 필요**: BTC 보유량은 직접 업데이트 필요

## 🛠 문제 해결

### "데이터를 불러오는데 실패했습니다"
- 인터넷 연결 확인
- API 서비스 상태 확인 (CoinGecko, Yahoo Finance)
- 브라우저 콘솔(F12)에서 에러 확인

### 차트가 안 보임
- Chart.js CDN 로딩 확인
- 과거 데이터 있는지 확인 (LocalStorage)
- 차트 탭 클릭해서 강제 렌더링

### 계산기 결과가 이상함
- 입력값 확인
- MSTR_DATA의 BTC 보유량 최신인지 확인

## 📝 업데이트 로그

**v2.0 (Pro) - 2025년 2월**
- ✅ 3개 탭 UI (실시간/계산기/차트)
- ✅ BTC→MSTR 가격 예측 계산기
- ✅ MSTR→BTC 역계산 기능
- ✅ 적정가 시나리오 분석
- ✅ 프리미엄 추이 차트
- ✅ BTC vs MSTR 비교 차트
- ✅ 통계 대시보드
- ✅ 과거 데이터 저장 (LocalStorage)
- ✅ 희석주식수 포함 MNAV 계산

**v1.0 - 2025년 2월**
- 기본 실시간 가격 조회
- 단순 MNAV 계산
- 매매 신호

## 🚀 향후 개발 계획

- [ ] 알림 기능 (특정 프리미엄 도달 시)
- [ ] 포트폴리오 추적
- [ ] 다른 BTC 관련 주식 비교 (COIN, RIOT)
- [ ] 백테스팅 도구
- [ ] 실시간 Strategy.com 스크래핑
- [ ] 더 정교한 MNAV 모델 (부채 포함)

## 💬 피드백

버그 리포트나 기능 제안은 GitHub Issues로 부탁드립니다!

---

Made with ❤️ for MSTR investors
