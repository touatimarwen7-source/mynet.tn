import { useState, useEffect } from 'react';
import axios from 'axios';

export default function HealthMonitoring() {
  const [health, setHealth] = useState(null);
  const [activeUsers, setActiveUsers] = useState(0);
  const [serverStatus, setServerStatus] = useState('healthy');
  const [endpoints, setEndpoints] = useState([]);
  const [refreshInterval, setRefreshInterval] = useState(5000);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const fetchHealth = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/health', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setHealth(response.data);
      setActiveUsers(response.data.active_users || 0);
      setEndpoints(response.data.endpoints || []);
      setServerStatus(response.data.status === 'healthy' ? 'healthy' : 'warning');
    } catch (error) {
      console.error('Erreur:', error);
      setServerStatus('error');
    }
  };

  const getStatusColor = (responseTime) => {
    if (responseTime < 100) return '#28a745';
    if (responseTime < 500) return '#ffc107';
    return '#dc3545';
  };

  const getSuccessRateColor = (rate) => {
    if (rate >= 95) return '#28a745';
    if (rate >= 85) return '#ffc107';
    return '#dc3545';
  };

  if (!health) return <div className="loading">Chargement en cours...</div>;

  return (
    <div className="health-monitoring">
      <h1>مراقبة صحة النظام</h1>

      {/* التحكم في تكرار التحديث */}
      <div className="refresh-control">
        <label>تكرار التحديث:</label>
        <select value={refreshInterval} onChange={(e) => setRefreshInterval(parseInt(e.target.value))}>
          <option value={5000}>كل 5 ثوان</option>
          <option value={10000}>كل 10 ثوان</option>
          <option value={30000}>كل 30 ثانية</option>
        </select>
      </div>

      {/* الحالة العامة */}
      <div className="health-overview">
        <div className={`status-card status-${serverStatus}`}>
          <h2>حالة الخادم</h2>
          <p className="status-text">
            {serverStatus === 'healthy' ? '✓ صحي' : '⚠️ تحذير'}
          </p>
        </div>

        <div className="status-card">
          <h2>المستخدمون النشطون</h2>
          <p className="big-number">{activeUsers}</p>
        </div>

        <div className="status-card">
          <h2>وقت التشغيل</h2>
          <p className="uptime">{health.uptime_hours}h</p>
        </div>
      </div>

      {/* عرض الـ Endpoints */}
      <div className="endpoints-section">
        <h2>المسارات الحرجة</h2>
        <div className="endpoints-grid">
          {endpoints.map((ep, idx) => (
            <div key={idx} className="endpoint-card">
              <h3>{ep.method} {ep.path}</h3>
              <div className="endpoint-stats">
                <div className="stat">
                  <label>متوسط الوقت:</label>
                  <div 
                    className="response-bar"
                    style={{
                      width: '100%',
                      height: '20px',
                      background: getStatusColor(ep.avg_response_time),
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '0.85rem'
                    }}
                  >
                    {ep.avg_response_time}ms
                  </div>
                </div>
                <div className="stat">
                  <label>نسبة النجاح:</label>
                  <div 
                    className="success-bar"
                    style={{
                      width: `${ep.success_rate}%`,
                      height: '20px',
                      background: getSuccessRateColor(ep.success_rate),
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '0.85rem'
                    }}
                  >
                    {ep.success_rate.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* إحصائيات الخادم */}
      <div className="server-stats">
        <h2>موارد الخادم</h2>
        <div className="stats-grid">
          <div className="stat-item">
            <label>استخدام المعالج:</label>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{width: `${health.cpu_usage}%`}}
              ></div>
            </div>
            <p>{health.cpu_usage}%</p>
          </div>

          <div className="stat-item">
            <label>استخدام الذاكرة:</label>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{width: `${health.memory_usage}%`}}
              ></div>
            </div>
            <p>{health.memory_usage}%</p>
          </div>

          <div className="stat-item">
            <label>استخدام القرص:</label>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{width: `${health.disk_usage}%`}}
              ></div>
            </div>
            <p>{health.disk_usage}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
