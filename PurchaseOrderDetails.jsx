import React from 'react';

/**
 * @typedef {object} PurchaseOrder
 * @property {string} id
 * @property {string} poNumber
 * @property {string} createdAt
 * @property {object} buyer
 * @property {string} buyer.name
 * @property {object} supplier
 * @property {string} supplier.name
 * @property {Array<object>} lineItems
 * @property {number} totalPrice
 */

/**
 * Displays the details of a Purchase Order.
 * @param {{ purchaseOrder: PurchaseOrder }} props
 */
const PurchaseOrderDetails = ({ purchaseOrder }) => {
  if (!purchaseOrder) {
    return <div>No Purchase Order data available.</div>;
  }

  return (
    <div style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px' }}>
      <h2>Purchase Order: {purchaseOrder.poNumber}</h2>
      <p><strong>Date:</strong> {new Date(purchaseOrder.createdAt).toLocaleDateString('fr-FR')}</p>
      <p><strong>Supplier:</strong> {purchaseOrder.supplier.name}</p>
      <p><strong>Buyer:</strong> {purchaseOrder.buyer.name}</p>
      
      <h4>Line Items:</h4>
      <ul>
        {purchaseOrder.lineItems.map(item => (
          <li key={item.id}>{item.description} - {item.quantity} x {item.unitPrice} = {item.totalPrice}</li>
        ))}
      </ul>
      <h3>Total: {new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(purchaseOrder.totalPrice)}</h3>
    </div>
  );
};

export default PurchaseOrderDetails;