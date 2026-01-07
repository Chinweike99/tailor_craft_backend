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
        .booking-details {
          background-color: #fff;
          border: 2px solid #4CAF50;
          padding: 20px;
          border-radius: 5px;
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
          <h1>✅ Booking Confirmed</h1>
        </div>
        <div class="content">
          <p>Dear <strong>${customerName}</strong>,</p>
          
          <p>Your booking has been confirmed successfully!</p>
          
          <div class="booking-details">
            <p><strong>Booking ID:</strong> ${bookingId}</p>
            <p>${bookingDetails}</p>
          </div>
          
          <p>We look forward to serving you!</p>
          
          <p>Best regards,<br>The TailorCraft Team</p>
        </div>
        <div class="footer">
          <p>© 2024 TailorCraft. All rights reserved.</p>
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    Dear ${customerName},
    
    Your booking has been confirmed successfully!
    
    Booking ID: ${bookingId}
    ${bookingDetails}
    
    We look forward to serving you!
    
    Best regards,
    The TailorCraft Team
  `;

  await sendEmail({
    to: email,
    subject: `Booking Confirmation - ${bookingId}`,
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
