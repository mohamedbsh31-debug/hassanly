export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ booking?: string }>
}

async function getBooking(bookingId: string) {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('bookings')
    .select('*, shops(name, wilaya), services(name, duration), barbers(name)')
    .eq('id', bookingId)
    .single()
  return data
}

function formatDatetime(iso: string) {
  const d = new Date(iso)
  const days   = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi']
  const months = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} à ${d.getHours()}h${String(d.getMinutes()).padStart(2,'0')}`
}

export default async function ConfirmedPage({ params, searchParams }: Props) {
  const { id } = await params
  const { booking: bookingId } = await searchParams
  const booking = bookingId ? await getBooking(bookingId) : null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

      <nav style={{ background: 'rgba(13,12,10,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', height: 58, display: 'flex', alignItems: 'center', padding: '0 2rem', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--ink)', lineHeight: 1 }}>
            Hass<span style={{ color: 'var(--copper)' }}>anly</span>
          </div>
        </Link>
        <Link href="/" style={{ color: 'var(--ink-3)', fontSize: '0.85rem' }}>Accueil</Link>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(200,133,74,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '2.5rem 2rem', width: '100%', maxWidth: 480, textAlign: 'center', position: 'relative', zIndex: 1 }}>

          {/* Check icon */}
          <div style={{ width: 64, height: 64, background: 'var(--green-dim)', border: '2px solid rgba(61,158,106,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.6rem', color: 'var(--green)' }}>
            ✓
          </div>

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--copper)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>— Réservation confirmée</div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--ink)', marginBottom: '0.5rem', fontWeight: 400 }}>
            C'est reservé !
          </h1>
          <p style={{ color: 'var(--ink-3)', fontSize: '0.875rem', marginBottom: '2rem', lineHeight: 1.6 }}>
            Votre rendez-vous a été enregistré. Le salon vous contactera pour confirmer.
          </p>

          {booking && (
            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '1.25rem', marginBottom: '2rem', textAlign: 'left' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Récapitulatif</div>
              {[
                { label: 'Salon', value: booking.shops?.name },
                { label: 'Service', value: booking.services?.name },
                { label: 'Coiffeur', value: booking.barbers?.name ?? 'Premier disponible' },
                { label: 'Date', value: formatDatetime(booking.booked_at) },
                { label: 'Durée', value: `${booking.duration} min` },
                { label: 'Prix', value: `${booking.price.toLocaleString()} DA` },
                { label: 'Wilaya', value: booking.shops?.wilaya },
              ].filter(r => r.value).map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 8 }}>
                  <span style={{ color: 'var(--ink-3)' }}>{row.label}</span>
                  <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{row.value}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href={`/shops/${id}`} className="btn-ghost" style={{ fontSize: '0.85rem', padding: '10px 20px' }}>
              ← Retour au salon
            </Link>
            <Link href="/" className="btn-copper" style={{ fontSize: '0.85rem', padding: '10px 20px' }}>
              Accueil →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
