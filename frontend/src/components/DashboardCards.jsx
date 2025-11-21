import '../styles/dashboardCards.css';

export default function DashboardCards({ cards }) {
  return (
    <div className="dashboard-cards-container">
      {cards.map((card, idx) => (
        <div key={idx} className={`dashboard-card card-type-${card.type}`}>
          <div className="card-header">
            <span className="card-label">{card.label}</span>
          </div>
          
          <div className="card-value">{card.value}</div>
          
          {card.subtitle && (
            <p className="card-subtitle">{card.subtitle}</p>
          )}
          
          {card.status && (
            <div className={`card-status status-${card.status}`}>
              <span className="status-dot"></span>
              <span className="status-text">
                {card.status === 'active' ? 'Actif' : 
                 card.status === 'pending' ? 'En attente' :
                 card.status === 'warning' ? 'Attention' :
                 card.status === 'error' ? 'Critique' : card.status}
              </span>
            </div>
          )}
          
          {card.progress !== undefined && (
            <div className="card-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${card.progress}%` }}></div>
              </div>
              <span className="progress-text">{card.progress}%</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
