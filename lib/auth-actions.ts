'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase'
import type { UserRole } from '@/types/database'

// ─── Register ─────────────────────────────────────────────────────────────────
export async function registerAction(formData: FormData) {
  const supabase = await createServerSupabaseClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string
  const phone = formData.get('phone') as string
  const role = formData.get('role') as UserRole
  const wilaya = formData.get('wilaya') as string
  const plan = formData.get('plan') as string | null

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone,
        role,
        wilaya,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Profile is auto-created via DB trigger (see SQL migration below)
  // For barber owners, redirect to onboarding; for clients, to home
  if (data.user) {
    if (role === 'barber_owner') {
      // Carry the chosen plan through onboarding so billing tab opens after setup
      const onboardingUrl = plan ? `/dashboard/onboarding?plan=${plan}` : '/dashboard/onboarding'
      redirect(onboardingUrl)
    }
    redirect('/?welcome=1')
  }

  return { error: 'Une erreur est survenue. Réessayez.' }
}

// ─── Login ────────────────────────────────────────────────────────────────────
export async function loginAction(formData: FormData) {
  const supabase = await createServerSupabaseClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = formData.get('redirect') as string | null

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      return { error: 'Email ou mot de passe incorrect.' }
    }
    return { error: error.message }
  }

  if (data.user) {
    // Fetch role from profile to redirect appropriately
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    revalidatePath('/', 'layout')

    // Honour the redirect param (set by middleware when accessing protected routes)
    if (redirectTo && redirectTo.startsWith('/')) {
      redirect(redirectTo)
    }

    if (profile?.role === 'barber_owner') {
      redirect('/dashboard')
    }
    redirect('/')
  }

  return { error: 'Une erreur est survenue.' }
}

// ─── Logout ───────────────────────────────────────────────────────────────────
export async function logoutAction() {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/auth/login')
}

// ─── Get current session (server) ─────────────────────────────────────────────
export async function getSession() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return { user, profile }
}
