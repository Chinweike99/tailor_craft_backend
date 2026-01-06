import nodemailer from "nodemailer";
import config from "../config/config";
import SibApiV3Sdk from "sib-api-v3-sdk";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

const isDev = config.env === "development";

/* -------------------------------
   DEV: SMTP (local only)
-------------------------------- */
let devTransporter: nodemailer.Transporter | null = null;

if (isDev && config.email.user && config.email.pass) {
  devTransporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

/* -------------------------------
   PROD: BREVO HTTP API
-------------------------------- */
const brevoClient = SibApiV3Sdk.ApiClient.instance;
brevoClient.authentications["api-key"].apiKey =
  process.env.BREVO_API_KEY!;

const transactionalApi = new SibApiV3Sdk.TransactionalEmailsApi();

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
    if (isDev && devTransporter) {
      await devTransporter.sendMail({
        from: config.email.from,
        to,
        subject,
        html,
        text,
      });

      console.log(` [DEV] Email sent to ${to}`);
      return;
    }

    await transactionalApi.sendTransacEmail({
      sender: {
        email: config.email.from,
        name: "TailorCraft",
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
    });

    console.log(`📧 [PROD] Email sent to ${to}`);
  } catch (err) {
    console.error("❌ Email failed:", err);
  }
};
