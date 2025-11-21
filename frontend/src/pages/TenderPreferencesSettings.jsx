import { useState, useEffect } from 'react';
import axios from 'axios';
import { setPageTitle } from '../utils/pageTitle';
import '../styles/profile-modern.css';

export default function TenderPreferencesSettings() {
  const [preferences, setPreferences] = useState({
    auto_publish: false,
    enable_bids: true,
    require_bid_bond: true,
    allow_amendments: true,
    allow_partial_bids: false,
    notify_bid_changes: true,
    notify_deadline_approaching: true,
    default_bid_period: 30,
    default_validity: 90
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setPageTitle('Préférences des Appels d\'Offres');
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await axios.get('/api/tenders/preferences', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setPreferences(response.data.preferences || preferences);
    } catch (error) {
      setError('Erreur lors de la récupération des préférences');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleInputChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await axios.put('/api/tenders/preferences', preferences, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setSuccess('Préférences enregistrées avec succès');
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
        <h1 className="page-title">Préférences des Appels d'Offres</h1>
        <p className="page-subtitle">Configurez les paramètres par défaut de vos appels d'offres</p>
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

      {/* Publication Settings */}
      <div className="profile-section animate-slide-up">
        <h3 className="section-title">Paramètres de Publication</h3>
        <div className="preferences-group">
          <div className="preference-item">
            <div className="preference-control">
              <input
                type="checkbox"
                id="auto_publish"
                checked={preferences.auto_publish}
                onChange={() => handleToggle('auto_publish')}
                className="preference-checkbox"
              />
              <label htmlFor="auto_publish" className="preference-label">
                <strong>Publication Automatique</strong>
                <p className="preference-description">
                  Publier automatiquement les appels d'offres une fois que tous les détails sont complétés
                </p>
              </label>
            </div>
          </div>

          <div className="preference-item">
            <div className="preference-control">
              <input
                type="checkbox"
                id="enable_bids"
                checked={preferences.enable_bids}
                onChange={() => handleToggle('enable_bids')}
                className="preference-checkbox"
              />
              <label htmlFor="enable_bids" className="preference-label">
                <strong>Autoriser les Offres</strong>
                <p className="preference-description">
                  Permettre aux fournisseurs de soumettre des offres sur vos appels d'offres
                </p>
              </label>
            </div>
          </div>

          <div className="preference-item">
            <div className="preference-control">
              <input
                type="checkbox"
                id="allow_amendments"
                checked={preferences.allow_amendments}
                onChange={() => handleToggle('allow_amendments')}
                className="preference-checkbox"
              />
              <label htmlFor="allow_amendments" className="preference-label">
                <strong>Autoriser les Modifications</strong>
                <p className="preference-description">
                  Permettre les modifications et compléments avant la date limite
                </p>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Bid Requirements */}
      <div className="profile-section animate-slide-up">
        <h3 className="section-title">Exigences des Offres</h3>
        <div className="preferences-group">
          <div className="preference-item">
            <div className="preference-control">
              <input
                type="checkbox"
                id="require_bid_bond"
                checked={preferences.require_bid_bond}
                onChange={() => handleToggle('require_bid_bond')}
                className="preference-checkbox"
              />
              <label htmlFor="require_bid_bond" className="preference-label">
                <strong>Garantie Préalable Obligatoire</strong>
                <p className="preference-description">
                  Exiger une garantie préalable de la part des soumissionnaires
                </p>
              </label>
            </div>
          </div>

          <div className="preference-item">
            <div className="preference-control">
              <input
                type="checkbox"
                id="allow_partial_bids"
                checked={preferences.allow_partial_bids}
                onChange={() => handleToggle('allow_partial_bids')}
                className="preference-checkbox"
              />
              <label htmlFor="allow_partial_bids" className="preference-label">
                <strong>Autoriser les Offres Partielles</strong>
                <p className="preference-description">
                  Permettre aux fournisseurs de proposer une offre partiellement
                </p>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="profile-section animate-slide-up">
        <h3 className="section-title">Notifications</h3>
        <div className="preferences-group">
          <div className="preference-item">
            <div className="preference-control">
              <input
                type="checkbox"
                id="notify_bid_changes"
                checked={preferences.notify_bid_changes}
                onChange={() => handleToggle('notify_bid_changes')}
                className="preference-checkbox"
              />
              <label htmlFor="notify_bid_changes" className="preference-label">
                <strong>Notifications de Changements d'Offres</strong>
                <p className="preference-description">
                  Recevoir une notification lorsqu'une offre est modifiée ou retirée
                </p>
              </label>
            </div>
          </div>

          <div className="preference-item">
            <div className="preference-control">
              <input
                type="checkbox"
                id="notify_deadline_approaching"
                checked={preferences.notify_deadline_approaching}
                onChange={() => handleToggle('notify_deadline_approaching')}
                className="preference-checkbox"
              />
              <label htmlFor="notify_deadline_approaching" className="preference-label">
                <strong>Alertes d'Approche de Délai</strong>
                <p className="preference-description">
                  Recevoir une notification lorsque la date limite d'un appel d'offres approche
                </p>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Default Periods */}
      <div className="profile-section animate-slide-up">
        <h3 className="section-title">Périodes par Défaut</h3>
        <div className="form-section">
          <div className="form-group">
            <label className="form-label">Durée de Consultation par Défaut (jours)</label>
            <input
              type="number"
              value={preferences.default_bid_period}
              onChange={(e) => handleInputChange('default_bid_period', parseInt(e.target.value))}
              className="form-input"
              min="1"
              max="180"
            />
            <small className="form-help">Durée par défaut pendant laquelle les offres peuvent être soumises</small>
          </div>

          <div className="form-group">
            <label className="form-label">Validité des Offres par Défaut (jours)</label>
            <input
              type="number"
              value={preferences.default_validity}
              onChange={(e) => handleInputChange('default_validity', parseInt(e.target.value))}
              className="form-input"
              min="1"
              max="365"
            />
            <small className="form-help">Durée par défaut de validité des offres soumises</small>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="profile-section">
        <div className="form-actions" style={{ justifyContent: 'flex-end' }}>
          <button 
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Enregistrement en cours...' : 'Enregistrer les Préférences'}
          </button>
        </div>
      </div>
    </div>
  );
}
