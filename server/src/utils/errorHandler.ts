import { Response } from 'express';

/**
 * Centralized error handling and HTTP response utilities
 */

export interface ErrorResponse {
  success: false;
  error: string;
  code: string;
  details?: any;
  timestamp?: string;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
  timestamp?: string;
}

/**
 * Send error response with proper HTTP status code
 */
export function sendErrorResponse(
  res: Response,
  statusCode: number,
  message: string,
  code: string = 'INTERNAL_ERROR',
  details?: any
): void {
  const errorResponse: ErrorResponse = {
    success: false,
    error: message,
    code,
    details,
    timestamp: new Date().toISOString(),
  };

  res.status(statusCode).json(errorResponse);
}

/**
 * Send success response
 */
export function sendSuccessResponse<T>(
  res: Response,
  data: T,
  statusCode: number = 200
): void {
  const successResponse: SuccessResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };

  res.status(statusCode).json(successResponse);
}

/**
 * Error classification and mapping
 */
export function classifyError(error: any): { statusCode: number; code: string; message: string } {
  if (error.message.includes('File not found')) {
    return { statusCode: 400, code: 'FILE_NOT_FOUND', message: error.message };
  }

  if (error.message.includes('File too large')) {
    return { statusCode: 400, code: 'FILE_TOO_LARGE', message: error.message };
  }

  if (error.message.includes('Invalid file type')) {
    return { statusCode: 400, code: 'INVALID_FILE_TYPE', message: error.message };
  }

  if (error.message.includes('Text is required')) {
    return { statusCode: 400, code: 'VALIDATION_ERROR', message: error.message };
  }

  if (error.message.includes('API key')) {
    return { statusCode: 500, code: 'API_CONFIG_ERROR', message: 'AI service configuration error' };
  }

  if (error.message.includes('Rate limit')) {
    return { statusCode: 429, code: 'RATE_LIMIT', message: 'Too many requests. Please try again later.' };
  }

  if (error.message.includes('Timeout')) {
    return { statusCode: 504, code: 'TIMEOUT', message: 'Request timeout. Please try again.' };
  }

  return { statusCode: 500, code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' };
}

/**
 * Validate request body
 */
export function validateRequestBody(
  body: any,
  requiredFields: string[]
): { valid: boolean; error?: string } {
  if (!body) {
    return { valid: false, error: 'Request body is required' };
  }

  for (const field of requiredFields) {
    if (!body[field]) {
      return { valid: false, error: `Missing required field: ${field}` };
    }
  }

  return { valid: true };
}

/**
 * Sanitize text input
 */
export function sanitizeTextInput(text: string, maxLength: number = 50000): string {
  if (typeof text !== 'string') {
    throw new Error('Text must be a string');
  }

  const sanitized = text
    .trim()
    .replace(/[^\x20-\x7E\n\r]/g, '') // Remove non-printable characters except newlines
    .slice(0, maxLength);

  if (sanitized.length < 10) {
    throw new Error('Text must contain at least 10 characters');
  }

  return sanitized;
}

/**
 * Validate text length and content
 */
export function validateTextInput(
  text: string,
  minLength: number = 10,
  maxLength: number = 50000
): { valid: boolean; error?: string } {
  if (!text || typeof text !== 'string') {
    return { valid: false, error: 'Text is required and must be a string' };
  }

  const trimmed = text.trim();

  if (trimmed.length < minLength) {
    return { valid: false, error: `Text must be at least ${minLength} characters` };
  }

  if (trimmed.length > maxLength) {
    return { valid: false, error: `Text must not exceed ${maxLength} characters` };
  }

  // Check for minimal content (not just spaces or symbols)
  if (!/[a-zA-Z0-9]{5,}/.test(text)) {
    return { valid: false, error: 'Text must contain meaningful content' };
  }

  return { valid: true };
}

/**
 * Wrap async route handlers with error catching
 */
export function asyncHandler(fn: Function) {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Format API response time
 */
export function formatResponseTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}
