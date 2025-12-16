"use server";
import {prisma} from '../lib/prisma';
import { CreateServerLogInput } from '@/schema/server-log';
import { withErrorWrapper } from '@/lib/server-utils/error-wrapper';


export const createServerLog = withErrorWrapper(async (input: CreateServerLogInput) => {
    const { level, message , userId } = input;
    let name = "unknown"
    if(userId){
       const user = await prisma.user.findFirst({
            where: { id: userId },
            select:{name:true}
        })
        name = user?.name || "unknown"
    }else {
        name = "system"
    }
  const serverLog = await prisma.serverLog.create({
    data: {
        level: level || 'INFO',
        message : `${message} , userId: ${userId} , userName: ${name}`, 
    },
  });
  return serverLog;
});