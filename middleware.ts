import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const { pathname } = req.nextUrl;
    const isLoggedIn = !!req.auth;
    const userRole = req.auth?.user?.role;

    // Public routes
    const isPublicRoute = pathname === "/" || pathname === "/login";

    // Dashboard routes require authentication
    if (pathname.startsWith("/dashboard") && !isLoggedIn) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    // Admin-only routes
    if (pathname.startsWith("/dashboard/users") && userRole !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Redirect to dashboard if logged in and trying to access login
    if (isLoggedIn && pathname === "/login") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|uploads).*)"],
};
