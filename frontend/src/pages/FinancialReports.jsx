import { useState, useEffect } from 'react';
import { setPageTitle } from '../utils/pageTitle';
import { formatDate } from '../utils/dateFormatter';
import '../styles/corporate-design.css';

export default function FinancialReports() {
  const [reports, setReports] = useState([]);
  const [reportType, setReportType] = useState('monthly');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPageTitle('Rapports Financiers');
  }, []);

  const generateReport = async () => {
    setLoading(true);
    try {
      // Mock data - in production this would call the backend
      const mockReports = [
        {
          id: 1,
          title: 'Rapport de Dépenses Mensuelles',
          type: 'monthly',
          period: 'Novembre 2025',
          date: new Date(),
          totalBudget: 50000,
          spent: 32500,
          percentage: 65,
          status: 'completed'
        },
        {
          id: 2,
          title: 'Analyse des Fournisseurs',
          type: 'supplier',
          period: 'Q4 2025',
          date: new Date(),
          topSupplier: 'ACME Corp',
          count: 45,
          status: 'completed'
        },
        {
          id: 3,
          title: 'Économies Réalisées',
          type: 'savings',
          period: 'Année 2025',
          date: new Date(),
          savings: 8750,
          percentage: 17.5,
          status: 'completed'
        }
      ];
      setReports(mockReports);
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateReport();
  }, [reportType]);

  return (
    <div className="page financial-reports-page">
      <div className="page-header corporate">
        <div className="header-content">
          <h1>📊 Rapports Financiers</h1>
          <p className="subtitle">Analysez vos dépenses et vos économies</p>
        </div>
      </div>

      <div className="filters-section corporate">
        <div className="filter-group">
          <label>Type de Rapport:</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="select-corporate"
          >
            <option value="monthly">Dépenses Mensuelles</option>
            <option value="quarterly">Rapport Trimestriel</option>
            <option value="annual">Rapport Annuel</option>
            <option value="supplier">Analyse des Fournisseurs</option>
            <option value="savings">Économies Réalisées</option>
            <option value="budget">Analyse Budgétaire</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Génération du rapport en cours...</div>
      ) : reports.length === 0 ? (
        <div className="empty-state corporate">
          <div className="empty-icon">📊</div>
          <h3>Aucun rapport disponible</h3>
          <p>Sélectionnez un type de rapport pour générer les données.</p>
        </div>
      ) : (
        <div className="reports-container">
          <div className="reports-grid">
            {reports.map((report) => (
              <div key={report.id} className="report-card corporate">
                <div className="report-header">
                  <h3>{report.title}</h3>
                  <span className="badge-success">{report.status === 'completed' ? '✓ Complété' : 'En cours'}</span>
                </div>

                <div className="report-content">
                  <div className="report-meta">
                    <div className="meta-item">
                      <label>Période:</label>
                      <span>{report.period}</span>
                    </div>
                    <div className="meta-item">
                      <label>Généré le:</label>
                      <span>{formatDate(report.date)}</span>
                    </div>
                  </div>

                  {report.type === 'monthly' && (
                    <div className="report-stats">
                      <div className="stat-box">
                        <label>Budget Total</label>
                        <span className="stat-value">{report.totalBudget?.toLocaleString()} TND</span>
                      </div>
                      <div className="stat-box">
                        <label>Dépensé</label>
                        <span className="stat-value">{report.spent?.toLocaleString()} TND</span>
                      </div>
                      <div className="stat-box">
                        <label>Pourcentage</label>
                        <span className={`stat-value ${report.percentage > 80 ? 'warning' : 'normal'}`}>
                          {report.percentage}%
                        </span>
                      </div>
                    </div>
                  )}

                  {report.type === 'supplier' && (
                    <div className="report-stats">
                      <div className="stat-box">
                        <label>Principal Fournisseur</label>
                        <span className="stat-value">{report.topSupplier}</span>
                      </div>
                      <div className="stat-box">
                        <label>Nombre de Transactions</label>
                        <span className="stat-value">{report.count}</span>
                      </div>
                    </div>
                  )}

                  {report.type === 'savings' && (
                    <div className="report-stats">
                      <div className="stat-box">
                        <label>Économies Réalisées</label>
                        <span className="stat-value success">{report.savings?.toLocaleString()} TND</span>
                      </div>
                      <div className="stat-box">
                        <label>Pourcentage d'Économie</label>
                        <span className="stat-value success">{report.percentage}%</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="report-actions">
                  <button className="btn btn-small btn-primary-corporate">📥 Télécharger</button>
                  <button className="btn btn-small btn-secondary-corporate">👁️ Aperçu</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
