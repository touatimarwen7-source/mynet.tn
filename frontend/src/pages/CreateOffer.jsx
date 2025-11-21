import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { procurementAPI } from '../api';

export default function CreateOffer() {
  const { tenderId } = useParams();
  const navigate = useNavigate();
  const [tender, setTender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [offerData, setOfferData] = useState({
    total_amount: '',
    delivery_time: '',
    payment_terms: 'Net30',
    technical_proposal: '',
    financial_proposal: '',
    attachments: []
  });

  useEffect(() => {
    fetchTender();
  }, [tenderId]);

  const fetchTender = async () => {
    try {
      const response = await procurementAPI.getTender(tenderId);
      setTender(response.data.tender);
    } catch (err) {
      setError('خطأ في تحميل المناقصة');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOfferData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setOfferData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const removeAttachment = (index) => {
    setOfferData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!offerData.total_amount || !offerData.delivery_time) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('tender_id', tenderId);
      formData.append('total_amount', offerData.total_amount);
      formData.append('delivery_time', offerData.delivery_time);
      formData.append('payment_terms', offerData.payment_terms);
      formData.append('technical_proposal', offerData.technical_proposal);
      formData.append('financial_proposal', offerData.financial_proposal);

      offerData.attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file);
      });

      await procurementAPI.createOffer(formData);
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/my-offers');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'خطأ في إرسال العرض. يرجى المحاولة مرة أخرى');
      console.error('خطأ في إرسال العرض:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">جاري تحميل المناقصة...</div>;
  if (!tender) return <div className="alert alert-error">المناقصة غير موجودة</div>;

  return (
    <div>
      <button onClick={() => window.history.back()} className="btn btn-secondary">
        ← رجوع
      </button>

      <div className="card" style={{ marginTop: '1rem', maxWidth: '800px', margin: '1rem auto' }}>
        <h2>تقديم عرض آمن</h2>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          <strong>المناقصة:</strong> {tender.title}
        </p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && (
          <div className="alert alert-success">
            ✅ تم إرسال عرضك بنجاح! جاري التحويل إلى صفحة عروضي...
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* المبلغ المالي */}
          <div>
            <label htmlFor="total_amount">
              <strong>المبلغ المالي (مطلوب)</strong>
            </label>
            <input
              type="number"
              id="total_amount"
              name="total_amount"
              step="0.01"
              min="0"
              required
              value={offerData.total_amount}
              onChange={handleChange}
              placeholder="أدخل المبلغ الإجمالي للعرض"
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          {/* وقت التسليم */}
          <div>
            <label htmlFor="delivery_time">
              <strong>وقت التسليم (مطلوب)</strong>
            </label>
            <input
              type="text"
              id="delivery_time"
              name="delivery_time"
              required
              value={offerData.delivery_time}
              onChange={handleChange}
              placeholder="مثال: 30 يوم"
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          {/* شروط الدفع */}
          <div>
            <label htmlFor="payment_terms">
              <strong>شروط الدفع</strong>
            </label>
            <select
              id="payment_terms"
              name="payment_terms"
              value={offerData.payment_terms}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="Net30">Net 30</option>
              <option value="Net60">Net 60</option>
              <option value="PaymentInAdvance">الدفع المقدم</option>
              <option value="CashOnDelivery">الدفع عند الاستلام</option>
            </select>
          </div>

          {/* الاقتراح التقني */}
          <div>
            <label htmlFor="technical_proposal">
              <strong>الاقتراح التقني</strong>
            </label>
            <textarea
              id="technical_proposal"
              name="technical_proposal"
              rows="4"
              value={offerData.technical_proposal}
              onChange={handleChange}
              placeholder="اشرح كيف سوف تقدم الخدمة/المنتج وتفاصيلك التقنية..."
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', fontFamily: 'inherit' }}
            />
          </div>

          {/* الاقتراح المالي */}
          <div>
            <label htmlFor="financial_proposal">
              <strong>الاقتراح المالي التفصيلي</strong>
            </label>
            <textarea
              id="financial_proposal"
              name="financial_proposal"
              rows="4"
              value={offerData.financial_proposal}
              onChange={handleChange}
              placeholder="أدخل تفاصيل التكاليف والأسعار..."
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', fontFamily: 'inherit' }}
            />
          </div>

          {/* المرفقات */}
          <div>
            <label htmlFor="attachments">
              <strong>المرفقات (اختياري)</strong>
            </label>
            <input
              type="file"
              id="attachments"
              multiple
              onChange={handleFileUpload}
              style={{ marginTop: '0.5rem' }}
            />
            {offerData.attachments.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <p><strong>الملفات المرفوعة:</strong></p>
                <ul style={{ paddingRight: '1.5rem' }}>
                  {offerData.attachments.map((file, index) => (
                    <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span>{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="btn btn-small"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
                      >
                        حذف
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* تحذير أمان */}
          <div style={{ padding: '1rem', backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px', color: '#856404' }}>
            <strong>🔒 تنبيه أمان:</strong> سيتم تشفير عرضك وحفظه بشكل آمن. فقط المشتري يمكنه الاطلاع على تفاصيل عرضك المالية.
          </div>

          {/* زر الإرسال */}
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{
              padding: '0.75rem 2rem',
              fontSize: '1rem',
              opacity: submitting ? 0.6 : 1,
              cursor: submitting ? 'not-allowed' : 'pointer'
            }}
          >
            {submitting ? '⏳ جاري الإرسال...' : '✅ إرسال العرض بأمان'}
          </button>
        </form>
      </div>
    </div>
  );
}
