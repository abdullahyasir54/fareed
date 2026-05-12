import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode("fareed-app-secret-key-2024");

const PUBLIC_PATHS = ["/login"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const { payload } = await jwtVerify(token, SECRET);
    const role = payload.role as string;

    if (pathname.startsWith("/fareed") && role !== "fareed") {
      return NextResponse.redirect(new URL("/employee", req.url));
    }

    if (pathname.startsWith("/employee") && role !== "employee") {
      return NextResponse.redirect(new URL("/fareed", req.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/fareed/:path*", "/employee/:path*", "/login"],
};
