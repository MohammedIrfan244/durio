"use server";

import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/server/get-user";
import { revalidatePath } from "next/cache";
import { 
    ResourceType, 
    ILinkedResource, 
    IResourceLinkInput 
} from "@/types/resource-link";
import { z } from "zod";
import { MONGOID } from "@/schema/mongo";

const resourceTypeSchema = z.enum(["EVENT", "TODO", "NOTE", "PROJECT"]);
const resourceLinkInputSchema = z.object({
    fromId: MONGOID,
    fromType: resourceTypeSchema,
    toId: MONGOID,
    toType: resourceTypeSchema,
});
const linkedResourcesInputSchema = z.object({
    resourceId: MONGOID,
    resourceType: resourceTypeSchema,
});
const searchInputSchema = z.object({
    query: z.string().trim().max(100),
    type: resourceTypeSchema,
});

/**
 * Create a bidirectional link between two resources.
 * Only one record is stored; queries check both directions.
 */
export async function linkResources(input: IResourceLinkInput) {
    try {
        const validatedInput = resourceLinkInputSchema.parse(input);
        const user = await getUser();
        if (!user || "error" in user) throw new Error("Unauthorized");

        // Prevent duplicate links
        const existing = await prisma.resourceLink.findFirst({
            where: {
                userId: user.id as string,
                OR: [
                    { fromId: validatedInput.fromId, fromType: validatedInput.fromType, toId: validatedInput.toId, toType: validatedInput.toType },
                    { fromId: validatedInput.toId, fromType: validatedInput.toType, toId: validatedInput.fromId, toType: validatedInput.fromType },
                ],
            },
        });

        if (existing) {
            return { success: false, error: "These resources are already linked" };
        }

        const link = await prisma.resourceLink.create({
            data: {
                userId: user.id as string,
                fromId: validatedInput.fromId,
                fromType: validatedInput.fromType,
                toId: validatedInput.toId,
                toType: validatedInput.toType,
            },
        });

        revalidatePath("/");
        return { success: true, link };
    } catch (error) {
        console.error("Failed to link resources:", error);
        return { success: false, error: "Failed to link resources" };
    }
}

/**
 * Remove a link between two resources.
 */
export async function unlinkResources(linkId: string) {
    try {
        const validatedLinkId = MONGOID.parse(linkId);
        const user = await getUser();
        if (!user || "error" in user) throw new Error("Unauthorized");

        await prisma.resourceLink.delete({
            where: { id: validatedLinkId, userId: user.id as string },
        });

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Failed to unlink resources:", error);
        return { success: false, error: "Failed to unlink resources" };
    }
}

/**
 * Get all resources linked to a given resource.
 * Searches both directions (fromId and toId) to support bidirectional links.
 */
export async function getLinkedResources(
    resourceId: string, 
    resourceType: ResourceType
): Promise<ILinkedResource[]> {
    try {
        const validatedInput = linkedResourcesInputSchema.parse({ resourceId, resourceType });
        const user = await getUser();
        if (!user || "error" in user) return [];

        const links = await prisma.resourceLink.findMany({
            where: {
                userId: user.id as string,
                OR: [
                    { fromId: validatedInput.resourceId, fromType: validatedInput.resourceType },
                    { toId: validatedInput.resourceId, toType: validatedInput.resourceType },
                ],
            },
        });

        // For each link, resolve the "other side" to get title/subtitle
        const results: ILinkedResource[] = [];

        for (const link of links) {
            // Determine which side is the "other" resource
            const isFrom = link.fromId === validatedInput.resourceId && link.fromType === validatedInput.resourceType;
            const otherId = isFrom ? link.toId : link.fromId;
            const otherType = isFrom ? link.toType : link.fromType;

            const resolved = await resolveResource(otherId, otherType as ResourceType, user.id as string);
            if (resolved) {
                results.push({
                    linkId: link.id,
                    resourceId: otherId,
                    resourceType: otherType as ResourceType,
                    title: resolved.title,
                    subtitle: resolved.subtitle,
                    color: resolved.color,
                    createdAt: link.createdAt,
                });
            }
        }

        return results;
    } catch (error) {
        console.error("Failed to get linked resources:", error);
        return [];
    }
}

/**
 * Resolve a resource ID + type into a displayable title/subtitle.
 * This is the central resolver that knows how to fetch any resource type.
 */
async function resolveResource(
    id: string, 
    type: ResourceType,
    userId: string
): Promise<{ title: string; subtitle?: string; color?: string } | null> {
    try {
        switch (type) {
            case "TODO": {
                const todo = await prisma.todo.findFirst({ where: { id, userId } });
                if (!todo) return null;
                return { 
                    title: todo.title, 
                    subtitle: todo.status,
                    color: "#e53e3e" 
                };
            }
            case "NOTE": {
                const note = await prisma.note.findFirst({ where: { id, userId } });
                if (!note) return null;
                return { 
                    title: note.heading, 
                    subtitle: note.description?.slice(0, 60),
                    color: note.color || "#F472B6" 
                };
            }
            case "EVENT": {
                const event = await prisma.event.findFirst({ 
                    where: { id, userId },
                    include: { category: true } 
                });
                if (!event) return null;
                return { 
                    title: event.title, 
                    subtitle: event.category?.name || "Event",
                    color: event.category?.color || "#3182ce" 
                };
            }
            default:
                return null;
        }
    } catch {
        return null;
    }
}

/**
 * Search for linkable resources by query and type.
 * Used by the ResourceLinker component.
 */
export async function searchLinkableResources(
    query: string, 
    type: ResourceType
): Promise<{ id: string; title: string; subtitle?: string }[]> {
    try {
        const validatedInput = searchInputSchema.parse({ query, type });
        const user = await getUser();
        if (!user || "error" in user) return [];

        const q = validatedInput.query;
        if (!q) return [];

        switch (validatedInput.type) {
            case "TODO": {
                const todos = await prisma.todo.findMany({
                    where: {
                        userId: user.id as string,
                        NOT: { status: "ARCHIVED" },
                        title: { contains: q, mode: "insensitive" },
                    },
                    take: 8,
                    select: { id: true, title: true, status: true },
                });
                return todos.map(t => ({ id: t.id, title: t.title, subtitle: t.status }));
            }
            case "NOTE": {
                const notes = await prisma.note.findMany({
                    where: {
                        userId: user.id as string,
                        NOT: { status: "DELETED" },
                        heading: { contains: q, mode: "insensitive" },
                    },
                    take: 8,
                    select: { id: true, heading: true, description: true },
                });
                return notes.map(n => ({ id: n.id, title: n.heading, subtitle: n.description?.slice(0, 50) }));
            }
            case "EVENT": {
                const events = await prisma.event.findMany({
                    where: {
                        userId: user.id as string,
                        title: { contains: q, mode: "insensitive" },
                    },
                    take: 8,
                    select: { id: true, title: true, location: true },
                });
                return events.map(e => ({ id: e.id, title: e.title, subtitle: e.location || undefined }));
            }
            default:
                return [];
        }
    } catch (error) {
        console.error("Failed to search linkable resources:", error);
        return [];
    }
}
