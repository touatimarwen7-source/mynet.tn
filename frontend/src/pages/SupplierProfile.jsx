import { useState, useEffect } from 'react';
import axios from 'axios';
import { setPageTitle } from '../utils/pageTitle';
import '../styles/profile-modern.css';

export default function SupplierProfile() {
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showPublicProfile, setShowPublicProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [stats, setStats] = useState({});
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    setPageTitle('Profil Professionnel');
    fetchProfile();
    fetchActivity();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/supplier/profile', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setProfile(response.data.profile);
      setEditData(response.data.profile);
      setDocuments(response.data.documents || []);
      setCategories(response.data.categories || []);
      setStats(response.data.stats || {});
    } catch (error) {
      setError('Erreur lors de la récupération du profil');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivity = async () => {
    try {
      const response = await axios.get('/api/supplier/activity', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setActivity(response.data.activity || []);
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'activité`);
    }
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'ISO');

    try {
      await axios.post('/api/supplier/documents', formData, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setSuccess('Document enregistré avec succès ✓');
      setTimeout(() => setSuccess(''), 3000);
      fetchProfile();
    } catch (error) {
      setError('Erreur: ' + error.response?.data?.error);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!confirm('Confirmez-vous la suppression de ce document?')) return;
    try {
      await axios.delete(`http://localhost:3000/api/supplier/documents/${docId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setSuccess('Document supprimé avec succès ✓');
      setTimeout(() => setSuccess(''), 3000);
      fetchProfile();
    } catch (error) {
      setError('Erreur: ' + error.response?.data?.error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await axios.put('/api/supplier/profile', editData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setProfile(editData);
      setEditing(false);
      setSuccess('Les modifications ont été enregistrées avec succès ✓');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Erreur: ' + error.response?.data?.error);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-skeleton" style={{ height: '400px', borderRadius: '12px' }}></div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header animate-slide-down">
        <h1 className="page-title">🏢 Profil Professionnel</h1>
        <p className="page-subtitle">Gérez vos données professionnelles, documents et domaines de spécialisation</p>
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

      {profile && (
        <div className="supplier-profile-layout">
          {/* Company Information Card */}
          <div className="profile-card animate-scale-in">
            <div className="profile-card-header">
              <div className="profile-avatar">🏢</div>
              <div className="profile-header-info">
                <h2 className="profile-name">{profile.company_name}</h2>
                <p className="profile-role">Fournisseur متخصصة</p>
              </div>
              {!editing && (
                <button 
                  className="btn btn-primary hover-lift"
                  onClick={() => setEditing(true)}
                  style={{ marginLeft: 'auto' }}
                >
                  ✏️ تعديل
                </button>
              )}
            </div>

            {editing ? (
              /* Edit Mode */
              <div className="profile-edit-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">اسم الشركة</label>
                    <input 
                      type="text" 
                      value={editData.company_name || ''} 
                      onChange={(e) => setEditData({...editData, company_name: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">الرقم التجاري</label>
                    <input 
                      type="text" 
                      value={editData.commercial_number || ''} 
                      onChange={(e) => setEditData({...editData, commercial_number: e.target.value})}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">الموقع</label>
                    <input 
                      type="text" 
                      value={editData.location || ''} 
                      onChange={(e) => setEditData({...editData, location: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">الهاتف</label>
                    <input 
                      type="tel" 
                      value={editData.phone || ''} 
                      onChange={(e) => setEditData({...editData, phone: e.target.value})}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button className="btn btn-secondary" onClick={() => setEditing(false)}>
                    ✕ إلغاء
                  </button>
                  <button className="btn btn-primary" onClick={handleSaveProfile}>
                    💾 حفظ
                  </button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div className="profile-info-grid">
                <div className="info-group">
                  <div className="info-item">
                    <label className="info-label">📍 الموقع</label>
                    <p className="info-value">{profile.location || '—'}</p>
                  </div>
                  <div className="info-item">
                    <label className="info-label">📱 الهاتف</label>
                    <p className="info-value">{profile.phone || '—'}</p>
                  </div>
                  <div className="info-item">
                    <label className="info-label">🔢 الرقم التجاري</label>
                    <p className="info-value">{profile.commercial_number || '—'}</p>
                  </div>
                </div>

                <div className="info-group">
                  <div className="info-item">
                    <label className="info-label">⭐ التقييم</label>
                    <p className="info-value">
                      <span className="rating-stars">{'⭐'.repeat(Math.round(profile.average_rating || 0))}</span>
                      {profile.average_rating || 0}/5
                    </p>
                  </div>
                  <div className="info-item">
                    <label className="info-label">📊 العروض</label>
                    <p className="info-value">{stats.submissions || 0}</p>
                  </div>
                  <div className="info-item">
                    <label className="info-label">✓ الPrix</label>
                    <p className="info-value">{stats.awards || 0}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Statistics Section */}
          <div className="profile-section animate-slide-up">
            <h3 className="section-title">📊 Statistiques Opérationnelles</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📄</div>
                <div className="stat-number">{stats.total_tenders || 0}</div>
                <div className="stat-label">المناقصات</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✓</div>
                <div className="stat-number">{stats.won_awards || 0}</div>
                <div className="stat-label">Prix Gagnés</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⭐</div>
                <div className="stat-number">{(profile.average_rating || 0).toFixed(1)}</div>
                <div className="stat-label">Évaluation Générale</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-number">{stats.review_count || 0}</div>
                <div className="stat-label">Nombre d'évaluations</div>
              </div>
            </div>
          </div>

          {/* Activity Section */}
          <div className="profile-section animate-slide-up">
            <h3 className="section-title">📋 Journal d'Activité</h3>
            {activity.length === 0 ? (
              <div className="empty-state">Aucune activité disponible pour le moment pour le moment</div>
            ) : (
              <div className="activity-timeline">
                {activity.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="activity-item">
                    <div className="activity-icon">
                      {item.type === 'bid' ? '📤' : item.type === 'award' ? '✓' : item.type === 'review' ? '⭐' : '🎯'}
                    </div>
                    <div className="activity-content">
                      <p className="activity-title">{item.description || item.type}</p>
                      <p className="activity-date">{new Date(item.created_at).toLocaleDateString('ar-TN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expertise Areas */}
          <div className="profile-section animate-slide-up">
            <h3 className="section-title">🎯 Domaines de Spécialisation</h3>
            <div className="categories-tags">
              {categories.length === 0 ? (
                <div className="empty-state">Aucun domaine actuellement défini</div>
              ) : (
                categories.map((cat, idx) => (
                  <span key={idx} className="badge badge-primary">{cat}</span>
                ))
              )}
            </div>
          </div>

          {/* Documents and Certificates */}
          <div className="profile-section animate-slide-up">
            <h3 className="section-title">📄 الوثائق والشهادات</h3>
            
            <div className="document-upload-area">
              <label className="upload-label">
                <input 
                  type="file" 
                  onChange={handleDocumentUpload}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="upload-input"
                />
                <span className="upload-button">📤 Télécharger un Document</span>
              </label>
              <p className="upload-help">PDF, JPG ou PNG • Maximum 10 MB</p>
            </div>

            {documents.length === 0 ? (
              <div className="empty-state">Aucun document actuellement disponible</div>
            ) : (
              <div className="documents-table-wrapper">
                <table className="documents-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Date de téléchargement</th>
                      <th>Expiration</th>
                      <th>Statut</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc, idx) => {
                      const daysLeft = doc.days_left || 0;
                      const isExpiringSoon = daysLeft < 30;
                      
                      return (
                        <tr key={idx} className={isExpiringSoon ? 'warning-row' : ''}>
                          <td><strong>{doc.type}</strong></td>
                          <td>{new Date(doc.uploaded_at).toLocaleDateString('ar-TN')}</td>
                          <td>{new Date(doc.expiry_date).toLocaleDateString('ar-TN')}</td>
                          <td>
                            {isExpiringSoon ? (
                              <span className="badge badge-warning">⚠️ {daysLeft} jours</span>
                            ) : (
                              <span className="badge badge-success">✓ Valide</span>
                            )}
                          </td>
                          <td>
                            <button 
                              className="btn btn-sm btn-outline"
                              onClick={() => handleDeleteDocument(doc.id)}
                              title="Supprimer"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Public Profile Preview */}
          <div className="profile-section animate-slide-up">
            <h3 className="section-title">🌐 Informations Visibles Publiquement</h3>
            <button 
              className="btn btn-outline"
              onClick={() => setShowPublicProfile(!showPublicProfile)}
            >
              {showPublicProfile ? '🔒 Masquer' : '👁️ Afficher les Données Publiques'}
            </button>

            {showPublicProfile && (
              <div className="public-profile-preview">
                <div className="preview-header">
                  <h4>{profile.company_name}</h4>
                  <p className="preview-location">📍 {profile.location}</p>
                </div>
                <div className="preview-content">
                  <p><strong>Domaines:</strong> {categories.join(', ') || '—'}</p>
                  <p><strong>التقييم:</strong> ⭐ {profile.average_rating || 0}/5</p>
                  <p><strong>Prix Gagnés:</strong> ✓ {stats.won_awards || 0}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
