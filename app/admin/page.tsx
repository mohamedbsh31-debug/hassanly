export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import AdminClient from './AdminClient'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export default async function AdminPage() {
  // ── Auth guard: admin role only ────────────────────────────────────────────
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/admin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  // ── Fetch all data with service role (bypasses RLS) ────────────────────────
  const service = getServiceClient()

  const [profilesRes, shopsRes, bookingsRes, paymentsRes] = await Promise.all([
    service
      .from('profiles')
      .select('id, full_name, phone, role, wilaya, created_at')
      .order('created_at', { ascending: false }),
    service
      .from('shops')
      .select('id, owner_id, name, wilaya, plan, is_active, is_verified, rating, plan_expires_at, created_at, phone, description')
      .order('created_at', { ascending: false }),
    service
      .from('bookings')
      .select('id, shop_id, client_id, booked_at, price, status, created_at')
      .order('booked_at', { ascending: false })
      .limit(200),
    service
      .from('payment_sessions')
      .select('id, shop_id, plan, amount, status, paid_at, created_at')
      .order('created_at', { ascending: false })
      .limit(200),
  ])

  return (
    <AdminClient
      adminProfile={profile}
      profiles={profilesRes.data ?? []}
      shops={shopsRes.data ?? []}
      bookings={bookingsRes.data ?? []}
      payments={paymentsRes.data ?? []}
    />
  )
}
