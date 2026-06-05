'use server'

import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function createBookingAction(formData: FormData) {
  const supabase = await createServerSupabaseClient()

  // Check user is logged in
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    const shopId = formData.get('shop_id') as string
    redirect(`/auth/login?redirect=/shops/${shopId}`)
  }

  const shopId    = formData.get('shop_id') as string
  const serviceId = formData.get('service_id') as string
  const barberId  = formData.get('barber_id') as string | null
  const bookedAt  = formData.get('booked_at') as string   // ISO datetime string
  const duration  = parseInt(formData.get('duration') as string)
  const price     = parseInt(formData.get('price') as string)
  const notes     = formData.get('notes') as string | null

  // ── Double-booking prevention ─────────────────────────────────────────────
  // Build a query to find any active booking that overlaps this slot.
  // Overlap condition: existingStart < newEnd AND existingEnd > newStart
  // where newEnd = bookedAt + duration minutes.
  const slotStart = new Date(bookedAt)
  const slotEnd   = new Date(slotStart.getTime() + duration * 60_000)

  let conflictQuery = supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .eq('shop_id', shopId)
    .in('status', ['pending', 'confirmed'])
    // existing booking starts before our slot ends
    .lt('booked_at', slotEnd.toISOString())

  // If a specific barber was chosen, only block that barber's slots.
  // If "premier disponible" (no barber), block the whole shop slot.
  if (barberId) {
    conflictQuery = conflictQuery.eq('barber_id', barberId)
  }

  const { count: conflictCount, error: conflictError } = await conflictQuery

  if (conflictError) {
    return { error: 'Erreur lors de la vérification de disponibilité.' }
  }

  if ((conflictCount ?? 0) > 0) {
    return { error: 'Ce créneau vient d\'être réservé. Veuillez choisir un autre horaire.' }
  }
  // ─────────────────────────────────────────────────────────────────────────

  const { data, error } = await supabase
    .from('bookings')
    .insert({
      shop_id:    shopId,
      client_id:  user.id,
      service_id: serviceId || null,
      barber_id:  barberId || null,
      booked_at:  bookedAt,
      duration,
      price,
      notes:      notes || null,
      status:     'pending',
    })
    .select()
    .single()

  if (error) {
    // Catch unique constraint violations from the DB index (belt-and-suspenders)
    if (error.code === '23505') {
      return { error: 'Ce créneau vient d\'être réservé. Veuillez choisir un autre horaire.' }
    }
    return { error: error.message }
  }

  redirect(`/shops/${shopId}/confirmed?booking=${data.id}`)
}
