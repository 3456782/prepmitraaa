import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';

export default function PomodoroTimer() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          handleTimerComplete();
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds]);

  const handleTimerComplete = async () => {
    setIsActive(false);
    if (!isBreak) {
      // Log study session
      if (auth.currentUser) {
        const durationSeconds = 25 * 60;
        await addDoc(collection(db, 'studySessions'), {
          userId: auth.currentUser.uid,
          duration: durationSeconds,
          date: new Date().toISOString().split('T')[0],
          timestamp: serverTimestamp(),
        });
        
        // Update user's total study hours
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          totalStudyHours: increment(25 / 60) // increment by hours
        });
      }
      alert('Focus session complete! Take a break.');
      setMinutes(5);
      setIsBreak(true);
    } else {
      alert('Break over! Time to focus.');
      setMinutes(25);
      setIsBreak(false);
    }
    setSeconds(0);
  };

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setMinutes(isBreak ? 5 : 25);
    setSeconds(0);
  };

  return (
    <div className="glass-card p-8 text-center relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-zinc-800">
        <div 
          className="h-full bg-indigo-500 transition-all duration-1000" 
          style={{ width: `${((isBreak ? 5*60 : 25*60) - (minutes*60 + seconds)) / (isBreak ? 5*60 : 25*60) * 100}%` }}
        />
      </div>
      
      <div className="flex items-center justify-center gap-2 mb-6">
        {isBreak ? (
          <Coffee className="text-emerald-400" size={20} />
        ) : (
          <Brain className="text-indigo-400" size={20} />
        )}
        <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
          {isBreak ? 'Break Time' : 'Focus Session'}
        </span>
      </div>

      <div className="text-7xl font-black mb-8 tabular-nums tracking-tighter">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>

      <div className="flex items-center justify-center gap-4">
        <button 
          onClick={toggleTimer}
          className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-lg ${
            isActive 
            ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700' 
            : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/20'
          }`}
        >
          {isActive ? <Pause size={28} fill="currentColor" /> : <Play size={28} className="ml-1" fill="currentColor" />}
        </button>
        <button 
          onClick={resetTimer}
          className="w-16 h-16 bg-zinc-900 text-zinc-500 rounded-2xl flex items-center justify-center hover:bg-zinc-800 transition-all active:scale-90 border border-white/5"
        >
          <RotateCcw size={24} />
        </button>
      </div>
    </div>
  );
}
