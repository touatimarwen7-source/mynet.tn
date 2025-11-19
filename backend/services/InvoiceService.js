
const pool = require('../config/db');
const Invoice = require('../models/Invoice');

class InvoiceService {
  async createInvoice(invoiceData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Verify purchase order exists and belongs to supplier
      const poCheck = await client.query(
        'SELECT * FROM purchase_orders WHERE id = $1 AND supplier_id = $2',
        [invoiceData.purchase_order_id, invoiceData.supplier_id]
      );

      if (poCheck.rows.length === 0) {
        throw new Error('Purchase order not found or unauthorized');
      }

      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const invoice = new Invoice({
        ...invoiceData,
        invoice_number: invoiceNumber,
        total: parseFloat(invoiceData.amount) + parseFloat(invoiceData.tax || 0)
      });

      const result = await client.query(
        `INSERT INTO invoices 
        (id, purchase_order_id, supplier_id, invoice_number, amount, tax, total, 
         issue_date, due_date, status, notes) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
        RETURNING *`,
        [invoice.id, invoice.purchase_order_id, invoice.supplier_id, 
         invoice.invoice_number, invoice.amount, invoice.tax, invoice.total,
         invoice.issue_date, invoice.due_date, invoice.status, invoice.notes]
      );

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getInvoicesBySupplier(supplierId) {
    const result = await pool.query(
      `SELECT i.*, po.order_number, po.buyer_id 
       FROM invoices i 
       JOIN purchase_orders po ON i.purchase_order_id = po.id 
       WHERE i.supplier_id = $1 
       ORDER BY i.created_at DESC`,
      [supplierId]
    );
    return result.rows;
  }

  async markAsPaid(invoiceId, paymentDate) {
    const result = await pool.query(
      `UPDATE invoices 
       SET status = 'paid', payment_date = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
      [paymentDate, invoiceId]
    );
    return result.rows[0];
  }
}

module.exports = new InvoiceService();
