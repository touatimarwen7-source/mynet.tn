/**
 * Admin utility functions to eliminate code duplication
 * Includes: empty state messages, bulk operations, export/import, feature flags
 */

// Empty state messages
export const EMPTY_STATES = {
  pages: 'Aucune page statique créée',
  files: 'Aucun fichier uploadé',
  users: 'Aucun utilisateur trouvé',
  documents: 'Aucun document créé',
  plans: 'Aucun plan d\'abonnement',
  notifications: 'Aucune notification',
};

/**
 * Feature flags system (#34)
 * Allows hiding/showing features without redeploying
 */
export const FEATURE_FLAGS = {
  BULK_DELETE: true,
  BULK_EDIT: true,
  CSV_EXPORT: true,
  CSV_IMPORT: true,
  VERSIONING: true,
  CONFLICT_DETECTION: true,
  REAL_TIME_SYNC: false, // Coming soon
};

export function isFeatureEnabled(featureName) {
  return FEATURE_FLAGS[featureName] ?? false;
}

/**
 * Pagination utilities
 */
export function paginate(array, page = 0, pageSize = 10) {
  return {
    data: array.slice(page * pageSize, (page + 1) * pageSize),
    total: array.length,
    page,
    pageSize,
    totalPages: Math.ceil(array.length / pageSize),
  };
}

/**
 * Search/filter utilities
 */
export function searchItems(items, query, searchFields = []) {
  if (!query) return items;

  const lowerQuery = query.toLowerCase();
  return items.filter((item) =>
    searchFields.some((field) =>
      String(item[field]).toLowerCase().includes(lowerQuery)
    )
  );
}

export function filterItems(items, filters = {}) {
  return items.filter((item) =>
    Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      return item[key] === value;
    })
  );
}

/**
 * Sort utilities
 */
export function sortItems(items, sortBy, sortOrder = 'asc') {
  const sorted = [...items];
  sorted.sort((a, b) => {
    if (a[sortBy] < b[sortBy]) return sortOrder === 'asc' ? -1 : 1;
    if (a[sortBy] > b[sortBy]) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
  return sorted;
}

/**
 * Bulk operations utilities
 */
export function bulkDelete(items, ids) {
  return items.filter((item) => !ids.includes(item.id));
}

export function bulkUpdate(items, ids, updates) {
  return items.map((item) =>
    ids.includes(item.id) ? { ...item, ...updates } : item
  );
}

/**
 * Export utilities
 */
export function exportToJSON(data, filename) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || 'export.json';
  link.click();
  URL.revokeObjectURL(url);
}

export function exportToCSV(data, filename) {
  if (!data || data.length === 0) {
    // Warning tracked;
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create CSV content
  const csv = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Escape commas and quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || 'export.csv';
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Import utilities
 */
export function importFromCSV(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const csv = e.target.result;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map((h) => h.trim());

        const data = lines.slice(1)
          .filter((line) => line.trim())
          .map((line) => {
            const values = line.split(',').map((v) => v.trim());
            const obj = {};
            headers.forEach((header, index) => {
              obj[header] = values[index];
            });
            return obj;
          });

        resolve(data);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

/**
 * Versioning utilities (#24)
 */
export function createVersion(document, userId) {
  return {
    id: `v${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId,
    content: JSON.stringify(document),
    changes: calculateChanges(document),
  };
}

export function calculateChanges(document, previousDocument = {}) {
  const changes = [];
  Object.entries(document).forEach(([key, value]) => {
    if (previousDocument[key] !== value) {
      changes.push({
        field: key,
        from: previousDocument[key],
        to: value,
      });
    }
  });
  return changes;
}

/**
 * Conflict detection (#37)
 * Check if record was modified since client last fetched it
 */
export function detectConflict(clientVersion, serverVersion, clientTimestamp, serverTimestamp) {
  if (clientVersion !== serverVersion) {
    return {
      hasConflict: true,
      reason: 'VERSION_MISMATCH',
      message: 'Document modifié par un autre utilisateur',
    };
  }

  if (clientTimestamp < serverTimestamp) {
    return {
      hasConflict: true,
      reason: 'TIMESTAMP_MISMATCH',
      message: 'Document a été mis à jour',
    };
  }

  return { hasConflict: false };
}

/**
 * Timeout utilities (#38)
 */
export const TIMEOUT_LIMITS = {
  FILE_UPLOAD: 30000, // 30s
  API_REQUEST: 10000, // 10s
  LARGE_EXPORT: 60000, // 60s
  IMPORT: 45000, // 45s
};

export function withTimeout(promise, timeoutMs, operation = 'Operation') {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error(`${operation} timeout after ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ]);
}

/**
 * Navigation helpers (#19)
 * Use with useNavigate hook instead of window.location.href
 */
export function createNavigationHelper(navigate) {
  return {
    toHome: () => navigate('/'),
    toLogin: () => navigate('/login'),
    toAdmin: () => navigate('/admin'),
    toAdminPage: (type) => navigate(`/admin/crud?tab=${type}`),
  };
}

export default {
  EMPTY_STATES,
  FEATURE_FLAGS,
  isFeatureEnabled,
  paginate,
  searchItems,
  filterItems,
  sortItems,
  bulkDelete,
  bulkUpdate,
  exportToJSON,
  exportToCSV,
  importFromCSV,
  createVersion,
  calculateChanges,
  detectConflict,
  TIMEOUT_LIMITS,
  withTimeout,
  createNavigationHelper,
};
