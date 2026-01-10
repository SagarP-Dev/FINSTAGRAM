import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../config';

const Messages = ({ currentUser }) => {
  const [chats, setChats] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch list of users to chat with
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/chat-list/${currentUser}`)
      .then(res => res.json())
      .then(data => setChats(data))
      .catch(err => console.error("Error loading users:", err));
  }, [currentUser]);

  // Polling for new messages every 3 seconds when a user is selected
  useEffect(() => {
    if (selectedUser) {
      const fetchMessages = () => {
        fetch(`${API_BASE_URL}/api/messages/${currentUser}/${selectedUser}`)
          .then(res => res.json())
          .then(data => setMessages(data))
          .catch(err => console.error("Error loading messages:", err));
      };

      fetchMessages(); // Initial fetch
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedUser, currentUser]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      sender: currentUser,
      receiver: selectedUser,
      text: newMessage.trim()
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      });

      if (res.ok) {
        setMessages([...messages, { ...messageData, timestamp: new Date() }]);
        setNewMessage('');
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  // --- View 1: User List ---
  if (!selectedUser) {
    return (
      <div style={{ padding: '15px', maxWidth: '500px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Messages</h2>
        {chats.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center' }}>No other users found to chat with.</p>
        ) : (
          chats.map(chat => (
            <div 
              key={chat.username} 
              onClick={() => setSelectedUser(chat.username)}
              style={{ 
                display: 'flex', alignItems: 'center', padding: '12px', 
                cursor: 'pointer', borderRadius: '10px', transition: '0.2s',
                backgroundColor: '#fff', marginBottom: '10px', border: '1px solid #efefef'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}
            >
              <img 
                src={chat.avatar || 'https://via.placeholder.com/45'} 
                alt="avatar" 
                style={{ width: '45px', height: '45px', borderRadius: '50%', marginRight: '15px', objectFit: 'cover' }} 
              />
              <span style={{ fontWeight: '600', fontSize: '15px' }}>{chat.username}</span>
            </div>
          ))
        )}
      </div>
    );
  }

  // --- View 2: Chat Window ---
  return (
    <div style={{ 
      display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)', 
      backgroundColor: '#fff', maxWidth: '500px', margin: '0 auto', border: '1px solid #eee' 
    }}>
      {/* Header */}
      <div style={{ 
        padding: '10px 15px', borderBottom: '1px solid #efefef', 
        display: 'flex', alignItems: 'center', backgroundColor: '#fff' 
      }}>
        <button 
          onClick={() => setSelectedUser(null)} 
          style={{ border: 'none', background: 'none', fontSize: '22px', cursor: 'pointer', marginRight: '15px' }}
        >
          ←
        </button>
        <span style={{ fontWeight: '700', fontSize: '16px' }}>{selectedUser}</span>
      </div>

      {/* Message List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '15px', backgroundColor: '#fcfcfc' }}>
        {messages.map((msg, index) => (
          <div 
            key={index} 
            style={{ 
              display: 'flex', 
              justifyContent: msg.sender === currentUser ? 'flex-end' : 'flex-start',
              marginBottom: '8px'
            }}
          >
            <div style={{ 
              maxWidth: '75%', padding: '10px 14px', borderRadius: '18px',
              fontSize: '14px', lineHeight: '1.4',
              backgroundColor: msg.sender === currentUser ? '#0095f6' : '#efefef',
              color: msg.sender === currentUser ? '#fff' : '#000',
              borderBottomRightRadius: msg.sender === currentUser ? '4px' : '18px',
              borderBottomLeftRadius: msg.sender === currentUser ? '18px' : '4px',
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form 
        onSubmit={handleSendMessage} 
        style={{ padding: '10px', borderTop: '1px solid #efefef', display: 'flex', alignItems: 'center', gap: '10px' }}
      >
        <input 
          type="text"
          placeholder="Message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          style={{ 
            flex: 1, padding: '10px 15px', borderRadius: '20px', 
            border: '1px solid #dbdbdb', outline: 'none', fontSize: '14px' 
          }}
        />
        <button 
          type="submit"
          disabled={!newMessage.trim()}
          style={{ 
            background: 'none', border: 'none', color: '#0095f6', 
            fontWeight: '700', cursor: 'pointer', fontSize: '14px',
            opacity: !newMessage.trim() ? 0.5 : 1
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Messages;