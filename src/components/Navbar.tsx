import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { 
  Home,
  Users,
  MessageSquare, 
  User, 
  LogOut,
  LayoutDashboard,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import NotificationCenter from './NotificationCenter';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  if (!user && location.pathname === '/') return null;

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard', id: 'nav-dashboard' },
    { path: '/swipe', icon: Users, label: 'Match', id: 'nav-match' },
    { path: '/chats', icon: MessageSquare, label: 'Chats', id: 'nav-chats' },
    { path: '/progress', icon: BarChart3, label: 'Progress', id: 'nav-progress' },
    { path: '/profile', icon: User, label: 'Profile', id: 'nav-profile' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col fixed left-0 top-0 h-full w-24 bg-navy-deep/90 backdrop-blur-3xl border-r border-white/5 py-10 items-center justify-between z-50">
        <div className="flex flex-col items-center gap-12 w-full">
          <Link to="/" className="group relative">
            <div className="absolute -inset-2 bg-teal-electric rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative w-12 h-12 bg-gradient-to-br from-teal-electric to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-teal-electric/20 transform group-hover:scale-105 transition-transform">
              <span className="text-navy-deep font-black text-xl">P</span>
            </div>
          </Link>
          
          <div className="flex flex-col gap-4 w-full px-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={item.path} 
                  to={item.path}
                  id={item.id}
                  onMouseEnter={() => setHoveredItem(item.path)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className="relative group flex items-center justify-center"
                >
                  {isActive && (
                    <motion.div 
                      layoutId="active-nav-bg"
                      className="absolute inset-0 bg-teal-electric/10 rounded-2xl border border-teal-electric/20"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  
                  <div className={`relative p-4 rounded-2xl transition-all duration-300 flex items-center justify-center ${
                    isActive 
                    ? 'text-teal-electric' 
                    : 'text-zinc-500 group-hover:text-zinc-200 group-hover:bg-white/5'
                  }`}>
                    <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                    
                    {/* Tooltip/Label */}
                    <AnimatePresence>
                      {hoveredItem === item.path && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="absolute left-20 px-4 py-2 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl pointer-events-none whitespace-nowrap"
                        >
                          <span className="text-xs font-bold text-white tracking-wide uppercase">{item.label}</span>
                          <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-zinc-900 border-l border-b border-white/10 rotate-45" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 w-full px-4">
          <NotificationCenter position="left" />
          
          <button 
            onClick={handleLogout}
            className="group relative p-4 text-zinc-500 hover:text-red-400 transition-all"
          >
            <div className="absolute inset-0 bg-red-400/0 group-hover:bg-red-400/10 rounded-2xl transition-all" />
            <LogOut size={24} className="relative" />
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-6 left-4 right-4 h-20 bg-navy-deep/95 backdrop-blur-3xl border border-white/10 rounded-[24px] flex items-center justify-around px-1 z-50 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              id={`mobile-${item.id}`}
              className="relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-300"
            >
              {isActive && (
                <motion.div 
                  layoutId="mobile-nav-indicator"
                  className="absolute inset-y-1.5 inset-x-0 bg-teal-electric rounded-[20px] shadow-[0_8px_25px_rgba(0,212,255,0.4)]"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              <motion.div 
                animate={isActive ? { scale: [1, 1.02, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`relative z-10 flex flex-col items-center justify-center gap-1 w-full h-full ${
                  isActive ? 'text-navy-deep' : 'text-zinc-500'
                }`}
              >
                <item.icon 
                  size={20} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  fill={isActive ? 'currentColor' : 'none'}
                />
                <span className={`text-[10px] font-black tracking-tight transition-all duration-300 ${
                  isActive ? 'opacity-100' : 'opacity-70'
                }`}>
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
