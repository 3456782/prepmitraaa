import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, doc, getDoc, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
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
import DailyTasks from '../components/DailyTasks';

export default function Dashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [partnersCount, setPartnersCount] = useState(0);
  const [todayHours, setTodayHours] = useState(0);
  const [goalProgress, setGoalProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const unsubProfile = onSnapshot(doc(db, 'users', auth.currentUser.uid), async (snapshot) => {
      const profileData = snapshot.data() as UserProfile;
      setProfile(profileData);
      
      if (profileData) {
        const monthlyTarget = profileData.dailyTarget * 30;
        const progress = Math.min(100, Math.round((profileData.totalStudyHours / monthlyTarget) * 100));
        setGoalProgress(progress);

        // Check for missed day and reset/increment streak
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        const lastDate = profileData.lastStudyDate;
        
        if (!lastDate) {
          // First time visit
          await updateDoc(doc(db, 'users', auth.currentUser.uid), {
            streak: 1,
            lastStudyDate: todayStr
          });
        } else if (lastDate !== todayStr) {
          if (lastDate === yesterdayStr) {
            // Consecutive day
            await updateDoc(doc(db, 'users', auth.currentUser.uid), {
              streak: (profileData.streak || 0) + 1,
              lastStudyDate: todayStr
            });
          } else {
            // Missed a day or more
            await updateDoc(doc(db, 'users', auth.currentUser.uid), {
              streak: 1,
              lastStudyDate: todayStr
            });

            // Create notification
            await addDoc(collection(db, 'notifications'), {
              userId: auth.currentUser.uid,
              title: 'Streak Reset',
              message: "You missed a day! Don't worry, every day is a new chance to start fresh. Let's get back to it!",
              type: 'streak_reset',
              read: false,
              createdAt: serverTimestamp()
            });
          }
        }
      }
    });

    const q = query(
      collection(db, 'studySessions'),
      where('userId', '==', auth.currentUser.uid)
    );
    const unsubSessions = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudySession));
      setSessions(data);
      
    const today = new Date().toISOString().split('T')[0];
    const todaySessions = data.filter(s => s.timestamp?.toDate().toISOString().split('T')[0] === today);
      const totalTodaySeconds = todaySessions.reduce((acc, s) => acc + s.duration, 0);
      setTodayHours(Number((totalTodaySeconds / 3600).toFixed(1)));
      
      setLoading(false);
    });

    const qPartners = query(
      collection(db, 'matches'),
      where('users', 'array-contains', auth.currentUser.uid),
      where('status', '==', 'accepted')
    );
    const unsubPartners = onSnapshot(qPartners, (snapshot) => {
      setPartnersCount(snapshot.size);
    });

    return () => {
      unsubProfile();
      unsubSessions();
      unsubPartners();
    };
  }, []);

  // Calculate real chart data from sessions
  const getChartData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(now.getDate() - (6 - i));
      return {
        name: days[d.getDay()],
        date: d.toISOString().split('T')[0],
        hours: 0
      };
    });

    sessions.forEach(session => {
      if (!session.timestamp) return;
      const sessionDate = session.timestamp.toDate().toISOString().split('T')[0];
      const dayData = last7Days.find(d => d.date === sessionDate);
      if (dayData) {
        dayData.hours += session.duration / 3600; // convert seconds to hours
      }
    });

    return last7Days.map(({ name, hours }) => ({ name, hours: Number(hours.toFixed(1)) }));
  };

  const chartData = getChartData();

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
              <div className="text-4xl font-black mb-1">{goalProgress}%</div>
              <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Goal Progress</div>
            </div>
          </div>
          <div className="glass-card p-8 flex flex-col justify-between">
            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 mb-6">
              <Users size={24} />
            </div>
            <div>
              <div className="text-4xl font-black mb-1">{partnersCount}</div>
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

          {/* Daily Tasks Section */}
          <div className="md:col-span-3">
            <DailyTasks />
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
              "{profile?.totalStudyHours && profile.totalStudyHours > 0 
                ? `You've studied for ${profile.totalStudyHours} hours in total. You're ${Math.round((profile.totalStudyHours / (profile.dailyTarget * 30)) * 100)}% through your monthly goal!`
                : "You haven't started any study sessions yet. Let's get focused and start your first session today!"}"
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
