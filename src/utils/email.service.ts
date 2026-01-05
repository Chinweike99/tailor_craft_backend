/**
 * Unified Email Service
 * Supports Gmail, Resend, SendGrid, and other providers
 */

import nodemailer from "nodemailer";
import config from "../config/config";

// Create transporter based on email service
const createTransporter = () => {
  const service = config.email.service.toLowerCase();

  // For Resend or SendGrid (using SMTP)
  if (service === 'resend') {
    return nodemailer.createTransport({
      host: "smtp.resend.com",
      port: 465,
      secure: true,
      auth: {
        user: "resend",
        pass: process.env.RESEND_API_KEY as string,
      },
    });
  }

  if (service === 'sendgrid') {
    return nodemailer.createTransport({
      host: "smtp.sendgrid.net",
      port: 465,
      secure: true,
      auth: {
        user: "apikey",
        pass: process.env.SENDGRID_API_KEY as string,
      },
    });
  }

  // Default to Gmail with SSL (port 465)
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });
};

const transporter = createTransporter();

/**
 * Verify email transporter configuration
 */
export const verifyEmailConfig = async () => {
  console.log("=== Email Configuration Debug ===");
  console.log("Service:", config.email.service);
  console.log("User exists:", !!config.email.user);
  console.log("From email:", config.email.from);

  try {
    await transporter.verify();
    console.log("✅ Email transporter is ready");
  } catch (err) {
    console.error("Email transporter verification failed:", err);
  }
  console.log("===================================");
};

/**
 * Send email using configured provider
 */
export const sendEmail = async ({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) => {
  try {
    // Only verify once on startup, not on every email send
    if (process.env.NODE_ENV === 'development') {
      await verifyEmailConfig();
    }

    const mailOptions = {
      from: config.email.from,
      to,
      subject,
      text,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${to}`);
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    console.error("Email config status:", {
      service: config.email.service,
      hasEmailUser: !!config.email.user,
      hasEmailPass: !!config.email.pass,
      hasResendKey: !!process.env.RESEND_API_KEY,
      hasSendGridKey: !!process.env.SENDGRID_API_KEY,
      emailFrom: config.email.from,
      targetEmail: to,
    });
    const errorMessage = error instanceof Error ? error.message : "Unknown email error";
    throw new Error(`Failed to send email: ${errorMessage}`);
  }
};

export default { sendEmail, verifyEmailConfig };
