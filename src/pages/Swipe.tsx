import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import SwipeCard from '../components/SwipeCard';
import { UserProfile } from '../types';
import { Search, Heart, X } from 'lucide-react';

export default function Swipe() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [myProfile, setMyProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      if (!auth.currentUser) return;

      // Get my profile to filter by exam
      const myDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      const myData = myDoc.data() as UserProfile;
      setMyProfile(myData);

      // Fetch other users with same exam
      const q = query(
        collection(db, 'users'),
        where('exam', '==', myData.exam),
        where('uid', '!=', auth.currentUser.uid)
      );
      
      const snapshot = await getDocs(q);
      const fetchedProfiles = snapshot.docs.map(doc => doc.data() as UserProfile);
      setProfiles(fetchedProfiles);
      setLoading(false);
    };

    fetchProfiles();
  }, []);

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (direction === 'right' && auth.currentUser && profiles[currentIndex]) {
      const targetUser = profiles[currentIndex];
      
      // Create a match request
      await addDoc(collection(db, 'matches'), {
        users: [auth.currentUser.uid, targetUser.uid].sort(),
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        initiator: auth.currentUser.uid,
      });
    }
    
    setCurrentIndex(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-500 font-medium">Finding study partners...</p>
      </div>
    );
  }

  if (currentIndex >= profiles.length) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6 text-zinc-700">
          <Search size={40} />
        </div>
        <h2 className="text-2xl font-black mb-2">No more partners found</h2>
        <p className="text-zinc-500">Check back later or try changing your exam preferences.</p>
      </div>
    );
  }

  return (
    <div className="relative h-[70vh] w-full max-w-md mx-auto">
      <AnimatePresence>
        {profiles.slice(currentIndex, currentIndex + 2).reverse().map((profile, i) => (
          <SwipeCard 
            key={profile.uid} 
            profile={profile} 
            onSwipe={handleSwipe}
          />
        ))}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="absolute bottom-[-80px] left-0 right-0 flex justify-center gap-6">
        <button 
          onClick={() => handleSwipe('left')}
          className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-red-500 hover:bg-red-500/10 transition-colors shadow-lg"
        >
          <X size={32} />
        </button>
        <button 
          onClick={() => handleSwipe('right')}
          className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-indigo-500 hover:bg-indigo-500/10 transition-colors shadow-lg"
        >
          <Heart size={32} fill="currentColor" />
        </button>
      </div>
    </div>
  );
}
