import { useEffect } from 'react';
import { setPageTitle } from '../utils/pageTitle';
import PublicNavbar from '../components/PublicNavbar';
import '../styles/pricingpage.css';

export default function PricingPage() {
  setPageTitle('Tarification et Forfaits');

  const tiers = [
    {
      name: 'Silver',
      price: 99,
      period: 'mois',
      description: 'Idéal pour les PME et jeunes entreprises',
      color: '#C0C0C0',
      features: [
        { name: 'Utilisateurs', value: 5, admin: false },
        { name: 'Appels d\'offres/mois', value: 20, admin: false },
        { name: 'Espace de stockage', value: '50 GB', admin: false },
        { name: 'Support email', value: 'Inclus', admin: false },
        { name: 'API Access', value: 'Non', admin: true },
        { name: 'Intégration ERP', value: 'Non', admin: true },
        { name: 'Analyse IA', value: 'Non', admin: true },
        { name: 'Attribution Partielle', value: 'Non', admin: true },
        { name: 'Analytics Avancés', value: 'Non', admin: true },
        { name: 'SLA 99%', value: 'Non', admin: true },
      ],
      cta: 'Commencer',
      highlighted: false,
    },
    {
      name: 'Gold',
      price: 299,
      period: 'mois',
      description: 'Parfait pour les entreprises en croissance',
      color: '#FFD700',
      features: [
        { name: 'Utilisateurs', value: 25, admin: false },
        { name: 'Appels d\'offres/mois', value: 'Illimité', admin: false },
        { name: 'Espace de stockage', value: '500 GB', admin: false },
        { name: 'Support email + chat', value: 'Inclus', admin: false },
        { name: 'API Access', value: 'Oui', admin: true },
        { name: 'Intégration ERP', value: 'Oui', admin: true },
        { name: 'Analyse IA', value: 'Oui', admin: true },
        { name: 'Attribution Partielle', value: 'Oui', admin: true },
        { name: 'Analytics Avancés', value: 'Oui', admin: true },
        { name: 'SLA 99.9%', value: 'Oui', admin: true },
      ],
      cta: 'Choisir Gold',
      highlighted: true,
    },
    {
      name: 'Platinum',
      price: 'Custom',
      period: 'personnalisé',
      description: 'Pour les grandes organisations et gouvernement',
      color: '#E5E4E2',
      features: [
        { name: 'Utilisateurs', value: 'Illimité', admin: false },
        { name: 'Appels d\'offres/mois', value: 'Illimité', admin: false },
        { name: 'Espace de stockage', value: 'Illimité', admin: false },
        { name: 'Support prioritaire 24/7', value: 'Inclus', admin: false },
        { name: 'API Access', value: 'Complet', admin: true },
        { name: 'Intégration ERP', value: 'Complète', admin: true },
        { name: 'Analyse IA avancée', value: 'Oui', admin: true },
        { name: 'Attribution Partielle', value: 'Avancée', admin: true },
        { name: 'Analytics Prédictifs', value: 'Oui', admin: true },
        { name: 'SLA 99.99%', value: 'Oui', admin: true },
      ],
      cta: 'Contacter Sales',
      highlighted: false,
    },
  ];

  return (
    <>
      <PublicNavbar />
      <div className="pricing-page">
      {/* Hero Section */}
      <section className="pricing-hero">
        <h1>Tarification Transparente et Flexible</h1>
        <p className="hero-subtitle">Choisissez le forfait qui convient à votre entreprise</p>
      </section>

      {/* Pricing Cards */}
      <section className="pricing-section">
        <div className="container">
          <div className="pricing-grid">
            {tiers.map((tier, idx) => (
              <div key={idx} className={`pricing-card ${tier.highlighted ? 'highlighted' : ''}`}>
                <div className="card-header">
                  <div className="tier-name">{tier.name}</div>
                  <div className="tier-description">{tier.description}</div>
                </div>

                <div className="price-section">
                  {typeof tier.price === 'number' ? (
                    <>
                      <span className="price-amount">{tier.price} TND</span>
                      <span className="price-period">/ {tier.period}</span>
                    </>
                  ) : (
                    <span className="price-custom">{tier.price}</span>
                  )}
                </div>

                <button className={`cta-btn ${tier.highlighted ? 'primary' : 'secondary'}`}>
                  {tier.cta}
                </button>

                <div className="features-section">
                  <h4>Inclus:</h4>
                  <ul className="features-list">
                    {tier.features.map((feature, fidx) => (
                      <li key={fidx} className={feature.admin ? 'admin-controlled' : ''}>
                        <span className="feature-check">
                          {tier.features[fidx].value !== 'Non' ? '✓' : '✗'}
                        </span>
                        <span className="feature-name">{feature.name}:</span>
                        <span className="feature-value">{feature.value}</span>
                        {feature.admin && <span className="admin-badge">Admin</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="comparison-section">
        <div className="container">
          <h2>Tableau Comparatif Détaillé</h2>
          <p className="section-intro">Contrôles d'Administration Disponibles par Forfait</p>

          <div className="table-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Fonctionnalité</th>
                  <th>Silver</th>
                  <th>Gold</th>
                  <th>Platinum</th>
                  <th>Contrôle Admin</th>
                </tr>
              </thead>
              <tbody>
                {/* Core Features */}
                <tr className="section-header">
                  <td colSpan="5">🏢 Fonctionnalités de Base</td>
                </tr>
                <tr>
                  <td>Appels d'offres</td>
                  <td>20/mois</td>
                  <td>Illimité</td>
                  <td>Illimité</td>
                  <td>✓ Limite config</td>
                </tr>
                <tr>
                  <td>Équipe (Utilisateurs)</td>
                  <td>5</td>
                  <td>25</td>
                  <td>Illimité</td>
                  <td>✓ Gestion complète</td>
                </tr>
                <tr>
                  <td>Stockage</td>
                  <td>50 GB</td>
                  <td>500 GB</td>
                  <td>Illimité</td>
                  <td>✓ Limite ajustable</td>
                </tr>

                {/* Buyer Features */}
                <tr className="section-header">
                  <td colSpan="5">🏢 Fonctionnalités Acheteur</td>
                </tr>
                <tr>
                  <td>Création AO</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓ Activation/désactivation</td>
                </tr>
                <tr>
                  <td>Évaluation Offres</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓ Templates personnalisés</td>
                </tr>
                <tr>
                  <td>Analyse IA</td>
                  <td>✗</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓ Modèles sélectionnables</td>
                </tr>
                <tr>
                  <td>Attribution Partielle</td>
                  <td>✗</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓ Règles de partage</td>
                </tr>
                <tr>
                  <td>Gestion Équipe</td>
                  <td>✗</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓ Permissions RBAC</td>
                </tr>

                {/* Supplier Features */}
                <tr className="section-header">
                  <td colSpan="5">🏭 Fonctionnalités Fournisseur</td>
                </tr>
                <tr>
                  <td>Parcourir AO</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓ Filtres disponibles</td>
                </tr>
                <tr>
                  <td>Soumettre Offres</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓ Limits par forfait</td>
                </tr>
                <tr>
                  <td>Gestion Catalogue</td>
                  <td>Basique (50 produits)</td>
                  <td>Avancée (500 produits)</td>
                  <td>Complète (illimité)</td>
                  <td>✓ Limite modifiable</td>
                </tr>
                <tr>
                  <td>Alertes Intelligentes</td>
                  <td>✗</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓ Critères personnalisés</td>
                </tr>

                {/* Integration & API */}
                <tr className="section-header">
                  <td colSpan="5">🔗 Intégrations et API</td>
                </tr>
                <tr>
                  <td>API REST Access</td>
                  <td>✗</td>
                  <td>✓ (Limité)</td>
                  <td>✓ (Complet)</td>
                  <td>✓ Quotas ajustables</td>
                </tr>
                <tr>
                  <td>Webhooks</td>
                  <td>✗</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓ Activation événements</td>
                </tr>
                <tr>
                  <td>Intégration ERP</td>
                  <td>✗</td>
                  <td>✓ (Basique)</td>
                  <td>✓ (Complète)</td>
                  <td>✓ ERP selectionnables</td>
                </tr>

                {/* Security & Compliance */}
                <tr className="section-header">
                  <td colSpan="5">🛡️ Sécurité et Conformité</td>
                </tr>
                <tr>
                  <td>Chiffrement AES-256</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✗ Toujours activé</td>
                </tr>
                <tr>
                  <td>Authentification 2FA</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓ Obligatoire config</td>
                </tr>
                <tr>
                  <td>Audit Trail Complet</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓ Rétention config</td>
                </tr>
                <tr>
                  <td>SLA Disponibilité</td>
                  <td>99%</td>
                  <td>99.9%</td>
                  <td>99.99%</td>
                  <td>✗ Par forfait</td>
                </tr>

                {/* Support */}
                <tr className="section-header">
                  <td colSpan="5">📞 Support et Services</td>
                </tr>
                <tr>
                  <td>Support</td>
                  <td>Email</td>
                  <td>Email + Chat</td>
                  <td>Prioritaire 24/7</td>
                  <td>✓ Canaux selectionnables</td>
                </tr>
                <tr>
                  <td>Onboarding</td>
                  <td>Documentation</td>
                  <td>✓ Guidé</td>
                  <td>✓ Personnel</td>
                  <td>✓ Type d'assistance</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="admin-controls-info">
            <h3>ℹ️ À Propos des Contrôles d'Administration</h3>
            <p>
              Les administrateurs MyNet.tn peuvent configurer certaines limites et fonctionnalités 
              par forfait pour adapter la plateforme à leurs besoins spécifiques. Les fonctionnalités 
              marquées avec "✓ Contrôle Admin" peuvent être ajustées via le panel d'administration.
            </p>
            <div className="admin-examples">
              <h4>Exemples de Contrôles Disponibles:</h4>
              <ul>
                <li>🔧 Limites d'utilisateurs et de stockage par forfait</li>
                <li>🎯 Activation/Désactivation de fonctionnalités spécifiques</li>
                <li>🔐 Exigences de sécurité (2FA obligatoire, etc.)</li>
                <li>⚙️ Templates d'évaluation et critères personnalisés</li>
                <li>📊 Quotas API et limites de webhooks</li>
                <li>🔗 ERP et systèmes intégrés disponibles</li>
                <li>📝 Rétention des données et archivage</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="container">
          <h2>Questions Fréquemment Posées</h2>

          <div className="faq-grid">
            <div className="faq-item">
              <h4>Puis-je changer de forfait à tout moment?</h4>
              <p>Oui, vous pouvez upgrader ou downgrader votre forfait à tout moment. Les changements prennent effet immédiatement avec ajustement prorata.</p>
            </div>

            <div className="faq-item">
              <h4>Avez-vous des essais gratuits?</h4>
              <p>Oui! Accès gratuit pendant 30 jours pour tous les forfaits. Aucune carte bancaire requise pour commencer.</p>
            </div>

            <div className="faq-item">
              <h4>Quels sont les modes de paiement acceptés?</h4>
              <p>Nous acceptons les virements bancaires, cartes de crédit (Visa/Mastercard), e-wallets, et les contrats d'entreprise.</p>
            </div>

            <div className="faq-item">
              <h4>Existe-t-il des réductions pour les contrats annuels?</h4>
              <p>Oui! Réductions de 15% pour les paiements annuels et jusqu'à 25% pour les contrats pluriannuels.</p>
            </div>

            <div className="faq-item">
              <h4>Le forfait Platinum inclut-il la formation?</h4>
              <p>Oui, le forfait Platinum inclut onboarding personnel, formation d'équipe et support dédié 24/7.</p>
            </div>

            <div className="faq-item">
              <h4>Comment fonctionnent les contrôles d'administration?</h4>
              <p>Les admins peuvent activer/désactiver des fonctionnalités et ajuster les limites via le panel d'administration pour adapter la plateforme à leurs besoins.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pricing-cta">
        <div className="container">
          <h2>Prêt à Commencer?</h2>
          <p>Choisissez votre forfait et lancez votre transformation numérique dès aujourd'hui</p>
          <a href="/register" className="cta-button-large">🚀 Créer un Compte →</a>
        </div>
      </section>
    </div>
    </>
  );
}
