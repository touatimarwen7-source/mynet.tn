/**
 * Token Manager - إدارة JWT tokens بشكل آمن
 */

const TOKEN_KEY = 'auth_token';
const TOKEN_EXPIRY_KEY = 'token_expiry';

export const tokenManager = {
  /**
   * حفظ التوكن
   */
  setToken(token) {
    if (!token) return;

    try {
      localStorage.setItem(TOKEN_KEY, token);

      // حساب وقت انتهاء الصلاحية (24 ساعة)
      const expiryTime = Date.now() + (24 * 60 * 60 * 1000);
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
    } catch (error) {
      console.error('Error saving token:', error);
    }
  },

  /**
   * الحصول على التوكن
   */
  getToken() {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);

      // التحقق من انتهاء الصلاحية
      if (expiry && Date.now() > parseInt(expiry)) {
        this.clearToken();
        return null;
      }

      return token;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  /**
   * حذف التوكن
   */
  clearToken() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
    } catch (error) {
      console.error('Error clearing token:', error);
    }
  },

  /**
   * التحقق من وجود توكن صالح
   */
  hasValidToken() {
    const token = this.getToken();
    return !!token;
  },

  /**
   * تحديث وقت انتهاء الصلاحية
   */
  refreshTokenExpiry() {
    const token = this.getToken();
    if (token) {
      const expiryTime = Date.now() + (24 * 60 * 60 * 1000);
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
    }
  }
};

export default tokenManager;