import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const Reels = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/reels`)
      .then(res => res.json())
      .then(data => {
        setReels(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching reels:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '20px' }}>Loading Reels...</div>;

  return (
    <div style={{
      width: '100%',
      height: 'calc(100vh - 65px)', // Subtracting Nav Bar height
      overflowY: 'scroll',
      scrollSnapType: 'y mandatory',
      backgroundColor: '#000',
      scrollbarWidth: 'none' // Hides scrollbar on Firefox
    }}>
      {reels.length === 0 ? (
        <div style={{ color: '#fff', textAlign: 'center', marginTop: '100px' }}>
          <p>No Reels yet. Upload an mp4 file to see it here!</p>
        </div>
      ) : (
        reels.map((reel, index) => (
          <div key={index} style={{
            height: '100%',
            width: '100%',
            scrollSnapAlign: 'start',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000'
          }}>
            <video 
              src={reel.url} 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
              controls 
              loop
              playsInline
            />
            {/* Reel Info Overlay */}
            <div style={{
              position: 'absolute',
              bottom: '40px',
              left: '15px',
              color: '#fff',
              textShadow: '1px 1px 4px rgba(0,0,0,0.8)',
              pointerEvents: 'none'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                {reel.avatar ? (
                  <img src={reel.avatar} alt="avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', marginRight: '10px', border: '1px solid #fff' }} />
                ) : (
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#555', marginRight: '10px' }} />
                )}
                <span style={{ fontWeight: 'bold' }}>{reel.username}</span>
              </div>
              <p style={{ fontSize: '14px', margin: 0 }}>{reel.caption}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Reels;