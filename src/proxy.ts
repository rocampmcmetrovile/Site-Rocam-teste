import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

// Next.js 16 renamed Middleware to "Proxy" (same file convention/behavior,
// see node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md).
// This performs a lightweight, edge-compatible *optimistic* check only —
// every mutating API route additionally re-verifies the caller's real rank
// against the database (see src/lib/api-auth.ts), which is the actual
// source of truth for authorization.

const PUBLIC_PATHS = ["/login"];

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // API routes handle their own auth (returning clean 401/403 JSON via
  // requireUser()/requireRank() in src/lib/api-auth.ts) — redirecting them
  // to /login would make fetch() calls silently follow a redirect into HTML.
  if (pathname.startsWith("/api/")) return NextResponse.next();

  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (isPublic) return NextResponse.next();

  const session = await auth();

  if (!session?.user) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico)$).*)"],
};
