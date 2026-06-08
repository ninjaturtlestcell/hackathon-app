import { type NextRequest, NextResponse } from "next/server";

const JIRA_SESSION_COOKIE = "jira_session";

export function proxy(request: NextRequest) {
  return handle(request);
}

function handle(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = request.cookies.has(JIRA_SESSION_COOKIE);

  if (pathname.startsWith("/app") && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("returnUrl", pathname + search);
    return NextResponse.redirect(url);
  }

  if (pathname === "/login" && hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/app";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request });
}

export const config = {
  matcher: [
    // _next ve statik dosyalar disindaki tum yollar
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
