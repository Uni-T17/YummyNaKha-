import "server-only";
import { AsyncLocalStorage } from "node:async_hooks";
import { prisma } from "./db";

// Access logs for the Computer Crime Act §26 (rule.md): account ID, IP address
// and time of every API request, kept at least 90 days in their own table,
// separate from user content. Food profiles, menu photos and results are never
// written here, and their retention does not follow this log's.

/** Kept at least 90 days as §26 requires; older rows are removed (PDPA: no longer than needed). */
const RETENTION_DAYS = 120;
const DAY_MS = 24 * 60 * 60 * 1000;

interface RequestContext {
  userId: string | null;
}

const context = new AsyncLocalStorage<RequestContext>();

/** Runs one API request with a slot that the auth code fills in once it knows who is calling. */
export function withAccessContext<T>(run: () => Promise<T>): Promise<T> {
  return context.run({ userId: null }, run);
}

/** Called by the session code: the signed-in account for this request. */
export function noteAccountForRequest(userId: string) {
  const store = context.getStore();
  if (store) store.userId = userId;
}

/**
 * The client IP. Behind a reverse proxy (production), the proxy must set
 * X-Forwarded-For / X-Real-IP; the left-most forwarded address is the client.
 */
export function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
}

let lastPurge = 0;

async function purgeExpired() {
  if (Date.now() - lastPurge < DAY_MS) return;
  lastPurge = Date.now();
  await prisma.accessLog.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - RETENTION_DAYS * DAY_MS) } } });
}

/** Writes one log row. A logging failure is reported but never fails the request. */
export async function recordAccess(request: Request, status: number) {
  try {
    await prisma.accessLog.create({
      data: {
        userId: context.getStore()?.userId ?? null,
        ip: clientIp(request).slice(0, 64),
        method: request.method,
        path: new URL(request.url).pathname.slice(0, 200),
        status,
      },
    });
    await purgeExpired();
  } catch (error) {
    console.error("[access-log] could not write:", error instanceof Error ? error.message : error);
  }
}
