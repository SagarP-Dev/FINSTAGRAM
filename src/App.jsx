import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import ProfileForm from './components/ProfileForm';
import Feed from './components/Feed';
import Reels from './components/Reels';
import Messages from './components/Messages';
import ProfileView from './components/ProfileView';
import Notifications from './components/Notifications';
import { API_BASE_URL } from './config'; 

// --- Static Styles ---
const wrapperStyle = (view) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minHeight: '100vh',
  width: '100vw',
  padding: '0 0 70px 0', 
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  background: ['login', 'signup'].includes(view) 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    : '#fafafa',
  overflowY: 'auto',
  transition: 'background 0.5s ease'
});

const navBarStyle = {
  position: 'fixed',
  bottom: 0,
  width: '100%',
  maxWidth: '500px',
  height: '65px',
  background: '#ffffff',
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  borderTop: '1px solid #dbdbdb',
  zIndex: 1000,
  boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
};

const navIconStyle = (active) => ({
  background: 'none',
  border: 'none',
  fontSize: '24px',
  cursor: 'pointer',
  opacity: active ? 1 : 0.3,
  transform: active ? 'scale(1.1)' : 'scale(1)',
  transition: 'all 0.2s ease',
  padding: '10px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
});

function App() {
  // --- 1. State Initialization with LocalStorage ---
  const [currentUser, setCurrentUser] = useState(() => {
    return localStorage.getItem('finstagram_user') || null;
  });

  const [view, setView] = useState(() => {
    const savedUser = localStorage.getItem('finstagram_user');
    const savedView = localStorage.getItem('finstagram_view');
    // If logged in, go to saved view or feed. If not, go to login.
    return savedUser ? (savedView || 'feed') : 'login';
  });

  const [message, setMessage] = useState({ text: '', type: '' });

  // --- 2. Effects ---
  useEffect(() => {
    console.log("Connecting to backend at:", API_BASE_URL);
  }, []);

  // Persist the current view whenever it changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('finstagram_view', view);
    }
  }, [view, currentUser]);

  // Message auto-hide
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // --- 3. Handlers ---
  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData.username);
    localStorage.setItem('finstagram_user', userData.username);
    
    if (userData.hasProfile) {
      setView('feed');
    } else {
      setView('profileSetup');
      setMessage({ text: `Welcome, ${userData.username}! Setup your profile.`, type: 'success' });
    }
  };

  const handleProfileComplete = () => {
    setView('feed');
    setMessage({ text: 'Profile ready!', type: 'success' });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('finstagram_user');
    localStorage.removeItem('finstagram_view');
    setView('login');
    setMessage({ text: 'Logged out successfully', type: 'success' });
  };

  return (
    <div style={wrapperStyle(view)}>
      <div style={{ 
        width: '100%', 
        maxWidth: ['login', 'signup'].includes(view) ? '400px' : '500px', 
        padding: '10px',
        marginTop: ['login', 'signup'].includes(view) ? '10vh' : '0'
      }}>
        
        {/* Global Toast Messages */}
        {message.text && (
          <div style={{
            position: 'fixed',
            top: '20px', left: '50%', transform: 'translateX(-50%)',
            padding: '12px 24px', borderRadius: '12px', zIndex: 2000,
            background: message.type === 'success' ? '#10b981' : '#ef4444',
            color: 'white', fontWeight: '600', animation: 'slideDown 0.3s ease-out'
          }}>
            <style>{`@keyframes slideDown { from { transform: translate(-50%, -100%); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }`}</style>
            {message.text}
          </div>
        )}

        {/* View Switcher */}
        {view === 'login' && <Login onSwitch={() => setView('signup')} onLoginSuccess={handleLoginSuccess} setMessage={setMessage} />}
        {view === 'signup' && <Signup onSwitch={() => setView('login')} setMessage={setMessage} />}
        {view === 'profileSetup' && <ProfileForm username={currentUser} onComplete={handleProfileComplete} setMessage={setMessage} />}
        
        {view === 'feed' && <Feed username={currentUser} />}
        {view === 'reels' && <Reels username={currentUser} />}
        {view === 'messages' && <Messages currentUser={currentUser} />}
        {view === 'notifications' && <Notifications username={currentUser} />}
        {view === 'profile' && <ProfileView username={currentUser} onLogout={handleLogout} />}
      </div>

      {/* Navigation Bar (Visible only when logged in) */}
      {['feed', 'reels', 'messages', 'notifications', 'profile'].includes(view) && (
        <div style={navBarStyle}>
          <button style={navIconStyle(view === 'feed')} onClick={() => setView('feed')} title="Home">🏠</button>
          <button style={navIconStyle(view === 'reels')} onClick={() => setView('reels')} title="Reels">🎬</button>
          <button style={navIconStyle(view === 'messages')} onClick={() => setView('messages')} title="Messages">✉️</button>
          <button style={navIconStyle(view === 'notifications')} onClick={() => setView('notifications')} title="Notifications">🔔</button>
          <button style={navIconStyle(view === 'profile')} onClick={() => setView('profile')} title="Profile">👤</button>
        </div>
      )}
    </div>
  );
}

export default App;