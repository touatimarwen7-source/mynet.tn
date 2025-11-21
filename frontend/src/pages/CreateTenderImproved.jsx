import { useState, useEffect } from 'react';
import axios from 'axios';

export default function CreateTenderImproved() {
  const [step, setStep] = useState(1);
  const [tenderData, setTenderData] = useState({
    title: '',
    categories: [],
    summary: '',
    budgetMax: 0,
    currency: 'TND',
    documents: [],
    submissionDeadline: '',
    decryptionDate: '',
    questionsStartDate: '',
    questionsEndDate: '',
    bidValidityDays: 90,
    alertSystem: '48',
    items: [],
    weights: { price: 40, compliance: 30, delivery: 20, sustainability: 10 },
    requiredDocuments: [],
    minEligibility: [],
    geographicLocation: '',
    awardType: 'full',
    allowNegotiation: false
  });

  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [errors, setErrors] = useState({});
  const [documentFiles, setDocumentFiles] = useState([]);

  // Auto-Save tous les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      if (tenderData.title || tenderData.summary) saveDraft();
    }, 30000);
    return () => clearInterval(interval);
  }, [tenderData]);

  const saveDraft = async () => {
    try {
      setAutoSaveStatus('Sauvegarde en cours...');
      await axios.post('http://localhost:5000/api/procurement/tender-draft', tenderData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setAutoSaveStatus('✓ Sauvegardé automatiquement');
      setTimeout(() => setAutoSaveStatus(''), 3000);
    } catch (error) {
      setAutoSaveStatus('✗ Erreur lors de la sauvegarde');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTenderData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCategoryToggle = (category) => {
    setTenderData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleAddItem = () => {
    setTenderData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', quantity: 0, unit: 'Unit', specifications: '', unitPrice: 0 }]
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...tenderData.items];
    newItems[index][field] = value;
    setTenderData(prev => ({ ...prev, items: newItems }));
  };

  const handleWeightChange = (field, value) => {
    setTenderData(prev => ({
      ...prev,
      weights: { ...prev.weights, [field]: parseFloat(value) }
    }));
  };

  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    setDocumentFiles([...documentFiles, ...files]);
  };

  const validateStep = () => {
    const newErrors = {};
    
    if (step === 1) {
      if (!tenderData.title) newErrors.title = "Le titre est requis";
      if (tenderData.categories.length === 0) newErrors.categories = "Choisissez au moins une catégorie";
      if (!tenderData.summary) newErrors.summary = "Le résumé est requis";
    }

    if (step === 2) {
      if (!tenderData.submissionDeadline) newErrors.submissionDeadline = "La date d'expiration est requise";
      if (!tenderData.decryptionDate) newErrors.decryptionDate = "La date d'ouverture est requise";
      if (new Date(tenderData.decryptionDate) <= new Date(tenderData.submissionDeadline)) {
        newErrors.decryptionDate = "La date d'ouverture doit être après la date d'expiration";
      }
      if (!tenderData.questionsEndDate) newErrors.questionsEndDate = "La fin de la période de questions est requise";
    }

    if (step === 3) {
      if (tenderData.items.length === 0) newErrors.items = "Vous devez ajouter au moins un article";
    }

    if (step === 4) {
      if (!tenderData.geographicLocation) newErrors.geographicLocation = "Choisissez une localisation géographique";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep()) setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    try {
      await axios.post('http://localhost:5000/api/procurement/tenders', tenderData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      alert("Appel d'offres créé avec succès et alertes envoyées aux fournisseurs qualifiés");
      setTenderData({
        title: '', categories: [], summary: '', budgetMax: 0, currency: 'TND',
        documents: [], submissionDeadline: '', decryptionDate: '',
        questionsStartDate: '', questionsEndDate: '', bidValidityDays: 90,
        alertSystem: '48', items: [], weights: { price: 40, compliance: 30, delivery: 20, sustainability: 10 },
        requiredDocuments: [], minEligibility: [], geographicLocation: '',
        awardType: 'full', allowNegotiation: false
      });
      setStep(1);
    } catch (error) {
      alert('خطأ: ' + error.response?.data?.error);
    }
  };

  const categories = ['Fournitures', 'Services', 'Construction وتشييد', 'استشارات', 'صيانة'];
  const units = ['Unit', 'كجم', 'طن', 'ساعة', 'يوم', 'قطعة'];

  return (
    <div className="create-tender-professional">
      <h1>📑 إنشاء مناقصة احترافية</h1>

      {/* شريط التقدم */}
      <div className="progress-steps">
        {[1, 2, 3, 4, 5].map(s => (
          <div key={s} className={`step ${step >= s ? 'active' : ''} ${step === s ? 'current' : ''}`}>
            {s}. {['البيانات', 'الجدولة', 'البنود', 'الأهلية', 'المراجعة'][s - 1]}
          </div>
        ))}
      </div>

      {autoSaveStatus && (
        <div className={`auto-save-status ${autoSaveStatus.includes('✓') ? 'success' : 'error'}`}>
          {autoSaveStatus}
        </div>
      )}

      {/* الخطوة 1: البيانات الأساسية */}
      {step === 1 && (
        <div className="step-content">
          <h2>الخطوة 1: البيانات الأساسية والتصنيف</h2>

          <div className="form-group">
            <label>عنوان المناقصة *</label>
            <input
              type="text"
              name="title"
              value={tenderData.title}
              onChange={handleInputChange}
              placeholder="مثال: توريد خوادم سحابية Enterprise"
              maxLength="200"
            />
            {errors.title && <span className="error">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label>فئات المشتريات * (اختر واحدة أو أكثر)</label>
            <div className="checkbox-group">
              {categories.map(cat => (
                <label key={cat}>
                  <input
                    type="checkbox"
                    checked={tenderData.categories.includes(cat)}
                    onChange={() => handleCategoryToggle(cat)}
                  />
                  {cat}
                </label>
              ))}
            </div>
            {errors.categories && <span className="error">{errors.categories}</span>}
          </div>

          <div className="form-group">
            <label>ملخص المناقصة *</label>
            <textarea
              name="summary"
              value={tenderData.summary}
              onChange={handleInputChange}
              placeholder="وصف موجز لمتطلبات المشروع والنطاق"
              rows={4}
            />
            {errors.summary && <span className="error">{errors.summary}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Budget التقديرية (اختياري)</label>
              <input
                type="number"
                name="budgetMax"
                value={tenderData.budgetMax}
                onChange={handleInputChange}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>العملة</label>
              <select name="currency" value={tenderData.currency} onChange={handleInputChange}>
                <option value="TND">د.ت (Tunisي)</option>
                <option value="USD">$ (دولار أمريكي)</option>
                <option value="EUR">€ (يورو)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>الوثائق العامة (اختياري)</label>
            <input type="file" multiple onChange={handleDocumentUpload} />
            <p className="help-text">يدعم: PDF, DOCX, Excel</p>
            {documentFiles.length > 0 && (
              <ul className="file-list">
                {documentFiles.map((f, i) => (
                  <li key={i}>{f.name}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* الخطوة 2: الجدولة والتواريخ */}
      {step === 2 && (
        <div className="step-content">
          <h2>الخطوة 2: الجدولة والتواريخ الحرجة</h2>

          <div className="form-row">
            <div className="form-group">
              <label>Date d'Expiration (آخر موعد لتقديم العروض) *</label>
              <input
                type="datetime-local"
                name="submissionDeadline"
                value={tenderData.submissionDeadline}
                onChange={handleInputChange}
              />
              {errors.submissionDeadline && <span className="error">{errors.submissionDeadline}</span>}
            </div>

            <div className="form-group">
              <label>تاريخ الفتح (فك التشفير) *</label>
              <input
                type="datetime-local"
                name="decryptionDate"
                value={tenderData.decryptionDate}
                onChange={handleInputChange}
              />
              {errors.decryptionDate && <span className="error">{errors.decryptionDate}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>بداية فترة الاستفسارات *</label>
              <input
                type="datetime-local"
                name="questionsStartDate"
                value={tenderData.questionsStartDate}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>نهاية فترة الاستفسارات *</label>
              <input
                type="datetime-local"
                name="questionsEndDate"
                value={tenderData.questionsEndDate}
                onChange={handleInputChange}
              />
              {errors.questionsEndDate && <span className="error">{errors.questionsEndDate}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>فترة صلاحية العرض (بالأيام)</label>
              <input
                type="number"
                name="bidValidityDays"
                value={tenderData.bidValidityDays}
                onChange={handleInputChange}
                min="30"
                max="365"
              />
            </div>

            <div className="form-group">
              <label>Système de Notifications</label>
              <select name="alertSystem" value={tenderData.alertSystem} onChange={handleInputChange}>
                <option value="24">تنبيه قبل 24 ساعة</option>
                <option value="48">تنبيه قبل 48 ساعة</option>
                <option value="72">تنبيه قبل 72 ساعة</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* الخطوة 3: البنود والمواصفات */}
      {step === 3 && (
        <div className="step-content">
          <h2>الخطوة 3: متطلبات البنود الفنية والمالية</h2>

          <div className="items-section">
            {tenderData.items.map((item, idx) => (
              <div key={idx} className="item-card">
                <h3>البند {idx + 1}</h3>
                <div className="form-row">
                  <div className="form-group full">
                    <label>وصف البند/الاسم</label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                      placeholder="خادم Dell PowerEdge R650"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>الكمية المطلوبة</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      min="1"
                    />
                  </div>
                  <div className="form-group">
                    <label>وحدة القياس</label>
                    <select value={item.unit} onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}>
                      {units.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>السعر الوحدوي (اختياري)</label>
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>المواصفات التقنية</label>
                  <textarea
                    value={item.specifications}
                    onChange={(e) => handleItemChange(idx, 'specifications', e.target.value)}
                    placeholder="تفاصيل تقنية: CPU، Memory، Storage، الضمان، إلخ"
                    rows={3}
                  />
                </div>
              </div>
            ))}
          </div>

          <button className="btn btn-secondary" onClick={handleAddItem}>
            + إضافة بند جديد
          </button>
          {errors.items && <span className="error">{errors.items}</span>}

          <div className="weighting-section">
            <h3>Système de Pondération des Critères d'Évaluation</h3>
            <p>تحديد الأوزان (يجب أن تساوي 100%):</p>
            <div className="form-row">
              <div className="form-group">
                <label>السعر: {tenderData.weights.price}%</label>
                <input
                  type="number"
                  value={tenderData.weights.price}
                  onChange={(e) => handleWeightChange('price', e.target.value)}
                  min="0"
                  max="100"
                />
              </div>
              <div className="form-group">
                <label>الامتثال: {tenderData.weights.compliance}%</label>
                <input
                  type="number"
                  value={tenderData.weights.compliance}
                  onChange={(e) => handleWeightChange('compliance', e.target.value)}
                  min="0"
                  max="100"
                />
              </div>
              <div className="form-group">
                <label>التسليم: {tenderData.weights.delivery}%</label>
                <input
                  type="number"
                  value={tenderData.weights.delivery}
                  onChange={(e) => handleWeightChange('delivery', e.target.value)}
                  min="0"
                  max="100"
                />
              </div>
              <div className="form-group">
                <label>الاستدامة: {tenderData.weights.sustainability}%</label>
                <input
                  type="number"
                  value={tenderData.weights.sustainability}
                  onChange={(e) => handleWeightChange('sustainability', e.target.value)}
                  min="0"
                  max="100"
                />
              </div>
            </div>
            <p className="info">
              المجموع: {tenderData.weights.price + tenderData.weights.compliance + tenderData.weights.delivery + tenderData.weights.sustainability}%
            </p>
          </div>
        </div>
      )}

      {/* الخطوة 4: الأهلية والأمان */}
      {step === 4 && (
        <div className="step-content">
          <h2>الخطوة 4: شروط الأهلية والأمان</h2>

          <div className="form-group">
            <label>الحد الأدنى للأهلية (اختياري)</label>
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={tenderData.minEligibility.includes('registered')}
                  onChange={() => {
                    const updated = tenderData.minEligibility.includes('registered')
                      ? tenderData.minEligibility.filter(e => e !== 'registered')
                      : [...tenderData.minEligibility, 'registered'];
                    setTenderData(prev => ({ ...prev, minEligibility: updated }));
                  }}
                />
                المورد مسجل في النظام لمدة 6 أشهر على الأقل
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={tenderData.minEligibility.includes('certified')}
                  onChange={() => {
                    const updated = tenderData.minEligibility.includes('certified')
                      ? tenderData.minEligibility.filter(e => e !== 'certified')
                      : [...tenderData.minEligibility, 'certified'];
                    setTenderData(prev => ({ ...prev, minEligibility: updated }));
                  }}
                />
                يمتلك شهادات جودة معترف بها
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Localisation الجغرافي للخدمة *</label>
            <select name="geographicLocation" value={tenderData.geographicLocation} onChange={handleInputChange}>
              <option value="">اختر Localisation</option>
              <option value="tunisia">Tunis</option>
              <option value="regional">إقليمي (شمال أفريقيا)</option>
              <option value="international">دولي</option>
            </select>
            {errors.geographicLocation && <span className="error">{errors.geographicLocation}</span>}
          </div>

          <div className="form-group">
            <label>شروط الترسية</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="awardType"
                  value="full"
                  checked={tenderData.awardType === 'full'}
                  onChange={handleInputChange}
                />
                الترسية بالكامل لأفضل عرض (أقل سعر)
              </label>
              <label>
                <input
                  type="radio"
                  name="awardType"
                  value="partial"
                  checked={tenderData.awardType === 'partial'}
                  onChange={handleInputChange}
                />
                الترسية الجزئية حسب البنود والامتثال
              </label>
            </div>
          </div>

          <div className="form-group checkbox">
            <input
              type="checkbox"
              name="allowNegotiation"
              checked={tenderData.allowNegotiation}
              onChange={handleInputChange}
            />
            <label>السماح بإعادة التفاوض مع الموردين المؤهلين</label>
          </div>
        </div>
      )}

      {/* الخطوة 5: المراجعة والنشر */}
      {step === 5 && (
        <div className="step-content">
          <h2>الخطوة 5: المراجعة والنشر</h2>

          <div className="review-summary">
            <div className="review-section">
              <h3>📋 البيانات الأساسية</h3>
              <p><strong>العنوان:</strong> {tenderData.title}</p>
              <p><strong>الفئات:</strong> {tenderData.categories.join(', ')}</p>
              <p><strong>الملخص:</strong> {tenderData.summary}</p>
              <p><strong>Budget:</strong> {tenderData.budgetMax} {tenderData.currency}</p>
            </div>

            <div className="review-section">
              <h3>📅 الجدولة</h3>
              <p><strong>Date d'Expiration:</strong> {new Date(tenderData.submissionDeadline).toLocaleString('ar-TN')}</p>
              <p><strong>تاريخ الفتح:</strong> {new Date(tenderData.decryptionDate).toLocaleString('ar-TN')}</p>
              <p><strong>فترة الاستفسارات:</strong> من {new Date(tenderData.questionsStartDate).toLocaleDateString('fr-FR')} إلى {new Date(tenderData.questionsEndDate).toLocaleDateString('fr-FR')}</p>
              <p><strong>صلاحية العرض:</strong> {tenderData.bidValidityDays} يوم</p>
            </div>

            <div className="review-section">
              <h3>📦 البنود ({tenderData.items.length})</h3>
              <table className="items-review-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>الوصف</th>
                    <th>الكمية</th>
                    <th>الوحدة</th>
                  </tr>
                </thead>
                <tbody>
                  {tenderData.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>{item.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="review-section">
              <h3>⚖️ معايير التقييم</h3>
              <p>السعر: {tenderData.weights.price}% | الامتثال: {tenderData.weights.compliance}% | التسليم: {tenderData.weights.delivery}% | الاستدامة: {tenderData.weights.sustainability}%</p>
            </div>

            <div className="review-section">
              <h3>🛡️ الأهلية والأمان</h3>
              <p><strong>Localisation:</strong> {tenderData.geographicLocation}</p>
              <p><strong>نوع الترسية:</strong> {tenderData.awardType === 'full' ? 'ترسية كاملة' : 'ترسية جزئية'}</p>
              <p><strong>التفاوض:</strong> {tenderData.allowNegotiation ? 'مسموح' : 'غير مسموح'}</p>
            </div>

            <div className="alert alert-info">
              ✓ تم التحقق من اكتمال النموذج<br/>
              بعد النشر، سيتم إرسال التنبيهات الفوري للموردين المؤهلين
            </div>
          </div>
        </div>
      )}

      {/* أزرار التنقل */}
      <div className="step-buttons">
        <button
          className="btn btn-secondary"
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
        >
          ← السابق
        </button>

        {step < 5 ? (
          <button className="btn btn-primary" onClick={handleNextStep}>
            التالي →
          </button>
        ) : (
          <button className="btn btn-success" onClick={handleSubmit}>
            ✓ نشر المناقصة
          </button>
        )}
      </div>
    </div>
  );
}
