import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import { setPageTitle } from '../utils/pageTitle';

export default function Register() {
  useEffect(() => {
    setPageTitle('Inscription');
  }, []);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: 'supplier',
    company_name: '',
    company_registration: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authAPI.register(formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'خطأ في التسجيل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>إنشاء حساب جديد</h2>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>اسم المستخدم</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>البريد الإلكتروني</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>كلمة المرور</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>الاسم الكامل</label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>رقم الهاتف</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>الدور</label>
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="supplier">مورد</option>
            <option value="buyer">مشتري</option>
          </select>
        </div>
        <div className="form-group">
          <label>اسم الشركة</label>
          <input
            type="text"
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>رقم تسجيل الشركة</label>
          <input
            type="text"
            name="company_registration"
            value={formData.company_registration}
            onChange={handleChange}
          />
        </div>
        <button className="btn btn-primary" disabled={loading}>
          {loading ? 'Chargement en cours...' : 'إنشاء حساب'}
        </button>
      </form>
    </div>
  );
}
