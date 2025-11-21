import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setPageTitle } from '../utils/pageTitle';

import DynamicAdvertisement from '../components/DynamicAdvertisement';
import HowItWorks from '../components/HowItWorks';
import LeadGenerationForm from '../components/LeadGenerationForm';
import HeroSearch from '../components/HeroSearch';
import '../styles/hero-section-search-only.css';
import '../styles/homepage.css';

export default function HomePage() {
  setPageTitle('Accueil');
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);

  const handleStartTrial = (role) => {
    setSelectedRole(role);
    setTimeout(() => navigate(`/register?role=${role}`), 300);
  };

  const handleFreeTrialClick = () => {
    navigate('/register?role=buyer');
  };

  const handleLearnMoreClick = () => {
    navigate('/about');
  };

  return (
    <>
      
      <div className="homepage">
      {/* Hero Section - Search Only */}
      <section className="hero-section-search">
        <HeroSearch />
      </section>

      {/* Dynamic Advertisement Section */}
      <DynamicAdvertisement />

      {/* Rôles Section */}
      <section className="roles-section">
        <h2>Choisissez Votre Rôle</h2>
        <p className="section-subtitle">Deux expériences optimisées, une plateforme unifiée</p>

        <div className="roles-grid">
          {/* Acheteur Card */}
          <div className={`role-card role-buyer ${selectedRole === 'buyer' ? 'selected' : ''}`}>
            <h3>Je suis Acheteur</h3>
            <p className="role-description">
              Publiez vos appels d'offres, recevez les meilleures propositions, évaluez les fournisseurs et finalisez vos contrats en toute confiance.
            </p>
            <ul className="role-features">
              <li>Créer des appels d'offres</li>
              <li>Gérer les soumissions</li>
              <li>Analyser les offres</li>
              <li>Émettre des bons de commande</li>
              <li>Gérer l'équipe d'achat</li>
            </ul>
            <button 
              className="role-button"
              onClick={() => handleStartTrial('buyer')}
            >
              Commencer Essai Gratuit
            </button>
          </div>

          {/* Fournisseur Card */}
          <div className={`role-card role-supplier ${selectedRole === 'supplier' ? 'selected' : ''}`}>
            <h3>Je suis Fournisseur</h3>
            <p className="role-description">
              Découvrez les opportunités de marché, soumettez vos offres compétitives, et développez votre activité avec des clients de confiance.
            </p>
            <ul className="role-features">
              <li>Parcourir les appels d'offres</li>
              <li>Soumettre des offres</li>
              <li>Gérer votre catalogue</li>
              <li>Suivre les évaluations</li>
              <li>Recevoir les commandes</li>
            </ul>
            <button 
              className="role-button"
              onClick={() => handleStartTrial('supplier')}
            >
              Commencer Essai Gratuit
            </button>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="social-proof-section">
        <h2>Faites Confiance à MyNet.tn</h2>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">50M+</div>
            <div className="stat-label">Dinars en Transactions</div>
            <p className="stat-description">Montants d'appels d'offres traités</p>
          </div>

          <div className="stat-card">
            <div className="stat-number">1,200+</div>
            <div className="stat-label">Organisations Actives</div>
            <p className="stat-description">Acheteurs et fournisseurs inscrits</p>
          </div>

          <div className="stat-card">
            <div className="stat-number">15,000+</div>
            <div className="stat-label">Appels d'Offres</div>
            <p className="stat-description">Publiés et gérés avec succès</p>
          </div>

          <div className="stat-card">
            <div className="stat-number">99.9%</div>
            <div className="stat-label">Disponibilité</div>
            <p className="stat-description">Infrastructure hautement sécurisée</p>
          </div>
        </div>

        <div className="testimonials">
          <h3>Ce que Disent nos Utilisateurs</h3>
          <div className="testimonial-cards">
            <div className="testimonial-card">
              <p className="testimonial-text">
                "MyNet.tn a révolutionné notre processus d'achat. Plus de transparence, moins de papiers, et une meilleure gestion des fournisseurs."
              </p>
              <p className="testimonial-author">— Directeur des Achats, Entreprise Manufacturière</p>
            </div>

            <div className="testimonial-card">
              <p className="testimonial-text">
                "Accès à plus d'opportunités commerciales. La plateforme est facile à utiliser et les outils d'offres sont complets."
              </p>
              <p className="testimonial-author">— Responsable Commercial, PME de Fournitures</p>
            </div>

            <div className="testimonial-card">
              <p className="testimonial-text">
                "La sécurité et la conformité des données sont au cœur de MyNet.tn. Nous recommandons vivement cette plateforme."
              </p>
              <p className="testimonial-author">— Directeur Financier, Grande Entreprise</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Pourquoi Choisir MyNet.tn?</h2>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h4>Sécurité Entreprise</h4>
            <p>Chiffrement AES-256, authentification 2FA, et audit complet de toutes les transactions</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h4>Performant</h4>
            <p>Infrastructure cloud scalable avec 99.9% d'uptime et latence ultra-faible</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h4>Support Premium</h4>
            <p>Équipe d'experts disponible 24/7 pour vous accompagner dans votre succès</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h4>Analytics Avancées</h4>
            <p>Tableaux de bord détaillés, rapports en temps réel, et insights prédictifs</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🌍</div>
            <h4>Multi-Devises</h4>
            <p>Support complet des dinars tunisiens, euros et autres devises principales</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h4>Mobile Ready</h4>
            <p>Interface responsive optimisée pour tous les appareils et tous les navigateurs</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <HowItWorks />

      {/* Lead Generation Section */}
      <LeadGenerationForm />

      {/* CTA Section */}
      <section className="final-cta-section">
        <div className="cta-container">
          <h2>Prêt à Transformer Votre Processus d'Achat?</h2>
          <p>Rejoignez plus de 1,200 organisations qui font confiance à MyNet.tn</p>
          
          <div className="cta-buttons">
            <button className="btn btn-primary-large" onClick={() => navigate('/register')}>
              🚀 Demander une Démonstration
            </button>
            <button className="btn btn-secondary-large" onClick={() => navigate('/login')}>
              Déjà Inscrit? Se Connecter →
            </button>
          </div>

          <p className="cta-footer">
            Pas de carte bancaire requise • Accès gratuit pendant 30 jours • Support dédié inclus
          </p>
        </div>
      </section>
    </div>
    </>
  );
}
