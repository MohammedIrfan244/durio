"use server";
import { withErrorWrapper } from "@/lib/server-utils/error-wrapper";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/server-utils/get-user";
import { today, nowWithTime , parseTimeStringToDate } from "@/lib/helper/today";
import { revalidatePath } from "next/cache";

export const flagTimestamp = withErrorWrapper<string, [string]>(async (input): Promise<string> => {
    const userId = await getUserId();
    const currentDateMidnight = today();
    const currentMoment = nowWithTime();
    const path = input;

//  Todo flagging
    const potentiallyOverdueTodos = await prisma.todo.findMany({
        where: {
            userId,
            status: { in: ["PENDING", "PLAN"] },
            dueDate: { not: null, lte: currentDateMidnight },
        },
        select: {
            id: true,
            dueDate: true,
            dueTime: true,
        }
    });
    const overdueTodoIds: string[] = [];
    for (const todo of potentiallyOverdueTodos) {
        if (!todo.dueDate) continue; 
        if (todo.dueTime) {
            const fullDueDateTime = parseTimeStringToDate(todo.dueDate, todo.dueTime);
            if (fullDueDateTime < currentMoment) {
                overdueTodoIds.push(todo.id);
            }
        } else if (todo.dueDate < currentDateMidnight) {
            overdueTodoIds.push(todo.id);
        }
    }

    if (overdueTodoIds.length > 0) {
        await prisma.todo.updateMany({
            where: {
                id: { in: overdueTodoIds },
                userId,
            },
            data: { status: "OVERDUE" }
        });
    }

  // Other flagging logic can be added here

    if (path) {
        revalidatePath(path);
    }
    return 'DONE';
});