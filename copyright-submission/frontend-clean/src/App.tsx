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
import TradingPage from './pages/TradingPage';
import PortfolioPage from './pages/PortfolioPage';
import LeaderboardPage from './pages/LeaderboardPage';
import StockDetailPage from './pages/StockDetailPage';
import AdminPage from './pages/AdminPage';
import StockManagement from './pages/StockManagement';
import StockManagementEnhanced from './pages/StockManagementEnhanced';
import WatchlistSetupPage from './pages/WatchlistSetupPage'에러가 발생했습니다'accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const userStr = localStorage.getItem('user'에러가 발생했습니다'.'에러가 발생했습니다'/api/auth/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'에러가 발생했습니다'accessToken'에러가 발생했습니다'accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user'에러가 발생했습니다'accessToken');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('user');
            }
          }
        } catch (error) {
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
            path="watchlist-setup"에러가 발생했습니다"dashboard"에러가 발생했습니다"trading"에러가 발생했습니다"portfolio"에러가 발생했습니다"leaderboard"에러가 발생했습니다"stock/:symbol"에러가 발생했습니다"stock-management"에러가 발생했습니다"teacher"에러가 발생했습니다"teacher/class/:classId"에러가 발생했습니다"teacher/student/:studentId"에러가 발생했습니다"admin"에러가 발생했습니다"*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;