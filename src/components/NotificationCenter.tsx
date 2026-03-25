import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  updateDoc, 
  doc, 
  orderBy, 
  limit,
  deleteDoc
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Info, Flame, MessageSquare, UserPlus } from 'lucide-react';
import { Notification } from '../types';

export default function NotificationCenter({ position = 'right' }: { position?: 'left' | 'right' }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    });

    return () => unsubscribe();
  }, []);

  const markAsRead = async (id: string) => {
    await updateDoc(doc(db, 'notifications', id), {
      read: true
    });
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    const promises = unread.map(n => 
      updateDoc(doc(db, 'notifications', n.id), { read: true })
    );
    await Promise.all(promises);
  };

  const clearAll = async () => {
    const promises = notifications.map(n => 
      deleteDoc(doc(db, 'notifications', n.id))
    );
    await Promise.all(promises);
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      markAllAsRead();
    }
  }, [isOpen, unreadCount]);

  const deleteNotification = async (id: string) => {
    await deleteDoc(doc(db, 'notifications', id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'streak_reset': return <Flame className="text-orange-500" size={18} />;
      case 'match': return <UserPlus className="text-teal-electric" size={18} />;
      case 'message': return <MessageSquare className="text-teal-electric" size={18} />;
      default: return <Info className="text-teal-electric" size={18} />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-xl transition-all duration-300 group ${
          isOpen 
          ? 'bg-teal-electric text-navy-deep shadow-lg shadow-teal-electric/20' 
          : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5'
        }`}
      >
        <Bell size={18} className={isOpen ? '' : 'group-hover:rotate-12 transition-transform'} />
        {unreadCount > 0 && (
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`absolute -top-1 -right-1 w-5 h-5 text-[10px] font-black flex items-center justify-center rounded-full border-2 ${
              isOpen ? 'bg-navy-deep text-teal-electric border-teal-electric' : 'bg-teal-electric text-navy-deep border-navy-deep'
            }`}
          >
            {unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95, x: position === 'left' ? 20 : 0 }}
              animate={{ opacity: 1, y: 0, scale: 1, x: position === 'left' ? 20 : 0 }}
              exit={{ opacity: 0, y: 10, scale: 0.95, x: position === 'left' ? 20 : 0 }}
              className={`absolute mt-4 w-80 bg-navy-deep/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden ${
                position === 'right' ? 'right-0' : 'left-full ml-4 top-[-20px]'
              }`}
            >
              <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/5">
                <div>
                  <h3 className="font-black text-sm tracking-tight">Notifications</h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Stay Updated</p>
                </div>
                <div className="flex items-center gap-2">
                  {notifications.length > 0 && (
                    <button 
                      onClick={clearAll}
                      className="text-[10px] font-black text-zinc-500 hover:text-red-400 uppercase tracking-widest transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-zinc-500 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
                {notifications.length === 0 ? (
                  <div className="p-12 text-center space-y-3">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-zinc-600 mx-auto">
                      <Bell size={24} />
                    </div>
                    <p className="text-sm text-zinc-500 font-medium">All caught up!</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id}
                      className={`p-5 border-b border-white/5 last:border-0 transition-all hover:bg-white/5 cursor-pointer relative group ${!n.read ? 'bg-teal-electric/5' : ''}`}
                      onClick={() => markAsRead(n.id)}
                    >
                      <div className="flex gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          !n.read ? 'bg-teal-electric/10' : 'bg-white/5'
                        }`}>
                          {getIcon(n.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm font-bold mb-1 truncate ${!n.read ? 'text-white' : 'text-zinc-400'}`}>
                            {n.title}
                          </h4>
                          <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">
                            {n.message}
                          </p>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(n.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-600 hover:text-red-400 transition-all"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
