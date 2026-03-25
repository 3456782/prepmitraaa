import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Bot, Send, Sparkles, X, User, Brain, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function AIMentor() {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    const userMessage: Message = { role: 'user', text: prompt };
    setMessages(prev => [...prev, userMessage]);
    setPrompt('');
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { role: 'user', parts: [{ text: `You are an expert study mentor for competitive exams. Provide concise, motivating, and helpful responses. Keep it conversational like ChatGPT.` }] },
          ...messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
          { role: 'user', parts: [{ text: prompt }] }
        ],
      });
      
      const aiResponse = result.text || 'I am here to help you succeed!';
      setMessages(prev => [...prev, { role: 'model', text: aiResponse }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I am having trouble connecting right now. Keep studying!' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 md:bottom-8 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass-card w-[90vw] md:w-[400px] h-[500px] flex flex-col mb-6 shadow-2xl border-white/10 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-gradient-to-r from-teal-electric/20 to-cyan-400/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-electric to-cyan-500 rounded-full flex items-center justify-center text-navy-deep shadow-lg shadow-teal-electric/20">
                  <Bot size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Study Mentor AI</h4>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-teal-electric rounded-full animate-pulse" />
                    <span className="text-[10px] font-medium text-zinc-400">Online & Ready</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide"
            >
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-teal-electric mb-2">
                    <Brain size={32} />
                  </div>
                  <h5 className="font-bold text-zinc-200">How can I help you today?</h5>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Ask me about study techniques, exam strategies, or how to stay motivated during your preparation.
                  </p>
                  <div className="grid grid-cols-1 gap-2 w-full mt-4">
                    {['How to improve focus?', 'Create a study schedule', 'Tips for JEE/NEET'].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          setPrompt(suggestion);
                        }}
                        className="text-xs p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-zinc-400 hover:text-teal-electric transition-all text-left"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                        msg.role === 'user' ? 'bg-zinc-800' : 'bg-gradient-to-br from-teal-electric to-cyan-500'
                      }`}>
                        {msg.role === 'user' ? <User size={14} /> : <Bot size={14} className="text-navy-deep" />}
                      </div>
                      <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user' 
                        ? 'bg-teal-electric text-navy-deep rounded-tr-none' 
                        : 'bg-zinc-900 text-zinc-200 border border-white/5 rounded-tl-none'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-electric to-cyan-500 flex items-center justify-center">
                      <Bot size={14} className="text-navy-deep" />
                    </div>
                    <div className="p-3 bg-zinc-900 border border-white/5 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
                      {[0, 1, 2].map((dot) => (
                        <motion.div
                          key={dot}
                          animate={{ 
                            y: [0, -8, 0],
                            opacity: [0.4, 1, 0.4]
                          }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: dot * 0.2,
                            ease: "easeInOut"
                          }}
                          className="w-1.5 h-1.5 bg-teal-electric rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/5 bg-zinc-950/50">
              <form onSubmit={handleAsk} className="relative">
                <input 
                  type="text"
                  placeholder="Ask your mentor..."
                  className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-4 pl-5 pr-14 text-sm outline-none focus:border-teal-electric/50 transition-all placeholder:text-zinc-600"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <button 
                  type="submit"
                  disabled={loading || !prompt.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-br from-teal-electric to-cyan-500 text-navy-deep rounded-xl flex items-center justify-center disabled:opacity-50 disabled:grayscale transition-all shadow-lg shadow-teal-electric/20 active:scale-90"
                >
                  <Send size={18} />
                </button>
              </form>
              <p className="text-[10px] text-center text-zinc-600 mt-3 font-medium uppercase tracking-widest">
                PrepMitra AI Mentor • v1.0
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div id="ai-mentor-fab" className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`relative w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all duration-500 transform ${
            isOpen 
            ? 'bg-zinc-900 rotate-90 scale-90' 
            : 'bg-gradient-to-br from-teal-electric via-cyan-500 to-blue-500 hover:scale-110 active:scale-95'
          }`}
        >
          {isOpen ? (
            <X size={28} className="text-zinc-400" />
          ) : (
            <div className="relative">
              <MessageSquare size={28} className="text-navy-deep" fill="currentColor" />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-teal-electric"
              />
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
