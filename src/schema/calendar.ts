import z from "zod";
import { MONGOID } from "./mongo";



export const eventCreateSchema = z.object({
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(10000).optional(),
    location: z.string().trim().max(200).optional(),
    isAllDay: z.boolean().optional(),
    startDate: z.union([z.string(), z.date()]).transform((value) => new Date(value)),
    endDate: z.union([z.string(), z.date()]).transform((value) => new Date(value)),
    categoryId: MONGOID.optional(),
    linkedResources: z.array(z.object({
        id: MONGOID,
        type: z.enum(["EVENT", "TODO", "NOTE", "PROJECT"]),
    })).max(20).optional(),
});

export const searchSchema = z.string().trim().max(100);
