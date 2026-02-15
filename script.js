// MSTR 데이터 (최근 공시 기준 - Strategy.com 참조)
const MSTR_DATA = {
    btcHoldings: 444262, // 2025년 1월 기준
    sharesOutstanding: 239.5, // 백만
    dilutedShares: 253.0, // 희석주식수 (백만)
    useDiluted: true
};

let autoRefreshInterval = null;
let premiumChart = null;
let priceChart = null;
let historicalData = [];

// 페이지 로드
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    setupTabs();
    setupCharts();
    loadHistoricalData();
    setupAutoRefresh();
});

// 탭 전환
function setupTabs() {
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            const targetId = tab.dataset.tab + '-tab';
            document.getElementById(targetId).classList.add('active');
            
            // 차트 탭 열 때 차트 업데이트
            if (tab.dataset.tab === 'history') {
                updateCharts(7);
            }
        });
    });
    
    // 차트 기간 버튼
    const periodBtns = document.querySelectorAll('.period-btn');
    periodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            periodBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const days = parseInt(btn.dataset.period);
            updateCharts(days);
        });
    });
}

// 데이터 로드
async function loadData() {
    const btn = document.getElementById('refreshBtn');
    btn.classList.add('loading');
    
    // 로딩 상태 표시
    document.getElementById('updateTime').textContent = '데이터 불러오는 중...';
    
    try {
        console.log('=== 데이터 로딩 시작 ===');
        console.log('시간:', new Date().toLocaleString());
        
        // BTC 데이터 가져오기
        console.log('1/2: BTC 가격 조회 중...');
        const btcData = await fetchBTCPrice();
        console.log('BTC 데이터:', btcData);
        
        // MSTR 데이터 가져오기
        console.log('2/2: MSTR 주가 조회 중...');
        const mstrData = await fetchMSTRPrice();
        console.log('MSTR 데이터:', mstrData);
        
        // 데이터 유효성 검증
        if (!btcData || !btcData.price || btcData.price <= 0) {
            throw new Error('BTC 데이터가 유효하지 않습니다');
        }
        
        if (!mstrData || !mstrData.price || mstrData.price <= 0) {
            throw new Error('MSTR 데이터가 유효하지 않습니다');
        }
        
        console.log('✅ 데이터 검증 완료');
        
        // 화면 업데이트
        console.log('화면 업데이트 중...');
        updateBTCDisplay(btcData);
        updateMSTRDisplay(mstrData);
        updateMNAVCalculation(btcData.price, mstrData.price);
        updateTradingSignal(btcData.price, mstrData.price);
        updateCalculatorDefaults(btcData.price, mstrData.price);
        
        // 과거 데이터 저장
        saveDataPoint(btcData.price, mstrData.price);
        
        // 업데이트 시간
        const now = new Date();
        document.getElementById('updateTime').textContent = 
            `마지막 업데이트: ${now.toLocaleTimeString('ko-KR')}`;
        
        console.log('=== ✅ 데이터 로딩 완료 ===');
        
    } catch (error) {
        console.error('❌ 데이터 로드 실패:', error);
        
        // 기본값으로 화면 업데이트
        console.log('⚠️ 기본값으로 폴백...');
        const defaultBtc = { price: 95000, change24h: 0 };
        const defaultMstr = { price: 350, change24h: 0 };
        
        updateBTCDisplay(defaultBtc);
        updateMSTRDisplay(defaultMstr);
        updateMNAVCalculation(defaultBtc.price, defaultMstr.price);
        updateTradingSignal(defaultBtc.price, defaultMstr.price);
        updateCalculatorDefaults(defaultBtc.price, defaultMstr.price);
        
        document.getElementById('updateTime').textContent = 
            '⚠️ API 연결 실패 - 기본값 사용 중';
        
        showError('API 연결 실패. 기본값을 사용합니다.\n새로고침 버튼을 눌러 재시도하세요.');
        
    } finally {
        btn.classList.remove('loading');
    }
}

