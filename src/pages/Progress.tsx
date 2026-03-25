import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  BarChart3, 
  BookOpen, 
  PlusCircle,
  TrendingUp,
  Award,
  ChevronRight,
  X
} from 'lucide-react';
import { Topic, PracticeTest, UserProfile } from '../types';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function Progress() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [tests, setTests] = useState<PracticeTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  
  const [newTopic, setNewTopic] = useState({ name: '', subject: '' });
  const [newTest, setNewTest] = useState({ title: '', score: '', totalMarks: '' });

  useEffect(() => {
    if (!auth.currentUser) return;

    const qTopics = query(
      collection(db, 'topics'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubTopics = onSnapshot(qTopics, (snapshot) => {
      setTopics(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Topic)));
    });

    const unsubProfile = onSnapshot(doc(db, 'users', auth.currentUser.uid), (snapshot) => {
      setProfile(snapshot.data() as UserProfile);
    });

    const qTests = query(
      collection(db, 'practiceTests'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('timestamp', 'asc')
    );

    const unsubTests = onSnapshot(qTests, (snapshot) => {
      setTests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PracticeTest)));
      setLoading(false);
    });

    return () => {
      unsubTopics();
      unsubProfile();
      unsubTests();
    };
  }, []);

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !newTopic.name || !newTopic.subject) return;

    await addDoc(collection(db, 'topics'), {
      userId: auth.currentUser.uid,
      name: newTopic.name,
      subject: newTopic.subject,
      completed: false,
      createdAt: serverTimestamp()
    });

    setNewTopic({ name: '', subject: '' });
    setShowTopicModal(false);
  };

  const toggleTopic = async (topic: Topic) => {
    await updateDoc(doc(db, 'topics', topic.id), {
      completed: !topic.completed
    });
  };

  const deleteTopic = async (id: string) => {
    await deleteDoc(doc(db, 'topics', id));
  };

  const handleAddTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !newTest.title || !newTest.score || !newTest.totalMarks) return;

    await addDoc(collection(db, 'practiceTests'), {
      userId: auth.currentUser.uid,
      title: newTest.title,
      score: Number(newTest.score),
      totalMarks: Number(newTest.totalMarks),
      date: new Date().toISOString().split('T')[0],
      timestamp: serverTimestamp()
    });

    setNewTest({ title: '', score: '', totalMarks: '' });
    setShowTestModal(false);
  };

  const deleteTest = async (id: string) => {
    await deleteDoc(doc(db, 'practiceTests', id));
  };

  const completedCount = topics.filter(t => t.completed).length;
  const progressPercent = topics.length > 0 ? Math.round((completedCount / topics.length) * 100) : 0;

  const chartData = tests.map(t => ({
    name: t.title,
    percentage: Math.round((t.score / t.totalMarks) * 100)
  }));

  if (loading) return null;

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tight">
            Study <span className="gradient-text">Progress</span>
          </h1>
          <p className="text-zinc-500 font-medium">Track your topics and test performance</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowTopicModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-teal-electric text-navy-deep font-bold rounded-2xl hover:bg-teal-electric/90 transition-all shadow-lg shadow-teal-electric/20"
          >
            <Plus size={20} /> Add Topic
          </button>
          <button 
            onClick={() => setShowTestModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 text-white font-bold rounded-2xl border border-white/5 hover:bg-white/10 transition-all"
          >
            <PlusCircle size={20} /> Log Test
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Progress Overview */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <BookOpen className="text-teal-electric" size={20} /> Topics Overview
              </h3>
              <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
                {completedCount} / {topics.length} Completed
              </div>
            </div>
            
            <div className="relative h-4 bg-zinc-900 rounded-full overflow-hidden mb-8">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-teal-electric to-blue-600 shadow-[0_0_20px_rgba(0,212,255,0.4)]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {topics.map((topic) => (
                  <motion.div
                    key={topic.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between group ${
                      topic.completed 
                      ? 'bg-teal-electric/5 border-teal-electric/20' 
                      : 'bg-zinc-950/50 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => toggleTopic(topic)}
                        className={`transition-colors ${topic.completed ? 'text-teal-electric' : 'text-zinc-600 hover:text-zinc-400'}`}
                      >
                        {topic.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                      </button>
                      <div>
                        <h4 className={`font-bold text-sm ${topic.completed ? 'text-zinc-400 line-through' : 'text-zinc-100'}`}>
                          {topic.name}
                        </h4>
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{topic.subject}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteTopic(topic.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-zinc-600 hover:text-red-400 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {topics.length === 0 && (
                <div className="md:col-span-2 py-12 text-center text-zinc-500 font-medium italic">
                  No topics added yet. Start by adding your first study topic!
                </div>
              )}
            </div>
          </div>

          {/* Test Performance Chart */}
          <div className="glass-card p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <TrendingUp className="text-emerald-400" size={20} /> Performance Trend
              </h3>
              <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
                Practice Test Scores (%)
              </div>
            </div>
            <div className="h-[300px] w-full">
              {tests.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                    />
                    <Line type="monotone" dataKey="percentage" stroke="#10b981" strokeWidth={4} dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }} activeDot={{ r: 8, strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-500 font-medium italic">
                  Log your first test score to see your performance trend!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-8">
          <div className="glass-card p-8 bg-gradient-to-br from-emerald-600/10 to-cyan-600/10 border-emerald-500/20">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400">
                <Award size={24} />
              </div>
              <div>
                <h4 className="font-bold">Latest Score</h4>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Practice Test</span>
              </div>
            </div>
            {tests.length > 0 ? (
              <>
                <div className="text-4xl font-black mb-1">
                  {Math.round((tests[tests.length - 1].score / tests[tests.length - 1].totalMarks) * 100)}%
                </div>
                <p className="text-sm text-zinc-400 mb-6">
                  {tests[tests.length - 1].title} ({tests[tests.length - 1].score}/{tests[tests.length - 1].totalMarks})
                </p>
              </>
            ) : (
              <p className="text-sm text-zinc-400 mb-6">No tests logged yet.</p>
            )}
            <button 
              onClick={() => setShowTestModal(true)}
              className="w-full py-3 bg-emerald-500 text-zinc-950 font-bold rounded-xl text-sm hover:bg-emerald-400 transition-all"
            >
              Log New Result
            </button>
          </div>

          <div className="glass-card p-8">
            <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-6">Recent Tests</h4>
            <div className="space-y-4">
              {tests.slice(-3).reverse().map((test) => (
                <div key={test.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-zinc-500">
                      <BarChart3 size={14} />
                    </div>
                    <div>
                      <div className="text-sm font-bold">{test.title}</div>
                      <div className="text-[10px] text-zinc-500">{test.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-emerald-400">{Math.round((test.score / test.totalMarks) * 100)}%</span>
                    <button 
                      onClick={() => deleteTest(test.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-zinc-600 hover:text-red-400 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {tests.length === 0 && (
                <div className="text-center text-zinc-600 text-sm italic">No test history</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Topic Modal */}
      <AnimatePresence>
        {showTopicModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTopicModal(false)}
              className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md glass-card p-8"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black">Add New <span className="gradient-text">Topic</span></h3>
                <button onClick={() => setShowTopicModal(false)} className="text-zinc-500 hover:text-white"><X size={24} /></button>
              </div>
              <form onSubmit={handleAddTopic} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Topic Name</label>
                  <input 
                    autoFocus
                    required
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl py-3 px-4 focus:border-teal-electric outline-none transition-all"
                    placeholder="e.g. Thermodynamics"
                    value={newTopic.name}
                    onChange={e => setNewTopic({...newTopic, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Subject</label>
                  <input 
                    required
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl py-3 px-4 focus:border-teal-electric outline-none transition-all"
                    placeholder="e.g. Physics"
                    value={newTopic.subject}
                    onChange={e => setNewTopic({...newTopic, subject: e.target.value})}
                  />
                </div>
                <button className="w-full py-4 bg-teal-electric text-navy-deep font-bold rounded-xl hover:bg-teal-electric/90 transition-all shadow-lg shadow-teal-electric/20">
                  Add to List
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Test Modal */}
      <AnimatePresence>
        {showTestModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTestModal(false)}
              className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md glass-card p-8"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black">Log Test <span className="gradient-text">Result</span></h3>
                <button onClick={() => setShowTestModal(false)} className="text-zinc-500 hover:text-white"><X size={24} /></button>
              </div>
              <form onSubmit={handleAddTest} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Test Title</label>
                  <input 
                    autoFocus
                    required
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl py-3 px-4 focus:border-emerald-500 outline-none transition-all"
                    placeholder="e.g. Mock Test #1"
                    value={newTest.title}
                    onChange={e => setNewTest({...newTest, title: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Score</label>
                    <input 
                      required
                      type="number"
                      className="w-full bg-zinc-950 border border-white/10 rounded-xl py-3 px-4 focus:border-emerald-500 outline-none transition-all"
                      placeholder="0"
                      value={newTest.score}
                      onChange={e => setNewTest({...newTest, score: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Total Marks</label>
                    <input 
                      required
                      type="number"
                      className="w-full bg-zinc-950 border border-white/10 rounded-xl py-3 px-4 focus:border-emerald-500 outline-none transition-all"
                      placeholder="100"
                      value={newTest.totalMarks}
                      onChange={e => setNewTest({...newTest, totalMarks: e.target.value})}
                    />
                  </div>
                </div>
                <button className="w-full py-4 bg-emerald-500 text-zinc-950 font-bold rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20">
                  Save Result
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
