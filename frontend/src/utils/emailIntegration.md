# Email Notifications Integration Guide

## Overview
This guide provides setup instructions for integrating email notifications with MyNet.tn using SendGrid, Resend, or Gmail.

## Available Email Providers

### 1. SendGrid (Recommended for Production)
**Best for:** High volume, reliable delivery, advanced features

**Setup Steps:**
1. Create SendGrid account at https://sendgrid.com
2. Generate API Key: Settings → API Keys → Create API Key
3. Store in environment variable: `SENDGRID_API_KEY`
4. Backend implementation:
   ```javascript
   const sgMail = require('@sendgrid/mail');
   sgMail.setApiKey(process.env.SENDGRID_API_KEY);
   
   await sgMail.send({
     to: recipient,
     from: 'notifications@mynet.tn',
     subject: subject,
     html: emailTemplate,
   });
   ```

### 2. Resend (Modern Alternative)
**Best for:** Developers, fast setup, good deliverability

**Setup Steps:**
1. Create Resend account at https://resend.com
2. Generate API Key in dashboard
3. Store in environment variable: `RESEND_API_KEY`
4. Backend implementation:
   ```javascript
   const { Resend } = require('resend');
   const resend = new Resend(process.env.RESEND_API_KEY);
   
   await resend.emails.send({
     from: 'notifications@mynet.tn',
     to: recipient,
     subject: subject,
     html: emailTemplate,
   });
   ```

### 3. Gmail SMTP
**Best for:** Smaller scale, testing

**Setup Steps:**
1. Enable 2FA on Google Account
2. Generate App Password
3. Configure nodemailer:
   ```javascript
   const nodemailer = require('nodemailer');
   const transporter = nodemailer.createTransport({
     service: 'gmail',
     auth: {
       user: process.env.GMAIL_USER,
       pass: process.env.GMAIL_APP_PASSWORD,
     }
   });
   ```

## Email Templates

### Tender Created
```
Subject: Nouvel appel d'offres disponible: {tender_title}
```

### Offer Accepted
```
Subject: Votre offre a été acceptée!
```

### Supply Request
```
Subject: Nouvelle demande d'approvisionnement de {buyer_name}
```

### Invoice Generated
```
Subject: Nouvelle facture: {invoice_number}
```

## Backend Email Service

Create `/backend/services/emailService.js`:

```javascript
class EmailService {
  async sendTenderNotification(supplier, tender) {
    // Send email when tender is published
  }

  async sendOfferAccepted(supplier, tender, offer) {
    // Send email when offer is accepted
  }

  async sendSupplyRequest(supplier, request) {
    // Send email for supply request
  }

  async sendInvoiceNotification(buyer, invoice) {
    // Send email with invoice details
  }
}

module.exports = new EmailService();
```

## Environment Variables

Add to `.env`:
```
# Email Provider Choice (sendgrid, resend, or gmail)
EMAIL_PROVIDER=sendgrid

# SendGrid
SENDGRID_API_KEY=your_api_key_here

# Resend
RESEND_API_KEY=your_api_key_here

# Gmail
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password

# Email Configuration
EMAIL_FROM=notifications@mynet.tn
EMAIL_FROM_NAME=MyNet.tn Notifications
```

## Frontend Email Notification Management

Location: `/email-notifications`
Role: Super Admin

Features:
- View all sent notifications
- Filter by status (pending, sent, failed)
- Retry failed emails
- Track opens/clicks
- Manage templates

## Testing

### Test Email Sending
```javascript
// In development
const emailService = require('./services/emailService');
await emailService.sendTest('test@example.com', {
  subject: 'Test Email',
  html: '<h1>Test</h1>',
});
```

### Test Template Rendering
- Use template preview in EmailNotifications page
- Check browser console for errors
- Verify email formatting

## Troubleshooting

### Emails Not Sending
1. Check API key is correct
2. Verify environment variable is set
3. Check error logs in backend
4. Verify sender email is authorized

### Low Delivery Rate
1. Use verified sender domain
2. Add SPF/DKIM records
3. Monitor bounce rate
4. Check email template compliance

### Rate Limiting
- SendGrid: 100 emails/second for free tier
- Resend: 100 emails/day for free tier
- Gmail: 300 emails/day limit

## Best Practices

1. **Use Templates** - HTML email templates for consistency
2. **Track Engagement** - Open rates, click rates
3. **Retry Failed** - Implement exponential backoff
4. **Rate Limit** - Implement queue to avoid rate limits
5. **Unsubscribe** - Include unsubscribe links
6. **Test First** - Test with dev account before production

## Migration Path

**Phase 1:** Email validation ✅
**Phase 2:** SendGrid integration (recommended)
**Phase 3:** Email templates optimization
**Phase 4:** Advanced features (webhooks, tracking)

## Support

For issues:
1. Check SendGrid/Resend documentation
2. Review error logs in backend
3. Test with Postman or curl
4. Contact provider support

Last Updated: November 23, 2025
