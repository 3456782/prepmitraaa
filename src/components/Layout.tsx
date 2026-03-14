import React from 'react';
import Navbar from './Navbar';
import AIMentor from './AIMentor';
import { useLocation } from 'react-router-dom';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const isAuth = location.pathname === '/auth';

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {!isLanding && !isAuth && <Navbar />}
      <main className={`${!isLanding && !isAuth ? 'md:pl-20 pb-24 md:pb-0' : ''}`}>
        {children}
      </main>
      {!isLanding && !isAuth && <AIMentor />}
    </div>
  );
}
