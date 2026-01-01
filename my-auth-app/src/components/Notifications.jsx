import { useState, useEffect } from 'react';

function Notifications({ username }) {
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/notifications/${username}`)
      .then(res => res.json())
      .then(data => setNotifs(data));
  }, [username]);

  const styles = {
    container: {
      maxWidth: '500px',
      margin: '0 auto',
      width: '100%',
      padding: '20px 15px',
      minHeight: '100vh',
    },
    header: {
      fontSize: '24px',
      fontWeight: '800',
      color: '#1a1a1a',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    notifList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    item: {
      background: '#ffffff',
      padding: '16px',
      borderRadius: '16px',
      border: '1px solid #efefef',
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
    },
    iconCircle: {
      width: '45px',
      height: '45px',
      borderRadius: '50%',
      background: '#f3f4f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      flexShrink: 0
    },
    content: {
      flex: 1
    },
    msg: {
      margin: 0,
      fontSize: '14px',
      color: '#262626',
      lineHeight: '1.4'
    },
    time: {
      fontSize: '12px',
      color: '#8e8e8e',
      marginTop: '4px',
      display: 'block'
    },
    unreadDot: {
      width: '8px',
      height: '8px',
      background: '#0095f6',
      borderRadius: '50%',
      flexShrink: 0
    }
  };

  // Helper to get icon based on message content
  const getIcon = (msg) => {
    if (msg.toLowerCase().includes('like')) return '❤️';
    if (msg.toLowerCase().includes('follow')) return '👤';
    if (msg.toLowerCase().includes('comment')) return '💬';
    return '🔔';
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          .notif-item:hover {
            background-color: #fafafa !important;
            transform: scale(1.01);
          }
          .notif-item:active {
            transform: scale(0.99);
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(-10px); }
            to { opacity: 1; transform: translateX(0); }
          }
          .notif-item {
            animation: slideIn 0.3s ease forwards;
          }
        `}
      </style>

      <div style={styles.header}>
        <span>Notifications</span>
        <span style={{ fontSize: '14px', color: '#0095f6', fontWeight: '600' }}>Mark all as read</span>
      </div>

      <div style={styles.notifList}>
        {notifs.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <div style={{ fontSize: '50px', marginBottom: '10px' }}>📭</div>
            <p style={{ color: '#8e8e8e', fontWeight: '500' }}>No notifications yet</p>
            <p style={{ color: '#c7c7c7', fontSize: '13px' }}>When people like or comment on your posts, you'll see them here.</p>
          </div>
        ) : (
          notifs.map((n, i) => (
            <div key={i} className="notif-item" style={styles.item}>
              <div style={styles.iconCircle}>
                {getIcon(n.message)}
              </div>
              
              <div style={styles.content}>
                <p style={styles.msg}>
                  {n.message}
                </p>
                <span style={styles.time}>
                  {new Date(n.time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Blue dot for "Unread" - You can sync this with a 'is_read' database column later */}
              <div style={styles.unreadDot}></div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Notifications;