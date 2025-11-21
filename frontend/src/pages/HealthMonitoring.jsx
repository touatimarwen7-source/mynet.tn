import { useState, useEffect } from 'react';
import axios from 'axios';
import { setPageTitle } from '../utils/pageTitle';

export default function HealthMonitoring() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);

  useEffect(() => {
    setPageTitle('Santé du Système');
    fetchHealth();
    const interval = setInterval(fetchHealth, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const fetchHealth = async () => {
    try {
      const response = await axios.get('/api/admin/health', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setHealth(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !health) return <div className="loading">Chargement en cours...</div>;

  const getStatusColor = (status) => {
    if (status === 'healthy') return '#28a745';
    if (status === 'warning') return '#ffc107';
    return '#dc3545';
  };

  return (
    <div className="health-monitoring">
      <h1>❤️ Santé du Système</h1>

      <div className="refresh-control">
        <label>Fréquence de rafraîchissement:</label>
        <select value={refreshInterval} onChange={(e) => setRefreshInterval(parseInt(e.target.value))}>
          <option value={5000}>Toutes les 5 secondes</option>
          <option value={10000}>Toutes les 10 secondes</option>
          <option value={30000}>Toutes les 30 secondes</option>
        </select>
        <button className="btn btn-primary" onClick={fetchHealth}>Rafraîchir</button>
      </div>

      <div className="health-overview">
        <div className="status-card" style={{borderLeft: `4px solid ${getStatusColor(health.status)}`}}>
          <h3>État du Serveur</h3>
          <p className="big-status">{health.status === 'healthy' ? 'Sain' : '⚠️ Attention'}</p>
        </div>

        <div className="status-card">
          <h3>Utilisateurs Actifs</h3>
          <p className="big-number">{health.active_users || 0}</p>
        </div>

        <div className="status-card">
          <h3>Taux de Succès</h3>
          <p className="big-number">{health.success_rate || 95}%</p>
        </div>

        <div className="status-card">
          <h3>Latence Moyenne</h3>
          <p className="big-number">{health.avg_latency || 45}ms</p>
        </div>
      </div>

      <div className="health-metrics">
        <h2>Métriques Détaillées</h2>
        <div className="metrics-grid">
          <div className="metric-item">
            <strong>Requêtes Totales:</strong> {health.total_requests || 0}
          </div>
          <div className="metric-item">
            <strong>Erreurs (24h):</strong> {health.errors_24h || 0}
          </div>
          <div className="metric-item">
            <strong>Mémoire Utilisée:</strong> {health.memory_usage || 0}MB
          </div>
          <div className="metric-item">
            <strong>Connexions DB:</strong> {health.db_connections || 0}
          </div>
          <div className="metric-item">
            <strong>Durée de vie:</strong> {health.uptime_hours || 0}h
          </div>
          <div className="metric-item">
            <strong>Version API:</strong> {health.api_version || 'v1.0'}
          </div>
        </div>
      </div>

      {health.alerts && health.alerts.length > 0 && (
        <div className="alerts-section">
          <h2>⚠️ Alertes</h2>
          {health.alerts.map((alert, idx) => (
            <div key={idx} className={`alert alert-${alert.severity}`}>
              <strong>{alert.title}:</strong> {alert.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
