const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const { validateIdMiddleware } = require('../middleware/validateIdMiddleware');
const { asyncHandler } = require('../middleware/errorHandlingMiddleware');
const ResponseFormatter = require('../utils/responseFormatter');

const router = express.Router();

/**
 * @route   GET /api/direct-supply/suppliers
 * @desc    Récupérer tous les fournisseurs actifs et vérifiés
 * @access  Privé (Acheteurs)
 */
router.get(
  '/suppliers',
  verifyToken,
  asyncHandler(async (req, res) => {
    const db = req.app.get('db');

    const result = await db.query(`
      SELECT 
        u.id,
        u.company_name,
        u.phone,
        u.average_rating,
        u.preferred_categories,
        u.service_locations,
        up.bio,
        up.city
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.role = 'supplier' AND u.is_active = true AND u.is_verified = true
      ORDER BY u.average_rating DESC
      LIMIT 100
    `);

    return res.json(ResponseFormatter.success(result.rows, 'Fournisseurs récupérés avec succès'));
  })
);

/**
 * @route   POST /api/direct-supply/create-request
 * @desc    Créer une demande d'achat direct
 * @access  Privé (Acheteurs uniquement)
 */
router.post(
  '/create-request',
  verifyToken,
  asyncHandler(async (req, res) => {
    // Vérification du rôle
    if (req.user.role !== 'buyer') {
      return res.status(403).json(
        ResponseFormatter.error('Seuls les acheteurs peuvent créer des demandes', 'FORBIDDEN', 403)
      );
    }

    const { supplier_id, title, description, category, quantity, unit, budget, notes } = req.body;
    const buyer_id = req.user.id;

    // Validation complète
    const errors = [];
    
    if (!supplier_id) errors.push({ field: 'supplier_id', message: 'Le fournisseur est requis' });
    if (!title) errors.push({ field: 'title', message: 'Le titre est requis' });
    else if (title.length < 3 || title.length > 255) {
      errors.push({ field: 'title', message: 'Le titre doit contenir entre 3 et 255 caractères' });
    }
    if (!category) errors.push({ field: 'category', message: 'La catégorie est requise' });
    if (!budget) errors.push({ field: 'budget', message: 'Le budget est requis' });
    else if (budget <= 0) errors.push({ field: 'budget', message: 'Le budget doit être supérieur à 0' });
    if (quantity && quantity <= 0) {
      errors.push({ field: 'quantity', message: 'La quantité doit être supérieure à 0' });
    }

    if (errors.length > 0) {
      return res.status(400).json(
        ResponseFormatter.error('Erreur de validation', 'VALIDATION_ERROR', 400)
      );
    }

    const db = req.app.get('db');

    // Vérifier si le fournisseur existe
    const supplierCheck = await db.query(
      'SELECT id FROM users WHERE id = $1 AND role = $2 AND is_active = true',
      [supplier_id, 'supplier']
    );

    if (supplierCheck.rows.length === 0) {
      return res.status(404).json(
        ResponseFormatter.error('Fournisseur introuvable', 'NOT_FOUND', 404)
      );
    }

    // Créer la demande
    const result = await db.query(
      `INSERT INTO purchase_requests (
        buyer_id, supplier_id, title, description, category, 
        quantity, unit, budget, notes, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
      RETURNING *`,
      [buyer_id, supplier_id, title, description, category, quantity || 1, unit || 'pièce', budget, notes]
    );

    // Créer une notification
    await db.query(
      `INSERT INTO notifications (
        user_id, type, title, message, related_entity_type, related_entity_id
      )
      VALUES ($1, 'supply_request', 'Nouvelle demande de fourniture', $2, 'supply_request', $3)`,
      [supplier_id, `Demande d'achat direct reçue: ${title}`, result.rows[0].id]
    );

    return res.status(201).json(
      ResponseFormatter.success(result.rows[0], 'Demande créée avec succès')
    );
  })
);

/**
 * @route   GET /api/direct-supply/my-requests
 * @desc    Récupérer mes demandes d'achat (acheteur)
 * @access  Privé (Acheteurs)
 */
router.get(
  '/my-requests',
  verifyToken,
  asyncHandler(async (req, res) => {
    const db = req.app.get('db');

    const result = await db.query(
      `SELECT 
        pr.*,
        u.company_name as supplier_name,
        u.phone as supplier_phone,
        u.average_rating as supplier_rating
      FROM purchase_requests pr
      LEFT JOIN users u ON pr.supplier_id = u.id
      WHERE pr.buyer_id = $1
      ORDER BY pr.created_at DESC`,
      [req.user.id]
    );

    return res.json(ResponseFormatter.success(result.rows, 'Demandes récupérées avec succès'));
  })
);

/**
 * @route   GET /api/direct-supply/received-requests
 * @desc    Récupérer les demandes reçues (fournisseur)
 * @access  Privé (Fournisseurs)
 */
router.get(
  '/received-requests',
  verifyToken,
  asyncHandler(async (req, res) => {
    const db = req.app.get('db');

    const result = await db.query(
      `SELECT 
        pr.*,
        u.company_name as buyer_company,
        u.full_name as buyer_name,
        u.phone as buyer_phone
      FROM purchase_requests pr
      LEFT JOIN users u ON pr.buyer_id = u.id
      WHERE pr.supplier_id = $1
      ORDER BY pr.created_at DESC`,
      [req.user.id]
    );

    return res.json(ResponseFormatter.success(result.rows, 'Demandes reçues récupérées avec succès'));
  })
);

/**
 * @route   PUT /api/direct-supply/:requestId/status
 * @desc    Mettre à jour le statut d'une demande (fournisseur)
 * @access  Privé (Fournisseurs)
 */
router.put(
  '/:requestId/status',
  validateIdMiddleware('requestId'),
  verifyToken,
  asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const { status } = req.body;

    // Validation du statut
    const validStatuses = ['pending', 'accepted', 'rejected', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json(
        ResponseFormatter.error('Statut invalide', 'VALIDATION_ERROR', 400)
      );
    }

    const db = req.app.get('db');

    // Vérifier l'existence de la demande
    const checkResult = await db.query(
      'SELECT * FROM purchase_requests WHERE id = $1',
      [requestId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json(
        ResponseFormatter.error('Demande introuvable', 'NOT_FOUND', 404)
      );
    }

    const request = checkResult.rows[0];
    if (request.supplier_id !== req.user.id) {
      return res.status(403).json(
        ResponseFormatter.error('Non autorisé', 'FORBIDDEN', 403)
      );
    }

    // Mettre à jour le statut
    const result = await db.query(
      `UPDATE purchase_requests 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, requestId]
    );

    return res.json(
      ResponseFormatter.success(result.rows[0], 'Statut mis à jour avec succès')
    );
  })
);

module.exports = router;