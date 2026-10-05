import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '@/components/layout/Header.jsx';
import DashboardSidebar from '@/components/layout/DashboardSidebar.jsx';
import { MESSAGES } from '@/constants/messages.js';
import './DashboardLayout.css';

function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isSidebarOpen) {
      return undefined;
    }

    function closeOnEscape(event) {
      if (event.key === 'Escape') {
        setIsSidebarOpen(false);
        document.getElementById('dashboard-menu-toggle')?.focus();
      }
    }

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isSidebarOpen]);

  return (
    <div className="dashboard-layout">
      <DashboardSidebar
        isOpen={isSidebarOpen}
        onNavigate={() => {
          setIsSidebarOpen(false);
          if (isSidebarOpen) {
            document.getElementById('dashboard-menu-toggle')?.focus();
          }
        }}
      />
      {isSidebarOpen && (
        <button
          aria-label={MESSAGES.NAVIGATION.CLOSE_MENU}
          className="dashboard-layout__backdrop"
          onClick={() => setIsSidebarOpen(false)}
          type="button"
        />
      )}
      <div className="dashboard-layout__workspace">
        <Header
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((isOpen) => !isOpen)}
        />
        <main className="dashboard-layout__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;