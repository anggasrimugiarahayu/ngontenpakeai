import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth

  if (!isLoggedIn) {
    const redirectUrl = new URL("/login", req.url)
    redirectUrl.searchParams.set("redirect", req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
})

// Tentukan halaman mana saja yang ingin di-protect (dicegat)
export const config = {
  matcher: [
    "/ruang-growing",
    "/ruang-growing/:path*",
    "/master-blueprint",
    "/master-blueprint/:path*",
    "/bio-builder",
    "/bio-builder/:path*",
    "/content-builder",
    "/content-builder/:path*",
    "/ebook-builder",
    "/ebook-builder/:path*",
    "/pengaturan",
    "/pengaturan/:path*",
  ],
}
