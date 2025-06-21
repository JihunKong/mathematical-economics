# English Strings to Translate to Korean

## Summary
This document lists all English error messages and user-facing strings found in the frontend TypeScript/React files that need to be translated to Korean.

## Error Messages and User-Facing Strings by File

### 1. `/frontend/src/pages/TradingPage.tsx`

**Line 117**: `toast.error('데이터를 불러오는데 실패했습니다');` ✓ (Already Korean)

**Line 127**: `toast.error('올바른 수량을 입력해주세요');` ✓ (Already Korean)

**Line 132**: `toast.error('투자 판단 근거를 입력해주세요');` ✓ (Already Korean)

**Line 138**: `toast.error('현재 가격 정보를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.');` ✓ (Already Korean)

**Line 147**: `toast.success('매수 주문이 완료되었습니다');` ✓ (Already Korean)

**Line 150**: `toast.success('매도 주문이 완료되었습니다');` ✓ (Already Korean)

**Line 165**: `toast.error('교사 또는 관리자만 가격을 업데이트할 수 있습니다');` ✓ (Already Korean)

**Line 172**: `toast.success('주식 가격이 업데이트되었습니다');` ✓ (Already Korean)

**Line 176**: `toast.error('가격 업데이트에 실패했습니다');` ✓ (Already Korean)

**Line 363**: `'가격 정보 없음'` ✓ (Already Korean)

**Line 405, 426**: `toast.error('현재 가격 정보가 없습니다. 잠시 후 다시 시도해주세요.');` ✓ (Already Korean)

**Line 479**: `placeholder="0"` ⚠️ (Number placeholder, might be okay)

**Line 498**: `placeholder="투자 결정의 이유를 작성해주세요..."` ✓ (Already Korean)

### 2. `/frontend/src/pages/WatchlistSetupPage.tsx`

**Line 82**: `toast.error('정말로 이 사용자를 거부하시겠습니까? 계정이 삭제됩니다.');` - ⚠️ This is using `confirm()` which shows English browser dialog

**Line 213**: `toast.error('주식 검색에 실패했습니다');` ✓ (Already Korean)

**Line 233**: `toast.success(`${stock.name} 제거됨`);` ✓ (Already Korean)

**Line 237**: `toast.error('최대 10개까지만 선택할 수 있습니다');` ✓ (Already Korean)

**Line 242**: `toast.success(`${stock.name} 추가됨`);` ✓ (Already Korean)

**Line 250**: `toast.error('하루에 한 번만 관심종목을 변경할 수 있습니다');` ✓ (Already Korean)

**Line 259**: `toast.success(`${preset.name} 종목이 선택되었습니다`);` ✓ (Already Korean)

**Line 262**: `toast.error('프리셋 종목을 불러오는데 실패했습니다');` ✓ (Already Korean)

**Line 270**: `toast.error('최소 1개 종목을 선택해주세요');` ✓ (Already Korean)

**Line 275**: `toast.error('하루에 한 번만 관심종목을 변경할 수 있습니다');` ✓ (Already Korean)

**Line 293**: `toast.success('관심종목이 저장되었습니다!');` ✓ (Already Korean)

**Line 297**: `throw new Error(errorData.message || 'Failed to save watchlist');` ⚠️ (Fallback English error)

**Line 301**: `toast.error(error.message || '관심종목 저장에 실패했습니다');` ✓ (Already Korean)

### 3. `/frontend/src/pages/StockDetailPage.tsx`

**Line 99**: `toast.error('주식 정보를 불러오는데 실패했습니다');` ✓ (Already Korean)

**Line 131**: `toast.success('가격 정보가 업데이트되었습니다');` ✓ (Already Korean)

**Line 133**: `toast.error('업데이트에 실패했습니다');` ✓ (Already Korean)

**Line 161**: `if (!stock) return <div>주식 정보를 찾을 수 없습니다.</div>;` ✓ (Already Korean)

**Line 351**: `<p className="text-gray-500 text-center py-8">관련 뉴스가 없습니다.</p>` ✓ (Already Korean)

**Line 381**: `<p>재무 정보는 준비 중입니다.</p>` ✓ (Already Korean)

### 4. `/frontend/src/pages/PortfolioPage.tsx`

**Line 84**: `toast.error('포트폴리오를 불러오는데 실패했습니다');` ✓ (Already Korean)

**Line 121**: `if (!portfolio) return <div>포트폴리오 정보가 없습니다.</div>;` ✓ (Already Korean)

### 5. `/frontend/src/pages/UpdateCashModal.tsx`

**Line 29**: `toast.error('유효한 금액을 입력해주세요');` ✓ (Already Korean)

**Line 36**: `toast.success('보유 현금이 업데이트되었습니다');` ✓ (Already Korean)

**Line 41**: `toast.error('현금 업데이트에 실패했습니다');` ✓ (Already Korean)

**Line 85**: `placeholder="0"` ⚠️ (Number placeholder, might be okay)

### 6. `/frontend/src/pages/AdminPage.tsx`

**Line 64**: `toast.error('데이터를 불러오는데 실패했습니다');` ✓ (Already Korean)

**Line 73**: `toast.success(`사용자를 ${role === 'STUDENT' ? '학생' : '교사'}으로 승인했습니다`);` ✓ (Already Korean)

**Line 77**: `toast.error('사용자 승인에 실패했습니다');` ✓ (Already Korean)

**Line 82**: ⚠️ **English browser confirm dialog**: `if (!confirm('정말로 이 사용자를 거부하시겠습니까? 계정이 삭제됩니다.')) {`

**Line 88**: `toast.success('사용자를 거부하고 계정을 삭제했습니다');` ✓ (Already Korean)

**Line 92**: `toast.error('사용자 거부에 실패했습니다');` ✓ (Already Korean)