// BTC 가격 조회 (CORS 프록시 사용)
async function fetchBTCPrice() {
    console.log('BTC 가격 조회 시작...');
    
    // 방법 1: CORS Proxy + CoinGecko
    try {
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const apiUrl = encodeURIComponent('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true');
        
        const response = await fetch(proxyUrl + apiUrl, {
            method: 'GET'
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.bitcoin && data.bitcoin.usd) {
                console.log('✅ CoinGecko (프록시) 성공:', data.bitcoin.usd);
                return {
                    price: data.bitcoin.usd,
                    change24h: data.bitcoin.usd_24h_change || 0
                };
            }
        }
    } catch (error) {
        console.error('❌ CoinGecko 프록시 실패:', error);
    }
    
    // 방법 2: 직접 Coinbase (CORS 허용)
    try {
        const response = await fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot');
        if (response.ok) {
            const data = await response.json();
            if (data.data && data.data.amount) {
                console.log('✅ Coinbase 성공:', data.data.amount);
                return {
                    price: parseFloat(data.data.amount),
                    change24h: 0
                };
            }
        }
    } catch (error) {
        console.error('❌ Coinbase 실패:', error);
    }
    
    // 방법 3: Blockchain.com (CORS 허용)
    try {
        const response = await fetch('https://blockchain.info/ticker');
        if (response.ok) {
            const data = await response.json();
            if (data.USD && data.USD.last) {
                console.log('✅ Blockchain.com 성공:', data.USD.last);
                return {
                    price: data.USD.last,
                    change24h: 0
                };
            }
        }
    } catch (error) {
        console.error('❌ Blockchain.com 실패:', error);
    }
    
    // Fallback: 현실적인 기본값
    console.warn('⚠️ 모든 BTC API 실패, 기본값 사용');
    alert('⚠️ BTC 가격 API 연결 실패\n기본값($95,000)을 사용합니다.\n\n인터넷 연결을 확인하고\n새로고침 버튼을 눌러주세요.');
    return { 
        price: 95000, 
        change24h: 0 
    };
}

// MSTR 주가 조회 (CORS 프록시 사용)
async function fetchMSTRPrice() {
    console.log('MSTR 주가 조회 시작...');
    
    // 방법 1: CORS Proxy + Yahoo Finance
    try {
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const apiUrl = encodeURIComponent('https://query1.finance.yahoo.com/v8/finance/chart/MSTR?interval=1d&range=1d');
        
        const response = await fetch(proxyUrl + apiUrl, {
            method: 'GET'
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.chart && data.chart.result && data.chart.result[0]) {
                const result = data.chart.result[0];
                const meta = result.meta;
                
                const currentPrice = meta.regularMarketPrice;
                const previousClose = meta.previousClose;
                
                if (currentPrice && previousClose) {
                    const change = ((currentPrice - previousClose) / previousClose) * 100;
                    console.log('✅ Yahoo Finance (프록시) 성공:', currentPrice);
                    return { price: currentPrice, change24h: change };
                }
            }
        }
    } catch (error) {
        console.error('❌ Yahoo Finance 프록시 실패:', error);
    }
    
    // 방법 2: finnhub.io (무료 API, CORS 허용)
    try {
        // 무료 demo 키 사용 (제한적이지만 작동함)
        const response = await fetch('https://finnhub.io/api/v1/quote?symbol=MSTR&token=demo');
        if (response.ok) {
            const data = await response.json();
            if (data.c && data.c > 0) {
                const currentPrice = data.c;
                const previousClose = data.pc;
                const change = previousClose ? ((currentPrice - previousClose) / previousClose) * 100 : 0;
                console.log('✅ Finnhub 성공:', currentPrice);
                return { price: currentPrice, change24h: change };
            }
        }
    } catch (error) {
        console.error('❌ Finnhub 실패:', error);
    }
    
    // Fallback: 현실적인 기본값
    console.warn('⚠️ 모든 MSTR API 실패, 기본값 사용');
    alert('⚠️ MSTR 주가 API 연결 실패\n기본값($350)을 사용합니다.\n\n인터넷 연결을 확인하고\n새로고침 버튼을 눌러주세요.');
    return { 
        price: 350, 
        change24h: 0 
    };
}

// 화면 업데이트 함수들
function updateBTCDisplay(data) {
    if (!data || !data.price) {
        console.error('BTC 데이터 없음');
        return;
    }
    
    const priceEl = document.getElementById('btcPrice');
    const changeEl = document.getElementById('btcChange');
    
    if (priceEl) priceEl.textContent = `$${formatNumber(data.price)}`;
    
    if (changeEl) {
        changeEl.textContent = `${data.change24h >= 0 ? '+' : ''}${data.change24h.toFixed(2)}%`;
        changeEl.className = data.change24h >= 0 ? 'change positive' : 'change negative';
    }
}

