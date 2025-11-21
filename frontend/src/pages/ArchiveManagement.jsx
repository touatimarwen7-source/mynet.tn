import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ArchiveManagement() {
  const [settings, setSettings] = useState({
    documentArchivePeriodDays: 90,
    requireMFAForChanges: true
  });
  const [archiveJobs, setArchiveJobs] = useState([]);
  const [mfaVerified, setMfaVerified] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
    fetchArchiveJobs();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/archive-settings', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setSettings(response.data.settings);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchArchiveJobs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/archive-jobs', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setArchiveJobs(response.data.jobs || []);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleMFAVerify = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/mfa/verify-login',
        { code: mfaCode },
        { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
      );
      setMfaVerified(true);
      setMfaCode('');
      alert('تم التحقق من MFA بنجاح');
    } catch (error) {
      alert('خطأ: كود MFA غير صحيح');
    }
  };

  const handleSaveSettings = async () => {
    if (settings.requireMFAForChanges && !mfaVerified) {
      alert('يجب التحقق من MFA أولاً');
      return;
    }

    try {
      await axios.put('http://localhost:5000/api/admin/archive-settings', settings, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      alert('تم حفظ الإعدادات بنجاح');
    } catch (error) {
      alert('خطأ: ' + error.response?.data?.error);
    }
  };

  if (loading) return <div className="loading">Chargement en cours...</div>;

  return (
    <div className="archive-management">
      <h1>إدارة الأرشفة والبيانات</h1>

      {/* إعدادات الأرشفة */}
      <div className="settings-section">
        <h2>إعدادات الأرشفة</h2>

        <div className="form-group">
          <label>فترة الاحتفاظ بالوثائق (بالأيام):</label>
          <input 
            type="number" 
            value={settings.documentArchivePeriodDays}
            onChange={(e) => setSettings({...settings, documentArchivePeriodDays: parseInt(e.target.value)})}
            min="30"
            max="365"
          />
          <p className="help-text">الوثائق الأقدم من هذه الفترة سيتم أرشفتها تلقائياً</p>
        </div>

        <div className="form-group checkbox">
          <input 
            type="checkbox" 
            checked={settings.requireMFAForChanges}
            onChange={(e) => setSettings({...settings, requireMFAForChanges: e.target.checked})}
          />
          <label>مطلوب MFA عند تغيير الإعدادات</label>
        </div>

        {/* التحقق من MFA */}
        {settings.requireMFAForChanges && !mfaVerified && (
          <div className="mfa-verification">
            <h3>التحقق من MFA</h3>
            <div className="form-group">
              <label>أدخل كود MFA:</label>
              <input 
                type="text" 
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                placeholder="000000"
                maxLength="6"
              />
            </div>
            <button className="btn btn-primary" onClick={handleMFAVerify}>
              التحقق
            </button>
          </div>
        )}

        {mfaVerified && (
          <div className="mfa-verified">
            <p>✓ تم التحقق من MFA</p>
          </div>
        )}

        <button className="btn btn-success" onClick={handleSaveSettings}>
          حفظ الإعدادات
        </button>
      </div>

      {/* حالة عمليات الأرشفة */}
      <div className="archive-jobs-section">
        <h2>عمليات الأرشفة</h2>

        {archiveJobs.length === 0 ? (
          <p className="empty-state">لا توجد عمليات أرشفة</p>
        ) : (
          <div className="jobs-list">
            {archiveJobs.map((job, idx) => (
              <div key={idx} className={`job-card status-${job.status}`}>
                <div className="job-header">
                  <h3>{job.name}</h3>
                  <span className="status-badge">{job.status}</span>
                </div>
                <div className="job-info">
                  <p><strong>التاريخ:</strong> {new Date(job.created_at).toLocaleDateString('ar-TN')}</p>
                  <p><strong>Fichiers:</strong> {job.files_count}</p>
                  <p><strong>الحجم:</strong> {(job.size_mb).toFixed(2)} MB</p>
                </div>

                {job.error && (
                  <div className="error-message">
                    <strong>خطأ:</strong> {job.error}
                  </div>
                )}

                {job.status === 'in_progress' && (
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{width: `${job.progress}%`}}
                    ></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
