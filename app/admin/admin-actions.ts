'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

async function requireAdmin() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Accès refusé')
  return getServiceClient()
}

// ── Shop: verify / reject ──────────────────────────────────────────────────
export async function verifyShopAction(shopId: string, verified: boolean) {
  const service = await requireAdmin()
  const { error } = await service
    .from('shops')
    .update({ is_verified: verified, is_active: verified })
    .eq('id', shopId)
  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { ok: true }
}

// ── Shop: ban / unban (deactivate) ─────────────────────────────────────────
export async function banShopAction(shopId: string, banned: boolean) {
  const service = await requireAdmin()
  const { error } = await service
    .from('shops')
    .update({ is_active: !banned })
    .eq('id', shopId)
  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { ok: true }
}

// ── Shop: delete ───────────────────────────────────────────────────────────
export async function deleteShopAction(shopId: string) {
  const service = await requireAdmin()
  // Delete related records first to avoid FK violations
  await service.from('bookings').delete().eq('shop_id', shopId)
  await service.from('services').delete().eq('shop_id', shopId)
  await service.from('barbers').delete().eq('shop_id', shopId)
  await service.from('working_hours').delete().eq('shop_id', shopId)
  await service.from('payment_sessions').delete().eq('shop_id', shopId)
  const { error } = await service.from('shops').delete().eq('id', shopId)
  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { ok: true }
}

// ── Manual plan upgrade / downgrade (Chargily fallback) ───────────────────
export async function setShopPlanAction(shopId: string, plan: string, daysFromNow: number = 30) {
  const service = await requireAdmin()
  if (!['starter', 'pro', 'elite'].includes(plan)) return { error: 'Formule invalide' }
  const expiresAt = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000).toISOString()
  const { error } = await service
    .from('shops')
    .update({ plan, plan_expires_at: expiresAt, is_active: true })
    .eq('id', shopId)
  if (error) return { error: error.message }
  // Log a manual payment session for audit
  await service.from('payment_sessions').insert({
    shop_id: shopId,
    plan,
    amount: plan === 'starter' ? 3000 : plan === 'pro' ? 6500 : 12000,
    status: 'paid_manual',
    paid_at: new Date().toISOString(),
    chargily_id: `manual_${Date.now()}`,
  })
  revalidatePath('/admin')
  return { ok: true }
}

// ── User: ban (set role to banned) ─────────────────────────────────────────
export async function banUserAction(userId: string, ban: boolean) {
  const service = await requireAdmin()
  // We use a custom role value — add 'banned' to your UserRole type if needed
  const { error } = await service
    .from('profiles')
    .update({ role: ban ? 'banned' : 'client' })
    .eq('id', userId)
  if (error) return { error: error.message }
  // Also deactivate their shops if banning
  if (ban) {
    await service.from('shops').update({ is_active: false }).eq('owner_id', userId)
  }
  revalidatePath('/admin')
  return { ok: true }
}

// ── User: delete ───────────────────────────────────────────────────────────
export async function deleteUserAction(userId: string) {
  const service = await requireAdmin()
  // Cascade: shops → their children, then profile, then auth user
  const { data: shops } = await service.from('shops').select('id').eq('owner_id', userId)
  for (const shop of shops ?? []) {
    await deleteShopAction(shop.id)
  }
  await service.from('profiles').delete().eq('id', userId)
  // Delete from auth.users using the admin API
  const { error } = await service.auth.admin.deleteUser(userId)
  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { ok: true }
}
