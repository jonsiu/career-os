/**
 * Error Recovery Utilities
 *
 * Provides graceful degradation and fallback mechanisms for skill gap analysis.
 * Implements retry logic with exponential backoff and user-friendly error messages.
 *
 * Follows principles:
 * - Fail gracefully, not catastrophically
 * - Provide clear, actionable error messages
 * - Fall back to baseline functionality when advanced features fail
 */

export interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: any) => boolean;
}

export interface ErrorContext {
  operation: string;
  userId?: string;
  analysisId?: string;
  metadata?: Record<string, any>;
}

/**
 * User-friendly error messages for different failure scenarios
 */
export const ERROR_MESSAGES = {
  // O*NET API errors
  ONET_API_UNAVAILABLE: {
    title: 'Unable to fetch occupation data',
    message: 'We\'re having trouble connecting to our occupation database. Using cached data instead.',
    action: 'Your analysis will continue with available information.',
  },
  ONET_OCCUPATION_NOT_FOUND: {
    title: 'Occupation not found',
    message: 'We couldn\'t find that occupation in our database. Try a different role title or use a custom role.',
    action: 'You can enter custom skill requirements manually.',
  },
  ONET_CACHE_STALE: {
    title: 'Using older occupation data',
    message: 'We\'re using cached occupation data that may be outdated.',
    action: 'Your analysis is still accurate, but market data may not reflect recent changes.',
  },

  // AI Analysis errors
  AI_TIMEOUT: {
    title: 'AI analysis took too long',
    message: 'The advanced skill transfer analysis timed out.',
    action: 'We\'ll use basic skill matching instead. You can retry later for detailed transfer analysis.',
  },
  AI_API_UNAVAILABLE: {
    title: 'AI analysis unavailable',
    message: 'Advanced AI analysis is temporarily unavailable.',
    action: 'Your analysis will continue with rule-based skill matching.',
  },
  AI_INVALID_RESPONSE: {
    title: 'AI analysis failed',
    message: 'We received an unexpected response from the AI service.',
    action: 'Falling back to baseline skill analysis.',
  },

  // Affiliate/Course errors
  AFFILIATE_API_FAILED: {
    title: 'Course recommendations unavailable',
    message: 'We couldn\'t fetch course recommendations at this time.',
    action: 'You can search for courses manually or try again later.',
  },

  // Database errors
  DATABASE_ERROR: {
    title: 'Database error',
    message: 'We encountered a problem saving your analysis.',
    action: 'Please try again. Your data is safe and hasn\'t been lost.',
  },

  // Generic errors
  UNKNOWN_ERROR: {
    title: 'Something went wrong',
    message: 'We encountered an unexpected error.',
    action: 'Please try again or contact support if the problem persists.',
  },
};

/**
 * Convert technical error to user-friendly message
 */
export function getUserFriendlyError(
  error: any,
  context: ErrorContext
): {
  title: string;
  message: string;
  action: string;
  technical?: string;
} {
  let errorKey: keyof typeof ERROR_MESSAGES = 'UNKNOWN_ERROR';

  // Identify error type from error message or context
  if (error?.message?.includes('timeout') || error?.name === 'AbortError') {
    errorKey = 'AI_TIMEOUT';
  } else if (error?.message?.includes('O*NET') || error?.message?.includes('occupation')) {
    if (error?.message?.includes('not found')) {
      errorKey = 'ONET_OCCUPATION_NOT_FOUND';
    } else {
      errorKey = 'ONET_API_UNAVAILABLE';
    }
  } else if (error?.message?.includes('AI') || error?.message?.includes('Claude') || error?.message?.includes('Anthropic')) {
    errorKey = 'AI_API_UNAVAILABLE';
  } else if (error?.message?.includes('affiliate') || error?.message?.includes('course')) {
    errorKey = 'AFFILIATE_API_FAILED';
  } else if (error?.message?.includes('database') || error?.message?.includes('Convex')) {
    errorKey = 'DATABASE_ERROR';
  }

  const friendlyError = ERROR_MESSAGES[errorKey];

  // Include technical details in development mode
  const technical = process.env.NODE_ENV === 'development'
    ? error?.message || String(error)
    : undefined;

  return {
    ...friendlyError,
    technical,
  };
}

