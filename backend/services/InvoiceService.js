
const { getPool } = require('../config/db');
const AuditLogService = require('./AuditLogService');
const NotificationService = require('./NotificationService');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;

/**
 * Invoice Service
 * Handles supplier invoice creation and management with file attachments
 */
class InvoiceService {
  /**
   * Create an invoice for a purchase order
   * Generates invoice with line items, tax calculations, and payment terms
   * Notifies buyer of new invoice submission
   * @async
   * @param {Object} invoiceData - Invoice details:
   *   - purchase_order_id: Associated purchase order ID (required)
   *   - supplier_id: Supplier creating the invoice (required)
   *   - invoice_number: Unique invoice reference number (required)
   *   - invoice_date: Invoice creation date (required)
   *   - due_date: Payment due date (required)
   *   - items: Array of invoice line items (required)
   *   - subtotal: Pre-tax amount (required)
   *   - tax_amount: Total tax amount (required)
   *   - total_amount: Grand total including tax (required)
   *   - currency: Currency code (default: 'TND')
   *   - payment_terms: Payment conditions and terms
   *   - notes: Additional notes or instructions
   *   - bank_details: Supplier bank account information for payment
   * @returns {Promise<Object>} Created invoice object with status 'submitted'
   * @throws {Error} If purchase order not found, unauthorized, or database operation fails
   * @example
   * const invoice = await createInvoice({
   *   purchase_order_id: 'po-123',
   *   supplier_id: 'supplier-456',
   *   invoice_number: 'INV-2025-001',
   *   total_amount: 15000,
   *   items: [{ description: 'Laptops', quantity: 10, unit_price: 1500 }]
   * });
   */
  async createInvoice(invoiceData) {
    const pool = getPool();
    const {
      purchase_order_id,
      supplier_id,
      invoice_number,
      invoice_date,
      due_date,
      items,
      subtotal,
      tax_amount,
      total_amount,
      currency,
      payment_terms,
      notes,
      bank_details,
    } = invoiceData;

    try {
      // Verify purchase order exists and belongs to supplier
      const poResult = await pool.query(
        `SELECT * FROM purchase_orders WHERE id = $1 AND supplier_id = $2`,
        [purchase_order_id, supplier_id]
      );

      if (poResult.rows.length === 0) {
        throw new Error('Purchase order not found or unauthorized');
      }

      const purchaseOrder = poResult.rows[0];

      // Create invoice
      const invoiceId = uuidv4();
      const result = await pool.query(
        `INSERT INTO invoices 
        (id, purchase_order_id, supplier_id, buyer_id, invoice_number, invoice_date, due_date, 
         items, subtotal, tax_amount, total_amount, currency, payment_terms, notes, 
         bank_details, status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, CURRENT_TIMESTAMP)
        RETURNING *`,
        [
          invoiceId,
          purchase_order_id,
          supplier_id,
          purchaseOrder.buyer_id,
          invoice_number,
          invoice_date,
          due_date,
          JSON.stringify(items),
          subtotal,
          tax_amount,
          total_amount,
          currency || 'TND',
          payment_terms,
          notes,
          JSON.stringify(bank_details),
          'submitted',
        ]
      );

      const invoice = result.rows[0];

      // Audit log
      await AuditLogService.logAction(
        supplier_id,
        'create_invoice',
        'invoice',
        invoiceId,
        { invoice_number, purchase_order_id, total_amount }
      );

      // Notify buyer
      await NotificationService.notifyInvoiceReceived(
        purchaseOrder.buyer_id,
        invoice_number,
        supplier_id
      );

      return invoice;
    } catch (error) {
      throw new Error(`Failed to create invoice: ${error.message}`);
    }
  }

  /**
   * Get invoice by ID
   */
  async getInvoiceById(invoiceId, userId) {
    const pool = getPool();

    const result = await pool.query(
      `SELECT i.*, 
              u_supplier.full_name as supplier_name, u_supplier.company_name as supplier_company,
              u_buyer.full_name as buyer_name, u_buyer.company_name as buyer_company,
              po.po_number
       FROM invoices i
       LEFT JOIN users u_supplier ON i.supplier_id = u_supplier.id
       LEFT JOIN users u_buyer ON i.buyer_id = u_buyer.id
       LEFT JOIN purchase_orders po ON i.purchase_order_id = po.id
       WHERE i.id = $1 AND (i.supplier_id = $2 OR i.buyer_id = $2)`,
      [invoiceId, userId]
    );

    return result.rows[0] || null;
  }

  /**
   * Get invoices by supplier
   */
  async getInvoicesBySupplier(supplierId) {
    const pool = getPool();

    const result = await pool.query(
      `SELECT i.*, 
              u.full_name as buyer_name, u.company_name as buyer_company,
              po.po_number
       FROM invoices i
       LEFT JOIN users u ON i.buyer_id = u.id
       LEFT JOIN purchase_orders po ON i.purchase_order_id = po.id
       WHERE i.supplier_id = $1
       ORDER BY i.created_at DESC`,
      [supplierId]
    );

    return result.rows;
  }

