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
    return { error: error.message }
  }

  redirect(`/shops/${shopId}/confirmed?booking=${data.id}`)
}
