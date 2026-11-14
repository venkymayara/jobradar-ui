export interface ApiResponse<T> {
  data: T;
  message?: string;
  timestamp?: string;
}

export interface ApiErrorResponse {
  status?: number;
  error?: string;
  message?: string;
  path?: string;
  timestamp?: string;
  fieldErrors?: Record<string, string>;
}

export interface ApiError {
  status: number;
  message: string;
  timestamp?: string;
  fieldErrors?: Record<string, string>;
}
