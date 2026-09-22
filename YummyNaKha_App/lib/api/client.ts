// Browser-side client for the app's own Next.js API (/api/*). The browser
// never talks to Hugging Face or Gemini directly — only to these routes.

export class ApiError extends Error {
  constructor(
    message: string,
    public status = 0,
    public code = "CLIENT_ERROR",
    public fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface ErrorBody {
  error?: { code?: string; message?: string; fields?: Record<string, string> };
}

/**
 * fetch wrapper: sends/receives JSON (or FormData), includes the session
 * cookie, and turns non-2xx responses into ApiError with the server's
 * user-facing message.
 */
export async function apiFetch<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const isForm = init.body instanceof FormData;
  let response: Response;
  try {
    response = await fetch(path, {
      method: init.method ?? (init.body === undefined ? "GET" : "POST"),
      credentials: "same-origin",
      headers: init.body === undefined || isForm ? undefined : { "Content-Type": "application/json" },
      body: init.body === undefined ? undefined : isForm ? (init.body as FormData) : JSON.stringify(init.body),
    });
  } catch {
    throw new ApiError("You seem to be offline. Check your connection and try again.");
  }

  if (response.status === 204) return undefined as T;

  const data = (await response.json().catch(() => null)) as (T & ErrorBody) | null;
  if (!response.ok) {
    throw new ApiError(
      data?.error?.message ?? "Something went wrong. Please try again.",
      response.status,
      data?.error?.code ?? "UNKNOWN",
      data?.error?.fields,
    );
  }
  return data as T;
}

export function createId(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}
