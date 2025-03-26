import { authMiddleware } from "@clerk/nextjs"
import { NextResponse } from "next/server"

export default authMiddleware({
  publicRoutes: [
    "/",
    "/sign-in*",
    "/sign-up*",
    "/api/webhook*",
    "/:lang",
    "/:lang/sign-in*",
    "/:lang/sign-up*",
    "/:lang/verification*",
  ],
  afterAuth(auth, req) {
    // Handle users who aren't authenticated
    if (!auth.userId && !auth.isPublicRoute) {
      const lang = req.nextUrl.pathname.split('/')[1] || 'en'
      return NextResponse.redirect(new URL(`/${lang}/sign-in`, req.url))
    }

    // If the user is logged in and trying to access a protected route, allow it
    if (auth.userId && !auth.isPublicRoute) {
      return NextResponse.next()
    }

    // If the user is logged in and trying to access sign-in or sign-up, redirect to home
    if (auth.userId && auth.isPublicRoute) {
      const lang = req.nextUrl.pathname.split('/')[1] || 'en'
      return NextResponse.redirect(new URL(`/${lang}`, req.url))
    }

    return NextResponse.next()
  },
})

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
} 