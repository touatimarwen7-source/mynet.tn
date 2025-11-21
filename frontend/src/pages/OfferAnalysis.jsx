import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { procurementAPI } from '../api';

export default function OfferAnalysis() {
  const { tenderId } = useParams();
  const [offers, setOffers] = useState([]);
  const [tender, setTender] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [tenderId]);

  const fetchData = async () => {
    try {
      const tenderRes = await procurementAPI.getTender(tenderId);
      setTender(tenderRes.data.tender);
      const offersRes = await procurementAPI.getOffers(tenderId);
      setOffers(offersRes.data.offers || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Chargement en cours...</div>;

  // حساب الإحصائيات
  const prices = offers.map(o => o.total_amount || 0);
  const avgPrice = prices.length > 0 ? (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2) : 0;
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const savings = tender && minPrice > 0 ? ((tender.budget_max - minPrice) / tender.budget_max * 100).toFixed(2) : 0;

  return (
    <div className="offer-analysis-container">
      <h1>تحليل العروض - {tender?.title}</h1>

      {/* مصفوفة المقارنة */}
      <div className="comparison-section">
        <h2>مصفوفة المقارنة</h2>
        <table className="comparison-table">
          <thead>
            <tr>
              <th>المورد</th>
              <th>السعر المقترح</th>
              <th>وقت التسليم</th>
              <th>درجة الامتثال %</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            {offers.map(offer => (
              <tr key={offer.id} className={offer.status === 'approved' ? 'selected' : ''}>
                <td>{offer.supplier_name}</td>
                <td className={offer.total_amount === minPrice ? 'best' : ''}>
                  {offer.total_amount} {offer.currency}
                </td>
                <td>{offer.delivery_time}</td>
                <td>{offer.compliance_score || 85}%</td>
                <td>{offer.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* الإحصائيات السريعة */}
      <div className="statistics-grid">
        <div className="stat-card">
          <h3>أقل سعر</h3>
          <p className="value">{minPrice}</p>
        </div>
        <div className="stat-card">
          <h3>أعلى سعر</h3>
          <p className="value">{maxPrice}</p>
        </div>
        <div className="stat-card">
          <h3>متوسط السعر</h3>
          <p className="value">{avgPrice}</p>
        </div>
        <div className="stat-card highlight">
          <h3>التوفير المحقق</h3>
          <p className="value">{savings}%</p>
        </div>
      </div>

      {/* مخطط توزيع الأسعار */}
      <div className="chart-section">
        <h2>توزيع الأسعار</h2>
        <div className="price-distribution">
          {offers.map((offer, idx) => (
            <div key={idx} className="price-bar-container">
              <div 
                className="price-bar" 
                style={{width: `${(offer.total_amount / maxPrice * 100)}%`}}
              >
                {(offer.total_amount / maxPrice * 100).toFixed(0)}%
              </div>
              <span>{offer.supplier_name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* سجل التدقيق المصغر */}
      <div className="audit-section">
        <h2>سجل الإجراءات</h2>
        <div className="audit-mini">
          <p>✓ تم فتح الأظرفة في: {new Date(tender?.opening_date).toLocaleString('ar-TN')}</p>
          <p>✓ عدد العروض المستلمة: {offers.length}</p>
          <p>✓ آخر تحديث: {new Date().toLocaleString('ar-TN')}</p>
        </div>
      </div>
    </div>
  );
}
