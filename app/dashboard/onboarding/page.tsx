import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase'
import OnboardingClient from './OnboardingClient'

export default async function OnboardingPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Check if they already have a shop
  const { data: existingShop } = await supabase
    .from('shops')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (existingShop) redirect('/dashboard')

  // Get their profile for prefilling
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone, wilaya')
    .eq('id', user.id)
    .single()

  return <OnboardingClient profile={profile} />
}
