import { useEffect } from 'react';
import { setPageTitle } from '../utils/pageTitle';
import PublicNavbar from '../components/PublicNavbar';
import '../styles/aboutpage.css';

export default function AboutPage() {
  setPageTitle('À Propos');

  return (
    <>
      <PublicNavbar />
      <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="hero-content">
          <h1>À Propos de MyNet.tn</h1>
          <p className="hero-subtitle">Transforming Public Procurement in Tunisia</p>
        </div>
      </section>

      {/* Notre Histoire et Vision */}
      <section className="story-section">
        <div className="container">
          <h2>📖 Notre Histoire et Vision</h2>
          
          <div className="story-grid">
            <div className="story-card">
              <h3>Le Problème</h3>
              <p>
                En Tunisie, les marchés publics et les achats B2B étaient fragilisés par manque de transparence, 
                absence de normes uniformes et risques élevés de collusion. Les petites entreprises avaient du mal 
                à accéder aux appels d'offres, tandis que les acheteurs dépendaient de processus manuels inefficaces.
              </p>
              <div className="problem-icon">⚠️</div>
            </div>

            <div className="story-card">
              <h3>Notre Solution</h3>
              <p>
                MyNet.tn a été créée pour révolutionner l'écosystème d'approvisionnement en Tunisie. 
                Une plateforme numérique entièrement sécurisée, transparente et conforme aux standards internationaux. 
                Nous utilisons l'IA et la blockchain pour garantir l'intégrité, réduire la collusion et créer des 
                opportunités égales pour tous.
              </p>
              <div className="solution-icon">✨</div>
            </div>

            <div className="story-card">
              <h3>Notre Vision</h3>
              <p>
                Être la plateforme de référence du Moyen-Orient et de l'Afrique du Nord pour la gestion des 
                appels d'offres et les achats électroniques. Créer une économie plus transparente, efficace et 
                juste où chaque entreprise a accès aux mêmes opportunités et où l'intégrité est non-négociable.
              </p>
              <div className="vision-icon">🎯</div>
            </div>
          </div>

          <div className="key-values">
            <h3>Nos Valeurs Fondamentales</h3>
            <div className="values-grid">
              <div className="value-item">
                <span className="value-emoji">🔐</span>
                <h4>Sécurité</h4>
                <p>La confiance est notre priorité absolue</p>
              </div>
              <div className="value-item">
                <span className="value-emoji">👁️</span>
                <h4>Transparence</h4>
                <p>Zéro compromis sur la clarté des processus</p>
              </div>
              <div className="value-item">
                <span className="value-emoji">⚖️</span>
                <h4>Équité</h4>
                <p>Égalité des chances pour tous les participants</p>
              </div>
              <div className="value-item">
                <span className="value-emoji">🚀</span>
                <h4>Innovation</h4>
                <p>Technologie de pointe pour un avenir meilleur</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* L'Équipe Dirigeante */}
      <section className="team-section">
        <div className="container">
          <h2>👥 L'Équipe Dirigeante</h2>
          <p className="section-intro">Rencontrez les leaders visionnaires derrière MyNet.tn</p>

          <div className="team-grid">
            <div className="team-member">
              <div className="member-photo">👨‍💼</div>
              <h3>Mohamed Dhaoui</h3>
              <p className="role">Fondateur & Directeur Général</p>
              <p className="bio">
                Entrepreneur tunisien avec 15 ans d'expérience en technologies financières et marchés publics. 
                Diplômé de l'ENSI et certifié en cybersécurité par l'université de Stanford.
              </p>
              <div className="expertise">
                <strong>Expertise:</strong> Fintech, Procurements, Cybersécurité
              </div>
            </div>

            <div className="team-member">
              <div className="member-photo">👩‍💼</div>
              <h3>Fatima Ben Aouicha</h3>
              <p className="role">Directrice Technique & CTO</p>
              <p className="bio">
                Architecte système senior avec expertise en cloud computing et microservices. 
                Ancienne lead engineer chez une startup fintech basée à Dubaï.
              </p>
              <div className="expertise">
                <strong>Expertise:</strong> Cloud, AI, Blockchain
              </div>
            </div>

            <div className="team-member">
              <div className="member-photo">👨‍💼</div>
              <h3>Karim Belhadj</h3>
              <p className="role">Directeur Conformité & Risques</p>
              <p className="bio">
                Expert en conformité réglementaire et gouvernance. Consultant senior ayant travaillé 
                avec les régulateurs financiers tunisiens pendant 10 ans.
              </p>
              <div className="expertise">
                <strong>Expertise:</strong> Conformité, Gouvernance, Audit
              </div>
            </div>

            <div className="team-member">
              <div className="member-photo">👩‍💼</div>
              <h3>Souad Trabelsi</h3>
              <p className="role">Directrice Expérience Utilisateur</p>
              <p className="bio">
                Spécialiste en design et UX/UI avec portfolio international. Passionnée par créer 
                des interfaces intuitives qui changent la vie des utilisateurs.
              </p>
              <div className="expertise">
                <strong>Expertise:</strong> Design, UX/UI, Product Management
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conformité et Sécurité */}
      <section className="compliance-section">
        <div className="container">
          <h2>🛡️ Conformité et Sécurité</h2>
          
          <div className="compliance-grid">
            <div className="compliance-card">
              <h3>🔒 Chiffrement des Données</h3>
              <div className="detail">
                <p><strong>Standard:</strong> AES-256-GCM</p>
                <p className="description">
                  Chiffrement militaire de grade entreprise pour tous les offres et données sensibles. 
                  Impossible à déchiffrer même avec les ordinateurs les plus puissants.
                </p>
              </div>
            </div>

            <div className="compliance-card">
              <h3>🔐 Authentification</h3>
              <div className="detail">
                <p><strong>Standard:</strong> JWT + 2FA/MFA</p>
                <p className="description">
                  Authentification multi-facteurs avec jetons JWT sécurisés. Support TOTP et codes de secours 
                  pour une protection maximale contre les accès non autorisés.
                </p>
              </div>
            </div>

            <div className="compliance-card">
              <h3>📊 Hash Sécurisé</h3>
              <div className="detail">
                <p><strong>Standard:</strong> PBKDF2 + Salt Unique</p>
                <p className="description">
                  Hachage des mots de passe avec algorithme PBKDF2 et salts uniques. 10,000 itérations 
                  minimum pour résister aux attaques par force brute.
                </p>
              </div>
            </div>

            <div className="compliance-card">
              <h3>🌍 Conformité Légale</h3>
              <div className="detail">
                <p><strong>Standard:</strong> ISO 27001 & RGPD</p>
                <p className="description">
                  Certification ISO 27001 pour la gestion de la sécurité de l'information. 
                  Conformité totale au RGPD européen et aux régulations tunisiennes.
                </p>
              </div>
            </div>

            <div className="compliance-card">
              <h3>📋 Audit Trail Complet</h3>
              <div className="detail">
                <p><strong>Standard:</strong> Logging Immuable</p>
                <p className="description">
                  Journal d'audit complet et immuable de toutes les transactions. Conservation pendant 7 ans 
                  pour conformité légale et traçabilité complète.
                </p>
              </div>
            </div>

            <div className="compliance-card">
              <h3>🔄 Infra Sécurisée</h3>
              <div className="detail">
                <p><strong>Standard:</strong> Neon PostgreSQL</p>
                <p className="description">
                  Infrastructure managée sur serveurs sécurisés avec sauvegardes automatiques, 
                  récupération de sinistre, et disponibilité 99.9%.
                </p>
              </div>
            </div>
          </div>

          <div className="security-details">
            <h3>Infrastructure de Sécurité Détaillée</h3>
            <div className="security-layers">
              <div className="layer">
                <strong>Couche 1: Réseau</strong>
                <ul>
                  <li>🌐 HTTPS/TLS 1.3 obligatoire</li>
                  <li>🔥 Firewall applicatif (WAF)</li>
                  <li>🚨 Protection DDoS avancée</li>
                  <li>📡 Rate limiting par IP</li>
                </ul>
              </div>

              <div className="layer">
                <strong>Couche 2: Application</strong>
                <ul>
                  <li>✔️ Validation d'input stricte</li>
                  <li>🛡️ Protection XSS/CSRF</li>
                  <li>🔒 SQL injection prevention</li>
                  <li>🎯 Sanitisation des données</li>
                </ul>
              </div>

              <div className="layer">
                <strong>Couche 3: Données</strong>
                <ul>
                  <li>🔐 AES-256 encryption at rest</li>
                  <li>🔑 Key management centralisé</li>
                  <li>📦 Data masking automatique</li>
                  <li>🗂️ Archivage sécurisé 7 ans</li>
                </ul>
              </div>

              <div className="layer">
                <strong>Couche 4: Accès</strong>
                <ul>
                  <li>👤 RBAC granulaire</li>
                  <li>🔔 Alertes d'accès anormal</li>
                  <li>📱 MFA obligatoire admin</li>
                  <li>📊 Monitoring 24/7</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partenaires et Accréditations */}
      <section className="partners-section">
        <div className="container">
          <h2>🤝 Partenaires et Accréditations</h2>
          
          <div className="accreditations-grid">
            <div className="accreditation-card">
              <div className="cert-icon">🏛️</div>
              <h3>Ministère du Commerce</h3>
              <p className="cert-detail">Partenariat officiel pour les appels d'offres gouvernementaux</p>
              <p className="status">✓ Accrédité</p>
            </div>

            <div className="accreditation-card">
              <div className="cert-icon">📊</div>
              <h3>Banque Centrale de Tunisie</h3>
              <p className="cert-detail">Supervision des standards de sécurité financière</p>
              <p className="status">✓ Conformité Certifiée</p>
            </div>

            <div className="accreditation-card">
              <div className="cert-icon">🔐</div>
              <h3>ISO 27001 Certified</h3>
              <p className="cert-detail">Gestion de la sécurité de l'information</p>
              <p className="status">✓ Valide jusqu'en 2026</p>
            </div>

            <div className="accreditation-card">
              <div className="cert-icon">⚖️</div>
              <h3>RGPD Compliant</h3>
              <p className="cert-detail">Protection des données personnelles</p>
              <p className="status">✓ Conforme</p>
            </div>

            <div className="accreditation-card">
              <div className="cert-icon">🌐</div>
              <h3>TIA (Agence Tunisienne d'Internet)</h3>
              <p className="cert-detail">Partenaire technologique pour infrastructure numérique</p>
              <p className="status">✓ Accrédité</p>
            </div>

            <div className="accreditation-card">
              <div className="cert-icon">🏢</div>
              <h3>CONECT (Confédération)</h3>
              <p className="cert-detail">Support des PME pour adoption des technologies digitales</p>
              <p className="status">✓ Partenaire Officiel</p>
            </div>
          </div>

          <div className="strategic-partners">
            <h3>Partenaires Stratégiques</h3>
            <p className="partners-intro">MyNet.tn collabore avec les leaders mondiaux en technologie et sécurité:</p>
            
            <div className="partners-list">
              <div className="partner">
                <span className="partner-name">🚀 AWS (Amazon Web Services)</span>
                <span className="partner-role">Infrastructure Cloud & Hosting</span>
              </div>
              <div className="partner">
                <span className="partner-name">🔐 Cloudflare</span>
                <span className="partner-role">CDN Global & Protection DDoS</span>
              </div>
              <div className="partner">
                <span className="partner-name">🗄️ Neon</span>
                <span className="partner-role">Database Managée PostgreSQL</span>
              </div>
              <div className="partner">
                <span className="partner-name">📧 SendGrid</span>
                <span className="partner-role">Email Service Deliverability</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-banner">
        <div className="container">
          <div className="stat-box">
            <div className="stat-number">99.99%</div>
            <div className="stat-text">Disponibilité Garantie</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">0ms</div>
            <div className="stat-text">Latence Crypto</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">24/7</div>
            <div className="stat-text">Support Dédié</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">7 ans</div>
            <div className="stat-text">Rétention Données</div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-cta">
        <div className="container">
          <h2>Des Questions sur la Sécurité ou la Conformité?</h2>
          <p>Notre équipe de conformité est disponible pour discuter de vos besoins spécifiques</p>
          <button className="cta-button">📧 Contacter l'Équipe Compliance</button>
        </div>
      </section>
    </div>
    </>
  );
}
