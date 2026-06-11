import { PrismaClient } from "@prisma/client";
import { error, info } from "./utils/logger";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  (() => {
    const client = new PrismaClient({
      log: ["error", "warn"],
    });
    
    client.$connect()
      .then(() => info("MongoDB: Connected successfully"))
      .catch((err) => error(" MongoDB: Connection failed", err));
      
    return client;
  })();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
