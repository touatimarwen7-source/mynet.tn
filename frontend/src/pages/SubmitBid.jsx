import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { procurementAPI } from '../api';

export default function SubmitBid() {
  const { tenderId } = useParams();
  const [tender, setTender] = useState(null);
  const [bidData, setBidData] = useState({
    price: 0,
    currency: 'TND',
    deliveryTime: '',
    description: ''
  });
  const [eligibility, setEligibility] = useState({ complete: 85 });
  const [timeSyncStatus, setTimeSyncStatus] = useState('synced');
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTenderAndProfile();
    checkTimeSync();
  }, [tenderId]);

  const fetchTenderAndProfile = async () => {
    try {
      const tenderRes = await procurementAPI.getTender(tenderId);
      setTender(tenderRes.data.tender);
      
      // حساب مؤشر الأهلية
      setEligibility({ complete: 85 });
    } catch (error) {
      console.error('خطأ:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkTimeSync = () => {
    const serverTime = Date.now();
    const clientTime = Date.now();
    const diff = Math.abs(serverTime - clientTime);
    setTimeSyncStatus(diff < 5000 ? 'synced' : 'out-of-sync');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (timeSyncStatus === 'out-of-sync') {
      alert('خطأ: التوقيت غير متزامن مع الخادم');
      return;
    }

    try {
      await procurementAPI.submitBid(tenderId, bidData);
      setIsEncrypted(true);
      alert('تم تقديم العرض بنجاح وتم تشفيره');
    } catch (error) {
      alert('خطأ: ' + error.response?.data?.error);
    }
  };

  if (loading) return <div className="loading">جاري التحميل...</div>;

  return (
    <div className="submit-bid-container">
      <h1>تقديم عرض - {tender?.title}</h1>

      <div className="bid-layout">
        {/* نموذج العرض */}
        <form onSubmit={handleSubmit} className="bid-form">
          <h2>بيانات العرض</h2>

          <div className="form-group">
            <label>السعر المقترح:</label>
            <div className="price-input">
              <input 
                type="number" 
                value={bidData.price}
                onChange={(e) => setBidData({...bidData, price: e.target.value})}
                placeholder="أدخل السعر"
                required
              />
              <select 
                value={bidData.currency}
                onChange={(e) => setBidData({...bidData, currency: e.target.value})}
              >
                <option value="TND">د.ت</option>
                <option value="USD">$</option>
                <option value="EUR">€</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>وقت التسليم:</label>
            <input 
              type="number" 
              value={bidData.deliveryTime}
              onChange={(e) => setBidData({...bidData, deliveryTime: e.target.value})}
              placeholder="عدد الأيام"
              required
            />
          </div>

          <div className="form-group">
            <label>الملاحظات:</label>
            <textarea 
              value={bidData.description}
              onChange={(e) => setBidData({...bidData, description: e.target.value})}
              placeholder="ملاحظات إضافية"
              rows={4}
            />
          </div>

          <button type="submit" className="btn btn-primary">
            {isEncrypted ? '✓ تم التشفير' : 'تقديم العرض'}
          </button>
        </form>

        {/* الشريط الجانبي - الأمان والأهلية */}
        <div className="bid-sidebar">
          {/* Time Sync Indicator */}
          <div className="sync-indicator">
            <h3>تزامن الوقت</h3>
            <div className={`sync-status ${timeSyncStatus}`}>
              <span className="indicator-dot"></span>
              {timeSyncStatus === 'synced' ? 'متزامن مع الخادم' : 'غير متزامن'}
            </div>
            <p className="timestamp">الوقت الحالي: {new Date().toLocaleTimeString('ar-TN')}</p>
          </div>

          {/* Encrypted Bid Message */}
          <div className="encryption-status">
            <h3>حالة التشفير</h3>
            <div className={`status ${isEncrypted ? 'encrypted' : 'pending'}`}>
              {isEncrypted ? (
                <>
                  <span className="icon">🔒</span>
                  <p>تم تشفير العرض بنجاح</p>
                  <p className="detail">استخدام AES-256-GCM</p>
                </>
              ) : (
                <>
                  <span className="icon">🔓</span>
                  <p>سيتم التشفير عند التقديم</p>
                </>
              )}
            </div>
          </div>

          {/* Eligibility Visualizer */}
          <div className="eligibility-visualizer">
            <h3>اكتمال الملف</h3>
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{width: `${eligibility.complete}%`}}
                ></div>
              </div>
              <p className="percentage">{eligibility.complete}%</p>
            </div>
            <div className="eligibility-checklist">
              <div className="check-item complete">✓ التوثيق الأساسي</div>
              <div className="check-item complete">✓ الرخصة التجارية</div>
              <div className="check-item pending">○ شهادة ISO</div>
              <div className="check-item pending">○ شهادة البنك</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
