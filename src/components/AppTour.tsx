import React, { useState, useEffect } from 'react';
import { Joyride, Step, EventData, STATUS } from 'react-joyride';

const TOUR_STEPS: Step[] = [
  {
    target: 'body',
    content: (
      <div className="text-left">
        <h3 className="text-lg font-bold mb-2">Welcome to PrepMitra! 🚀</h3>
        <p className="text-sm text-zinc-400">
          Let's take a quick tour to help you get started with your exam preparation journey.
        </p>
      </div>
    ),
    placement: 'center',
  },
  {
    target: '#nav-dashboard',
    content: 'This is your command center. Track your stats, activity, and daily tasks here.',
    placement: 'right',
  },
  {
    target: '#nav-match',
    content: 'Find serious study partners preparing for the same exam as you. Swipe right to connect!',
    placement: 'right',
  },
  {
    target: '#nav-chats',
    content: 'Message your study partners, share resources, and stay accountable together.',
    placement: 'right',
  },
  {
    target: '#nav-progress',
    content: 'Visualize your long-term progress and see how close you are to your goals.',
    placement: 'right',
  },
  {
    target: '#dashboard-stats',
    content: 'Monitor your total study hours, goal progress, and number of study partners at a glance.',
    placement: 'bottom',
  },
  {
    target: '#weekly-activity',
    content: 'See your study patterns over the last week. Consistency is key!',
    placement: 'top',
  },
  {
    target: '#daily-tasks',
    content: 'Manage your daily study missions. Complete them all to maintain your streak!',
    placement: 'top',
  },
  {
    target: '#pomodoro-timer',
    content: 'Use the integrated Pomodoro timer for focused deep work sessions.',
    placement: 'left',
  },
  {
    target: '#ai-mentor-fab',
    content: 'Your 24/7 AI Study Mentor is here to give you tips and keep you motivated.',
    placement: 'left',
  },
];

export default function AppTour() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('prepmitra_tour_seen');
    if (!hasSeenTour) {
      // Small delay to ensure elements are rendered
      const timer = setTimeout(() => {
        setRun(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleJoyrideCallback = (data: EventData) => {
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
        zIndex: 1000,
        showProgress: true,
        buttons: ['back', 'skip', 'primary'],
      }}
      styles={{
        tooltip: {
          borderRadius: '1.5rem',
          padding: '1.5rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        buttonPrimary: {
          borderRadius: '0.75rem',
          fontWeight: 'bold',
          padding: '0.75rem 1.5rem',
        },
        buttonBack: {
          marginRight: '1rem',
          color: '#a1a1aa',
          fontWeight: 'bold',
        },
        buttonSkip: {
          color: '#71717a',
          fontWeight: 'bold',
        },
      }}
    />
  );
}
