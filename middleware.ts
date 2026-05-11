import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Create an unmodified response by default
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // 1. Update the request cookies so the rest of the server can read them
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          
          // 2. Update the response object
          supabaseResponse = NextResponse.next({ request })
          
          // 3. Attach the cookies to the response so the browser saves them
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Fetch the user securely. This triggers the session refresh logic inside setAll if needed.
  const { data: { user } } = await supabase.auth.getUser()

  const isLandingPage = request.nextUrl.pathname === '/'
  const isLoginPage = request.nextUrl.pathname.startsWith('/login')
  const isSignupPage = request.nextUrl.pathname.startsWith('/signup')

  // Rule 1: Logged-in users skip public auth/landing pages and go straight to the dashboard
  if (user && (isLoginPage || isSignupPage || isLandingPage)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Rule 2: Unauthenticated users are kicked out of protected routes
  if (!user && !isLandingPage && !isLoginPage && !isSignupPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}

// Ensure the middleware only runs on actual pages, ignoring static assets and API routes
export const config = {
  matcher:[
    '/((?!_next/static|_next/image|api|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}