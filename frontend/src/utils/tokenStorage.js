// HTTP-Only Cookies - حل أفضل للأمان
// ملاحظة: يتطلب تحديث Backend لتعيين HTTP-Only Cookies

export const tokenStorage = {
  // تخزين في Memory بدل localStorage
  accessToken: null,
  refreshToken: null,

  setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    // إرسال إلى Backend لتعيين HTTP-Only Cookies
    console.log('تم تخزين التوكنات بآمان في الذاكرة');
  },

  getAccessToken() {
    return this.accessToken;
  },

  getRefreshToken() {
    return this.refreshToken;
  },

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    // تنظيف الـ Cookies
    document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }
};

// طلب من Backend: إضافة الكود التالي في authController.js
/*
// في login endpoint:
res.cookie('accessToken', accessToken, {
  httpOnly: true,
  secure: true,  // فقط HTTPS
  sameSite: 'Strict',
  maxAge: 3600000  // 1 hour
});

res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: true,
  sameSite: 'Strict',
  maxAge: 604800000  // 7 days
});
*/
