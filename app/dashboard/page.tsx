import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'barber_owner' && profile?.role !== 'admin') {
    redirect('/')
  }

  // Get their shop
  const { data: shop } = await supabase
    .from('shops')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  // If no shop yet, send to onboarding
  if (!shop) redirect('/dashboard/onboarding')

  // Fetch all dashboard data in parallel
  const [bookingsRes, servicesRes, barbersRes] = await Promise.all([
    supabase
      .from('bookings')
      .select(`
        *,
        profiles!bookings_client_id_fkey ( full_name, phone ),
        services ( name, duration ),
        barbers ( name )
      `)
      .eq('shop_id', shop.id)
      .order('booked_at', { ascending: false })
      .limit(50),
    supabase
      .from('services')
      .select('*')
      .eq('shop_id', shop.id)
      .order('price'),
    supabase
      .from('barbers')
      .select('*')
      .eq('shop_id', shop.id),
  ])

  return (
    <DashboardClient
      profile={profile}
      shop={shop}
      bookings={bookingsRes.data ?? []}
      services={servicesRes.data ?? []}
      barbers={barbersRes.data ?? []}
    />
  )
}
