import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { procurementAPI } from '../api/procurementAPI';
import TenderAwarding from '../components/TenderAwarding';
import TenderAuditLog from '../components/TenderAuditLog';
import OfferAnalysisReport from '../components/OfferAnalysisReport';

// Mock authentication hook for demonstration
// In a real app, this would come from a context (e.g., useContext(AuthContext))
const useAuth = () => ({
  currentUser: { id: 'buyer-123', role: 'Buyer' }, // Example: Logged-in user is a buyer
});

/**
 * This page displays the details of a single tender.
 * It conditionally renders the awarding interface for the tender owner.
 */
const TenderDetailsPage = () => {
  const { tenderId } = useParams();
  const { currentUser } = useAuth();

  const [tender, setTender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTenderDetails = async () => {
      setLoading(true);
      try {
        const response = await procurementAPI.getTender(tenderId);
        setTender(response.data.tender);
      } catch (err) {
        setError('Failed to load tender details.');
      } finally {
        setLoading(false);
      }
    };

    fetchTenderDetails();
  }, [tenderId]);

  if (loading) return <div>Loading tender details...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!tender) return <div>Tender not found.</div>;

  // --- Conditional Logic ---
  // Check if the current user is the owner of the tender
  const isOwner = currentUser && currentUser.id === tender.buyerId;
  // Check if the submission deadline has passed
  const isDeadlinePassed = new Date() > new Date(tender.deadline);

  // The awarding component should only be shown if the user is the owner,
  // the deadline has passed, and the tender is not already awarded.
  const canShowAwardingInterface = isOwner && isDeadlinePassed && tender.status !== 'Awarded';
  
  // The analysis report is shown to the owner after the tender is closed for submissions.
  // The backend generates the report when the status becomes 'Closed' or 'Opened'.
  const canShowAnalysisReport = isOwner && (tender.status === 'Closed' || tender.status === 'Opened' || tender.status === 'Awarded');

  return (
    <div style={{ padding: '20px' }}>
      <h1>{tender.title}</h1>
      <p><strong>Status:</strong> {tender.status}</p>
      <p><strong>Deadline:</strong> {new Date(tender.deadline).toLocaleString('fr-FR')}</p>
      <hr />
      <p>{tender.description}</p>

      {/* --- Analysis Report Section --- */}
      {canShowAnalysisReport && (
        <OfferAnalysisReport tenderId={tender.id} />
      )}

      {/* --- Awarding Section --- */}
      {canShowAwardingInterface && (
        <TenderAwarding tenderId={tender.id} tenderStatus={tender.status} />
      )}

      {/* --- Audit Log Section --- */}
      {isOwner && (
        <TenderAuditLog tenderId={tender.id} />
      )}
    </div>
  );
};

export default TenderDetailsPage;