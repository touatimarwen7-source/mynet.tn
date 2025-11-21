import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToastContext } from '../contexts/ToastContext';
import { authAPI } from '../api';
import { setPageTitle } from '../utils/pageTitle';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addToast } = useToastContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPageTitle('Connexion Sécurisée');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login({ email, password });
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      addToast(t('messages.success'), 'success', 2000);
      navigate('/tenders');
    } catch (err) {
      addToast(t('messages.error'), 'error', 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page login-page">
      <div className="form-container">
        <h1>{t('auth.login')}</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('auth.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>{t('auth.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? t('form.loading') : t('auth.login')}
          </button>
        </form>
        <p>
          {t('auth.noAccount')} <a href="/register">{t('auth.register')}</a>
        </p>
      </div>
    </div>
  );
}
