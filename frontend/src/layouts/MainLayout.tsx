import { Outlet } from 'react-router-dom';
import Header from '@/components/common/Header';
import Sidebar from '@/components/common/Sidebar';
import { useAppSelector } from '@/hooks/useRedux';

export default function MainLayout() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const isStudent = user?.role === 'STUDENT';
  const shouldShowSidebar = isAuthenticated && isStudent;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex h-[calc(100vh-4rem)]">
        {shouldShowSidebar && <Sidebar />}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}