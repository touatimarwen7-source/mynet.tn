import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../api';
import { setPageTitle } from '../utils/pageTitle';
import '../styles/register-custom.css';

export default function Register() {
  const [searchParams] = useSearchParams();
  const roleFromUrl = searchParams.get('role') || 'supplier';
  const navigate = useNavigate();

  useEffect(() => {
    setPageTitle('Inscription');
  }, []);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: roleFromUrl,
    company_name: '',
    company_registration: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      setError(err.response?.data?.error || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const getRoleContent = () => {
    if (formData.role === 'buyer') {
      return {
        icon: '🏢',
        title: 'Créer un Compte Acheteur',
        subtitle: 'Publiez vos appels d\'offres et trouvez les meilleurs fournisseurs',
        benefits: [
          '✓ Créer et gérer des appels d\'offres',
          '✓ Recevoir et analyser les offres',
          '✓ Utiliser l\'analyse IA pour décider',
          '✓ Gestion complète de l\'équipe d\'achat'
        ]
      };
    } else {
      return {
        icon: '🏭',
        title: 'Créer un Compte Fournisseur',
        subtitle: 'Découvrez les opportunités et remportez des marchés',
        benefits: [
          '✓ Parcourir les appels d\'offres',
          '✓ Soumettre vos offres sécurisées',
          '✓ Gérer votre catalogue de produits',
          '✓ Suivre votre performance et revenus'
        ]
      };
    }
  };

  const roleContent = getRoleContent();

  return (
    <div className="page register-page">
      <div className="form-container">
        <div className="role-header">
          <span className="role-icon">{roleContent.icon}</span>
          <h1>{roleContent.title}</h1>
        </div>
        <p className="subtitle">{roleContent.subtitle}</p>
        
        <div className="benefits-list">
          {roleContent.benefits.map((benefit, idx) => (
            <p key={idx} className="benefit-item">{benefit}</p>
          ))}
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nom d'utilisateur *</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Entrez votre nom d'utilisateur"
              required
            />
          </div>
          <div className="form-group">
            <label>E-mail *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Entrez votre adresse e-mail"
              required
            />
          </div>
          <div className="form-group">
            <label>Mot de passe *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Entrez un mot de passe sécurisé"
              required
            />
          </div>
          <div className="form-group">
            <label>Nom complet</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Entrez votre nom complet"
            />
          </div>
          <div className="form-group">
            <label>Numéro de téléphone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Entrez votre numéro de téléphone"
            />
          </div>
          <div className="form-group">
            <label>Rôle *</label>
            <select name="role" value={formData.role} onChange={handleChange} required>
              <option value="supplier">🏭 Fournisseur</option>
              <option value="buyer">🏢 Acheteur</option>
            </select>
          </div>
          <div className="form-group">
            <label>Nom de l'entreprise</label>
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              placeholder="Entrez le nom de votre entreprise"
            />
          </div>
          <div className="form-group">
            <label>Numéro d'enregistrement de l'entreprise</label>
            <input
              type="text"
              name="company_registration"
              value={formData.company_registration}
              onChange={handleChange}
              placeholder="Entrez le numéro d'enregistrement"
            />
          </div>
          <button className="btn btn-primary" disabled={loading} type="submit">
            {loading ? '⏳ Création en cours...' : `✨ Créer mon Compte ${roleContent.icon}`}
          </button>
        </form>

        <div className="auth-links">
          <p className="login-link">
            Vous avez déjà un compte? <a href="/login">🔐 Se connecter</a>
          </p>
          
          {formData.role !== 'buyer' && (
            <p className="role-switch">
              Vous êtes <strong>Acheteur</strong>? <a href="/register?role=buyer">Créer un compte Acheteur →</a>
            </p>
          )}
          
          {formData.role !== 'supplier' && (
            <p className="role-switch">
              Vous êtes <strong>Fournisseur</strong>? <a href="/register?role=supplier">Créer un compte Fournisseur →</a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
