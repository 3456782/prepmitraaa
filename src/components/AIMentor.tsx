import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Brain, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AIMentor() {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are an expert study mentor for competitive exams. A student is asking: "${prompt}". Provide a concise, motivating, and helpful response.`,
      });
      setResponse(result.text || 'I am here to help you succeed!');
    } catch (err) {
      setResponse('Sorry, I am having trouble connecting right now. Keep studying!');
    }
    setLoading(false);
  };

  return (
    <div className="fixed bottom-24 md:bottom-8 right-6 z-[60]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass-card w-80 md:w-96 p-6 mb-4 shadow-2xl border-indigo-500/30"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                <Brain size={20} />
              </div>
              <div>
                <h4 className="font-bold">AI Study Mentor</h4>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Powered by Gemini</span>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto mb-6 space-y-4 scrollbar-hide">
              {response ? (
                <div className="p-4 bg-indigo-500/10 rounded-2xl text-sm text-zinc-300 leading-relaxed border border-indigo-500/10">
                  {response}
                </div>
              ) : (
                <p className="text-sm text-zinc-500 text-center">Ask me anything about your preparation!</p>
              )}
            </div>

            <form onSubmit={handleAsk} className="relative">
              <input 
                type="text"
                placeholder="How to stay focused?"
                className="w-full bg-zinc-950 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm outline-none focus:border-indigo-500 transition-all"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <button 
                type="submit"
                disabled={loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center disabled:opacity-50"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={14} />}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/40 hover:scale-110 active:scale-95 transition-all"
      >
        {isOpen ? <X size={24} /> : <Sparkles size={24} fill="currentColor" />}
      </button>
    </div>
  );
}

function X({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
