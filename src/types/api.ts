
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

export type ClientActionError = NonNullable<ApiResponse<never>["error"]>;