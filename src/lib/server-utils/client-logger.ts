import { withClientAction } from "../helper/with-client-action";
import { createServerLog } from "@/server/server-log";
import { CreateServerLogInput } from "@/schema/server-log";
import { getUserClient } from "../helper/get-user-client";

export const logClientMessage = (input: CreateServerLogInput) =>
  withClientAction(async () => {
    const message = `[Client Log] ${input.message} , userEmail: ${getUserClient()?.email || 'system'}`;
    input.message = message;
    await createServerLog(input);
    return { success: true, data: undefined };
  });