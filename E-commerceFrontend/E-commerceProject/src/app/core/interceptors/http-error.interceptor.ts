import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { NotificationService } from '../services/notification.service';
import { catchError, throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const notification = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An error occurred';

      // Determine error message based on status
      if (error.status === 0) {
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
      } else if (error.status === 400) {
        errorMessage = error.error?.message || 'Bad request. Please check your input.';
      } else if (error.status === 401) {
        errorMessage = 'Unauthorized. Please log in again.';
      } else if (error.status === 403) {
        errorMessage = 'Forbidden. You do not have permission to access this resource.';
      } else if (error.status === 404) {
        errorMessage = error.error?.message || `Resource not found (${req.url})`;
      } else if (error.status === 409) {
        errorMessage = error.error?.message || 'Conflict. The resource may already exist.';
      } else if (error.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.status >= 400) {
        errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
      }

      // Log detailed error info for debugging
      console.error('🔴 [HTTP Error]', {
        status: error.status,
        statusText: error.statusText,
        url: req.url,
        method: req.method,
        message: errorMessage,
        details: error.error
      });

      // Show error notification for specific scenarios
      if (
        error.status === 401 ||
        error.status === 403 ||
        error.status === 500 ||
        error.status === 0
      ) {
        // Only show notification for critical errors
        // Prevent duplicate notifications if component already handles it
        if (!req.url.includes('/api/PayPal') && !req.url.includes('/api/CreditCard')) {
          notification.error(errorMessage);
        }
      }

      return throwError(() => error);
    })
  );
};
