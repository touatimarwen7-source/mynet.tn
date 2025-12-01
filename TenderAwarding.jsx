import React from 'react';
import { useTenderAwarding } from '../hooks/useTenderAwarding';
import PurchaseOrderDetails from './PurchaseOrderDetails';

/**
 * A component for buyers to review submitted offers and award a tender.
 * @param {{ tenderId: string, tenderStatus: string }} props
 */
const TenderAwarding = ({ tenderId, tenderStatus }) => {
  const { offers, loading, awarding, error, handleAward, awardedPO } = useTenderAwarding(tenderId);

  if (loading) {
    return <div>Loading offers...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  // If a Purchase Order has been created, show its details instead.
  if (awardedPO) {
    return (
      <div>
        <h2>Tender Awarded!</h2>
        <PurchaseOrderDetails purchaseOrder={awardedPO} />
      </div>
    );
  }
  
  // Do not show awarding interface if tender is not in a closed state for review
  if (tenderStatus !== 'Closed') {
     return <div>Review of offers will be available after the submission deadline.</div>
  }

  return (
    <div>
      <h3>Submitted Offers ({offers.length})</h3>
      {offers.length === 0 ? (
        <p>No offers were submitted for this tender.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Supplier</th>
              <th>Total Price</th>
              <th>Submitted At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer) => (
              <tr key={offer.id}>
                <td>{offer.supplier.name}</td>
                <td>{new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(offer.totalPrice)}</td>
                <td>{new Date(offer.submittedAt).toLocaleDateString('fr-FR')}</td>
                <td>
                  <button onClick={() => handleAward(offer.id)} disabled={awarding}>
                    {awarding ? 'Awarding...' : 'Award Tender'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TenderAwarding;