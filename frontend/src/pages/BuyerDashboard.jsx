import { useState, useEffect } from 'react';
import { procurementAPI } from '../api';
import { setPageTitle } from '../utils/pageTitle';

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
      const tenderRes = await procurementAPI.getTenders({ status: 'active' });
      const tenders = tenderRes.data.tenders || [];
      
      // حساب الإحصائيات
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

  return (
    <div className="buyer-dashboard">
      <h1>Tableau de Bord - Acheteur</h1>

      {/* KPIs Grid */}
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
            <h3>إجمالي العروض</h3>
            <span className="traffic-light blue"></span>
          </div>
          <p className="kpi-value">{stats.totalBids}</p>
          <p className="kpi-label">عرض مستلم</p>
        </div>

        <div className={`kpi-card highlight status-${getStatus(stats.totalSavings)}`}>
          <div className="kpi-header">
            <h3>التوفير المحقق</h3>
            <span className={`traffic-light ${getStatus(stats.totalSavings)}`}></span>
          </div>
          <p className="kpi-value">{stats.totalSavings}%</p>
          <p className="kpi-label">من الميزانية</p>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <h3>سرعة تدفق العروض</h3>
            <span className="traffic-light orange"></span>
          </div>
          <p className="kpi-value">{stats.bidVelocity}</p>
          <p className="kpi-label">عرض/مناقصة</p>
        </div>
      </div>

      {/* Recent Tenders */}
      <div className="recent-section">
        <h2>Appels d'offres Récents</h2>
        {recentTenders.length === 0 ? (
          <p className="empty-state">لا توجد مناقصات حالياً</p>
        ) : (
          <div className="tenders-list">
            {recentTenders.map(tender => (
              <div key={tender.id} className="tender-item">
                <div className="tender-info">
                  <h3>{tender.title}</h3>
                  <p>الفئة: {tender.category}</p>
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
        <h3>مؤشرات الحالة</h3>
        <div className="legend-items">
          <div className="legend-item">
            <span className="traffic-light green"></span>
            <span>ممتاز</span>
          </div>
          <div className="legend-item">
            <span className="traffic-light blue"></span>
            <span>جيد</span>
          </div>
          <div className="legend-item">
            <span className="traffic-light orange"></span>
            <span>متوسط</span>
          </div>
          <div className="legend-item">
            <span className="traffic-light red"></span>
            <span>حرج</span>
          </div>
        </div>
      </div>
    </div>
  );
}
