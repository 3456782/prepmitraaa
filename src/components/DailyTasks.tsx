import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  ListTodo,
  ChevronRight
} from 'lucide-react';
import { TodoItem } from '../types';

interface DailyTasksProps {
  userId?: string;
  isReadOnly?: boolean;
}

export default function DailyTasks({ userId, isReadOnly = false }: DailyTasksProps) {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const targetUid = userId || auth.currentUser?.uid;

  useEffect(() => {
    if (!targetUid) return;

    const today = new Date().toISOString().split('T')[0];
    const q = query(
      collection(db, 'todoItems'),
      where('userId', '==', targetUid),
      where('date', '==', today),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTodos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TodoItem)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'todoItems');
    });

    return () => unsubscribe();
  }, [targetUid]);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !newTodo.trim() || isReadOnly) return;

    await addDoc(collection(db, 'todoItems'), {
      userId: auth.currentUser.uid,
      text: newTodo.trim(),
      completed: false,
      date: new Date().toISOString().split('T')[0],
      createdAt: serverTimestamp()
    });

    setNewTodo('');
  };

  const toggleTodo = async (todo: TodoItem) => {
    if (isReadOnly) return;
    await updateDoc(doc(db, 'todoItems', todo.id), {
      completed: !todo.completed
    });
  };

  const deleteTodo = async (id: string) => {
    if (isReadOnly) return;
    await deleteDoc(doc(db, 'todoItems', id));
  };

  return (
    <div className="glass-card p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <ListTodo className="text-teal-electric" size={20} /> 
          {isReadOnly ? "Partner's Tasks" : "Daily Tasks"}
        </h3>
        {!isReadOnly && (
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
            {todos.filter(t => t.completed).length} / {todos.length} Done
          </span>
        )}
      </div>

      {!isReadOnly && (
        <form onSubmit={handleAddTodo} className="flex gap-2 mb-6">
          <input 
            type="text"
            placeholder="Add a task for today..."
            className="flex-1 bg-zinc-950 border border-white/5 rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-electric transition-all"
            value={newTodo}
            onChange={e => setNewTodo(e.target.value)}
          />
          <button 
            type="submit"
            className="p-2 bg-teal-electric text-navy-deep rounded-xl hover:bg-teal-electric/90 transition-all"
          >
            <Plus size={20} />
          </button>
        </form>
      )}

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {todos.map((todo) => (
            <motion.div
              key={todo.id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className={`flex items-center justify-between p-3 rounded-xl border group transition-all ${
                todo.completed 
                ? 'bg-teal-electric/5 border-teal-electric/10' 
                : 'bg-zinc-950/50 border-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => toggleTodo(todo)}
                  disabled={isReadOnly}
                  className={`transition-colors ${todo.completed ? 'text-indigo-400' : 'text-zinc-600'}`}
                >
                  {todo.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                </button>
                <span className={`text-sm ${todo.completed ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                  {todo.text}
                </span>
              </div>
              {!isReadOnly && (
                <button 
                  onClick={() => deleteTodo(todo.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-zinc-600 hover:text-red-400 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {todos.length === 0 && (
          <div className="py-8 text-center text-zinc-600 text-sm italic">
            {isReadOnly ? "No tasks listed for today" : "No tasks yet. Plan your day!"}
          </div>
        )}
      </div>
    </div>
  );
}
