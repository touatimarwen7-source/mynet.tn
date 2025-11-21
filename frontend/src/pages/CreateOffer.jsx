import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { procurementAPI } from '../api';
import { useToastContext } from '../contexts/ToastContext';
import { setPageTitle } from '../utils/pageTitle';

export default function CreateOffer() {
  const { tenderId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToastContext();

  useEffect(() => {
    setPageTitle('Soumission d\'Offre Sécurisée');
  }, []);
  const [tender, setTender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1); // Étapes du formulaire
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [selectedLineItemIndex, setSelectedLineItemIndex] = useState(null);
  const [catalogProducts, setCatalogProducts] = useState([]);

  // Vérifier si le délai de l'appel d'offres est dépassé
  const isDeadlinePassed = tender && new Date() > new Date(tender.deadline);

  const [offerData, setOfferData] = useState({
    supplier_ref_number: '',
    validity_period_days: 30,
    payment_terms: 'Net30',
    technical_proposal: '',
    line_items: [],
    attachments: [],
    commitment: false
  });

  useEffect(() => {
    fetchTender();
  }, [tenderId]);

  const fetchTender = async () => {
    try {
      const response = await procurementAPI.getTender(tenderId);
      setTender(response.data.tender);
      
      // Initialiser les articles de l'appel d'offres
      const items = response.data.tender.requirements || [];
      setOfferData(prev => ({
        ...prev,
        line_items: items.map((item, idx) => ({
          id: idx,
          description: item.description || item,
          quantity: item.quantity || 1,
          unit: item.unit || 'piece',
          unit_price: '',
          total_price: 0,
          specifications: '',
          partial_quantity: null,
          is_partial: false,
          technical_response: ''
        }))
      }));
      addToast('L\'appel d\'offres a été chargé avec succès', 'success', 2000);
    } catch (err) {
      const errorMessage = 'Erreur lors du chargement de l\'appel d\'offres: ' + err.message;
      setError(errorMessage);
      addToast(errorMessage, 'error', 4000);
    } finally {
      setLoading(false);
    }
  };

  const fetchCatalogProducts = async () => {
    try {
      const response = await procurementAPI.getMyOffers(); // Simulation du catalogue
      setCatalogProducts(response.data.offers || []);
    } catch (err) {
      console.error('Erreur lors de la récupération du catalogue:', err);
    }
  };

  const handleOpenCatalog = (itemIndex) => {
    setSelectedLineItemIndex(itemIndex);
    setShowCatalogModal(true);
    fetchCatalogProducts();
  };

  const handleSelectFromCatalog = (product) => {
    const newItems = [...offerData.line_items];
    newItems[selectedLineItemIndex] = {
      ...newItems[selectedLineItemIndex],
      unit_price: product.total_amount || 0,
      specifications: product.description || ''
    };
    newItems[selectedLineItemIndex].total_price = newItems[selectedLineItemIndex].unit_price * newItems[selectedLineItemIndex].quantity;
    setOfferData(prev => ({ ...prev, line_items: newItems }));
    setShowCatalogModal(false);
  };

  const handleLineItemChange = (index, field, value) => {
    const newItems = [...offerData.line_items];
    newItems[index][field] = field === 'unit_price' ? parseFloat(value) || 0 : value;

    if (field === 'unit_price' || field === 'partial_quantity' || field === 'is_partial') {
      const item = newItems[index];
      const quantity = item.is_partial ? (item.partial_quantity || 0) : item.quantity;
      item.total_price = (item.unit_price || 0) * quantity;
    }

    setOfferData(prev => ({ ...prev, line_items: newItems }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setOfferData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const removeAttachment = (index) => {
    setOfferData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const getTotalBidAmount = () => {
    return offerData.line_items.reduce((sum, item) => sum + (item.total_price || 0), 0).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isDeadlinePassed) {
      setError(`❌ L'envoi a échoué. L'appel d'offres est fermé depuis ${new Date(tender.deadline).toLocaleDateString('fr-FR')} à ${new Date(tender.deadline).toLocaleTimeString('fr-FR')}`);
      return;
    }

    if (!offerData.commitment) {
      setError('Vous devez accepter tous les termes et conditions');
      return;
    }

    const invalidItems = offerData.line_items.filter(item => !item.unit_price || item.unit_price === 0);
    if (invalidItems.length > 0) {
      setError('Veuillez remplir les prix de tous les articles');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('tender_id', tenderId);
      formData.append('supplier_ref_number', offerData.supplier_ref_number);
      formData.append('validity_period_days', offerData.validity_period_days);
      formData.append('payment_terms', offerData.payment_terms);
      formData.append('technical_proposal', offerData.technical_proposal);
      formData.append('line_items', JSON.stringify(offerData.line_items));
      formData.append('total_amount', getTotalBidAmount());

      offerData.attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file);
      });

      await procurementAPI.createOffer(formData);
      setSuccess(true);
      addToast('✅ Votre offre a été envoyée avec succès et chiffrée en toute sécurité!', 'success', 2000);
      
      setTimeout(() => {
        navigate('/my-offers');
      }, 2500);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError('❌ Erreur lors de l\'envoi de l\'offre: ' + errorMsg);
      addToast('❌ Erreur lors de l\'envoi de l\'offre', 'error', 4000);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Chargement de l'appel d'offres...</div>;
  if (!tender) return <div className="alert alert-error">L'appel d'offres n'existe pas</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}>
      <button onClick={() => window.history.back()} className="btn btn-secondary">
        ← Retour
      </button>

      {/* Message d'erreur pour les appels d'offres expirés */}
      {isDeadlinePassed && (
        <div style={{
          marginTop: '1rem',
          padding: '1.5rem',
          backgroundColor: '#f8d7da',
          border: '2px solid #f5c6cb',
          borderRadius: '8px',
          color: '#721c24',
          textAlign: 'center'
        }}>
          <h3>⏰ Désolé, cet appel d'offres est fermé</h3>
          <p>Date de clôture: {new Date(tender.deadline).toLocaleDateString('fr-FR')} à {new Date(tender.deadline).toLocaleTimeString('fr-FR')}</p>
          <p>Vous ne pouvez pas soumettre d'offre après la date limite.</p>
        </div>
      )}

      {error && <div className="alert alert-error" style={{ marginTop: '1rem' }}>{error}</div>}
      {success && (
        <div className="alert alert-success" style={{ marginTop: '1rem' }}>
          ✅ Votre offre a été envoyée avec succès et chiffrée en toute sécurité! Redirection vers mes offres...
        </div>
      )}

      <div className="card" style={{ marginTop: '1rem' }}>
        <h2>📝 Formulaire de soumission d'offre sécurisée</h2>
        <p style={{ color: '#666' }}>
          <strong>Appel d'offres:</strong> {tender.title}
        </p>

        {/* Barres d'étapes */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center' }}>
          {[1, 2, 3].map(s => (
            <div
              key={s}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: step === s ? '#007bff' : step > s ? '#28a745' : '#e9ecef',
                color: step === s || step > s ? 'white' : '#666',
                borderRadius: '20px',
                cursor: 'pointer',
                fontWeight: step === s ? 'bold' : 'normal'
              }}
              onClick={() => !isDeadlinePassed && step > s && setStep(s)}
            >
              {s === 1 && '1️⃣ Informations de base'}
              {s === 2 && '2️⃣ Articles de l\'appel'}
              {s === 3 && '3️⃣ Révision et envoi'}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Étape 1: Informations de base */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3>📋 Informations de base de l'offre</h3>

              <div>
                <label><strong>Numéro de référence du fournisseur (optionnel)</strong></label>
                <input
                  type="text"
                  value={offerData.supplier_ref_number}
                  onChange={(e) => setOfferData({...offerData, supplier_ref_number: e.target.value})}
                  placeholder="Numéro interne pour faciliter le suivi"
                  style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
                <small style={{ color: '#666', display: 'block', marginTop: '0.25rem' }}>N'affecte pas l'évaluation</small>
              </div>

              <div>
                <label><strong>Période de validité de l'offre (en jours)</strong></label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={offerData.validity_period_days}
                  onChange={(e) => setOfferData({...offerData, validity_period_days: parseInt(e.target.value)})}
                  style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
                <small style={{ color: '#666', display: 'block', marginTop: '0.25rem' }}>Doit être inférieur à 365 jours</small>
              </div>

              <div>
                <label><strong>Conditions de paiement proposées</strong></label>
                <select
                  value={offerData.payment_terms}
                  onChange={(e) => setOfferData({...offerData, payment_terms: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  <option value="Net30">Net 30 - Dans les 30 jours</option>
                  <option value="Net60">Net 60 - Dans les 60 jours</option>
                  <option value="PaymentInAdvance">Paiement d'avance</option>
                  <option value="CashOnDelivery">Paiement à la livraison</option>
                </select>
              </div>

              <div>
                <label><strong>Proposition technique</strong></label>
                <textarea
                  rows="5"
                  value={offerData.technical_proposal}
                  onChange={(e) => setOfferData({...offerData, technical_proposal: e.target.value})}
                  placeholder="Expliquez comment vous livrerez le service/produit et les spécifications techniques..."
                  style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', fontFamily: 'inherit' }}
                />
              </div>

              <div>
                <label><strong>Documents du fournisseur (PDF, DOCX)</strong></label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.docx,.doc"
                  onChange={handleFileUpload}
                  style={{ marginTop: '0.5rem' }}
                />
                {offerData.attachments.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <p><strong>Fichiers téléchargés:</strong></p>
                    <ul style={{ paddingRight: '1.5rem' }}>
                      {offerData.attachments.map((file, idx) => (
                        <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span>{file.name}</span>
                          <button type="button" onClick={() => removeAttachment(idx)} className="btn btn-small">Supprimer</button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn btn-primary"
                style={{ padding: '0.75rem 2rem', alignSelf: 'flex-end' }}
              >
                Suivant ← Articles de l'appel
              </button>
            </div>
          )}

          {/* Étape 2: Articles de l'appel */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3>📦 Réponse aux articles de l'appel d'offres</h3>

              {offerData.line_items.length === 0 ? (
                <div className="alert alert-info">Il n'y a pas d'articles dans cet appel d'offres</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                        <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Description</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Quantité</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Unité</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid #ddd' }}>🔒 Prix unitaire</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Total</th>
                        <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Catalogue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {offerData.line_items.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '0.75rem' }}>{item.description}</td>
                          <td style={{ padding: '0.75rem' }}>{item.quantity}</td>
                          <td style={{ padding: '0.75rem' }}>{item.unit}</td>
                          <td style={{ padding: '0.75rem' }}>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.unit_price}
                              onChange={(e) => handleLineItemChange(idx, 'unit_price', e.target.value)}
                              placeholder="Prix"
                              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#fffbf0' }}
                            />
                          </td>
                          <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>
                            {item.total_price.toFixed(2)} {tender.currency}
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleOpenCatalog(idx)}
                              className="btn btn-small"
                              style={{ padding: '0.5rem' }}
                            >
                              📚 Du catalogue
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div style={{ padding: '1rem', backgroundColor: '#e7f3ff', borderRadius: '4px', textAlign: 'center' }}>
                <strong>Total financier de l'offre: </strong>
                <span style={{ fontSize: '1.3rem', color: '#007bff', fontWeight: 'bold' }}>
                  {getTotalBidAmount()} {tender.currency}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn btn-secondary"
                  style={{ padding: '0.75rem 1.5rem' }}
                >
                  ← Précédent
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="btn btn-primary"
                  style={{ padding: '0.75rem 1.5rem' }}
                >
                  Suivant - Révision ←
                </button>
              </div>
            </div>
          )}

          {/* Étape 3: Révision et envoi */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3>✅ Révision finale et envoi sécurisé</h3>

              <div style={{ padding: '1.5rem', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #ddd' }}>
                <h4>📊 Résumé de l'offre</h4>
                <div style={{ lineHeight: '1.8', fontSize: '0.95rem' }}>
                  <p><strong>Numéro de référence:</strong> {offerData.supplier_ref_number || 'Aucun'}</p>
                  <p><strong>Période de validité:</strong> {offerData.validity_period_days} jours</p>
                  <p><strong>Conditions de paiement:</strong> {offerData.payment_terms}</p>
                  <p><strong>Nombre d'articles:</strong> {offerData.line_items.length}</p>
                  <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#007bff' }}>
                    💰 Total financier: {getTotalBidAmount()} {tender.currency}
                  </p>
                  <p><strong>Fichiers téléchargés:</strong> {offerData.attachments.length} fichier(s)</p>
                </div>
              </div>

              <div style={{ padding: '1rem', backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px', color: '#856404' }}>
                <strong>🔒 Alerte de sécurité:</strong>
                <p>Toutes les données financières de votre offre seront chiffrées avec AES-256. Seul l'acheteur pourra déchiffrer et accéder aux détails financiers.</p>
              </div>

              <div style={{ padding: '1rem', backgroundColor: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '4px', color: '#155724' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={offerData.commitment}
                    onChange={(e) => setOfferData({...offerData, commitment: e.target.checked})}
                    style={{ marginTop: '0.25rem' }}
                  />
                  <span>
                    <strong>✓ Engagement d'envoi</strong>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
                      Je confirme que j'ai lu et compris tous les termes et conditions de l'appel d'offres, et que cette offre est valable pour la période indiquée ci-dessus.
                    </p>
                  </span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn btn-secondary"
                  style={{ padding: '0.75rem 1.5rem' }}
                  disabled={submitting || isDeadlinePassed}
                >
                  ← Retour à la modification des articles
                </button>
                <button
                  type="submit"
                  disabled={submitting || !offerData.commitment || isDeadlinePassed}
                  className="btn btn-primary"
                  style={{
                    padding: '0.75rem 2rem',
                    fontSize: '1rem',
                    backgroundColor: isDeadlinePassed ? '#ccc' : undefined,
                    cursor: isDeadlinePassed || !offerData.commitment ? 'not-allowed' : 'pointer',
                    opacity: submitting || !offerData.commitment ? 0.6 : 1
                  }}
                >
                  {submitting ? '⏳ Chiffrement et envoi de l\'offre en cours...' : '🔐 Chiffrer et envoyer l\'offre maintenant'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Fenêtre du catalogue */}
      {showCatalogModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflowY: 'auto',
            width: '90%'
          }}>
            <h3>Choisissez dans votre catalogue</h3>
            {catalogProducts.length === 0 ? (
              <p className="alert alert-info">Aucun produit dans votre catalogue</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {catalogProducts.map((product, idx) => (
                  <div key={idx} style={{
                    padding: '1rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }} onClick={() => handleSelectFromCatalog(product)}>
                    <p><strong>{product.description || 'Produit'}</strong></p>
                    <p style={{ fontSize: '0.9rem', color: '#666' }}>Prix: {product.total_amount} {tender.currency}</p>
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowCatalogModal(false)}
              className="btn btn-secondary"
              style={{ marginTop: '1rem', width: '100%' }}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
