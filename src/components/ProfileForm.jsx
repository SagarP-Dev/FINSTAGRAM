import { useState } from 'react';
import { API_BASE_URL } from '../config'; // Added Import

function ProfileForm({ username, setMessage, onComplete }) {
  const [profile, setProfile] = useState({ full_name: '', bio: '', location: '' });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!profile.full_name) {
      setMessage({ text: "Full Name is required", type: "error" });
      return;
    }

    setLoading(true);
    try {
      // FIX: Changed single quotes to backticks for template literals
      const res = await fetch(`${API_BASE_URL}/api/create-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, ...profile })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage({ text: data.message, type: "success" });
        setTimeout(() => {
          onComplete(); 
        }, 1000);
      } else {
        setMessage({ text: data.message, type: "error" });
      }
    } catch (err) {
      console.error("Profile save error:", err);
      setMessage({ text: "Error saving profile", type: "error" });
    } finally {
      setLoading(false);
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
      backdropFilter: 'blur(12px)',
      padding: '40px 30px',
      borderRadius: '28px',
      width: '100%',
      maxWidth: '450px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
      border: '1px solid rgba(255, 255, 255, 0.4)',
      textAlign: 'center'
    },
    title: {
      fontSize: '26px',
      fontWeight: '800',
      color: '#1a1a1a',
      marginBottom: '5px',
      letterSpacing: '-0.5px'
    },
    usernameBadge: {
      display: 'inline-block',
      padding: '4px 12px',
      background: '#f3f4f6',
      borderRadius: '20px',
      fontSize: '13px',
      color: '#6b7280',
      marginBottom: '30px',
      fontWeight: '500'
    },
    inputGroup: {
      textAlign: 'left',
      width: '100%',
      marginBottom: '18px'
    },
    label: {
      fontSize: '11px',
      fontWeight: '700',
      color: '#4b5563',
      marginLeft: '4px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },
    input: {
      width: '100%',
      padding: '14px 16px',
      marginTop: '6px',
      borderRadius: '14px',
      border: '1.5px solid #e5e7eb',
      fontSize: '16px',
      transition: 'all 0.2s ease',
      outline: 'none',
      boxSizing: 'border-box',
      background: '#ffffff'
    },
    area: {
      width: '100%',
      padding: '14px 16px',
      marginTop: '6px',
      borderRadius: '14px',
      border: '1.5px solid #e5e7eb',
      fontSize: '16px',
      height: '110px',
      transition: 'all 0.2s ease',
      outline: 'none',
      boxSizing: 'border-box',
      fontFamily: 'inherit',
      resize: 'none',
      background: '#ffffff'
    },
    btn: {
      width: '100%',
      padding: '16px',
      marginTop: '10px',
      backgroundColor: '#e1306c',
      backgroundImage: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '14px',
      cursor: loading ? 'not-allowed' : 'pointer',
      fontWeight: '700',
      fontSize: '16px',
      boxShadow: '0 10px 15px -3px rgba(225, 48, 108, 0.3)',
      transition: 'all 0.3s ease'
    }
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          input:focus, textarea:focus {
            border-color: #e1306c !important;
            box-shadow: 0 0 0 4px rgba(225, 48, 108, 0.1);
          }
          .profile-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 20px -5px rgba(225, 48, 108, 0.4);
          }
          .profile-btn:active {
            transform: translateY(0);
          }
          @media (max-width: 480px) {
            .profile-card {
              padding: 40px 20px !important;
              border-radius: 0 !important;
              height: 100vh;
              display: flex;
              flex-direction: column;
              justify-content: center;
              background: #ffffff !important;
            }
          }
        `}
      </style>

      <div style={styles.card} className="profile-card">
        <h2 style={styles.title}>Finish Your Profile</h2>
        <div style={styles.usernameBadge}>@{username}</div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Full Name</label>
          <input 
            style={styles.input} 
            placeholder="What should we call you?" 
            value={profile.full_name}
            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} 
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Bio</label>
          <textarea 
            style={styles.area} 
            placeholder="Share a bit about yourself..." 
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })} 
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Location</label>
          <input 
            style={styles.input} 
            placeholder="City, Country" 
            value={profile.location}
            onChange={(e) => setProfile({ ...profile, location: e.target.value })} 
          />
        </div>

        <button 
          className="profile-btn"
          style={styles.btn} 
          onClick={handleSave} 
          disabled={loading}
        >
          {loading ? 'Saving details...' : 'Save & Explore Feed'}
        </button>
      </div>
    </div>
  );
}

export default ProfileForm;