
# Guide d'Implémentation de la Validation - MyNet.tn

## Vue d'ensemble

Ce guide détaille l'implémentation complète du système de validation sur MyNet.tn, couvrant backend et frontend.

---

## Architecture de Validation

### Backend - Triple Couche

```
┌─────────────────────────────────────────┐
│  1. validationMiddleware (Global)      │
│     → Sanitise toutes les entrées      │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│  2. validateIdMiddleware (Routes)      │
│     → Valide les paramètres d'ID       │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│  3. endpointValidators (Controllers)   │
│     → Validation spécifique métier     │
└─────────────────────────────────────────┘
```

### Frontend - Validation en Temps Réel

- **Validation côté client** : UX améliorée, feedback immédiat
- **Double validation** : Backend valide TOUJOURS
- **Gestion d'erreurs** : Messages clairs en français

---

## Middleware Backend

### 1. validationMiddleware

**Fichier**: `backend/middleware/validationMiddleware.js`

**Application**:
```javascript
const { validationMiddleware } = require('../middleware/validationMiddleware');

// Apply globally to all routes
router.use(validationMiddleware);
```

**Fonctionnalités**:
- Sanitise HTML (XSS prevention)
- Échappe les caractères SQL dangereux
- Normalise les emails
- Limite la longueur des chaînes

### 2. validateIdMiddleware

**Fichier**: `backend/middleware/validateIdMiddleware.js`

**Application**:
```javascript
const { validateIdMiddleware } = require('../middleware/validateIdMiddleware');

// Single parameter
router.get('/tenders/:id', validateIdMiddleware('id'), handler);

// Multiple parameters
router.get('/tenders/:tenderId/offers/:offerId',
  validateIdMiddleware(['tenderId', 'offerId']),
  handler
);
```

**Validation**:
- ✅ UUIDs: `^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`
- ✅ Numeric IDs: `^\d+$`
- ❌ Rejette: `undefined`, `null`, `badid`, `abc`

### 3. endpointValidators

**Fichier**: `backend/middleware/endpointValidators.js`

**Utilisation dans les controllers**:
```javascript
const { authValidators, procurementValidators } = require('../middleware/endpointValidators');

// Login validation
router.post('/login', (req, res) => {
  const errors = authValidators.login(req.body);
  if (errors) return res.status(400).json(errors);
  // Proceed
});

// Tender creation validation
router.post('/tenders', (req, res) => {
  const errors = procurementValidators.createTender(req.body);
  if (errors) return res.status(400).json(errors);
  // Proceed
});
```

---

## Routes Protégées

### Routes avec Validation Complète ✅

1. **authRoutes** - Login, Register, Password Reset
2. **adminRoutes** - User management, system settings
3. **backupRoutes** - Backup/restore operations
4. **supplierAnalyticsRoutes** - Performance metrics
5. **tenderManagementRoutes** - Tender CRUD
6. **offerEvaluationRoutes** - Offer scoring
7. **reviewsRoutes** - Rating system

### Application Standard

```javascript
const express = require('express');
const router = express.Router();
const { validationMiddleware } = require('../middleware/validationMiddleware');
const { validateIdMiddleware } = require('../middleware/validateIdMiddleware');

// 1. Apply global sanitization
router.use(validationMiddleware);

// 2. Protect ID-based routes
router.get('/:id', validateIdMiddleware('id'), handler);
router.put('/:id', validateIdMiddleware('id'), handler);
router.delete('/:id', validateIdMiddleware('id'), handler);

// 3. Use endpoint validators in handlers
router.post('/', async (req, res) => {
  const errors = myValidator(req.body);
  if (errors) return res.status(400).json(errors);
  // Business logic
});
```

---

## Frontend - Validation Côté Client

### Schémas de Validation

**Fichier**: `frontend/src/utils/validationSchemas.js`

```javascript
export const tenderValidationSchema = {
  title: {
    required: true,
    minLength: 5,
    maxLength: 500,
    message: 'Le titre doit contenir entre 5 et 500 caractères'
  },
  budget: {
    required: true,
    min: 0,
    max: 999999999,
    type: 'number',
    message: 'Budget invalide'
  },
  deadline: {
    required: true,
    type: 'date',
    futureDate: true,
    message: 'La date limite doit être future'
  }
};
```

### Hook de Validation

```javascript
import { useFormValidation } from '../hooks/useFormValidation';

function MyForm() {
  const { errors, validateField, validateForm } = useFormValidation(schema);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateForm(formData);
    if (!isValid) return;
    // Submit
  };
  
  return (
    <input
      onBlur={() => validateField('email', value)}
      error={!!errors.email}
      helperText={errors.email}
    />
  );
}
```

---

## Tests de Validation

### Backend Tests

**Fichier**: `backend/tests/validation.test.js`

```javascript
describe('Validation Middleware', () => {
  test('should sanitize XSS attempts', () => {
    const malicious = '<script>alert("XSS")</script>';
    const sanitized = sanitizers.escapeHtml(malicious);
    expect(sanitized).not.toContain('<script>');
  });
  
  test('should reject invalid email', () => {
    expect(validators.isValidEmail('notanemail')).toBe(false);
    expect(validators.isValidEmail('valid@email.com')).toBe(true);
  });
});
```

### Frontend Tests

**Fichier**: `frontend/src/utils/__tests__/validation.test.js`

```javascript
describe('Form Validation', () => {
  test('should validate tender title', () => {
    const { validateField } = useFormValidation(tenderSchema);
    expect(validateField('title', 'ab')).toBe(false); // Too short
    expect(validateField('title', 'Valid Title')).toBe(true);
  });
});
```

---

## Checklist de Sécurité

- [x] validationMiddleware appliqué globalement
- [x] validateIdMiddleware sur toutes les routes avec `:id`
- [x] endpointValidators dans tous les controllers
- [x] Sanitisation XSS (frontend + backend)
- [x] Protection SQL injection (requêtes paramétrées)
- [x] Validation des types de données
- [x] Gestion des erreurs en français
- [x] Tests de validation (65+ tests)

---

## Ressources

- [Validation Middleware Guide](./VALIDATION_MIDDLEWARE_GUIDE.md)
- [Security Integration Guide](./SECURITY_INTEGRATION_GUIDE.md)
- [Testing Results](./TESTING_RESULTS_FINAL.md)

---

**Status**: ✅ Production Ready  
**Dernière mise à jour**: 2025
