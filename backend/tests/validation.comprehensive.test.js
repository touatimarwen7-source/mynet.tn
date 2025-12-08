
/**
 * 🧪 COMPREHENSIVE VALIDATION TESTS
 * Coverage: Input sanitization, XSS prevention, SQL injection, type validation
 */

const { validators, sanitizers } = require('../middleware/validationMiddleware');
const { validateIdMiddleware } = require('../middleware/validateIdMiddleware');
const { authValidators, procurementValidators } = require('../middleware/endpointValidators');

describe('🛡️ Comprehensive Validation Tests', () => {
  
  // ============================================================================
  // XSS PREVENTION TESTS
  // ============================================================================
  describe('XSS Prevention', () => {
    test('should escape HTML script tags', () => {
      const malicious = '<script>alert("XSS")</script>';
      const sanitized = sanitizers.escapeHtml(malicious);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('&lt;script&gt;');
    });

    test('should escape HTML event handlers', () => {
      const malicious = '<img src=x onerror="alert(1)">';
      const sanitized = sanitizers.escapeHtml(malicious);
      expect(sanitized).not.toContain('onerror=');
    });

    test('should handle multiple XSS vectors', () => {
      const vectors = [
        '<script>alert(1)</script>',
        '<img src=x onerror=alert(1)>',
        '<svg onload=alert(1)>',
        'javascript:alert(1)',
        '<iframe src="javascript:alert(1)">',
      ];
      
      vectors.forEach(vector => {
        const sanitized = sanitizers.escapeHtml(vector);
        expect(sanitized).not.toMatch(/<script|<img|<svg|<iframe|javascript:/i);
      });
    });
  });

  // ============================================================================
  // SQL INJECTION PREVENTION TESTS
  // ============================================================================
  describe('SQL Injection Prevention', () => {
    test('should detect SQL injection patterns', () => {
      const maliciousInputs = [
        "'; DROP TABLE users; --",
        "1' OR '1'='1",
        "admin'--",
        "1; DELETE FROM users",
        "' UNION SELECT * FROM passwords--",
      ];

      maliciousInputs.forEach(input => {
        const sanitized = sanitizers.removeSqlPatterns(input);
        expect(sanitized).not.toContain('DROP');
        expect(sanitized).not.toContain('DELETE');
        expect(sanitized).not.toContain('UNION');
      });
    });

    test('should allow legitimate SQL-like strings', () => {
      const legitimate = 'My company name is SELECT Ltd.';
      const sanitized = sanitizers.removeSqlPatterns(legitimate);
      expect(sanitized.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // EMAIL VALIDATION TESTS
  // ============================================================================
  describe('Email Validation', () => {
    test('should accept valid emails', () => {
      const validEmails = [
        'user@example.com',
        'first.last@company.co.uk',
        'user+tag@domain.com',
        'test123@test-domain.com',
      ];

      validEmails.forEach(email => {
        expect(validators.isValidEmail(email)).toBe(true);
      });
    });

    test('should reject invalid emails', () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'user@',
        'user @example.com',
        'user@.com',
        '',
        null,
        undefined,
      ];

      invalidEmails.forEach(email => {
        expect(validators.isValidEmail(email)).toBe(false);
      });
    });

    test('should normalize emails', () => {
      expect(sanitizers.normalizeEmail('  USER@EXAMPLE.COM  ')).toBe('user@example.com');
    });
  });

  // ============================================================================
  // ID VALIDATION TESTS
  // ============================================================================
  describe('ID Validation', () => {
    test('should accept valid numeric IDs', () => {
      expect(validators.isValidId('123')).toBe(true);
      expect(validators.isValidId('999999')).toBe(true);
    });

    test('should accept valid UUIDs', () => {
      const uuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
      expect(validators.isValidId(uuid)).toBe(true);
    });

    test('should reject invalid IDs', () => {
      const invalidIds = ['badid', 'abc', '', 'undefined', 'null', null];
      invalidIds.forEach(id => {
        expect(validators.isValidId(id)).toBe(false);
      });
    });
  });

  // ============================================================================
  // NUMBER VALIDATION TESTS
  // ============================================================================
  describe('Number Validation', () => {
    test('should validate positive numbers', () => {
      expect(validators.isValidPositiveNumber(100)).toBe(true);
      expect(validators.isValidPositiveNumber('500')).toBe(true);
      expect(validators.isValidPositiveNumber(0)).toBe(false);
      expect(validators.isValidPositiveNumber(-10)).toBe(false);
    });

    test('should validate decimals with range', () => {
      expect(validators.isValidDecimal(99.99, 0, 100)).toBe(true);
      expect(validators.isValidDecimal(150, 0, 100)).toBe(false);
      expect(validators.isValidDecimal(-10, 0, 100)).toBe(false);
    });

    test('should validate ratings (1-5)', () => {
      expect(validators.isValidRating(3)).toBe(true);
      expect(validators.isValidRating(5)).toBe(true);
      expect(validators.isValidRating(0)).toBe(false);
      expect(validators.isValidRating(6)).toBe(false);
    });

    test('should convert to safe integers', () => {
      expect(sanitizers.toSafeInt('123')).toBe(123);
      expect(sanitizers.toSafeInt('abc')).toBeNull();
      expect(sanitizers.toSafeInt(999999999999999)).toBeNull(); // Too large
    });
  });

  // ============================================================================
  // DATE VALIDATION TESTS
  // ============================================================================
  describe('Date Validation', () => {
    test('should validate date strings', () => {
      expect(validators.isValidDate('2025-12-31')).toBe(true);
      expect(validators.isValidDate('2025-12-31T23:59:59Z')).toBe(true);
      expect(validators.isValidDate(new Date())).toBe(true);
    });

    test('should reject invalid dates', () => {
      expect(validators.isValidDate('not-a-date')).toBe(false);
      expect(validators.isValidDate('2025-13-40')).toBe(false);
      expect(validators.isValidDate(null)).toBe(false);
    });
  });

  // ============================================================================
  // ENDPOINT VALIDATORS TESTS
  // ============================================================================
  describe('Auth Validators', () => {
    test('should validate login data', () => {
      const validLogin = { email: 'user@test.com', password: 'password123' };
      expect(authValidators.login(validLogin)).toBeNull();

      const invalidLogin = { email: 'bademail', password: '' };
      const errors = authValidators.login(invalidLogin);
      expect(errors).not.toBeNull();
      expect(errors.email).toBeDefined();
    });

    test('should validate registration data', () => {
      const validReg = {
        email: 'user@test.com',
        password: 'SecurePass123!',
        name: 'John Doe',
        phone: '+1234567890',
      };
      expect(authValidators.register(validReg)).toBeNull();

      const invalidReg = {
        email: 'bademail',
        password: '123', // Too short
        name: 'J',
      };
      const errors = authValidators.register(invalidReg);
      expect(errors).not.toBeNull();
      expect(errors.password).toBeDefined();
    });
  });

  describe('Procurement Validators', () => {
    test('should validate tender creation', () => {
      const validTender = {
        title: 'Valid Tender Title',
        description: 'This is a valid description',
        budget: 10000,
        deadline: new Date(Date.now() + 86400000).toISOString(),
        category: 'Services',
      };
      expect(procurementValidators.createTender(validTender)).toBeNull();
    });

    test('should reject invalid tender data', () => {
      const invalidTender = {
        title: 'ab', // Too short
        description: 'short',
        budget: -100, // Negative
        deadline: 'not-a-date',
      };
      const errors = procurementValidators.createTender(invalidTender);
      expect(errors).not.toBeNull();
      expect(errors.title).toBeDefined();
      expect(errors.budget).toBeDefined();
    });

    test('should validate offer creation', () => {
      const validOffer = {
        tender_id: '123',
        offer_price: 5000,
        timeline: '30 days',
        terms: 'Payment on delivery',
      };
      expect(procurementValidators.createOffer(validOffer)).toBeNull();
    });
  });

  // ============================================================================
  // STRING VALIDATION TESTS
  // ============================================================================
  describe('String Validation', () => {
    test('should validate string length', () => {
      expect(validators.isValidString('Valid', 3, 10)).toBe(true);
      expect(validators.isValidString('ab', 3, 10)).toBe(false);
      expect(validators.isValidString('TooLongString', 3, 10)).toBe(false);
    });

    test('should sanitize and truncate strings', () => {
      const long = 'a'.repeat(1000);
      const sanitized = sanitizers.sanitizeString(long, 100);
      expect(sanitized.length).toBeLessThanOrEqual(100);
    });
  });

  // ============================================================================
  // ARRAY VALIDATION TESTS
  // ============================================================================
  describe('Array Validation', () => {
    test('should validate array length', () => {
      expect(validators.isValidArray([1, 2, 3], 1, 10)).toBe(true);
      expect(validators.isValidArray([], 1, 10)).toBe(false);
      expect(validators.isValidArray('not-array')).toBe(false);
    });
  });

  // ============================================================================
  // URL VALIDATION TESTS
  // ============================================================================
  describe('URL Validation', () => {
    test('should validate URLs', () => {
      expect(validators.isValidUrl('https://example.com')).toBe(true);
      expect(validators.isValidUrl('http://test.com/path')).toBe(true);
      expect(validators.isValidUrl('not-a-url')).toBe(false);
      expect(validators.isValidUrl('javascript:alert(1)')).toBe(false);
    });
  });

  // ============================================================================
  // BOOLEAN VALIDATION TESTS
  // ============================================================================
  describe('Boolean Validation', () => {
    test('should validate booleans', () => {
      expect(validators.isValidBoolean(true)).toBe(true);
      expect(validators.isValidBoolean('true')).toBe(true);
      expect(validators.isValidBoolean('1')).toBe(true);
      expect(validators.isValidBoolean('yes')).toBe(false);
    });

    test('should parse booleans safely', () => {
      expect(sanitizers.parseBoolean('true')).toBe(true);
      expect(sanitizers.parseBoolean('false')).toBe(false);
      expect(sanitizers.parseBoolean('1')).toBe(true);
      expect(sanitizers.parseBoolean('0')).toBe(false);
    });
  });
});

// Run: npm test -- validation.comprehensive.test.js
