import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from './hooks/useRedux';
import { loginSuccess } from './store/authSlice';
import LoadingSpinner from './components/common/LoadingSpinner';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherClassDetail from './pages/TeacherClassDetail';
import TeacherStudentDetail from './pages/TeacherStudentDetail';
import TeacherLearningAnalytics from './pages/TeacherLearningAnalytics';
import TradingPage from './pages/TradingPage';
import PortfolioPage from './pages/PortfolioPage';
import LeaderboardPage from './pages/LeaderboardPage';
import StockDetailPage from './pages/StockDetailPage';
import AdminPage from './pages/AdminPage';
import StockManagement from './pages/StockManagement';
import StockManagementEnhanced from './pages/StockManagementEnhanced';
import WatchlistSetupPage from './pages/WatchlistSetupPage';
import LearningModulePage from './pages/LearningModulePage';
import ConceptsPage from './pages/ConceptsPage';
import ReflectionPage from './pages/ReflectionPage';
import StudentGuidePage from './pages/StudentGuidePage';
import ActivityGuidePage from './pages/ActivityGuidePage';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  const dispatch = useAppDispatch();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      // Check for existing auth token and user data
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const userStr = localStorage.getItem('user');
      
      if (accessToken && refreshToken && userStr) {
        try {
          const user = JSON.parse(userStr);
          // Verify the token is not expired
          const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
          const tokenExpiry = tokenPayload.exp * 1000;
          
          if (tokenExpiry > Date.now()) {
            // Token is still valid
            dispatch(loginSuccess({ user, accessToken, refreshToken }));
          } else {
            // Token expired, try to refresh
            try {
              const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
              });
              
              if (response.ok) {
                const data = await response.json();
                const newAccessToken = data.data.accessToken;
                localStorage.setItem('accessToken', newAccessToken);
                dispatch(loginSuccess({ user, accessToken: newAccessToken, refreshToken }));
              } else {
                // Refresh failed, clear auth
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
              }
            } catch (error) {
              console.error('Failed to refresh token:', error);
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('user');
            }
          }
        } catch (error) {
          console.error('Failed to parse auth data:', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
      }
      
      // Mark as initialized after checking auth
      setIsInitialized(true);
    };
    
    initAuth();
  }, [dispatch]);
  
  // Wait for initial auth check before rendering routes
  if (!isInitialized) {
    return <LoadingSpinner />;
  }

  return (
    <div data-app-initialized="true">
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route
            path="watchlist-setup"
            element={
              <ProtectedRoute>
                <WatchlistSetupPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="trading"
            element={
              <ProtectedRoute>
                <TradingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="portfolio"
            element={
              <ProtectedRoute>
                <PortfolioPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="leaderboard"
            element={
              <ProtectedRoute>
                <LeaderboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="stock/:symbol"
            element={
              <ProtectedRoute>
                <StockDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="stock-management"
            element={
              <ProtectedRoute>
                <StockManagementEnhanced />
              </ProtectedRoute>
            }
          />
          <Route
            path="teacher"
            element={
              <ProtectedRoute>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="teacher/class/:classId"
            element={
              <ProtectedRoute>
                <TeacherClassDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="teacher/student/:studentId"
            element={
              <ProtectedRoute>
                <TeacherStudentDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="teacher/analytics"
            element={
              <ProtectedRoute>
                <TeacherLearningAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="learning"
            element={
              <ProtectedRoute>
                <LearningModulePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="concepts"
            element={
              <ProtectedRoute>
                <ConceptsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="reflection"
            element={
              <ProtectedRoute>
                <ReflectionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="guide"
            element={
              <ProtectedRoute>
                <StudentGuidePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="activities"
            element={
              <ProtectedRoute>
                <ActivityGuidePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;