/**
 * Retry operation with exponential backoff
 *
 * Useful for transient failures like network errors or rate limiting.
 *
 * @param operation - Async function to retry
 * @param options - Retry configuration
 * @returns Result of successful operation
 * @throws Last error if all retries fail
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelayMs = 1000,
    maxDelayMs = 10000,
    backoffMultiplier = 2,
    shouldRetry = () => true,
  } = options;

  let lastError: any;
  let currentDelay = initialDelayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Check if we should retry this error
      if (!shouldRetry(error)) {
        throw error;
      }

      // Don't wait after the last attempt
      if (attempt < maxAttempts) {
        console.warn(
          `[RETRY] Attempt ${attempt}/${maxAttempts} failed, retrying in ${currentDelay}ms...`,
          error
        );

        await new Promise(resolve => setTimeout(resolve, currentDelay));

        // Exponential backoff with max cap
        currentDelay = Math.min(currentDelay * backoffMultiplier, maxDelayMs);
      }
    }
  }

  throw lastError;
}

/**
 * Check if error is retryable (transient failure vs permanent failure)
 */
export function isRetryableError(error: any): boolean {
  // Network errors are usually retryable
  if (error?.code === 'ECONNRESET' || error?.code === 'ETIMEDOUT') {
    return true;
  }

  // Rate limiting errors are retryable
  if (error?.status === 429 || error?.message?.includes('rate limit')) {
    return true;
  }

  // Server errors (5xx) are retryable, but client errors (4xx) are not
  if (error?.status >= 500 && error?.status < 600) {
    return true;
  }

  // Timeout errors are retryable
  if (error?.name === 'AbortError' || error?.message?.includes('timeout')) {
    return true;
  }

  // Auth errors (401, 403) and not found (404) are NOT retryable
  if (error?.status === 401 || error?.status === 403 || error?.status === 404) {
    return false;
  }

  // Default: don't retry unless we're sure it's transient
  return false;
}

/**
 * Execute operation with timeout
 *
 * @param operation - Async function to execute
 * @param timeoutMs - Timeout in milliseconds
 * @param timeoutError - Error to throw on timeout
 * @returns Result of operation or throws timeout error
 */
export async function withTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number,
  timeoutError: Error = new Error(`Operation timed out after ${timeoutMs}ms`)
): Promise<T> {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const result = await operation();
    clearTimeout(timeoutId);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw timeoutError;
    }
    throw error;
  }
}

/**
 * Batch operations to reduce overhead
 *
 * Groups items into batches and processes them with optional parallelism.
 *
 * @param items - Items to process
 * @param batchSize - Size of each batch
 * @param processor - Function to process each batch
 * @param parallel - Whether to process batches in parallel
 * @returns Results from all batches
 */
export async function batchProcess<T, R>(
  items: T[],
  batchSize: number,
  processor: (batch: T[]) => Promise<R>,
  parallel: boolean = false
): Promise<R[]> {
  const batches: T[][] = [];

  // Split items into batches
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }

  if (parallel) {
    // Process all batches in parallel
    return Promise.all(batches.map(batch => processor(batch)));
  } else {
    // Process batches sequentially
    const results: R[] = [];
    for (const batch of batches) {
      const result = await processor(batch);
      results.push(result);
    }
    return results;
  }
}

/**
 * Log error with context for debugging and monitoring
 */
export function logError(error: any, context: ErrorContext): void {
  console.error(
    JSON.stringify({
      level: 'error',
      type: 'application-error',
      operation: context.operation,
      userId: context.userId,
      analysisId: context.analysisId,
      error: {
        message: error?.message || String(error),
        name: error?.name,
        stack: error?.stack,
      },
      metadata: context.metadata,
      timestamp: new Date().toISOString(),
    })
  );
}

/**
 * Create a fallback result when primary operation fails
 *
 * Ensures the application continues to function even if non-critical features fail.
 */
export interface FallbackOptions<T, F> {
  operation: () => Promise<T>;
  fallback: () => Promise<F> | F;
  operationName: string;
  warnUser?: boolean;
}

export async function withFallback<T, F = T>(
  options: FallbackOptions<T, F>
): Promise<T | F> {
  const { operation, fallback, operationName, warnUser = true } = options;

  try {
    return await operation();
  } catch (error) {
    if (warnUser) {
      console.warn(
        `[FALLBACK] ${operationName} failed, using fallback:`,
        error
      );
    }

    logError(error, { operation: operationName });

    return typeof fallback === 'function' ? await fallback() : fallback;
  }
}
