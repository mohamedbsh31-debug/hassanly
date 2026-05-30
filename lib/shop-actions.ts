'use server'

import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function createShopAction(formData: FormData) {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Step 1 data
  const name        = formData.get('name') as string
  const wilaya      = formData.get('wilaya') as string
  const address     = formData.get('address') as string
  const phone       = formData.get('phone') as string
  const description = formData.get('description') as string
  const plan        = formData.get('plan') as 'starter' | 'pro' | 'elite'

  // Create the shop (inactive until manually verified)
  const { data: shop, error: shopError } = await supabase
    .from('shops')
    .insert({
      owner_id:    user.id,
      name,
      wilaya,
      address:     address || null,
      phone:       phone || null,
      description: description || null,
      plan,
      is_active:   false,
      is_verified: false,
    })
    .select()
    .single()

  if (shopError) return { error: shopError.message }

  // Step 2: services (multiple rows)
  const serviceNames     = formData.getAll('service_name') as string[]
  const serviceDurations = formData.getAll('service_duration') as string[]
  const servicePrices    = formData.getAll('service_price') as string[]
  const serviceIcons     = formData.getAll('service_icon') as string[]

  const validServices = serviceNames
    .map((name, i) => ({
      shop_id:  shop.id,
      name,
      duration: parseInt(serviceDurations[i]) || 30,
      price:    parseInt(servicePrices[i]) || 0,
      icon:     serviceIcons[i] || '✂️',
    }))
    .filter(s => s.name.trim() !== '' && s.price > 0)

  if (validServices.length > 0) {
    await supabase.from('services').insert(validServices)
  }

  // Step 3: barbers/staff (multiple rows)
  const barberNames  = formData.getAll('barber_name') as string[]
  const barberEmojis = formData.getAll('barber_emoji') as string[]

  const validBarbers = barberNames
    .map((name, i) => ({
      shop_id: shop.id,
      name,
      emoji:   barberEmojis[i] || '👨🏽',
    }))
    .filter(b => b.name.trim() !== '')

  // Always add "Premier disponible" as a barber option
  validBarbers.push({ shop_id: shop.id, name: 'Premier disponible', emoji: '⚡' })
  await supabase.from('barbers').insert(validBarbers)

  redirect(`/dashboard?tab=billing&checkout=1&plan=${plan}`)
}
