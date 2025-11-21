import { useState, useEffect } from 'react';
import { procurementAPI } from '../api';
import { setPageTitle } from '../utils/pageTitle';
import DashboardCards from '../components/DashboardCards';
import QuickActions from '../components/QuickActions';
import ImportantDocuments from '../components/ImportantDocuments';
import PaymentOrders from '../components/PaymentOrders';
import '../styles/corporate-design.css';
import '../styles/dashboard-header-corporate.css';
import '../styles/dashboardCards-compact.css';
import '../styles/dashboard-general-corporate.css';
import '../styles/payment-orders-corporate.css';
import '../styles/tables-dense.css';

export default function BuyerDashboard() {
  const [stats, setStats] = useState({
    activeTenders: 0,
    totalBids: 0,
    totalSavings: 0,
    bidVelocity: 0
  });
  const [recentTenders, setRecentTenders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPageTitle('Tableau de Bord Acheteur');
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const tenderRes = await procurementAPI.getMyTenders({ status: 'active' });
      const tenders = tenderRes.data.tenders || [];
      
      // Calcul des Statistiques
      let totalBids = 0;
      let totalBudget = 0;
      let totalSpent = 0;

      tenders.forEach(t => {
        totalBudget += t.budget_max || 0;
        totalSpent += t.budget_spent || 0;
      });

      const bidVelocity = tenders.length > 0 ? (totalBids / tenders.length).toFixed(1) : 0;
      const savings = totalBudget > 0 ? ((totalBudget - totalSpent) / totalBudget * 100).toFixed(2) : 0;

      setStats({
        activeTenders: tenders.length,
        totalBids: totalBids,
        totalSavings: savings,
        bidVelocity: bidVelocity
      });
      
      setRecentTenders(tenders.slice(0, 5));
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Chargement en cours...</div>;

  const getStatus = (savings) => {
    if (savings >= 20) return 'excellent';
    if (savings >= 10) return 'good';
    return 'normal';
  };

  // Cartes de résumé des services
  const summaryCards = [
    {
      icon: '📋',
      label: 'Appels d\'Offres',
      value: stats.activeTenders,
      subtitle: 'Appels actifs',
      status: 'active',
      type: 'metric'
    },
    {
      icon: '📊',
      label: 'Total Offres',
      value: stats.totalBids,
      subtitle: 'Offres reçues',
      status: 'active',
      type: 'metric'
    },
    {
      icon: '💰',
      label: 'Économies',
      value: `${stats.totalSavings}%`,
      subtitle: 'Du budget',
      progress: parseInt(stats.totalSavings) || 0,
      status: parseInt(stats.totalSavings) >= 15 ? 'active' : 'pending',
      type: 'metric'
    },
    {
      icon: '⚡',
      label: 'Vélocité',
      value: `${stats.bidVelocity}x`,
      subtitle: 'Offres/Appel',
      status: 'active',
      type: 'metric'
    }
  ];

  // Actions rapides pour acheteur
  const quickActions = [
    {
      icon: '➕',
      label: 'Créer Appel',
      priority: 'high',
      path: '/create-tender',
      description: 'Créer un nouvel appel d\'offres'
    },
    {
      icon: '📂',
      label: 'Voir Appels',
      path: '/tenders',
      description: 'Consulter tous les appels'
    },
    {
      icon: '📊',
      label: 'Analytiques',
      path: '/tender-analysis',
      description: 'Consulter l\'analyse des offres'
    },
    {
      icon: '👥',
      label: 'Mon Équipe',
      path: '/team-management',
      description: 'Gérer les membres de l\'équipe'
    }
  ];

  // Documents importants
  const importantDocs = [
    {
      icon: '📄',
      title: 'Factures en Attente',
      meta: '3 factures',
      priority: 'high',
      details: '3 factures en attente de validation pour appels en cours',
      action: { label: 'Consulter', path: '/invoices' }
    },
    {
      icon: '✅',
      title: 'Résultats Prêts',
      meta: '2 appels',
      priority: 'medium',
      details: '2 résultats de ترسية prêts à être téléchargés',
      action: { label: 'Télécharger', path: '/award-results' }
    },
    {
      icon: '🔄',
      title: 'Évaluations en Cours',
      meta: '5 appels',
      priority: 'normal',
      details: 'Suivi des évaluations en cours pour 5 appels d\'offres'
    }
  ];

  return (
    <div className="buyer-dashboard">
      {/* Professional Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Tableau de Bord Acheteur</h1>
          <p className="header-subtitle">Gérez vos appels d'offres et vos achats</p>
        </div>
        <div className="header-meta">
          <span className="meta-item">Appels Actifs: <strong>{stats.activeTenders}</strong></span>
          <span className="meta-item">Offres Reçues: <strong>{stats.totalBids}</strong></span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="dashboard-section">
        <h2>Vue d'ensemble</h2>
        <DashboardCards cards={summaryCards} />
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <h2>Actions Rapides</h2>
        <QuickActions actions={quickActions} />
      </div>

      {/* Important Documents */}
      <div className="dashboard-section">
        <ImportantDocuments documents={importantDocs} title="Documents Importants" />
      </div>

      {/* KPIs Grid - Legacy */}
      <div className="kpis-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <h3>Appels d'offres Actifs</h3>
            <span className="traffic-light green"></span>
          </div>
          <p className="kpi-value">{stats.activeTenders}</p>
          <p className="kpi-label">Appel d'offre en cours</p>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <h3>Total des Offres</h3>
            <span className="traffic-light blue"></span>
          </div>
          <p className="kpi-value">{stats.totalBids}</p>
          <p className="kpi-label">Offres reçues</p>
        </div>

        <div className={`kpi-card highlight status-${getStatus(stats.totalSavings)}`}>
          <div className="kpi-header">
            <h3>Économies Réalisées</h3>
            <span className={`traffic-light ${getStatus(stats.totalSavings)}`}></span>
          </div>
          <p className="kpi-value">{stats.totalSavings}%</p>
          <p className="kpi-label">du Budget</p>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <h3>Vélocité des Offres</h3>
            <span className="traffic-light orange"></span>
          </div>
          <p className="kpi-value">{stats.bidVelocity}</p>
          <p className="kpi-label">Offre/Appel</p>
        </div>
      </div>

      {/* Recent Tenders */}
      <div className="recent-section">
        <h2>Appels d'offres Récents</h2>
        {recentTenders.length === 0 ? (
          <p className="empty-state">Aucun appel d'offres actuellement</p>
        ) : (
          <div className="tenders-list">
            {recentTenders.map(tender => (
              <div key={tender.id} className="tender-item">
                <div className="tender-info">
                  <h3>{tender.title}</h3>
                  <p>Catégorie: {tender.category}</p>
                </div>
                <div className="tender-meta">
                  <span className={`status status-${tender.status}`}>{tender.status}</span>
                  <span className="amount">{tender.budget_max} {tender.currency}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Traffic Light Legend */}
      <div className="legend">
        <h3>Indicateurs de Statut</h3>
        <div className="legend-items">
          <div className="legend-item">
            <span className="traffic-light green"></span>
            <span>Excellent</span>
          </div>
          <div className="legend-item">
            <span className="traffic-light blue"></span>
            <span>Bon</span>
          </div>
          <div className="legend-item">
            <span className="traffic-light orange"></span>
            <span>Moyen</span>
          </div>
          <div className="legend-item">
            <span className="traffic-light red"></span>
            <span>Critique</span>
          </div>
        </div>
      </div>
    </div>
  );
}
