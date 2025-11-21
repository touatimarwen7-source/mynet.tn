import { useState, useEffect } from 'react';
import axios from 'axios';
import { setPageTitle } from '../utils/pageTitle';
import '../styles/profile-modern.css';

export default function TenderSecuritySettings() {
  const [settings, setSettings] = useState({
    allow_public_view: false,
    require_authentication: true,
    restrict_downloads: false,
    enable_audit_log: true,
    max_shares: 5,
    expiry_days: 30
  });
  const [sharedUsers, setSharedUsers] = useState([]);
  const [newShareEmail, setNewShareEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setPageTitle('Sécurité des Appels d\'Offres');
    fetchSecuritySettings();
  }, []);

  const fetchSecuritySettings = async () => {
    try {
      const response = await axios.get('/api/tenders/security', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setSettings(response.data.settings || settings);
      setSharedUsers(response.data.shared_users || []);
    } catch (error) {
      setError('Erreur lors de la récupération des paramètres de sécurité');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleInputChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAddShare = async (e) => {
    e.preventDefault();
    if (!newShareEmail.trim()) return;

    try {
      await axios.post('/api/tenders/share', {
        email: newShareEmail,
        permissions: 'view'
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setSuccess('Accès partagé avec succès');
      setNewShareEmail('');
      setTimeout(() => setSuccess(''), 4000);
      fetchSecuritySettings();
    } catch (error) {
      setError(error.response?.data?.error || 'Erreur lors du partage');
    }
  };

  const handleRemoveShare = async (userId) => {
    if (!confirm('Confirmez-vous la suppression de cet accès?')) return;
    
    try {
      await axios.delete(`http://localhost:3000/api/tenders/share/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setSuccess('Accès supprimé avec succès');
      setTimeout(() => setSuccess(''), 4000);
      fetchSecuritySettings();
    } catch (error) {
      setError(error.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await axios.put('/api/tenders/security', settings, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setSuccess('Paramètres de sécurité enregistrés avec succès');
      setTimeout(() => setSuccess(''), 4000);
    } catch (error) {
      setError(error.response?.data?.error || 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-skeleton" style={{ height: '400px', borderRadius: '12px' }}></div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header animate-slide-down">
        <h1 className="page-title">Sécurité des Appels d'Offres</h1>
        <p className="page-subtitle">Contrôlez l'accès et les permissions de vos appels d'offres</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-danger animate-slide-up">
          <span>Erreur</span>
          <div>{error}</div>
        </div>
      )}
      {success && (
        <div className="alert alert-success animate-slide-up">
          <span>Succès</span>
          <div>{success}</div>
        </div>
      )}

      {/* Access Control Section */}
      <div className="profile-section animate-slide-up">
        <h3 className="section-title">Contrôle d'Accès</h3>
        <div className="security-settings-group">
          <div className="setting-item">
            <div className="setting-control">
              <input
                type="checkbox"
                id="allow_public_view"
                checked={settings.allow_public_view}
                onChange={() => handleToggle('allow_public_view')}
                className="preference-checkbox"
              />
              <label htmlFor="allow_public_view" className="preference-label">
                <strong>Autoriser l'Affichage Public</strong>
                <p className="preference-description">
                  Permettre aux utilisateurs non authentifiés d'afficher vos appels d'offres publics
                </p>
              </label>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-control">
              <input
                type="checkbox"
                id="require_authentication"
                checked={settings.require_authentication}
                onChange={() => handleToggle('require_authentication')}
                className="preference-checkbox"
              />
              <label htmlFor="require_authentication" className="preference-label">
                <strong>Exiger l'Authentification</strong>
                <p className="preference-description">
                  Exiger une connexion pour accéder aux détails complets des appels d'offres
                </p>
              </label>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-control">
              <input
                type="checkbox"
                id="restrict_downloads"
                checked={settings.restrict_downloads}
                onChange={() => handleToggle('restrict_downloads')}
                className="preference-checkbox"
              />
              <label htmlFor="restrict_downloads" className="preference-label">
                <strong>Restreindre les Téléchargements</strong>
                <p className="preference-description">
                  Limiter le téléchargement des documents aux utilisateurs autorisés uniquement
                </p>
              </label>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-control">
              <input
                type="checkbox"
                id="enable_audit_log"
                checked={settings.enable_audit_log}
                onChange={() => handleToggle('enable_audit_log')}
                className="preference-checkbox"
              />
              <label htmlFor="enable_audit_log" className="preference-label">
                <strong>Journal d'Audit</strong>
                <p className="preference-description">
                  Enregistrer tous les accès et modifications aux appels d'offres
                </p>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Expiration Settings */}
      <div className="profile-section animate-slide-up">
        <h3 className="section-title">Paramètres de Durée</h3>
        <div className="form-section">
          <div className="form-group">
            <label className="form-label">Durée d'Expiration (jours)</label>
            <input
              type="number"
              value={settings.expiry_days}
              onChange={(e) => handleInputChange('expiry_days', parseInt(e.target.value))}
              className="form-input"
              min="1"
              max="365"
            />
            <small className="form-help">Les appels d'offres expireront après ce nombre de jours</small>
          </div>

          <div className="form-group">
            <label className="form-label">Nombre Maximum de Partages</label>
            <input
              type="number"
              value={settings.max_shares}
              onChange={(e) => handleInputChange('max_shares', parseInt(e.target.value))}
              className="form-input"
              min="1"
              max="50"
            />
            <small className="form-help">Limite du nombre de personnes avec lesquelles partager</small>
          </div>
        </div>
      </div>

      {/* Share Access Section */}
      <div className="profile-section animate-slide-up">
        <h3 className="section-title">Partage d'Accès</h3>
        
        <div className="share-form" style={{ marginBottom: '2rem' }}>
          <form onSubmit={handleAddShare} className="form-section">
            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Adresse Email</label>
                <input
                  type="email"
                  value={newShareEmail}
                  onChange={(e) => setNewShareEmail(e.target.value)}
                  className="form-input"
                  placeholder="utilisateur@exemple.com"
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button type="submit" className="btn btn-primary">
                  Partager l'Accès
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Shared Users Table */}
        {sharedUsers.length === 0 ? (
          <div className="empty-state">Aucun partage actuellement actif</div>
        ) : (
          <div className="table-wrapper">
            <table className="sessions-table">
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Email</th>
                  <th>Permissions</th>
                  <th>Date d'Accès</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sharedUsers.map((user) => (
                  <tr key={user.id}>
                    <td><strong>{user.name || 'Utilisateur'}</strong></td>
                    <td>{user.email}</td>
                    <td>
                      <span className="badge badge-success">Consultation</span>
                    </td>
                    <td>{new Date(user.shared_at).toLocaleDateString('fr-FR')}</td>
                    <td>
                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={() => handleRemoveShare(user.id)}
                      >
                        Révoquer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="profile-section">
        <div className="form-actions" style={{ justifyContent: 'flex-end' }}>
          <button 
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Enregistrement en cours...' : 'Enregistrer les Paramètres'}
          </button>
        </div>
      </div>
    </div>
  );
}
