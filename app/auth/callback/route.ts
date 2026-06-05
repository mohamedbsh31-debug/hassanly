import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

// Handles the redirect after email confirmation OR Google OAuth
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const user = data.user

      // Check if profile exists (it may not for first-time Google sign-ins
      // if the DB trigger hasn't fired or doesn't handle OAuth users)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      // First-time Google user — create profile with default 'client' role
      if (!profile) {
        const fullName =
          user.user_metadata?.full_name ??
          user.user_metadata?.name ??
          user.email?.split('@')[0] ??
          'Utilisateur'

        await supabase.from('profiles').insert({
          id:        user.id,
          full_name: fullName,
          role:      'client',
          phone:     null,
          wilaya:    null,
        })

        // New Google user → go to home with welcome flag
        return NextResponse.redirect(`${origin}/?welcome=1`)
      }

      // Existing user — redirect based on role
      if (profile.role === 'barber_owner') {
        return NextResponse.redirect(`${origin}/dashboard`)
      }

      // Honour the ?next= param for protected page redirects
      if (next.startsWith('/')) {
        return NextResponse.redirect(`${origin}${next}`)
      }

      return NextResponse.redirect(`${origin}/`)
    }
  }

  // Auth failed
  return NextResponse.redirect(`${origin}/auth/login?error=confirmation_failed`)
}
