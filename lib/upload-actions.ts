'use server'

import { createServerSupabaseClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

const BUCKET = 'shop-images'

// ── Upload shop cover photo ──────────────────────────────────────────────────
export async function uploadShopPhotoAction(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non autorisé' }

  const file = formData.get('file') as File
  if (!file || file.size === 0) return { error: 'Aucun fichier sélectionné' }
  if (file.size > 5 * 1024 * 1024) return { error: 'Fichier trop grand (max 5 Mo)' }
  if (!file.type.startsWith('image/')) return { error: 'Fichier invalide — image uniquement' }

  // Get shop owned by this user
  const { data: shop } = await supabase
    .from('shops')
    .select('id')
    .eq('owner_id', user.id)
    .single()
  if (!shop) return { error: 'Salon introuvable' }

  const ext  = file.name.split('.').pop() ?? 'jpg'
  const path = `shops/${shop.id}/cover.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type })
  if (uploadError) return { error: uploadError.message }

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path)

  // Save URL to shops table
  const { error: updateError } = await supabase
    .from('shops')
    .update({ image_url: publicUrl })
    .eq('id', shop.id)
  if (updateError) return { error: updateError.message }

  revalidatePath('/dashboard')
  revalidatePath(`/shops/${shop.id}`)
  return { success: true, url: publicUrl }
}

// ── Upload barber photo ──────────────────────────────────────────────────────
export async function uploadBarberPhotoAction(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non autorisé' }

  const file     = formData.get('file') as File
  const barberId = formData.get('barber_id') as string
  if (!file || file.size === 0) return { error: 'Aucun fichier sélectionné' }
  if (file.size > 5 * 1024 * 1024) return { error: 'Fichier trop grand (max 5 Mo)' }
  if (!file.type.startsWith('image/')) return { error: 'Fichier invalide — image uniquement' }
  if (!barberId) return { error: 'Coiffeur introuvable' }

  // Verify ownership
  const { data: shop } = await supabase
    .from('shops')
    .select('id')
    .eq('owner_id', user.id)
    .single()
  if (!shop) return { error: 'Salon introuvable' }

  const ext  = file.name.split('.').pop() ?? 'jpg'
  const path = `shops/${shop.id}/barbers/${barberId}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type })
  if (uploadError) return { error: uploadError.message }

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path)

  // Save URL to barbers table
  const { error: updateError } = await supabase
    .from('barbers')
    .update({ photo_url: publicUrl })
    .eq('id', barberId)
    .eq('shop_id', shop.id)
  if (updateError) return { error: updateError.message }

  revalidatePath('/dashboard')
  return { success: true, url: publicUrl }
}
