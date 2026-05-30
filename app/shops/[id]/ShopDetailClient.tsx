'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBookingAction } from '@/lib/booking-actions'
import { logoutAction } from '@/lib/auth-actions'
import type { Shop, Profile } from '@/types/database'

type Service = { id: string; shop_id: string; name: string; description: string | null; duration: number; price: number; icon: string; is_active: boolean }
type Barber  = { id: string; shop_id: string; name: string; emoji: string; rating: number | null; review_count: number; bio: string | null; photo_url?: string | null }
type Booking = { booked_at: string; barber_id: string | null }
type Props   = { shop: Shop; services: Service[]; barbers: Barber[]; bookings: Booking[]; user: { user: any; profile: Profile | null } | null }

const DEMO_SERVICES: Service[] = [
  { id: 'd-s1', shop_id: '', name: 'Skin Fade', description: 'Dégradé américain signature', duration: 40, price: 700, icon: '✂️', is_active: true },
  { id: 'd-s2', shop_id: '', name: 'Coupe Classique', description: 'Coupe nette et soignée', duration: 30, price: 500, icon: '✂️', is_active: true },
  { id: 'd-s3', shop_id: '', name: 'Taille Barbe', description: 'Sculpture et mise en forme', duration: 20, price: 400, icon: '🪒', is_active: true },
  { id: 'd-s4', shop_id: '', name: 'Coupe + Barbe', description: 'Forfait complet', duration: 60, price: 1000, icon: '💈', is_active: true },
]
const DEMO_BARBERS: Barber[] = [
  { id: 'd-b1', shop_id: '', name: 'Karim B.', emoji: '👨🏽', rating: 4.9, review_count: 142, bio: null },
  { id: 'd-b2', shop_id: '', name: 'Youcef M.', emoji: '👨🏿', rating: 4.8, review_count: 98, bio: null },
  { id: 'd-b3', shop_id: '', name: 'Premier disponible', emoji: '⚡', rating: null, review_count: 0, bio: null },
]

// Generate time slots from open to close, skipping a break window, every 30 min
function generateSlots(openH = 8, openM = 30, closeH = 18, closeM = 0, breakStart = 12, breakEnd = 14): string[] {
  const slots: string[] = []
  let h = openH, m = openM
  while (h < closeH || (h === closeH && m < closeM)) {
    const inBreak = h >= breakStart && h < breakEnd
    if (!inBreak) slots.push(`${h}h${m === 0 ? '00' : m}`)
    m += 30
    if (m >= 60) { h++; m -= 60 }
  }
  return slots
}

// Convert ISO booking datetime → "Hh00" slot string
function bookingToSlot(isoString: string): string {
  const d = new Date(isoString)
  const h = d.getHours()
  const m = d.getMinutes()
  return `${h}h${m === 0 ? '00' : m}`
}
const MONTHS_FR    = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const MONTHS_SHORT = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']
const DAYS_FR      = ['Di','Lu','Ma','Me','Je','Ve','Sa']

