export const dynamic = 'force-dynamic'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth-actions'
import HomeClient from './HomeClient'

// Fetch active shops from Supabase
async function getShops() {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('shops')
    .select('*')
    .eq('is_active', true)
    .order('rating', { ascending: false })

  if (error) {
    console.error('Error fetching shops:', error)
    return []
  }
  return data ?? []
}

export default async function HomePage() {
  const [shops, currentUser] = await Promise.all([
    getShops(),
    getCurrentUser(),
  ])

  return <HomeClient shops={shops} user={currentUser} />
}

