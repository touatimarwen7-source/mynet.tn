import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api'; // Assuming 'api' is an axios instance or similar

const SupplierDashboard = ({ userId }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    if (!userId) {
      setError('Aucun utilisateur connecté');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/procurement/supplier/dashboard/${userId}`);
      setDashboardData(response.data);
    } catch (err) {
      console.error("Erreur lors de la récupération des données du tableau de bord:", err);
      setError('Impossible de charger les données du tableau de bord.');
    } finally {
      setLoading(false);
    }
  }, [userId]); // Correct dependencies

  useEffect(() => {
    fetchDashboardData();
  }, [userId, fetchDashboardData]); // Correct dependencies

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return <div>Erreur : {error}</div>;
  }

  // Placeholder for rendering dashboard data
  return (
    <div>
      <h1>Tableau de bord Fournisseur</h1>
      {dashboardData ? (
        <pre>{JSON.stringify(dashboardData, null, 2)}</pre>
      ) : (
        <p>Aucune donnée disponible.</p>
      )}
    </div>
  );
};

export default SupplierDashboard;