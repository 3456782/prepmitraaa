import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { 
  Users, 
  Timer, 
  TrendingUp, 
  Brain, 
  Search, 
  MessageSquare,
  ArrowRight,
  Sparkles,
  Play,
  Zap,
  ShieldCheck,
  Globe
} from 'lucide-react';

export default function Landing() {
  const [showDemo, setShowDemo] = useState(false);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const features = [
    { 
      icon: Brain, 
      title: 'Smart AI Matching', 
      desc: 'Our neural engine pairs you with partners based on exam type, current progress, and cognitive compatibility.',
      color: 'text-teal-400',
      bg: 'bg-teal-400/10'
    },
    { 
      icon: Search, 
      title: 'Partner Discovery', 
      desc: 'A fluid, intuitive interface to browse serious aspirants. Quality over quantity, every single time.',
      color: 'text-indigo-400',
      bg: 'bg-indigo-400/10'
    },
    { 
      icon: Timer, 
      title: 'Deep Work Timer', 
      desc: 'Synchronized Pomodoro sessions with your partner. Accountability that actually works.',
      color: 'text-rose-400',
      bg: 'bg-rose-400/10'
    },
    { 
      icon: TrendingUp, 
      title: 'Visual Analytics', 
      desc: 'Beautifully crafted charts to visualize your climb. Track topics, test scores, and consistency streaks.',
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10'
    },
    { 
      icon: MessageSquare, 
      title: 'AI Study Mentor', 
      desc: 'Stuck on a concept? Our 24/7 AI mentor provides instant clarity and personalized study plans.',
      color: 'text-amber-400',
      bg: 'bg-amber-400/10'
    },
    { 
      icon: ShieldCheck, 
      title: 'Verified Aspirants', 
      desc: 'A curated community of dedicated students. No distractions, just pure academic focus.',
      color: 'text-cyan-400',
      bg: 'bg-cyan-400/10'
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="bg-navy-deep text-zinc-100 selection:bg-teal-electric/30">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-teal-electric/10 rounded-full blur-[140px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, -40, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[140px]" 
        />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 overflow-hidden">
        <motion.div 
          style={{ y: y1, opacity }}
          className="relative z-10 max-w-7xl mx-auto text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 md:mb-8 mt-10 md:mt-0 text-[10px] font-black tracking-[0.2em] text-teal-electric uppercase bg-teal-electric/5 rounded-full border border-teal-electric/20 backdrop-blur-md"
          >
            <Sparkles size={12} /> The Future of Collaborative Learning
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-[120px] font-black mb-8 tracking-tighter leading-[0.9] md:leading-[0.85] uppercase"
          >
            Study <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-electric via-cyan-400 to-indigo-500">
              Smarter
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-base md:text-xl text-zinc-400 mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed font-medium px-4 md:px-0"
          >
            Stop studying in isolation. Connect with the perfect study partner, 
            track your progress with precision, and master your exams together.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 px-6 md:px-0"
          >
            <Link 
              to="/auth" 
              className="w-full sm:w-auto group relative px-10 py-5 bg-teal-electric text-navy-deep font-black rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(0,212,255,0.3)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-teal-electric to-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center justify-center gap-3 uppercase tracking-wider text-sm">
                Get Started Now <ArrowRight size={18} strokeWidth={3} />
              </span>
            </Link>
            <button 
              onClick={() => setShowDemo(true)}
              className="w-full sm:w-auto px-10 py-5 bg-white/5 text-zinc-300 font-black rounded-2xl border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-3 uppercase tracking-wider text-sm backdrop-blur-xl"
            >
              <Play size={18} fill="currentColor" /> Watch Demo
            </button>
          </motion.div>
        </motion.div>

        {/* Floating UI Elements for Hero */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div 
            animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[12%] left-4 md:left-20 lg:top-1/4"
          >
            <div className="glass-card p-3 md:p-4 rounded-2xl border-teal-electric/20 shadow-2xl scale-75 md:scale-100 origin-left">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-teal-electric/20 rounded-xl flex items-center justify-center text-teal-electric">
                  <Zap size={16} className="md:w-5 md:h-5" />
                </div>
                <div>
                  <div className="text-[8px] md:text-[10px] font-black text-zinc-500 uppercase">Daily Streak</div>
                  <div className="text-xs md:text-sm font-black text-white">14 Days</div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-[12%] right-4 md:right-20 lg:bottom-1/4"
          >
            <div className="glass-card p-3 md:p-4 rounded-2xl border-indigo-500/20 shadow-2xl scale-75 md:scale-100 origin-right">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
                  <Users size={16} className="md:w-5 md:h-5" />
                </div>
                <div>
                  <div className="text-[8px] md:text-[10px] font-black text-zinc-500 uppercase">Partner Found</div>
                  <div className="text-xs md:text-sm font-black text-white">Match #24</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-32 px-6 bg-zinc-950/50 backdrop-blur-3xl border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight uppercase">
              Engineered for <span className="gradient-text">Success</span>
            </h2>
            <p className="text-zinc-500 font-medium max-w-xl mx-auto">
              Everything you need to stay focused, motivated, and ahead of the curve.
            </p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="glass-card p-10 group hover:bg-white/[0.03] transition-all duration-500 border-white/5 hover:border-white/10"
              >
                <div className={`w-16 h-16 ${feature.bg} rounded-[2rem] flex items-center justify-center ${feature.color} mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                  <feature.icon size={32} strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-black mb-4 text-white uppercase tracking-tight">{feature.title}</h3>
                <p className="text-zinc-500 leading-relaxed font-medium text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-12">Supported Exam Categories</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
            {['UPSC', 'JEE', 'NEET', 'GATE', 'CAT', 'GMAT', 'SAT'].map((exam) => (
              <span key={exam} className="text-2xl md:text-4xl font-black tracking-tighter text-zinc-400 hover:text-teal-electric transition-colors cursor-default">
                {exam}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative glass-card p-12 md:p-20 rounded-[3rem] overflow-hidden text-center border-teal-electric/20">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-electric/10 via-transparent to-indigo-600/10 pointer-events-none" />
            <h2 className="text-4xl md:text-7xl font-black mb-8 tracking-tighter uppercase leading-none">
              Ready to crack <br /> your <span className="gradient-text">Goal?</span>
            </h2>
            <p className="text-zinc-400 mb-12 max-w-xl mx-auto font-medium">
              Join the elite circle of aspirants who study with purpose. 
              Your perfect study partner is just one click away.
            </p>
            <Link 
              to="/auth" 
              className="inline-flex items-center gap-3 px-12 py-6 bg-white text-navy-deep font-black rounded-2xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-sm shadow-2xl"
            >
              Join PrepMitra <ArrowRight size={20} strokeWidth={3} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-teal-electric text-navy-deep rounded-xl flex items-center justify-center font-black">P</div>
                <span className="text-2xl font-black tracking-tighter uppercase">PrepMitra</span>
              </div>
              <p className="text-zinc-500 max-w-sm font-medium leading-relaxed">
                The ultimate collaborative platform for serious aspirants. 
                Mastering exams through accountability and smart matching.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-widest mb-6">Platform</h4>
              <ul className="space-y-4 text-sm text-zinc-500 font-medium">
                <li><Link to="/swipe" className="hover:text-teal-electric transition-colors">Find Partners</Link></li>
                <li><Link to="/dashboard" className="hover:text-teal-electric transition-colors">Dashboard</Link></li>
                <li><Link to="/progress" className="hover:text-teal-electric transition-colors">Progress</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-widest mb-6">Legal</h4>
              <ul className="space-y-4 text-sm text-zinc-500 font-medium">
                <li><Link to="/privacy" className="hover:text-teal-electric transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-teal-electric transition-colors">Terms of Service</Link></li>
                <li><a href="mailto:mk9648940@gmail.com" className="hover:text-teal-electric transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-sm text-zinc-600 font-medium">
              © 2026 PrepMitra. All rights reserved.
            </div>
            <div className="flex gap-6">
              <Globe size={20} className="text-zinc-600 hover:text-white cursor-pointer transition-colors" />
              <Zap size={20} className="text-zinc-600 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
