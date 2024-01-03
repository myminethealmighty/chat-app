import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    const pathname = req.nextUrl.pathname;

    //Protect Route
    const isAuth = await getToken({ req });
    const isLogin = pathname.startsWith("/login");

    const sensitiveRoute = ["/dashboard"];
    const isPermit = sensitiveRoute.some((route) => pathname.startsWith(route));

    if (isLogin) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/dashboard", req.url)); //Redirect baseurl/dashboard
      }
      return NextResponse.next();
    }
    if (!isAuth && isPermit) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  },
  {
    // handling redirects on off pages, the middleware function above is always called
    // If not there will be infinite redirect
    callbacks: {
      async authorized() {
        return true;
      },
    },
  }
);

export const config = {
  // matcher determines in which route this middleware will run
  matcher: ["/", "/login", "/dashboard/:path*"],
};
