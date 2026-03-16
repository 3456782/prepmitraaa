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
          scale,
          zIndex: isFront ? 10 : 0
        }}
        onDragEnd={handleDragEnd}
        whileDrag={{ cursor: 'grabbing' }}
        className={`relative w-full max-w-sm aspect-[3/4] bg-zinc-900 rounded-[2.5rem] overflow-hidden border border-zinc-800 shadow-2xl pointer-events-auto ${isFront ? 'cursor-grab' : ''}`}
      >
        {/* Profile Image */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent z-10" />
        <motion.img 
          src={profile.photoURL || `https://picsum.photos/seed/${profile.uid}/600/800`} 
          alt={profile.name}
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        />

        {/* Swipe Indicators */}
        <motion.div 
          style={{ opacity: likeOpacity, scale: likeScale }} 
          className="absolute top-12 left-12 z-20 flex flex-col items-center gap-1"
        >
          <div className="bg-emerald-500 text-zinc-950 p-4 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)]">
            <Check size={40} strokeWidth={3} />
          </div>
          <span className="text-emerald-500 font-black text-xl uppercase tracking-widest drop-shadow-lg">Match</span>
        </motion.div>

        <motion.div 
          style={{ opacity: nopeOpacity, scale: nopeScale }} 
          className="absolute top-12 right-12 z-20 flex flex-col items-center gap-1"
        >
          <div className="bg-red-500 text-zinc-950 p-4 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.5)]">
            <X size={40} strokeWidth={3} />
          </div>
          <span className="text-red-500 font-black text-xl uppercase tracking-widest drop-shadow-lg">Skip</span>
        </motion.div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-3xl font-black">{profile.name}</h2>
            {(profile as any).matchScore !== undefined && (
              <div className="flex items-center gap-1 text-emerald-400">
                <Sparkles size={16} />
                <span className="text-sm font-bold">{Math.min(100, (profile as any).matchScore)}%</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-indigo-500/20">
              {profile.exam}
            </span>
            <span className="bg-zinc-800/50 text-zinc-300 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-white/5">
              {profile.language}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-zinc-400 text-xs font-medium">
            <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/5">
              <MapPin size={14} className="text-indigo-400" />
              <span className="truncate">{profile.city}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/5">
              <Clock size={14} className="text-indigo-400" />
              <span>{profile.studyHoursStart} - {profile.studyHoursEnd}</span>
            </div>
          </div>
          
          <div className="mt-4 flex items-center gap-2 bg-indigo-500/5 p-3 rounded-2xl border border-indigo-500/10">
            <BookOpen size={16} className="text-indigo-400" />
            <span className="text-zinc-300">Target: <span className="text-white font-bold">{profile.dailyTarget}h</span> / day</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
