// Shared helpers for the mock API layer. Every function in lib/api returns a
// Promise so pages already handle loading / error states; swapping the mock
// body for a real `fetch` call should not require UI changes.

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export function simulateLatency(ms = 600) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function createId(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}
