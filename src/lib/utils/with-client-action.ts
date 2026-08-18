import { toast } from "sonner";
import { error as logError } from "@/lib/utils/logger";
import type { ApiResponse, ClientActionError } from "@/types/api";

function getClientErrorMessage(error?: ClientActionError) {
  if (!error?.message) return "Something went wrong.";

  try {
    const parsed: unknown = JSON.parse(error.message);
    if (
      Array.isArray(parsed) &&
      parsed[0] &&
      typeof parsed[0] === "object" &&
      "message" in parsed[0] &&
      typeof parsed[0].message === "string"
    ) {
      return parsed[0].message;
    }
  } catch {
    return error.message;
  }

  return error.message;
}

export async function withClientAction<T>(
  fn: () => Promise<ApiResponse<T>>,
  showToast: boolean = false
): Promise<T | undefined> {
  try {
    const res = await fn();

    if (!res.success) {
      const msg = getClientErrorMessage(res.error);

      logError("CLIENT_ACTION_ERROR:", res);
      if (showToast) toast.error(msg);

      return undefined;
    }

    return res.data;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unexpected error occurred.";

    logError("CLIENT_TRY_CATCH_ERROR:", err);
    if (showToast) toast.error(msg);

    return undefined;
  }
}
