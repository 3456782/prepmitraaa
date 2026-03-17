import React from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'motion/react';
import { UserProfile } from '../types';
import { MapPin, BookOpen, Clock, Check, X, Sparkles, Star, Zap } from 'lucide-react';

interface SwipeCardProps {
  profile: UserProfile;
  onSwipe: (direction: 'left' | 'right' | 'up') => void;
  isFront?: boolean;
}

export default function SwipeCard({ profile, onSwipe, isFront = true }: SwipeCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springX = useSpring(x, { stiffness: 300, damping: 30, mass: 0.8 });
  const springY = useSpring(y, { stiffness: 300, damping: 30, mass: 0.8 });
  
  const rotate = useTransform(springX, [-200, 200], [-20, 20]);
  const rotateX = useTransform(springY, [-300, 300], [10, -10]);
  const rotateY = useTransform(springX, [-300, 300], [-10, 10]);
  const opacity = useTransform(springX, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  const scale = useTransform(springX, [-150, 0, 150], [0.95, 1, 0.95]);
  
  // Overlays
  const likeOpacity = useTransform(springX, [40, 120], [0, 1]);
  const nopeOpacity = useTransform(springX, [-40, -120], [0, 1]);
  const superOpacity = useTransform(springY, [-40, -120], [0, 1]);
  
  const likeScale = useTransform(springX, [40, 120], [0.5, 1.2]);
  const nopeScale = useTransform(springX, [-40, -120], [0.5, 1.2]);
  const superScale = useTransform(springY, [-40, -120], [0.5, 1.2]);
  
  const perspective = 1000;

  const handleDragEnd = (_: any, info: any) => {
    const threshold = 100;
    const velocityThreshold = 500;

    if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
      onSwipe('right');
    } else if (info.offset.x < -threshold || info.velocity.x < -velocityThreshold) {
      onSwipe('left');
    } else if (info.offset.y < -threshold || info.velocity.y < -velocityThreshold) {
      onSwipe('up');
    } else {
      // Reset position
      x.set(0);
      y.set(0);
    }
  };

  const motivationalLines = [
    "Preparing alone? Not anymore.",
    "Find someone as serious as you.",
    "Consistency is key. Study together.",
    "Your future self will thank you.",
    "Double the focus, half the stress."
  ];
  const randomLine = motivationalLines[Math.abs(profile.uid.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % motivationalLines.length];

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none" style={{ perspective }}>
      <motion.div
        drag={isFront ? true : false}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.9}
        style={{ 
          x: springX, 
          y: springY,
          rotate, 
          rotateX,
          rotateY,
          opacity,
          scale: isFront ? scale : 0.9,
          zIndex: isFront ? 10 : 0,
          filter: isFront ? 'none' : 'blur(2px)',
          transformStyle: 'preserve-3d'
        }}
        onDragEnd={handleDragEnd}
        whileDrag={{ cursor: 'grabbing', scale: 1.02 }}
        className={`relative w-full max-w-sm aspect-[3/4.5] bg-zinc-900 rounded-[2.5rem] overflow-hidden border border-zinc-800 shadow-2xl pointer-events-auto transition-all duration-500 ${isFront ? 'cursor-grab' : 'opacity-40 scale-90 translate-y-8'}`}
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
            className="absolute top-6 left-6 z-20 bg-indigo-500/20 backdrop-blur-md border border-indigo-500/30 px-3 py-1 rounded-full flex items-center gap-2"
          >
            <Sparkles size={12} className="text-indigo-400" />
            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">
              {Math.min(100, (profile as any).matchScore)}% Match
            </span>
          </motion.div>
        )}

        {/* Consistency Badge */}
        {isFront && (
          <div className="absolute top-6 right-6 z-20 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-2">
            <Zap size={12} className="text-emerald-400" />
            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">
              {profile.consistency || 85}% Consistency
            </span>
          </div>
        )}

        {/* Swipe Indicators */}
        <motion.div 
          style={{ opacity: likeOpacity, scale: likeScale }} 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-4 pointer-events-none"
        >
          <div className="bg-emerald-500 text-zinc-950 p-6 rounded-full shadow-[0_0_50px_rgba(16,185,129,0.8)] border-4 border-white/20">
            <Check size={48} strokeWidth={4} />
          </div>
          <span className="text-emerald-500 font-black text-3xl uppercase tracking-[0.3em] drop-shadow-[0_4px_15px_rgba(0,0,0,0.8)]">Partner</span>
        </motion.div>

        <motion.div 
          style={{ opacity: nopeOpacity, scale: nopeScale }} 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-4 pointer-events-none"
        >
          <div className="bg-red-500 text-zinc-950 p-6 rounded-full shadow-[0_0_50px_rgba(239,68,68,0.8)] border-4 border-white/20">
            <X size={48} strokeWidth={4} />
          </div>
          <span className="text-red-500 font-black text-3xl uppercase tracking-[0.3em] drop-shadow-[0_4px_15px_rgba(0,0,0,0.8)]">Skip</span>
        </motion.div>

        <motion.div 
          style={{ opacity: superOpacity, scale: superScale }} 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-4 pointer-events-none"
        >
          <div className="bg-indigo-500 text-white p-6 rounded-full shadow-[0_0_50px_rgba(99,102,241,0.8)] border-4 border-white/20">
            <Star size={48} strokeWidth={4} fill="currentColor" />
          </div>
          <span className="text-indigo-400 font-black text-3xl uppercase tracking-[0.3em] drop-shadow-[0_4px_15px_rgba(0,0,0,0.8)]">Super Match</span>
        </motion.div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
          <div className="space-y-1 mb-4">
            <div className="flex items-end gap-3">
              <h2 className="text-4xl font-black tracking-tight">{profile.name}</h2>
              <span className="text-zinc-400 font-bold text-xl mb-1">{profile.streak} 🔥</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
              <MapPin size={14} className="text-indigo-400" />
              <span>{profile.city}</span>
            </div>
          </div>

          {profile.bio && (
            <p className="text-zinc-300 text-sm mb-6 line-clamp-2 leading-relaxed italic">
              "{profile.bio}"
            </p>
          )}

          <div className="flex flex-wrap gap-2 mb-6">
            <span className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border border-indigo-500/20">
              {profile.exam}
            </span>
            <span className="bg-zinc-800/80 text-zinc-300 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border border-white/5">
              {profile.language}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
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
          
          {/* Emotional Hook */}
          {isFront && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center pt-2 border-t border-white/5"
            >
              <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest animate-pulse">
                {randomLine}
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
