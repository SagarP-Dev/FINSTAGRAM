import { useState, useEffect } from 'react';

function Feed({ username }) {
  const [posts, setPosts] = useState([]);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);

  const fetchPosts = async () => {
    const res = await fetch('http://api/posts');
    const data = await res.json();
    setPosts(data);
  };

  useEffect(() => { fetchPosts(); }, []);

  // Handle previewing the image before upload
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('username', username);
    formData.append('caption', caption);

    try {
      const res = await fetch('http://api/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        setFile(null);
        setPreview(null);
        setCaption('');
        fetchPosts();
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  const styles = {
    container: { maxWidth: '500px', margin: '0 auto', width: '100%', padding: '10px 0' },
    uploadCard: {
      background: '#ffffff',
      padding: '20px',
      borderRadius: '20px',
      marginBottom: '20px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      border: '1px solid #efefef',
    },
    postCard: {
      background: '#ffffff',
      borderRadius: '0px', // Square for native feel on mobile, can be changed to 20px
      marginBottom: '25px',
      border: '1px solid #efefef',
      overflow: 'hidden'
    },
    avatar: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
      padding: '2px',
      marginRight: '10px'
    },
    postImg: { width: '100%', display: 'block', maxHeight: '600px', objectFit: 'cover' },
    input: {
      width: '100%',
      padding: '12px',
      border: '1px solid #efefef',
      borderRadius: '10px',
      background: '#fafafa',
      marginBottom: '10px',
      outline: 'none'
    }
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          .feed-container { animation: fadeIn 0.5s ease-in; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          @media (max-width: 500px) {
            .post-card { border-left: none; border-right: none; border-radius: 0; }
          }
        `}
      </style>

      {/* Modern Upload Section */}
      <div style={styles.uploadCard}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
          <div style={{ ...styles.avatar, background: '#eee' }}></div>
          <span style={{ fontWeight: '600', fontSize: '14px' }}>Share something, {username}?</span>
        </div>

        {preview && (
          <img src={preview} style={{ width: '100px', height: '100px', borderRadius: '10px', objectFit: 'cover', marginBottom: '10px' }} />
        )}

        <input type="file" accept="image/*" onChange={handleFileChange} style={{ marginBottom: '10px', fontSize: '12px' }} />
        
        <input 
          style={styles.input}
          placeholder="Write a caption..." 
          value={caption} 
          onChange={(e) => setCaption(e.target.value)}
        />
        
        <button 
          onClick={handleUpload} 
          disabled={uploading || !file}
          style={{
            width: '100%', padding: '12px', 
            background: uploading || !file ? '#b2dffc' : '#0095f6', 
            color: 'white', border: 'none', borderRadius: '10px', 
            fontWeight: 'bold', cursor: 'pointer', transition: '0.2s'
          }}
        >
          {uploading ? 'Posting...' : 'Post'}
        </button>
      </div>

      {/* Posts Feed */}
      <div className="feed-container">
        {posts.map((post, index) => (
          <div key={index} className="post-card" style={styles.postCard}>
            {/* Post Header */}
            <div style={{ padding: '12px', display: 'flex', alignItems: 'center' }}>
              <div style={styles.avatar}>
                <div style={{ background: 'white', width: '100%', height: '100%', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '10px' }}>
                  👤
                </div>
              </div>
              <span style={{ fontWeight: '600', fontSize: '14px' }}>{post.username}</span>
            </div>

            {/* Post Image */}
            <img src={post.url} alt="Post content" style={styles.postImg} onDoubleClick={() => alert('Liked!')} />

            {/* Post Interactions (Visual only for now) */}
            <div style={{ padding: '12px 12px 5px 12px', fontSize: '20px', display: 'flex', gap: '15px' }}>
              <span>🤍</span> <span>💬</span> <span>✈️</span>
            </div>

            {/* Post Caption */}
            <div style={{ padding: '0 12px 15px 12px', fontSize: '14px', lineHeight: '1.4' }}>
              <span style={{ fontWeight: '600', marginRight: '8px' }}>{post.username}</span> 
              {post.caption}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Feed;