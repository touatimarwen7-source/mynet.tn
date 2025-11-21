import { useNavigate } from 'react-router-dom';
import '../styles/quickActions.css';

export default function QuickActions({ actions }) {
  const navigate = useNavigate();

  const handleActionClick = (action) => {
    if (action.onClick) {
      action.onClick();
    } else if (action.path) {
      navigate(action.path);
    }
  };

  return (
    <div className="quick-actions-section">
      <h3 className="quick-actions-title">Actions Rapides</h3>
      <div className="quick-actions-grid">
        {actions.map((action, idx) => (
          <button
            key={idx}
            className={`quick-action-btn action-priority-${action.priority || 'normal'}`}
            onClick={() => handleActionClick(action)}
            title={action.description}
          >
            <span className="action-label">{action.label}</span>
            {action.badge && (
              <span className="action-badge">{action.badge}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
