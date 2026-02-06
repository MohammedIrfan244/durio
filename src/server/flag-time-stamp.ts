"use server";
import { withErrorWrapper } from "@/lib/server/error-wrapper";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/server/get-user";
import { revalidatePath } from "next/cache";
import { convertToLocalDate,convertToTime,getCurrentTimeString } from "@/lib/utils/date-formatter";

export const flagTimestamp = withErrorWrapper<string, [string]>(async (input): Promise<string> => {
    const userId = await getUserId();
    const path = input;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { timezone: true },
    });

    if(!user || !user.timezone) {
        throw new Error('User not found');
    }

    const timeZone = user.timezone;
    const currentTimeString = getCurrentTimeString(timeZone);
    const currentTimeInMinutes = convertToTime(currentTimeString);
    const currentDate = convertToLocalDate({ utc: new Date().toISOString(), timeZone });

    const todos = await prisma.todo.findMany({
        where: {
            userId,
            dueDate : {not: null},
            status : {not : {in : ['DONE','CANCELLED']}}
        },
        select: { id: true, dueDate: true, dueTime: true},
    });

    const overdueTodoIds: string[] = [];

    for (const todo of todos) {
        const dueDate = convertToLocalDate({ utc: todo.dueDate!.toISOString(), timeZone });
        const dueTimeInMinutes = todo.dueTime ? convertToTime(todo.dueTime) : 0;
        if(dueDate < currentDate || (dueDate === currentDate && dueTimeInMinutes < currentTimeInMinutes)) {
            overdueTodoIds.push(todo.id);
        }
    }

    if(overdueTodoIds.length > 0) {
        await prisma.todo.updateMany({
            where: { id: { in: overdueTodoIds } },
            data: { status: 'OVERDUE' },
        });
    }

    if (path) {
        revalidatePath(path);
    }
    return 'DONE';
});