import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isLandingPage = request.nextUrl.pathname === '/'
  const isLoginPage = request.nextUrl.pathname.startsWith('/login')
  const isSignupPage = request.nextUrl.pathname.startsWith('/signup')

  // Redirect to dashboard if logged-in user tries to access Login, Signup, or Landing
  if (user && (isLoginPage || isSignupPage || isLandingPage)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Redirect to login if unauthenticated user tries to access protected routes
  if (!user && !isLandingPage && !isLoginPage && !isSignupPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher:[
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}