import {z} from "zod";
import { MONGOID } from "./mongo";

// SERVER LOGS
export const createServerLogSchema = z.object({
  level: z.enum(["INFO", "WARN", "ERROR"]).optional(),
  message: z.string().min(1, "Message is required").max(1000, "Message cannot exceed 1000 characters"),
  userId: MONGOID.optional(),
});


export type CreateServerLogInput = z.infer<typeof createServerLogSchema>;