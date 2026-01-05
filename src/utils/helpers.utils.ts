import crypto from "crypto";
import nodemailer from "nodemailer";
import config from "../config/config";
import argon2 from "argon2";

// Initialize 
// const transporter = nodemailer.createTransport({
//   service: config.email.service, // "gmail"
//   auth: {
//     user: config.email.user,
//     pass: config.email.pass,
//   },
// });

// Try port 465 (SSL) for better compatibility with cloud hosting providers
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
  // Add timeout and connection settings for Render
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 10000,
});


export const debugGmailSetup = async () => {
  console.log("=== Gmail Configuration Debug ===");
  console.log("Service:", config.email.service);
  console.log("User exists:", !!config.email.user);
  console.log("From email:", config.email.from);

  try {
    await transporter.verify();
    console.log("Transporter is ready to send emails ✅");
  } catch (err) {
    console.error("Transporter verification failed ❌", err);
    // Don't throw, just log - verification can be done separately
  }
  console.log("===================================");
};


export const generateOtp = (length = 6) => {
  const digits = "0123456789";
  let otp = "";

  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
};

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
    // Only verify in development to avoid timeout on every email
    if (process.env.NODE_ENV === 'development') {
      await debugGmailSetup();
    }

    const mailOptions = {
      from: config.email.from,
      to,
      subject,
      text,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error("Email sending failed:", error);
    console.error("Email config status:", {
      hasEmailUser: !!config.email.user,
      hasEmailPass: !!config.email.pass,
      emailFrom: config.email.from,
      targetEmail: to
    });
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : "Unknown email error";
    throw new Error(`Failed to send email: ${errorMessage}`);
  }
};

// Enhanced OTP email function
export const sendOTPEmail = async (email: string, otp: string): Promise<void> => {
  const subject = 'Your OTP Code - TailorCraft';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OTP Verification</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">TailorCraft</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Verification Code</p>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
            <h2 style="color: #333; margin-bottom: 20px;">Your OTP Code</h2>
            <p style="margin-bottom: 25px; font-size: 16px;">
                Use the following One-Time Password (OTP) to complete your verification:
            </p>
            
            <div style="background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
                <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px;">${otp}</span>
            </div>
            
            <p style="margin-top: 25px; font-size: 14px; color: #666;">
                <strong>Important:</strong> This OTP will expire in ${config.otp.expiresInMinutes} minutes for security reasons.
            </p>
            
            <p style="margin-top: 20px; font-size: 14px; color: #666;">
                If you didn't request this code, please ignore this email or contact support if you have concerns.
            </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding: 20px; color: #666; font-size: 12px;">
            <p>© 2024 TailorCraft. All rights reserved.</p>
            <p>This email was sent to ${email}</p>
        </div>
    </body>
    </html>
  `;

  const text = `
    TailorCraft - OTP Verification
    
    Your verification code is: ${otp}
    
    This code will expire in ${config.otp.expiresInMinutes} minutes.
    
    If you didn't request this code, please ignore this email.
  `;

  await sendEmail({
    to: email,
    subject,
    html,
    text
  });
};

// Welcome email function
export const sendWelcomeEmail = async (email: string, name: string): Promise<void> => {
  const subject = 'Welcome to TailorCraft!';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to TailorCraft</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to TailorCraft!</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Your account is ready</p>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${name}!</h2>
            <p style="margin-bottom: 20px; font-size: 16px;">
                Welcome to TailorCraft! Your account has been successfully created and verified.
            </p>
            
            <p style="margin-bottom: 20px;">
                You can now start using our platform to manage your tailoring business efficiently.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="#" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                    Get Started
                </a>
            </div>
            
            <p style="margin-top: 25px; font-size: 14px; color: #666;">
                If you have any questions, feel free to contact our support team.
            </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding: 20px; color: #666; font-size: 12px;">
            <p>© 2024 TailorCraft. All rights reserved.</p>
            <p>This email was sent to ${email}</p>
        </div>
    </body>
    </html>
  `;

  const text = `
    Welcome to TailorCraft!
    
    Hello ${name}!
    
    Welcome to TailorCraft! Your account has been successfully created and verified.
    
    You can now start using our platform to manage your tailoring business efficiently.
    
    If you have any questions, feel free to contact our support team.
    
    © 2024 TailorCraft. All rights reserved.
  `;

  await sendEmail({
    to: email,
    subject,
    html,
    text
  });
};

export const generateRandomToken = (length = 32): string => {
  return crypto.randomBytes(length).toString("hex");
};

export const hashPassword = async (password: string): Promise<string> => {
  return await argon2.hash(password);
};

export const verifyPassword = async (
  hashedPassword: string,
  candidatePassword: string
): Promise<boolean> => {
  return await argon2.verify(hashedPassword, candidatePassword);
};

export const safeJsonParse = <T>(str: string): T | null => {
  try {
    return JSON.parse(str) as T;
  } catch (error) {
    console.log(error)
    return null;
  }
};

export const toQueryString = (obj: Record<string, any>): string => {
  return Object.entries(obj)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const formatDate = (date: Date, format = "yyyy-MM-dd"): string => {
  return format
    .replace("yyyy", date.getFullYear().toString())
    .replace("MM", (date.getMonth() + 1).toString().padStart(2, "0"))
    .replace('dd', date.getDate().toString().padStart(2, '0'))
    .replace('HH', date.getHours().toString().padStart(2, '0'))
    .replace('mm', date.getMinutes().toString().padStart(2, '0'))
    .replace('ss', date.getSeconds().toString().padStart(2, '0'))
};

export const isValidEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email)
};

export const isValidPhone = (phone: string): boolean => {
    const re = /^\+?[\d\s-]{10,15}$/;
    return re.test(phone);
}