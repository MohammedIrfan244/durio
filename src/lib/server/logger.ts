import pino from "pino";
import { prisma } from "@/lib/prisma";

// High-performance logger for standard application events
export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
});

/**
 * System Audit Logger
 * Use this for high-value events (Admin actions, Bulk deletions, Account deletions).
 * It logs to standard out AND writes asynchronously to the MongoDB SystemLog table.
 */
export const auditLogger = {
  info: (message: string, userId?: string, metadata?: Record<string, any>) => {
    logger.info({ userId, ...metadata }, message);
    logToDatabase("INFO", message, userId, metadata);
  },
  warn: (message: string, userId?: string, metadata?: Record<string, any>) => {
    logger.warn({ userId, ...metadata }, message);
    logToDatabase("WARNING", message, userId, metadata);
  },
  error: (message: string, userId?: string, metadata?: Record<string, any>) => {
    logger.error({ userId, ...metadata }, message);
    logToDatabase("ERROR", message, userId, metadata);
  },
};

function logToDatabase(
  level: "INFO" | "WARNING" | "ERROR",
  message: string,
  userId?: string,
  metadata?: Record<string, any>
) {
  // Fire and forget (no await) to prevent slowing down the request
  prisma.systemLog
    .create({
      data: {
        level,
        message,
        userId,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
      },
    })
    .catch((err) => {
      // Fallback if DB write fails
      logger.error("Failed to write audit log to database:", err);
    });
}
