interface FetchOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
}

export class ApiError extends Error {
  public status: number;
  public data?: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

/**
 * A wrapper around native fetch that implements automatic retries and standardizes error handling.
 */
export async function fetchWithRetry(url: string, options: FetchOptions = {}): Promise<Response> {
  const { retries = 3, retryDelay = 1000, ...fetchOptions } = options;

  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, fetchOptions);

      // Only retry on 5xx errors or 429 Too Many Requests
      if (!response.ok && (response.status >= 500 || response.status === 429)) {
        throw new ApiError(response.status, `HTTP error! status: ${response.status}`);
      }

      // If it's a 4xx error (other than 429), it's likely a client error (e.g. bad request, unauthorized)
      // We shouldn't retry these.
      if (!response.ok && response.status >= 400 && response.status < 500) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(response.status, errorData.error || `HTTP error! status: ${response.status}`, errorData);
      }

      return response;
    } catch (error: any) {
      // If it's not a retryable error (e.g. ApiError with 400 status), throw immediately
      if (error instanceof ApiError && error.status < 500 && error.status !== 429) {
        throw error;
      }

      // If we've run out of retries, throw the error
      if (i === retries) {
        throw error;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, retryDelay * Math.pow(2, i))); // Exponential backoff
    }
  }

  throw new Error('Unreachable code');
}

/**
 * Convenience method for GET requests, expecting JSON.
 */
export async function getJson<T>(url: string, options?: FetchOptions): Promise<T> {
  const response = await fetchWithRetry(url, { ...options, method: 'GET' });
  return response.json();
}

/**
 * Convenience method for POST requests, expecting JSON.
 */
export async function postJson<T>(url: string, body: any, options?: FetchOptions): Promise<T> {
  const response = await fetchWithRetry(url, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: JSON.stringify(body),
  });
  return response.json();
}
