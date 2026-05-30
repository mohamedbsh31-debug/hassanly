'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getPlanLimits } from '@/lib/plan-limits'

async function getOwnerShop(supabase: any, userId: string) {
  const { data } = await supabase
    .from('shops')
    .select('id, plan')
    .eq('owner_id', userId)
    .single()
  return data ?? null
}

async function getOwnerShopId(supabase: any, userId: string) {
  const shop = await getOwnerShop(supabase, userId)
  return shop?.id ?? null
}

export async function addBarberAction(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non autorisé' }

  const shop = await getOwnerShop(supabase, user.id)
  if (!shop) return { error: 'Salon introuvable' }
  const shopId = shop.id

  // ── Plan limit: max barbers ──────────────────────────────────────────────
  const limits = getPlanLimits(shop.plan)
  if (limits.maxBarbers !== -1) {
    const { count } = await supabase
      .from('barbers')
      .select('id', { count: 'exact', head: true })
      .eq('shop_id', shopId)
    if ((count ?? 0) >= limits.maxBarbers) {
      const nextPlan = shop.plan === 'starter' ? 'Pro' : 'Elite'
      return { error: `Votre formule ${shop.plan} est limitée à ${limits.maxBarbers} coiffeur(s). Passez à ${nextPlan} pour en ajouter plus.` }
    }
  }

  const name  = (formData.get('name') as string)?.trim()
  const emoji = formData.get('emoji') as string
  const bio   = (formData.get('bio') as string)?.trim()

  if (!name) return { error: 'Le prénom est requis.' }

  const { data, error } = await supabase.from('barbers').insert({
    shop_id: shopId,
    name,
    emoji: emoji || '👨🏽',
    bio: bio || null,
  }).select().single()

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true, barber: data }
}

export async function updateBarberAction(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non autorisé' }

  const shopId   = await getOwnerShopId(supabase, user.id)
  const barberId = formData.get('barber_id') as string
  if (!shopId || !barberId) return { error: 'Données manquantes' }

  const name  = (formData.get('name') as string)?.trim()
  const emoji = formData.get('emoji') as string
  const bio   = (formData.get('bio') as string)?.trim()

  if (!name) return { error: 'Le prénom est requis.' }

  const { error } = await supabase
    .from('barbers')
    .update({ name, emoji: emoji || '👨🏽', bio: bio || null })
    .eq('id', barberId)
    .eq('shop_id', shopId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteBarberAction(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non autorisé' }

  const shopId   = await getOwnerShopId(supabase, user.id)
  const barberId = formData.get('barber_id') as string
  if (!shopId || !barberId) return { error: 'Données manquantes' }

  const { error } = await supabase
    .from('barbers')
    .delete()
    .eq('id', barberId)
    .eq('shop_id', shopId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}
