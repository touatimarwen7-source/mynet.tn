import { useState, useEffect } from 'react';
import { procurementAPI } from '../api';

export default function AuditLog({ tenderId }) {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({ eventType: '', userId: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs();
  }, [tenderId, filters]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const response = await procurementAPI.getAuditLogs(tenderId, filters);
      // Tri chronologique inverse
      const sortedLogs = (response.data.logs || []).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setLogs(sortedLogs);
    } catch (error) {
      console.error('Erreur lors du chargement du journal d\'audit:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="audit-log-container">
      <h3>Journal d'audit - Modifications immuables</h3>
      
      <div className="audit-filters">
        <select 
          value={filters.eventType}
          onChange={(e) => setFilters({ ...filters, eventType: e.target.value })}
        >
          <option value="">Tous les événements</option>
          <option value="create">Créer</option>
          <option value="update">Mettre à jour</option>
          <option value="delete">Supprimer</option>
          <option value="publish">Publier</option>
          <option value="close">Fermer</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Chargement en cours...</div>
      ) : logs.length === 0 ? (
        <div className="alert alert-info">Aucun enregistrement</div>
      ) : (
        <div className="audit-log-table">
          <table>
            <thead>
              <tr>
                <th>Date et heure</th>
                <th>Utilisateur</th>
                <th>Type d'événement</th>
                <th>Détails</th>
                <th>Adresse IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, idx) => (
                <tr key={idx}>
                  <td>{new Date(log.created_at).toLocaleString('fr-FR')}</td>
                  <td>{log.user_name || log.username}</td>
                  <td className={`event-type-${log.action}`}>{log.action}</td>
                  <td>{log.message || log.details}</td>
                  <td className="ip-address">{log.ip_address || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
