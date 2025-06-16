import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './hooks/useRedux';
import { loginSuccess } from './store/authSlice';

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
import TradingPage from './pages/TradingPage';
import PortfolioPage from './pages/PortfolioPage';
import LeaderboardPage from './pages/LeaderboardPage';
import StockDetailPage from './pages/StockDetailPage';
import AdminPage from './pages/AdminPage';
import StockManagement from './pages/StockManagement';
import StockManagementEnhanced from './pages/StockManagementEnhanced';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Check for existing auth token and user data
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        dispatch(loginSuccess({ user, token }));
      } catch (error) {
        console.error('Failed to parse user data:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      }
    }
  }, [dispatch]);

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
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
    </>
  );
}

export default App;