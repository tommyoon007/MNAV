// MSTR 기본 데이터
const MSTR_DATA = {
    btcHoldings: 444262, // BTC 보유량
    dilutedShares: 253.0 // 희석 주식수 (백만)
};

// 계산 함수
function calculate() {
    // 입력값 가져오기
    const btcPrice = parseFloat(document.getElementById('btcPrice').value);
    const mstrPrice = parseFloat(document.getElementById('mstrPrice').value);
    const btcHoldings = parseFloat(document.getElementById('btcHoldings').value);
    const dilutedShares = parseFloat(document.getElementById('dilutedShares').value);

    // 입력값 검증
    if (!btcPrice || !mstrPrice || !btcHoldings || !dilutedShares) {
        alert('모든 필드를 입력해주세요.');
        return;
    }

    if (btcPrice <= 0 || mstrPrice <= 0 || btcHoldings <= 0 || dilutedShares <= 0) {
        alert('모든 값은 0보다 커야 합니다.');
        return;
    }

    // BTC 총 가치 계산
    const btcTotalValue = btcPrice * btcHoldings;
    
    // 주당 MNAV 계산 (백만 단위로 나눔)
    const mnavPerShare = btcTotalValue / (dilutedShares * 1000000);
    
    // 프리미엄/디스카운트 계산
    const premium = ((mstrPrice - mnavPerShare) / mnavPerShare) * 100;

    // 결과 표시
    document.getElementById('btcTotalValue').textContent = 
        `$${formatNumber(btcTotalValue)}`;
    
    document.getElementById('mnavPerShare').textContent = 
        `$${mnavPerShare.toFixed(2)}`;
    
    document.getElementById('premium').textContent = 
        `${premium >= 0 ? '+' : ''}${premium.toFixed(2)}%`;

    // 신호 표시
    const signalElement = document.getElementById('signal');
    if (premium > 75) {
        signalElement.textContent = '🔴 심각한 고평가 - 강력 매도';
        signalElement.className = 'signal danger';
    } else if (premium > 50) {
        signalElement.textContent = '🔴 고평가 - 매도 고려';
        signalElement.className = 'signal danger';
    } else if (premium > 30) {
        signalElement.textContent = '🟡 과열 - 비중 축소';
        signalElement.className = 'signal warning';
    } else if (premium > 10) {
        signalElement.textContent = '🟡 적정 프리미엄 - 관망';
        signalElement.className = 'signal warning';
    } else if (premium >= -10) {
        signalElement.textContent = '🟡 공정가치 - 중립';
        signalElement.className = 'signal neutral';
    } else if (premium >= -20) {
        signalElement.textContent = '🟢 저평가 - 매수 고려';
        signalElement.className = 'signal success';
    } else {
        signalElement.textContent = '🟢 심각한 저평가 - 강력 매수';
        signalElement.className = 'signal success';
    }
}

// MSTR 가격 예측 함수 (마이너스 프리미엄 지원)
function predictMstrPrice() {
    const targetBtcPrice = parseFloat(document.getElementById('targetBtcPrice').value);
    const expectedPremium = parseFloat(document.getElementById('expectedPremium').value);
    const btcHoldings = parseFloat(document.getElementById('btcHoldings').value) || MSTR_DATA.btcHoldings;
    const dilutedShares = parseFloat(document.getElementById('dilutedShares').value) || MSTR_DATA.dilutedShares;

    // 입력값 검증
    if (!targetBtcPrice || isNaN(expectedPremium)) {
        alert('BTC 가격과 예상 프리미엄을 입력해주세요.');
        return;
    }

    if (targetBtcPrice <= 0 || btcHoldings <= 0 || dilutedShares <= 0) {
        alert('BTC 가격, 보유량, 주식수는 0보다 커야 합니다.');
        return;
    }

    // 마이너스 프리미엄도 허용 (디스카운트 상태)
    // 예: -10% 프리미엄 = 10% 디스카운트

    // BTC 총 가치 계산
    const btcTotalValue = targetBtcPrice * btcHoldings;
    
    // 주당 MNAV 계산
    const mnavPerShare = btcTotalValue / (dilutedShares * 1000000);
    
    // 예상 MSTR 가격 계산 (프리미엄/디스카운트 적용)
    const predictedMstrPrice = mnavPerShare * (1 + expectedPremium / 100);

    // 결과 표시
    const resultElement = document.getElementById('predictedMstrPrice');
    resultElement.textContent = `$${predictedMstrPrice.toFixed(2)}`;
    
    // 프리미엄 상태에 따라 색상 변경
    if (expectedPremium > 50) {
        resultElement.style.color = '#e53e3e';
    } else if (expectedPremium > 10) {
        resultElement.style.color = '#dd6b20';
    } else if (expectedPremium >= -10) {
        resultElement.style.color = '#2d3748';
    } else {
        resultElement.style.color = '#38a169';
    }
}

