import { HttpErrorResponse } from '@angular/common/http';
import { ApiError, ApiErrorResponse } from '../models/api-response.model';

export class ApiRequestError extends Error implements ApiError {
  constructor(
    readonly status: number,
    message: string,
    readonly timestamp?: string,
    readonly fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  if (!(error instanceof HttpErrorResponse)) return 'Something went wrong. Please try again.';
  const serverMessage =
    error.error && typeof error.error === 'object' && typeof error.error.message === 'string'
      ? error.error.message
      : undefined;
  if (serverMessage) return serverMessage;
  if (error.status === 0)
    return 'Can’t reach JobRadar right now. Check your connection and try again.';
  if (error.status === 400)
    return 'Some of the information is invalid. Review your filters and try again.';
  if (error.status === 401) return 'Please sign in to continue.';
  if (error.status === 403) return 'You don’t have permission to view this information.';
  if (error.status === 404) return 'The requested information could not be found.';
  if (error.status === 409)
    return 'This action conflicts with the current account or opportunity state.';
  if (error.status >= 500) return 'JobRadar is having trouble right now. Please try again shortly.';

  return 'We couldn’t complete your request. Please try again.';
}

export function apiErrorMetadata(
  value: unknown,
): Pick<ApiErrorResponse, 'timestamp' | 'fieldErrors'> {
  return typeof value === 'object' && value !== null
    ? {
        timestamp:
          'timestamp' in value && typeof value.timestamp === 'string' ? value.timestamp : undefined,
        fieldErrors:
          'fieldErrors' in value && isStringRecord(value.fieldErrors)
            ? value.fieldErrors
            : undefined,
      }
    : {};
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.values(value).every((item) => typeof item === 'string')
  );
}
