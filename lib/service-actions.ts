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

export async function addServiceAction(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non autorisé' }

  const shopId = await getOwnerShopId(supabase, user.id)
  if (!shopId) return { error: 'Salon introuvable' }

  const name     = (formData.get('name') as string)?.trim()
  const duration = parseInt(formData.get('duration') as string)
  const price    = parseInt(formData.get('price') as string)
  const icon     = formData.get('icon') as string
  const description = formData.get('description') as string

  if (!name)         return { error: 'Le nom est requis.' }
  if (!price || price <= 0) return { error: 'Le prix doit être supérieur à 0.' }
  if (!duration)     return { error: 'La durée est requise.' }

  const { error } = await supabase.from('services').insert({
    shop_id: shopId, name, duration, price,
    icon: icon || '✂️',
    description: description || null,
  })

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateServiceAction(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non autorisé' }

  const shopId    = await getOwnerShopId(supabase, user.id)
  const serviceId = formData.get('service_id') as string
  if (!shopId || !serviceId) return { error: 'Données manquantes' }

  const name        = (formData.get('name') as string)?.trim()
  const duration    = parseInt(formData.get('duration') as string)
  const price       = parseInt(formData.get('price') as string)
  const icon        = formData.get('icon') as string
  const description = formData.get('description') as string

  if (!name)  return { error: 'Le nom est requis.' }
  if (!price) return { error: 'Le prix est requis.' }

  const { error } = await supabase
    .from('services')
    .update({ name, duration, price, icon: icon || '✂️', description: description || null })
    .eq('id', serviceId)
    .eq('shop_id', shopId) // security: can only edit own shop's services

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteServiceAction(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non autorisé' }

  const shopId    = await getOwnerShopId(supabase, user.id)
  const serviceId = formData.get('service_id') as string
  if (!shopId || !serviceId) return { error: 'Données manquantes' }

  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', serviceId)
    .eq('shop_id', shopId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}
