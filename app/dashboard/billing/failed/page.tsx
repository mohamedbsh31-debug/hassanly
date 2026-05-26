export const dynamic = 'force-dynamic'
import Link from 'next/link'

export default function PaymentFailedPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0f0e0c', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ background: '#faf8f4', borderRadius: 12, padding: '2.5rem', width: '100%', maxWidth: 420, textAlign: 'center', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>

        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', color: '#c9a84c', marginBottom: '1.75rem' }}>
          Hass<span style={{ color: '#0f0e0c' }}>anly</span>
        </div>

        <div style={{ width: 72, height: 72, background: '#fde8e8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', fontSize: '2rem' }}>
          ✕
        </div>

        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', marginBottom: '0.4rem', color: '#0f0e0c' }}>
          Paiement échoué
        </h2>
        <p style={{ color: '#7a7670', fontSize: '0.875rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
          Votre paiement n'a pas pu être traité. Aucun montant n'a été débité. Réessayez ou contactez notre support.
        </p>

        <div style={{ background: '#f2ede4', borderRadius: 8, padding: '12px 14px', fontSize: '0.8rem', color: '#7a7670', marginBottom: '1.5rem' }}>
          <strong style={{ color: '#0f0e0c', display: 'block', marginBottom: 4 }}>Raisons possibles :</strong>
          Solde insuffisant · Carte non activée pour les paiements en ligne · Dépassement de plafond
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/dashboard/billing" style={{ display: 'inline-block', background: '#c9a84c', color: 'white', borderRadius: 8, padding: '11px 22px', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}>
            Réessayer →
          </Link>
          <Link href="/dashboard" style={{ display: 'inline-block', background: 'transparent', border: '1.5px solid #e0dbd0', color: '#0f0e0c', borderRadius: 8, padding: '11px 22px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.875rem', textDecoration: 'none' }}>
            Tableau de bord
          </Link>
        </div>
      </div>
    </div>
  )
}

