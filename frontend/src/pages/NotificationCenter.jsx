import { useState, useEffect } from 'react';
import axios from 'axios';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [dndMode, setDndMode] = useState(false);
  const [dndUntil, setDndUntil] = useState('');
  const [frequency, setFrequency] = useState('instant');

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/notifications?priority=${filter}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('خطأ:', error);
    }
  };

  const handleDNDMode = (hours) => {
    setDndMode(true);
    const until = new Date(Date.now() + hours * 60 * 60 * 1000);
    setDndUntil(until.toLocaleString('ar-TN'));
  };

  const handleFrequency = async (newFrequency) => {
    setFrequency(newFrequency);
    try {
      await axios.put(`http://localhost:5000/api/settings/notification-frequency`, 
        { frequency: newFrequency },
        { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
      );
    } catch (error) {
      console.error('خطأ:', error);
    }
  };

  return (
    <div className="notification-center">
      <h1>مركز الإشعارات</h1>

      {/* إعدادات الإشعارات */}
      <div className="notification-settings">
        <div className="setting-group">
          <h3>تكرار الإشعارات</h3>
          <div className="frequency-buttons">
            <button 
              className={`freq-btn ${frequency === 'instant' ? 'active' : ''}`}
              onClick={() => handleFrequency('instant')}
            >
              فوري
            </button>
            <button 
              className={`freq-btn ${frequency === 'daily' ? 'active' : ''}`}
              onClick={() => handleFrequency('daily')}
            >
              يومي
            </button>
            <button 
              className={`freq-btn ${frequency === 'weekly' ? 'active' : ''}`}
              onClick={() => handleFrequency('weekly')}
            >
              أسبوعي
            </button>
          </div>
        </div>

        <div className="setting-group">
          <h3>وضع عدم الإزعاج</h3>
          {!dndMode ? (
            <div className="dnd-buttons">
              <button onClick={() => handleDNDMode(1)} className="dnd-btn">1 ساعة</button>
              <button onClick={() => handleDNDMode(4)} className="dnd-btn">4 ساعات</button>
              <button onClick={() => handleDNDMode(8)} className="dnd-btn">8 ساعات</button>
            </div>
          ) : (
            <div className="dnd-active">
              <p>✓ وضع عدم الإزعاج مفعل حتى: {dndUntil}</p>
              <button onClick={() => setDndMode(false)} className="btn-cancel">إلغاء</button>
            </div>
          )}
        </div>
      </div>

      {/* التصفية */}
      <div className="notification-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          الكل
        </button>
        <button 
          className={`filter-btn ${filter === 'critical' ? 'active' : ''}`}
          onClick={() => setFilter('critical')}
        >
          حرج
        </button>
        <button 
          className={`filter-btn ${filter === 'high' ? 'active' : ''}`}
          onClick={() => setFilter('high')}
        >
          مهم
        </button>
        <button 
          className={`filter-btn ${filter === 'normal' ? 'active' : ''}`}
          onClick={() => setFilter('normal')}
        >
          عادي
        </button>
      </div>

      {/* قائمة الإشعارات */}
      <div className="notifications-list">
        {notifications.length === 0 ? (
          <p className="empty-state">لا توجد إشعارات</p>
        ) : (
          notifications.map((notif, idx) => (
            <div key={idx} className={`notification-item priority-${notif.priority}`}>
              <div className="notif-header">
                <h3>{notif.title}</h3>
                <span className="priority-badge">{notif.priority}</span>
              </div>
              <p className="notif-message">{notif.message}</p>
              <p className="notif-time">{new Date(notif.created_at).toLocaleString('ar-TN')}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
