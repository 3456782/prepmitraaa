export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  exam: string;
  subjects: string[];
  studyHoursStart: string;
  studyHoursEnd: string;
  dailyTarget: number;
  language: string;
  city: string;
  streak: number;
  totalStudyHours: number;
  createdAt: any;
}

export interface Match {
  id: string;
  users: string[];
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: any;
  updatedAt: any;
  initiator: string;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  text: string;
  timestamp: any;
}

export interface StudySession {
  id: string;
  userId: string;
  duration: number;
  date: string;
  timestamp: any;
}

export interface Topic {
  id: string;
  userId: string;
  name: string;
  subject: string;
  completed: boolean;
  createdAt: any;
}

export interface PracticeTest {
  id: string;
  userId: string;
  title: string;
  score: number;
  totalMarks: number;
  date: string;
  timestamp: any;
}
