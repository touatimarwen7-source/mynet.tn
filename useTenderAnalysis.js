import { useState, useEffect } from 'react';
import { procurementAPI } from '../api/procurementAPI';

/**
 * Custom Hook to fetch and manage the data for the offer analysis report.
 * @param {string} tenderId - The ID of the tender to analyze.
 */
export const useTenderAnalysis = (tenderId) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!tenderId) return;
      setLoading(true);
      try {
        const response = await procurementAPI.getTenderAnalysisReport(tenderId);
        setReport(response.data.analysisReport || null);
      } catch (err) {
        const errorMsg = err.response?.data?.error || 'Erreur lors du chargement du rapport d\'analyse.';
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [tenderId]);

  return {
    report,
    loading,
    error,
  };
};