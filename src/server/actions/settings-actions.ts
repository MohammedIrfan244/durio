"use server";

import {prisma} from "@/lib/prisma";
import { getUserId } from "@/lib/server/get-user"; 
import { revalidatePath } from "next/cache";

export async function getUserSettings() {
    try {
        const userId = await getUserId();
        if (!userId) {
            return { fancyMode: true, disabledModules: [] };
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                fancyMode: true,
                disabledModules: true
            }
        });

        if (!user) {
            return { fancyMode: true, disabledModules: [] };
        }

        return {
            fancyMode: user.fancyMode,
            disabledModules: user.disabledModules
        };
    } catch (error) {
        console.error("Error fetching user settings:", error);
        return { fancyMode: true, disabledModules: [] };
    }
}

export async function updateUserSettings(data: { fancyMode?: boolean; disabledModules?: string[] }) {
    try {
        const userId = await getUserId();
        if (!userId) {
            throw new Error("Unauthorized");
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(data.fancyMode !== undefined && { fancyMode: data.fancyMode }),
                ...(data.disabledModules !== undefined && { disabledModules: data.disabledModules })
            },
            select: {
                fancyMode: true,
                disabledModules: true
            }
        });

        // Revalidate the app layout or specific paths if needed
        revalidatePath("/", "layout");
        
        return { success: true, settings: updatedUser };
    } catch (error) {
        console.error("Error updating user settings:", error);
        return { success: false, error: "Failed to update settings" };
    }
}
