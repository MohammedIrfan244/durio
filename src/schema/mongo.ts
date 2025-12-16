import { z } from "zod";

export const MONGOID = z.string().refine(
  (val) => /^[0-9a-fA-F]{24}$/.test(val),
  { message: "Invalid ObjectId" }
);

