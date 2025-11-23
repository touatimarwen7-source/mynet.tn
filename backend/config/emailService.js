// Email Service Configuration - TURN 3 OPTIONAL
let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  // nodemailer not installed - email service optional
}

let transporter;
let emailServiceEnabled = false;

const initializeEmailService = async () => {
  const provider = process.env.EMAIL_PROVIDER || 'gmail';

  try {
    if (provider === 'sendgrid') {
      try {
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        transporter = sgMail;
        emailServiceEnabled = true;
        // SendGrid initialized
      } catch (e) {
        // SendGrid not configured - will fallback
      }
    } else if (provider === 'resend') {
      try {
        const { Resend } = require('resend');
        transporter = new Resend(process.env.RESEND_API_KEY);
        emailServiceEnabled = true;
        // Resend initialized
      } catch (e) {
        // Resend not configured - will fallback
      }
    } else if (nodemailer) {
      try {
        transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          }
        });
        emailServiceEnabled = true;
        // Gmail initialized
      } catch (e) {
        // Gmail not configured - will fallback
      }
    }
  } catch (error) {
    // Email service initialization encountered an issue - will be disabled
  }
};

const sendEmail = async (to, subject, htmlContent) => {
  if (!emailServiceEnabled) {
    return false;
  }

  try {
    const provider = process.env.EMAIL_PROVIDER || 'gmail';

    if (provider === 'sendgrid') {
      await transporter.send({
        to,
        from: process.env.EMAIL_FROM || 'noreply@mynet.tn',
        subject,
        html: htmlContent
      });
    } else if (provider === 'resend') {
      await transporter.emails.send({
        to,
        from: process.env.EMAIL_FROM || 'noreply@mynet.tn',
        subject,
        html: htmlContent
      });
    } else if (nodemailer) {
      await transporter.sendMail({
        to,
        from: process.env.EMAIL_FROM || 'noreply@mynet.tn',
        subject,
        html: htmlContent
      });
    }

    // Email sent successfully - tracked via audit logs
    return true;
  } catch (error) {
    const ErrorTrackingService = require('../services/ErrorTrackingService');
    ErrorTrackingService.logError('EMAIL_SEND_ERROR', error, { to });
    return false;
  }
};

// Email templates
const emailTemplates = {
  newOffer: (tenderId, supplierName, price) => ({
    subject: `New Offer for Your Tender #${tenderId}`,
    html: `
      <h2>New Offer Received</h2>
      <p>You have received a new offer for your tender.</p>
      <p><strong>Supplier:</strong> ${supplierName}</p>
      <p><strong>Price:</strong> $${price}</p>
      <a href="${process.env.FRONTEND_URL}/tenders/${tenderId}" style="background-color: #0056B3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">View Offer</a>
    `
  }),

  tenderUpdate: (tenderId, status) => ({
    subject: `Tender #${tenderId} Status Update`,
    html: `
      <h2>Tender Status Changed</h2>
      <p>Your tender has been ${status}.</p>
      <a href="${process.env.FRONTEND_URL}/tenders/${tenderId}" style="background-color: #0056B3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">View Tender</a>
    `
  }),

  newMessage: (senderName, senderCompany) => ({
    subject: `New Message from ${senderCompany}`,
    html: `
      <h2>You have a new message</h2>
      <p>From: <strong>${senderName}</strong> (${senderCompany})</p>
      <a href="${process.env.FRONTEND_URL}/messages" style="background-color: #0056B3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Read Message</a>
    `
  }),

  newReview: (reviewerName, rating) => ({
    subject: `New Review: ${rating} Stars from ${reviewerName}`,
    html: `
      <h2>You received a new review!</h2>
      <p>Rating: ${'⭐'.repeat(rating)}</p>
      <p>From: <strong>${reviewerName}</strong></p>
      <a href="${process.env.FRONTEND_URL}/reviews" style="background-color: #0056B3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">View Reviews</a>
    `
  })
};

module.exports = {
  initializeEmailService,
  sendEmail,
  emailTemplates
};
