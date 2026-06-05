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

  // First half of overlap: existing booking starts before our slot ends.
  // We fetch the rows (with duration) so we can apply the second half in JS,
  // because PostgREST can't compute booked_at + duration * interval inline.
  let conflictQuery = supabase
    .from('bookings')
    .select('booked_at, duration')
    .eq('shop_id', shopId)
    .in('status', ['pending', 'confirmed'])
    .lt('booked_at', slotEnd.toISOString())

  // If a specific barber was chosen, only block that barber's slots.
  // If "premier disponible" (no barber), block the whole shop slot.
  if (barberId) {
    conflictQuery = conflictQuery.eq('barber_id', barberId)
  }

  const { data: candidates, error: conflictError } = await conflictQuery

  if (conflictError) {
    return { error: 'Erreur lors de la vérification de disponibilité.' }
  }

  // Second half of overlap: existing booking must also end AFTER our slot starts.
  // existingEnd = booked_at + duration minutes. Uses strict > so back-to-back
  // slots (e.g. 11:00–11:30 then 11:30–12:00) are correctly allowed.
  const hasConflict = (candidates ?? []).some(b => {
    const existingEnd = new Date(b.booked_at).getTime() + b.duration * 60_000
    return existingEnd > slotStart.getTime()
  })

  if (hasConflict) {
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