function updateMSTRDisplay(data) {
    if (!data || !data.price) {
        console.error('MSTR 데이터 없음');
        return;
    }
    
    const priceEl = document.getElementById('mstrPrice');
    const changeEl = document.getElementById('mstrChange');
    
    if (priceEl) priceEl.textContent = `$${formatNumber(data.price)}`;
    
    if (changeEl) {
        changeEl.textContent = `${data.change24h >= 0 ? '+' : ''}${data.change24h.toFixed(2)}%`;
        changeEl.className = data.change24h >= 0 ? 'change positive' : 'change negative';
    }
}

function updateMNAVCalculation(btcPrice, mstrPrice) {
    try {
        if (!btcPrice || !mstrPrice || btcPrice <= 0 || mstrPrice <= 0) {
            console.error('유효하지 않은 가격 데이터');
            return;
        }
        
        const btcTotalValue = MSTR_DATA.btcHoldings * btcPrice;
        const sharesCount = MSTR_DATA.useDiluted ? MSTR_DATA.dilutedShares : MSTR_DATA.sharesOutstanding;
        const mnavPerShare = btcTotalValue / (sharesCount * 1000000);
        const premium = ((mstrPrice - mnavPerShare) / mnavPerShare) * 100;
        
        // 안전한 업데이트
        const updateElement = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        };
        
        updateElement('btcHoldings', formatNumber(MSTR_DATA.btcHoldings) + ' BTC');
        updateElement('btcTotalValue', '$' + formatNumber(btcTotalValue / 1000000000, 2) + 'B');
        updateElement('sharesOutstanding', `${sharesCount}M (희석)`);
        updateElement('mnavPerShare', '$' + formatNumber(mnavPerShare));
        
        // 프리미엄/디스카운트 표시
        const premiumBox = document.getElementById('premiumBox');
        const premiumValue = document.getElementById('premiumValue');
        const premiumDesc = document.getElementById('premiumDesc');
        
        if (premiumBox && premiumValue && premiumDesc) {
            premiumBox.className = 'premium-box';
            if (premium > 0) {
                premiumBox.classList.add('premium');
                premiumValue.textContent = '+' + premium.toFixed(1) + '%';
                premiumDesc.textContent = 'MSTR이 내재가치보다 비싸게 거래되고 있습니다';
            } else {
                premiumBox.classList.add('discount');
                premiumValue.textContent = premium.toFixed(1) + '%';
                premiumDesc.textContent = 'MSTR이 내재가치보다 싸게 거래되고 있습니다';
            }
        }
    } catch (error) {
        console.error('MNAV 계산 오류:', error);
    }
}

function updateTradingSignal(btcPrice, mstrPrice) {
    const btcTotalValue = MSTR_DATA.btcHoldings * btcPrice;
    const sharesCount = MSTR_DATA.useDiluted ? MSTR_DATA.dilutedShares : MSTR_DATA.sharesOutstanding;
    const mnavPerShare = btcTotalValue / (sharesCount * 1000000);
    const premium = ((mstrPrice - mnavPerShare) / mnavPerShare) * 100;
    
    const signalBox = document.querySelector('.signal-box');
    const signalIcon = document.getElementById('signalIcon');
    const signalText = document.getElementById('signalText');
    const signalDetail = document.getElementById('signalDetail');
    
    signalBox.className = 'signal-box';
    
    if (premium >= 30) {
        signalBox.classList.add('sell');
        signalIcon.textContent = '🔴';
        signalText.textContent = '매도 고려';
        signalDetail.textContent = `프리미엄 ${premium.toFixed(1)}% - 고평가 구간`;
    } else if (premium <= -10) {
        signalBox.classList.add('buy');
        signalIcon.textContent = '🟢';
        signalText.textContent = '매수 고려';
        signalDetail.textContent = `디스카운트 ${Math.abs(premium).toFixed(1)}% - 저평가 구간`;
    } else {
        signalBox.classList.add('hold');
        signalIcon.textContent = '🟡';
        signalText.textContent = '관망';
        signalDetail.textContent = `프리미엄 ${premium.toFixed(1)}% - 적정 범위`;
    }
}

