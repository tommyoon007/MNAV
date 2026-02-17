# MSTR MNAV 계산기 - 마이너스 프리미엄 지원 버전

## 주요 수정사항

✅ **예상 프리미엄 입력란에 마이너스 값 입력 가능**
- 디스카운트 상태 (-10%, -20% 등) 계산 지원
- 음수 프리미엄 입력 시 자동으로 디스카운트로 계산
- 프리미엄 범위 제한 없음

## 수정된 파일

### 1. index.html
```html
<!-- 기존 -->
<input type="number" id="expectedPremium" min="0" step="0.01">

<!-- 수정 후 -->
<input type="number" id="expectedPremium" step="0.01">
```
- `min="0"` 속성 제거하여 음수 입력 가능

### 2. script.js
- 마이너스 프리미엄 검증 로직 제거
- 음수 프리미엄 계산 지원
- 프리미엄 상태에 따른 색상 표시

## 사용 예시

### 디스카운트 계산
- BTC 가격: $100,000
- 예상 프리미엄: **-10%** (10% 디스카운트)
- 결과: MSTR 가격 = MNAV의 90%

### 프리미엄 계산
- BTC 가격: $100,000
- 예상 프리미엄: **+50%**
- 결과: MSTR 가격 = MNAV의 150%

## GitHub에 업로드하는 방법

### 방법 1: GitHub 웹사이트에서 직접 수정

1. GitHub 저장소 접속: https://github.com/tommyoon007/mnav
2. 수정할 파일 클릭 (예: index.html)
3. 연필 아이콘(Edit) 클릭
4. 아래 수정 사항 적용:

**index.html에서:**
```html
<!-- 142번째 줄 근처 -->
<input type="number" id="expectedPremium" step="0.01" placeholder="0">
```
`min="0"` 제거

5. 하단 "Commit changes" 클릭
6. 변경 사항 저장

### 방법 2: 전체 파일 교체

1. 이 폴더의 모든 파일을 다운로드
2. GitHub 저장소에서 기존 파일 삭제
3. 새 파일 업로드
4. 5-10분 후 https://tommyoon007.github.io/mnav/ 에서 확인

## 테스트 방법

1. 웹사이트 열기
2. "빠른 계산" 섹션으로 이동
3. **BTC가 이 가격이 되면?**: 100000 입력
4. **예상 프리미엄 (%)**: -10 입력 (마이너스!)
5. "MSTR 가격 예측" 버튼 클릭
6. 결과가 정상적으로 표시되는지 확인

## 프리미엄 가이드

| 입력값 | 의미 | 결과 |
|--------|------|------|
| +100% | MNAV의 2배 | MNAV × 2.0 |
| +50% | 50% 프리미엄 | MNAV × 1.5 |
| 0% | 공정가치 | MNAV × 1.0 |
| -10% | 10% 디스카운트 | MNAV × 0.9 |
| -20% | 20% 디스카운트 | MNAV × 0.8 |
| -50% | 50% 디스카운트 | MNAV × 0.5 |

## 문제 해결

### 음수가 입력되지 않아요
- 브라우저 캐시 삭제 (Ctrl+Shift+Delete)
- 시크릿 모드에서 테스트
- index.html에서 `min="0"` 제거 확인

### 계산이 이상해요
- 숫자 형식 확인 (소수점은 . 사용)
- BTC 보유량이 최신인지 확인
- 브라우저 콘솔(F12)에서 에러 확인

## 추가 기능

✅ Enter 키로 빠른 계산
✅ 프리미엄 상태별 색상 표시
✅ 반응형 디자인
✅ 모바일 최적화

## 기술 스택

- HTML5
- CSS3 (Flexbox, Grid)
- Vanilla JavaScript (No dependencies)
- PWA (Progressive Web App)

## 라이선스

MIT License - 자유롭게 사용 및 수정 가능

## 연락처

문제가 있으면 GitHub Issues에 등록해주세요!
