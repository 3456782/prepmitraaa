import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, doc, getDoc, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, User, ChevronLeft, ListTodo, X } from 'lucide-react';
import { Match, Message, UserProfile } from '../types';
import DailyTasks from '../components/DailyTasks';

export default function Chats() {
  const [matches, setMatches] = useState<(Match & { partner: UserProfile })[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<(Match & { partner: UserProfile }) | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showPartnerTasks, setShowPartnerTasks] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'matches'),
      where('users', 'array-contains', auth.currentUser.uid),
      where('status', '==', 'accepted')
    );

    const unsub = onSnapshot(q, async (snapshot) => {
      const matchData = await Promise.all(snapshot.docs.map(async (d) => {
        const data = d.data() as Match;
        const partnerId = data.users.find(id => id !== auth.currentUser?.uid)!;
        const partnerDoc = await getDoc(doc(db, 'users', partnerId));
        return { id: d.id, ...data, partner: partnerDoc.data() as UserProfile };
      }));
      setMatches(matchData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'matches');
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!selectedMatch) return;

    const q = query(
      collection(db, `matches/${selectedMatch.id}/messages`),
      orderBy('timestamp', 'asc')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const msgData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Message));
      setMessages(msgData);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `matches/${selectedMatch.id}/messages`);
    });

    return () => unsub();
  }, [selectedMatch]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedMatch || !auth.currentUser) return;

    const text = newMessage;
    setNewMessage('');

    await addDoc(collection(db, `matches/${selectedMatch.id}/messages`), {
      matchId: selectedMatch.id,
      senderId: auth.currentUser.uid,
      text,
      timestamp: serverTimestamp(),
    });
  };

  if (loading) return null;

  return (
    <div className="h-[calc(100vh-80px)] md:h-screen flex">
      {/* Sidebar */}
      <div className={`${selectedMatch ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-col border-r border-white/5 bg-zinc-950`}>
        <div className="p-6 border-b border-white/5">
          <h2 className="text-2xl font-black">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {matches.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              <MessageSquare className="mx-auto mb-4 opacity-20" size={48} />
              <p className="text-sm font-medium">No matches yet. Keep swiping!</p>
            </div>
          ) : (
            matches.map((match) => (
              <button
                key={match.id}
                onClick={() => setSelectedMatch(match)}
                className={`w-full p-4 flex items-center gap-4 transition-all hover:bg-zinc-900/50 ${selectedMatch?.id === match.id ? 'bg-teal-electric/10 border-r-2 border-teal-electric' : ''}`}
              >
                <img 
                  src={match.partner.photoURL || `https://picsum.photos/seed/${match.partner.uid}/100/100`} 
                  className="w-12 h-12 rounded-full object-cover border border-white/10"
                  alt=""
                />
                <div className="text-left">
                  <h4 className="font-bold text-zinc-100">{match.partner.name}</h4>
                  <p className="text-xs text-zinc-500 font-medium">{match.partner.exam} Aspirant</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${!selectedMatch ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-zinc-900/20`}>
        {selectedMatch ? (
          <>
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-zinc-950/50 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <button onClick={() => setSelectedMatch(null)} className="md:hidden p-2 text-zinc-400">
                  <ChevronLeft size={24} />
                </button>
                <img 
                  src={selectedMatch.partner.photoURL || `https://picsum.photos/seed/${selectedMatch.partner.uid}/100/100`} 
                  className="w-10 h-10 rounded-full object-cover"
                  alt=""
                />
                <div>
                  <h4 className="font-bold">{selectedMatch.partner.name}</h4>
                  <span className="text-[10px] font-black uppercase tracking-widest text-teal-electric">Online</span>
                </div>
              </div>
              <button 
                onClick={() => setShowPartnerTasks(true)}
                className="p-2 text-zinc-400 hover:text-teal-electric transition-colors"
                title="View Partner's Tasks"
              >
                <ListTodo size={24} />
              </button>
            </div>

            <div className="flex-1 flex overflow-hidden relative">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`flex ${msg.senderId === auth.currentUser?.uid ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] p-4 rounded-2xl text-sm font-medium ${
                      msg.senderId === auth.currentUser?.uid 
                      ? 'bg-teal-electric text-navy-deep rounded-tr-none' 
                      : 'bg-zinc-800 text-zinc-100 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>

              {/* Partner Tasks Sidebar/Overlay */}
              <AnimatePresence>
                {showPartnerTasks && (
                  <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    className="absolute inset-y-0 right-0 w-full sm:w-80 bg-zinc-950 border-l border-white/5 z-30 shadow-2xl"
                  >
                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                      <h3 className="font-bold">Partner's Progress</h3>
                      <button onClick={() => setShowPartnerTasks(false)} className="text-zinc-500 hover:text-white">
                        <X size={20} />
                      </button>
                    </div>
                    <div className="p-4 overflow-y-auto h-full pb-20">
                      <DailyTasks userId={selectedMatch.partner.uid} isReadOnly />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-zinc-950/50 border-t border-white/5">
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Type a message..."
                  className="w-full bg-zinc-900 border border-white/5 rounded-2xl py-4 pl-6 pr-14 outline-none focus:border-indigo-500 transition-all"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-500 transition-all"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-600">
            <MessageSquare size={64} className="mb-4 opacity-10" />
            <p className="font-bold">Select a partner to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
