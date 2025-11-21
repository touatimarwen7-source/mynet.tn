import { useState, useEffect } from 'react';
import { authAPI } from '../api';

export default function Profile({ user }) {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await authAPI.getProfile();
      setProfile(response.data.user);
      setFormData(response.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
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

  if (loading) return <div className="loading">Chargement en cours...</div>;
  if (!profile) return <div className="alert alert-error">Profil non trouvé</div>;

  return (
    <div className="form-container" style={{ maxWidth: '600px' }}>
      <h2>Profil</h2>
      
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {!editing ? (
        <div>
          <div className="card">
            <p><strong>Nom d'utilisateur:</strong> {profile.username}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Nom complet:</strong> {profile.full_name}</p>
            <p><strong>Téléphone:</strong> {profile.phone || '-'}</p>
            <p><strong>Rôle:</strong> {profile.role}</p>
            <p><strong>Nom de l'entreprise:</strong> {profile.company_name || '-'}</p>
            <p><strong>Statut de vérification:</strong> {profile.is_verified ? '✓ Vérifié' : '✗ Non vérifié'}</p>
            <p style={{ fontSize: '0.9rem', color: '#999' }}>
              Créé le: {new Date(profile.created_at).toLocaleDateString('fr-FR')}
            </p>
          </div>

          <button 
            className="btn btn-primary" 
            onClick={() => setEditing(true)}
            style={{ marginTop: '1rem' }}
          >
            Modifier les données
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nom complet</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name || ''}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Téléphone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone || ''}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Nom de l'entreprise</label>
            <input
              type="text"
              name="company_name"
              value={formData.company_name || ''}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Numéro d'enregistrement de l'entreprise</label>
            <input
              type="text"
              name="company_registration"
              value={formData.company_registration || ''}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-primary" disabled={loading}>
              {loading ? 'Sauvegarde en cours...' : 'Enregistrer les modifications'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => {
                setEditing(false);
                setFormData(profile);
              }}
            >
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
