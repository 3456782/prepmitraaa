import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { motion } from 'motion/react';
import { Mail, Lock, ArrowRight, Github } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/setup');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate('/setup');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-teal-electric/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-teal-electric/10 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card w-full max-w-md p-10 relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-teal-electric rounded-2xl flex items-center justify-center font-black text-2xl mx-auto mb-6 shadow-xl shadow-teal-electric/20 text-navy-deep">P</div>
          <h2 className="text-3xl font-black mb-2">{isLogin ? 'Welcome Back' : 'Join PrepMitra'}</h2>
          <p className="text-zinc-500 font-medium">
            {isLogin ? 'Start studying with your partners' : 'Create an account to find study partners'}
          </p>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="w-full py-4 bg-white text-zinc-950 font-bold rounded-2xl flex items-center justify-center gap-3 mb-8 hover:bg-zinc-100 transition-all active:scale-95"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
          Continue with Google
        </button>

        <div className="relative mb-8 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
          <span className="relative bg-zinc-900 px-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Or with email</span>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
            <input 
              type="email" 
              placeholder="Email address"
              className="w-full bg-zinc-950/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-teal-electric outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
            <input 
              type="password" 
              placeholder="Password"
              className="w-full bg-zinc-950/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-teal-electric outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-400 text-sm font-medium text-center">{error}</p>}

          <button 
            type="submit"
            className="w-full py-4 bg-teal-electric text-navy-deep font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-teal-electric/90 transition-all active:scale-95 shadow-lg shadow-teal-electric/20"
          >
            {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={20} />
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-bold text-zinc-500 hover:text-teal-electric transition-colors"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