**Line 98**: `toast.error('비밀번호는 최소 6자 이상이어야 합니다');` ✓ (Already Korean)

**Line 106**: `toast.success('비밀번호가 재설정되었습니다');` ✓ (Already Korean)

**Line 111**: `toast.error('비밀번호 재설정에 실패했습니다');` ✓ (Already Korean)

**Line 118**: `toast.success(`사용자를 ${!currentStatus ? '활성화' : '비활성화'}했습니다`);` ✓ (Already Korean)

**Line 122**: `toast.error('사용자 상태 변경에 실패했습니다');` ✓ (Already Korean)

**Line 128**: `toast.error('모든 필드를 입력해주세요');` ✓ (Already Korean)

**Line 133**: `toast.error('비밀번호는 최소 6자 이상이어야 합니다');` ✓ (Already Korean)

**Line 138**: `toast.error('비밀번호는 숫자를 포함해야 합니다');` ✓ (Already Korean)

**Line 144**: `toast.success('교사 계정이 생성되었습니다');` ✓ (Already Korean)

**Line 149**: `toast.error(error.response?.data?.message || '교사 계정 생성에 실패했습니다');` ✓ (Already Korean)

**Line 421**: `placeholder="새 비밀번호를 입력하세요 (최소 6자)"` ✓ (Already Korean)

**Line 463**: `placeholder="teacher@school.ac.kr"` ⚠️ (Example email, might be okay)

**Line 476**: `placeholder="홍길동 선생님"` ✓ (Already Korean)

**Line 489**: `placeholder="초기 비밀번호 (교사에게 전달)"` ✓ (Already Korean)

### 7. `/frontend/src/services/api.ts`

**Line 64**: `const message = errorData?.message || '알 수 없는 오류가 발생했습니다.';` ✓ (Already Korean)

### 8. `/frontend/src/pages/LoginPage.tsx`

**Line 41**: `toast.success('로그인 성공!');` ✓ (Already Korean)

**Line 57**: `const errorMessage = error.response?.data?.message || '이메일 또는 비밀번호가 올바르지 않습니다.';` ✓ (Already Korean)

**Line 83-86**: Form validation messages ✓ (Already Korean)
- `required: '이메일을 입력해주세요'`
- `message: '올바른 이메일 형식이 아닙니다'`

**Line 104**: `required: '비밀번호를 입력해주세요'` ✓ (Already Korean)

**Line 92**: `placeholder="이메일"` ✓ (Already Korean)

**Line 109**: `placeholder="비밀번호"` ✓ (Already Korean)

### 9. `/frontend/src/pages/RegisterPage.tsx`

**Line 34**: `toast.success('회원가입이 완료되었습니다! 승인 후 로그인이 가능합니다.');` ✓ (Already Korean)

**Line 37**: `toast.error('회원가입에 실패했습니다.');` ✓ (Already Korean)

**Line 67-71**: Form validation messages ✓ (Already Korean)
- `required: '이메일을 입력해주세요'`
- `message: '올바른 이메일 형식이 아닙니다'`

**Line 88-92**: Form validation messages ✓ (Already Korean)
- `required: '이름을 입력해주세요'`
- `message: '이름은 2자 이상이어야 합니다'`

**Line 109-117**: Form validation messages ✓ (Already Korean)
- `required: '비밀번호를 입력해주세요'`
- `message: '비밀번호는 6자 이상이어야 합니다'`
- `message: '비밀번호는 숫자를 포함해야 합니다'`

**Line 134-136**: Form validation messages ✓ (Already Korean)
- `required: '비밀번호를 다시 입력해주세요'`
- `validate: (value) => value === password || '비밀번호가 일치하지 않습니다'`

**Line 153-161**: Form validation messages ✓ (Already Korean)
- `required: '클래스 코드를 입력해주세요'`
- `message: '클래스 코드는 6자리입니다'`
- `message: '올바른 클래스 코드를 입력해주세요'`

**Line 165**: `placeholder="교사로부터 받은 클래스 코드"` ✓ (Already Korean)

### 10. `/frontend/src/pages/DashboardPage.tsx`

No English error messages found - all are already in Korean.

## Issues Found That Need Attention

### 1. **Browser Confirm Dialogs** (Shows in English based on browser language)
- `/frontend/src/pages/AdminPage.tsx` Line 82:
  ```typescript
  if (!confirm('정말로 이 사용자를 거부하시겠습니까? 계정이 삭제됩니다.'))
  ```
  
  **Solution**: Replace with a custom Korean modal component

### 2. **Fallback Error Messages in English**
- `/frontend/src/pages/WatchlistSetupPage.tsx` Line 297:
  ```typescript
  throw new Error(errorData.message || 'Failed to save watchlist');
  ```
  
  **Solution**: Change to Korean fallback:
  ```typescript
  throw new Error(errorData.message || '관심종목 저장에 실패했습니다');
  ```

### 3. **Console Error Messages** (Developer-facing, but might appear in production)
Multiple files have `console.error()` statements with English messages. While these are primarily for developers, they might appear in production logs.

Examples:
- `console.error('Failed to fetch data:', error);`
- `console.error('Login error:', error);`
- `console.error('Failed to update prices:', error);`

**Recommendation**: These can remain in English as they are for debugging purposes.

### 4. **Placeholder Text**
Some numeric placeholders use "0" which is universal, but email examples might benefit from Korean context:
- `placeholder="teacher@school.ac.kr"` - Could be changed to a more Korean-friendly example

## Summary

Most user-facing strings are already translated to Korean. The main issues are:
1. Browser-native `confirm()` dialogs that show in English
2. One fallback error message in English
3. Console error messages (can remain in English for debugging)

The application is well-localized overall, with only minor adjustments needed for complete Korean localization.