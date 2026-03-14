import React from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { UserProfile } from '../types';
import { MapPin, BookOpen, Clock, Check, X } from 'lucide-react';

interface SwipeCardProps {
  profile: UserProfile;
  onSwipe: (direction: 'left' | 'right') => void;
}

export default function SwipeCard({ profile, onSwipe }: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  const likeOpacity = useTransform(x, [50, 150], [0, 1]);
  const nopeOpacity = useTransform(x, [-50, -150], [0, 1]);

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 100) {
      onSwipe('right');
    } else if (info.offset.x < -100) {
      onSwipe('left');
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4">
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        style={{ x, rotate, opacity }}
        onDragEnd={handleDragEnd}
        className="relative w-full max-w-sm aspect-[3/4] bg-zinc-900 rounded-[2.5rem] overflow-hidden border border-zinc-800 shadow-2xl cursor-grab active:cursor-grabbing"
      >
        {/* Profile Image */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent z-10" />
        <img 
          src={profile.photoURL || `https://picsum.photos/seed/${profile.uid}/600/800`} 
          alt={profile.name}
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />

        {/* Swipe Indicators */}
        <motion.div style={{ opacity: likeOpacity }} className="absolute top-8 left-8 z-20 border-4 border-emerald-500 text-emerald-500 px-4 py-1 rounded-xl font-black text-3xl uppercase -rotate-12">
          Match
        </motion.div>
        <motion.div style={{ opacity: nopeOpacity }} className="absolute top-8 right-8 z-20 border-4 border-red-500 text-red-500 px-4 py-1 rounded-xl font-black text-3xl uppercase rotate-12">
          Skip
        </motion.div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
          <h2 className="text-3xl font-black mb-2">{profile.name}</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold border border-indigo-500/20">
              {profile.exam}
            </span>
            {(profile as any).matchScore !== undefined && (
              <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20">
                {Math.min(100, (profile as any).matchScore)}% Match
              </span>
            )}
            <span className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-xs font-bold">
              {profile.language}
            </span>
          </div>

          <div className="space-y-2 text-zinc-400 text-sm">
            <div className="flex items-center gap-2">
              <MapPin size={14} />
              <span>{profile.city}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} />
              <span>{profile.studyHoursStart} - {profile.studyHoursEnd}</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen size={14} />
              <span>Target: {profile.dailyTarget}h/day</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
