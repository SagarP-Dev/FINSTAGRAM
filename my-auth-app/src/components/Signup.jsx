import { useState } from 'react';

function Signup({ onSwitch, setMessage }) {
  const [formData, setFormData] = useState({ username: '', password: '' });

  const handleSignup = async () => {
    setMessage({ text: '', type: '' });
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      setMessage({ text: data.message, type: res.ok ? 'success' : 'error' });
      if (res.ok) setTimeout(onSwitch, 1500); 
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
      color: '#111827',
      marginBottom: '8px',
      letterSpacing: '-0.5px'
    },
    subtitle: {
      color: '#6b7280',
      marginBottom: '32px',
      fontSize: '14px'
    },
    inputGroup: {
      textAlign: 'left',
      width: '100%',
      marginBottom: '15px'
    },
    label: {
      fontSize: '11px',
      fontWeight: '700',
      color: '#374151',
      marginLeft: '4px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },
    input: {
      width: '100%',
      padding: '14px 16px',
      marginTop: '6px',
      borderRadius: '12px',
      border: '1.5px solid #e5e7eb',
      fontSize: '16px',
      transition: 'all 0.2s ease',
      outline: 'none',
      boxSizing: 'border-box'
    },
    button: {
      width: '100%',
      padding: '14px',
      marginTop: '15px',
      backgroundColor: '#10b981',
      backgroundImage: 'linear-gradient(to right, #10b981, #059669)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      fontWeight: '700',
      fontSize: '16px',
      boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.4)',
      transition: 'all 0.2s ease'
    },
    footer: {
      marginTop: '24px',
      fontSize: '14px',
      color: '#4b5563'
    },
    link: {
      color: '#10b981',
      fontWeight: '600',
      cursor: 'pointer',
    }
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          input:focus {
            border-color: #10b981 !important;
            box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
          }
          .signup-btn:hover {
            opacity: 0.95;
            transform: translateY(-1px);
            box-shadow: 0 6px 12px -2px rgba(16, 185, 129, 0.4);
          }
          .signup-btn:active {
            transform: translateY(0);
          }
          @media (max-width: 480px) {
            .signup-card {
              padding: 40px 20px !important;
              border-radius: 0 !important;
              height: 100vh;
              display: flex;
              flex-direction: column;
              justify-content: center;
              background: #ffffff !important;
              box-shadow: none !important;
              border: none !important;
            }
          }
        `}
      </style>

      <div style={styles.card} className="signup-card">
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Start your journey with finstagram today</p>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Choose Username</label>
          <input 
            style={styles.input} 
            type="text" 
            placeholder="e.g. wanderlust_24" 
            onChange={(e) => setFormData({...formData, username: e.target.value})} 
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Choose Password</label>
          <input 
            style={styles.input} 
            type="password" 
            placeholder="Min. 8 characters" 
            onChange={(e) => setFormData({...formData, password: e.target.value})} 
          />
        </div>

        <button className="signup-btn" style={styles.button} onClick={handleSignup}>
          Sign Up
        </button>

        <p style={styles.footer}>
          Already have an account? <span style={styles.link} onClick={onSwitch}>Login</span>
        </p>
      </div>
    </div>
  );
}

export default Signup;