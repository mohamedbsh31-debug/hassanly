'use server'

import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

const PLAN_PRICES: Record<string, number> = { starter: 3000, pro: 6500, elite: 12000 }
const PLAN_LABELS: Record<string, string>  = { starter: 'Starter', pro: 'Pro', elite: 'Elite' }

// Server-side Supabase client with service role (bypasses RLS for payment writes)
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function createChargilyCheckoutAction(formData: FormData) {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const plan = formData.get('plan') as string
  if (!['starter', 'pro', 'elite'].includes(plan)) {
    return { error: 'Formule invalide.' }
  }

  // Get their shop
  const { data: shop } = await supabase
    .from('shops')
    .select('id, name, plan')
    .eq('owner_id', user.id)
    .single()

  if (!shop) return { error: 'Salon introuvable.' }

  const amount      = PLAN_PRICES[plan]
  const siteUrl     = process.env.NEXT_PUBLIC_SITE_URL!
  const chargilyUrl = process.env.CHARGILY_API_URL!
  const secretKey   = process.env.CHARGILY_SECRET_KEY!

  // Create checkout session on Chargily
  const chargilyRes = await fetch(`${chargilyUrl}/checkouts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amount * 100,                    // convert DA → centimes (Chargily v2 requires centimes)
      currency: 'dzd',
      success_url: `${siteUrl}/dashboard/billing/success?plan=${plan}`,
      failure_url: `${siteUrl}/dashboard/billing/failed`,
      webhook_url: `${siteUrl}/api/chargily/webhook`,
      description: `Hassanly — Formule ${PLAN_LABELS[plan]} · ${shop.name}`,
      locale: 'fr',
      metadata: {
        shop_id: shop.id,
        plan,
        user_id: user.id,
      },
    }),
  })

  if (!chargilyRes.ok) {
    const err = await chargilyRes.json()
    console.error('Chargily error:', err)
    return { error: 'Erreur de paiement. Réessayez ou contactez le support.' }
  }

  const checkout = await chargilyRes.json()

  // Save session to DB using service role (bypasses RLS)
  const serviceClient = getServiceClient()
  await serviceClient.from('payment_sessions').insert({
    shop_id:     shop.id,
    chargily_id: checkout.id,
    plan,
    amount,
    status:      'pending',
  })

  // Redirect to Chargily's hosted payment page
  redirect(checkout.checkout_url)
}
