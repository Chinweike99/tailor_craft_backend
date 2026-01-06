import nodemailer from "nodemailer";
import config from "../config/config";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

/* -------------------------------
   UNIFIED SMTP TRANSPORTER
   Works for both dev and prod using Brevo
-------------------------------- */
const createTransporter = () => {
  const service = config.email.service?.toLowerCase();

  // Brevo (Sendinblue) SMTP
  if (service === 'brevo' || service === 'sendinblue') {
    return nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false, // use TLS
      auth: {
        user: process.env.BREVO_SMTP_USER || config.email.user,
        pass: process.env.BREVO_SMTP_KEY || config.email.pass,
      },
    });
  }

  // Gmail fallback
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });
};

const transporter = createTransporter();

/* -------------------------------
   VERIFY EMAIL CONFIGURATION
-------------------------------- */
export const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log(`✅ Email service (${config.email.service}) is ready`);
  } catch (err) {
    console.error("❌ Email verification failed:", err);
  }
};

/* -------------------------------
   SEND EMAIL
-------------------------------- */
export const sendEmail = async ({
  to,
  subject,
  html,
  text,
}: EmailPayload) => {
  try {
    await transporter.sendMail({
      from: config.email.from,
      to,
      subject,
      html,
      text,
    });

    console.log(`📧 Email sent successfully to ${to}`);
  } catch (err) {
    console.error("❌ Email failed:", err);
    console.error("Email config:", {
      service: config.email.service,
      from: config.email.from,
      to,
    });
    // Log but don't throw to prevent registration failures
  }
};
