import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { procurementAPI } from '../api';

export default function TenderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tender, setTender] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        setUser(tokenData);
      } catch (e) {
        console.error('خطأ في فك التوكن:', e);
      }
    }
  }, []);

  useEffect(() => {
    fetchTender();
  }, [id]);

  const fetchTender = async () => {
    setLoading(true);
    try {
      const tenderRes = await procurementAPI.getTender(id);
      setTender(tenderRes.data.tender);
      
      try {
        const offersRes = await procurementAPI.getOffers(id);
        setOffers(offersRes.data.offers || []);
      } catch (err) {
        // Offers might not be accessible
      }
    } catch (err) {
      setError(err.response?.data?.error || 'خطأ في تحميل المناقصة');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">جاري التحميل...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!tender) return <div className="alert alert-error">المناقصة غير موجودة</div>;

  return (
    <div>
      <button onClick={() => window.history.back()} className="btn btn-secondary">
        ← رجوع
      </button>

      <div className="card" style={{ marginTop: '1rem' }}>
        <h2>{tender.title}</h2>
        <span className={`badge badge-${tender.status}`}>{tender.status}</span>

        <div style={{ marginTop: '1.5rem', lineHeight: '1.8' }}>
          <p><strong>الوصف:</strong> {tender.description}</p>
          <p><strong>الفئة:</strong> {tender.category}</p>
          <p><strong>الميزانية:</strong> {tender.budget_min} - {tender.budget_max} {tender.currency}</p>
          <p><strong>آخر تعديل:</strong> {new Date(tender.updated_at).toLocaleDateString('ar-TN')}</p>
          
          {tender.deadline && (
            <p><strong>موعد الإغلاق:</strong> {new Date(tender.deadline).toLocaleDateString('ar-TN')}</p>
          )}
        </div>

        {tender.requirements && tender.requirements.length > 0 && (
          <div style={{ marginTop: '1.5rem' }}>
            <h3>المتطلبات</h3>
            <ul>
              {tender.requirements.map((req, idx) => (
                <li key={idx}>{req}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* زر المشاركة للمورد */}
      {user?.role === 'supplier' && (
        <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#f5f5f5', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '1rem' }}>هل تريد تقديم عرض على هذه المناقصة؟</h3>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>انقر على الزر أدناه لتقديم عرض آمن</p>
          <button 
            onClick={() => navigate(`/create-offer/${id}`)}
            className="btn btn-primary"
            style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
          >
            📝 المشاركة وتقديم عرض
          </button>
        </div>
      )}

      {offers.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3>العروض المقدمة</h3>
          <div className="tender-list">
            {offers.map(offer => (
              <div key={offer.id} className="card">
                <p><strong>المورد:</strong> {offer.full_name}</p>
                <p><strong>المبلغ:</strong> {offer.total_amount} {offer.currency}</p>
                <p><strong>وقت التسليم:</strong> {offer.delivery_time}</p>
                <p><strong>الحالة:</strong> {offer.status}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
