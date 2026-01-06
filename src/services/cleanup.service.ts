import { prisma } from "../config/database";
import cron from "node-cron";

/**
 * Cleanup service to delete expired OTP records from PendingVerification table
 * This allows users to re-register with the same email if their OTP expires
 */

/**
 * Delete expired pending verification records
 */
export const cleanupExpiredOTPs = async () => {
  try {
    const result = await prisma.pendingVerification.deleteMany({
      where: {
        otpExpires: {
          lt: new Date(),
        },
      },
    });

    if (result.count > 0) {
      console.log(`🧹 Cleanup: Deleted ${result.count} expired OTP record(s)`);
    }

    return result.count;
  } catch (error) {
    console.error("❌ Error cleaning up expired OTPs:", error);
    return 0;
  }
};

/**
 * Delete expired revoked tokens
 */
export const cleanupExpiredTokens = async () => {
  try {
    const result = await prisma.revokedToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    if (result.count > 0) {
      console.log(`🧹 Cleanup: Deleted ${result.count} expired token(s)`);
    }

    return result.count;
  } catch (error) {
    console.error("❌ Error cleaning up expired tokens:", error);
    return 0;
  }
};

/**
 * Run all cleanup tasks
 */
export const runCleanup = async () => {
  console.log("🧹 Running scheduled cleanup tasks...");
  await cleanupExpiredOTPs();
  await cleanupExpiredTokens();
};

/**
 * Initialize cleanup cron job
 * Runs every 5 minutes
 */
export const initCleanupService = () => {
  cron.schedule("*/5 * * * *", async () => {
    await runCleanup();
  });

  console.log("✅ Cleanup service initialized - running every 5 minutes");
  runCleanup();
};
