import { useState, useEffect } from 'react';
import axios from 'axios';
import { setPageTitle } from '../utils/pageTitle';
import '../styles/profile-modern.css';

export default function NotificationPreferences() {
  const [preferences, setPreferences] = useState({
    tender_updates: true,
    bid_updates: true,
    payment_notifications: true,
    system_alerts: true,
    marketing: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setPageTitle('Préférences de Notifications');
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await axios.get('/api/user/notification-preferences', {
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

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      await axios.put('/api/user/notification-preferences', preferences, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setSuccess('Préférences de notifications enregistrées avec succès');
      setTimeout(() => setSuccess(''), 4000);
    } catch (error) {
      setError(error.response?.data?.error || 'Erreur lors de l\'enregistrement des préférences');
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
        <h1 className="page-title">Préférences de Notifications</h1>
        <p className="page-subtitle">Configurez les types de notifications que vous souhaitez recevoir</p>
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

      {/* Tender Updates Section */}
      <div className="profile-section animate-slide-up">
        <h3 className="section-title">Appels d'Offres et Attributions</h3>
        <div className="preferences-group">
          <div className="preference-item">
            <div className="preference-control">
              <input
                type="checkbox"
                id="tender_updates"
                checked={preferences.tender_updates}
                onChange={() => handleToggle('tender_updates')}
                className="preference-checkbox"
              />
              <label htmlFor="tender_updates" className="preference-label">
                <strong>Nouvelles Publications d'Appels d'Offres</strong>
                <p className="preference-description">
                  Recevez une notification lorsqu'un nouveau marché public est publié dans vos secteurs d'intérêt
                </p>
              </label>
            </div>
          </div>

          <div className="preference-item">
            <div className="preference-control">
              <input
                type="checkbox"
                id="bid_updates"
                checked={preferences.bid_updates}
                onChange={() => handleToggle('bid_updates')}
                className="preference-checkbox"
              />
              <label htmlFor="bid_updates" className="preference-label">
                <strong>Mises à Jour d'Offres et d'Attributions</strong>
                <p className="preference-description">
                  Recevez une notification pour les changements de statut des appels d'offres auxquels vous avez répondu
                </p>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Notifications Section */}
      <div className="profile-section animate-slide-up">
        <h3 className="section-title">Notifications Financières</h3>
        <div className="preferences-group">
          <div className="preference-item">
            <div className="preference-control">
              <input
                type="checkbox"
                id="payment_notifications"
                checked={preferences.payment_notifications}
                onChange={() => handleToggle('payment_notifications')}
                className="preference-checkbox"
              />
              <label htmlFor="payment_notifications" className="preference-label">
                <strong>Notifications de Paiement</strong>
                <p className="preference-description">
                  Recevez une notification pour chaque paiement reçu ou facture créée
                </p>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* System Alerts Section */}
      <div className="profile-section animate-slide-up">
        <h3 className="section-title">Alertes Système</h3>
        <div className="preferences-group">
          <div className="preference-item">
            <div className="preference-control">
              <input
                type="checkbox"
                id="system_alerts"
                checked={preferences.system_alerts}
                onChange={() => handleToggle('system_alerts')}
                className="preference-checkbox"
              />
              <label htmlFor="system_alerts" className="preference-label">
                <strong>Alertes de Sécurité et de Système</strong>
                <p className="preference-description">
                  Recevez des alertes importantes concernant la sécurité de votre compte et la maintenance du système
                </p>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Marketing Section */}
      <div className="profile-section animate-slide-up">
        <h3 className="section-title">Communications Commerciales</h3>
        <div className="preferences-group">
          <div className="preference-item">
            <div className="preference-control">
              <input
                type="checkbox"
                id="marketing"
                checked={preferences.marketing}
                onChange={() => handleToggle('marketing')}
                className="preference-checkbox"
              />
              <label htmlFor="marketing" className="preference-label">
                <strong>Offres Spéciales et Promotions</strong>
                <p className="preference-description">
                  Recevez des informations sur les offres spéciales et les promotions disponibles
                </p>
              </label>
            </div>
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
