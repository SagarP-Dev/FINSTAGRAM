import { useState, useEffect } from 'react';

function ProfileView({ username, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchProfile = async () => {
    const res = await fetch(`http://localhost:5000/profile/${username}`);
    const data = await res.json();
    setProfile(data);
  };

  useEffect(() => { fetchProfile(); }, [username]);

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('username', username);

    try {
      const res = await fetch('http://localhost:5000/upload-profile-pic', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) fetchProfile();
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  if (!profile) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: '#8e8e8e' }}>
      Loading Profile...
    </div>
  );

  const styles = {
    container: { maxWidth: '600px', margin: '0 auto', width: '100%', padding: '20px 0' },
    header: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      padding: '0 20px 30px 20px',
      borderBottom: '1px solid #efefef',
      gap: '30px'
    },
    avatarWrapper: { position: 'relative', flexShrink: 0 },
    avatar: {
      width: '100px',
      height: '100px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: '1px solid #dbdbdb',
      cursor: 'pointer',
      transition: 'opacity 0.3s'
    },
    uploadOverlay: {
      position: 'absolute',
      bottom: '0',
      right: '0',
      background: '#0095f6',
      color: 'white',
      borderRadius: '50%',
      width: '28px',
      height: '28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
      border: '2px solid white'
    },
    info: { flex: 1 },
    usernameRow: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' },
    username: { fontSize: '24px', fontWeight: '300', margin: 0 },
    stats: { display: 'flex', gap: '20px', marginBottom: '15px', listStyle: 'none', padding: 0 },
    statItem: { fontSize: '15px', color: '#262626' },
    bioSection: { fontSize: '14px', lineHeight: '1.5' },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '2px', // Thin grid lines like Instagram
      marginTop: '20px'
    },
    gridImg: { width: '100%', aspectRatio: '1/1', objectFit: 'cover', cursor: 'pointer' },
    logoutBtn: {
      marginTop: '30px',
      width: 'calc(100% - 40px)',
      margin: '30px 20px',
      padding: '10px',
      background: '#fafafa',
      color: '#ed4956',
      border: '1px solid #dbdbdb',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer'
    }
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          .profile-img:hover { opacity: 0.8; }
          .grid-item:hover { filter: brightness(0.8); }
          @media (max-width: 480px) {
            .profile-header { gap: 15px !important; }
            .profile-avatar { width: 80px !important; height: 80px !important; }
            .user-name { fontSize: 20px !important; }
          }
        `}
      </style>

      {/* Header Section */}
      <div style={styles.header} className="profile-header">
        <div style={styles.avatarWrapper}>
          <label htmlFor="pp-upload">
            <img 
              className="profile-img"
              src={profile.profile_pic || 'https://via.placeholder.com/150'} 
              style={styles.avatar} 
              alt="Profile" 
            />
            <div style={styles.uploadOverlay}>+</div>
          </label>
          <input id="pp-upload" type="file" hidden onChange={handleProfilePicChange} disabled={uploading} />
        </div>
        
        <div style={styles.info}>
          <div style={styles.usernameRow}>
            <h2 style={styles.username} className="user-name">{username}</h2>
          </div>
          
          <ul style={styles.stats}>
            <li style={styles.statItem}><b>{profile.posts.length}</b> posts</li>
            <li style={styles.statItem}><b>0</b> followers</li>
            <li style={styles.statItem}><b>0</b> following</li>
          </ul>

          <div style={styles.bioSection}>
            <div style={{ fontWeight: '600' }}>{profile.full_name}</div>
            <div style={{ whiteSpace: 'pre-wrap' }}>{profile.bio}</div>
            <div style={{ color: '#00376b', fontSize: '12px', marginTop: '5px' }}>📍 {profile.location}</div>
          </div>
        </div>
      </div>

      {/* Grid Section */}
      <div style={styles.grid}>
        {profile.posts.length === 0 ? (
          <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '50px', color: '#8e8e8e' }}>
            <div style={{ fontSize: '40px' }}>📷</div>
            <p>No Posts Yet</p>
          </div>
        ) : (
          profile.posts.map((post, idx) => (
            <img 
              key={idx} 
              src={post.url} 
              style={styles.gridImg} 
              className="grid-item" 
              alt="User post" 
            />
          ))
        )}
      </div>

      <button style={styles.logoutBtn} onClick={onLogout}>Log Out</button>
    </div>
  );
}

export default ProfileView;