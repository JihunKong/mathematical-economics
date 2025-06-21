# Error Messages Requiring Korean Translation

## Backend Error Messages

### Authentication Service (backend/src/services/authService.ts)
1. **Line 31-32**: `'🚫 이미 가입된 이메일입니다.\n\n' + '💡 다른 이메일을 사용하거나, 비밀번호를 잊으셨다면 선생님께 문의해주세요.'`
2. **Line 46-48**: `'❌ 올바르지 않은 학급 코드입니다.\n\n' + '📝 선생님께 받은 학급 코드를 다시 확인해주세요.\n' + '💡 대소문자를 구분하니 정확히 입력해주세요.'`
3. **Line 117-121**: `'🔐 이메일 또는 비밀번호가 올바르지 않습니다.\n\n' + '💡 확인사항:\n' + '• 이메일 주소가 정확한지 확인해주세요\n' + '• 비밀번호 대소문자를 확인해주세요\n' + '• Caps Lock이 켜져있지 않은지 확인해주세요'`
4. **Line 125-126**: `'🚫 계정이 비활성화되었습니다.\n\n' + '💡 선생님께 문의하여 계정을 다시 활성화해주세요.'`
5. **Line 134-138**: Same as #3
6. **Line 171-172**: `'⏰ 로그인 세션이 만료되었습니다.\n\n' + '🔄 다시 로그인해주세요.'`
7. **Line 183-184**: Same as #6

### Trading Service (backend/src/services/tradingService.ts)
1. `'👤 사용자를 찾을 수 없습니다.\n\n' + '🔄 다시 로그인해주세요.'`
2. `'📊 종목을 찾을 수 없습니다.\n\n' + '🔍 종목 코드를 다시 확인해주세요.'`
3. `'🚫 이 종목은 거래가 허용되지 않았습니다.\n\n' + '📋 선생님이 허용한 종목만 거래할 수 있어요.\n'`
4. `'💹 현재 가격 정보를 불러올 수 없습니다.\n\n' + '⏱️ 잠시 후 다시 시도해주세요.\n'`
5. `'💸 투자 금액이 부족합니다.\n\n' + '💰 현재 보유 현금: ${user.currentCash.toLocaleString()}원\n'`
6. `'📦 보유 수량이 부족합니다.\n\n' + '📊 현재 보유 수량: ${holding?.quantity || 0}주\n'`

### Watchlist Routes (backend/src/routes/watchlist.ts)
1. `'Failed to get available stocks'`
2. `'Failed to get watchlist'`
3. `'Failed to check permissions'`
4. `'Failed to update watchlist'`
5. `'Failed to add stock to watchlist'`
6. `'Stock ID is required'`
7. `'Failed to remove stock from watchlist'`
8. `'Failed to get market statistics'`
9. `'Failed to get top 10 stocks'`
10. `'Failed to get random stocks'`
11. `'Failed to get KOSPI leaders'`
12. `'Failed to get KOSDAQ promising stocks'`

### Watchlist Guard Middleware (backend/src/middleware/watchlistGuard.ts)
1. `'User not found'`
2. `'📊 거래를 시작하기 전에 관심종목을 선택해주세요!\n\n' + ...'` (multi-line message)
3. `'Internal server error'`
4. `'Stock symbol or ID is required'`
5. `'Stock not found'`
6. `'📊 ${stock.name}(${stock.symbol})의 가격 정보가 오래되어 거래할 수 없습니다.\n\n' + ...'` (multi-line message)

### Stock Data Routes (backend/src/routes/stockData.ts)
1. `'Invalid period. Valid periods are: 1M, 3M, 6M, 1Y'`

### Security Middleware (backend/src/middleware/security.ts)
1. `'Forbidden'`

## Frontend Error Messages

### Register Page (frontend/src/pages/RegisterPage.tsx)
1. `'회원가입에 실패했습니다.'`
2. `'올바른 이메일 형식이 아닙니다'`
3. `'이름은 2자 이상이어야 합니다'`
4. `'비밀번호는 6자 이상이어야 합니다'`
5. `'비밀번호는 숫자를 포함해야 합니다'`
6. `'클래스 코드는 6자리입니다'`
7. `'올바른 클래스 코드를 입력해주세요'`

