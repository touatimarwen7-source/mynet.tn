import { useState, useEffect } from 'react';
import axios from 'axios';
import { setPageTitle } from '../utils/pageTitle';

export default function ArchiveManagement() {
  const [settings, setSettings] = useState({
    documentArchivePeriodDays: 90,
    autoArchiveEnabled: true
  });
  const [archiveJobs, setArchiveJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPageTitle('Gestion des Archives');
    fetchSettings();
    fetchArchiveJobs();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/admin/archive-settings', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setSettings(response.data.settings || settings);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchArchiveJobs = async () => {
    try {
      const response = await axios.get('/api/admin/archive-jobs', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setArchiveJobs(response.data.jobs || []);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await axios.put('/api/admin/archive-settings', settings, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      alert('Paramètres d\'archivage sauvegardés');
      fetchSettings();
    } catch (error) {
      alert('Erreur: ' + error.response?.data?.error);
    }
  };

  const handleTriggerArchive = async () => {
    if (!confirm('Êtes-vous sûr de vouloir déclencher l\'archivage maintenant?')) return;
    try {
      await axios.post('/api/admin/archive-trigger', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      alert('Archivage déclenché');
      fetchArchiveJobs();
    } catch (error) {
      alert('Erreur: ' + error.response?.data?.error);
    }
  };

  if (loading) return <div className="loading">Chargement en cours...</div>;

  return (
    <div className="archive-management">
      <h1>📦 Gestion des Archives</h1>

      <div className="settings-section">
        <h2>Paramètres d'Archivage</h2>
        
        <div className="form-group">
          <label>Période de rétention (jours):</label>
          <input
            type="number"
            value={settings.documentArchivePeriodDays}
            onChange={(e) => setSettings({...settings, documentArchivePeriodDays: parseInt(e.target.value)})}
            min="30"
            max="2555"
          />
          <p className="help-text">Les documents plus anciens que cette période seront archivés</p>
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={settings.autoArchiveEnabled}
              onChange={(e) => setSettings({...settings, autoArchiveEnabled: e.target.checked})}
            />
            Activer l'archivage automatique
          </label>
        </div>

        <button className="btn btn-primary" onClick={handleSaveSettings}>Sauvegarder</button>
        <button className="btn btn-success" onClick={handleTriggerArchive}>Déclencher l'Archivage</button>
      </div>

      <div className="archive-jobs-section">
        <h2>Historique des Archivages</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Documents Archivés</th>
              <th>Statut</th>
              <th>Durée</th>
            </tr>
          </thead>
          <tbody>
            {archiveJobs.map((job, idx) => (
              <tr key={idx}>
                <td>{new Date(job.created_at).toLocaleString('fr-FR')}</td>
                <td>{job.documents_count || 0}</td>
                <td><span className={`status-${job.status}`}>{job.status}</span></td>
                <td>{job.duration || '-'}ms</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="storage-info">
        <h2>Informations de Stockage</h2>
        <div className="info-grid">
          <div className="info-item">
            <strong>Espace Utilisé:</strong> {(settings.storage_used || 0).toFixed(2)} GB
          </div>
          <div className="info-item">
            <strong>Limite de Stockage:</strong> {(settings.storage_limit || 100).toFixed(2)} GB
          </div>
          <div className="info-item">
            <strong>Dernière Archivage:</strong> {settings.last_archive_date ? new Date(settings.last_archive_date).toLocaleDateString('fr-FR') : 'Jamais'}
          </div>
        </div>
      </div>
    </div>
  );
}
