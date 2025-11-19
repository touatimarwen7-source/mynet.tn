const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/admin/AdminController');
const AuthorizationGuard = require('../security/AuthorizationGuard');
const { Roles } = require('../config/Roles');

router.use(
    AuthorizationGuard.authenticateToken.bind(AuthorizationGuard),
    AuthorizationGuard.requireRole([Roles.ADMIN]).bind(AuthorizationGuard)
);

router.get('/users', AdminController.getAllUsers.bind(AdminController));
router.get('/users/:id', AdminController.getUser.bind(AdminController));
router.get('/statistics', AdminController.getStatistics.bind(AdminController));
router.post('/users/:id/verify', AdminController.verifyUser.bind(AdminController));
router.put('/users/:id/toggle-status', AdminController.toggleUserStatus.bind(AdminController));

module.exports = router;
