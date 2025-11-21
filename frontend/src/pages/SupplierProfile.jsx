import { useState, useEffect } from 'react';
import axios from 'axios';

export default function SupplierProfile() {
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showPublicProfile, setShowPublicProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/supplier/profile', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setProfile(response.data.profile);
      setDocuments(response.data.documents || []);
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'ISO');

    try {
      await axios.post('http://localhost:5000/api/supplier/documents', formData, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('تم رفع الوثيقة بنجاح');
      fetchProfile();
    } catch (error) {
      alert('خطأ: ' + error.response?.data?.error);
    }
  };

  if (loading) return <div className="loading">Chargement en cours...</div>;

  return (
    <div className="supplier-profile">
      <h1>ملف التعريف</h1>

      <div className="profile-layout">
        {/* معلومات الشركة */}
        <div className="profile-section">
          <h2>بيانات الشركة</h2>
          {profile && (
            <div className="company-info">
              <div className="info-row">
                <label>اسم الشركة:</label>
                <p>{profile.company_name}</p>
              </div>
              <div className="info-row">
                <label>الرقم التجاري:</label>
                <p>{profile.commercial_number}</p>
              </div>
              <div className="info-row">
                <label>المقر:</label>
                <p>{profile.location}</p>
              </div>
              <div className="info-row">
                <label>الهاتف:</label>
                <p>{profile.phone}</p>
              </div>
            </div>
          )}
        </div>

        {/* مجالات الخبرة */}
        <div className="profile-section">
          <h2>مجالات الخبرة</h2>
          <div className="categories-tags">
            {categories.length === 0 ? (
              <p className="empty-state">لم تحدد مجالات خبرة بعد</p>
            ) : (
              categories.map((cat, idx) => (
                <span key={idx} className="tag">{cat}</span>
              ))
            )}
          </div>
        </div>

        {/* الوثائق والشهادات */}
        <div className="profile-section">
          <h2>الوثائق والشهادات</h2>
          
          <div className="document-upload">
            <label>رفع وثيقة جديدة:</label>
            <input 
              type="file" 
              onChange={handleDocumentUpload}
              accept=".pdf,.jpg,.jpeg,.png"
            />
          </div>

          <div className="documents-list">
            {documents.length === 0 ? (
              <p className="empty-state">لم تقم برفع أي وثائق بعد</p>
            ) : (
              documents.map((doc, idx) => (
                <div key={idx} className="document-item">
                  <div className="doc-info">
                    <h4>{doc.type}</h4>
                    <p>تاريخ الرفع: {new Date(doc.uploaded_at).toLocaleDateString('ar-TN')}</p>
                    <p>تاريخ الانتهاء: {new Date(doc.expiry_date).toLocaleDateString('ar-TN')}</p>
                  </div>
                  <div className={`expiry-status ${doc.days_left < 30 ? 'warning' : 'ok'}`}>
                    {doc.days_left < 30 ? `⚠️ ${doc.days_left} يوم متبقي` : '✓ صحيح'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* الملف العام */}
        <div className="profile-section">
          <h2>الملف العام</h2>
          <button 
            className="btn btn-primary"
            onClick={() => setShowPublicProfile(!showPublicProfile)}
          >
            {showPublicProfile ? 'إخفاء الملف العام' : 'عرض الملف العام'}
          </button>

          {showPublicProfile && (
            <div className="public-profile-preview">
              <h3>{profile?.company_name}</h3>
              <p><strong>الموقع:</strong> {profile?.location}</p>
              <p><strong>مجالات الخبرة:</strong> {categories.join(', ')}</p>
              <p><strong>التقييم:</strong> ⭐ {profile?.average_rating || 0}/5</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