// 기본값으로 초기화
function resetDefaults() {
    document.getElementById('btcPrice').value = '';
    document.getElementById('mstrPrice').value = '';
    document.getElementById('btcHoldings').value = MSTR_DATA.btcHoldings;
    document.getElementById('dilutedShares').value = MSTR_DATA.dilutedShares;
    document.getElementById('targetBtcPrice').value = '';
    document.getElementById('expectedPremium').value = '';
    
    // 결과 초기화
    document.getElementById('btcTotalValue').textContent = '-';
    document.getElementById('mnavPerShare').textContent = '-';
    document.getElementById('premium').textContent = '-';
    document.getElementById('signal').textContent = '-';
    document.getElementById('predictedMstrPrice').textContent = '-';
    
    // localStorage 삭제
    localStorage.removeItem('mstrCalculatorInputs');
}

// 숫자 포맷팅 함수
function formatNumber(num) {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(2) + 'B';
    } else if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M';
    }
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

// 입력값 저장 함수
function saveInputs() {
    const inputs = {
        btcPrice: document.getElementById('btcPrice').value,
        mstrPrice: document.getElementById('mstrPrice').value,
        btcHoldings: document.getElementById('btcHoldings').value,
        dilutedShares: document.getElementById('dilutedShares').value,
        targetBtcPrice: document.getElementById('targetBtcPrice').value,
        expectedPremium: document.getElementById('expectedPremium').value
    };
    localStorage.setItem('mstrCalculatorInputs', JSON.stringify(inputs));
}

// 입력값 불러오기 함수
function loadInputs() {
    const savedInputs = localStorage.getItem('mstrCalculatorInputs');
    if (savedInputs) {
        const inputs = JSON.parse(savedInputs);
        document.getElementById('btcPrice').value = inputs.btcPrice || '';
        document.getElementById('mstrPrice').value = inputs.mstrPrice || '';
        document.getElementById('btcHoldings').value = inputs.btcHoldings || MSTR_DATA.btcHoldings;
        document.getElementById('dilutedShares').value = inputs.dilutedShares || MSTR_DATA.dilutedShares;
        document.getElementById('targetBtcPrice').value = inputs.targetBtcPrice || '';
        document.getElementById('expectedPremium').value = inputs.expectedPremium || '';
    } else {
        // 처음 사용하는 경우 기본값 설정
        document.getElementById('btcHoldings').value = MSTR_DATA.btcHoldings;
        document.getElementById('dilutedShares').value = MSTR_DATA.dilutedShares;
    }
}

// Enter 키로 계산 실행 및 자동 저장
document.addEventListener('DOMContentLoaded', function() {
    // 페이지 로드 시 저장된 값 불러오기
    loadInputs();
    
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        // Enter 키 이벤트
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                if (this.id === 'targetBtcPrice' || this.id === 'expectedPremium') {
                    predictMstrPrice();
                } else {
                    calculate();
                }
            }
        });
        
        // 입력값 변경 시 자동 저장
        input.addEventListener('input', function() {
            saveInputs();
        });
        
        // 포커스 아웃 시에도 저장
        input.addEventListener('blur', function() {
            saveInputs();
        });
    });
});
