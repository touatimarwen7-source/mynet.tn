import { useState, useEffect } from 'react';
import axios from 'axios';

export default function TenderChat({ tenderId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        setUser(tokenData);
      } catch (error) {
        console.error('Erreur:', error);
      }
    }
    fetchMessages();
  }, [tenderId]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/tender/${tenderId}/messages`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await axios.post(
        `http://localhost:5000/api/tender/${tenderId}/messages`,
        { content: newMessage },
        { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
      );
      setMessages([...messages, response.data.message]);
      setNewMessage('');
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  if (loading) return <div className="loading">Chargement en cours...</div>;

  return (
    <div className="tender-chat">
      <h2>قناة التواصل الآمنة</h2>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <p className="empty-state">لا توجد رسائل حتى الآن</p>
        ) : (
          messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`message ${msg.sender_id === user?.id ? 'sent' : 'received'}`}
            >
              <div className="message-header">
                <strong>{msg.sender_name}</strong>
                <span className="timestamp">
                  {new Date(msg.created_at).toLocaleString('ar-TN')}
                </span>
              </div>
              <p className="message-content">{msg.content}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSendMessage} className="chat-form">
        <textarea 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="اكتب رسالتك..."
          rows={3}
        />
        <button type="submit" className="btn btn-primary">إرسال</button>
      </form>
    </div>
  );
}
