/**
 * Mocked log function for error logging
 * In a real application, this would send logs to a logging service
 * @param error The error object to log
 * @param context Additional context information about the error
 */
export function log(error: unknown, context?: Record<string, unknown>): void {
  // Mocked implementation - in production this would send to a logging service
  // For now, we'll use console.error as a placeholder
  if (context) {
    console.error('Error logged:', error, 'Context:', context);
  } else {
    console.error('Error logged:', error);
  }
}

