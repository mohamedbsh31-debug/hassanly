import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { bookingId } = await request.json()
  if (!bookingId) return NextResponse.json({ error: 'bookingId requis' }, { status: 400 })

  // Verify the booking belongs to a shop owned by this user
  const { data: booking } = await supabase
    .from('bookings')
    .select('id, shop_id, shops!inner(owner_id)')
    .eq('id', bookingId)
    .single()

  if (!booking) return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 })
  if ((booking as any).shops?.owner_id !== user.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

const { error } = await supabase
  .from('bookings')
  // @ts-ignore
  .update({ status: 'confirmed' })
  .eq('id', bookingId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

