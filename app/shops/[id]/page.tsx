export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth-actions'
import ShopDetailClient from './ShopDetailClient'

type Props = { params: Promise<{ id: string }> }

async function getShopData(id: string) {
  const supabase = await createServerSupabaseClient()

  const [shopRes, servicesRes, barbersRes, bookingsRes] = await Promise.all([
    supabase.from('shops').select('*').eq('id', id).single(),
    supabase.from('services').select('*').eq('shop_id', id).eq('is_active', true).order('price'),
    supabase.from('barbers').select('*').eq('shop_id', id).eq('is_active', true),
    // Fetch future bookings only (status pending or confirmed)
    supabase
      .from('bookings')
      .select('booked_at, barber_id')
      .eq('shop_id', id)
      .in('status', ['pending', 'confirmed'])
      .gte('booked_at', new Date().toISOString()),
  ])

  return {
    shop: shopRes.data,
    services: servicesRes.data ?? [],
    barbers: barbersRes.data ?? [],
    bookings: bookingsRes.data ?? [],
  }
}

export default async function ShopDetailPage({ params }: Props) {
  const { id } = await params
  const [{ shop, services, barbers, bookings }, currentUser] = await Promise.all([
    getShopData(id),
    getCurrentUser(),
  ])

  if (!shop) notFound()

  return (
    <ShopDetailClient
      shop={shop}
      services={services}
      barbers={barbers}
      bookings={bookings}
      user={currentUser}
    />
  )
}
