import { useState, useEffect } from 'react';
import axios from 'axios';

export default function FeatureControl() {
  const [features, setFeatures] = useState([]);
  const [tierFeatures, setTierFeatures] = useState({});
  const [loading, setLoading] = useState(true);

  const allFeatures = [
    { id: 'extended_reports', name: 'تقارير التحليل الموسعة' },
    { id: 'erp_integration', name: 'تكامل ERP' },
    { id: 'api_access', name: 'الوصول إلى API' },
    { id: 'custom_workflows', name: 'سير العمل المخصص' },
    { id: 'advanced_analytics', name: 'التحليلات المتقدمة' },
    { id: 'team_collaboration', name: 'التعاون الفريقي' },
    { id: 'webhooks', name: 'Webhooks' },
    { id: 'sso', name: 'Single Sign-On' }
  ];

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/feature-control', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setFeatures(response.data.features || []);
      setTierFeatures(response.data.tierFeatures || {});
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeature = async (tierId, featureId, enabled) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/feature-control/${tierId}/${featureId}`,
        { enabled },
        { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
      );
      fetchFeatures();
    } catch (error) {
      alert('خطأ: ' + error.response?.data?.error);
    }
  };

  if (loading) return <div className="loading">Chargement en cours...</div>;

  return (
    <div className="feature-control">
      <h1>التحكم في الميزات</h1>

      <div className="features-table-wrapper">
        <table className="features-table">
          <thead>
            <tr>
              <th>الميزة</th>
              <th>Silver</th>
              <th>Gold</th>
              <th>Platinum</th>
            </tr>
          </thead>
          <tbody>
            {allFeatures.map(feature => (
              <tr key={feature.id}>
                <td>{feature.name}</td>
                {['Silver', 'Gold', 'Platinum'].map(tier => (
                  <td key={`${feature.id}-${tier}`}>
                    <input 
                      type="checkbox"
                      checked={tierFeatures[tier]?.[feature.id] || false}
                      onChange={(e) => handleToggleFeature(tier, feature.id, e.target.checked)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
