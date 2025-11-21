import { useState, useEffect } from 'react';
import axios from 'axios';
import { setPageTitle } from '../utils/pageTitle';

export default function SubscriptionTiers() {
  const [tiers, setTiers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newTier, setNewTier] = useState({
    name: '',
    price: 0,
    description: '',
    max_users: 10,
    features: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPageTitle('Gestion des Forfaits');
    fetchTiers();
  }, []);

  const fetchTiers = async () => {
    try {
      const response = await axios.get('/api/admin/subscription-tiers', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setTiers(response.data.tiers || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTier = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/subscription-tiers', newTier, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      alert('Forfait créé avec succès');
      setNewTier({ name: '', price: 0, description: '', max_users: 10, features: [] });
      setShowForm(false);
      fetchTiers();
    } catch (error) {
      alert('Erreur: ' + error.response?.data?.error);
    }
  };

  const handleDeleteTier = async (tierId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce forfait?')) return;
    try {
      await axios.delete(`http://localhost:3000/api/admin/subscription-tiers/${tierId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      alert('Forfait supprimé');
      fetchTiers();
    } catch (error) {
      alert('Erreur: ' + error.response?.data?.error);
    }
  };

  if (loading) return <div className="loading">Chargement en cours...</div>;

  return (
    <div className="subscription-tiers">
      <h1>💳 Gestion des Forfaits</h1>

      <button 
        className="btn btn-primary add-tier-btn"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? 'Annuler' : '➕ Ajouter un Forfait'}
      </button>

      {showForm && (
        <form onSubmit={handleCreateTier} className="tier-form">
          <h2>Créer un Nouveau Forfait</h2>

          <div className="form-group">
            <label>Nom du Forfait:</label>
            <select 
              value={newTier.name}
              onChange={(e) => setNewTier({...newTier, name: e.target.value})}
              required
            >
              <option value="">Sélectionner un forfait</option>
              <option value="Silver">Silver</option>
              <option value="Gold">Gold</option>
              <option value="Platinum">Platinum</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Prix Mensuel (TND):</label>
              <input 
                type="number" 
                value={newTier.price}
                onChange={(e) => setNewTier({...newTier, price: parseFloat(e.target.value)})}
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label>Nombre Max d'Utilisateurs:</label>
              <input 
                type="number" 
                value={newTier.max_users}
                onChange={(e) => setNewTier({...newTier, max_users: parseInt(e.target.value)})}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description:</label>
            <textarea 
              value={newTier.description}
              onChange={(e) => setNewTier({...newTier, description: e.target.value})}
              rows={3}
            />
          </div>

          <button type="submit" className="btn btn-success">✓ Créer le Forfait</button>
        </form>
      )}

      <div className="tiers-grid">
        {tiers.map((tier) => (
          <div key={tier.id} className="tier-card">
            <h3>{tier.name}</h3>
            <p className="price">{tier.price} TND/mois</p>
            <p className="description">{tier.description}</p>
            <p><strong>Max Utilisateurs:</strong> {tier.max_users}</p>
            
            {tier.features && tier.features.length > 0 && (
              <div className="features-list">
                <h4>Fonctionnalités:</h4>
                <ul>
                  {tier.features.map((f, idx) => (
                    <li key={idx}>✓ {f}</li>
                  ))}
                </ul>
              </div>
            )}

            <button 
              className="btn btn-danger"
              onClick={() => handleDeleteTier(tier.id)}
            >
              🗑️ Supprimer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
