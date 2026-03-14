import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, doc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'motion/react';
import { 
  Timer, 
  Flame, 
  Users, 
  TrendingUp, 
  Play, 
  Pause, 
  RotateCcw,
  Calendar,
  Award,
  Brain
} from 'lucide-react';
import { UserProfile, StudySession } from '../types';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import PomodoroTimer from '../components/PomodoroTimer';

export default function Dashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const unsubProfile = onSnapshot(doc(db, 'users', auth.currentUser.uid), (doc) => {
      setProfile(doc.data() as UserProfile);
    });

    const q = query(
      collection(db, 'studySessions'),
      where('userId', '==', auth.currentUser.uid)
    );
    const unsubSessions = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudySession));
      setSessions(data);
      setLoading(false);
    });

    return () => {
      unsubProfile();
      unsubSessions();
    };
  }, []);

  const chartData = [
    { name: 'Mon', hours: 4 },
    { name: 'Tue', hours: 6 },
    { name: 'Wed', hours: 3 },
    { name: 'Thu', hours: 8 },
    { name: 'Fri', hours: 5 },
    { name: 'Sat', hours: 7 },
    { name: 'Sun', hours: 2 },
  ];

  if (loading) return null;

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tight">
            Hello, <span className="gradient-text">{profile?.name.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-zinc-500 font-medium">Ready to crush your {profile?.exam} goals today?</p>
        </div>
        <div className="flex gap-4">
          <div className="glass-card px-6 py-3 flex items-center gap-3">
            <Flame className="text-orange-500" size={20} fill="currentColor" />
            <span className="font-black text-xl">{profile?.streak}</span>
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Day Streak</span>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Stats */}
        <div className="lg:col-span-2 grid md:grid-cols-3 gap-6">
          <div className="glass-card p-8 flex flex-col justify-between">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 mb-6">
              <Timer size={24} />
            </div>
            <div>
              <div className="text-4xl font-black mb-1">{profile?.totalStudyHours}h</div>
              <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Total Study Time</div>
            </div>
          </div>
          <div className="glass-card p-8 flex flex-col justify-between">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 mb-6">
              <TrendingUp size={24} />
            </div>
            <div>
              <div className="text-4xl font-black mb-1">{Math.round((profile?.totalStudyHours || 0) / (profile?.dailyTarget || 1) * 100)}%</div>
              <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Goal Progress</div>
            </div>
          </div>
          <div className="glass-card p-8 flex flex-col justify-between">
            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 mb-6">
              <Users size={24} />
            </div>
            <div>
              <div className="text-4xl font-black mb-1">12</div>
              <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Study Partners</div>
            </div>
          </div>

          {/* Activity Chart */}
          <div className="md:col-span-3 glass-card p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Calendar className="text-indigo-400" size={20} /> Weekly Activity
              </h3>
              <select className="bg-zinc-950 border border-white/5 rounded-xl px-4 py-2 text-sm font-bold outline-none">
                <option>This Week</option>
                <option>Last Week</option>
              </select>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorHours)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Pomodoro Timer Widget */}
        <div className="space-y-8">
          <PomodoroTimer />
          
          {/* AI Mentor Widget */}
          <div className="glass-card p-8 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border-indigo-500/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white">
                <Brain size={20} />
              </div>
              <div>
                <h4 className="font-bold">AI Study Mentor</h4>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Online</span>
              </div>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed mb-6 italic">
              "You've studied for 4 hours today. That's 20% more than your average! Keep going, you're doing great."
            </p>
            <button className="w-full py-3 bg-indigo-500 text-white font-bold rounded-xl text-sm hover:bg-indigo-400 transition-all">
              Ask for Tips
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
