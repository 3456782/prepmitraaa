import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'motion/react';
import { User, Book, Clock, Target, Globe, MapPin } from 'lucide-react';

export default function ProfileSetup() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: auth.currentUser?.displayName || '',
    exam: '',
    subjects: [] as string[],
    studyHoursStart: '09:00',
    studyHoursEnd: '18:00',
    dailyTarget: 6,
    language: 'English',
    city: '',
  });
  const navigate = useNavigate();

  const exams = ['SSC', 'UPSC', 'Railway', 'Banking', 'GATE', 'JEE', 'NEET', 'State Exams'];
  const languages = ['English', 'Hindi', 'Bengali', 'Marathi', 'Telugu', 'Tamil', 'Other'];

  const handleSubmit = async () => {
    if (!auth.currentUser) return;
    
    await setDoc(doc(db, 'users', auth.currentUser.uid), {
      ...formData,
      uid: auth.currentUser.uid,
      email: auth.currentUser.email,
      photoURL: auth.currentUser.photoURL,
      streak: 0,
      totalStudyHours: 0,
      createdAt: serverTimestamp(),
    });
    
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-teal-electric/10 rounded-full blur-[120px]" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-full max-w-2xl p-10 relative z-10"
      >
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-black mb-2">Complete Your Profile</h2>
            <p className="text-zinc-500 font-medium">Step {step} of 3</p>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`w-10 h-1.5 rounded-full transition-all ${step >= s ? 'bg-teal-electric' : 'bg-zinc-800'}`} />
            ))}
          </div>
        </div>

        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-400 flex items-center gap-2 uppercase tracking-widest">
                  <User size={14} /> Full Name
                </label>
                <input 
                  className="w-full bg-zinc-950/50 border border-white/10 rounded-2xl py-4 px-6 focus:border-teal-electric outline-none transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-400 flex items-center gap-2 uppercase tracking-widest">
                  <MapPin size={14} /> City
                </label>
                <input 
                  className="w-full bg-zinc-950/50 border border-white/10 rounded-2xl py-4 px-6 focus:border-teal-electric outline-none transition-all"
                  placeholder="e.g. Delhi"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-sm font-bold text-zinc-400 flex items-center gap-2 uppercase tracking-widest">
                <Book size={14} /> Target Exam
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {exams.map((exam) => (
                  <button
                    key={exam}
                    onClick={() => setFormData({...formData, exam})}
                    className={`py-4 px-4 rounded-2xl border font-bold transition-all ${
                      formData.exam === exam 
                      ? 'bg-teal-electric border-teal-electric text-navy-deep shadow-lg shadow-teal-electric/20' 
                      : 'bg-zinc-950/50 border-white/5 text-zinc-500 hover:border-white/20'
                    }`}
                  >
                    {exam}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="space-y-6">
              <label className="text-sm font-bold text-zinc-400 flex items-center gap-2 uppercase tracking-widest">
                <Clock size={14} /> Study Schedule
              </label>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-zinc-600">Start Time</span>
                  <input 
                    type="time"
                    className="w-full bg-zinc-950/50 border border-white/10 rounded-2xl py-4 px-6 focus:border-teal-electric outline-none transition-all"
                    value={formData.studyHoursStart}
                    onChange={(e) => setFormData({...formData, studyHoursStart: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-bold text-zinc-600">End Time</span>
                  <input 
                    type="time"
                    className="w-full bg-zinc-950/50 border border-white/10 rounded-2xl py-4 px-6 focus:border-teal-electric outline-none transition-all"
                    value={formData.studyHoursEnd}
                    onChange={(e) => setFormData({...formData, studyHoursEnd: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-400 flex items-center gap-2 uppercase tracking-widest">
                <Target size={14} /> Daily Target (Hours)
              </label>
              <input 
                type="range" min="1" max="16"
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-teal-electric"
                value={formData.dailyTarget}
                onChange={(e) => setFormData({...formData, dailyTarget: parseInt(e.target.value)})}
              />
              <div className="text-center font-black text-3xl text-teal-electric">{formData.dailyTarget} Hours</div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="space-y-4">
              <label className="text-sm font-bold text-zinc-400 flex items-center gap-2 uppercase tracking-widest">
                <Globe size={14} /> Preferred Language
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setFormData({...formData, language: lang})}
                    className={`py-3 px-4 rounded-xl border font-bold text-sm transition-all ${
                      formData.language === lang 
                      ? 'bg-teal-electric border-teal-electric text-navy-deep shadow-lg shadow-teal-electric/20' 
                      : 'bg-zinc-950/50 border-white/5 text-zinc-500 hover:border-white/20'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-6 bg-teal-electric/10 border border-teal-electric/20 rounded-3xl">
              <h4 className="font-bold text-teal-electric mb-2">Ready to match!</h4>
              <p className="text-sm text-zinc-400">We'll use these details to find the best study partners for you. You can change these anytime in your profile.</p>
            </div>
          </motion.div>
        )}

        <div className="mt-12 flex gap-4">
          {step > 1 && (
            <button 
              onClick={() => setStep(step - 1)}
              className="flex-1 py-4 bg-zinc-900 text-zinc-400 font-bold rounded-2xl border border-white/5 hover:bg-zinc-800 transition-all"
            >
              Back
            </button>
          )}
          <button 
            onClick={step === 3 ? handleSubmit : () => setStep(step + 1)}
            className="flex-[2] py-4 bg-teal-electric text-navy-deep font-bold rounded-2xl hover:bg-teal-electric/90 transition-all active:scale-95 shadow-lg shadow-teal-electric/20"
          >
            {step === 3 ? 'Finish Setup' : 'Continue'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
