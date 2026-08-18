import z from "zod";



export const aiListSchema = z.object({
    folderId: z.string().trim().min(1).optional(),
    startDate: z.union([z.string(), z.date()]).optional(),
    endDate: z.union([z.string(), z.date()]).optional(),
    limit: z.number().int().min(1).max(30).optional(),
    includeArchived: z.boolean().optional(),
}).optional();
