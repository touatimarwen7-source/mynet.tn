import { useState } from 'react';
import { setPageTitle } from '../utils/pageTitle';
import '../styles/contactpage.css';

export default function ContactPage() {
  setPageTitle('Contact et Support');
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', company: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <h1>📞 Contact et Support</h1>
        <p className="hero-subtitle">Nous sommes ici pour vous aider</p>
      </section>

      {/* Main Content */}
      <div className="container">
        <div className="contact-layout">
          {/* Left Column - Contact Info */}
          <aside className="contact-sidebar">
            {/* Company Info */}
            <div className="info-card">
              <h3>🏢 Siège Social</h3>
              <div className="info-item">
                <strong>MyNet.tn</strong>
                <p>Immeuble Tunisiana Business Center</p>
                <p>Rue des Entrepreneurs, La Marsa</p>
                <p>2070 Tunis, Tunisie</p>
              </div>
            </div>

            {/* Phone Numbers */}
            <div className="info-card">
              <h3>📱 Téléphone</h3>
              <div className="info-item">
                <p><strong>Support Technique:</strong></p>
                <a href="tel:+21671123456">+216 71 123 456</a>
                <p><strong>Support Commercial:</strong></p>
                <a href="tel:+21671123457">+216 71 123 457</a>
                <p><strong>Support Légal:</strong></p>
                <a href="tel:+21671123458">+216 71 123 458</a>
              </div>
            </div>

            {/* Email */}
            <div className="info-card">
              <h3>📧 Email</h3>
              <div className="info-item">
                <p><strong>Support Général:</strong></p>
                <a href="mailto:support@mynet.tn">support@mynet.tn</a>
                <p><strong>Technique:</strong></p>
                <a href="mailto:tech@mynet.tn">tech@mynet.tn</a>
                <p><strong>Commercial:</strong></p>
                <a href="mailto:sales@mynet.tn">sales@mynet.tn</a>
                <p><strong>Légal:</strong></p>
                <a href="mailto:legal@mynet.tn">legal@mynet.tn</a>
              </div>
            </div>

            {/* Hours */}
            <div className="info-card">
              <h3>⏰ Horaires</h3>
              <div className="info-item">
                <p><strong>Lundi - Vendredi:</strong></p>
                <p>8:00 - 18:00</p>
                <p><strong>Samedi:</strong></p>
                <p>9:00 - 13:00</p>
                <p><strong>Support 24/7:</strong></p>
                <p>Disponible pour clients Premium</p>
              </div>
            </div>

            {/* Help Center */}
            <div className="info-card help-card">
              <h3>💡 Centre d'Aide</h3>
              <p>Consultez notre base de connaissances pour des réponses rapides</p>
              <a href="#help-center" className="help-link">Accéder au Centre d'Aide →</a>
            </div>
          </aside>

          {/* Right Column - Forms */}
          <main className="contact-forms">
            {/* Tab Navigation */}
            <div className="form-tabs">
              <button 
                className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
                onClick={() => setActiveTab('general')}
              >
                📝 Demande Générale
              </button>
              <button 
                className={`tab-btn ${activeTab === 'technical' ? 'active' : ''}`}
                onClick={() => setActiveTab('technical')}
              >
                🔧 Support Technique
              </button>
              <button 
                className={`tab-btn ${activeTab === 'legal' ? 'active' : ''}`}
                onClick={() => setActiveTab('legal')}
              >
                ⚖️ Demandes Légales
              </button>
            </div>

            {/* General Contact Form */}
            {activeTab === 'general' && (
              <form className="contact-form" onSubmit={handleSubmit}>
                <h2>Formulaire de Contact Général</h2>
                <p className="form-intro">Nous vous répondrons dans les 24 heures</p>

                {submitted && (
                  <div className="success-message">
                    ✓ Merci! Votre message a été envoyé avec succès. Nous vous recontacterons bientôt.
                  </div>
                )}

                <div className="form-group">
                  <label>Nom Complet *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Téléphone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Entreprise</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Sujet *</label>
                  <select name="subject" value={formData.subject} onChange={handleInputChange} required>
                    <option value="">Sélectionner un sujet</option>
                    <option value="demo">Demander une Démonstration</option>
                    <option value="pricing">Question sur Tarification</option>
                    <option value="partnership">Partenariat</option>
                    <option value="feedback">Retour d'expérience</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows="6"
                    required
                  ></textarea>
                </div>

                <button type="submit" className="submit-btn">📤 Envoyer</button>
              </form>
            )}

            {/* Technical Support Form */}
            {activeTab === 'technical' && (
              <form className="contact-form" onSubmit={handleSubmit}>
                <h2>Formulaire Support Technique</h2>
                <p className="form-intro">Décrivez votre problème technique en détail</p>

                {submitted && (
                  <div className="success-message">
                    ✓ Ticket créé! Référence: #TK{new Date().getTime()} - Nous le traiterons rapidement.
                  </div>
                )}

                <div className="form-group">
                  <label>Nom Complet *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Numéro de Ticket (si applicable)</label>
                    <input
                      type="text"
                      placeholder="TK-XXXXX"
                      name="ticket"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Catégorie du Problème *</label>
                  <select name="subject" value={formData.subject} onChange={handleInputChange} required>
                    <option value="">Sélectionner une catégorie</option>
                    <option value="login">Problème de Connexion</option>
                    <option value="performance">Performance/Lenteur</option>
                    <option value="bug">Signaler un Bug</option>
                    <option value="feature">Demande de Fonctionnalité</option>
                    <option value="integration">Problème d'Intégration</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Priorité *</label>
                  <select name="priority" required>
                    <option value="">Sélectionner</option>
                    <option value="low">🟢 Faible - Peut attendre</option>
                    <option value="medium">🟡 Moyen - Important</option>
                    <option value="high">🔴 Élevée - Urgent</option>
                    <option value="critical">⛔ Critique - Bloquant</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Description Détaillée *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows="6"
                    placeholder="Décrivez le problème, les étapes pour le reproduire, et toute information pertinente..."
                    required
                  ></textarea>
                </div>

                <button type="submit" className="submit-btn">🆘 Créer un Ticket Support</button>
              </form>
            )}

            {/* Legal Requests Form */}
            {activeTab === 'legal' && (
              <form className="contact-form" onSubmit={handleSubmit}>
                <h2>Demandes Légales et de Conformité</h2>
                <p className="form-intro">Pour les demandes légales, de confidentialité ou de conformité</p>

                {submitted && (
                  <div className="success-message">
                    ✓ Votre demande légale a été reçue. Notre équipe légale vous contactera sous 2 jours ouvrables.
                  </div>
                )}

                <div className="form-group">
                  <label>Nom Complet *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Fonction</label>
                    <input
                      type="text"
                      placeholder="Ex: Responsable Légal"
                      name="role"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Organisation/Entreprise *</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Type de Demande *</label>
                  <select name="subject" value={formData.subject} onChange={handleInputChange} required>
                    <option value="">Sélectionner</option>
                    <option value="privacy">Demande Accès à Données Personnelles</option>
                    <option value="deletion">Demande de Suppression de Données</option>
                    <option value="complaint">Plainte</option>
                    <option value="compliance">Conformité / Audit</option>
                    <option value="contract">Accord Contractuel</option>
                    <option value="dpa">Data Processing Agreement</option>
                    <option value="other">Autre Demande Légale</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Description Détaillée *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows="6"
                    placeholder="Veuillez fournir les détails complets de votre demande légale..."
                    required
                  ></textarea>
                </div>

                <div className="form-group checkbox">
                  <label>
                    <input type="checkbox" required />
                    Je confirme que cette demande est authentique et autorisée
                  </label>
                </div>

                <button type="submit" className="submit-btn">⚖️ Soumettre la Demande Légale</button>
              </form>
            )}
          </main>
        </div>
      </div>

      {/* Help Center Section */}
      <section id="help-center" className="help-center-section">
        <div className="container">
          <h2>💡 Centre d'Aide et Base de Connaissances</h2>
          <p className="section-intro">Trouvez des réponses rapides à vos questions</p>

          <div className="help-grid">
            <div className="help-card">
              <div className="help-icon">🚀</div>
              <h3>Démarrage Rapide</h3>
              <p>Apprenez les bases pour commencer à utiliser MyNet.tn en quelques minutes</p>
              <a href="#" className="help-link">Consulter Guide →</a>
            </div>

            <div className="help-card">
              <div className="help-icon">🏢</div>
              <h3>Guide Acheteur</h3>
              <p>Documentation complète pour les acheteurs sur la création d'AO et évaluation</p>
              <a href="#" className="help-link">Consulter Guide →</a>
            </div>

            <div className="help-card">
              <div className="help-icon">🏭</div>
              <h3>Guide Fournisseur</h3>
              <p>Tout ce qu'il faut savoir pour soumettre des offres et gérer votre catalogue</p>
              <a href="#" className="help-link">Consulter Guide →</a>
            </div>

            <div className="help-card">
              <div className="help-icon">🔐</div>
              <h3>Sécurité et Confidentialité</h3>
              <p>Comprendre comment nous protégeons vos données et vos transactions</p>
              <a href="#" className="help-link">Consulter Guide →</a>
            </div>

            <div className="help-card">
              <div className="help-icon">💳</div>
              <h3>Facturation et Paiements</h3>
              <p>Questions sur les forfaits, la facturation, et les modes de paiement</p>
              <a href="#" className="help-link">Consulter Guide →</a>
            </div>

            <div className="help-card">
              <div className="help-icon">🔗</div>
              <h3>Intégrations</h3>
              <p>Comment intégrer MyNet.tn avec vos systèmes ERP et autres outils</p>
              <a href="#" className="help-link">Consulter Guide →</a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="container">
          <h2>❓ Questions Fréquemment Posées</h2>

          <div className="faq-grid">
            <div className="faq-item">
              <h4>Quel est le temps de réponse moyen du support?</h4>
              <p>Nous répondons généralement dans les 2 heures pour les problèmes critiques, et 24h pour les autres demandes.</p>
            </div>

            <div className="faq-item">
              <h4>Puis-je parler à quelqu'un directement?</h4>
              <p>Oui! Les clients Premium ont accès à un support téléphonique direct. Appelez notre support technique pour organiser un appel.</p>
            </div>

            <div className="faq-item">
              <h4>Avez-vous une documentation API?</h4>
              <p>Oui, la documentation API complète est disponible dans le Centre d'Aide pour les forfaits Gold et Platinum.</p>
            </div>

            <div className="faq-item">
              <h4>Comment puis-je signaler une faille de sécurité?</h4>
              <p>Veuillez envoyer un email à security@mynet.tn avec les détails. Nous traiterons les rapports de sécurité en priorité.</p>
            </div>

            <div className="faq-item">
              <h4>Offrez-vous une formation pour notre équipe?</h4>
              <p>Oui! Les clients Premium et Platinum peuvent accéder à des sessions de formation personnalisées.</p>
            </div>

            <div className="faq-item">
              <h4>Comment puis-je demander une fonctionnalité?</h4>
              <p>Vous pouvez soumettre des demandes de fonctionnalités via notre formulaire de contact ou le Centre d'Aide.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="contact-cta">
        <div className="container">
          <h2>Vous ne trouvez pas votre réponse?</h2>
          <p>Nos équipes de support sont prêtes à vous aider</p>
          <a href="#" className="cta-button">📞 Planifier un Appel avec Expert →</a>
        </div>
      </section>
    </div>
  );
}