  /**
   * Get invoices by buyer
   */
  async getInvoicesByBuyer(buyerId) {
    const pool = getPool();

    const result = await pool.query(
      `SELECT i.*, 
              u.full_name as supplier_name, u.company_name as supplier_company,
              po.po_number
       FROM invoices i
       LEFT JOIN users u ON i.supplier_id = u.id
       LEFT JOIN purchase_orders po ON i.purchase_order_id = po.id
       WHERE i.buyer_id = $1
       ORDER BY i.created_at DESC`,
      [buyerId]
    );

    return result.rows;
  }

  /**
   * Update invoice status (buyer approval/payment)
   */
  async updateInvoiceStatus(invoiceId, status, userId, paymentDate = null) {
    const pool = getPool();

    const result = await pool.query(
      `UPDATE invoices 
       SET status = $1, payment_date = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND buyer_id = $4
       RETURNING *`,
      [status, paymentDate, invoiceId, userId]
    );

    if (result.rows.length === 0) {
      throw new Error('Invoice not found or unauthorized');
    }

    const invoice = result.rows[0];

    await AuditLogService.logAction(userId, 'update_invoice_status', 'invoice', invoiceId, {
      status,
      payment_date: paymentDate,
    });

    return invoice;
  }

  /**
   * Attach invoice document (PDF/Image)
   */
  async attachDocument(invoiceId, file, userId) {
    const pool = getPool();

    // Validate file type
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      throw new Error('Invalid file type. Only PDF and images are allowed');
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size exceeds 5MB limit');
    }

    const documentPath = `/uploads/invoices/${file.filename}`;

    const result = await pool.query(
      `UPDATE invoices 
       SET document_path = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND supplier_id = $3
       RETURNING *`,
      [documentPath, invoiceId, userId]
    );

    if (result.rows.length === 0) {
      throw new Error('Facture introuvable ou non autorisée');
    }

    await AuditLogService.logAction(
      userId,
      'attach_invoice_document',
      'invoice',
      invoiceId,
      { document_path: documentPath, file_size: file.size }
    );

    return result.rows[0];
  }

  /**
   * Get comprehensive invoice statistics for a supplier
   * Calculates total invoices, payment status breakdown, and revenue metrics
   * Used for supplier financial dashboard and performance tracking
   * @async
   * @param {string} supplierId - The ID of the supplier
   * @returns {Promise<Object>} Statistics object with:
   *   - total_invoices: Total number of invoices created
   *   - pending_invoices: Count of submitted invoices awaiting approval
   *   - approved_invoices: Count of approved invoices awaiting payment
   *   - paid_invoices: Count of fully paid invoices
   *   - total_paid: Total revenue received (sum of paid invoice amounts)
   *   - total_pending: Total outstanding amount (submitted + approved invoices)
   * @throws {Error} If database query fails
   * @example
   * const stats = await getSupplierInvoiceStats('supplier-123');
   * console.log(`Total revenue: ${stats.total_paid} TND`);
   */
  async getSupplierInvoiceStats(supplierId) {
    const pool = getPool();

    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_invoices,
        COUNT(CASE WHEN status = 'submitted' THEN 1 END) as pending_invoices,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_invoices,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_invoices,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END), 0) as total_paid,
        COALESCE(SUM(CASE WHEN status IN ('submitted', 'approved') THEN total_amount ELSE 0 END), 0) as total_pending
       FROM invoices
       WHERE supplier_id = $1`,
      [supplierId]
    );

    return result.rows[0];
  }

  /**
   * Get comprehensive invoice statistics for a buyer
   * Tracks payables, pending approvals, and payment history
   * Used for buyer financial management and budget tracking
   * @async
   * @param {string} buyerId - The ID of the buyer
   * @returns {Promise<Object>} Statistics object with:
   *   - total_invoices: Total number of invoices received
   *   - pending_review: Count of invoices awaiting approval
   *   - approved_pending_payment: Count of approved invoices not yet paid
   *   - paid_invoices: Count of fully paid invoices
   *   - total_paid: Total amount paid to suppliers
   *   - total_outstanding: Total amount owed (pending + approved invoices)
   * @throws {Error} If database query fails
   * @example
   * const stats = await getBuyerInvoiceStats('buyer-456');
   * console.log(`Outstanding payables: ${stats.total_outstanding} TND`);
   */
  async getBuyerInvoiceStats(buyerId) {
    const pool = getPool();

    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_invoices,
        COUNT(CASE WHEN status = 'submitted' THEN 1 END) as pending_review,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_pending_payment,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_invoices,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END), 0) as total_paid,
        COALESCE(SUM(CASE WHEN status IN ('submitted', 'approved') THEN total_amount ELSE 0 END), 0) as total_outstanding
       FROM invoices
       WHERE buyer_id = $1`,
      [buyerId]
    );

    return result.rows[0];
  }
}

module.exports = new InvoiceService();
