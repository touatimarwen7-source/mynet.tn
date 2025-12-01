import { useState, useEffect, useCallback } from 'react';
import { procurementAPI } from '../api/procurementAPI';
import { useToast } from '../contexts/AppContext';

/**
 * @typedef {object} Offer
 * @property {string} id
 * @property {object} supplier
 * @property {string} supplier.name
 * @property {number} totalOfferPrice
 * @property {string} validity_period_days
 * @property {string} submittedAt
 */

/**
 * Custom Hook to manage the tender awarding process.
 * It fetches submitted offers and handles the award action.
 * @param {string} tenderId - The ID of the tender to manage.
 */
export const useTenderAwarding = (tenderId) => {
  const { addToast } = useToast();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [awarding, setAwarding] = useState(false);
  const [error, setError] = useState(null);
  const [awardedPO, setAwardedPO] = useState(null); // State to hold the created Purchase Order

  // Fetch all offers for the tender
  useEffect(() => {
    const fetchOffers = async () => {
      if (!tenderId) return;
      setLoading(true);
      try {
        const response = await procurementAPI.getTenderOffers(tenderId);
        setOffers(response.data.offers || []);
      } catch (err) {
        const errorMsg = err.response?.data?.error || 'Failed to fetch offers.';
        setError(errorMsg);
        addToast(errorMsg, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, [tenderId, addToast]);

  // Handle the award action
  const handleAward = useCallback(async (winningOfferId) => {
    setAwarding(true);
    try {
      const response = await procurementAPI.awardTender(tenderId, winningOfferId);
      setAwardedPO(response.data.purchaseOrder); // Assuming the API returns the PO
      addToast('Tender awarded successfully! Purchase Order created.', 'success');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to award tender.';
      setError(errorMsg);
      addToast(errorMsg, 'error');
    } finally {
      setAwarding(false);
    }
  }, [tenderId, addToast]);

  return { offers, loading, awarding, error, handleAward, awardedPO };
};