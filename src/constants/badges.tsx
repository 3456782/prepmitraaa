import { Flame, Trophy, Star, Zap, Target, BookOpen, Award, Brain } from 'lucide-react';
import React from 'react';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  criteria: (profile: any) => boolean;
}

export const BADGES: Badge[] = [
  {
    id: 'streak_3',
    name: '3-Day Streak',
    description: 'Studied for 3 consecutive days',
    icon: Flame,
    color: 'text-orange-500',
    criteria: (p) => p.streak >= 3
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintained a 7-day study streak',
    icon: Trophy,
    color: 'text-yellow-500',
    criteria: (p) => p.streak >= 7
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Maintained a 30-day study streak',
    icon: Award,
    color: 'text-purple-500',
    criteria: (p) => p.streak >= 30
  },
  {
    id: 'hours_10',
    name: 'Getting Started',
    description: 'Completed 10 total study hours',
    icon: Zap,
    color: 'text-blue-500',
    criteria: (p) => p.totalStudyHours >= 10
  },
  {
    id: 'hours_50',
    name: 'Half Century',
    description: 'Completed 50 total study hours',
    icon: Target,
    color: 'text-emerald-500',
    criteria: (p) => p.totalStudyHours >= 50
  },
  {
    id: 'hours_100',
    name: 'Centurion',
    description: 'Completed 100 total study hours',
    icon: Star,
    color: 'text-indigo-500',
    criteria: (p) => p.totalStudyHours >= 100
  },
  {
    id: 'first_match',
    name: 'Team Player',
    description: 'Found your first study partner',
    icon: BookOpen,
    color: 'text-pink-500',
    criteria: (p) => p.partnersCount >= 1
  },
  {
    id: 'top_learner',
    name: 'Top Learner',
    description: 'Reached the top 10 on the leaderboard',
    icon: Brain,
    color: 'text-cyan-500',
    criteria: (p) => p.rank <= 10
  }
];
