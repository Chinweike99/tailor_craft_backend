import sgMail from "@sendgrid/mail";
import config from "../config/config";

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export const sendEmail = async ({ to, subject, html, text }: EmailPayload) => {
  try {
    await sgMail.send({
      to,
      from: config.email.from,
      subject,
      html,
      text,
    });
    console.log(`📧 Email sent to ${to}`);
  } catch (err) {
    console.error("❌ Email failed:", err);
    throw err;
  }
};
