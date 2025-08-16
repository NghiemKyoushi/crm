import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const isAuthenticated = req.cookies.get("token"); // hoặc key auth của bạn

  // Nếu không có token -> redirect login
  if (!isAuthenticated && req.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Nếu có token -> redirect dashboard
  if (isAuthenticated && req.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"], // chỉ apply cho trang home "/"
};
