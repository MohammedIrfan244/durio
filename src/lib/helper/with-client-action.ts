import { toast } from "sonner";
import { error as logError } from "@/lib/helper/logger";
import type { ApiResponse } from "@/lib/server-utils/error-wrapper";

export async function withClientAction<T>(
  fn: () => Promise<ApiResponse<T>>,
  showToast: boolean = false
): Promise<T | undefined> {
  try {
    const res = await fn();

    if (!res.success) {
      const msg =
  typeof res.error?.message === "string"
    ? (() => {
        try {
          const parsed = JSON.parse(res.error.message);
          return parsed?.[0]?.message ?? "Something went wrong.";
        } catch {
          return res.error.message;
        }
      })()
    : "Something went wrong.";


      logError("CLIENT_ACTION_ERROR:", res);
      if (showToast) toast.error(msg);

      return undefined;
    }

    return res.data as T;
  } catch (err: unknown) {
    const msg = (err as Error)?.message || "Unexpected error occurred.";

    logError("CLIENT_TRY_CATCH_ERROR:", err);
    if (showToast) toast.error(msg);

    return undefined;
  }
}
