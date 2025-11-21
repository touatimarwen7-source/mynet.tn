import { useState, useEffect } from 'react';
import { procurementAPI } from '../api';

export default function MyOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const response = await procurementAPI.getMyOffers();
      setOffers(response.data.offers || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du chargement des offres');
    } finally {
      setLoading(false);
    }
  };

  const filteredOffers = filter 
    ? offers.filter(o => o.status === filter)
    : offers;

  return (
    <div>
      <h2>Mes offres</h2>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">Tous les statuts</option>
          <option value="submitted">Envoyée</option>
          <option value="evaluated">Évaluée</option>
          <option value="accepted">Acceptée</option>
          <option value="rejected">Rejetée</option>
        </select>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Chargement en cours...</div>
      ) : filteredOffers.length === 0 ? (
        <div className="alert alert-info">Aucune offre disponible</div>
      ) : (
        <div className="tender-list">
          {filteredOffers.map(offer => (
            <div key={offer.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h3>{offer.tender_title}</h3>
                  <p style={{ color: '#666' }}>Numéro de l'offre: {offer.offer_number}</p>
                </div>
                <span className={`badge badge-${offer.status}`}>{offer.status}</span>
              </div>

              <div style={{ marginTop: '1rem', lineHeight: '1.8' }}>
                <p><strong>Montant:</strong> {offer.total_amount} {offer.currency}</p>
                <p><strong>Délai de livraison:</strong> {offer.delivery_time}</p>
                
                {offer.evaluation_score && (
                  <p><strong>Note d'évaluation:</strong> {offer.evaluation_score}/100</p>
                )}
                
                {offer.evaluation_notes && (
                  <p><strong>Commentaires d'évaluation:</strong> {offer.evaluation_notes}</p>
                )}

                <p style={{ fontSize: '0.9rem', color: '#999' }}>
                  Soumise le: {new Date(offer.submitted_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
