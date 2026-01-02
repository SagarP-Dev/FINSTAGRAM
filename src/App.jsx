import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import ProfileForm from './components/ProfileForm';
import Feed from './components/Feed';
import ProfileView from './components/ProfileView';
import Notifications from './components/Notifications';
import { API_BASE_URL } from './config'; 

// --- Static Styles (Placed outside the component) ---
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
  fontSize: '26px',
  cursor: 'pointer',
  opacity: active ? 1 : 0.3,
  transform: active ? 'scale(1.1)' : 'scale(1)',
  transition: 'all 0.2s ease',
  padding: '10px'
});

function App() {
  // 1. All State declarations must be at the top of the function
  const [view, setView] = useState('login'); 
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  // 2. Debug Effect
  useEffect(() => {
    console.log("Connecting to backend at:", API_BASE_URL);
  }, []);

  // 3. Message auto-hide Effect
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // --- Handlers ---
  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData.username);
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

        {view === 'login' && <Login onSwitch={() => setView('signup')} onLoginSuccess={handleLoginSuccess} setMessage={setMessage} />}
        {view === 'signup' && <Signup onSwitch={() => setView('login')} setMessage={setMessage} />}
        {view === 'profileSetup' && <ProfileForm username={currentUser} onComplete={handleProfileComplete} setMessage={setMessage} />}
        {view === 'feed' && <Feed username={currentUser} />}
        {view === 'notifications' && <Notifications username={currentUser} />}
        {view === 'profile' && <ProfileView username={currentUser} onLogout={handleLogout} />}
      </div>

      {['feed', 'notifications', 'profile'].includes(view) && (
        <div style={navBarStyle}>
          <button style={navIconStyle(view === 'feed')} onClick={() => setView('feed')}>🏠</button>
          <button style={navIconStyle(view === 'notifications')} onClick={() => setView('notifications')}>🔔</button>
          <button style={navIconStyle(view === 'profile')} onClick={() => setView('profile')}>👤</button>
        </div>
      )}
    </div>
  );
}

export default App;