
const InvoiceService = require('../../services/InvoiceService');

class InvoiceController {
  async createInvoice(req, res, next) {
    try {
      const userId = req.user.id;
      const invoiceData = {
        ...req.body,
        supplier_id: userId
      };

      const invoice = await InvoiceService.createInvoice(invoiceData);
      
      res.status(201).json({
        success: true,
        message: 'Invoice created successfully',
        data: invoice
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyInvoices(req, res, next) {
    try {
      const userId = req.user.id;
      const invoices = await InvoiceService.getInvoicesBySupplier(userId);
      
      res.json({
        success: true,
        data: invoices
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsPaid(req, res, next) {
    try {
      const { id } = req.params;
      const { payment_date } = req.body;

      const invoice = await InvoiceService.markAsPaid(id, payment_date);
      
      res.json({
        success: true,
        message: 'Invoice marked as paid',
        data: invoice
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InvoiceController();
