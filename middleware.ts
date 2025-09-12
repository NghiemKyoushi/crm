// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token");
  const { pathname, search } = req.nextUrl;

  const publicRoutes = ["/login", "/register", "/forgot-password"];
  const isPublic = publicRoutes.some((route) => pathname.startsWith(route));

  // Nếu chưa login và vào private page
  if (!token && !isPublic) {
    const loginUrl = new URL("/login", req.url);

    // Lấy full path + query string, ví dụ: /user-management?id=123
    const redirectPath = pathname + search;

    loginUrl.searchParams.set("redirect", redirectPath);
    return NextResponse.redirect(loginUrl);
  }

  // Nếu đã login mà vào /login -> đẩy về dashboard
  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|static|favicon.ico).*)"],
};
