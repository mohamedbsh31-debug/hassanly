import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { createClient } from '@supabase/supabase-js'

// Plan durations in days
const PLAN_DURATION: Record<string, number> = {
  starter: 30,
  pro:     30,
  elite:   30,
}

// Service role client — bypasses RLS, used only server-side
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function POST(request: NextRequest) {
  const rawBody   = await request.text()
  const signature = request.headers.get('signature') // Chargily v2 uses lowercase 'signature'

  // ── 1. Verify HMAC signature ───────────────────────────────────────────────
  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  const secretKey = process.env.CHARGILY_SECRET_KEY!
  const computed  = createHmac('sha256', secretKey).update(rawBody).digest('hex')

  try {
    const sigBuf  = Buffer.from(signature, 'hex')
    const compBuf = Buffer.from(computed, 'hex')
    if (sigBuf.length !== compBuf.length || !timingSafeEqual(sigBuf, compBuf)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
    }
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
  }

  // ── 2. Parse event ─────────────────────────────────────────────────────────
  let event: any
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const supabase = getServiceClient()

  // ── 3. Handle checkout.paid ────────────────────────────────────────────────
  if (event.type === 'checkout.paid') {
    const checkout   = event.data
    const chargilyId = checkout.id
    const metadata   = checkout.metadata ?? {}
    const shopId     = metadata.shop_id as string
    const plan       = metadata.plan as string

    if (!shopId || !plan) {
      console.error('Webhook missing metadata:', metadata)
      return NextResponse.json({ ok: true }) // still return 200
    }

    // Calculate plan expiry
    const days      = PLAN_DURATION[plan] ?? 30
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()

    // Update the shop's plan + activate it
    const { error: shopError } = await supabase
      .from('shops')
      .update({
        plan,
        plan_expires_at: expiresAt,
        is_active: true,
      })
      .eq('id', shopId)

    if (shopError) {
      console.error('Failed to update shop:', shopError)
      return NextResponse.json({ error: shopError.message }, { status: 500 })
    }

    // Mark payment session as paid
    await supabase
      .from('payment_sessions')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('chargily_id', chargilyId)

    console.log(`✅ Payment confirmed: shop ${shopId} upgraded to ${plan}`)
  }

  // ── 4. Handle checkout.failed ──────────────────────────────────────────────
  if (event.type === 'checkout.failed') {
    const chargilyId = event.data.id
    await supabase
      .from('payment_sessions')
      .update({ status: 'failed' })
      .eq('chargily_id', chargilyId)
  }

  // Always return 200 so Chargily knows we received it
  return NextResponse.json({ received: true })
}
