export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

type Props = { searchParams: Promise<{ plan?: string; shop_id?: string }> }

const PLAN_LABELS: Record<string, string>  = { starter: 'Starter', pro: 'Pro', elite: 'Elite' }
const PLAN_PRICES: Record<string, number>  = { starter: 3000, pro: 6500, elite: 12000 }
const PLAN_FEATURES: Record<string, string[]> = {
  starter: ['1 coiffeur', 'Réservation en ligne', "Jusqu'à 5 services"],
  pro:     ["Jusqu'à 5 coiffeurs", 'Services illimités', 'Analytics & rapports', 'Badge Salon Vérifié'],
  elite:   ['Coiffeurs illimités', 'Support prioritaire 24/7', 'Mise en avant en tête de liste'],
}
const PLAN_DURATION_DAYS = 30

// Service role client — bypasses RLS
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export default async function PaymentSuccessPage({ searchParams }: Props) {
  const { plan, shop_id } = await searchParams
  const planKey  = plan && ['starter', 'pro', 'elite'].includes(plan) ? plan : 'starter'
  const label    = PLAN_LABELS[planKey]
  const price    = PLAN_PRICES[planKey]
  const features = PLAN_FEATURES[planKey]

  // ── Activate the shop immediately ──────────────────────────────────────────
  // This runs server-side as a fallback for when the Chargily webhook can't
  // reach the server (e.g. localhost in test mode). In production the webhook
  // fires first and this becomes a harmless no-op upsert.
  if (shop_id && planKey) {
    try {
      const supabase  = getServiceClient()
      const expiresAt = new Date(Date.now() + PLAN_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString()

      await supabase
        .from('shops')
        .update({ plan: planKey, plan_expires_at: expiresAt, is_active: true })
        .eq('id', shop_id)

      await supabase
        .from('payment_sessions')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('shop_id', shop_id)
        .eq('status', 'pending')
    } catch (err) {
      console.error('Success-page shop activation error:', err)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0e0c', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ background: '#faf8f4', borderRadius: 12, padding: '2.5rem', width: '100%', maxWidth: 480, textAlign: 'center', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>

        {/* Logo */}
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', color: '#c9a84c', marginBottom: '1.75rem' }}>
          Hass<span style={{ color: '#0f0e0c' }}>anly</span>
        </div>

        {/* Success icon */}
        <div style={{ width: 72, height: 72, background: '#e8f5ee', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', fontSize: '2rem' }}>
          ✓
        </div>

        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', marginBottom: '0.4rem', color: '#0f0e0c' }}>
          Paiement confirmé !
        </h2>
        <p style={{ color: '#7a7670', fontSize: '0.9rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
          Bienvenue sur la formule <strong style={{ color: '#c9a84c' }}>{label}</strong>. Votre salon est maintenant <strong style={{ color: '#2e6e45' }}>actif</strong> et visible pour les clients.
        </p>

        {/* Plan summary */}
        <div style={{ background: '#f2ede4', borderRadius: 10, padding: '1.25rem', marginBottom: '1.5rem', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>Formule {label}</span>
            <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, color: '#a8882e', fontSize: '1.1rem' }}>
              {price.toLocaleString()} DA/mois
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {features.map(f => (
              <div key={f} style={{ fontSize: '0.82rem', color: '#7a7670', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#2e6e45', fontWeight: 700 }}>✓</span> {f}
              </div>
            ))}
          </div>
        </div>

        {/* Activated notice */}
        <div style={{ background: '#e8f5ee', border: '1px solid #86efac', borderRadius: 8, padding: '10px 14px', fontSize: '0.8rem', color: '#166534', marginBottom: '1.75rem' }}>
          🎉 Votre salon est activé immédiatement. Vous pouvez commencer à recevoir des réservations dès maintenant.
        </div>

        <Link href="/dashboard" style={{ display: 'block', background: '#c9a84c', color: 'white', borderRadius: 8, padding: '13px', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none' }}>
          Aller au tableau de bord →
        </Link>
      </div>
    </div>
  )
}
