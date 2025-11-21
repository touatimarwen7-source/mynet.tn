import { useState, useEffect } from 'react';
import axios from 'axios';

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
    fetchTiers();
  }, []);

  const fetchTiers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/subscription-tiers', {
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
      await axios.post('http://localhost:5000/api/admin/subscription-tiers', newTier, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      alert('تم إنشاء الباقة بنجاح');
      setNewTier({ name: '', price: 0, description: '', max_users: 10, features: [] });
      setShowForm(false);
      fetchTiers();
    } catch (error) {
      alert('خطأ: ' + error.response?.data?.error);
    }
  };

  const handleDeleteTier = async (tierId) => {
    if (!confirm('هل تأكد من حذف هذه الباقة؟')) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/subscription-tiers/${tierId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      alert('تم حذف الباقة بنجاح');
      fetchTiers();
    } catch (error) {
      alert('خطأ: ' + error.response?.data?.error);
    }
  };

  if (loading) return <div className="loading">Chargement en cours...</div>;

  return (
    <div className="subscription-tiers">
      <h1>إدارة الباقات</h1>

      <button 
        className="btn btn-primary add-tier-btn"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? 'إلغاء' : '+ إضافة باقة جديدة'}
      </button>

      {showForm && (
        <form onSubmit={handleCreateTier} className="tier-form">
          <h2>إنشاء باقة جديدة</h2>

          <div className="form-group">
            <label>اسم الباقة:</label>
            <select 
              value={newTier.name}
              onChange={(e) => setNewTier({...newTier, name: e.target.value})}
              required
            >
              <option value="">اختر الباقة</option>
              <option value="Silver">Silver</option>
              <option value="Gold">Gold</option>
              <option value="Platinum">Platinum</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>السعر الشهري:</label>
              <input 
                type="number" 
                value={newTier.price}
                onChange={(e) => setNewTier({...newTier, price: parseFloat(e.target.value)})}
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label>أقصى عدد مستخدمين:</label>
              <input 
                type="number" 
                value={newTier.max_users}
                onChange={(e) => setNewTier({...newTier, max_users: parseInt(e.target.value)})}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>الوصف:</label>
            <textarea 
              value={newTier.description}
              onChange={(e) => setNewTier({...newTier, description: e.target.value})}
              rows={3}
            />
          </div>

          <button type="submit" className="btn btn-success">إنشاء الباقة</button>
        </form>
      )}

      {/* قائمة الباقات */}
      <div className="tiers-grid">
        {tiers.length === 0 ? (
          <p className="empty-state">لا توجد باقات</p>
        ) : (
          tiers.map(tier => (
            <div key={tier.id} className="tier-card">
              <h3>{tier.name}</h3>
              <p className="price">{tier.price} د.ت<span>/شهرياً</span></p>
              <p>{tier.description}</p>
              <div className="tier-details">
                <p>👥 حتى {tier.max_users} مستخدم</p>
                <ul className="features-list">
                  {tier.features.map((feature, idx) => (
                    <li key={idx}>✓ {feature}</li>
                  ))}
                </ul>
              </div>
              <button 
                className="btn-delete"
                onClick={() => handleDeleteTier(tier.id)}
              >
                حذف
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
