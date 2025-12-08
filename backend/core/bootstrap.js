
/**
 * 🚀 APPLICATION BOOTSTRAP
 * Initialize DI Container and Modules
 */

const { container } = require('./Container');
const { eventBus } = require('./EventBus');
const { logger } = require('../utils/logger');

// Modules
const AuthModule = require('../modules/auth/AuthModule');
const ProcurementModule = require('../modules/procurement/ProcurementModule');
const NotificationModule = require('../modules/notifications/NotificationModule');
const AdminModule = require('../modules/admin/AdminModule');

/**
 * Bootstrap the application
 */
async function bootstrap() {
  try {
    logger.info('🚀 Bootstrapping application...');

    // Register core services
    container.singleton('eventBus', () => eventBus);
    
    container.singleton('jwtService', () => ({
      generateToken: (user) => 'jwt-token',
      verifyToken: (token) => ({ userId: 1 }),
    }));

    container.singleton('emailService', () => ({
      send: async (params) => {
        logger.info('Email sent', params);
        return true;
      },
    }));

    container.singleton('notificationService', () => ({
      send: async (params) => {
        logger.info('Notification sent', params);
        return true;
      },
    }));

    // Register modules
    container.singleton('authModule', (c) => new AuthModule({
      jwtService: c.resolve('jwtService'),
      eventBus: c.resolve('eventBus'),
    }));

    container.singleton('procurementModule', (c) => new ProcurementModule({
      eventBus: c.resolve('eventBus'),
      notificationService: c.resolve('notificationService'),
    }));

    container.singleton('notificationModule', (c) => new NotificationModule({
      emailService: c.resolve('emailService'),
      eventBus: c.resolve('eventBus'),
    }));

    container.singleton('auditService', () => ({
      log: async (params) => {
        logger.info('Audit log', params);
        return true;
      },
    }));

    container.singleton('adminModule', (c) => new AdminModule({
      eventBus: c.resolve('eventBus'),
      auditService: c.resolve('auditService'),
    }));

    // Register AdminController
    const AdminController = require('../controllers/admin/AdminController');
    container.singleton('adminController', () => new AdminController());

    logger.info('✅ Application bootstrapped successfully');
    logger.info('📦 Registered modules: Auth, Procurement, Notification, Admin');
    
    return container;
  } catch (error) {
    logger.error('❌ Bootstrap failed', { error });
    throw error;
  }
}

module.exports = { bootstrap };
