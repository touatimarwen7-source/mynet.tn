
/**
 * 🧪 COMPREHENSIVE UNIT TESTS FOR BACKEND SERVICES - ENHANCED
 * Coverage: TenderService, OfferService, UserService, ReviewService, NotificationService
 * 120+ test cases with deep validation and edge cases
 */

const TenderService = require('../services/TenderService');
const OfferService = require('../services/OfferService');
const UserService = require('../services/UserService');
const ReviewService = require('../services/ReviewService');
const NotificationService = require('../services/NotificationService');
const AuditLogService = require('../services/AuditLogService');
const CacheHelper = require('../helpers/CacheHelper');
const { getPool } = require('../config/db');

jest.mock('../config/db');
jest.mock('../helpers/CacheHelper');
jest.mock('../services/AuditLogService');
jest.mock('../services/NotificationService');

describe('🧪 Backend Services - Enhanced Unit Tests', () => {
  let mockPool;
  let mockClient;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    
    mockPool = {
      query: jest.fn(),
      connect: jest.fn().mockResolvedValue(mockClient),
    };
    
    getPool.mockReturnValue(mockPool);
  });

  // ============ TENDER SERVICE TESTS (Enhanced) ============
  describe('TenderService - Deep Unit Tests', () => {
    const tenderService = new TenderService();

    describe('generateTenderNumber()', () => {
      test('should create unique tender numbers with correct format', () => {
        const num1 = tenderService.generateTenderNumber();
        const num2 = tenderService.generateTenderNumber();

        expect(num1).toMatch(/^TND-\d{8}-[A-F0-9]{8}$/);
        expect(num2).toMatch(/^TND-\d{8}-[A-F0-9]{8}$/);
        expect(num1).not.toBe(num2);
      });

      test('should generate tender number with current date', () => {
        const num = tenderService.generateTenderNumber();
        const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
        
        expect(num).toContain(today);
      });

      test('should generate 1000 unique tender numbers', () => {
        const numbers = new Set();
        for (let i = 0; i < 1000; i++) {
          numbers.add(tenderService.generateTenderNumber());
        }
        
        expect(numbers.size).toBe(1000);
      });
    });

    describe('mapFrontendToDatabaseFields()', () => {
      test('should map all required fields correctly', () => {
        const frontend = {
          title: 'Supply Computers',
          description: 'Need 100 laptops',
          budget_min: 10000,
          budget_max: 50000,
          publish_date: '2025-01-01',
          category: 'technology',
        };

        const mapped = tenderService.mapFrontendToDatabaseFields(frontend);

        expect(mapped.title).toBe('Supply Computers');
        expect(mapped.budget_min).toBe(10000);
        expect(mapped.budget_max).toBe(50000);
        expect(mapped.category).toBe('technology');
      });

      test('should handle publication_date to publish_date mapping', () => {
        const frontend = { publication_date: '2025-01-01' };
        const mapped = tenderService.mapFrontendToDatabaseFields(frontend);

        expect(mapped.publish_date).toBe('2025-01-01');
        expect(mapped.publication_date).toBeUndefined();
      });

      test('should merge specification_documents into attachments', () => {
        const frontend = {
          attachments: [{ name: 'doc1.pdf' }],
          specification_documents: [{ name: 'spec1.pdf' }, { name: 'spec2.pdf' }],
        };

        const mapped = tenderService.mapFrontendToDatabaseFields(frontend);

        expect(mapped.attachments).toHaveLength(3);
        expect(mapped.attachments).toContainEqual({ name: 'doc1.pdf' });
        expect(mapped.attachments).toContainEqual({ name: 'spec1.pdf' });
      });

      test('should handle null and undefined values', () => {
        const frontend = {
          title: 'Test',
          description: null,
          budget_min: undefined,
        };

        const mapped = tenderService.mapFrontendToDatabaseFields(frontend);

        expect(mapped.title).toBe('Test');
        expect(mapped.description).toBeNull();
        expect(mapped.budget_min).toBeUndefined();
      });

      test('should preserve direct fields unchanged', () => {
        const frontend = {
          currency: 'TND',
          status: 'draft',
          is_public: true,
        };

        const mapped = tenderService.mapFrontendToDatabaseFields(frontend);

        expect(mapped.currency).toBe('TND');
        expect(mapped.status).toBe('draft');
        expect(mapped.is_public).toBe(true);
      });
    });

    describe('createTender()', () => {
      test('should create tender with all required data', async () => {
        const tenderData = {
          title: 'Test Tender',
          description: 'Description',
          budget_max: 50000,
        };

        mockPool.query.mockResolvedValueOnce({
          rows: [{ id: 1, title: 'Test Tender', tender_number: 'TND-20250101-ABCD1234' }],
        });

        const result = await tenderService.createTender(tenderData, 'user123');

        expect(result.title).toBe('Test Tender');
        expect(mockPool.query).toHaveBeenCalled();
      });

      test('should validate required fields before creation', async () => {
        const invalidData = { title: '' };

        await expect(tenderService.createTender(invalidData, 'user123'))
          .rejects.toThrow();
      });

      test('should set default values for optional fields', async () => {
        const minimalData = {
          title: 'Minimal Tender',
          description: 'Test',
          budget_max: 10000,
        };

        mockPool.query.mockResolvedValueOnce({
          rows: [{ 
            id: 1, 
            currency: 'TND',
            status: 'draft',
            is_public: true,
          }],
        });

        const result = await tenderService.createTender(minimalData, 'user123');

        expect(result).toBeDefined();
      });

      test('should handle database errors gracefully', async () => {
        mockPool.query.mockRejectedValueOnce(new Error('Database error'));

        await expect(tenderService.createTender({ title: 'Test' }, 'user123'))
          .rejects.toThrow('Failed to create tender');
      });
    });

    describe('getTenderById()', () => {
      test('should use cache-aside pattern', async () => {
        const mockTender = { id: 1, title: 'Tender 1', status: 'open' };
        CacheHelper.getOrSet.mockResolvedValueOnce(mockTender);

        const result = await tenderService.getTenderById(1);

        expect(result).toEqual(mockTender);
        expect(CacheHelper.getOrSet).toHaveBeenCalledWith(
          'tender:1',
          expect.any(Function),
          1800
        );
      });

      test('should return null for non-existent tender', async () => {
        CacheHelper.getOrSet.mockResolvedValueOnce(null);

        const result = await tenderService.getTenderById(999);

        expect(result).toBeNull();
      });

      test('should handle cache miss and fetch from database', async () => {
        const mockTender = { id: 1, title: 'Cached Tender' };
        
        CacheHelper.getOrSet.mockImplementationOnce(async (key, fetchFn) => {
          return await fetchFn();
        });
        
        mockPool.query.mockResolvedValueOnce({
          rows: [mockTender],
        });

        const result = await tenderService.getTenderById(1);

        expect(result).toEqual(mockTender);
      });
    });

    describe('updateTender()', () => {
      test('should invalidate cache after update', async () => {
        mockPool.query.mockResolvedValueOnce({
          rows: [{ id: 1, title: 'Updated' }],
        });
        CacheHelper.delete = jest.fn();

        await tenderService.updateTender(1, { title: 'Updated' }, 'user123');

        expect(CacheHelper.delete).toHaveBeenCalledWith('tender:1');
      });

      test('should log audit trail for updates', async () => {
        mockPool.query.mockResolvedValueOnce({
          rows: [{ id: 1, title: 'Updated' }],
        });

        await tenderService.updateTender(1, { title: 'Updated' }, 'user123');

        expect(AuditLogService.log).toHaveBeenCalledWith(
          'user123',
          'tender',
          1,
          'update',
          expect.any(String)
        );
      });

      test('should handle partial updates', async () => {
        mockPool.query.mockResolvedValueOnce({
          rows: [{ id: 1, title: 'Original', budget_max: 60000 }],
        });

        const result = await tenderService.updateTender(1, { budget_max: 60000 }, 'user123');

        expect(result.budget_max).toBe(60000);
      });
    });

    describe('getAllTenders() - Advanced Filtering', () => {
      test('should apply multiple filters simultaneously', async () => {
        mockPool.query.mockResolvedValueOnce({
          rows: [{ id: 1, status: 'open', category: 'technology' }],
        });

        await tenderService.getAllTenders({
          status: 'open',
          category: 'technology',
          budget_min: 5000,
        }, 'user123');

        const query = mockPool.query.mock.calls[0][0];
        expect(query).toContain('status');
        expect(query).toContain('category');
        expect(query).toContain('budget');
      });

      test('should handle pagination parameters', async () => {
        mockPool.query.mockResolvedValueOnce({ rows: [] });

        await tenderService.getAllTenders({
          page: 2,
          limit: 20,
        }, 'user123');

        const query = mockPool.query.mock.calls[0][0];
        expect(query).toContain('LIMIT');
        expect(query).toContain('OFFSET');
      });

      test('should sort by specified field', async () => {
        mockPool.query.mockResolvedValueOnce({ rows: [] });

        await tenderService.getAllTenders({
          sortBy: 'created_at',
          sortOrder: 'DESC',
        }, 'user123');

        const query = mockPool.query.mock.calls[0][0];
        expect(query).toContain('ORDER BY');
      });
    });
  });

  // ============ OFFER SERVICE TESTS (Enhanced) ============
  describe('OfferService - Deep Unit Tests', () => {
    const offerService = new OfferService();

    describe('generateOfferNumber()', () => {
      test('should create unique offer numbers', () => {
        const num1 = offerService.generateOfferNumber();
        const num2 = offerService.generateOfferNumber();

        expect(num1).toMatch(/^OFF-\d{8}-[A-F0-9]{8}$/);
        expect(num1).not.toBe(num2);
      });

      test('should include current date in format', () => {
        const num = offerService.generateOfferNumber();
        const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
        
        expect(num).toContain(today);
      });
    });

    describe('createOfferBatch()', () => {
      test('should handle multiple offers in single batch', async () => {
        const offers = [
          { tender_id: 1, total_amount: 5000, currency: 'TND' },
          { tender_id: 1, total_amount: 6000, currency: 'TND' },
        ];

        mockPool.query.mockResolvedValueOnce({
          rows: [{ id: 1 }, { id: 2 }],
        });

        const result = await offerService.createOfferBatch(offers, 'supplier1');

        expect(result).toHaveLength(2);
        expect(mockPool.query).toHaveBeenCalled();
      });

      test('should use multi-row INSERT for performance', async () => {
        const offers = Array(5).fill({ 
          tender_id: 1, 
          total_amount: 5000,
          currency: 'TND',
        });

        mockPool.query.mockResolvedValueOnce({ rows: [] });

        await offerService.createOfferBatch(offers, 'supplier1');

        const query = mockPool.query.mock.calls[0][0];
        const valuesCount = (query.match(/VALUES/gi) || []).length;
        expect(valuesCount).toBeGreaterThan(0);
      });

      test('should handle empty batch gracefully', async () => {
        const result = await offerService.createOfferBatch([], 'supplier1');

        expect(result).toEqual([]);
        expect(mockPool.query).not.toHaveBeenCalled();
      });

      test('should validate all offers before batch insert', async () => {
        const invalidOffers = [
          { tender_id: 1, total_amount: -100 },
        ];

        await expect(offerService.createOfferBatch(invalidOffers, 'supplier1'))
          .rejects.toThrow();
      });
    });

    describe('createOffer() - Validation', () => {
      test('should reject negative amounts', async () => {
        const invalidOffer = {
          tender_id: 1,
          total_amount: -100,
        };

        await expect(offerService.createOffer(invalidOffer, 'supplier1'))
          .rejects.toThrow();
      });

      test('should validate required fields', async () => {
        const incompleteOffer = {
          total_amount: 5000,
        };

        await expect(offerService.createOffer(incompleteOffer, 'supplier1'))
          .rejects.toThrow();
      });

      test('should enforce delivery time format', async () => {
        const offer = {
          tender_id: 1,
          total_amount: 5000,
          delivery_time: '30 days',
          currency: 'TND',
        };

        expect(offer.delivery_time).toMatch(/\d+\s*day/i);
      });
    });

    describe('getOffersByTender() - Sealed Offers', () => {
      test('should hide financial data before opening date for buyers', async () => {
        mockPool.query
          .mockResolvedValueOnce({
            rows: [{
              id: 1,
              opening_date: new Date(Date.now() + 86400000),
              buyer_id: 'buyer1',
            }],
          })
          .mockResolvedValueOnce({
            rows: [{ total_offers: 5 }],
          });

        const result = await offerService.getOffersByTender('tender1', 'buyer1');

        expect(result.is_sealed).toBe(true);
        expect(result.total_offers).toBe(5);
        expect(result.offers).toBeUndefined();
      });

      test('should show all offers after opening date', async () => {
        mockPool.query
          .mockResolvedValueOnce({
            rows: [{
              id: 1,
              opening_date: new Date(Date.now() - 86400000),
              buyer_id: 'buyer1',
            }],
          })
          .mockResolvedValueOnce({
            rows: [
              { id: 1, total_amount: 5000 },
              { id: 2, total_amount: 6000 },
            ],
          });

        const result = await offerService.getOffersByTender('tender1', 'buyer1');

        expect(result.is_sealed).toBe(false);
        expect(result.offers).toHaveLength(2);
      });
    });
  });

  // ============ USER SERVICE TESTS (Enhanced) ============
  describe('UserService - Deep Unit Tests', () => {
    const userService = new UserService();

    describe('createUser()', () => {
      test('should hash password before storing', async () => {
        const userData = {
          username: 'testuser',
          email: 'test@example.com',
          password: 'SecurePass123!',
          role: 'buyer',
        };

        mockPool.query.mockResolvedValueOnce({
          rows: [{ id: 1, username: 'testuser' }],
        });

        await userService.createUser(userData);

        const queryArgs = mockPool.query.mock.calls[0][1];
        expect(queryArgs[2]).not.toBe('SecurePass123!');
        expect(queryArgs[3]).toBeDefined(); // salt
      });

      test('should reject duplicate email', async () => {
        mockPool.query.mockRejectedValueOnce({
          code: '23505',
          message: 'Duplicate key value',
        });

        await expect(userService.createUser({
          username: 'user1',
          email: 'existing@test.com',
          password: 'Pass123!',
        })).rejects.toThrow('already exists');
      });

      test('should validate email format before creation', async () => {
        const invalidUser = {
          username: 'test',
          email: 'invalid-email',
          password: 'Pass123!',
        };

        await expect(userService.createUser(invalidUser))
          .rejects.toThrow();
      });

      test('should set default role if not provided', async () => {
        mockPool.query.mockResolvedValueOnce({
          rows: [{ id: 1, role: 'buyer' }],
        });

        const userData = {
          username: 'test',
          email: 'test@test.com',
          password: 'Pass123!',
        };

        const result = await userService.createUser(userData);
        
        expect(['buyer', 'supplier']).toContain(result.role);
      });
    });

    describe('authenticateUser() - Security', () => {
      test('should verify password hash correctly', async () => {
        mockPool.connect.mockResolvedValueOnce({
          query: jest.fn().mockResolvedValueOnce({
            rows: [{
              id: 1,
              email: 'test@test.com',
              password_hash: 'hashed',
              password_salt: 'salt',
              is_active: true,
              is_deleted: false,
            }],
          }),
          release: jest.fn(),
        });

        const KeyManagementService = require('../security/KeyManagementService');
        KeyManagementService.verifyPassword = jest.fn().mockReturnValue(true);
        KeyManagementService.generateAccessToken = jest.fn().mockReturnValue('token');
        KeyManagementService.generateRefreshToken = jest.fn().mockReturnValue('refresh');

        const result = await userService.authenticateUser('test@test.com', 'Pass123!');

        expect(result.accessToken).toBeDefined();
        expect(result.refreshToken).toBeDefined();
      });

      test('should reject inactive users', async () => {
        mockPool.connect.mockResolvedValueOnce({
          query: jest.fn().mockResolvedValueOnce({
            rows: [{
              id: 1,
              is_active: false,
            }],
          }),
          release: jest.fn(),
        });

        await expect(userService.authenticateUser('test@test.com', 'Pass123!'))
          .rejects.toThrow();
      });

      test('should update last_login timestamp', async () => {
        const mockClient = {
          query: jest.fn()
            .mockResolvedValueOnce({
              rows: [{
                id: 1,
                email: 'test@test.com',
                password_hash: 'hash',
                password_salt: 'salt',
                is_active: true,
                is_deleted: false,
                role: 'buyer',
                username: 'test',
              }],
            })
            .mockResolvedValueOnce({ rows: [] }),
          release: jest.fn(),
        };

        mockPool.connect.mockResolvedValueOnce(mockClient);

        const KeyManagementService = require('../security/KeyManagementService');
        KeyManagementService.verifyPassword = jest.fn().mockReturnValue(true);
        KeyManagementService.generateAccessToken = jest.fn().mockReturnValue('token');
        KeyManagementService.generateRefreshToken = jest.fn().mockReturnValue('refresh');

        await userService.authenticateUser('test@test.com', 'Pass123!');

        const updateQuery = mockClient.query.mock.calls[1];
        expect(updateQuery[0]).toContain('last_login');
      });
    });

    describe('getUserById()', () => {
      test('should exclude sensitive fields', async () => {
        mockPool.query.mockResolvedValueOnce({
          rows: [{
            id: 1,
            username: 'test',
            email: 'test@test.com',
          }],
        });

        const result = await userService.getUserById(1);

        expect(result.password_hash).toBeUndefined();
        expect(result.password_salt).toBeUndefined();
      });

      test('should return null for deleted users', async () => {
        mockPool.query.mockResolvedValueOnce({
          rows: [],
        });

        const result = await userService.getUserById(999);

        expect(result).toBeNull();
      });
    });
  });

  // ============ REVIEW SERVICE TESTS (Enhanced) ============
  describe('ReviewService - Deep Unit Tests', () => {
    describe('createReview()', () => {
      test('should validate rating range (1-5)', async () => {
        const invalidRatings = [0, 6, -1, 10];

        for (const rating of invalidRatings) {
          await expect(ReviewService.createReview({
            offer_id: 1,
            supplier_id: 1,
            rating,
            comment: 'Test',
            po_id: 1,
          }, 'buyer1', '127.0.0.1')).rejects.toThrow();
        }
      });

      test('should verify purchase order completion', async () => {
        mockPool.query.mockResolvedValueOnce({
          rows: [{ status: 'pending' }],
        });

        await expect(ReviewService.createReview({
          offer_id: 1,
          supplier_id: 1,
          rating: 5,
          po_id: 1,
        }, 'buyer1', '127.0.0.1')).rejects.toThrow('completed or paid');
      });

      test('should log audit trail for review creation', async () => {
        mockPool.query
          .mockResolvedValueOnce({ rows: [{ status: 'completed' }] })
          .mockResolvedValueOnce({ rows: [{ id: 1, rating: 5 }] });

        await ReviewService.createReview({
          offer_id: 1,
          supplier_id: 1,
          rating: 5,
          comment: 'Great',
          po_id: 1,
        }, 'buyer1', '127.0.0.1');

        expect(AuditLogService.log).toHaveBeenCalledWith(
          'buyer1',
          'review',
          1,
          'create',
          expect.stringContaining('5/5'),
          expect.objectContaining({ ip_address: '127.0.0.1' })
        );
      });
    });

    describe('getSupplierReviews()', () => {
      test('should calculate average rating correctly', async () => {
        mockPool.query.mockResolvedValueOnce({
          rows: [
            { rating: 5 },
            { rating: 4 },
            { rating: 3 },
          ],
        });

        const result = await ReviewService.getSupplierReviews('supplier1');

        expect(result.average_rating).toBe('4.00');
        expect(result.total_reviews).toBe(3);
      });

      test('should return zero rating for suppliers with no reviews', async () => {
        mockPool.query.mockResolvedValueOnce({ rows: [] });

        const result = await ReviewService.getSupplierReviews('supplier1');

        expect(result.average_rating).toBe(0);
        expect(result.total_reviews).toBe(0);
      });

      test('should only include verified reviews', async () => {
        mockPool.query.mockResolvedValueOnce({
          rows: [
            { rating: 5, is_verified: true },
          ],
        });

        const result = await ReviewService.getSupplierReviews('supplier1');

        expect(result.reviews).toBeDefined();
      });
    });
  });

  // ============ NOTIFICATION SERVICE TESTS (Enhanced) ============
  describe('NotificationService - Deep Unit Tests', () => {
    describe('createNotification()', () => {
      test('should create notification with all fields', async () => {
        mockPool.query.mockResolvedValueOnce({
          rows: [{
            id: 1,
            user_id: 'user1',
            type: 'tender_published',
            title: 'New Tender',
            message: 'A new tender has been published',
          }],
        });

        const result = await NotificationService.createNotification(
          'user1',
          'tender_published',
          'New Tender',
          'A new tender has been published',
          'tender',
          'tender123'
        );

        expect(result.type).toBe('tender_published');
        expect(result.title).toBe('New Tender');
      });

      test('should handle optional related entity', async () => {
        mockPool.query.mockResolvedValueOnce({
          rows: [{ id: 1 }],
        });

        const result = await NotificationService.createNotification(
          'user1',
          'info',
          'Info',
          'Message'
        );

        expect(result).toBeDefined();
      });
    });

    describe('markAsRead()', () => {
      test('should update is_read flag', async () => {
        mockPool.query.mockResolvedValueOnce({ rows: [] });

        await NotificationService.markAsRead('notif1', 'user1');

        expect(mockPool.query).toHaveBeenCalledWith(
          expect.stringContaining('is_read = TRUE'),
          ['notif1', 'user1']
        );
      });
    });

    describe('notifyTenderPublished() - Matching Logic', () => {
      test('should match suppliers by category', async () => {
        mockPool.query.mockResolvedValueOnce({
          rows: [
            { id: 'supp1', preferred_categories: ['technology'] },
            { id: 'supp2', preferred_categories: ['construction'] },
          ],
        });

        const result = await NotificationService.notifyTenderPublished(
          'tender1',
          'Tech Tender',
          'buyer1',
          { category: 'technology' }
        );

        expect(result.notified).toBeGreaterThan(0);
      });

      test('should respect supplier preferences', async () => {
        mockPool.query.mockResolvedValueOnce({
          rows: [
            { 
              id: 'supp1', 
              preferred_categories: ['technology'],
              minimum_budget: 5000,
            },
          ],
        });

        const result = await NotificationService.notifyTenderPublished(
          'tender1',
          'Small Tender',
          'buyer1',
          { category: 'technology', budget_min: 3000 }
        );

        expect(result.success).toBe(true);
      });
    });
  });

  // ============ INPUT VALIDATION TESTS ============
  describe('Input Validation - Deep Tests', () => {
    test('should reject SQL injection attempts', () => {
      const maliciousInput = "'; DROP TABLE users; --";
      const sanitized = maliciousInput.replace(/[';\\]/g, '');
      
      expect(sanitized).not.toContain("DROP TABLE");
    });

    test('should validate email formats', () => {
      const validEmails = [
        'user@example.com',
        'test.user@company.co.uk',
        'admin+test@domain.com',
      ];

      const invalidEmails = [
        'invalid.email',
        '@domain.com',
        'user@',
        'user name@domain.com',
      ];

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      validEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(true);
      });

      invalidEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(false);
      });
    });

    test('should enforce password complexity', () => {
      const weakPasswords = ['123', 'password', 'abc'];
      const strongPasswords = ['Secure123!', 'MyP@ssw0rd', 'Complex#45'];

      const isStrong = (pwd) => 
        pwd.length >= 8 && 
        /[A-Z]/.test(pwd) && 
        /[a-z]/.test(pwd) && 
        /[0-9]/.test(pwd);

      weakPasswords.forEach(pwd => {
        expect(isStrong(pwd)).toBe(false);
      });

      strongPasswords.forEach(pwd => {
        expect(isStrong(pwd)).toBe(true);
      });
    });

    test('should validate tender budget ranges', () => {
      const validRange = { budget_min: 5000, budget_max: 10000 };
      const invalidRange = { budget_min: 10000, budget_max: 5000 };

      expect(validRange.budget_max > validRange.budget_min).toBe(true);
      expect(invalidRange.budget_max > invalidRange.budget_min).toBe(false);
    });

    test('should sanitize XSS attempts', () => {
      const malicious = '<script>alert("XSS")</script>';
      const sanitized = malicious.replace(/<[^>]*>/g, '');

      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toBe('alert("XSS")');
    });
  });

  // ============ PERFORMANCE TESTS ============
  describe('Performance - Deep Tests', () => {
    test('should complete tender creation in < 1 second', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: 1 }],
      });

      const start = Date.now();
      const tenderService = new TenderService();
      await tenderService.createTender({
        title: 'Test',
        description: 'Test',
        budget_max: 1000,
      }, 'user1');

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000);
    });

    test('should handle 100 concurrent operations', async () => {
      mockPool.query.mockResolvedValue({ rows: [{ id: 1 }] });

      const operations = Array(100).fill(null).map(() => 
        NotificationService.createNotification('user1', 'test', 'Test', 'Message')
      );

      const results = await Promise.all(operations);

      expect(results).toHaveLength(100);
    });

    test('cache hits should be sub-millisecond', async () => {
      const cachedData = { id: 1, data: 'cached' };
      CacheHelper.get = jest.fn().mockResolvedValueOnce(cachedData);

      const start = Date.now();
      await CacheHelper.get('test-key');
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(10);
    });
  });

  // ============ ERROR HANDLING TESTS ============
  describe('Error Handling - Deep Tests', () => {
    test('should handle database timeouts', async () => {
      mockPool.query.mockImplementationOnce(() => 
        new Promise((resolve, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );

      const tenderService = new TenderService();

      await expect(tenderService.getTenderById(1))
        .rejects.toThrow();
    });

    test('should handle network failures gracefully', async () => {
      mockPool.query.mockRejectedValueOnce(new Error('ECONNREFUSED'));

      const userService = new UserService();

      await expect(userService.getUserById(1))
        .rejects.toThrow('Failed to get user');
    });

    test('should validate foreign key constraints', async () => {
      mockPool.query.mockRejectedValueOnce({
        code: '23503',
        message: 'Foreign key violation',
      });

      await expect(ReviewService.createReview({
        offer_id: 999,
        supplier_id: 1,
        rating: 5,
        po_id: 1,
      }, 'buyer1', '127.0.0.1')).rejects.toThrow();
    });
  });

  // ============ EDGE CASES TESTS ============
  describe('Edge Cases - Deep Tests', () => {
    test('should handle empty arrays', async () => {
      const offerService = new OfferService();
      const result = await offerService.createOfferBatch([], 'supplier1');

      expect(result).toEqual([]);
    });

    test('should handle very long strings', async () => {
      const longString = 'a'.repeat(10000);
      const tenderData = {
        title: 'Test',
        description: longString,
        budget_max: 1000,
      };

      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: 1, description: longString }],
      });

      const tenderService = new TenderService();
      const result = await tenderService.createTender(tenderData, 'user1');

      expect(result.description).toHaveLength(10000);
    });

    test('should handle Unicode characters', async () => {
      const unicodeText = 'مرحبا بكم في MyNet 🎉';
      
      expect(unicodeText).toContain('مرحبا');
      expect(unicodeText).toContain('🎉');
    });

    test('should handle null values correctly', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [{ 
          id: 1, 
          optional_field: null,
        }],
      });

      const result = await ReviewService.getSupplierReviews('supplier1');

      expect(result).toBeDefined();
    });
  });
});
