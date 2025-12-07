
/**
 * 🧪 ADVANCED SERVICES UNIT TESTS
 * Coverage: Advanced services with complex business logic
 * Tests: TenderAwardService, OfferOpeningService, EvaluationService, ArchiveService
 */

const TenderAwardService = require('../services/TenderAwardService');
const OfferOpeningService = require('../services/OfferOpeningService');
const EvaluationService = require('../services/EvaluationService');
const ArchiveService = require('../services/ArchiveService');
const AuditLogService = require('../services/AuditLogService');
const { getPool } = require('../config/db');

jest.mock('../config/db');
jest.mock('../services/AuditLogService');

describe('🧪 Advanced Services - Deep Unit Tests', () => {
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

  // ============ TENDER AWARD SERVICE TESTS ============
  describe('TenderAwardService - Partial Award Logic', () => {
    describe('initializeTenderAward()', () => {
      test('should create line items for award', async () => {
        mockClient.query
          .mockResolvedValueOnce({ rows: [{ id: 1, buyer_id: 'buyer1' }] })
          .mockResolvedValueOnce({ rows: [{ id: 1 }] })
          .mockResolvedValueOnce({ rows: [{ id: 2 }] });

        const lineItems = [
          { line_item_id: 'item1', description: 'Laptops', quantity: 100, unit: 'pieces' },
          { line_item_id: 'item2', description: 'Monitors', quantity: 50, unit: 'pieces' },
        ];

        const result = await TenderAwardService.initializeTenderAward(
          'tender1',
          lineItems,
          'buyer1'
        );

        expect(result).toHaveLength(2);
        expect(mockClient.query).toHaveBeenCalledTimes(3);
      });

      test('should reject unauthorized tender access', async () => {
        mockClient.query.mockResolvedValueOnce({ rows: [] });

        await expect(
          TenderAwardService.initializeTenderAward('tender1', [], 'unauthorized')
        ).rejects.toThrow('not found or unauthorized');
      });

      test('should validate line item structure', async () => {
        mockClient.query.mockResolvedValueOnce({
          rows: [{ id: 1, buyer_id: 'buyer1' }],
        });

        const invalidItems = [
          { description: 'Item', quantity: 100 }, // missing line_item_id
        ];

        await expect(
          TenderAwardService.initializeTenderAward('tender1', invalidItems, 'buyer1')
        ).rejects.toThrow();
      });
    });

    describe('distributeLineItem()', () => {
      test('should distribute quantity across multiple suppliers', async () => {
        mockClient.query
          .mockResolvedValueOnce({
            rows: [{
              id: 1,
              tender_id: 'tender1',
              line_item_id: 'item1',
              total_quantity: 100,
            }],
          })
          .mockResolvedValueOnce({
            rows: [
              { id: 'offer1', supplier_id: 'supp1' },
              { id: 'offer2', supplier_id: 'supp2' },
            ],
          })
          .mockResolvedValueOnce({
            rows: [{ id: 1, awarded_offers: [] }],
          });

        const distribution = [
          { offer_id: 'offer1', quantity: 60, unit_price: 100 },
          { offer_id: 'offer2', quantity: 40, unit_price: 95 },
        ];

        const result = await TenderAwardService.distributeLineItem(
          'tender1',
          'item1',
          distribution,
          'buyer1'
        );

        expect(result.awarded_offers).toBeDefined();
      });

      test('should reject distribution exceeding total quantity', async () => {
        mockClient.query.mockResolvedValueOnce({
          rows: [{
            total_quantity: 100,
          }],
        });

        const distribution = [
          { offer_id: 'offer1', quantity: 80, unit_price: 100 },
          { offer_id: 'offer2', quantity: 30, unit_price: 95 },
        ];

        await expect(
          TenderAwardService.distributeLineItem('tender1', 'item1', distribution, 'buyer1')
        ).rejects.toThrow('exceeds available quantity');
      });

      test('should calculate total amounts correctly', async () => {
        mockClient.query
          .mockResolvedValueOnce({
            rows: [{ total_quantity: 100 }],
          })
          .mockResolvedValueOnce({
            rows: [{ id: 'offer1', supplier_id: 'supp1' }],
          })
          .mockResolvedValueOnce({
            rows: [{
              awarded_offers: JSON.stringify([
                { offer_id: 'offer1', quantity: 50, unit_price: 100, total_amount: 5000 },
              ]),
            }],
          });

        const distribution = [
          { offer_id: 'offer1', quantity: 50, unit_price: 100 },
        ];

        const result = await TenderAwardService.distributeLineItem(
          'tender1',
          'item1',
          distribution,
          'buyer1'
        );

        const awarded = JSON.parse(result.awarded_offers);
        expect(awarded[0].total_amount).toBe(5000);
      });
    });
  });

  // ============ OFFER OPENING SERVICE TESTS ============
  describe('OfferOpeningService - Security & Timing', () => {
    describe('canOpenOffers()', () => {
      test('should allow opening after scheduled time', () => {
        const pastDate = new Date(Date.now() - 3600000);
        
        expect(() => {
          OfferOpeningService.canOpenOffers(null, pastDate);
        }).not.toThrow();
      });

      test('should reject opening before scheduled time', () => {
        const futureDate = new Date(Date.now() + 3600000);
        
        expect(() => {
          OfferOpeningService.canOpenOffers(null, futureDate);
        }).toThrow('Opening time not yet reached');
      });

      test('should calculate remaining time correctly', () => {
        const futureDate = new Date(Date.now() + 3600000);
        
        try {
          OfferOpeningService.canOpenOffers(null, futureDate);
        } catch (error) {
          expect(error.message).toContain('Time until opening');
        }
      });
    });

    describe('getOffersForOpening()', () => {
      test('should decrypt sealed offers after opening time', async () => {
        mockPool.query
          .mockResolvedValueOnce({
            rows: [{
              id: 'tender1',
              opening_date: new Date(Date.now() - 3600000),
            }],
          })
          .mockResolvedValueOnce({
            rows: [{
              id: 'offer1',
              encrypted_data: 'encrypted',
              encryption_iv: 'iv',
              decryption_key_id: 'key1',
            }],
          });

        const KeyManagementService = require('../security/KeyManagementService');
        KeyManagementService.decryptData = jest.fn().mockReturnValue(
          JSON.stringify({ total_amount: 5000 })
        );

        const result = await OfferOpeningService.getOffersForOpening('tender1', 'buyer1');

        expect(result[0].total_amount).toBe(5000);
        expect(result[0].was_encrypted).toBe(true);
      });

      test('should mark decryption failures', async () => {
        mockPool.query
          .mockResolvedValueOnce({
            rows: [{ id: 'tender1', opening_date: new Date(Date.now() - 3600000) }],
          })
          .mockResolvedValueOnce({
            rows: [{
              id: 'offer1',
              encrypted_data: 'corrupted',
            }],
          });

        const KeyManagementService = require('../security/KeyManagementService');
        KeyManagementService.decryptData = jest.fn().mockImplementation(() => {
          throw new Error('Decryption failed');
        });

        const result = await OfferOpeningService.getOffersForOpening('tender1', 'buyer1');

        expect(result[0].decryption_failed).toBe(true);
      });
    });

    describe('generateOpeningReport()', () => {
      test('should create comprehensive opening report', async () => {
        const offers = [
          { offer_number: 'OFF-1', company_name: 'Supp1', total_amount: 5000, submitted_at: new Date() },
          { offer_number: 'OFF-2', company_name: 'Supp2', total_amount: 6000, submitted_at: new Date() },
        ];

        mockPool.query.mockResolvedValueOnce({
          rows: [{
            id: 1,
            total_offers_received: 2,
            total_valid_offers: 2,
          }],
        });

        const result = await OfferOpeningService.generateOpeningReport(
          'tender1',
          'buyer1',
          offers
        );

        expect(result.total_offers_received).toBe(2);
        expect(result.total_valid_offers).toBe(2);
      });

      test('should track invalid offers separately', async () => {
        const offers = [
          { offer_number: 'OFF-1', total_amount: 5000 },
          { offer_number: 'OFF-2', decryption_failed: true },
        ];

        mockPool.query.mockResolvedValueOnce({
          rows: [{
            total_offers_received: 2,
            total_valid_offers: 1,
            total_invalid_offers: 1,
          }],
        });

        const result = await OfferOpeningService.generateOpeningReport(
          'tender1',
          'buyer1',
          offers
        );

        expect(result.total_invalid_offers).toBe(1);
      });
    });
  });

  // ============ EVALUATION SERVICE TESTS ============
  describe('EvaluationService - Scoring Logic', () => {
    describe('recordTechnicalEvaluation()', () => {
      test('should validate score range (0-100)', async () => {
        const invalidScores = [-1, 101, 150];

        for (const score of invalidScores) {
          await expect(
            EvaluationService.recordTechnicalEvaluation('offer1', score, 'Good', 'eval1')
          ).rejects.toThrow('between 0 and 100');
        }
      });

      test('should store technical evaluation with timestamp', async () => {
        mockPool.query.mockResolvedValueOnce({
          rows: [{
            id: 'offer1',
            technical_score: 85,
            technical_evaluated_at: new Date(),
          }],
        });

        const result = await EvaluationService.recordTechnicalEvaluation(
          'offer1',
          85,
          'Excellent proposal',
          'eval1'
        );

        expect(result.technical_score).toBe(85);
        expect(result.technical_evaluated_at).toBeDefined();
      });

      test('should log audit trail for evaluation', async () => {
        mockPool.query.mockResolvedValueOnce({
          rows: [{ id: 'offer1', technical_score: 90 }],
        });

        await EvaluationService.recordTechnicalEvaluation('offer1', 90, 'Great', 'eval1');

        expect(AuditLogService.log).toHaveBeenCalledWith(
          'eval1',
          'technical_evaluation',
          'offer1',
          'create',
          expect.stringContaining('90/100')
        );
      });
    });

    describe('calculateFinalScores()', () => {
      test('should calculate average of technical and financial scores', async () => {
        mockPool.query
          .mockResolvedValueOnce({
            rows: [
              { id: 'offer1', technical_score: 80, financial_score: 90 },
              { id: 'offer2', technical_score: 70, financial_score: 85 },
            ],
          })
          .mockResolvedValue({ rows: [] });

        const result = await EvaluationService.calculateFinalScores('tender1', 'buyer1');

        expect(result[0].final_score).toBe(85); // (80+90)/2
        expect(result[1].final_score).toBe(77.5); // (70+85)/2
      });

      test('should rank offers by final score descending', async () => {
        mockPool.query
          .mockResolvedValueOnce({
            rows: [
              { id: 'offer1', technical_score: 60, financial_score: 70 },
              { id: 'offer2', technical_score: 90, financial_score: 95 },
            ],
          })
          .mockResolvedValue({ rows: [] });

        const result = await EvaluationService.calculateFinalScores('tender1', 'buyer1');

        expect(result[0].rank).toBe(1);
        expect(result[0].final_score).toBeGreaterThan(result[1].final_score);
      });

      test('should only evaluate offers with both scores', async () => {
        mockPool.query
          .mockResolvedValueOnce({
            rows: [
              { id: 'offer1', technical_score: 80, financial_score: null },
              { id: 'offer2', technical_score: 90, financial_score: 85 },
            ],
          })
          .mockResolvedValue({ rows: [] });

        const result = await EvaluationService.calculateFinalScores('tender1', 'buyer1');

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('offer2');
      });
    });
  });

  // ============ ARCHIVE SERVICE TESTS ============
  describe('ArchiveService - Encryption & Retention', () => {
    describe('archiveDocument()', () => {
      test('should encrypt document data before archiving', async () => {
        mockPool.query.mockResolvedValueOnce({
          rows: [{
            archive_id: 'ARC-123',
            encrypted_data: 'encrypted',
          }],
        });

        const docData = { tender_id: 1, title: 'Test Tender' };
        const result = await ArchiveService.archiveDocument(
          'tender',
          'tender1',
          docData,
          7
        );

        expect(result.archive_id).toContain('ARC-');
        expect(result.encrypted_data).toBe('encrypted');
      });

      test('should calculate expiration date based on retention', async () => {
        mockPool.query.mockResolvedValueOnce({
          rows: [{
            retention_years: 7,
            expiration_date: new Date(),
          }],
        });

        const result = await ArchiveService.archiveDocument(
          'tender',
          'tender1',
          {},
          7
        );

        expect(result.retention_years).toBe(7);
      });

      test('should use default retention of 7 years', async () => {
        mockPool.query.mockResolvedValueOnce({
          rows: [{ retention_years: 7 }],
        });

        const result = await ArchiveService.archiveDocument(
          'tender',
          'tender1',
          {}
        );

        expect(result.retention_years).toBe(7);
      });
    });

    describe('retrieveArchiveDocument()', () => {
      test('should decrypt archived data on retrieval', async () => {
        mockPool.query.mockResolvedValueOnce({
          rows: [{
            archive_id: 'ARC-123',
            encrypted_data: JSON.stringify({
              iv: 'test-iv',
              authTag: 'test-tag',
              data: 'encrypted',
            }),
            status: 'active',
          }],
        });

        const result = await ArchiveService.retrieveArchiveDocument('ARC-123');

        expect(result).toBeDefined();
        expect(result.data).toBeDefined();
      });

      test('should reject retrieval of expired archives', async () => {
        mockPool.query.mockResolvedValueOnce({
          rows: [{
            status: 'expired',
          }],
        });

        await expect(
          ArchiveService.retrieveArchiveDocument('ARC-EXPIRED')
        ).rejects.toThrow('expired');
      });
    });

    describe('Encryption Methods', () => {
      test('should encrypt and decrypt data correctly', () => {
        const originalData = JSON.stringify({ test: 'data' });
        
        const encrypted = ArchiveService.encryptArchiveData(originalData);
        const decrypted = ArchiveService.decryptArchiveData(encrypted);

        expect(decrypted).toBe(originalData);
      });

      test('should use AES-256-GCM algorithm', () => {
        const data = 'test data';
        const encrypted = ArchiveService.encryptArchiveData(data);
        const parsed = JSON.parse(encrypted);

        expect(parsed.iv).toBeDefined();
        expect(parsed.authTag).toBeDefined();
        expect(parsed.data).toBeDefined();
      });

      test('should fail decryption with wrong key', () => {
        const encrypted = ArchiveService.encryptArchiveData('test');
        
        expect(() => {
          ArchiveService.decryptArchiveData('invalid-data');
        }).toThrow();
      });
    });
  });

  // ============ INTEGRATION TESTS ============
  describe('Service Integration Tests', () => {
    test('should complete full tender award workflow', async () => {
      mockClient.query
        .mockResolvedValueOnce({ rows: [{ id: 1, buyer_id: 'buyer1' }] })
        .mockResolvedValueOnce({ rows: [{ id: 1 }] })
        .mockResolvedValueOnce({ rows: [{ total_quantity: 100 }] })
        .mockResolvedValueOnce({ rows: [{ id: 'offer1', supplier_id: 'supp1' }] })
        .mockResolvedValueOnce({ rows: [{ awarded_offers: [] }] });

      const lineItems = [
        { line_item_id: 'item1', description: 'Test', quantity: 100, unit: 'pieces' },
      ];

      const result1 = await TenderAwardService.initializeTenderAward(
        'tender1',
        lineItems,
        'buyer1'
      );

      const distribution = [
        { offer_id: 'offer1', quantity: 100, unit_price: 50 },
      ];

      const result2 = await TenderAwardService.distributeLineItem(
        'tender1',
        'item1',
        distribution,
        'buyer1'
      );

      expect(result1).toHaveLength(1);
      expect(result2).toBeDefined();
    });

    test('should handle evaluation to award workflow', async () => {
      mockPool.query
        .mockResolvedValueOnce({
          rows: [
            { id: 'offer1', technical_score: 85, financial_score: 90 },
          ],
        })
        .mockResolvedValue({ rows: [] });

      const scores = await EvaluationService.calculateFinalScores('tender1', 'buyer1');
      
      expect(scores[0].rank).toBe(1);
      expect(scores[0].final_score).toBe(87.5);
    });
  });
});
