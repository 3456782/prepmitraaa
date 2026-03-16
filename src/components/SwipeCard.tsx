import React from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'motion/react';
import { UserProfile } from '../types';
import { MapPin, BookOpen, Clock, Check, X, Sparkles } from 'lucide-react';

interface SwipeCardProps {
  profile: UserProfile;
  onSwipe: (direction: 'left' | 'right') => void;
  isFront?: boolean;
}

export default function SwipeCard({ profile, onSwipe, isFront = true }: SwipeCardProps) {
  const x = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 30 });
  
  const rotate = useTransform(springX, [-200, 200], [-25, 25]);
  const opacity = useTransform(springX, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  const scale = useTransform(springX, [-150, 0, 150], [0.95, 1, 0.95]);
  
  const likeOpacity = useTransform(springX, [50, 150], [0, 1]);
  const nopeOpacity = useTransform(springX, [-50, -150], [0, 1]);
  const likeScale = useTransform(springX, [50, 150], [0.5, 1.2]);
  const nopeScale = useTransform(springX, [-50, -150], [0.5, 1.2]);

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 120) {
      onSwipe('right');
    } else if (info.offset.x < -120) {
      onSwipe('left');
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
      <motion.div
        drag={isFront ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        style={{ 
          x: springX, 
          rotate, 
          opacity,
          scale: isFront ? scale : 0.9,
          zIndex: isFront ? 10 : 0,
          filter: isFront ? 'none' : 'blur(4px)',
        }}
        onDragEnd={handleDragEnd}
        whileDrag={{ cursor: 'grabbing' }}
        className={`relative w-full max-w-sm aspect-[3/4] bg-zinc-900 rounded-[3rem] overflow-hidden border border-zinc-800 shadow-2xl pointer-events-auto transition-all duration-500 ${isFront ? 'cursor-grab' : 'opacity-40 scale-90 translate-y-4'}`}
      >
        {/* Profile Image */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent z-10" />
        <motion.img 
          src={profile.photoURL || `https://picsum.photos/seed/${profile.uid}/600/800`} 
          alt={profile.name}
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        />

        {/* AI Match Badge */}
        {(profile as any).matchScore !== undefined && isFront && (
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 z-20 bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 px-4 py-1.5 rounded-full flex items-center gap-2"
          >
            <Sparkles size={14} className="text-emerald-400" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
              AI Match: {Math.min(100, (profile as any).matchScore)}%
            </span>
          </motion.div>
        )}

        {/* Swipe Indicators */}
        <motion.div 
          style={{ opacity: likeOpacity, scale: likeScale }} 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-4 pointer-events-none"
        >
          <div className="bg-emerald-500 text-zinc-950 p-6 rounded-full shadow-[0_0_40px_rgba(16,185,129,0.6)]">
            <Check size={48} strokeWidth={4} />
          </div>
          <span className="text-emerald-500 font-black text-2xl uppercase tracking-[0.2em] drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">Match</span>
        </motion.div>

        <motion.div 
          style={{ opacity: nopeOpacity, scale: nopeScale }} 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-4 pointer-events-none"
        >
          <div className="bg-red-500 text-zinc-950 p-6 rounded-full shadow-[0_0_40px_rgba(239,68,68,0.6)]">
            <X size={48} strokeWidth={4} />
          </div>
          <span className="text-red-500 font-black text-2xl uppercase tracking-[0.2em] drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">Skip</span>
        </motion.div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
          <div className="space-y-1 mb-4">
            <h2 className="text-4xl font-black tracking-tight">{profile.name}</h2>
            <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
              <MapPin size={14} className="text-indigo-400" />
              <span>{profile.city}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <span className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border border-indigo-500/20">
              {profile.exam}
            </span>
            <span className="bg-zinc-800/80 text-zinc-300 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border border-white/5">
              {profile.language}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/5 backdrop-blur-sm p-3 rounded-2xl border border-white/5 flex flex-col gap-1">
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Study Hours</span>
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <Clock size={12} className="text-indigo-400" />
                <span>{profile.studyHoursStart} - {profile.studyHoursEnd}</span>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm p-3 rounded-2xl border border-white/5 flex flex-col gap-1">
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Daily Target</span>
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <BookOpen size={12} className="text-indigo-400" />
                <span>{profile.dailyTarget}h/day</span>
              </div>
            </div>
          </div>
          
          {/* AI Insight */}
          {isFront && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-2xl flex items-start gap-3"
            >
              <div className="mt-0.5 p-1 bg-emerald-500/20 rounded-md">
                <Sparkles size={12} className="text-emerald-400" />
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Great match! You both are preparing for <span className="text-emerald-400 font-bold">{profile.exam}</span> and have similar study schedules.
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
