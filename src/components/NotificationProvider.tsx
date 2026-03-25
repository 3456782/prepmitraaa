import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { Heart, X, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NotificationContextType {
  showToast: (message: string, type?: 'success' | 'info') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) return;

    // Listen for new accepted matches
    const q = query(
      collection(db, 'matches'),
      where('users', 'array-contains', auth.currentUser.uid),
      where('status', '==', 'accepted')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'modified' || change.type === 'added') {
          const data = change.doc.data();
          // Only notify if it was recently updated (within last 10 seconds)
          const updatedAt = data.updatedAt?.toDate();
          if (updatedAt && (new Date().getTime() - updatedAt.getTime()) < 10000) {
            const partnerId = data.users.find((id: string) => id !== auth.currentUser?.uid);
            const partnerDoc = await getDoc(doc(db, 'users', partnerId));
            const partnerName = partnerDoc.data()?.name || 'Someone';
            
            setToast({ 
              message: `New Match! You and ${partnerName} are now study partners.`, 
              type: 'success' 
            });
          }
        }
      });
    });

    return () => unsubscribe();
  }, []);

  const showToast = (message: string, type: 'success' | 'info' = 'info') => {
    setToast({ message, type });
  };

  return (
    <NotificationContext.Provider value={{ showToast }}>
      {children}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-md"
          >
            <div className="bg-zinc-900 border border-teal-electric/30 p-4 rounded-2xl shadow-2xl flex items-center gap-4">
              <div className="w-10 h-10 bg-teal-electric/10 rounded-full flex items-center justify-center text-teal-electric shrink-0">
                <Heart size={20} fill="currentColor" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-zinc-100">{toast.message}</p>
              </div>
              <button 
                onClick={() => navigate('/chats')}
                className="p-2 text-teal-electric hover:bg-teal-electric/10 rounded-lg transition-colors"
              >
                <MessageSquare size={20} />
              </button>
              <button 
                onClick={() => setToast(null)}
                className="p-2 text-zinc-500 hover:text-zinc-300"
              >
                <X size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </NotificationContext.Provider>
  );
}

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within a NotificationProvider');
  return context;
};
