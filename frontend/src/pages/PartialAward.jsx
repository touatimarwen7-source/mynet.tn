import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { procurementAPI } from '../api';

export default function PartialAward() {
  const { tenderId } = useParams();
  const [tender, setTender] = useState(null);
  const [offers, setOffers] = useState([]);
  const [awards, setAwards] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTenderData();
  }, [tenderId]);

  const fetchTenderData = async () => {
    try {
      const tenderRes = await procurementAPI.getTender(tenderId);
      setTender(tenderRes.data.tender);
      
      const offersRes = await procurementAPI.getOffers(tenderId);
      setOffers(offersRes.data.offers || []);
    } catch (err) {
      setError(err.response?.data?.error || 'خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleAwardQuantity = (offerId, quantity) => {
    setAwards(prev => ({
      ...prev,
      [offerId]: parseInt(quantity) || 0
    }));
  };

  const validateAwards = () => {
    const totalAwarded = Object.values(awards).reduce((sum, val) => sum + val, 0);
    if (tender && totalAwarded > tender.budget_max) {
      setError(`إجمالي الكميات المترسية يتجاوز الميزانية المسموحة`);
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmitAwards = async () => {
    if (!validateAwards()) return;

    try {
      const awardData = Object.entries(awards)
        .filter(([_, qty]) => qty > 0)
        .map(([offerId, quantity]) => ({
          offer_id: offerId,
          awarded_quantity: quantity
        }));

      await procurementAPI.submitAwards(tenderId, awardData);
      alert('تم تقديم الترسية بنجاح');
    } catch (err) {
      setError(err.response?.data?.error || 'خطأ في تقديم الترسية');
    }
  };

  if (loading) return <div className="loading">جاري التحميل...</div>;
  if (!tender) return <div className="alert alert-error">لم يتم العثور على المناقصة</div>;

  return (
    <div className="partial-award-container">
      <h2>الترسية الجزئية - {tender.title}</h2>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="award-table-wrapper">
        <table className="award-table">
          <thead>
            <tr>
              <th>المورد</th>
              <th>السعر المقترح</th>
              <th>وقت التسليم</th>
              <th>الكمية المقررة</th>
              <th>الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {offers.map(offer => (
              <tr key={offer.id}>
                <td>{offer.supplier_name}</td>
                <td>{offer.total_amount} {offer.currency}</td>
                <td>{offer.delivery_time}</td>
                <td>
                  <input 
                    type="number" 
                    min="0"
                    value={awards[offer.id] || 0}
                    onChange={(e) => handleAwardQuantity(offer.id, e.target.value)}
                    className="quantity-input"
                  />
                </td>
                <td>
                  {((awards[offer.id] || 0) * (offer.total_amount || 0)).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="award-summary">
        <p><strong>إجمالي المبلغ المترسي:</strong> {Object.entries(awards).reduce((sum, [id, qty]) => {
          const offer = offers.find(o => o.id === parseInt(id));
          return sum + (qty * (offer?.total_amount || 0));
        }, 0).toFixed(2)}</p>
        <p><strong>الميزانية المتاحة:</strong> {tender.budget_max} {tender.currency}</p>
      </div>

      <button className="btn btn-primary" onClick={handleSubmitAwards}>
        تأكيد الترسية
      </button>
    </div>
  );
}
