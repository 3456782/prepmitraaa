import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { 
  Home, 
  Search, 
  MessageSquare, 
  Trophy, 
  User, 
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = auth.currentUser;

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  if (!user && location.pathname === '/') return null;

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/swipe', icon: Search, label: 'Match' },
    { path: '/chats', icon: MessageSquare, label: 'Chats' },
    { path: '/leaderboard', icon: Trophy, label: 'Ranks' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col fixed left-0 top-0 h-full w-20 bg-zinc-900/50 backdrop-blur-xl border-r border-white/5 py-8 items-center justify-between z-50">
        <Link to="/" className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <span className="text-white font-black text-xl">P</span>
        </Link>
        
        <div className="flex flex-col gap-8">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              className={`p-3 rounded-2xl transition-all duration-300 ${
                location.pathname === item.path 
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/40' 
                : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <item.icon size={24} />
            </Link>
          ))}
        </div>

        <button 
          onClick={handleLogout}
          className="p-3 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all"
        >
          <LogOut size={24} />
        </button>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-zinc-900/80 backdrop-blur-2xl border-t border-white/5 flex items-center justify-around px-4 z-50 pb-safe">
        {navItems.map((item) => (
          <Link 
            key={item.path} 
            to={item.path}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${
              location.pathname === item.path ? 'text-indigo-400' : 'text-zinc-500'
            }`}
          >
            <item.icon size={24} />
            <span className="text-[10px] font-medium">{item.label}</span>
            {location.pathname === item.path && (
              <motion.div 
                layoutId="nav-indicator"
                className="absolute -bottom-1 w-1 h-1 bg-indigo-400 rounded-full"
              />
            )}
          </Link>
        ))}
      </nav>
    </>
  );
}
