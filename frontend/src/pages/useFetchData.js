import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * Custom hook for fetching data from the API.
 * @param {string} initialUrl - The initial URL to fetch data from.
 * @returns {object} - { data, loading, error, refetch }
 */
export const useFetchData = (initialUrl) => {
  const [url, setUrl] = useState(initialUrl);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(url);
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur s'est produite lors du chargement des données.");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};