export default function ShopDetailClient({ shop, services, barbers, bookings, user }: Props) {
  const router = useRouter()
  const displayServices = services.length > 0 ? services : DEMO_SERVICES
  const displayBarbers  = barbers.length > 0 ? barbers : DEMO_BARBERS
  const isDemo = services.length === 0

  const now = new Date()
  const [calYear, setCalYear]         = useState(now.getFullYear())
  const [calMonth, setCalMonth]       = useState(now.getMonth())
  const [selectedService, setService] = useState<Service | null>(null)
  const [selectedBarber, setBarber]   = useState<Barber | null>(null)
  const [selectedDay, setDay]         = useState<number | null>(null)
  const [selectedTime, setTime]       = useState<string | null>(null)
  const [notes, setNotes]             = useState('')
  const [submitting, setSubmitting]   = useState(false)
  const [error, setError]             = useState<string | null>(null)

  const daysInMonth   = new Date(calYear, calMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay()
  const isToday = (d: number) => d === now.getDate() && calMonth === now.getMonth() && calYear === now.getFullYear()
  const isPast  = (d: number) => new Date(calYear, calMonth, d) < new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const selectedDateLabel = selectedDay ? `${selectedDay} ${MONTHS_SHORT[calMonth]} ${calYear}` : null

  const selectedDatetime = useMemo(() => {
    if (!selectedDay || !selectedTime) return null
    const [h, m] = selectedTime.replace('h', ':').split(':')
    return new Date(calYear, calMonth, selectedDay, parseInt(h), parseInt(m || '0')).toISOString()
  }, [selectedDay, selectedTime, calYear, calMonth])

  const canBook = selectedService && selectedDay && selectedTime

  function prevMonth() {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) }
    else setCalMonth(m => m - 1)
    setDay(null); setTime(null)
  }
  function nextMonth() {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) }
    else setCalMonth(m => m + 1)
    setDay(null); setTime(null)
  }

  async function handleBook() {
    if (!canBook) { setError('Choisissez un service, une date et une heure.'); return }
    if (!user) { router.push(`/auth/login?redirect=/shops/${shop.id}`); return }
    if (isDemo) { setError('Ce salon est en aperçu. Réservation indisponible.'); return }
    setSubmitting(true); setError(null)
    const fd = new FormData()
    fd.set('shop_id', shop.id); fd.set('service_id', selectedService!.id)
    fd.set('barber_id', selectedBarber?.id ?? ''); fd.set('booked_at', selectedDatetime!)
    fd.set('duration', String(selectedService!.duration)); fd.set('price', String(selectedService!.price))
    fd.set('notes', notes)
    const result = await createBookingAction(fd)
    if (result?.error) { setError(result.error); setSubmitting(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(13,12,10,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', height: 58, display: 'flex', alignItems: 'center', padding: '0 2rem', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--ink)', lineHeight: 1 }}>
            Hass<span style={{ color: 'var(--copper)' }}>anly</span>
          </div>
        </Link>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link href="/" style={{ color: 'var(--ink-3)', fontSize: '0.85rem' }}>← Accueil</Link>
          {user
            ? <form action={logoutAction}><button className="btn-ghost" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>Déconnexion</button></form>
            : <Link href={`/auth/login?redirect=/shops/${shop.id}`} className="btn-copper" style={{ padding: '7px 16px', fontSize: '0.82rem' }}>Connexion</Link>
          }
        </div>
      </nav>

      {/* SHOP HEADER */}
      <div style={{ background: 'var(--bg-1)', borderBottom: '1px solid var(--border)', padding: '2.5rem 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(60deg, rgba(200,133,74,0.03) 0, rgba(200,133,74,0.03) 1px, transparent 1px, transparent 48px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, var(--copper) 40%, var(--copper) 60%, transparent)', opacity: 0.3 }} />
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap' }}>
          <div style={{ width: 72, height: 72, background: 'var(--bg-3)', border: '1px solid var(--border-2)', borderRadius: 'var(--r-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', flexShrink: 0, overflow: 'hidden' }}>
            {shop.image_url
              ? <img src={shop.image_url} alt={shop.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : '✂️'
            }
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 2.1rem)', color: 'var(--ink)', marginBottom: 8, fontWeight: 400 }}>
              {shop.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--ink-3)' }}>
              {shop.rating && (
                <span style={{ color: 'var(--copper)', fontFamily: 'var(--font-mono)' }}>★ {shop.rating}</span>
              )}
              <span>·</span>
              <span>{shop.wilaya}{shop.address ? `, ${shop.address}` : ''}</span>
              <span>·</span>
              <span className="badge-green">Ouvert</span>
              {shop.is_verified && <span className="badge-copper">✓ Vérifié</span>}
            </div>
            {shop.description && (
              <p style={{ color: 'var(--ink-3)', fontSize: '0.8rem', marginTop: 6, lineHeight: 1.5 }}>{shop.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem', display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'start' }} className="detail-layout">

        {/* LEFT */}
        <div>
          {/* Services */}
          <section style={{ marginBottom: '2rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--copper)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>— Services</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
              {displayServices.map(svc => {
                const sel = selectedService?.id === svc.id
                return (
                  <div key={svc.id} onClick={() => setService(sel ? null : svc)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: sel ? 'var(--copper-dim)' : 'var(--bg-1)', cursor: 'pointer', transition: 'background 0.15s', borderLeft: `2px solid ${sel ? 'var(--copper)' : 'transparent'}` }}>
                    <div style={{ fontSize: '1.3rem', flexShrink: 0, width: 32, textAlign: 'center' }}>{svc.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: sel ? 600 : 500, fontSize: '0.9rem', color: 'var(--ink)', marginBottom: 2 }}>{svc.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--ink-3)' }}>
                        {svc.duration} min{svc.description ? ` · ${svc.description}` : ''}
                      </div>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9rem', color: sel ? 'var(--copper)' : 'var(--ink)', flexShrink: 0 }}>
                      {svc.price.toLocaleString()} DA
                    </div>
                    {sel && <span style={{ color: 'var(--copper)', flexShrink: 0 }}>✓</span>}
                  </div>
                )
              })}
            </div>
          </section>

          {/* Barbers */}
          <section>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--copper)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>— Coiffeurs</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1px', background: 'var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
              {displayBarbers.map(b => {
                const sel = selectedBarber?.id === b.id
                return (
                  <div key={b.id} onClick={() => setBarber(sel ? null : b)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 10px', background: sel ? 'var(--copper-dim)' : 'var(--bg-1)', cursor: 'pointer', transition: 'background 0.15s', borderTop: `2px solid ${sel ? 'var(--copper)' : 'transparent'}` }}>
                    {b.photo_url
                      ? <img src={b.photo_url} alt={b.name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', marginBottom: 8, border: sel ? '2px solid var(--copper)' : '2px solid var(--border)' }} />
                      : <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{b.emoji}</div>
                    }
                    <div style={{ fontWeight: sel ? 600 : 500, fontSize: '0.8rem', color: 'var(--ink)', textAlign: 'center', marginBottom: 3 }}>{b.name}</div>
                    {b.rating
                      ? <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--ink-3)' }}>★ {b.rating} ({b.review_count})</div>
                      : <div style={{ fontSize: '0.68rem', color: 'var(--copper)' }}>Slot rapide</div>
                    }
                  </div>
                )
              })}
            </div>
          </section>
        </div>

        {/* RIGHT — Booking Panel */}
        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '1.5rem', position: 'sticky', top: 70 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--copper)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>— Réservation</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--ink)', marginBottom: '1.5rem', fontWeight: 400 }}>Choisir un créneau</h3>

          {/* Calendar */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Date</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <button onClick={prevMonth} style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', fontSize: '1rem', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
              <span style={{ fontSize: '0.85rem', color: 'var(--ink)', fontWeight: 600 }}>{MONTHS_FR[calMonth]} {calYear}</span>
              <button onClick={nextMonth} style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', fontSize: '1rem', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
              {DAYS_FR.map(d => <span key={d} style={{ textAlign: 'center', fontSize: '0.65rem', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>{d}</span>)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
              {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
                const past = isPast(d), today = isToday(d), sel = selectedDay === d
                return (
                  <div key={d} onClick={() => { if (!past) { setDay(d); setTime(null) } }} style={{
                    aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 6, fontSize: '0.78rem', transition: 'all 0.12s',
                    cursor: past ? 'not-allowed' : 'pointer', opacity: past ? 0.28 : 1,
                    background: sel ? 'var(--copper)' : today ? 'var(--copper-dim)' : 'transparent',
                    color: sel ? 'white' : today ? 'var(--copper)' : 'var(--ink)',
                    fontWeight: sel || today ? 700 : 400,
                    border: today && !sel ? '1px solid var(--copper)' : '1px solid transparent',
                    fontFamily: 'var(--font-mono)',
                  }}>
                    {d}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Time slots */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Horaires</span>
              {selectedDateLabel && <span style={{ color: 'var(--copper)', textTransform: 'none', letterSpacing: 0, fontSize: '0.7rem' }}>{selectedDateLabel}</span>}
            </div>
            {!selectedDay
              ? <p style={{ fontSize: '0.78rem', color: 'var(--ink-3)', fontStyle: 'italic' }}>Sélectionnez d'abord une date</p>
              : (() => {
                  const timeSlots = generateSlots()
                  // Filter bookings to the selected day
                  const selectedDate = new Date(calYear, calMonth, selectedDay)
                  const takenSlots = new Set(
                    bookings
                      .filter(b => {
                        const d = new Date(b.booked_at)
                        return d.getFullYear() === selectedDate.getFullYear()
                          && d.getMonth() === selectedDate.getMonth()
                          && d.getDate() === selectedDate.getDate()
                          && (selectedBarber === null || b.barber_id === null || b.barber_id === selectedBarber?.id)
                      })
                      .map(b => bookingToSlot(b.booked_at))
                  )
                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5 }}>
                      {timeSlots.map(slot => {
                        const taken = takenSlots.has(slot), sel = selectedTime === slot
                        return (
                          <div key={slot} onClick={() => { if (!taken) setTime(slot) }} style={{
                            padding: '7px 4px', borderRadius: 6, fontSize: '0.72rem', textAlign: 'center',
                            fontFamily: 'var(--font-mono)', cursor: taken ? 'not-allowed' : 'pointer',
                            background: sel ? 'var(--copper)' : 'var(--bg-2)',
                            color: sel ? 'white' : taken ? 'var(--ink-3)' : 'var(--ink)',
                            border: `1px solid ${sel ? 'var(--copper)' : 'var(--border)'}`,
                            textDecoration: taken ? 'line-through' : 'none',
                            opacity: taken ? 0.45 : 1,
                            transition: 'all 0.12s',
                          }}>
                            {slot}
                          </div>
                        )
                      })}
                    </div>
                  )
                })()
            }
          </div>

          {/* Notes */}
          {selectedDay && selectedTime && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Notes (optionnel)</div>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ex: Fade bas, côtés courts…" rows={2} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--r)', fontSize: '0.82rem', fontFamily: 'var(--font-ui)', resize: 'vertical', outline: 'none', color: 'var(--ink)', background: 'var(--bg-2)', transition: 'border-color 0.18s' }} onFocus={e => e.currentTarget.style.borderColor = 'var(--copper)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'} />
            </div>
          )}

          {/* Summary */}
          {(selectedService || selectedBarber || selectedDay || selectedTime) && (
            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '12px 14px', marginBottom: '1rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Récap</div>
              {selectedService && <SumRow label="Service" value={selectedService.name} />}
              {selectedBarber && <SumRow label="Coiffeur" value={selectedBarber.name} />}
              {selectedDateLabel && <SumRow label="Date" value={selectedDateLabel} />}
              {selectedTime && <SumRow label="Heure" value={selectedTime} />}
              {selectedService && (
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, marginTop: 8, borderTop: '1px solid var(--border)', fontWeight: 700, fontSize: '0.9rem', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: 'var(--ink-3)', fontWeight: 400, fontFamily: 'var(--font-ui)', fontSize: '0.82rem' }}>Total</span>
                  <span style={{ color: 'var(--copper)' }}>{selectedService.price.toLocaleString()} DA</span>
                </div>
              )}
            </div>
          )}

          {error && <div className="auth-error" style={{ marginBottom: '1rem' }}>{error}</div>}

          <button onClick={handleBook} disabled={!canBook || submitting} className="btn-copper" style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '0.9rem', opacity: !canBook || submitting ? 0.5 : 1, cursor: !canBook || submitting ? 'not-allowed' : 'pointer' }}>
            {submitting ? '⏳ Confirmation…' : !user ? '🔐 Connexion pour réserver' : !canBook ? 'Service, date et heure →' : 'Confirmer la réservation →'}
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .detail-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

function SumRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 5 }}>
      <span style={{ color: 'var(--ink-3)' }}>{label}</span>
      <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{value}</span>
    </div>
  )
}
