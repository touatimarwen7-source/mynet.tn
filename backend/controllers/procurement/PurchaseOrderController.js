
const PurchaseOrderService = require('../../services/PurchaseOrderService');
const { sendErrorResponse, sendSuccessResponse } = require('../../utils/errorHandler');
const { logger } = require('../../utils/logger');

/**
 * Purchase Order Controller
 * Manages purchase orders sent from buyers to winning suppliers
 */
class PurchaseOrderController {
  /**
   * Create a purchase order for winning supplier(s)
   * @route POST /procurement/purchase-orders
   */
  async createPurchaseOrder(req, res) {
    try {
      const buyerId = req.user.id;
      const purchaseOrderData = {
        ...req.body,
        buyer_id: buyerId,
      };

      const purchaseOrder = await PurchaseOrderService.createPurchaseOrder(purchaseOrderData);

      return sendSuccessResponse(res, purchaseOrder, 201, 'Bon de commande créé et envoyé avec succès');
    } catch (error) {
      logger.error('Error creating purchase order:', error);
      return sendErrorResponse(res, error, 400);
    }
  }

  /**
   * Get purchase order by ID
   * @route GET /procurement/purchase-orders/:id
   */
  async getPurchaseOrder(req, res) {
    try {
      const { id } = req.params;
      const purchaseOrder = await PurchaseOrderService.getPurchaseOrderById(id, req.user.id);

      if (!purchaseOrder) {
        return sendErrorResponse(res, 'Bon de commande introuvable', 404);
      }

      return sendSuccessResponse(res, purchaseOrder, 200, 'Bon de commande récupéré avec succès');
    } catch (error) {
      logger.error('Error fetching purchase order:', error);
      return sendErrorResponse(res, error, 500);
    }
  }

  /**
   * Get all purchase orders for current buyer
   * @route GET /procurement/my-purchase-orders
   */
  async getMyPurchaseOrders(req, res) {
    try {
      const buyerId = req.user.id;
      const purchaseOrders = await PurchaseOrderService.getPurchaseOrdersByBuyer(buyerId);

      return sendSuccessResponse(res, { 
        orders: purchaseOrders,
        count: purchaseOrders.length 
      }, 200, 'Bons de commande récupérés avec succès');
    } catch (error) {
      logger.error('Error fetching buyer purchase orders:', error);
      return sendErrorResponse(res, error, 500);
    }
  }

  /**
   * Get all purchase orders received by supplier
   * @route GET /procurement/received-purchase-orders
   */
  async getReceivedPurchaseOrders(req, res) {
    try {
      const supplierId = req.user.id;
      const purchaseOrders = await PurchaseOrderService.getPurchaseOrdersBySupplier(supplierId);

      return sendSuccessResponse(res, { 
        orders: purchaseOrders,
        count: purchaseOrders.length 
      }, 200, 'Commandes reçues récupérées avec succès');
    } catch (error) {
      logger.error('Error fetching supplier purchase orders:', error);
      return sendErrorResponse(res, error, 500);
    }
  }

  /**
   * Update purchase order status
   * @route PUT /procurement/purchase-orders/:id/status
   */
  async updatePurchaseOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const updatedPO = await PurchaseOrderService.updatePurchaseOrderStatus(
        id,
        status,
        req.user.id
      );

      return sendSuccessResponse(res, updatedPO, 200, 'Statut du bon de commande mis à jour avec succès');
    } catch (error) {
      logger.error('Error updating purchase order status:', error);
      return sendErrorResponse(res, error, 400);
    }
  }
}

module.exports = new PurchaseOrderController();