// 계산기 기능
function updateCalculatorDefaults(btcPrice, mstrPrice) {
    document.getElementById('btcPriceInput').value = Math.round(btcPrice);
    document.getElementById('targetMstrPrice').value = Math.round(mstrPrice);
    
    // 적정가 분석
    const sharesCount = MSTR_DATA.useDiluted ? MSTR_DATA.dilutedShares : MSTR_DATA.sharesOutstanding;
    const btcTotalValue = MSTR_DATA.btcHoldings * btcPrice;
    const mnav = btcTotalValue / (sharesCount * 1000000);
    const premium = ((mstrPrice - mnav) / mnav) * 100;
    
    document.getElementById('currentBtcCalc').textContent = '$' + formatNumber(btcPrice);
    document.getElementById('currentMnavCalc').textContent = '$' + formatNumber(mnav);
    document.getElementById('currentMstrCalc').textContent = '$' + formatNumber(mstrPrice);
    document.getElementById('currentPremiumCalc').textContent = premium.toFixed(1) + '%';
    
    // 시나리오 테이블
    const scenarios = [-20, -10, 0, 10, 20, 30, 50, 75, 100];
    const tbody = document.getElementById('scenarioTableBody');
    tbody.innerHTML = '';
    
    scenarios.forEach(prem => {
        const fairPrice = mnav * (1 + prem / 100);
        const diff = fairPrice - mstrPrice;
        const diffPercent = (diff / mstrPrice) * 100;
        
        const row = tbody.insertRow();
        row.innerHTML = `
            <td style="color: ${prem > 0 ? '#ff4444' : '#00ff88'}">${prem > 0 ? '+' : ''}${prem}%</td>
            <td>$${formatNumber(fairPrice)}</td>
            <td style="color: ${diff > 0 ? '#00ff88' : '#ff4444'}">${diffPercent > 0 ? '+' : ''}${diffPercent.toFixed(1)}%</td>
        `;
    });
}

function calculateMSTRPrice() {
    const btcPrice = parseFloat(document.getElementById('btcPriceInput').value);
    const expectedPremium = parseFloat(document.getElementById('expectedPremium').value);
    
    if (!btcPrice || isNaN(btcPrice)) {
        document.getElementById('mstrPredictResult').innerHTML = '⚠️ BTC 가격을 입력하세요';
        return;
    }
    
    const sharesCount = MSTR_DATA.useDiluted ? MSTR_DATA.dilutedShares : MSTR_DATA.sharesOutstanding;
    const btcTotalValue = MSTR_DATA.btcHoldings * btcPrice;
    const mnav = btcTotalValue / (sharesCount * 1000000);
    const mstrPrice = mnav * (1 + expectedPremium / 100);
    
    document.getElementById('mstrPredictResult').innerHTML = `
        <strong>예상 MSTR 가격: $${formatNumber(mstrPrice)}</strong><br>
        <small>
        BTC $${formatNumber(btcPrice)} 기준<br>
        MNAV: $${formatNumber(mnav)}<br>
        프리미엄 ${expectedPremium}% 적용
        </small>
    `;
}

function calculateRequiredBTC() {
    const targetMstr = parseFloat(document.getElementById('targetMstrPrice').value);
    const targetPremium = parseFloat(document.getElementById('targetPremium').value);
    
    if (!targetMstr || isNaN(targetMstr)) {
        document.getElementById('btcRequiredResult').innerHTML = '⚠️ 목표 MSTR 가격을 입력하세요';
        return;
    }
    
    const sharesCount = MSTR_DATA.useDiluted ? MSTR_DATA.dilutedShares : MSTR_DATA.sharesOutstanding;
    const requiredMnav = targetMstr / (1 + targetPremium / 100);
    const requiredBtcValue = requiredMnav * sharesCount * 1000000;
    const requiredBtcPrice = requiredBtcValue / MSTR_DATA.btcHoldings;
    
    document.getElementById('btcRequiredResult').innerHTML = `
        <strong>필요한 BTC 가격: $${formatNumber(requiredBtcPrice)}</strong><br>
        <small>
        MSTR $${formatNumber(targetMstr)} 달성을 위해<br>
        필요 MNAV: $${formatNumber(requiredMnav)}<br>
        프리미엄 ${targetPremium}% 가정
        </small>
    `;
}

