import { useState, useEffect } from 'react';
import { procurementAPI } from '../api';

export default function SupplierSearch() {
  const [tenders, setTenders] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    budgetMin: 0,
    budgetMax: 1000000
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTenders();
    fetchRecommended();
  }, [filters]);

  const fetchTenders = async () => {
    try {
      const response = await procurementAPI.getTenders(filters);
      setTenders(response.data.tenders || []);
    } catch (error) {
      console.error('خطأ:', error);
    }
  };

  const fetchRecommended = async () => {
    try {
      const response = await procurementAPI.getTenders({ recommended: true });
      setRecommended(response.data.tenders || []);
    } catch (error) {
      console.error('خطأ:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const TenderCard = ({ tender, isRecommended }) => (
    <div className={`tender-card ${isRecommended ? 'recommended' : ''}`}>
      {isRecommended && <span className="badge-recommended">مقترح لك</span>}
      <h3>{tender.title}</h3>
      <div className="tender-info">
        <p><strong>الفئة:</strong> {tender.category}</p>
        <p><strong>الموقع:</strong> {tender.location}</p>
        <p><strong>الميزانية:</strong> {tender.budget_max} {tender.currency}</p>
        <p><strong>تاريخ الإغلاق:</strong> {new Date(tender.closing_date).toLocaleDateString('ar-TN')}</p>
      </div>
      <button className="btn-bid">عرض التفاصيل</button>
    </div>
  );

  if (loading) return <div className="loading">جاري التحميل...</div>;

  return (
    <div className="supplier-search">
      <h1>البحث عن المناقصات</h1>

      {/* المرشحات الذكية */}
      <div className="filters-panel">
        <div className="filter-group">
          <label>الفئة:</label>
          <select name="category" value={filters.category} onChange={handleFilterChange}>
            <option value="">جميع الفئات</option>
            <option value="supplies">إمدادات</option>
            <option value="services">خدمات</option>
            <option value="construction">بناء</option>
            <option value="technology">تكنولوجيا</option>
          </select>
        </div>

        <div className="filter-group">
          <label>الموقع:</label>
          <select name="location" value={filters.location} onChange={handleFilterChange}>
            <option value="">جميع المواقع</option>
            <option value="tunis">تونس</option>
            <option value="sfax">صفاقس</option>
            <option value="sousse">سوسة</option>
          </select>
        </div>

        <div className="filter-group">
          <label>الميزانية:</label>
          <input 
            type="number" 
            name="budgetMin" 
            placeholder="من" 
            value={filters.budgetMin}
            onChange={handleFilterChange}
          />
          <input 
            type="number" 
            name="budgetMax" 
            placeholder="إلى" 
            value={filters.budgetMax}
            onChange={handleFilterChange}
          />
        </div>
      </div>

      {/* المناقصات المقترحة */}
      {recommended.length > 0 && (
        <div className="recommended-section">
          <h2>مقترحة لك</h2>
          <div className="tenders-grid">
            {recommended.map(tender => (
              <TenderCard key={tender.id} tender={tender} isRecommended={true} />
            ))}
          </div>
        </div>
      )}

      {/* جميع المناقصات */}
      <div className="all-tenders-section">
        <h2>جميع المناقصات ({tenders.length})</h2>
        {tenders.length === 0 ? (
          <p className="empty-state">لم يتم العثور على مناقصات</p>
        ) : (
          <div className="tenders-grid">
            {tenders.map(tender => (
              <TenderCard key={tender.id} tender={tender} isRecommended={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
