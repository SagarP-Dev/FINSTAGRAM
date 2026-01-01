import { useState } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import ProfileForm from './components/ProfileForm';
import Feed from './components/Feed';
import ProfileView from './components/ProfileView'; // You will create this next
import Notifications from './components/Notifications'; // You will create this next

function App() {
  const [view, setView] = useState('login'); // login, signup, profileSetup, feed, notifications, profile
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

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
  };

  // --- Styles ---

  const wrapperStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '100vh',
    width: '100vw',
    padding: '0 0 70px 0', // Space for bottom nav
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    background: ['login', 'signup'].includes(view) 
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
      : '#fafafa',
    overflowY: 'auto'
  };

  const navBarStyle = {
    position: 'fixed',
    bottom: 0,
    width: '100%',
    maxWidth: '500px',
    height: '60px',
    background: '#ffffff',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTop: '1px solid #dbdbdb',
    zIndex: 1000
  };

  const navIconStyle = (active) => ({
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    opacity: active ? 1 : 0.4,
    transition: 'opacity 0.2s'
  });

  return (
    <div style={wrapperStyle}>
      <div style={{ width: '100%', maxWidth: ['login', 'signup'].includes(view) ? '400px' : '500px', padding: '20px' }}>
        
        {/* 1. Auth Views */}
        {view === 'login' && (
          <Login 
            onSwitch={() => setView('signup')} 
            onLoginSuccess={handleLoginSuccess}
            setMessage={setMessage} 
          />
        )}
        
        {view === 'signup' && (
          <Signup onSwitch={() => setView('login')} setMessage={setMessage} />
        )}

        {/* 2. Setup View */}
        {view === 'profileSetup' && (
          <ProfileForm 
            username={currentUser} 
            onComplete={handleProfileComplete} 
            setMessage={setMessage} 
          />
        )}

        {/* 3. Main App Views */}
        {view === 'feed' && (
          <Feed username={currentUser} />
        )}

        {view === 'notifications' && (
          <Notifications username={currentUser} />
        )}

        {view === 'profile' && (
          <ProfileView username={currentUser} onLogout={handleLogout} />
        )}

        {/* 4. Global Messages (Hide on Feed/Profile for cleaner look) */}
        {message.text && !['feed', 'profile', 'notifications'].includes(view) && (
          <div style={{
            marginTop: '20px', padding: '12px', borderRadius: '8px', textAlign: 'center',
            background: message.type === 'success' ? '#d1fae5' : '#fee2e2',
            color: message.type === 'success' ? '#065f46' : '#991b1b', fontWeight: 'bold'
          }}>
            {message.text}
          </div>
        )}
      </div>

      {/* 5. Bottom Navigation Bar (Only visible when logged in) */}
      {['feed', 'notifications', 'profile'].includes(view) && (
        <div style={navBarStyle}>
          <button 
            style={navIconStyle(view === 'feed')} 
            onClick={() => setView('feed')}
          >🏠</button>
          
          <button 
            style={navIconStyle(view === 'notifications')} 
            onClick={() => setView('notifications')}
          >🔔</button>
          
          <button 
            style={navIconStyle(view === 'profile')} 
            onClick={() => setView('profile')}
          >👤</button>
        </div>
      )}
    </div>
  );
}

export default App;