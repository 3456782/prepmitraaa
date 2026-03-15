import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase';
import { doc, onSnapshot, updateDoc, collection, query, where } from 'firebase/firestore';
import { motion } from 'motion/react';
import { 
  User, 
  Settings, 
  Book, 
  Clock, 
  Target, 
  Globe, 
  MapPin,
  Camera,
  LogOut,
  Award,
  Loader2
} from 'lucide-react';
import { UserProfile } from '../types';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [partnersCount, setPartnersCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) return;
    const unsub = onSnapshot(doc(db, 'users', auth.currentUser.uid), (doc) => {
      const data = doc.data() as UserProfile;
      setProfile(data);
      setEditedProfile(data);
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
      unsub();
      unsubPartners();
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleSave = async () => {
    if (!auth.currentUser) return;
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), editedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    if (file.size > 500000) { // 500KB limit for base64 storage in Firestore
      alert('Image is too large. Please choose an image under 500KB.');
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        await updateDoc(doc(db, 'users', auth.currentUser!.uid), {
          photoURL: base64String
        });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
      setIsUploading(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto space-y-8">
      <header className="flex justify-between items-center">
        <h1 className="text-4xl font-black tracking-tight">Profile</h1>
        <button 
          onClick={handleLogout}
          className="p-3 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all flex items-center gap-2 font-bold text-sm"
        >
          <LogOut size={20} /> Sign Out
        </button>
      </header>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Basic Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="glass-card p-8 text-center relative group">
            <div className="relative inline-block mb-6">
              <div className="relative">
                <img 
                  src={profile.photoURL || `https://picsum.photos/seed/${profile.uid}/200/200`} 
                  className={`w-32 h-32 rounded-[2.5rem] object-cover border-4 border-white/5 shadow-2xl transition-opacity ${isUploading ? 'opacity-50' : 'opacity-100'}`}
                  alt=""
                />
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                  </div>
                )}
              </div>
              <button 
                onClick={handleImageClick}
                disabled={isUploading}
                className="absolute bottom-0 right-0 p-3 bg-indigo-600 text-white rounded-2xl shadow-lg hover:scale-110 transition-transform disabled:opacity-50 disabled:hover:scale-100"
              >
                <Camera size={18} />
              </button>
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            <h2 className="text-2xl font-black mb-1">{profile.name}</h2>
            <p className="text-zinc-500 font-medium text-sm mb-6">{profile.email}</p>
            
            <div className="flex justify-center gap-4">
              <div className="text-center">
                <div className="text-xl font-black text-indigo-400">{profile.streak}</div>
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Streak</div>
              </div>
              <div className="w-px h-8 bg-white/5" />
              <div className="text-center">
                <div className="text-xl font-black text-indigo-400">{profile.totalStudyHours}h</div>
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total</div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 space-y-4">
            <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4">Quick Stats</h4>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Study Partners</span>
              <span className="text-sm font-bold text-indigo-400">{partnersCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Daily Goal</span>
              <span className="text-sm font-bold text-indigo-400">{profile.dailyTarget}h</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Language</span>
              <span className="text-sm font-bold text-zinc-200">{profile.language}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Location</span>
              <span className="text-sm font-bold text-zinc-200">{profile.city}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Settings */}
        <div className="md:col-span-2 space-y-8">
          <div className="glass-card p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Settings className="text-indigo-400" size={20} /> Study Preferences
              </h3>
              <button 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Book size={12} /> Target Exam
                </label>
                {isEditing ? (
                  <input 
                    type="text"
                    value={editedProfile.exam || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, exam: e.target.value })}
                    className="w-full p-4 bg-zinc-950/50 border border-white/5 rounded-2xl font-bold text-zinc-200 focus:outline-none focus:border-indigo-500/50"
                  />
                ) : (
                  <div className="p-4 bg-zinc-950/50 border border-white/5 rounded-2xl font-bold text-zinc-200">
                    {profile.exam}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Clock size={12} /> Study Hours
                </label>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <input 
                        type="time"
                        value={editedProfile.studyHoursStart || ''}
                        onChange={(e) => setEditedProfile({ ...editedProfile, studyHoursStart: e.target.value })}
                        className="flex-1 p-4 bg-zinc-950/50 border border-white/5 rounded-2xl font-bold text-zinc-200 focus:outline-none focus:border-indigo-500/50"
                      />
                      <input 
                        type="time"
                        value={editedProfile.studyHoursEnd || ''}
                        onChange={(e) => setEditedProfile({ ...editedProfile, studyHoursEnd: e.target.value })}
                        className="flex-1 p-4 bg-zinc-950/50 border border-white/5 rounded-2xl font-bold text-zinc-200 focus:outline-none focus:border-indigo-500/50"
                      />
                    </>
                  ) : (
                    <div className="w-full p-4 bg-zinc-950/50 border border-white/5 rounded-2xl font-bold text-zinc-200">
                      {profile.studyHoursStart} - {profile.studyHoursEnd}
                    </div>
                  )}
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Book size={12} /> Subjects (comma separated)
                </label>
                {isEditing ? (
                  <input 
                    type="text"
                    value={editedProfile.subjects?.join(', ') || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, subjects: e.target.value.split(',').map(s => s.trim()) })}
                    className="w-full p-4 bg-zinc-950/50 border border-white/5 rounded-2xl text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50"
                    placeholder="e.g. Mathematics, Physics, Chemistry"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.subjects?.map((subject, i) => (
                      <span key={i} className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-bold">
                        {subject}
                      </span>
                    )) || <span className="text-zinc-600 text-xs italic">No subjects added</span>}
                  </div>
                )}
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Target size={12} /> Shared Goals (comma separated)
                </label>
                {isEditing ? (
                  <input 
                    type="text"
                    value={editedProfile.goals?.join(', ') || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, goals: e.target.value.split(',').map(g => g.trim()) })}
                    className="w-full p-4 bg-zinc-950/50 border border-white/5 rounded-2xl text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50"
                    placeholder="e.g. Daily Revision, Mock Tests, Group Study"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.goals?.map((goal, i) => (
                      <span key={i} className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold">
                        {goal}
                      </span>
                    )) || <span className="text-zinc-600 text-xs italic">No goals added</span>}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="glass-card p-8 bg-indigo-600/5 border-indigo-500/10">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Award className="text-indigo-400" size={20} /> Achievements
            </h3>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-zinc-900 rounded-2xl flex items-center justify-center text-zinc-700 border border-white/5">
                  <Award size={24} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
