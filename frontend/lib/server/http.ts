import "server-only";
import { z } from "zod";
import { Prisma } from "@/lib/generated/prisma/client";

// Shared request/response helpers for route handlers. Every error leaves the
// server as `{ error: { code, message, fields? } }` — never a stack trace,
// provider response or secret.

export type ErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "PAYLOAD_TOO_LARGE"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "VALIDATION_ERROR"
  | "TOO_MANY_REQUESTS"
  | "CONSENT_REQUIRED"
  | "AI_UNREADABLE"
  | "INTERNAL_ERROR"
  | "BAD_GATEWAY"
  | "SERVICE_UNAVAILABLE";

export class HttpError extends Error {
  constructor(
    public status: number,
    public code: ErrorCode,
    message: string,
    public fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export const errors = {
  badRequest: (message = "The request could not be understood.") => new HttpError(400, "BAD_REQUEST", message),
  unauthorized: (message = "Please sign in to continue.") => new HttpError(401, "UNAUTHORIZED", message),
  forbidden: (message = "You don't have access to this.") => new HttpError(403, "FORBIDDEN", message),
  notFound: (message = "Not found.") => new HttpError(404, "NOT_FOUND", message),
  conflict: (message: string) => new HttpError(409, "CONFLICT", message),
  tooManyRequests: (message = "Too many attempts. Please wait a few minutes and try again.") =>
    new HttpError(429, "TOO_MANY_REQUESTS", message),
  badGateway: (message = "The AI service couldn't process this right now. Please try again.") =>
    new HttpError(502, "BAD_GATEWAY", message),
  serviceUnavailable: (message = "This service is temporarily unavailable. Please try again later.") =>
    new HttpError(503, "SERVICE_UNAVAILABLE", message),
};

export function json<T>(data: T, init?: ResponseInit) {
  return Response.json(data, init);
}

function errorResponse(error: HttpError) {
  return Response.json(
    { error: { code: error.code, message: error.message, ...(error.fields ? { fields: error.fields } : {}) } },
    { status: error.status },
  );
}

/** Turns a ZodError into a 422 with one message per field (first issue wins). */
export function validationError(error: z.ZodError) {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    fields[key] ??= issue.message;
  }
  const first = Object.values(fields)[0] ?? "Some fields are invalid.";
  return new HttpError(422, "VALIDATION_ERROR", first, fields);
}

/** Reads and validates a JSON body. Invalid JSON → 400, schema mismatch → 422. */
export async function parseJson<T extends z.ZodType>(request: Request, schema: T): Promise<z.infer<T>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw errors.badRequest("Request body must be valid JSON.");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw validationError(parsed.error);
  return parsed.data;
}

/** Validates a single value (route params, query strings). */
export function parseValue<T extends z.ZodType>(value: unknown, schema: T): z.infer<T> {
  const parsed = schema.safeParse(value);
  if (!parsed.success) throw validationError(parsed.error);
  return parsed.data;
}

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Rejects cross-site state-changing requests. Session cookies are SameSite=Lax,
 * and this Origin check adds defence in depth for browsers that send it.
 */
function assertSameOrigin(request: Request) {
  if (!MUTATING.has(request.method)) return;
  const origin = request.headers.get("origin");
  if (!origin) return;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    if (new URL(origin).host !== host) throw errors.forbidden("Cross-site request blocked.");
  } catch (e) {
    if (e instanceof HttpError) throw e;
    throw errors.forbidden("Cross-site request blocked.");
  }
}

function mapUnknownError(error: unknown): HttpError {
  if (error instanceof HttpError) return error;
  if (error instanceof z.ZodError) return validationError(error);
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return errors.conflict("This already exists.");
    if (error.code === "P2025") return errors.notFound();
  }
  if (error instanceof Prisma.PrismaClientInitializationError) {
    console.error("[db] connection failed:", error.message);
    return errors.serviceUnavailable("We couldn't reach the database. Please try again shortly.");
  }
  console.error("[api] unexpected error:", error);
  return new HttpError(500, "INTERNAL_ERROR", "Something went wrong on our side. Please try again.");
}

type Handler<C> = (request: Request, context: C) => Promise<Response>;

/** Wraps a route handler with origin checking and uniform error responses. */
export function route<C = unknown>(handler: Handler<C>): Handler<C> {
  return async (request, context) => {
    try {
      assertSameOrigin(request);
      return await handler(request, context);
    } catch (error) {
      return errorResponse(mapUnknownError(error));
    }
  };
}
