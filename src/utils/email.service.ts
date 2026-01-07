import * as brevo from '@getbrevo/brevo';
import config from '../config/config';

// Email options interface
export interface SendEmailOptions {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, config.brevo.apiKey || '');

/**
 * Send email using Brevo (formerly Sendinblue)
 */
export const sendEmail = async (options: SendEmailOptions): Promise<void> => {
  if (!config.brevo.apiKey) {
    throw new Error('BREVO_API_KEY is not configured');
  }

  if (!config.brevo.senderEmail) {
    throw new Error('BREVO_SENDER_EMAIL is not configured');
  }

  console.log('📧 Attempting to send email...');
  console.log('From:', config.brevo.senderEmail);
  console.log('To:', options.to);
  console.log('Subject:', options.subject);

  const sendSmtpEmail = new brevo.SendSmtpEmail();
  
  sendSmtpEmail.sender = {
    name: config.brevo.senderName,
    email: config.brevo.senderEmail,
  };
  
  sendSmtpEmail.to = [{ email: options.to }];
  sendSmtpEmail.subject = options.subject;
  sendSmtpEmail.htmlContent = options.htmlContent;
  
  if (options.textContent) {
    sendSmtpEmail.textContent = options.textContent;
  }

  try {
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ Email sent successfully to ${options.to}`);
    console.log('Brevo response:', JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error('❌ Error sending email:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText,
    });
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Send OTP verification email
 */
export const sendVerificationOTP = async (email: string, name: string, otp: string): Promise<void> => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #4CAF50;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          background-color: #f9f9f9;
          padding: 30px;
          border-radius: 0 0 5px 5px;
        }
        .otp-box {
          background-color: #fff;
          border: 2px dashed #4CAF50;
          padding: 20px;
          text-align: center;
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          margin: 20px 0;
          color: #4CAF50;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Verify Your Email</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${name}</strong>,</p>
          <p>Thank you for signing up with TailorCraft! To complete your registration, please use the following One-Time Password (OTP):</p>
          
          <div class="otp-box">
            ${otp}
          </div>
          
          <p><strong>This OTP will expire in ${config.otp.expiresInMinutes} minutes.</strong></p>
          
          <p>If you didn't request this verification, please ignore this email.</p>
          
          <p>Best regards,<br>The TailorCraft Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    Hello ${name},
    
    Thank you for signing up with TailorCraft!
    
    Your verification OTP is: ${otp}
    
    This OTP will expire in ${config.otp.expiresInMinutes} minutes.
    
    If you didn't request this verification, please ignore this email.
    
    Best regards,
    The TailorCraft Team
  `;

  await sendEmail({
    to: email,
    subject: 'Verify Your Email - TailorCraft',
    htmlContent,
    textContent,
  });
};

/**
 * Send booking confirmation email
 */
export const sendBookingConfirmation = async (
  email: string,
  customerName: string,
  bookingId: string,
  bookingDetails: string
): Promise<void> => {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f4f4;
        }
        .email-wrapper {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
        }
        .header {
          background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }
        .header-icon {
          font-size: 48px;
          margin-bottom: 10px;
        }
        .header h1 {
          font-size: 28px;
          font-weight: 600;
          margin-bottom: 5px;
        }
        .header p {
          font-size: 16px;
          opacity: 0.95;
        }
        .content {
          padding: 40px 30px;
        }
        .greeting {
          font-size: 18px;
          color: #2c3e50;
          margin-bottom: 20px;
        }
        .greeting strong {
          color: #4CAF50;
        }
        .message {
          font-size: 16px;
          color: #555;
          margin-bottom: 30px;
          line-height: 1.8;
        }
        .booking-card {
          background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
          border: 1px solid #e0e0e0;
          border-left: 4px solid #4CAF50;
          border-radius: 8px;
          padding: 25px;
          margin: 30px 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        .booking-card-header {
          font-size: 14px;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 15px;
          font-weight: 600;
        }
        .booking-id {
          background-color: #f0f0f0;
          padding: 12px 16px;
          border-radius: 6px;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          color: #333;
          margin-bottom: 20px;
          word-break: break-all;
          border: 1px dashed #ccc;
        }
        .booking-details {
          font-size: 15px;
          color: #444;
          line-height: 1.9;
        }
        .booking-details strong {
          color: #2c3e50;
          display: inline-block;
          min-width: 120px;
        }
        .divider {
          height: 1px;
          background: linear-gradient(to right, transparent, #e0e0e0, transparent);
          margin: 25px 0;
        }
        .assurance-box {
          background-color: #e8f5e9;
          border-left: 4px solid #4CAF50;
          padding: 20px;
          border-radius: 6px;
          margin: 25px 0;
        }
        .assurance-box p {
          color: #2e7d32;
          font-size: 15px;
          margin: 0;
          display: flex;
          align-items: center;
        }
        .assurance-box .icon {
          font-size: 24px;
          margin-right: 12px;
        }
        .closing-message {
          font-size: 16px;
          color: #555;
          margin-top: 25px;
          text-align: center;
        }
        .signature {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px solid #f0f0f0;
          text-align: center;
        }
        .signature-text {
          font-size: 15px;
          color: #666;
          margin-bottom: 5px;
        }
        .company-name {
          font-size: 18px;
          font-weight: 600;
          color: #4CAF50;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .footer {
          background-color: #2c3e50;
          color: #ecf0f1;
          padding: 30px;
          text-align: center;
        }
        .footer-content {
          font-size: 13px;
          line-height: 1.8;
        }
        .footer-content p {
          margin: 5px 0;
        }
        .footer-divider {
          height: 1px;
          background-color: rgba(255, 255, 255, 0.1);
          margin: 15px 0;
        }
        .copyright {
          font-size: 12px;
          color: #95a5a6;
        }
        @media only screen and (max-width: 600px) {
          .content {
            padding: 30px 20px;
          }
          .header {
            padding: 30px 20px;
          }
          .header h1 {
            font-size: 24px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <!-- Header -->
        <div class="header">
          <div class="header-icon">🎉</div>
          <h1>Booking Confirmed!</h1>
          <p>Your order is now in our expert hands</p>
        </div>

        <!-- Content -->
        <div class="content">
          <div class="greeting">
            Hi <strong>${customerName}</strong>,
          </div>

          <div class="message">
            Thank you for choosing TailorCraft! We're excited to confirm that your booking has been received and is ready for processing.
          </div>

          <!-- Booking Card -->
          <div class="booking-card">
            <div class="booking-card-header">📋 Your Booking Details</div>
            
            <div class="booking-id">
              <strong>Booking ID:</strong><br>
              ${bookingId}
            </div>

            <div class="booking-details">
              ${bookingDetails}
            </div>
          </div>

          <!-- Assurance Message -->
          <div class="assurance-box">
            <p>
              <span class="icon">✂️</span>
              <span>We'll begin tailoring your order shortly. Expect excellence with every stitch!</span>
            </p>
          </div>

          <div class="divider"></div>

          <div class="closing-message">
            We're committed to delivering exceptional quality and craftsmanship.
          </div>

          <!-- Signature -->
          <div class="signature">
            <p class="signature-text">With warmest regards,</p>
            <div class="company-name">
              <span>✨</span>
              <span>The TailorCraft Team</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <div class="footer-content">
            <p>This is an automated confirmation email.</p>
            <p>Please save this email for your records.</p>
          </div>
          <div class="footer-divider"></div>
          <p class="copyright">© ${new Date().getFullYear()} TailorCraft. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
Hi ${customerName},

🎉 Your booking has been confirmed!

BOOKING DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━
Booking ID: ${bookingId}

${bookingDetails}
━━━━━━━━━━━━━━━━━━━━━━━━━━

✂️ We'll begin tailoring your order shortly. Expect excellence with every stitch!

We're committed to delivering exceptional quality and craftsmanship.

With warmest regards,
✨ The TailorCraft Team

━━━━━━━━━━━━━━━━━━━━━━━━━━
This is an automated confirmation email.
Please save this email for your records.

© ${new Date().getFullYear()} TailorCraft. All rights reserved.
  `;

  await sendEmail({
    to: email,
    subject: '🎉 Your TailorCraft Booking is Confirmed!',
    htmlContent,
    textContent,
  });
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  resetToken: string
): Promise<void> => {
  const resetLink = `${config.frontend.url}/reset-password?token=${resetToken}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background-color: #f9f9f9;
          border-radius: 5px;
          padding: 20px;
        }
        .header {
          background-color: #4CAF50;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          background-color: white;
          padding: 30px;
          border-radius: 0 0 5px 5px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background-color: #4CAF50;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: bold;
        }
        .token-box {
          background-color: #f5f5f5;
          border: 2px dashed #4CAF50;
          border-radius: 5px;
          padding: 15px;
          margin: 20px 0;
          text-align: center;
          font-size: 14px;
          word-break: break-all;
        }
        .warning {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 10px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Reset Your Password</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${name}</strong>,</p>
          <p>We received a request to reset your password for your TailorCraft account. Click the button below to reset your password:</p>
          
          <div style="text-align: center;">
            <a href="${resetLink}" class="button">Reset Password</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <div class="token-box">
            ${resetLink}
          </div>
          
          <div class="warning">
            <p><strong>⚠️ Important:</strong></p>
            <ul>
              <li>This link will expire in 1 hour</li>
              <li>If you didn't request a password reset, please ignore this email</li>
              <li>For security reasons, never share this link with anyone</li>
            </ul>
          </div>
          
          <p>Best regards,<br>The TailorCraft Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    Hello ${name},
    
    We received a request to reset your password for your TailorCraft account.
    
    Click the link below to reset your password:
    ${resetLink}
    
    This link will expire in 1 hour.
    
    If you didn't request a password reset, please ignore this email.
    
    Best regards,
    The TailorCraft Team
  `;

  await sendEmail({
    to: email,
    subject: 'Reset Your Password - TailorCraft',
    htmlContent,
    textContent,
  });
};

/**
 * Send payment confirmation email
 */
export const sendPaymentConfirmation = async (
  email: string,
  customerName: string,
  orderId: string,
  amount: number,
  paystackReference: string
): Promise<void> => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #4CAF50;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          background-color: #f9f9f9;
          padding: 30px;
          border-radius: 0 0 5px 5px;
        }
        .payment-details {
          background-color: #fff;
          padding: 20px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .amount {
          font-size: 24px;
          font-weight: bold;
          color: #4CAF50;
          text-align: center;
          margin: 20px 0;
        }
        .reference {
          background-color: #f0f0f0;
          padding: 10px;
          border-radius: 3px;
          font-family: monospace;
          word-break: break-all;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Payment Confirmed</h1>
        </div>
        <div class="content">
          <p>Dear <strong>${customerName}</strong>,</p>
          
          <p>Thank you for your payment! Your transaction has been processed successfully.</p>
          
          <div class="payment-details">
            <p><strong>Order ID:</strong> ${orderId}</p>
            <div class="amount">₦${amount.toFixed(2)}</div>
            
            <div style="margin-top: 20px; padding: 15px; background-color: #e8f5e9; border-radius: 5px;">
              <strong>Transaction Reference:</strong>
              <div class="reference">${paystackReference}</div>
            </div>
          </div>
          
          <p>Your order is being processed and you will receive updates soon.</p>
          
          <p>If you have any questions, please don't hesitate to contact us.</p>
          
          <div class="footer">
            <p>© 2024 TailorCraft. All rights reserved.</p>
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    Dear ${customerName},
    
    Thank you for your payment!
    
    Order ID: ${orderId}
    Amount: ₦${amount.toFixed(2)}
    Transaction Reference: ${paystackReference}
    
    Your order is being processed and you will receive updates soon.
    
    Best regards,
    The TailorCraft Team
  `;

  await sendEmail({
    to: email,
    subject: `Payment Confirmation - Order #${orderId}`,
    htmlContent,
    textContent,
  });
};

/**
 * Send feedback notification to admin
 */
export const sendFeedbackNotification = async (
  email: string,
  feedbackMessage: string
): Promise<void> => {
  const adminEmail = config.admin.email;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #2563eb;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          background-color: #f9f9f9;
          padding: 30px;
          border-radius: 0 0 5px 5px;
        }
        .feedback-box {
          background-color: #fff;
          border-left: 4px solid #2563eb;
          padding: 20px;
          margin: 20px 0;
        }
        .email-info {
          background-color: #f0f0f0;
          padding: 10px;
          border-radius: 3px;
          margin: 10px 0;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💬 New Platform Feedback</h1>
        </div>
        <div class="content">
          <p><strong>A visitor has submitted feedback about TailorCraft</strong></p>
          
          <div class="email-info">
            <strong>From:</strong> <a href="mailto:${email}">${email}</a>
          </div>
          
          <div class="feedback-box">
            <p><strong>Feedback Message:</strong></p>
            <p>${feedbackMessage}</p>
          </div>
          
          <p>Log in to the admin dashboard to view and manage this feedback.</p>
          
          <div style="text-align: center; margin-top: 20px;">
            <a href="mailto:${email}?subject=Re: Your feedback on TailorCraft" 
               style="display: inline-block; padding: 12px 30px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Reply to ${email}
            </a>
          </div>
        </div>
        <div class="footer">
          <p>© 2024 TailorCraft. All rights reserved.</p>
          <p>This is an automated notification.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    New Platform Feedback Received
    
    From: ${email}
    
    Feedback Message:
    ${feedbackMessage}
    
    Log in to the admin dashboard to view and manage this feedback.
    Reply to: ${email}
    
    Best regards,
    TailorCraft System
  `;

  await sendEmail({
    to: adminEmail,
    subject: '💬 New Platform Feedback - TailorCraft',
    htmlContent,
    textContent,
  });
};

/**
 * Send contact message notification to admin
 */
export const sendContactNotification = async (
  name: string,
  email: string,
  subject: string,
  message: string
): Promise<void> => {
  const adminEmail = config.admin.email;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #16a34a;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          background-color: #f9f9f9;
          padding: 30px;
          border-radius: 0 0 5px 5px;
        }
        .contact-details {
          background-color: #fff;
          border: 2px solid #16a34a;
          padding: 20px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .detail-row {
          margin: 10px 0;
          padding: 8px;
          background-color: #f0fdf4;
          border-radius: 3px;
        }
        .message-box {
          background-color: #fff;
          border-left: 4px solid #16a34a;
          padding: 20px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          font-size: 12px;
          color: #666;
        }
        .reply-button {
          display: inline-block;
          padding: 12px 30px;
          background-color: #16a34a;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✉️ New Contact Message</h1>
        </div>
        <div class="content">
          <p><strong>You have received a new contact message from your website</strong></p>
          
          <div class="contact-details">
            <div class="detail-row">
              <strong>From:</strong> ${name}
            </div>
            <div class="detail-row">
              <strong>Email:</strong> <a href="mailto:${email}">${email}</a>
            </div>
            <div class="detail-row">
              <strong>Subject:</strong> ${subject}
            </div>
          </div>
          
          <div class="message-box">
            <p><strong>Message:</strong></p>
            <p>${message}</p>
          </div>
          
          <div style="text-align: center;">
            <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}" class="reply-button">Reply to ${name}</a>
          </div>
          
          <p style="margin-top: 20px; font-size: 14px; color: #666;">
            You can also manage this message from your admin dashboard.
          </p>
        </div>
        <div class="footer">
          <p>© 2024 TailorCraft. All rights reserved.</p>
          <p>This is an automated notification.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    New Contact Message Received
    
    From: ${name}
    Email: ${email}
    Subject: ${subject}
    
    Message:
    ${message}
    
    Reply to this message by emailing: ${email}
    
    You can also manage this message from your admin dashboard.
    
    Best regards,
    TailorCraft System
  `;

  await sendEmail({
    to: adminEmail,
    subject: `✉️ New Contact Message: ${subject}`,
    htmlContent,
    textContent,
  });
};
