// ============ Draft Storage & Auto-save Helper ============

const DRAFT_STORAGE_KEY = 'mynet_draft_';
const DRAFT_TIMESTAMP_KEY = 'mynet_draft_timestamp_';
const DRAFT_EXPIRY_DAYS = 7;

/**
 * 💾 Auto-save draft to localStorage with validation
 * @param {string} draftKey - Unique key for this draft (e.g., 'tender_draft_123')
 * @param {object} data - Form data to save
 * @returns {boolean} Success status
 */
export const autosaveDraft = (draftKey, data) => {
  try {
    if (!draftKey || !data) {
      console.warn('Draft save skipped: Invalid key or data');
      return false;
    }

    const storageKey = `${DRAFT_STORAGE_KEY}${draftKey}`;
    const timestampKey = `${DRAFT_TIMESTAMP_KEY}${draftKey}`;
    
    const serialized = JSON.stringify(data);
    const sizeKB = (new Blob([serialized]).size / 1024).toFixed(2);
    
    localStorage.setItem(storageKey, serialized);
    localStorage.setItem(timestampKey, new Date().toISOString());
    
    console.log(`✅ Draft saved: ${draftKey} (${sizeKB}KB)`);
    return true;
  } catch (err) {
    if (err.name === 'QuotaExceededError') {
      console.error('❌ Storage quota exceeded - clearing old drafts');
      clearOldestDrafts();
      return false;
    }
    console.error('❌ Draft save failed:', err.message);
    return false;
  }
};

/**
 * 📥 Recover draft from localStorage with detailed validation
 * @param {string} draftKey - Unique key for this draft
 * @returns {object|null} Saved draft data or null if not found/expired
 */
export const recoverDraft = (draftKey) => {
  try {
    if (!draftKey) {
      console.warn('Draft recovery skipped: Invalid key');
      return null;
    }

    const storageKey = `${DRAFT_STORAGE_KEY}${draftKey}`;
    const timestampKey = `${DRAFT_TIMESTAMP_KEY}${draftKey}`;
    
    const savedData = localStorage.getItem(storageKey);
    const savedTimestamp = localStorage.getItem(timestampKey);
    
    if (!savedData) {
      console.log(`ℹ️ No draft found: ${draftKey}`);
      return null;
    }
    
    // Check if draft is expired
    if (savedTimestamp) {
      const savedDate = new Date(savedTimestamp);
      const expiryDate = new Date(savedDate.getTime() + DRAFT_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
      
      if (new Date() > expiryDate) {
        console.warn(`⏰ Draft expired: ${draftKey} (${savedDate.toLocaleString()})`);
        clearDraft(draftKey);
        return null;
      }
      
      const daysSaved = Math.floor((Date.now() - savedDate) / (24 * 60 * 60 * 1000));
      console.log(`✅ Draft recovered: ${draftKey} (saved ${daysSaved} day(s) ago)`);
    }
    
    const parsed = JSON.parse(savedData);
    return parsed;
  } catch (err) {
    console.error(`❌ Draft recovery failed: ${err.message}`);
    clearDraft(draftKey);
    return null;
  }
};

/**
 * 🗑️ Clear draft from localStorage
 * @param {string} draftKey - Unique key for this draft
 */
export const clearDraft = (draftKey) => {
  try {
    if (!draftKey) return;
    const storageKey = `${DRAFT_STORAGE_KEY}${draftKey}`;
    const timestampKey = `${DRAFT_TIMESTAMP_KEY}${draftKey}`;
    
    localStorage.removeItem(storageKey);
    localStorage.removeItem(timestampKey);
    console.log(`🗑️ Draft cleared: ${draftKey}`);
  } catch (err) {
    console.error('❌ Draft clear failed:', err.message);
  }
};

/**
 * 🧹 Clear oldest drafts when storage is full
 */
const clearOldestDrafts = () => {
  try {
    const drafts = getAllDrafts();
    if (drafts.length > 0) {
      // Sort by timestamp and remove oldest
      const sorted = drafts.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      const toRemove = Math.ceil(drafts.length / 3); // Remove 33% oldest
      
      for (let i = 0; i < toRemove && i < sorted.length; i++) {
        clearDraft(sorted[i].key);
      }
      console.log(`🧹 Cleared ${toRemove} oldest draft(s)`);
    }
  } catch (err) {
    console.error('Failed to clean drafts:', err);
  }
};

/**
 * ⏱️ Set up auto-save interval hook
 * @param {string} draftKey - Unique key for this draft
 * @param {object} data - Form data to auto-save
 * @param {number} intervalMs - Interval in milliseconds (default: 30s)
 */
export const useAutoSave = (draftKey, data, intervalMs = 30000) => {
  React.useEffect(() => {
    const timer = setInterval(() => {
      autosaveDraft(draftKey, data);
    }, intervalMs);
    
    return () => clearInterval(timer);
  }, [draftKey, data]);
};

/**
 * 📋 Get all available drafts metadata
 * @returns {array} Array of draft metadata {key, timestamp, size}
 */
export const getAllDrafts = () => {
  try {
    const drafts = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(DRAFT_STORAGE_KEY)) {
        const draftKey = key.replace(DRAFT_STORAGE_KEY, '');
        const timestampKey = `${DRAFT_TIMESTAMP_KEY}${draftKey}`;
        const timestamp = localStorage.getItem(timestampKey);
        const data = localStorage.getItem(key);
        
        drafts.push({
          key: draftKey,
          timestamp: timestamp ? new Date(timestamp) : null,
          size: data ? data.length : 0
        });
      }
    }
    return drafts;
  } catch (err) {
    return [];
  }
};

export default {
  autosaveDraft,
  recoverDraft,
  clearDraft,
  useAutoSave,
  getAllDrafts
};
