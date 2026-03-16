import { motion } from 'motion/react';
import { UserProfile } from '../types';
import { MessageSquare, X, BookOpen } from 'lucide-react';
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
      className="fixed inset-0 z-[100] bg-zinc-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center"
    >
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
            className="w-32 h-32 rounded-[2rem] border-4 border-emerald-500 object-cover shadow-2xl"
          />
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-zinc-950 p-3 rounded-full border border-zinc-800"
          >
            <BookOpen size={32} className="text-emerald-500" fill="currentColor" />
          </motion.div>
          <motion.img 
            initial={{ x: 50, rotate: 10 }}
            animate={{ x: 0, rotate: 5 }}
            src={partnerProfile.photoURL || `https://picsum.photos/seed/${partnerProfile.uid}/300/300`} 
            className="w-32 h-32 rounded-[2rem] border-4 border-emerald-500 object-cover shadow-2xl"
          />
        </div>
      </motion.div>

      <motion.h2 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-5xl font-black mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent italic"
      >
        IT'S A MATCH!
      </motion.h2>
      
      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-zinc-400 text-lg mb-12 max-w-xs"
      >
        You and {partnerProfile.name} are now study partners. Start planning your sessions!
      </motion.p>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col w-full max-w-xs gap-4"
      >
        <button 
          onClick={() => navigate('/chats')}
          className="w-full py-4 bg-emerald-500 text-zinc-950 font-bold rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.4)]"
        >
          <MessageSquare size={20} />
          Send a Message
        </button>
        <button 
          onClick={onClose}
          className="w-full py-4 bg-zinc-900 text-zinc-400 font-bold rounded-2xl border border-zinc-800"
        >
          Keep Swiping
        </button>
      </motion.div>
    </motion.div>
  );
}
