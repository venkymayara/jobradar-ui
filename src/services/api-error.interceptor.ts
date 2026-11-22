import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { apiErrorMetadata, ApiRequestError, getApiErrorMessage } from './api-error.util';

export const apiErrorInterceptor: HttpInterceptorFn = (request, next) =>
  next(request).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) return throwError(() => error);
      const metadata = apiErrorMetadata(error.error);
      return throwError(
        () =>
          new ApiRequestError(
            error.status,
            getApiErrorMessage(error),
            metadata.timestamp,
            metadata.fieldErrors,
          ),
      );
    }),
  );
