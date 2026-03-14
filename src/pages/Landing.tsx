import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Users, 
  Timer, 
  TrendingUp, 
  Brain, 
  Search, 
  MessageSquare,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export default function Landing() {
  const features = [
    { icon: Brain, title: 'Smart AI Matching', desc: 'Find partners based on exam, subjects, and study style.' },
    { icon: Search, title: 'Partner Swipe', desc: 'Tinder-style interface to quickly find your study tribe.' },
    { icon: Timer, title: 'Study Timer', desc: 'Integrated Pomodoro timer to keep you focused and productive.' },
    { icon: TrendingUp, title: 'Progress Tracking', desc: 'Visualize your study hours and maintain daily streaks.' },
    { icon: Users, title: 'Study Groups', desc: 'Join or create groups for focused group discussions.' },
    { icon: MessageSquare, title: 'AI Study Mentor', desc: 'Get instant help and motivation from our AI mentor.' },
  ];

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-wider text-indigo-400 uppercase bg-indigo-400/10 rounded-full border border-indigo-400/20">
              The Future of Exam Prep
            </span>
            <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-tight">
              Find Your Perfect <br />
              <span className="gradient-text">Study Partner</span>
            </h1>
            <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Stay consistent, stay accountable, and crack your exam with the right partner. 
              Join 50,000+ students already studying together.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link 
                to="/auth" 
                className="group relative px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-600/25"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center gap-2">
                  Start Studying Together <ArrowRight size={20} />
                </span>
              </Link>
              <button className="px-8 py-4 bg-zinc-900 text-zinc-300 font-bold rounded-2xl border border-white/5 hover:bg-zinc-800 transition-all">
                Watch Demo
              </button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 max-w-4xl mx-auto"
          >
            {[
              { label: 'Students Matched', value: '50K+' },
              { label: 'Study Hours', value: '1.2M+' },
              { label: 'Success Rate', value: '94%' },
              { label: 'AI Mentors', value: '24/7' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                <div className="text-sm text-zinc-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6">Everything you need to <span className="gradient-text">Excel</span></h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              PrepMitra combines social learning with powerful productivity tools to help you stay ahead of the curve.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-8 group hover:bg-zinc-900/60 transition-all duration-500"
              >
                <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black">P</div>
            <span className="text-xl font-black tracking-tighter">PrepMitra</span>
          </div>
          <div className="flex gap-8 text-sm text-zinc-500 font-medium">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <div className="text-sm text-zinc-600">
            © 2026 PrepMitra. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
