import config from "../config/config";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export const sendEmail = async ({
  to,
  subject,
  html,
  text,
}: EmailPayload) => {
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_API_KEY as string,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          email: config.email.from,
          name: "TailorCraft",
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        textContent: text,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(error);
    }

    console.log(`📧 Email sent to ${to}`);
  } catch (err) {
    console.error("Email failed:", err);
    throw err;
  }
};
