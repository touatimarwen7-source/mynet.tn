import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminDashboard() {
  const [health, setHealth] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealthData();
    const interval = setInterval(fetchHealthData, 5000); // تحديث كل 5 ثواني
    return () => clearInterval(interval);
  }, []);

  const fetchHealthData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/health', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setHealth(response.data.health);
      setAlerts(response.data.alerts);
      setPaths(response.data.paths);
    } catch (error) {
      console.error('Erreur lors du chargement des données de santé:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportAuditLogs = async (format) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/admin/audit-logs/export?format=${format}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        responseType: format === 'csv' ? 'blob' : 'text'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-logs.${format === 'csv' ? 'csv' : 'jsonl'}`);
      document.body.appendChild(link);
      link.click();
      link.parentChild.removeChild(link);
    } catch (error) {
      alert('خطأ في تصدير السجلات: ' + error.message);
    }
  };

  if (loading) return <div className="loading">Chargement en cours...</div>;

  return (
    <div className="admin-dashboard">
      <h1>Tableau de Contrôle de la Plateforme</h1>

      {/* حالة الصحة */}
      {health && (
        <div className={`health-card status-${health.status}`}>
          <h2>حالة الخادم</h2>
          <div className="health-metrics">
            <div className="metric">
              <span>État du Système:</span>
              <strong className={`status-${health.status}`}>{health.status}</strong>
            </div>
            <div className="metric">
              <span>نسبة النجاح:</span>
              <strong>{health.successRate}%</strong>
            </div>
            <div className="metric">
              <span>متوسط الاستجابة:</span>
              <strong>{health.avgLatency}ms</strong>
            </div>
            <div className="metric">
              <span>عدد الطلبات:</span>
              <strong>{health.totalRequests}</strong>
            </div>
          </div>
        </div>
      )}

      {/* التنبيهات الحرجة */}
      {alerts.length > 0 && (
        <div className="alerts-section">
          <h2>التنبيهات الحرجة</h2>
          {alerts.map((alert, idx) => (
            <div key={idx} className={`alert alert-${alert.severity}`}>
              <strong>{alert.path}</strong>: {alert.message}
            </div>
          ))}
        </div>
      )}

      {/* إحصائيات المسارات */}
      <div className="paths-section">
        <h2>أداء المسارات</h2>
        <table className="paths-table">
          <thead>
            <tr>
              <th>المسار</th>
              <th>الطريقة</th>
              <th>عدد الاستدعاءات</th>
              <th>نسبة النجاح</th>
              <th>الأخطاء</th>
            </tr>
          </thead>
          <tbody>
            {paths.map((path, idx) => (
              <tr key={idx}>
                <td>{path.path}</td>
                <td>{path.method}</td>
                <td>{path.calls}</td>
                <td className={path.successRate >= 99 ? 'success' : 'warning'}>{path.successRate}%</td>
                <td>{path.errors}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* تصدير السجلات */}
      <div className="export-section">
        <h2>تصدير سجلات التدقيق</h2>
        <p>تصدير السجلات للامتثال الرقابي:</p>
        <button onClick={() => handleExportAuditLogs('csv')} className="btn btn-primary">
          تصدير CSV
        </button>
        <button onClick={() => handleExportAuditLogs('json')} className="btn btn-primary">
          تصدير JSON-L
        </button>
      </div>
    </div>
  );
}
