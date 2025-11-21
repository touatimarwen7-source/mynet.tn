import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { procurementAPI } from '../api';
import EnhancedTable from '../components/EnhancedTable';

export default function TenderList() {
  const navigate = useNavigate();
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchTenders();
  }, []);

  const fetchTenders = async () => {
    try {
      setLoading(true);
      const response = await procurementAPI.getTenders();
      setTenders(response.data.tenders || []);
    } catch (err) {
      console.error('Erreur lors de la récupération des appels d\'offres:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleParticipate = (tenderId) => {
    navigate(`/create-offer/${tenderId}`);
  };

  if (loading) return <div className="loading">Chargement des appels d'offres...</div>;

  return (
    <div className="page tender-list-page">
      <h1>Appels d'offres</h1>
      
      <div className="filter-section">
        <input
          type="text"
          placeholder="Titre de l'appel d'offres"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input-filter"
        />
      </div>

      {tenders.length === 0 ? (
        <div className="alert alert-info">Aucun appel d'offres disponible</div>
      ) : (
        <EnhancedTable
          data={tenders}
          columns={[
            { header: 'Titre', accessor: 'title' },
            { header: 'Entreprise', accessor: 'buyer_name' },
            { header: 'Budget', accessor: 'budget_min' },
            { header: 'Date limite', accessor: 'deadline', 
              render: (val) => new Date(val).toLocaleDateString('fr-FR') 
            },
            { header: 'Statut', accessor: 'status' },
          ]}
          actions={(tender) => (
            <button 
              onClick={() => handleParticipate(tender.id)}
              className="btn btn-small"
            >
              Participer
            </button>
          )}
        />
      )}
    </div>
  );
}
