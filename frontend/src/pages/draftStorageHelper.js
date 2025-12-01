const AUTOSAVE_INTERVAL = 30000; // 30 ثانية كما هو محدد في المواصفات

/**
 * يحفظ المسودة في localStorage.
 * @param {string} key - مفتاح المسودة في localStorage.
 * @param {object} data - البيانات المراد حفظها.
 * @param {boolean} showNotification - هل يجب عرض إشعار نجاح.
 */
export const autosaveDraft = (key, data, showNotification = false) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    if (showNotification) {
      // في تطبيق حقيقي، استخدم إشعار منبثق (toast notification)
      console.log('تم حفظ المسودة بنجاح!');
    }
  } catch (error) {
    console.error('لم يتم حفظ المسودة:', error);
  }
};

/**
 * يحمل المسودة من localStorage.
 * @param {string} key - مفتاح المسودة.
 * @returns {object | null} البيانات المحملة أو null إذا لم يتم العثور عليها.
 */
export const loadDraft = (key) => {
  try {
    const draft = localStorage.getItem(key);
    return draft ? JSON.parse(draft) : null;
  } catch (error) {
    console.error('لم يتم تحميل المسودة:', error);
    return null;
  }
};

/**
 * يمسح المسودة من localStorage.
 * @param {string} key - مفتاح المسودة.
 */
export const clearDraft = (key) => {
  localStorage.removeItem(key);
};

export { AUTOSAVE_INTERVAL };