import { error as logError } from "@/lib/utils/logger";
import { getUserId } from "./get-user";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
  };
}

export interface AppError extends Error {
  code?: string;
  status?: number;
}

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
      const error = err as AppError;
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

