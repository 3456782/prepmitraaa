import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { NotificationProvider } from './components/NotificationProvider';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import ProfileSetup from './pages/ProfileSetup';
import Dashboard from './pages/Dashboard';
import Swipe from './pages/Swipe';
import Chats from './pages/Chats';
import Profile from './pages/Profile';
import Progress from './pages/Progress';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        setHasProfile(userDoc.exists());
      } else {
        setHasProfile(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-deep flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal-electric border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <NotificationProvider>
          <Layout>
            <Routes>
              <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
              <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <Auth />} />
              
              {/* Protected Routes */}
              <Route 
                path="/setup" 
                element={user ? (hasProfile ? <Navigate to="/dashboard" /> : <ProfileSetup />) : <Navigate to="/auth" />} 
              />
              <Route 
                path="/dashboard" 
                element={user ? (hasProfile ? <Dashboard /> : <Navigate to="/setup" />) : <Navigate to="/auth" />} 
              />
              <Route 
                path="/swipe" 
                element={user ? (hasProfile ? <Swipe /> : <Navigate to="/setup" />) : <Navigate to="/auth" />} 
              />
              <Route 
                path="/chats" 
                element={user ? (hasProfile ? <Chats /> : <Navigate to="/setup" />) : <Navigate to="/auth" />} 
              />
              <Route 
                path="/profile" 
                element={user ? (hasProfile ? <Profile /> : <Navigate to="/setup" />) : <Navigate to="/auth" />} 
              />
              <Route 
                path="/progress" 
                element={user ? (hasProfile ? <Progress /> : <Navigate to="/setup" />) : <Navigate to="/auth" />} 
              />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
            </Routes>
          </Layout>
        </NotificationProvider>
      </Router>
    </ErrorBoundary>
  );
}
