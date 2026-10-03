import { Outlet } from 'react-router-dom';
import Header from '@/components/layout/Header.jsx';
import Footer from '@/components/layout/Footer.jsx';
import './AppLayout.css';

function AppLayout() {
  return (
    <div className="app-layout">
      <Header />

      <main className="app-layout__main">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default AppLayout;