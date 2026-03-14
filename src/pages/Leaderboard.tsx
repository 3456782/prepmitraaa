import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Trophy, Medal, Crown, TrendingUp } from 'lucide-react';
import { UserProfile } from '../types';

export default function Leaderboard() {
  const [topUsers, setTopUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      orderBy('totalStudyHours', 'desc'),
      limit(10)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => doc.data() as UserProfile);
      setTopUsers(users);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) return null;

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto space-y-12">
      <header className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center text-indigo-400 mx-auto mb-6"
        >
          <Trophy size={40} />
        </motion.div>
        <h1 className="text-4xl font-black mb-2">Hall of <span className="gradient-text">Fame</span></h1>
        <p className="text-zinc-500 font-medium">The most consistent aspirants this month</p>
      </header>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4 items-end pt-10">
        {topUsers.slice(0, 3).map((user, i) => {
          const order = [1, 0, 2][i]; // 2nd, 1st, 3rd
          const displayUser = topUsers[order];
          if (!displayUser) return null;
          
          return (
            <motion.div 
              key={displayUser.uid}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center"
            >
              <div className="relative mb-4">
                <img 
                  src={displayUser.photoURL || `https://picsum.photos/seed/${displayUser.uid}/100/100`} 
                  className={`rounded-full object-cover border-4 ${order === 0 ? 'w-24 h-24 border-yellow-500' : 'w-20 h-20 border-zinc-700'}`}
                  alt=""
                />
                {order === 0 && <Crown className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-500" size={32} fill="currentColor" />}
              </div>
              <div className={`w-full glass-card p-4 text-center ${order === 0 ? 'h-40 bg-indigo-500/10' : 'h-32'}`}>
                <h4 className="font-bold text-sm truncate">{displayUser.name.split(' ')[0]}</h4>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">{displayUser.exam}</p>
                <div className="text-xl font-black text-indigo-400">{displayUser.totalStudyHours}h</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* List */}
      <div className="space-y-4">
        {topUsers.slice(3).map((user, i) => (
          <motion.div
            key={user.uid}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: (i + 3) * 0.05 }}
            className="glass-card p-4 flex items-center justify-between group hover:bg-zinc-900/60 transition-all"
          >
            <div className="flex items-center gap-4">
              <span className="w-8 text-center font-black text-zinc-700 group-hover:text-indigo-500 transition-colors">#{i + 4}</span>
              <img 
                src={user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`} 
                className="w-10 h-10 rounded-full object-cover border border-white/5"
                alt=""
              />
              <div>
                <h4 className="font-bold text-sm">{user.name}</h4>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{user.exam}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-lg font-black text-zinc-100">{user.totalStudyHours}h</div>
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Time</div>
              </div>
              <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center text-emerald-500">
                <TrendingUp size={18} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
