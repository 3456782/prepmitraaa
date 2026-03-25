import React, { useState, useEffect } from 'react';
import { Joyride, Step, STATUS } from 'react-joyride';

const TOUR_STEPS: Step[] = [
  {
    target: 'body',
    content: (
      <div className="text-left">
        <h3 className="text-xl font-black mb-2 tracking-tight">Welcome to PrepMitra! 🚀</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Your journey to exam success starts here. Let's take a 30-second tour of your new study command center.
        </p>
      </div>
    ),
    placement: 'center',
  },
  {
    target: window.innerWidth < 768 ? '#mobile-nav-dashboard' : '#nav-dashboard',
    content: (
      <div className="text-left">
        <h4 className="font-bold text-teal-electric mb-1">Dashboard</h4>
        <p className="text-sm text-zinc-400">Track your study streaks, daily goals, and overall performance at a glance.</p>
      </div>
    ),
    placement: 'right',
  },
  {
    target: window.innerWidth < 768 ? '#mobile-nav-match' : '#nav-match',
    content: (
      <div className="text-left">
        <h4 className="font-bold text-teal-electric mb-1">Find Partners</h4>
        <p className="text-sm text-zinc-400">Swipe through profiles of serious aspirants. Match and study together for accountability.</p>
      </div>
    ),
    placement: 'right',
  },
  {
    target: window.innerWidth < 768 ? '#mobile-nav-chats' : '#nav-chats',
    content: (
      <div className="text-left">
        <h4 className="font-bold text-teal-electric mb-1">Smart Chats</h4>
        <p className="text-sm text-zinc-400">Connect with your matches, share resources, and coordinate study sessions.</p>
      </div>
    ),
    placement: 'right',
  },
  {
    target: window.innerWidth < 768 ? '#mobile-nav-progress' : '#nav-progress',
    content: (
      <div className="text-left">
        <h4 className="font-bold text-teal-electric mb-1">Progress Tracking</h4>
        <p className="text-sm text-zinc-400">Visualize your growth with detailed analytics and earn badges for your milestones.</p>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '#ai-mentor-fab',
    content: (
      <div className="text-left">
        <h4 className="font-bold text-teal-electric mb-1">AI Study Mentor</h4>
        <p className="text-sm text-zinc-400">Stuck on a problem? Need motivation? Your AI mentor is available 24/7 to guide you.</p>
      </div>
    ),
    placement: 'left',
  },
];

export default function AppTour() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('prepmitra_tour_seen');
    if (!hasSeenTour) {
      // Small delay to ensure elements are rendered and animations finished
      const timer = setTimeout(() => {
        setRun(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      localStorage.setItem('prepmitra_tour_seen', 'true');
    }
  };

  return (
    <Joyride
      steps={TOUR_STEPS}
      run={run}
      continuous
      onEvent={handleJoyrideCallback}
      options={{
        primaryColor: '#00D4FF',
        backgroundColor: '#0D1B2A',
        textColor: '#f4f4f5',
        arrowColor: '#0D1B2A',
        zIndex: 10000,
        showProgress: true,
      }}
      styles={{
        tooltip: {
          borderRadius: '24px',
          padding: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(10px)',
        },
        buttonPrimary: {
          borderRadius: '12px',
          backgroundColor: '#00D4FF',
          color: '#0D1B2A',
          fontWeight: '900',
          fontSize: '14px',
          padding: '12px 24px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        },
        buttonBack: {
          marginRight: '12px',
          color: '#71717a',
          fontWeight: 'bold',
          fontSize: '14px',
        },
        buttonSkip: {
          color: '#71717a',
          fontWeight: 'bold',
          fontSize: '14px',
        },
      }}
      locale={{
        last: 'Get Started',
        skip: 'Skip Tour',
      }}
    />
  );
}
