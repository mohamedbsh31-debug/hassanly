'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase'
import type { WorkingHours } from '@/types/database'

// ─── Types ────────────────────────────────────────────────────────────────────

export type DaySchedule = {
  open: boolean
  start: string  // "HH:MM"
  end: string    // "HH:MM"
  break_start?: string | null
  break_end?: string | null
}

export type WeekSchedule = Record<string, DaySchedule>  // key = "0".."6" (Sun..Sat)

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getOwnerShopId(supabase: any, userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('shops')
    .select('id')
    .eq('owner_id', userId)
    .single()
  return data?.id ?? null
}

function rowsToSchedule(rows: WorkingHours[]): WeekSchedule {
  const schedule: WeekSchedule = {}
  for (const row of rows) {
    schedule[String(row.day_of_week)] = {
      open:        row.is_open,
      start:       row.open_time  ?? '09:00',
      end:         row.close_time ?? '18:00',
      break_start: row.break_start ?? null,
      break_end:   row.break_end   ?? null,
    }
  }
  return schedule
}

// ─── Shop working hours ───────────────────────────────────────────────────────

export async function getShopWorkingHoursAction(shopId: string): Promise<WeekSchedule | null> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('working_hours')
    .select('*')
    .eq('shop_id', shopId)
    .is('barber_id', null)
    .order('day_of_week')

  if (error || !data || data.length === 0) return null
  return rowsToSchedule(data as WorkingHours[])
}

export async function saveShopWorkingHoursAction(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non autorisé' }

  const shopId = await getOwnerShopId(supabase, user.id)
  if (!shopId) return { error: 'Salon introuvable' }

  const scheduleJson = formData.get('schedule') as string
  let schedule: WeekSchedule
  try { schedule = JSON.parse(scheduleJson) }
  catch { return { error: 'Données invalides' } }

  // Upsert one row per day (0-6)
  const rows = Object.entries(schedule).map(([day, s]) => ({
    shop_id:     shopId,
    barber_id:   null as string | null,
    day_of_week: parseInt(day),
    is_open:     s.open,
    open_time:   s.open ? s.start : null,
    close_time:  s.open ? s.end   : null,
    break_start: s.open ? (s.break_start || null) : null,
    break_end:   s.open ? (s.break_end   || null) : null,
  }))

  const { error } = await supabase
    .from('working_hours')
    .upsert(rows as any, { onConflict: 'shop_id,barber_id,day_of_week', ignoreDuplicates: false })

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}

// ─── Barber working hours ─────────────────────────────────────────────────────

export async function getBarberWorkingHoursAction(barberId: string): Promise<WeekSchedule | null> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('working_hours')
    .select('*')
    .eq('barber_id', barberId)
    .order('day_of_week')

  if (error || !data || data.length === 0) return null
  return rowsToSchedule(data as WorkingHours[])
}

export async function saveBarberWorkingHoursAction(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non autorisé' }

  const shopId   = await getOwnerShopId(supabase, user.id)
  const barberId = formData.get('barber_id') as string
  if (!shopId || !barberId) return { error: 'Données manquantes' }

  // Verify barber belongs to this shop
  const { data: barber } = await supabase
    .from('barbers')
    .select('id')
    .eq('id', barberId)
    .eq('shop_id', shopId)
    .single()
  if (!barber) return { error: 'Coiffeur introuvable' }

  const scheduleJson = formData.get('schedule') as string
  let schedule: WeekSchedule
  try { schedule = JSON.parse(scheduleJson) }
  catch { return { error: 'Données invalides' } }

  const rows = Object.entries(schedule).map(([day, s]) => ({
    shop_id:     shopId,
    barber_id:   barberId,
    day_of_week: parseInt(day),
    is_open:     s.open,
    open_time:   s.open ? s.start : null,
    close_time:  s.open ? s.end   : null,
    break_start: s.open ? (s.break_start || null) : null,
    break_end:   s.open ? (s.break_end   || null) : null,
  }))

  const { error } = await supabase
    .from('working_hours')
    .upsert(rows as any, { onConflict: 'shop_id,barber_id,day_of_week', ignoreDuplicates: false })

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}
