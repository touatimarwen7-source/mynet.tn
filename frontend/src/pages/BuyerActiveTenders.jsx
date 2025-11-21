import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { procurementAPI } from '../api';
import { formatDate, parseDate } from '../utils/dateFormatter';
import { setPageTitle } from '../utils/pageTitle';
import '../styles/corporate-design.css';
import '../styles/tables-dense.css';

export default function BuyerActiveTenders() {
  const navigate = useNavigate();
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');

  useEffect(() => {
    setPageTitle('Appels d\'Offres Actifs');
  }, []);

  useEffect(() => {
    fetchActiveTenders();
  }, []);

  const fetchActiveTenders = async () => {
    try {
      setLoading(true);
      const response = await procurementAPI.getMyTenders({ status: 'active' });
      setTenders(response.data.tenders || []);
    } catch (err) {
      console.error('Erreur lors de la récupération des appels d\'offres actifs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTenders = tenders.filter(t =>
    t.title.toLowerCase().includes(filter.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(filter.toLowerCase()))
  );

  const sortedTenders = [...filteredTenders].sort((a, b) => {
    if (sortBy === 'created_at') return parseDate(b.created_at) - parseDate(a.created_at);
    if (sortBy === 'deadline') return parseDate(a.deadline) - parseDate(b.deadline);
    if (sortBy === 'budget') return (b.budget_max || 0) - (a.budget_max || 0);
    return 0;
  });

  const handleViewTender = (tenderId) => {
    navigate(`/tender/${tenderId}`);
  };

  const handleEditTender = (tenderId) => {
    navigate(`/tender/${tenderId}/edit`);
  };

  const handleCloseTender = async (tenderId) => {
    if (window.confirm('Êtes-vous sûr de vouloir clôturer cet appel d\'offres ?')) {
      try {
        await procurementAPI.closeTender(tenderId);
        fetchActiveTenders();
      } catch (err) {
        console.error('Erreur lors de la clôture:', err);
      }
    }
  };

  if (loading) {
    return <div className="loading">Chargement des appels d'offres actifs...</div>;
  }

  return (
    <div className="page buyer-active-tenders-page">
      <div className="page-header corporate">
        <div className="header-content">
          <h1>📋 Appels d'Offres Actifs</h1>
          <p className="subtitle">Gérez vos appels d'offres en cours</p>
        </div>
        <button 
          onClick={() => navigate('/create-tender')}
          className="btn btn-primary-corporate"
        >
          ➕ Créer Nouvel Appel
        </button>
      </div>

      <div className="filters-section corporate">
        <div className="search-group">
          <input
            type="text"
            placeholder="Rechercher par titre ou description..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-search-corporate"
          />
        </div>
        <div className="sort-group">
          <label>Trier par:</label>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="select-corporate"
          >
            <option value="created_at">Date de création (récent)</option>
            <option value="deadline">Date limite (urgent)</option>
            <option value="budget">Budget (élevé)</option>
          </select>
        </div>
      </div>

      {sortedTenders.length === 0 ? (
        <div className="empty-state corporate">
          <div className="empty-icon">📋</div>
          <h3>Aucun appel d'offres actif</h3>
          <p>Vous n'avez pas d'appels d'offres actifs pour le moment.</p>
          <button 
            onClick={() => navigate('/create-tender')}
            className="btn btn-primary-corporate"
          >
            Créer votre premier appel
          </button>
        </div>
      ) : (
        <div className="tenders-grid corporate">
          {sortedTenders.map((tender) => (
            <div key={tender.id} className="tender-card corporate">
              <div className="card-header">
                <h3 className="tender-title">{tender.title}</h3>
                <span className="status-badge active">Actif</span>
              </div>

              <div className="card-body">
                <p className="tender-description">{tender.description?.substring(0, 100)}...</p>
                
                <div className="tender-meta">
                  <div className="meta-item">
                    <label>Catégorie:</label>
                    <span>{tender.category}</span>
                  </div>
                  <div className="meta-item">
                    <label>Budget:</label>
                    <span className="budget-value">{tender.budget_max?.toLocaleString()} {tender.currency}</span>
                  </div>
                </div>

                <div className="tender-dates">
                  <div className="date-item">
                    <label>Date limite:</label>
                    <span>{formatDate(tender.deadline)}</span>
                  </div>
                  <div className="date-item">
                    <label>Créé le:</label>
                    <span>{formatDate(tender.created_at)}</span>
                  </div>
                </div>

                {tender.offers_count && (
                  <div className="offers-info">
                    <span className="offers-count">📊 {tender.offers_count} offre(s) reçue(s)</span>
                  </div>
                )}
              </div>

              <div className="card-footer">
                <button
                  onClick={() => handleViewTender(tender.id)}
                  className="btn btn-small btn-primary-corporate"
                  title="Voir les détails"
                >
                  Voir Détails
                </button>
                <button
                  onClick={() => handleEditTender(tender.id)}
                  className="btn btn-small btn-secondary-corporate"
                  title="Modifier"
                >
                  ✏️ Modifier
                </button>
                <button
                  onClick={() => handleCloseTender(tender.id)}
                  className="btn btn-small btn-danger-corporate"
                  title="Clôturer l'appel"
                >
                  🔒 Clôturer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
