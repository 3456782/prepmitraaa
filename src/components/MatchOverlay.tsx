import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import { MessageSquare, X, BookOpen, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MatchOverlayProps {
  myProfile: UserProfile;
  partnerProfile: UserProfile;
  onClose: () => void;
}

export default function MatchOverlay({ myProfile, partnerProfile, onClose }: MatchOverlayProps) {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-zinc-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center overflow-hidden"
    >
      {/* Background Sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              opacity: 0, 
              scale: 0,
              x: Math.random() * 400,
              y: Math.random() * 800 
            }}
            animate={{ 
              opacity: [0, 1, 0], 
              scale: [0, 1, 0],
              y: '-=100'
            }}
            transition={{ 
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
            className="absolute text-teal-electric/30"
          >
            <Sparkles size={Math.random() * 20 + 10} />
          </motion.div>
        ))}
      </div>
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="relative mb-12"
      >
        <div className="flex items-center gap-4 relative">
          <motion.img 
            initial={{ x: -50, rotate: -10 }}
            animate={{ x: 0, rotate: -5 }}
            src={myProfile.photoURL || `https://picsum.photos/seed/${myProfile.uid}/300/300`} 
            className="w-32 h-32 rounded-[2rem] border-4 border-teal-electric object-cover shadow-2xl"
          />
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-zinc-950 p-3 rounded-full border border-zinc-800"
          >
            <BookOpen size={32} className="text-teal-electric" fill="currentColor" />
          </motion.div>
          <motion.img 
            initial={{ x: 50, rotate: 10 }}
            animate={{ x: 0, rotate: 5 }}
            src={partnerProfile.photoURL || `https://picsum.photos/seed/${partnerProfile.uid}/300/300`} 
            className="w-32 h-32 rounded-[2rem] border-4 border-teal-electric object-cover shadow-2xl"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <h2 className="text-7xl font-black mb-4 bg-gradient-to-r from-teal-electric via-cyan-400 to-teal-electric bg-clip-text text-transparent italic tracking-tighter leading-tight">
          IT'S A MATCH!
        </h2>
        
        <p className="text-zinc-400 text-xl mb-12 max-w-xs mx-auto leading-relaxed font-medium">
          You and <span className="text-white font-black">{partnerProfile.name}</span> are now study partners. Ready to crush those goals?
        </p>
      </motion.div>

      <motion.div 
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex flex-col w-full max-w-xs gap-4"
      >
        <button 
          onClick={() => navigate('/chats')}
          className="w-full py-5 bg-teal-electric text-navy-deep font-black rounded-2xl flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(0,212,255,0.3)] hover:scale-105 transition-transform active:scale-95"
        >
          <MessageSquare size={24} fill="currentColor" />
          START CHATTING
        </button>
        <button 
          onClick={onClose}
          className="w-full py-5 bg-zinc-900 text-zinc-400 font-bold rounded-2xl border border-zinc-800 hover:bg-zinc-800 transition-colors"
        >
          Keep Swiping
        </button>
      </motion.div>
    </motion.div>
  );
}
