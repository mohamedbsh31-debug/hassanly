'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase'

async function getOwnerShopId(supabase: any, userId: string) {
  const { data } = await supabase
    .from('shops')
    .select('id')
    .eq('owner_id', userId)
    .single()
  return data?.id ?? null
}

export async function addBarberAction(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non autorisé' }

  const shopId = await getOwnerShopId(supabase, user.id)
  if (!shopId) return { error: 'Salon introuvable' }

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
