/**
 * 🔐 Enhanced Security Headers Middleware
 * Comprehensive security headers for:
 * - OWASP compliance
 * - XSS protection
 * - CSRF prevention
 * - Clickjacking protection
 * - MIME type sniffing protection
 * - Referrer policy
 * - Feature policy
 */

const securityHeadersMiddleware = (req, res, next) => {
  // 1. X-Frame-Options - Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // 2. X-Content-Type-Options - Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // 3. X-XSS-Protection - Enable XSS protection in older browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // 4. Strict-Transport-Security - Force HTTPS
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );
  
  // 5. Content-Security-Policy - Prevent XSS and injection attacks
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' http://localhost:* https:",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests"
    ].join('; ')
  );
  
  // 6. Referrer-Policy - Control referrer information
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // 7. Permissions-Policy (formerly Feature-Policy)
  res.setHeader(
    'Permissions-Policy',
    [
      'geolocation=()',
      'microphone=()',
      'camera=()',
      'payment=()'
    ].join(', ')
  );
  
  // 8. X-Permitted-Cross-Domain-Policies
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  
  // 9. Remove server signature
  res.removeHeader('X-Powered-By');
  
  // 10. Cache-Control for sensitive content
  if (req.path.includes('/api/')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  next();
};

module.exports = { securityHeadersMiddleware };
