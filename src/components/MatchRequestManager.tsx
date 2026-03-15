import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  updateDoc, 
  doc, 
  getDoc,
  serverTimestamp,
  addDoc,
  deleteDoc
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { UserPlus, X, Check, Heart } from 'lucide-react';
import { Match, UserProfile } from '../types';

export default function MatchRequestManager() {
  const [pendingMatch, setPendingMatch] = useState<(Match & { partner: UserProfile }) | null>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    // Listen for pending matches where I am NOT the initiator
    const q = query(
      collection(db, 'matches'),
      where('users', 'array-contains', auth.currentUser.uid),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        setPendingMatch(null);
        return;
      }

      // Find matches where I'm not the initiator
      const incomingMatches = snapshot.docs.filter(d => d.data().initiator !== auth.currentUser?.uid);
      
      if (incomingMatches.length > 0) {
        const matchDoc = incomingMatches[0];
        const matchData = matchDoc.data() as Match;
        const partnerId = matchData.users.find(id => id !== auth.currentUser?.uid)!;
        
        const partnerDoc = await getDoc(doc(db, 'users', partnerId));
        if (partnerDoc.exists()) {
          setPendingMatch({ 
            id: matchDoc.id, 
            ...matchData, 
            partner: partnerDoc.data() as UserProfile 
          });
        }
      } else {
        setPendingMatch(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAccept = async () => {
    if (!pendingMatch || !auth.currentUser) return;

    await updateDoc(doc(db, 'matches', pendingMatch.id), {
      status: 'accepted',
      updatedAt: serverTimestamp()
    });

    // Notify the initiator
    await addDoc(collection(db, 'notifications'), {
      userId: pendingMatch.initiator,
      title: 'Match Accepted!',
      message: `${auth.currentUser.displayName || 'Someone'} accepted your study request!`,
      type: 'match',
      read: false,
      createdAt: serverTimestamp()
    });

    setPendingMatch(null);
  };

  const handleReject = async () => {
    if (!pendingMatch) return;
    
    // We can either delete the match or set status to rejected
    await deleteDoc(doc(db, 'matches', pendingMatch.id));
    setPendingMatch(null);
  };

  return (
    <AnimatePresence>
      {pendingMatch && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-sm bg-zinc-900 border border-white/10 rounded-3xl p-8 text-center shadow-2xl"
          >
            <div className="relative inline-block mb-6">
              <img 
                src={pendingMatch.partner.photoURL || `https://picsum.photos/seed/${pendingMatch.partner.uid}/200/200`}
                className="w-24 h-24 rounded-full object-cover border-4 border-indigo-500/30"
                alt=""
              />
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white border-4 border-zinc-900">
                <Heart size={18} fill="currentColor" />
              </div>
            </div>

            <h3 className="text-2xl font-black mb-2">New Request!</h3>
            <p className="text-zinc-400 text-sm mb-8">
              <span className="text-white font-bold">{pendingMatch.partner.name}</span> wants to be your study partner for <span className="text-indigo-400 font-bold">{pendingMatch.partner.exam}</span>.
            </p>

            <div className="flex gap-4">
              <button
                onClick={handleReject}
                className="flex-1 py-4 bg-zinc-800 text-zinc-400 font-bold rounded-2xl hover:bg-zinc-700 transition-all flex items-center justify-center gap-2"
              >
                <X size={20} /> Reject
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
              >
                <Check size={20} /> Accept
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
