import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Star, RotateCcw, Sparkles, Filter } from 'lucide-react';
import SwipeCard from '../components/SwipeCard';
import MatchOverlay from '../components/MatchOverlay';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

export default function Swipe() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState<'left' | 'right' | 'up' | null>(null);
  const [matchedPartner, setMatchedPartner] = useState<UserProfile | null>(null);
  const [myProfile, setMyProfile] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<number[]>([]);

  useEffect(() => {
    const fetchProfiles = async () => {
      if (!auth.currentUser) return;
      
      // Fetch my profile first
      const myDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (!myDoc.exists()) return;
      const myData = myDoc.data() as UserProfile;
      setMyProfile(myData);

      // Get already swiped users
      const matchesSnapshot = await getDocs(query(
        collection(db, 'matches'),
        where('users', 'array-contains', auth.currentUser.uid)
      ));
      
      const swipedUserIds = matchesSnapshot.docs
        .filter(d => {
          const data = d.data();
          return data.status === 'accepted' || data.status === 'rejected' || data.initiator === auth.currentUser?.uid;
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
        setLoading(false);
        return;
      }

      const fetchedProfiles = snapshot.docs
        .map(doc => ({ ...doc.data() } as UserProfile))
        .filter(p => !swipedUserIds.includes(p.uid));

      // Simple AI Match Score calculation
      const scoredProfiles = fetchedProfiles.map(p => {
        let score = 70; // Base score
        if (p.language === myData.language) score += 10;
        if (p.city === myData.city) score += 5;
        if (p.dailyTarget >= myData.dailyTarget - 1 && p.dailyTarget <= myData.dailyTarget + 1) score += 10;
        return { ...p, matchScore: score };
      });

      setProfiles(scoredProfiles.sort((a, b) => (b as any).matchScore - (a as any).matchScore));
      setLoading(false);
    };

    fetchProfiles();
  }, []);

  const handleSwipe = (swipeDir: 'left' | 'right' | 'up') => {
    const currentProfile = profiles[currentIndex];
    if (!currentProfile) return;

    setDirection(swipeDir);
    setHistory(prev => [...prev, currentIndex]);
    
    // Background Firestore update
    if (auth.currentUser && myProfile) {
      const myUid = auth.currentUser.uid;
      const targetUid = currentProfile.uid;
      const matchId = [myUid, targetUid].sort().join('_');
      const matchRef = doc(db, 'matches', matchId);

      (async () => {
        try {
          const matchDoc = await getDoc(matchRef);
          if (swipeDir === 'right' || swipeDir === 'up') {
            if (matchDoc.exists()) {
              const data = matchDoc.data();
              if (data.initiator !== myUid && data.status === 'pending') {
                await updateDoc(matchRef, {
                  status: 'accepted',
                  updatedAt: serverTimestamp()
                });
                setMatchedPartner(currentProfile);

                await addDoc(collection(db, 'notifications'), {
                  userId: targetUid,
                  title: swipeDir === 'up' ? 'SUPER MATCH!' : 'New Match!',
                  message: `${myProfile.name} ${swipeDir === 'up' ? 'SUPER' : ''} accepted your study request! Start chatting now.`,
                  type: 'match',
                  read: false,
                  createdAt: serverTimestamp()
                });
              }
            } else {
              await setDoc(matchRef, {
                id: matchId,
                users: [myUid, targetUid].sort(),
                status: 'pending',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                initiator: myUid,
                isSuperMatch: swipeDir === 'up'
              });

              await addDoc(collection(db, 'notifications'), {
                userId: targetUid,
                title: swipeDir === 'up' ? 'Super Study Request' : 'Study Request',
                message: `${myProfile.name} ${swipeDir === 'up' ? 'SUPER' : ''} wants to be your study partner!`,
                type: 'match',
                read: false,
                createdAt: serverTimestamp()
              });
            }
          } else {
            // Handle Left Swipe (Reject)
            if (matchDoc.exists()) {
              await updateDoc(matchRef, {
                status: 'rejected',
                updatedAt: serverTimestamp(),
                rejectedBy: myUid
              });
            } else {
              await setDoc(matchRef, {
                id: matchId,
                users: [myUid, targetUid].sort(),
                status: 'rejected',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                initiator: myUid,
                rejectedBy: myUid
              });
            }
          }
        } catch (error) {
          console.error('[SWIPE] Firestore Error:', error);
        }
      })();
    }
    
    // Immediate UI update for smoothness
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setDirection(null);
    }, 250);
  };

  const handleUndo = async () => {
    if (history.length === 0) return;
    
    const lastIndex = history[history.length - 1];
    const lastProfile = profiles[lastIndex];
    
    if (auth.currentUser && lastProfile) {
      const myUid = auth.currentUser.uid;
      const targetUid = lastProfile.uid;
      const matchId = [myUid, targetUid].sort().join('_');
      const matchRef = doc(db, 'matches', matchId);
      
      try {
        const matchDoc = await getDoc(matchRef);
        if (matchDoc.exists() && matchDoc.data().initiator === myUid) {
          // If it was a pending request we sent, we can "undo" it by deleting or marking
          // For simplicity, we just reset the index and let the user swipe again
          // In a real app, you might want to delete the match doc if it was just created
        }
      } catch (e) {
        console.error('Undo failed', e);
      }
    }

    setHistory(prev => prev.slice(0, -1));
    setCurrentIndex(lastIndex);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-zinc-500 font-black uppercase tracking-widest text-sm animate-pulse">Finding your study tribe...</p>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];
  const nextProfile = profiles[currentIndex + 1];

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-8 flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">DISCOVER</h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Serious Aspirants Only</p>
        </div>
        <button className="p-3 bg-zinc-900 rounded-2xl border border-white/5 text-zinc-400 hover:text-white transition-colors">
          <Filter size={20} />
        </button>
      </div>

      {/* Card Stack */}
      <div className="flex-1 relative px-4 flex items-center justify-center">
        <AnimatePresence mode="popLayout">
          {!currentProfile ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center p-12 glass-card rounded-[3rem] max-w-sm w-full"
            >
              <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400 mx-auto mb-6">
                <Sparkles size={40} />
              </div>
              <h2 className="text-2xl font-black mb-4">You've seen everyone!</h2>
              <p className="text-zinc-500 text-sm leading-relaxed mb-8">
                Check back later for more partners or try changing your study preferences.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="w-full py-4 bg-white text-black font-black rounded-2xl hover:scale-105 transition-transform"
              >
                REFRESH STACK
              </button>
            </motion.div>
          ) : (
            <React.Fragment key={currentProfile.uid}>
              {/* Next Card (Background) */}
              {nextProfile && (
                <SwipeCard 
                  profile={nextProfile} 
                  onSwipe={() => {}} 
                  isFront={false} 
                />
              )}
              
              {/* Current Card */}
              <motion.div
                key={currentProfile.uid}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ 
                  x: direction === 'right' ? 1000 : direction === 'left' ? -1000 : 0, 
                  y: direction === 'up' ? -1000 : 0,
                  opacity: 0, 
                  scale: 0.5, 
                  rotate: direction === 'right' ? 90 : direction === 'left' ? -90 : 0 
                }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 300, 
                  damping: 35,
                  mass: 1
                }}
                className="absolute inset-0"
              >
                <SwipeCard 
                  profile={currentProfile} 
                  onSwipe={handleSwipe} 
                  isFront={true} 
                />
              </motion.div>
            </React.Fragment>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      {currentProfile && (
        <div className="px-6 py-10 flex justify-center items-center gap-6 shrink-0">
          <button 
            onClick={handleUndo}
            disabled={history.length === 0}
            className="p-4 bg-zinc-900 rounded-full border border-white/5 text-yellow-500 hover:scale-110 active:scale-90 transition-all disabled:opacity-30 disabled:hover:scale-100"
          >
            <RotateCcw size={24} strokeWidth={3} />
          </button>
          
          <button 
            onClick={() => handleSwipe('left')}
            className="p-6 bg-zinc-900 rounded-full border border-white/5 text-red-500 hover:scale-110 active:scale-90 transition-all shadow-xl"
          >
            <X size={32} strokeWidth={4} />
          </button>
          
          <button 
            onClick={() => handleSwipe('up')}
            className="p-4 bg-zinc-900 rounded-full border border-white/5 text-indigo-400 hover:scale-110 active:scale-90 transition-all"
          >
            <Star size={24} strokeWidth={3} fill="currentColor" />
          </button>
          
          <button 
            onClick={() => handleSwipe('right')}
            className="p-6 bg-zinc-900 rounded-full border border-white/5 text-emerald-500 hover:scale-110 active:scale-90 transition-all shadow-xl"
          >
            <Heart size={32} strokeWidth={4} fill="currentColor" />
          </button>
        </div>
      )}

      {matchedPartner && myProfile && (
        <MatchOverlay 
          myProfile={myProfile} 
          partnerProfile={matchedPartner} 
          onClose={() => setMatchedPartner(null)} 
        />
      )}
    </div>
  );
}
