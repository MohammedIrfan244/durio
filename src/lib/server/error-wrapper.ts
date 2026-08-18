import { error as logError } from "@/lib/utils/logger";
import { ApiResponse, AppError } from "@/types/api";


/**
 * Wraps async server action functions with error handling
 * @param fn - The async function to wrap
 * @returns The wrapped function that returns ApiResponse
 */
export function withErrorWrapper<T, Args extends unknown[]>(
  fn: (...args: Args) => Promise<T>
): (...args: Args) => Promise<ApiResponse<T>> {
  return async (...args: Args) => {
    try {
      const data = await fn(...args);
      return {
        success: true,
        data,
      };
    } catch (err) {
      const isAppError = err instanceof Error;
      const error = isAppError ? (err as AppError) : undefined;
      const errorMessage = error?.message || "An unexpected error occurred";
      const errorCode = error?.code || "INTERNAL_ERROR";

      logError("SERVER_ACTION_ERROR:", {
        message: errorMessage,
        code: errorCode,
        stack: error?.stack,
      });

      return {
        success: false,
        error: {
          message: errorMessage,
          code: errorCode,
        },
      };
    }
  };
}

