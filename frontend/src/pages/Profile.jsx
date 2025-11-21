import { useState, useEffect } from 'react';
import { authAPI } from '../api';
import { setPageTitle } from '../utils/pageTitle';
import '../styles/profile-modern.css';

export default function Profile({ user }) {
  useEffect(() => {
    setPageTitle('Mon Profil');
  }, []);

  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [interests, setInterests] = useState([]);
  const [newInterest, setNewInterest] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [alertData, setAlertData] = useState({ type: 'tender', keyword: '' });
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    fetchProfile();
    fetchActivity();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await authAPI.getProfile();
      setProfile(response.data.user);
      setFormData(response.data.user);
      setInterests(response.data.user.interests || []);
      setAlerts(response.data.user.alerts || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivity = async () => {
    try {
      const response = await authAPI.getActivity?.();
      if (response?.data) {
        setActivity(response.data.activity || []);
      }
    } catch (err) {
      console.error('Erreur lors du chargement de l\'activité');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authAPI.updateProfile(formData);
      setProfile(response.data.user);
      setEditing(false);
      setSuccess('Profil mis à jour avec succès ✓');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest)) {
      setInterests([...interests, newInterest]);
      setNewInterest('');
    }
  };

  const removeInterest = (index) => {
    setInterests(interests.filter((_, i) => i !== index));
  };

  const addAlert = () => {
    if (alertData.keyword.trim()) {
      const newAlert = {
        id: Date.now(),
        ...alertData,
        created_at: new Date().toLocaleDateString('fr-FR')
      };
      setAlerts([...alerts, newAlert]);
      setAlertData({ type: 'tender', keyword: '' });
      setShowAlertForm(false);
    }
  };

  const removeAlert = (id) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-skeleton" style={{ height: '400px', borderRadius: '12px' }}></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="page-container">
        <div className="alert alert-danger">Profil non trouvé</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header animate-slide-down">
        <h1 className="page-title">Mon Profil</h1>
        <p className="page-subtitle">Gérez vos informations personnelles et professionnelles</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-danger animate-slide-up">
          <span>❌</span>
          <div>{error}</div>
        </div>
      )}
      {success && (
        <div className="alert alert-success animate-slide-up">
          <span>✓</span>
          <div>{success}</div>
        </div>
      )}

      <div className="profile-layout">
        {!editing ? (
          <>
            {/* Profile Card - Main Info */}
            <div className="profile-card animate-scale-in">
              <div className="profile-card-header">
                <div className="profile-avatar">
                  {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="profile-header-info">
                  <h2 className="profile-name">{profile.full_name || profile.username}</h2>
                  <p className="profile-role">{profile.role === 'buyer' ? '👤 Acheteur' : profile.role === 'supplier' ? '🏢 Fournisseur' : '⚙️ Administrateur'}</p>
                </div>
              </div>

              <div className="profile-info-grid">
                {/* Personal Information */}
                <div className="info-group">
                  <div className="info-item">
                    <label className="info-label">📧 Adresse Email</label>
                    <p className="info-value">{profile.email}</p>
                  </div>
                  <div className="info-item">
                    <label className="info-label">👤 Nom d'utilisateur</label>
                    <p className="info-value">{profile.username}</p>
                  </div>
                  <div className="info-item">
                    <label className="info-label">📱 Téléphone</label>
                    <p className="info-value">{profile.phone || '—'}</p>
                  </div>
                </div>

                {/* Company Information */}
                <div className="info-group">
                  <div className="info-item">
                    <label className="info-label">🏢 Entreprise</label>
                    <p className="info-value">{profile.company_name || '—'}</p>
                  </div>
                  <div className="info-item">
                    <label className="info-label">📜 Enregistrement</label>
                    <p className="info-value">{profile.company_registration || '—'}</p>
                  </div>
                  <div className="info-item">
                    <label className="info-label">✓ Vérification</label>
                    <div className="info-value">
                      {profile.is_verified ? (
                        <span className="badge badge-success">✓ Vérifié</span>
                      ) : (
                        <span className="badge badge-warning">⏳ En attente</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div className="info-group">
                  <div className="info-item">
                    <label className="info-label">📅 Créé le</label>
                    <p className="info-value">{new Date(profile.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div className="info-item">
                    <label className="info-label">🔄 Mis à jour</label>
                    <p className="info-value">{new Date(profile.updated_at || profile.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Section */}
            <div className="profile-section animate-slide-up">
              <h3 className="section-title">📊 نشاط الحساب</h3>
              {activity.length === 0 ? (
                <div className="empty-state">لا توجد أنشطة حالياً</div>
              ) : (
                <div className="activity-timeline">
                  {activity.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="activity-item">
                      <div className="activity-icon">
                        {item.type === 'login' ? '🔓' : item.type === 'update' ? '✏️' : item.type === 'tender' ? '📝' : '📌'}
                      </div>
                      <div className="activity-content">
                        <p className="activity-title">{item.description || item.type}</p>
                        <p className="activity-date">{new Date(item.created_at).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Interests Section */}
            <div className="profile-section animate-slide-up">
              <h3 className="section-title">❤️ الاهتمامات والتفضيلات</h3>
              <div className="interests-container">
                <div className="interests-list">
                  {interests.length === 0 ? (
                    <div className="empty-state">لم تضف أي اهتمامات حتى الآن</div>
                  ) : (
                    interests.map((interest, idx) => (
                      <div key={idx} className="interest-tag">
                        <span>{interest}</span>
                        <button 
                          className="remove-btn"
                          onClick={() => removeInterest(idx)}
                          title="حذف"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
                <div className="add-interest-form">
                  <input
                    type="text"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                    placeholder="أضف اهتماماً جديداً..."
                    className="form-input"
                  />
                  <button 
                    onClick={addInterest}
                    className="btn btn-primary btn-sm"
                  >
                    ➕ إضافة
                  </button>
                </div>
              </div>
            </div>

            {/* Search Tools Section */}
            <div className="profile-section animate-slide-up">
              <h3 className="section-title">🔍 أدوات البحث المتقدم</h3>
              <div className="tools-grid">
                <div className="tool-card">
                  <div className="tool-icon">📋</div>
                  <h4>بحث متقدم عن المناقصات</h4>
                  <p>ابحث عن المناقصات حسب الفئة والميزانية والموقع</p>
                  <button className="btn btn-outline btn-sm">استخدام</button>
                </div>
                <div className="tool-card">
                  <div className="tool-icon">🏢</div>
                  <h4>بحث عن الفرنيسة</h4>
                  <p>اعثر على الفرنيسة المتخصصة في مجالك</p>
                  <button className="btn btn-outline btn-sm">استخدام</button>
                </div>
                <div className="tool-card">
                  <div className="tool-icon">📊</div>
                  <h4>تحليل السوق</h4>
                  <p>احصل على تحليلات وإحصائيات السوق</p>
                  <button className="btn btn-outline btn-sm">استخدام</button>
                </div>
                <div className="tool-card">
                  <div className="tool-icon">⭐</div>
                  <h4>التوصيات</h4>
                  <p>احصل على توصيات مخصصة بناءً على تفضيلاتك</p>
                  <button className="btn btn-outline btn-sm">استخدام</button>
                </div>
              </div>
            </div>

            {/* Alerts Section */}
            <div className="profile-section animate-slide-up">
              <div className="alerts-header">
                <h3 className="section-title">🔔 نظام التنبهات</h3>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowAlertForm(!showAlertForm)}
                >
                  {showAlertForm ? '✕ إغلاق' : '➕ إضافة تنبيه'}
                </button>
              </div>

              {showAlertForm && (
                <div className="alert-form animate-slide-down">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">نوع التنبيه</label>
                      <select 
                        value={alertData.type}
                        onChange={(e) => setAlertData({...alertData, type: e.target.value})}
                        className="form-input"
                      >
                        <option value="tender">المناقصات</option>
                        <option value="award">الجوائز</option>
                        <option value="supplier">الفرنيسة الجدد</option>
                        <option value="market">تحديثات السوق</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">الكلمة المفتاحية</label>
                      <input
                        type="text"
                        value={alertData.keyword}
                        onChange={(e) => setAlertData({...alertData, keyword: e.target.value})}
                        placeholder="مثال: البناء، الإنشاءات..."
                        className="form-input"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={addAlert}
                    className="btn btn-primary"
                  >
                    حفظ التنبيه
                  </button>
                </div>
              )}

              <div className="alerts-list">
                {alerts.length === 0 ? (
                  <div className="empty-state">لا توجد تنبهات مفعلة</div>
                ) : (
                  alerts.map((alert) => (
                    <div key={alert.id} className="alert-item">
                      <div className="alert-content">
                        <p className="alert-type">
                          {alert.type === 'tender' ? '📝 المناقصات' : 
                           alert.type === 'award' ? '🏆 الجوائز' :
                           alert.type === 'supplier' ? '🏢 الفرنيسة' : '📊 السوق'}
                        </p>
                        <p className="alert-keyword">الكلمة: <strong>{alert.keyword}</strong></p>
                      </div>
                      <button 
                        className="btn btn-sm btn-outline"
                        onClick={() => removeAlert(alert.id)}
                        title="حذف"
                      >
                        🗑️
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Edit Button */}
            <div className="profile-actions">
              <button 
                className="btn btn-primary btn-lg hover-lift"
                onClick={() => setEditing(true)}
              >
                ✏️ تعديل الملف الشخصي
              </button>
            </div>
          </>
        ) : (
          /* Edit Form */
          <div className="profile-edit-form animate-scale-in">
            <h2 className="form-title">تعديل ملفك الشخصي</h2>
            
            <form onSubmit={handleSubmit} className="form-container">
              {/* Personal Information Section */}
              <div className="form-section">
                <h3 className="form-section-title">👤 المعلومات الشخصية</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">الاسم الكامل</label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name || ''}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="اسمك الكامل"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">الهاتف</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="+216 XX XXX XXX"
                    />
                  </div>
                </div>
              </div>

              {/* Company Information Section */}
              <div className="form-section">
                <h3 className="form-section-title">🏢 المعلومات المهنية</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">اسم الشركة</label>
                    <input
                      type="text"
                      name="company_name"
                      value={formData.company_name || ''}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="شركتك"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">رقم التسجيل</label>
                    <input
                      type="text"
                      name="company_registration"
                      value={formData.company_registration || ''}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="الرقم التجاري"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditing(false);
                    setFormData(profile);
                    setError('');
                  }}
                >
                  ✕ إلغاء
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? '⏳ جاري الحفظ...' : '💾 حفظ التعديلات'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
