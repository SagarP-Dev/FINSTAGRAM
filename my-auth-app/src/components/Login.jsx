import { useState } from 'react';

function Login({ onSwitch, onLoginSuccess, setMessage }) {
  const [formData, setFormData] = useState({ username: '', password: '' });

  const handleLogin = async () => {
    setMessage({ text: '', type: '' });
    try {
      const res = await fetch('http://api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        onLoginSuccess(data);
      } else {
        setMessage({ text: data.message, type: 'error' });
      }
    } catch (err) {
      setMessage({ text: "Server offline", type: "error" });
    }
  };

  const styles = {
    container: {
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      padding: '20px',
    },
    card: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      padding: '40px 30px',
      borderRadius: '24px',
      textAlign: 'center',
      width: '100%',
      maxWidth: '400px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
    },
    title: {
      fontSize: '28px',
      fontWeight: '800',
      color: '#1f2937',
      marginBottom: '8px',
      letterSpacing: '-0.5px'
    },
    subtitle: {
      color: '#6b7280',
      marginBottom: '32px',
      fontSize: '14px'
    },
    input: {
      width: '100%',
      padding: '14px 16px',
      margin: '10px 0',
      borderRadius: '12px',
      border: '1.5px solid #e5e7eb',
      fontSize: '16px', // Prevents iOS zoom on focus
      transition: 'all 0.2s ease',
      outline: 'none',
      boxSizing: 'border-box'
    },
    btn: {
      width: '100%',
      padding: '14px',
      marginTop: '20px',
      backgroundColor: '#4f46e5',
      backgroundImage: 'linear-gradient(to right, #4f46e5, #7c3aed)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      fontWeight: '700',
      fontSize: '16px',
      boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.4)',
      transition: 'transform 0.1s ease, box-shadow 0.1s ease'
    },
    footer: {
      marginTop: '24px',
      fontSize: '14px',
      color: '#4b5563'
    },
    link: {
      color: '#4f46e5',
      fontWeight: '600',
      cursor: 'pointer',
      textDecoration: 'none'
    }
  };

  return (
    <div style={styles.container}>
      {/* Global CSS for hover effects and responsiveness */}
      <style>
        {`
          input:focus {
            border-color: #4f46e5 !important;
            box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
          }
          button:hover {
            opacity: 0.9;
            transform: translateY(-1px);
          }
          button:active {
            transform: translateY(0);
          }
          @media (max-width: 480px) {
            .login-card {
              padding: 30px 20px !important;
              border-radius: 0 !important;
              height: 100vh;
              display: flex;
              flex-direction: column;
              justify-content: center;
              background: white !important;
            }
          }
        `}
      </style>

      <div style={styles.card} className="login-card">
        <h2 style={styles.title}>Welcome Back to finstagram</h2>
        <p style={styles.subtitle}>Log in to your account to continue</p>
        
        <div style={{textAlign: 'left', width: '100%'}}>
          <label style={{fontSize: '12px', fontWeight: '600', color: '#374151', marginLeft: '4px'}}>USERNAME</label>
          <input 
            style={styles.input} 
            type="text" 
            placeholder="Enter your username" 
            onChange={(e) => setFormData({...formData, username: e.target.value})} 
          />
        </div>

        <div style={{textAlign: 'left', width: '100%', marginTop: '10px'}}>
          <label style={{fontSize: '12px', fontWeight: '600', color: '#374151', marginLeft: '4px'}}>PASSWORD</label>
          <input 
            style={styles.input} 
            type="password" 
            placeholder="••••••••" 
            onChange={(e) => setFormData({...formData, password: e.target.value})} 
          />
        </div>

        <button style={styles.btn} onClick={handleLogin}>
          Sign In
        </button>

        <p style={styles.footer}>
          Don't have an account? <span style={styles.link} onClick={onSwitch}>Create one</span>
        </p>
      </div>
    </div>
  );
}

export default Login;