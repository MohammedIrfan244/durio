"use server";
import { withErrorWrapper } from "@/lib/server/error-wrapper";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/server/get-user";
import { revalidatePath } from "next/cache";
import { convertToLocalDate,convertToTime,getCurrentTimeString } from "@/lib/utils/date-formatter";
import { end, start } from "@/lib/utils/today";

export const flagTimestamp = withErrorWrapper<string, [string]>(async (input): Promise<string> => {
    const userId = await getUserId();
    const path = input;

    await markOverdueTodos(userId);
    await markTodoStreak(userId)

    if (path) {
        revalidatePath(path);
    }
    return 'DONE';
});


async function markOverdueTodos(userId: string) {

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

}

async function markTodoStreak(userId: string) {
    const todayStart = start;
    const tomorrowStart = end;
    const now = new Date();


    const hasUpdatedToday = await prisma.todoStreak.findFirst({
        where:{
            userId,
            lastCompleted: {
                gte: todayStart,
                lt: tomorrowStart
            }
        }
    })

            if(hasUpdatedToday){
                return;
            }


    const activeToday = await prisma.todo.count({
        where:{
            userId,
            updatedAt:{
                gte: todayStart,
                lt: tomorrowStart
            }
        }
    })

    const hasActiveToday = activeToday > 0 ? 1 : 0;

    const completedToday = await prisma.todo.count({
        where: {
            userId,
            status: "DONE",
            completedAt: {
                gte: todayStart,
                lt: tomorrowStart,
            },
        },
    });

    const todoStreak = await prisma.todoStreak.findUnique({where:{
        userId
    },
    select:{
        count:true,
        longest:true
    }
})

const streak = todoStreak?.count || 0
const longest = todoStreak?.longest || 0

const longestStreak = Math.max(streak+1,longest)

    if (completedToday > 0) {
        await prisma.todoStreak.upsert({
            where: { userId },
            update: { count: { increment: 1 }, lastCompleted: now , longest: longestStreak , active: { increment: hasActiveToday } },
            create: { userId, count: 1, lastCompleted: now , longest:longestStreak , active: hasActiveToday },
        });
    }else{
        await prisma.todoStreak.upsert({
            where:{userId},
            update:{count:0,lastCompleted:now, longest:longestStreak, active:hasActiveToday},
            create:{userId,count:0,lastCompleted:now, longest:longestStreak, active: hasActiveToday}
        })
    }
}