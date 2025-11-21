import { useState, useEffect } from 'react';
import { authAPI } from '../api';
import { setPageTitle } from '../utils/pageTitle';
import '../styles/profile-modern.css';

export default function Profile({ user }) {
  useEffect(() => {
    setPageTitle('Mon Profil Professionnel');
  }, []);

  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [interests, setInterests] = useState([]);
  const [newInterest, setNewInterest] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [alertData, setAlertData] = useState({ type: 'tender', keyword: '' });
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    fetchProfile();
    fetchActivity();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await authAPI.getProfile();
      setProfile(response.data.user);
      setFormData(response.data.user);
      setInterests(response.data.user.interests || []);
      setAlerts(response.data.user.alerts || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivity = async () => {
    try {
      const response = await authAPI.getActivity?.();
      if (response?.data) {
        setActivity(response.data.activity || []);
      }
    } catch (err) {
      console.error('Erreur lors du chargement de l\'activité');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authAPI.updateProfile(formData);
      setProfile(response.data.user);
      setEditing(false);
      setSuccess('Profil mis à jour avec succès');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest)) {
      setInterests([...interests, newInterest]);
      setNewInterest('');
    }
  };

  const removeInterest = (index) => {
    setInterests(interests.filter((_, i) => i !== index));
  };

  const addAlert = () => {
    if (alertData.keyword.trim()) {
      const newAlert = {
        id: Date.now(),
        ...alertData,
        created_at: new Date().toLocaleDateString('fr-FR')
      };
      setAlerts([...alerts, newAlert]);
      setAlertData({ type: 'tender', keyword: '' });
      setShowAlertForm(false);
    }
  };

  const removeAlert = (id) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-skeleton" style={{ height: '400px', borderRadius: '12px' }}></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="page-container">
        <div className="alert alert-danger">Profil non trouvé</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header animate-slide-down">
        <h1 className="page-title">Mon Profil Professionnel</h1>
        <p className="page-subtitle">Gérez vos informations de compte et vos paramètres professionnels</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-danger animate-slide-up">
          <span>⚠</span>
          <div>{error}</div>
        </div>
      )}
      {success && (
        <div className="alert alert-success animate-slide-up">
          <span>✔</span>
          <div>{success}</div>
        </div>
      )}

      <div className="profile-layout">
        {!editing ? (
          <>
            {/* Profile Card - Main Info */}
            <div className="profile-card animate-scale-in">
              <div className="profile-card-header">
                <div className="profile-avatar">
                  {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="profile-header-info">
                  <h2 className="profile-name">{profile.full_name || profile.username}</h2>
                  <p className="profile-role">{profile.role === 'buyer' ? 'Acheteur' : profile.role === 'supplier' ? 'Fournisseur' : 'Administrateur'}</p>
                </div>
              </div>

              <div className="profile-info-grid">
                {/* Personal Information */}
                <div className="info-group">
                  <div className="info-item">
                    <label className="info-label">Adresse Email</label>
                    <p className="info-value">{profile.email}</p>
                  </div>
                  <div className="info-item">
                    <label className="info-label">Nom d'Utilisateur</label>
                    <p className="info-value">{profile.username}</p>
                  </div>
                  <div className="info-item">
                    <label className="info-label">Numéro de Téléphone</label>
                    <p className="info-value">{profile.phone || '—'}</p>
                  </div>
                </div>

                {/* Company Information */}
                <div className="info-group">
                  <div className="info-item">
                    <label className="info-label">Raison Sociale</label>
                    <p className="info-value">{profile.company_name || '—'}</p>
                  </div>
                  <div className="info-item">
                    <label className="info-label">Numéro d'Enregistrement</label>
                    <p className="info-value">{profile.company_registration || '—'}</p>
                  </div>
                  <div className="info-item">
                    <label className="info-label">Statut de Vérification</label>
                    <div className="info-value">
                      {profile.is_verified ? (
                        <span className="badge badge-success">Vérifié</span>
                      ) : (
                        <span className="badge badge-warning">En Attente de Vérification</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div className="info-group">
                  <div className="info-item">
                    <label className="info-label">Date de Création</label>
                    <p className="info-value">{new Date(profile.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div className="info-item">
                    <label className="info-label">Dernière Modification</label>
                    <p className="info-value">{new Date(profile.updated_at || profile.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Section */}
            <div className="profile-section animate-slide-up">
              <h3 className="section-title">Historique d'Activité</h3>
              {activity.length === 0 ? (
                <div className="empty-state">Aucune activité disponible pour le moment</div>
              ) : (
                <div className="activity-timeline">
                  {activity.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="activity-item">
                      <div className="activity-icon">
                        {item.type === 'login' ? '📥' : item.type === 'update' ? '📝' : item.type === 'tender' ? '📄' : '🎯'}
                      </div>
                      <div className="activity-content">
                        <p className="activity-title">{item.description || item.type}</p>
                        <p className="activity-date">{new Date(item.created_at).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Interests Section */}
            <div className="profile-section animate-slide-up">
              <h3 className="section-title">Secteurs d'Intérêt</h3>
              <div className="interests-container">
                <div className="interests-list">
                  {interests.length === 0 ? (
                    <div className="empty-state">Aucun domaine d'intérêt défini</div>
                  ) : (
                    interests.map((interest, idx) => (
                      <div key={idx} className="interest-tag">
                        <span>{interest}</span>
                        <button 
                          className="remove-btn"
                          onClick={() => removeInterest(idx)}
                          title="Supprimer"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
                <div className="add-interest-form">
                  <input
                    type="text"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                    placeholder="Ajouter..."
                    className="form-input"
                  />
                  <button 
                    onClick={addInterest}
                    className="interest-add-btn"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </div>

            {/* Search Tools Section */}
            <div className="profile-section animate-slide-up">
              <h3 className="section-title">Services Disponibles</h3>
              <div className="tools-grid">
                <div className="tool-card">
                  <div className="tool-icon">📋</div>
                  <h4>Recherche Avancée des Appels d'Offres Publics</h4>
                  <p>Recherchez les appels d'offres par catégorie, budget et localisation</p>
                  <button className="btn btn-outline btn-sm">Accéder</button>
                </div>
                <div className="tool-card">
                  <div className="tool-icon">🏢</div>
                  <h4>Recherche de Fournisseurs</h4>
                  <p>Trouvez les fournisseurs spécialisés dans votre domaine</p>
                  <button className="btn btn-outline btn-sm">Accéder</button>
                </div>
                <div className="tool-card">
                  <div className="tool-icon">📊</div>
                  <h4>Analyse du Marché</h4>
                  <p>Obtenez des analyses et des statistiques du marché</p>
                  <button className="btn btn-outline btn-sm">Accéder</button>
                </div>
                <div className="tool-card">
                  <div className="tool-icon">⭐</div>
                  <h4>Recommandations</h4>
                  <p>Obtenez des recommandations personnalisées basées sur vos préférences</p>
                  <button className="btn btn-outline btn-sm">Accéder</button>
                </div>
              </div>
            </div>

            {/* Alerts Section */}
            <div className="profile-section animate-slide-up">
              <div className="alerts-header">
                <h3 className="section-title">Système de Notifications</h3>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowAlertForm(!showAlertForm)}
                >
                  {showAlertForm ? 'Fermer' : 'Créer une Notification'}
                </button>
              </div>

              {showAlertForm && (
                <div className="alert-form animate-slide-down">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Type de Notification</label>
                      <select 
                        value={alertData.type}
                        onChange={(e) => setAlertData({...alertData, type: e.target.value})}
                        className="form-input"
                      >
                        <option value="tender">Appels d'Offres Publics</option>
                        <option value="award">Attributions de Marchés</option>
                        <option value="supplier">Nouveaux Fournisseurs</option>
                        <option value="market">Notifications du Marché</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mot clé</label>
                      <input
                        type="text"
                        value={alertData.keyword}
                        onChange={(e) => setAlertData({...alertData, keyword: e.target.value})}
                        placeholder="Exemple: Construction, Bâtiment..."
                        className="form-input"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={addAlert}
                    className="btn btn-primary"
                  >
                    Configurer
                  </button>
                </div>
              )}

              <div className="alerts-list">
                {alerts.length === 0 ? (
                  <div className="empty-state">Aucune notification configurée</div>
                ) : (
                  alerts.map((alert) => (
                    <div key={alert.id} className="alert-item">
                      <div className="alert-content">
                        <p className="alert-type">
                          {alert.type === 'tender' ? `📄 Appels d'Offres Publics` : 
                           alert.type === 'award' ? `🏆 Prix` :
                           alert.type === 'supplier' ? `🏢 Fournisseurs` : `📊 Marché`}
                        </p>
                        <p className="alert-keyword">Mot clé: <strong>{alert.keyword}</strong></p>
                      </div>
                      <button 
                        className="btn btn-sm btn-outline"
                        onClick={() => removeAlert(alert.id)}
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Edit Button */}
            <div className="profile-actions">
              <button 
                className="btn btn-primary btn-lg hover-lift"
                onClick={() => setEditing(true)}
              >
                Modifier votre Profil
              </button>
            </div>
          </>
        ) : (
          /* Edit Form */
          <div className="profile-edit-form animate-scale-in">
            <h2 className="form-title">Modifier Votre Profil Professionnel</h2>
            
            <form onSubmit={handleSubmit} className="form-container">
              {/* Personal Information Section */}
              <div className="form-section">
                <h3 className="form-section-title">Informations Personnelles</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Nom Complet</label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name || ''}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Votre nom complet"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Numéro de Téléphone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="+216 XX XXX XXX"
                    />
                  </div>
                </div>
              </div>

              {/* Company Information Section */}
              <div className="form-section">
                <h3 className="form-section-title">Informations Professionnelles</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Raison Sociale</label>
                    <input
                      type="text"
                      name="company_name"
                      value={formData.company_name || ''}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Dénomination de votre entreprise"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Numéro d'Enregistrement</label>
                    <input
                      type="text"
                      name="company_registration"
                      value={formData.company_registration || ''}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Matricule fiscal"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditing(false);
                    setFormData(profile);
                    setError('');
                  }}
                >
                  ✕ Annuler
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? '⏳ Traitement en cours......' : '💾 Enregistrer les Modifications'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
