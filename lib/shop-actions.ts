'use server'

import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function createShopAction(formData: FormData) {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const name        = formData.get('name') as string
  const wilaya      = formData.get('wilaya') as string
  const address     = formData.get('address') as string
  const phone       = formData.get('phone') as string
  const description = formData.get('description') as string
  const plan        = formData.get('plan') as 'starter' | 'pro' | 'elite'
  const referredBy  = (formData.get('referred_by') as string | null)?.trim().toUpperCase() || null

  // Create the shop (inactive until payment)
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
      referred_by: referredBy || null,
    })
    .select()
    .single()

  if (shopError) return { error: shopError.message }

  // ── Services — sent as JSON by OnboardingClient ────────────────────────────
  // OnboardingClient does: fd.set('services', JSON.stringify([{name, duration, price, icon}]))
  try {
    const raw = JSON.parse((formData.get('services') as string) ?? '[]')
    const validServices = (raw as { name: string; duration: string; price: string; icon: string }[])
      .filter(s => s.name?.trim() !== '' && parseInt(s.price) > 0)
      .map(s => ({
        shop_id:  shop.id,
        name:     s.name.trim(),
        duration: parseInt(s.duration) || 30,
        price:    parseInt(s.price),
        icon:     s.icon || '✂️',
      }))
    if (validServices.length > 0) {
      await supabase.from('services').insert(validServices)
    }
  } catch { /* invalid JSON — skip */ }

  // ── Barbers — sent as JSON by OnboardingClient ────────────────────────────
  // OnboardingClient does: fd.set('barbers', JSON.stringify([{name, emoji}]))
  const validBarbers: { shop_id: string; name: string; emoji: string }[] = []
  try {
    const raw = JSON.parse((formData.get('barbers') as string) ?? '[]')
    const parsed = (raw as { name: string; emoji: string }[])
      .filter(b => b.name?.trim() !== '')
      .map(b => ({
        shop_id: shop.id,
        name:    b.name.trim(),
        emoji:   b.emoji || '👨🏽',
      }))
    validBarbers.push(...parsed)
  } catch { /* invalid JSON — skip */ }

  // Always add "Premier disponible" as a catch-all option
  validBarbers.push({ shop_id: shop.id, name: 'Premier disponible', emoji: '⚡' })
  await supabase.from('barbers').insert(validBarbers)

  redirect(`/dashboard?tab=billing&checkout=1&plan=${plan}`)
}
