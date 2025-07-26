import crypto from "crypto";
import nodemailer from "nodemailer";
import config from "../config/config";
import argon2 from "argon2";

export const generateOtp = (lenght = 6) => {
  const digits = "0123456789";
  let otp = "";

  for (let i = 0; i < lenght; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
};

export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  const transporter = nodemailer.createTransport({
    host: config.email.smtp.host,
    port: config.email.smtp.port,
    secure: config.email.smtp.port === 465,
    auth: {
      user: config.email.smtp.auth.user,
      pass: config.email.smtp.auth.pass,
    },
  });
  await transporter.sendMail({
    from: config.email.from,
    to,
    subject,
    html,
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
    .replace('ss', date.getSeconds().toString().padStart(2, '2'))
};

export const isValidEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email)
};

export const isValidPhone = (phone: string): boolean => {
    const re = /^\+?[\d\s-]{10,15}$/;
    return re.test(phone);
}


