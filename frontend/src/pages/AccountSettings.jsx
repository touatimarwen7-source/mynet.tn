import { useState, useEffect } from 'react';
import axios from 'axios';
import { setPageTitle } from '../utils/pageTitle';

export default function AccountSettings() {
  const [settings, setSettings] = useState({
    email_notifications: true,
    sms_notifications: false,
    marketing_emails: false,
    theme: 'light'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPageTitle('Paramètres du Compte');
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/user/settings', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setSettings(response.data.settings || settings);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await axios.put('/api/user/settings', settings, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      alert('Paramètres sauvegardés avec succès');
    } catch (error) {
      alert('Erreur: ' + error.response?.data?.error);
    }
  };

  if (loading) return <div className="loading">Chargement en cours...</div>;

  return (
    <div className="account-settings">
      <h1>Paramètres du Compte</h1>

      <div className="settings-section">
        <h2>📬 Notifications</h2>
        
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.email_notifications}
              onChange={(e) => setSettings({...settings, email_notifications: e.target.checked})}
            />
            Notifications par Email
          </label>
          <p className="help-text">Recevoir les mises à jour importantes par email</p>
        </div>

        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.sms_notifications}
              onChange={(e) => setSettings({...settings, sms_notifications: e.target.checked})}
            />
            Notifications par SMS
          </label>
          <p className="help-text">Recevoir les alertes critiques par SMS</p>
        </div>

        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.marketing_emails}
              onChange={(e) => setSettings({...settings, marketing_emails: e.target.checked})}
            />
            Emails Marketing
          </label>
          <p className="help-text">Recevoir les offres spéciales et promotions</p>
        </div>
      </div>

      <div className="settings-section">
        <h2>🎨 Apparence</h2>
        
        <div className="setting-item">
          <label>Thème:</label>
          <select value={settings.theme} onChange={(e) => setSettings({...settings, theme: e.target.value})}>
            <option value="light">Clair</option>
            <option value="dark">Sombre</option>
            <option value="auto">Automatique</option>
          </select>
        </div>
      </div>

      <button className="btn btn-primary" onClick={handleSave}>Sauvegarder les Paramètres</button>
    </div>
  );
}
