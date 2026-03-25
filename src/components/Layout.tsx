import React from 'react';
import Navbar from './Navbar';
import AIMentor from './AIMentor';
import NotificationCenter from './NotificationCenter';
import MatchRequestManager from './MatchRequestManager';
import AppTour from './AppTour';
import { useLocation } from 'react-router-dom';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const isAuth = location.pathname === '/auth';
  const isChat = location.pathname === '/chats';

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/dashboard': return 'Dashboard';
      case '/swipe': return 'Find Partners';
      case '/chats': return 'Messages';
      case '/progress': return 'Study Progress';
      case '/profile': return 'My Profile';
      case '/match-requests': return 'Match Requests';
      default: return 'PrepMitra';
    }
  };

  return (
    <div className="min-h-screen bg-navy-deep text-zinc-100">
      {!isLanding && !isAuth && <Navbar />}
      {!isLanding && !isAuth && (
        <>
          <AppTour />
          {/* Mobile Header */}
          <header className="md:hidden fixed top-6 left-4 right-4 h-14 px-6 flex items-center justify-between bg-navy-deep/80 backdrop-blur-xl border border-white/10 rounded-[24px] z-50 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
            <h2 className="text-lg font-black tracking-tight">{getPageTitle(location.pathname)}</h2>
            <NotificationCenter position="right" />
          </header>
          <MatchRequestManager />
        </>
      )}
      <main className={`${!isLanding && !isAuth ? 'md:pl-24 pt-24 md:pt-0 pb-24 md:pb-0' : ''}`}>
        {children}
      </main>
      {!isLanding && !isAuth && !isChat && <AIMentor />}
    </div>
  );
}