// 과거 데이터 관리
function saveDataPoint(btcPrice, mstrPrice) {
    const sharesCount = MSTR_DATA.useDiluted ? MSTR_DATA.dilutedShares : MSTR_DATA.sharesOutstanding;
    const mnav = (MSTR_DATA.btcHoldings * btcPrice) / (sharesCount * 1000000);
    const premium = ((mstrPrice - mnav) / mnav) * 100;
    
    const dataPoint = {
        timestamp: Date.now(),
        btcPrice: btcPrice,
        mstrPrice: mstrPrice,
        mnav: mnav,
        premium: premium
    };
    
    // localStorage에 저장
    const stored = JSON.parse(localStorage.getItem('mstrHistory') || '[]');
    stored.push(dataPoint);
    
    // 최근 365개만 유지
    if (stored.length > 365) {
        stored.shift();
    }
    
    localStorage.setItem('mstrHistory', JSON.stringify(stored));
    historicalData = stored;
}

function loadHistoricalData() {
    historicalData = JSON.parse(localStorage.getItem('mstrHistory') || '[]');
    
    // 샘플 데이터 생성 (처음 사용시)
    if (historicalData.length === 0) {
        generateSampleData();
    }
}

function generateSampleData() {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    
    for (let i = 365; i >= 0; i--) {
        const btcPrice = 50000 + Math.random() * 50000;
        const mstrPrice = 200 + Math.random() * 300;
        const sharesCount = MSTR_DATA.dilutedShares;
        const mnav = (MSTR_DATA.btcHoldings * btcPrice) / (sharesCount * 1000000);
        const premium = ((mstrPrice - mnav) / mnav) * 100;
        
        historicalData.push({
            timestamp: now - (i * dayMs),
            btcPrice: btcPrice,
            mstrPrice: mstrPrice,
            mnav: mnav,
            premium: premium
        });
    }
    
    localStorage.setItem('mstrHistory', JSON.stringify(historicalData));
}

// 차트 설정
function setupCharts() {
    const premiumCtx = document.getElementById('premiumChart').getContext('2d');
    const priceCtx = document.getElementById('priceChart').getContext('2d');
    
    premiumChart = new Chart(premiumCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: '프리미엄 (%)',
                data: [],
                borderColor: '#4a90e2',
                backgroundColor: 'rgba(74, 144, 226, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    ticks: { color: '#b0b0b0' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    ticks: { color: '#b0b0b0' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        }
    });
    
    priceChart = new Chart(priceCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'BTC',
                    data: [],
                    borderColor: '#f7931a',
                    yAxisID: 'y',
                    tension: 0.4
                },
                {
                    label: 'MSTR',
                    data: [],
                    borderColor: '#4a90e2',
                    yAxisID: 'y1',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    labels: { color: '#b0b0b0' }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    ticks: { color: '#f7931a' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    ticks: { color: '#4a90e2' },
                    grid: { drawOnChartArea: false }
                },
                x: {
                    ticks: { color: '#b0b0b0' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        }
    });
}

function updateCharts(days) {
    const filtered = historicalData.slice(-days);
    
    if (filtered.length === 0) return;
    
    // 프리미엄 차트
    premiumChart.data.labels = filtered.map(d => new Date(d.timestamp).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }));
    premiumChart.data.datasets[0].data = filtered.map(d => d.premium.toFixed(2));
    premiumChart.update();
    
    // 가격 차트
    priceChart.data.labels = filtered.map(d => new Date(d.timestamp).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }));
    priceChart.data.datasets[0].data = filtered.map(d => d.btcPrice.toFixed(0));
    priceChart.data.datasets[1].data = filtered.map(d => d.mstrPrice.toFixed(2));
    priceChart.update();
    
    // 통계
    const premiums = filtered.map(d => d.premium);
    const avg = premiums.reduce((a, b) => a + b, 0) / premiums.length;
    const max = Math.max(...premiums);
    const min = Math.min(...premiums);
    const variance = premiums.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) / premiums.length;
    const stdDev = Math.sqrt(variance);
    
    document.getElementById('avgPremium').textContent = avg.toFixed(1) + '%';
    document.getElementById('maxPremium').textContent = max.toFixed(1) + '%';
    document.getElementById('minPremium').textContent = min.toFixed(1) + '%';
    document.getElementById('volatility').textContent = stdDev.toFixed(1) + '%';
}

// 자동 새로고침
function setupAutoRefresh() {
    autoRefreshInterval = setInterval(loadData, 60000); // 1분마다
}

// 유틸리티
function formatNumber(num, decimals = 0) {
    if (decimals > 0) {
        return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function showError(message) {
    const signalBox = document.querySelector('.signal-box');
    signalBox.className = 'signal-box';
    document.getElementById('signalIcon').textContent = '⚠️';
    document.getElementById('signalText').textContent = '오류';
    document.getElementById('signalDetail').textContent = message;
}
