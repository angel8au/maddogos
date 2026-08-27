import { type NextRequest, NextResponse } from "next/server";
import { SITE_URL } from "@/lib/site-url";

/** Production Vercel alias only — do not redirect PR preview hosts. */
const REDIRECT_HOSTS = new Set(["maddogos.vercel.app", "www.maddogos.com"]);

export function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase();
  if (!host || !REDIRECT_HOSTS.has(host)) {
    return NextResponse.next();
  }

  const destination = new URL(
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
    SITE_URL,
  );
  return NextResponse.redirect(destination, 301);
}

export const config = {
  matcher: [
    /*
     * Match all paths except Next internals and common static assets.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js|css|woff2?)$).*)",
  ],
};