### Login Page (frontend/src/pages/LoginPage.tsx)
1. `'올바른 이메일 형식이 아닙니다'`

### Portfolio Page (frontend/src/pages/PortfolioPage.tsx)
1. `'포트폴리오를 불러오는데 실패했습니다'`

### Leaderboard Page (frontend/src/pages/LeaderboardPage.tsx)
1. `'리더보드를 불러오는데 실패했습니다'`

### Teacher Dashboard (frontend/src/pages/TeacherDashboard.tsx)
1. `'클래스 목록을 불러오는데 실패했습니다.'`
2. `'클래스 생성에 실패했습니다.'`

### Teacher Class Detail (frontend/src/pages/TeacherClassDetail.tsx)
1. `'클래스 정보를 불러오는데 실패했습니다.'`

### Stock Management Enhanced (frontend/src/pages/StockManagementEnhanced.tsx)
1. `'추적 중인 종목을 불러오는데 실패했습니다.'`
2. `'주식 목록을 불러오는데 실패했습니다.'`
3. `'작업에 실패했습니다.'`

### Stock Management (frontend/src/pages/StockManagement.tsx)
1. `'주식 목록을 불러오는데 실패했습니다.'`
2. `'가격 업데이트에 실패했습니다.'`
3. `'크롤링 시작에 실패했습니다.'`
4. `'주식 추가에 실패했습니다.'`
5. `'주식 추적 설정에 실패했습니다.'`

### Stock Detail Page (frontend/src/pages/StockDetailPage.tsx)
1. `'주식 정보를 불러오는데 실패했습니다'`
2. `'업데이트에 실패했습니다'`

### Trading Page (frontend/src/pages/TradingPage.tsx)
1. `'데이터를 불러오는데 실패했습니다'`
2. `'올바른 수량을 입력해주세요'`
3. `'투자 판단 근거를 입력해주세요'`
4. `'현재 가격 정보를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.'`
5. `'교사 또는 관리자만 가격을 업데이트할 수 있습니다'`
6. `'가격 업데이트에 실패했습니다'`
7. `'현재 가격 정보가 없습니다. 잠시 후 다시 시도해주세요.'`

### Watchlist Setup Page (frontend/src/pages/WatchlistSetupPage.tsx)
1. `'Failed to search stocks'`
2. `'주식 검색에 실패했습니다'`
3. `'최대 10개까지만 선택할 수 있습니다'`
4. `'하루에 한 번만 관심종목을 변경할 수 있습니다'`
5. `'프리셋 종목을 불러오는데 실패했습니다'`
6. `'최소 1개 종목을 선택해주세요'`
7. `'관심종목 저장에 실패했습니다'`

### Admin Page (frontend/src/pages/AdminPage.tsx)
1. `'데이터를 불러오는데 실패했습니다'`
2. `'사용자 승인에 실패했습니다'`
3. `'사용자 거부에 실패했습니다'`
4. `'비밀번호는 최소 6자 이상이어야 합니다'`
5. `'비밀번호 재설정에 실패했습니다'`
6. `'사용자 상태 변경에 실패했습니다'`
7. `'모든 필드를 입력해주세요'`
8. `'비밀번호는 숫자를 포함해야 합니다'`
9. `'교사 계정 생성에 실패했습니다'`

### Update Cash Modal (frontend/src/components/teacher/UpdateCashModal.tsx)
1. `'유효한 금액을 입력해주세요'`
2. `'현금 업데이트에 실패했습니다'`

### Stock Chart (frontend/src/components/stock/StockChart.tsx)
1. `'차트 데이터를 불러오는데 실패했습니다.'`
2. `'차트 데이터를 불러올 수 없습니다.'`

## Notes
- Many backend error messages already include Korean translations with emojis
- Frontend messages are mostly in Korean already
- Some backend messages in watchlist routes and other services are still in English
- Consider standardizing error message format across the application