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
      <title>Booking Confirmation - TailorCraft</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px 10px;
        }
        
        .email-container {
          max-width: 650px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        
        /* Top Navigation Bar */
        .navbar {
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
          padding: 16px 30px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 3px solid #fbbf24;
        }
        
        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .logo-icon {
          width: 36px;
          height: 36px;
          background: #fbbf24;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }
        
        .logo-text {
          color: #ffffff;
          font-size: 20px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        
        .nav-status {
          background: rgba(251, 191, 36, 0.2);
          padding: 6px 16px;
          border-radius: 20px;
          color: #fbbf24;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        /* Hero Section */
        .hero {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          padding: 50px 30px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        
        .hero::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 30px 30px;
          animation: pulse 20s linear infinite;
        }
        
        @keyframes pulse {
          0% { transform: translate(0, 0); }
          100% { transform: translate(30px, 30px); }
        }
        
        .success-icon {
          width: 80px;
          height: 80px;
          background: #ffffff;
          border-radius: 50%;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
          position: relative;
          z-index: 1;
        }
        
        .hero h1 {
          color: #ffffff;
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 10px;
          position: relative;
          z-index: 1;
        }
        
        .hero p {
          color: rgba(255, 255, 255, 0.95);
          font-size: 18px;
          font-weight: 400;
          position: relative;
          z-index: 1;
        }
        
        /* Main Content */
        .content {
          padding: 45px 35px;
          background: #ffffff;
        }
        
        .greeting {
          font-size: 20px;
          color: #1f2937;
          margin-bottom: 20px;
          font-weight: 500;
        }
        
        .greeting .name {
          color: #3b82f6;
          font-weight: 700;
        }
        
        .intro-message {
          color: #6b7280;
          font-size: 16px;
          line-height: 1.8;
          margin-bottom: 35px;
          padding: 20px;
          background: linear-gradient(to right, #f0f9ff, #e0f2fe);
          border-left: 4px solid #3b82f6;
          border-radius: 8px;
        }
        
        /* Booking Details Card */
        .booking-card {
          background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 30px;
          margin: 30px 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          position: relative;
        }
        
        .booking-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
          border-radius: 12px 12px 0 0;
        }
        
        .card-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: #6b7280;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 1.2px;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 2px solid #f3f4f6;
        }
        
        .card-icon {
          font-size: 20px;
        }
        
        .booking-id-section {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 25px;
          box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
        }
        
        .booking-id-label {
          color: rgba(255, 255, 255, 0.9);
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
          font-weight: 600;
        }
        
        .booking-id-value {
          color: #ffffff;
          font-family: 'Courier New', monospace;
          font-size: 16px;
          font-weight: 700;
          word-break: break-all;
          background: rgba(0, 0, 0, 0.2);
          padding: 12px;
          border-radius: 6px;
          border: 1px dashed rgba(255, 255, 255, 0.3);
        }
        
        .details-content {
          color: #374151;
          font-size: 15px;
          line-height: 2;
          padding: 10px 0;
        }
        
        .details-content strong {
          color: #1f2937;
          font-weight: 600;
          display: inline-block;
          min-width: 140px;
        }
        
        /* Status Badge */
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ffffff;
          padding: 16px 24px;
          border-radius: 12px;
          margin: 30px 0;
          font-size: 15px;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        
        .status-badge .badge-icon {
          font-size: 24px;
        }
        
        /* Process Timeline */
        .timeline {
          background: #f9fafb;
          border-radius: 12px;
          padding: 25px;
          margin: 30px 0;
          border: 1px solid #e5e7eb;
        }
        
        .timeline-item {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
          align-items: flex-start;
        }
        
        .timeline-item:last-child {
          margin-bottom: 0;
        }
        
        .timeline-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #8b5cf6, #6d28d9);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 18px;
          flex-shrink: 0;
          box-shadow: 0 4px 8px rgba(139, 92, 246, 0.3);
        }
        
        .timeline-content h4 {
          color: #1f2937;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 4px;
        }
        
        .timeline-content p {
          color: #6b7280;
          font-size: 14px;
          line-height: 1.6;
        }
        
        /* CTA Section */
        .cta-section {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-radius: 12px;
          padding: 30px;
          text-align: center;
          margin: 30px 0;
          border: 2px solid #fbbf24;
        }
        
        .cta-section h3 {
          color: #92400e;
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 10px;
        }
        
        .cta-section p {
          color: #78350f;
          font-size: 15px;
          line-height: 1.7;
        }
        
        /* Signature */
        .signature {
          text-align: center;
          padding: 30px 0;
          border-top: 2px solid #f3f4f6;
          margin-top: 40px;
        }
        
        .signature-text {
          color: #6b7280;
          font-size: 15px;
          margin-bottom: 12px;
          font-style: italic;
        }
        
        .company-signature {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 22px;
          font-weight: 700;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .signature-icon {
          font-size: 28px;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        }
        
        /* Footer */
        .footer {
          background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
          padding: 40px 30px;
          color: #d1d5db;
        }
        
        .footer-content {
          text-align: center;
          margin-bottom: 20px;
        }
        
        .footer-links {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin: 20px 0;
          flex-wrap: wrap;
        }
        
        .footer-link {
          color: #9ca3af;
          text-decoration: none;
          font-size: 13px;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 6px;
          transition: all 0.3s ease;
        }
        
        .footer-divider {
          height: 1px;
          background: linear-gradient(to right, transparent, #374151, transparent);
          margin: 25px 0;
        }
        
        .social-icons {
          display: flex;
          justify-content: center;
          gap: 15px;
          margin: 20px 0;
        }
        
        .social-icon {
          width: 36px;
          height: 36px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9ca3af;
          font-size: 16px;
          transition: all 0.3s ease;
        }
        
        .copyright {
          text-align: center;
          color: #6b7280;
          font-size: 13px;
          padding-top: 10px;
        }
        
        @media only screen and (max-width: 600px) {
          .navbar {
            padding: 12px 20px;
          }
          
          .hero {
            padding: 40px 20px;
          }
          
          .hero h1 {
            font-size: 28px;
          }
          
          .content {
            padding: 30px 20px;
          }
          
          .booking-card {
            padding: 20px;
          }
          
          .footer-links {
            flex-direction: column;
            gap: 10px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        
        <!-- Navigation Bar -->
        <div class="navbar">
          <div class="logo">
            <div class="logo-icon">✂️</div>
            <div class="logo-text">TailorCraft</div>
          </div>
          <div class="nav-status">Confirmed</div>
        </div>
        
        <!-- Hero Section -->
        <div class="hero">
          <div class="success-icon">✓</div>
          <h1>Booking Confirmed!</h1>
          <p>Your journey to exceptional tailoring begins now</p>
        </div>
        
        <!-- Main Content -->
        <div class="content">
          
          <div class="greeting">
            Hello <span class="name">${customerName}</span>! 👋
          </div>
          
          <div class="intro-message">
            <strong>Thank you for choosing TailorCraft!</strong> We're thrilled to confirm that your booking has been successfully received. Our master craftsmen are preparing to bring your vision to life with precision and care.
          </div>
          
          <!-- Booking Details Card -->
          <div class="booking-card">
            <div class="card-title">
              <span class="card-icon">📋</span>
              <span>Your Booking Information</span>
            </div>
            
            <div class="booking-id-section">
              <div class="booking-id-label">Booking Reference Number</div>
              <div class="booking-id-value">${bookingId}</div>
            </div>
            
            <div class="details-content">
              ${bookingDetails}
            </div>
          </div>
          
          <!-- Status Badge -->
          <div class="status-badge">
            <span class="badge-icon">🎯</span>
            <span>Order Confirmed & Ready for Processing</span>
          </div>
          
          <!-- Timeline -->
          <div class="timeline">
            <div class="timeline-item">
              <div class="timeline-icon">✂️</div>
              <div class="timeline-content">
                <h4>Expert Crafting</h4>
                <p>Our skilled artisans will begin tailoring your order with meticulous attention to detail.</p>
              </div>
            </div>
            
            <div class="timeline-item">
              <div class="timeline-icon">👔</div>
              <div class="timeline-content">
                <h4>Quality Assurance</h4>
                <p>Every stitch is inspected to ensure perfection and meet our premium standards.</p>
              </div>
            </div>
            
            <div class="timeline-item">
              <div class="timeline-icon">🚚</div>
              <div class="timeline-content">
                <h4>Ready for Delivery</h4>
                <p>Your masterpiece will be carefully prepared and delivered as scheduled.</p>
              </div>
            </div>
          </div>
          
          <!-- CTA Section -->
          <div class="cta-section">
            <h3>✨ Excellence in Every Stitch</h3>
            <p>We're committed to delivering exceptional quality and craftsmanship that exceeds your expectations. Your satisfaction is our masterpiece.</p>
          </div>
          
          <!-- Signature -->
          <div class="signature">
            <p class="signature-text">With warmest regards and dedication to excellence,</p>
            <div class="company-signature">
              <span class="signature-icon">✨</span>
              <span>The TailorCraft Team</span>
            </div>
          </div>
          
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <div class="footer-content">
            <p style="margin-bottom: 15px; font-size: 14px;">Need assistance? We're here to help!</p>
            
            <div class="footer-links">
              <a href="#" class="footer-link">Track Order</a>
              <a href="#" class="footer-link">Contact Support</a>
              <a href="#" class="footer-link">FAQs</a>
              <a href="#" class="footer-link">Manage Bookings</a>
            </div>
            
            <div class="social-icons">
              <div class="social-icon">📧</div>
              <div class="social-icon">📱</div>
              <div class="social-icon">💬</div>
              <div class="social-icon">🌐</div>
            </div>
          </div>
          
          <div class="footer-divider"></div>
          
          <div class="copyright">
            <p>This is an automated confirmation email. Please save for your records.</p>
            <p style="margin-top: 8px;">© ${new Date().getFullYear()} TailorCraft. All rights reserved. | Premium Tailoring Services</p>
          </div>
        </div>
        
      </div>
    </body>
    </html>
  `;

  const textContent = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        ✂️ TAILORCRAFT - BOOKING CONFIRMED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hello ${customerName}! 👋

✓ BOOKING SUCCESSFULLY CONFIRMED

Thank you for choosing TailorCraft! We're thrilled to confirm 
that your booking has been successfully received. Our master 
craftsmen are preparing to bring your vision to life.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 YOUR BOOKING INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Booking Reference Number:
${bookingId}

${bookingDetails}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 WHAT HAPPENS NEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✂️ EXPERT CRAFTING
   Our skilled artisans will begin tailoring your order 
   with meticulous attention to detail.

👔 QUALITY ASSURANCE
   Every stitch is inspected to ensure perfection and 
   meet our premium standards.

🚚 READY FOR DELIVERY
   Your masterpiece will be carefully prepared and 
   delivered as scheduled.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXCELLENCE IN EVERY STITCH

We're committed to delivering exceptional quality and 
craftsmanship that exceeds your expectations. Your 
satisfaction is our masterpiece.

With warmest regards and dedication to excellence,
The TailorCraft Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Need assistance? Contact our support team anytime.

This is an automated confirmation email.
Please save this for your records.

© ${new Date().getFullYear()} TailorCraft. All rights reserved.
Premium Tailoring Services
  `;

  await sendEmail({
    to: email,
    subject: '✓ Booking Confirmed - Your TailorCraft Journey Begins!',
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
