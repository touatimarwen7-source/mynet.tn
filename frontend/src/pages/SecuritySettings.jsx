import { useState, useEffect } from 'react';
import axios from 'axios';
import { setPageTitle } from '../utils/pageTitle';
import '../styles/profile-modern.css';

export default function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    setPageTitle('Paramètres de Sécurité');
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/user/security', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setMfaEnabled(response.data.mfa_enabled || false);
      setSessions(response.data.sessions || []);
    } catch (error) {
      setError('Erreur lors de la récupération des paramètres de sécurité');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    try {
      await axios.post('http://localhost:3000/api/user/change-password', {
        current_password: currentPassword,
        new_password: newPassword
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setSuccess('Le mot de passe a été modifié avec succès');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(''), 4000);
    } catch (error) {
      setPasswordError(error.response?.data?.error || 'Erreur lors de la modification du mot de passe');
    }
  };

  const handleToggleMFA = async () => {
    try {
      await axios.post('http://localhost:3000/api/user/toggle-mfa', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setMfaEnabled(!mfaEnabled);
      setSuccess(mfaEnabled ? 'Authentification deux facteurs désactivée' : 'Authentification deux facteurs activée');
      setTimeout(() => setSuccess(''), 4000);
    } catch (error) {
      setError(error.response?.data?.error || 'Erreur lors de la modification de l\'authentification');
    }
  };

  const handleRevokeSession = async (sessionId) => {
    if (!confirm('Confirmez-vous la révocation de cette session?')) return;
    try {
      await axios.post(`http://localhost:3000/api/user/revoke-session/${sessionId}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setSuccess('Session révoquée avec succès');
      setTimeout(() => setSuccess(''), 4000);
      fetchSecurityData();
    } catch (error) {
      setError(error.response?.data?.error || 'Erreur lors de la révocation');
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
        <h1 className="page-title">Paramètres de Sécurité</h1>
        <p className="page-subtitle">Gérez vos paramètres de sécurité et d'authentification</p>
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

      {/* Change Password Section */}
      <div className="profile-section animate-slide-up">
        <h3 className="section-title">Modification du Mot de Passe</h3>
        <form onSubmit={handleChangePassword} className="form-container">
          <div className="form-section">
            <div className="form-group">
              <label className="form-label">Mot de Passe Actuel</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="form-input"
                placeholder="Entrez votre mot de passe actuel"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nouveau Mot de Passe</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="form-input"
                placeholder="Minimum 8 caractères"
                required
              />
              <small className="form-help">Minimum 8 caractères contenant majuscules, minuscules et chiffres</small>
            </div>

            <div className="form-group">
              <label className="form-label">Confirmer le Mot de Passe</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
                placeholder="Confirmez le nouveau mot de passe"
                required
              />
            </div>

            {passwordError && (
              <div className="alert alert-danger" style={{ marginTop: '1rem' }}>
                {passwordError}
              </div>
            )}

            <div className="form-actions" style={{ justifyContent: 'flex-start', marginTop: '1.5rem' }}>
              <button type="submit" className="btn btn-primary">
                Modifier le Mot de Passe
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Two-Factor Authentication Section */}
      <div className="profile-section animate-slide-up">
        <h3 className="section-title">Authentification Deux Facteurs</h3>
        <div className="security-feature-card">
          <div className="feature-info">
            <p className="feature-description">
              L'authentification deux facteurs ajoute une couche de sécurité supplémentaire à votre compte. 
              Vous devrez fournir un code de vérification en plus de votre mot de passe lors de la connexion.
            </p>
            <div style={{ marginTop: '1rem' }}>
              <span className="badge" style={{
                background: mfaEnabled ? 'rgba(15, 125, 59, 0.1)' : 'rgba(217, 119, 6, 0.1)',
                color: mfaEnabled ? '#0F7D3B' : '#D97706',
                border: `1px solid ${mfaEnabled ? '#0F7D3B' : '#D97706'}`
              }}>
                {mfaEnabled ? 'Activé' : 'Désactivé'}
              </span>
            </div>
          </div>
          <div className="form-actions" style={{ justifyContent: 'flex-start', gap: '1rem' }}>
            <button 
              className={`btn ${mfaEnabled ? 'btn-secondary' : 'btn-primary'}`}
              onClick={handleToggleMFA}
            >
              {mfaEnabled ? 'Désactiver l\'Authentification Deux Facteurs' : 'Activer l\'Authentification Deux Facteurs'}
            </button>
          </div>
        </div>
      </div>

      {/* Active Sessions Section */}
      <div className="profile-section animate-slide-up">
        <h3 className="section-title">Sessions Actives</h3>
        <p className="section-description">
          Voici toutes les sessions actives associées à votre compte. 
          Vous pouvez révoquer une session pour vous déconnecter d'un appareil.
        </p>
        
        {sessions.length === 0 ? (
          <div className="empty-state">Aucune session active</div>
        ) : (
          <div className="table-wrapper" style={{ overflowX: 'auto' }}>
            <table className="sessions-table">
              <thead>
                <tr>
                  <th>Appareil</th>
                  <th>Adresse IP</th>
                  <th>Dernière Activité</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id}>
                    <td><strong>{session.device || 'Appareil Inconnu'}</strong></td>
                    <td>{session.ip_address}</td>
                    <td>{new Date(session.last_activity).toLocaleString('fr-FR')}</td>
                    <td>
                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={() => handleRevokeSession(session.id)}
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
    </div>
  );
}
