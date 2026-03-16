import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';
import { motion, AnimatePresence } from 'motion/react';
import SwipeCard from '../components/SwipeCard';
import MatchOverlay from '../components/MatchOverlay';
import { UserProfile } from '../types';
import { Search, BookOpen, X } from 'lucide-react';

export default function Swipe() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [myProfile, setMyProfile] = useState<UserProfile | null>(null);
  const [matchedPartner, setMatchedPartner] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      if (!auth.currentUser) return;

      // Get my profile to filter by exam
      const myDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      const myData = myDoc.data() as UserProfile;
      setMyProfile(myData);

      // Fetch my matches to filter out users I've already swiped on
      const matchesQuery = query(
        collection(db, 'matches'),
        where('users', 'array-contains', auth.currentUser.uid)
      );
      let matchesSnapshot;
      try {
        matchesSnapshot = await getDocs(matchesQuery);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'matches');
        return;
      }
      
      // Users to filter out: 
      // 1. Matches already accepted
      // 2. Matches where I am the initiator (I already swiped right)
      const swipedUserIds = matchesSnapshot.docs
        .filter(d => {
          const data = d.data();
          return data.status === 'accepted' || data.initiator === auth.currentUser?.uid;
        })
        .flatMap(d => d.data().users)
        .filter(id => id !== auth.currentUser?.uid);

      // Fetch other users with same exam
      const q = query(
        collection(db, 'users'),
        where('exam', '==', myData.exam),
        where('uid', '!=', auth.currentUser.uid)
      );
      
      let snapshot;
      try {
        snapshot = await getDocs(q);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'users');
        return;
      }
      const fetchedProfiles = snapshot.docs
        .map(doc => doc.data() as UserProfile)
        .filter(profile => !swipedUserIds.includes(profile.uid));
      
      // Enhanced Matching Algorithm
      const scoredProfiles = fetchedProfiles.map(profile => {
        let score = 0;
        
        // 1. Language Match (High Priority)
        if (profile.language === myData.language) score += 50;
        
        // 2. Study Time Overlap (Medium Priority)
        const myStart = timeToMinutes(myData.studyHoursStart);
        const myEnd = timeToMinutes(myData.studyHoursEnd);
        const pStart = timeToMinutes(profile.studyHoursStart);
        const pEnd = timeToMinutes(profile.studyHoursEnd);
        
        const overlapStart = Math.max(myStart, pStart);
        const overlapEnd = Math.min(myEnd, pEnd);
        const overlapMinutes = Math.max(0, overlapEnd - overlapStart);
        
        score += Math.floor(overlapMinutes / 30) * 5; // 5 points for every 30 mins overlap
        
        // 3. Common Subjects (Medium Priority)
        if (profile.subjects && myData.subjects) {
          const commonSubjects = profile.subjects.filter(s => myData.subjects.includes(s));
          score += commonSubjects.length * 15;
        }
        
        // 4. Shared Goals (Medium Priority)
        if (profile.goals && myData.goals) {
          const commonGoals = profile.goals.filter(g => myData.goals.includes(g));
          score += commonGoals.length * 20;
        }
        
        // 5. Daily Target Similarity (Low Priority)
        const targetDiff = Math.abs(profile.dailyTarget - myData.dailyTarget);
        if (targetDiff <= 2) score += 10;
        
        return { ...profile, matchScore: score };
      });

      // Sort by score descending
      const sortedProfiles = scoredProfiles.sort((a, b) => (b as any).matchScore - (a as any).matchScore);
      
      setProfiles(sortedProfiles);
      setLoading(false);
    };

    const timeToMinutes = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    fetchProfiles();
  }, []);

  const handleSwipe = async (direction: 'left' | 'right') => {
    const currentProfile = profiles[currentIndex];
    if (!currentProfile) return;

    console.log(`[SWIPE] ${direction} on:`, currentProfile.name, `(UID: ${currentProfile.uid})`);
    
    if (direction === 'right' && auth.currentUser) {
      if (!myProfile) {
        console.error('[SWIPE] My profile not loaded, cannot create match');
        return;
      }

      const myUid = auth.currentUser.uid;
      const targetUid = currentProfile.uid;
      const matchId = [myUid, targetUid].sort().join('_');
      
      console.log('[SWIPE] Match ID:', matchId);
      
      const matchRef = doc(db, 'matches', matchId);
      try {
        const matchDoc = await getDoc(matchRef);

        if (matchDoc.exists()) {
          const data = matchDoc.data();
          console.log('[SWIPE] Existing match found:', data);
          
          if (data.initiator !== myUid && data.status === 'pending') {
            console.log('[SWIPE] Mutual match! Updating to accepted.');
            await updateDoc(matchRef, {
              status: 'accepted',
              updatedAt: serverTimestamp()
            });
            setMatchedPartner(currentProfile);

            await addDoc(collection(db, 'notifications'), {
              userId: targetUid,
              title: 'New Match!',
              message: `${myProfile.name} accepted your study request! Start chatting now.`,
              type: 'match',
              read: false,
              createdAt: serverTimestamp()
            });
          } else {
            console.log('[SWIPE] Already liked or already matched.');
          }
        } else {
          console.log('[SWIPE] Creating new pending match.');
          await setDoc(matchRef, {
            id: matchId,
            users: [myUid, targetUid].sort(),
            status: 'pending',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            initiator: myUid,
          });

          await addDoc(collection(db, 'notifications'), {
            userId: targetUid,
            title: 'Study Request',
            message: `${myProfile.name} wants to be your study partner!`,
            type: 'match',
            read: false,
            createdAt: serverTimestamp()
          });
        }
      } catch (error) {
        console.error('[SWIPE] Firestore Error:', error);
        handleFirestoreError(error, OperationType.WRITE, `matches/${matchId}`);
      }
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
    <div className="relative h-[75vh] w-full max-w-md mx-auto flex flex-col">
      {/* Ambient Background Glow */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full" />
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-emerald-500/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-red-500/5 blur-[100px] rounded-full" />
      </div>

      <AnimatePresence>
        {matchedPartner && myProfile && (
          <MatchOverlay 
            myProfile={myProfile}
            partnerProfile={matchedPartner}
            onClose={() => setMatchedPartner(null)}
          />
        )}
        <div className="relative w-full h-full flex items-center justify-center">
          <AnimatePresence mode="popLayout">
            {profiles.slice(currentIndex, currentIndex + 2).reverse().map((profile, i) => {
              const isFront = i === 1 || profiles.length - currentIndex === 1;
              return (
                <motion.div
                  key={profile.uid}
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ 
                    scale: isFront ? 1 : 0.9, 
                    opacity: 1,
                    y: isFront ? 0 : 20,
                    zIndex: isFront ? 10 : 0
                  }}
                  exit={{ x: 500, opacity: 0, scale: 0.5, rotate: 45 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="absolute inset-0"
                >
                  <SwipeCard 
                    profile={profile} 
                    onSwipe={handleSwipe}
                    isFront={isFront}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="absolute -bottom-20 left-0 right-0 flex justify-center gap-6 z-30">
        <button 
          onClick={() => handleSwipe('left')}
          className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-red-500 hover:bg-red-500/10 transition-all active:scale-90 shadow-lg"
        >
          <X size={32} />
        </button>
        <button 
          onClick={() => handleSwipe('right')}
          className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-indigo-500 hover:bg-indigo-500/10 transition-all active:scale-90 shadow-lg"
        >
          <BookOpen size={32} fill="currentColor" />
        </button>
      </div>
    </div>
  );
}
