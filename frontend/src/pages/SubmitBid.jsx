import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function SubmitBid() {
  const { tenderId } = useParams();
  const [tender, setTender] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [bidData, setBidData] = useState({
    supplierRefNumber: '',
    validityPeriodDays: 90,
    paymentTerms: 'Net30',
    attachments: [],
    lineItems: [],
    commitment: false
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTender();
  }, [tenderId]);

  useEffect(() => {
    if (!tender) return;
    
    const interval = setInterval(() => {
      const now = new Date();
      const deadline = new Date(tender.submissionDeadline);
      const diff = deadline - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeRemaining('انتهت صلاحية المناقصة');
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining(`${hours}س ${minutes}د ${seconds}ث`);
    }, 1000);

    return () => clearInterval(interval);
  }, [tender]);

  const fetchTender = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/procurement/tenders/${tenderId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setTender(response.data.tender);
      
      const initialItems = response.data.tender.items.map(item => ({
        ...item,
        supplierPrice: 0,
        totalPrice: 0,
        selectedFromCatalog: null,
        specifications: '',
        partialQuantity: null,
        isPartial: false
      }));
      setBidData(prev => ({ ...prev, lineItems: initialItems }));
    } catch (error) {
      console.error('خطأ:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCatalogProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/supplier/catalog', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setCatalogProducts(response.data.products || []);
    } catch (error) {
      console.error('خطأ في جلب الكتالوج:', error);
    }
  };

  const handleOpenCatalog = (itemIndex) => {
    setSelectedItemIndex(itemIndex);
    setShowCatalogModal(true);
    fetchCatalogProducts();
  };

  const handleSelectFromCatalog = (product) => {
    const newItems = [...bidData.lineItems];
    newItems[selectedItemIndex] = {
      ...newItems[selectedItemIndex],
      selectedFromCatalog: product,
      specifications: product.specifications || ''
    };
    setBidData(prev => ({ ...prev, lineItems: newItems }));
    setShowCatalogModal(false);
  };

  const handleLineItemChange = (index, field, value) => {
    const newItems = [...bidData.lineItems];
    newItems[index][field] = field === 'supplierPrice' ? parseFloat(value) : value;

    if (field === 'supplierPrice' || field === 'partialQuantity' || field === 'isPartial') {
      const item = newItems[index];
      const quantity = item.isPartial ? (item.partialQuantity || 0) : item.quantity;
      item.totalPrice = item.supplierPrice * quantity;
    }

    setBidData(prev => ({ ...prev, lineItems: newItems }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setBidData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBidData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateBid = () => {
    const newErrors = {};

    if (!bidData.supplierRefNumber) {
      newErrors.supplierRefNumber = 'رقم المرجع مطلوب';
    }

    const hasValidPrices = bidData.lineItems.every(item => item.supplierPrice > 0);
    if (!hasValidPrices) {
      newErrors.prices = 'يجب إدخال سعر لجميع البنود';
    }

    if (!bidData.commitment) {
      newErrors.commitment = 'يجب قبول الشروط';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitBid = async () => {
    if (isExpired) {
      alert('انتهت صلاحية المناقصة. لا يمكن إرسال العروض');
      return;
    }

    if (!validateBid()) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      setSubmitting(true);

      const submitData = {
        tenderId,
        supplierRefNumber: bidData.supplierRefNumber,
        validityPeriodDays: parseInt(bidData.validityPeriodDays),
        paymentTerms: bidData.paymentTerms,
        lineItems: bidData.lineItems.map(item => ({
          itemId: item.id,
          supplierPrice: item.supplierPrice,
          totalPrice: item.totalPrice,
          specifications: item.specifications,
          isPartial: item.isPartial,
          partialQuantity: item.partialQuantity,
          selectedProductId: item.selectedFromCatalog?.id
        })),
        totalBidValue: bidData.lineItems.reduce((sum, item) => sum + item.totalPrice, 0)
      };

      const response = await axios.post('http://localhost:5000/api/bids/submit', submitData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });

      alert('✓ تم تشفير وإرسال العرض بنجاح');
      window.location.href = '/my-bids';
    } catch (error) {
      if (error.response?.data?.expired) {
        alert('فشلت عملية الإرسال. المناقصة مغلقة منذ ' + error.response.data.closedAt);
      } else {
        alert('خطأ: ' + error.response?.data?.error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">جاري التحميل...</div>;

  const totalBidValue = bidData.lineItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  const timeWarning = timeRemaining.includes('انتهت') || timeRemaining.startsWith('0س');

  return (
    <div className="submit-bid-form">
      {/* شريط الأمان والحالة */}
      <div className={`security-status-bar ${timeWarning ? 'warning' : ''} ${isExpired ? 'expired' : ''}`}>
        <div className="status-item countdown">
          <span className="label">⏱️ الوقت المتبقي:</span>
          <span className="value">{timeRemaining}</span>
        </div>
        <div className="status-item encryption">
          <span className="label">🔒 حالة التشفير:</span>
          <span className="value">نشط</span>
        </div>
        <div className="status-item eligibility">
          <span className="label">✓ الأهلية:</span>
          <span className="value">مؤهل</span>
        </div>
      </div>

      <h1>📝 إرسال عرض على المناقصة: {tender.title}</h1>

      {/* قسم بيانات العرض الأساسية */}
      <section className="bid-section">
        <h2>بيانات العرض الأساسية</h2>

        <div className="form-group">
          <label>رقم مرجع المورد (اختياري)</label>
          <input
            type="text"
            name="supplierRefNumber"
            value={bidData.supplierRefNumber}
            onChange={handleInputChange}
            placeholder="رقمك الداخلي للتتبع"
          />
          {errors.supplierRefNumber && <span className="error">{errors.supplierRefNumber}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>فترة الصلاحية (بالأيام)</label>
            <input
              type="number"
              name="validityPeriodDays"
              value={bidData.validityPeriodDays}
              onChange={handleInputChange}
              min={tender.bidValidityDays || 30}
            />
            <small>الحد الأدنى: {tender.bidValidityDays || 30} يوم</small>
          </div>

          <div className="form-group">
            <label>شروط الدفع</label>
            <select
              name="paymentTerms"
              value={bidData.paymentTerms}
              onChange={handleInputChange}
            >
              <option value="Net30">Net 30 days</option>
              <option value="Net45">Net 45 days</option>
              <option value="Net60">Net 60 days</option>
              <option value="Advance">دفع مقدم</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>الوثائق المرفقة</label>
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
          />
          <small>PDF, DOCX, PNG (شهادات الجودة، المواصفات، إلخ)</small>
          {bidData.attachments.length > 0 && (
            <ul className="file-list">
              {bidData.attachments.map((f, i) => (
                <li key={i}>{f.name}</li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* قسم البنود */}
      <section className="bid-section">
        <h2>الرد على بنود المناقصة</h2>

        {errors.prices && <div className="alert alert-error">{errors.prices}</div>}

        <div className="items-table-wrapper">
          <table className="items-table">
            <thead>
              <tr>
                <th>#</th>
                <th>الوصف</th>
                <th>الكمية</th>
                <th>الوحدة</th>
                <th>الكتالوج</th>
                <th>السعر الوحدوي 🔒</th>
                <th>الإجمالي</th>
                <th>المواصفات التقنية</th>
                <th>عرض جزئي</th>
              </tr>
            </thead>
            <tbody>
              {bidData.lineItems.map((item, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td className="item-name">{item.name}</td>
                  <td>{item.isPartial ? item.partialQuantity : item.quantity}</td>
                  <td>{item.unit}</td>
                  <td>
                    <button
                      className="btn btn-catalog"
                      onClick={() => handleOpenCatalog(idx)}
                    >
                      📦 من الكتالوج
                    </button>
                    {item.selectedFromCatalog && (
                      <small className="selected">✓ محدد</small>
                    )}
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.supplierPrice}
                      onChange={(e) => handleLineItemChange(idx, 'supplierPrice', e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="price-input"
                    />
                  </td>
                  <td className="total-price">
                    {item.totalPrice.toFixed(2)} {tender.currency}
                  </td>
                  <td>
                    <textarea
                      value={item.specifications}
                      onChange={(e) => handleLineItemChange(idx, 'specifications', e.target.value)}
                      placeholder="شروط تقنية (ضمان، تسليم، إلخ)"
                      rows="2"
                    />
                  </td>
                  <td className="partial-bid">
                    <label>
                      <input
                        type="checkbox"
                        checked={item.isPartial}
                        onChange={(e) => handleLineItemChange(idx, 'isPartial', e.target.checked)}
                      />
                      جزئي
                    </label>
                    {item.isPartial && (
                      <input
                        type="number"
                        value={item.partialQuantity || ''}
                        onChange={(e) => handleLineItemChange(idx, 'partialQuantity', e.target.value)}
                        placeholder="الكمية"
                        min="1"
                        max={item.quantity}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* قسم المراجعة النهائية */}
      <section className="bid-section review-section">
        <h2>المراجعة النهائية</h2>

        <div className="bid-summary">
          <div className="summary-row">
            <span className="label">عدد البنود:</span>
            <span className="value">{bidData.lineItems.length}</span>
          </div>
          <div className="summary-row">
            <span className="label">إجمالي قيمة العرض:</span>
            <span className="value highlight">{totalBidValue.toFixed(2)} {tender.currency}</span>
          </div>
          <div className="summary-row">
            <span className="label">فترة الصلاحية:</span>
            <span className="value">{bidData.validityPeriodDays} يوم</span>
          </div>
          <div className="summary-row">
            <span className="label">شروط الدفع:</span>
            <span className="value">{bidData.paymentTerms}</span>
          </div>
        </div>

        <div className="commitment-checkbox">
          <label>
            <input
              type="checkbox"
              name="commitment"
              checked={bidData.commitment}
              onChange={handleInputChange}
            />
            <span>
              أؤكد أنني قرأت وفهمت جميع شروط المناقصة، وأن هذا العرض صحيح وساري للفترة المحددة.
            </span>
          </label>
          {errors.commitment && <span className="error">{errors.commitment}</span>}
        </div>

        <button
          className="btn btn-submit"
          onClick={handleSubmitBid}
          disabled={isExpired || submitting}
        >
          {submitting ? '⏳ جاري الإرسال...' : '🔒 تشفير وإرسال العرض الآن'}
        </button>

        {isExpired && (
          <div className="alert alert-error">
            ⚠️ انتهت صلاحية المناقصة. لا يمكن إرسال عروض جديدة.
          </div>
        )}
      </section>

      {/* نافذة الكتالوج المنبثقة */}
      {showCatalogModal && (
        <div className="modal-overlay" onClick={() => setShowCatalogModal(false)}>
          <div className="modal-content catalog-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>اختر من كتالوج المنتجات</h3>
              <button className="btn-close" onClick={() => setShowCatalogModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="products-grid">
                {catalogProducts.length === 0 ? (
                  <p>لا توجد منتجات في الكتالوج</p>
                ) : (
                  catalogProducts.map(product => (
                    <div key={product.id} className="product-card">
                      <h4>{product.name}</h4>
                      <p className="specs">{product.specifications}</p>
                      <p className="price">{product.price} {tender.currency}</p>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleSelectFromCatalog(product)}
                      >
                        اختر
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
