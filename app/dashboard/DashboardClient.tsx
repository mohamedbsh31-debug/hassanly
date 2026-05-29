'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { logoutAction } from '@/lib/auth-actions'
import ServicesManager from './services/ServicesManager'
import StaffManager from './staff/StaffManager'

type Profile  = { full_name: string | null; role: string; wilaya: string | null }
type Shop     = { id: string; name: string; wilaya: string; plan: string; is_active: boolean; is_verified: boolean; rating: number | null; plan_expires_at: string | null }
type Booking  = { id: string; booked_at: string; duration: number; price: number; status: string; notes: string | null; profiles: any; services: any; barbers: any }
type Service  = { id: string; name: string; duration: number; price: number; icon: string }
type Barber   = { id: string; name: string; emoji: string; rating: number | null; review_count: number }

type Props = { profile: Profile; shop: Shop; bookings: Booking[]; services: Service[]; barbers: Barber[] }

type Tab = 'overview' | 'appointments' | 'clients' | 'services' | 'staff' | 'billing'

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'overview',      icon: '📊', label: 'Vue d\'ensemble' },
  { id: 'appointments',  icon: '📅', label: 'Rendez-vous' },
  { id: 'clients',       icon: '👥', label: 'Clients' },
  { id: 'services',      icon: '✂️', label: 'Services & Tarifs' },
  { id: 'staff',         icon: '👨‍💼', label: 'Mon équipe' },
  { id: 'billing',       icon: '💳', label: 'Abonnement' },
]

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente', confirmed: 'Confirmé', completed: 'Terminé', cancelled: 'Annulé',
}
const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending:   { bg: '#fff8e6', color: '#a06010' },
  confirmed: { bg: '#e8f5ee', color: '#2e6e45' },
  completed: { bg: '#e8eef5', color: '#2a5080' },
  cancelled: { bg: '#fde8e8', color: '#b03030' },
}

const PLAN_LABELS: Record<string, string> = { starter: 'Starter', pro: 'Pro', elite: 'Elite' }
const PLAN_PRICES: Record<string, number> = { starter: 3000, pro: 6500, elite: 12000 }

function formatDate(iso: string) {
  const d = new Date(iso)
  const days = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam']
  const months = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} à ${d.getHours()}h${String(d.getMinutes()).padStart(2,'0')}`
}

function isToday(iso: string) {
  const d = new Date(iso); const n = new Date()
  return d.getDate() === n.getDate() && d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear()
}

export default function DashboardClient({ profile, shop, bookings, services, barbers }: Props) {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab') as Tab | null
  const validTabs: Tab[] = ['overview', 'appointments', 'clients', 'services', 'staff', 'billing']
  const initialTab: Tab = tabParam && validTabs.includes(tabParam) ? tabParam : 'overview'

  const [activeTab, setActiveTab]   = useState<Tab>(initialTab)
  const [sidebarOpen, setSidebar]   = useState(false)
  const [localBookings, setBookings] = useState<Booking[]>(bookings)
  const [toast, setToast]           = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const firstName = profile.full_name?.split(' ')[0] ?? 'vous'

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  async function confirmBooking(bookingId: string) {
    const res = await fetch('/api/bookings/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId }),
    })
    if (res.ok) {
      setBookings(b => b.map(bk => bk.id === bookingId ? { ...bk, status: 'confirmed' } : bk))
      showToast('Rendez-vous confirmé !')
    }
  }

  // Stats calculations
  const todayBookings   = localBookings.filter(b => isToday(b.booked_at))
  const todayRevenue    = todayBookings.filter(b => b.status === 'completed').reduce((s, b) => s + b.price, 0)
  const monthRevenue    = localBookings.filter(b => {
    const d = new Date(b.booked_at); const n = new Date()
    return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear() && b.status === 'completed'
  }).reduce((s, b) => s + b.price, 0)
  const pendingCount    = localBookings.filter(b => b.status === 'pending').length
  const filteredBookings = statusFilter === 'all'
    ? localBookings
    : localBookings.filter(b => b.status === statusFilter)

  // Unique clients from bookings
  const uniqueClients = [...new Map(localBookings.map(b => [b.profiles?.full_name, b])).values()]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--paper)' }}>

      {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
      <aside style={{
        width: 240, background: 'var(--ink)', flexShrink: 0,
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
      }} className="sidebar">

        {/* Logo + shop info */}
        <div style={{ padding: '1.5rem 1.4rem 1.2rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', color: 'var(--gold)', marginBottom: 10 }}>
            Hass<span style={{ color: 'white' }}>anly</span>
          </div>
          <div style={{ fontSize: '1.3rem', marginBottom: 3 }}>✂️</div>
          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'white' }}>{shop.name}</div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>{shop.wilaya}</div>
          <div style={{
            background: shop.is_active ? 'rgba(201,168,76,0.15)' : 'rgba(176,48,48,0.15)',
            border: `1px solid ${shop.is_active ? 'rgba(201,168,76,0.35)' : 'rgba(176,48,48,0.35)'}`,
            borderRadius: 6, padding: '4px 8px', fontSize: '0.68rem',
            color: shop.is_active ? 'var(--gold)' : '#ff8080',
          }}>
            {shop.is_active
              ? `${shop.is_verified ? '✓ Vérifié' : '●'} — Plan ${PLAN_LABELS[shop.plan]}`
              : '⏳ En attente d\'activation'}
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ padding: '0.6rem 0', flex: 1 }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSidebar(false) }}
              style={{
                width: '100%', textAlign: 'left', background: activeTab === tab.id ? 'rgba(201,168,76,0.12)' : 'none',
                border: 'none', borderLeft: `3px solid ${activeTab === tab.id ? 'var(--gold)' : 'transparent'}`,
                color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.5)',
                padding: '10px 1.4rem', fontSize: '0.85rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 10,
                fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s',
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.id === 'appointments' && pendingCount > 0 && (
                <span style={{ marginLeft: 'auto', background: 'var(--gold)', color: 'white', borderRadius: 20, fontSize: '0.65rem', fontWeight: 700, padding: '1px 7px' }}>
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom links */}
        <div style={{ padding: '1rem 1.4rem', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Link href="/" style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>
            👁 Vue client
          </Link>
          <form action={logoutAction}>
            <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', cursor: 'pointer', padding: 0, fontFamily: 'DM Sans, sans-serif' }}>
              🚪 Déconnexion
            </button>
          </form>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <main style={{ flex: 1, padding: '2rem', overflowX: 'auto', minWidth: 0 }}>

        {/* Inactive shop banner */}
        {!shop.is_active && (
          <div style={{ background: '#fff8e6', border: '1px solid #f5d87a', borderRadius: 8, padding: '12px 16px', marginBottom: '1.5rem', fontSize: '0.875rem', color: '#7a5a10', display: 'flex', alignItems: 'center', gap: 10 }}>
            ⏳ <strong>Votre salon est en cours d'activation.</strong> Notre équipe le vérifiera sous 24h. Vous recevrez une notification dès qu'il sera visible par les clients.
          </div>
        )}

        {/* ── TAB: OVERVIEW ──────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ marginBottom: '1.75rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontFamily: "'Playfair Display', serif", marginBottom: 3 }}>
                Bonjour, {firstName} 👋
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
                Tableau de bord — {shop.name}, {shop.wilaya}
              </p>
            </div>

            {/* Metrics */}
            <div style={metricsGridStyle}>
              <MetricCard label="Recettes du jour"  value={todayRevenue > 0 ? `${todayRevenue.toLocaleString()}` : '—'} unit="DA" />
              <MetricCard label="RDV aujourd'hui"   value={String(todayBookings.length)} />
              <MetricCard label="Recettes du mois"  value={monthRevenue > 0 ? `${(monthRevenue/1000).toFixed(0)}K` : '—'} unit="DA" />
              <MetricCard label="Note moyenne"       value={shop.rating ? `${shop.rating}★` : '—'} />
            </div>

            {/* Recent bookings table */}
            <BookingsTable
              bookings={localBookings.slice(0, 7)}
              onConfirm={confirmBooking}
              onFilterChange={() => setActiveTab('appointments')}
              showFilter={false}
            />
          </div>
        )}

        {/* ── TAB: APPOINTMENTS ──────────────────────────────────────── */}
        {activeTab === 'appointments' && (
          <div>
            <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h2 style={pageTitleStyle}>Rendez-vous</h2>
                <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>{localBookings.length} au total</p>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['all','pending','confirmed','completed','cancelled'].map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)} style={{
                    padding: '6px 14px', borderRadius: 20, fontSize: '0.78rem', cursor: 'pointer',
                    border: `1.5px solid ${statusFilter === s ? 'var(--gold)' : 'var(--border)'}`,
                    background: statusFilter === s ? 'var(--gold-light)' : 'white',
                    color: statusFilter === s ? 'var(--gold-dark)' : 'var(--muted)',
                    fontFamily: 'DM Sans, sans-serif', fontWeight: statusFilter === s ? 600 : 400,
                  }}>
                    {s === 'all' ? 'Tous' : STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
            <BookingsTable bookings={filteredBookings} onConfirm={confirmBooking} showFilter={false} />
          </div>
        )}

        {/* ── TAB: CLIENTS ───────────────────────────────────────────── */}
        {activeTab === 'clients' && (
          <div>
            <div style={{ marginBottom: '1.75rem' }}>
              <h2 style={pageTitleStyle}>Mes clients</h2>
              <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Gérez votre relation clientèle</p>
            </div>

            <div style={metricsGridStyle}>
              <MetricCard label="Total clients"     value={String(uniqueClients.length)} />
              <MetricCard label="RDV ce mois"       value={String(localBookings.filter(b => { const d = new Date(b.booked_at); const n = new Date(); return d.getMonth() === n.getMonth() }).length)} />
              <MetricCard label="En attente"        value={String(pendingCount)} />
              <MetricCard label="Terminés"          value={String(localBookings.filter(b => b.status === 'completed').length)} />
            </div>

            {localBookings.length === 0 ? (
              <EmptyState icon="👥" message="Vos clients apparaîtront ici après les premières réservations." />
            ) : (
              <div style={tableWrapStyle}>
                <div style={tableHeaderStyle}>
                  <h3 style={tableHeadingStyle}>Clients récents</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={tableStyle}>
                    <thead>
                      <tr style={theadStyle}>
                        <th style={thStyle}>Client</th>
                        <th style={thStyle}>Visites</th>
                        <th style={thStyle}>Dernier RDV</th>
                        <th style={thStyle}>Total dépensé</th>
                        <th style={thStyle}>Service préféré</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uniqueClients.map((b, i) => {
                        const clientBookings = localBookings.filter(bk => bk.profiles?.full_name === b.profiles?.full_name)
                        const totalSpent = clientBookings.filter(bk => bk.status === 'completed').reduce((s, bk) => s + bk.price, 0)
                        const lastVisit = clientBookings[0]
                        const favService = clientBookings[0]?.services?.name ?? '—'
                        return (
                          <tr key={i} style={trStyle}>
                            <td style={tdStyle}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={avatarStyle}>👤</div>
                                <span style={{ fontWeight: 500 }}>{b.profiles?.full_name ?? 'Client'}</span>
                              </div>
                            </td>
                            <td style={tdStyle}>{clientBookings.length} visite{clientBookings.length > 1 ? 's' : ''}</td>
                            <td style={{ ...tdStyle, color: 'var(--muted)' }}>{lastVisit ? formatDate(lastVisit.booked_at) : '—'}</td>
                            <td style={{ ...tdStyle, fontWeight: 600 }}>{totalSpent > 0 ? `${totalSpent.toLocaleString()} DA` : '—'}</td>
                            <td style={tdStyle}><span style={tagStyle}>{favService}</span></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: SERVICES ──────────────────────────────────────────── */}
        {activeTab === 'services' && (
          <ServicesManager services={services} bookings={localBookings} />
        )}

        {/* ── TAB: STAFF ─────────────────────────────────────────────── */}
        {activeTab === 'staff' && (
          <StaffManager barbers={barbers} bookings={localBookings} />
        )}


        {/* ── TAB: BILLING ───────────────────────────────────────────── */}
        {activeTab === 'billing' && (
          <BillingTab shop={shop} />
        )}
      </main>

      {/* ── TOAST ────────────────────────────────────────────────────────── */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: 'var(--slate)', color: 'white', padding: '10px 20px', borderRadius: 8, fontSize: '0.875rem', boxShadow: '0 4px 16px rgba(0,0,0,0.3)', zIndex: 999, whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .sidebar { position: fixed !important; left: 0; top: 0; z-index: 200; transform: translateX(-100%); transition: transform 0.25s; }
          .sidebar.open { transform: translateX(0); }
          main { padding: 1rem !important; }
        }
      `}</style>
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function MetricCard({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 10, padding: '1.1rem 1.25rem' }}>
      <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', fontWeight: 700, lineHeight: 1 }}>{value}</div>
      {unit && <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: 2 }}>{unit}</div>}
    </div>
  )
}

function BookingsTable({ bookings, onConfirm, showFilter }: { bookings: any[]; onConfirm: (id: string) => void; showFilter: boolean; onFilterChange?: () => void }) {
  return (
    <div style={tableWrapStyle}>
      <div style={tableHeaderStyle}>
        <h3 style={tableHeadingStyle}>Rendez-vous récents</h3>
      </div>
      {bookings.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.875rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>📅</div>
          Aucun rendez-vous pour le moment.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr style={theadStyle}>
                <th style={thStyle}>Client</th>
                <th style={thStyle}>Service</th>
                <th style={thStyle}>Coiffeur</th>
                <th style={thStyle}>Date & Heure</th>
                <th style={thStyle}>Montant</th>
                <th style={thStyle}>Statut</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => {
                const sc = STATUS_COLORS[b.status] ?? STATUS_COLORS.pending
                return (
                  <tr key={b.id} style={trStyle}>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={avatarStyle}>👤</div>
                        <span style={{ fontWeight: 500 }}>{b.profiles?.full_name ?? 'Client'}</span>
                      </div>
                    </td>
                    <td style={tdStyle}>{b.services?.name ?? '—'}</td>
                    <td style={{ ...tdStyle, color: 'var(--muted)' }}>{b.barbers?.name ?? 'Premier dispo'}</td>
                    <td style={{ ...tdStyle, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{formatDate(b.booked_at)}</td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{b.price.toLocaleString()} DA</td>
                    <td style={tdStyle}>
                      <span style={{ background: sc.bg, color: sc.color, borderRadius: 20, padding: '3px 10px', fontSize: '0.72rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {STATUS_LABELS[b.status]}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {b.status === 'pending' && (
                        <button onClick={() => onConfirm(b.id)} style={{ ...btnOutlineSmStyle, fontSize: '0.75rem', padding: '4px 10px' }}>
                          Confirmer
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 10, padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{icon}</div>
      <p style={{ fontSize: '0.875rem', maxWidth: 320, margin: '0 auto' }}>{message}</p>
    </div>
  )
}

// ─── Shared styles ───────────────────────────────────────────────────────────
const metricsGridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }
const pageTitleStyle: React.CSSProperties  = { fontSize: '1.5rem', fontFamily: "'Playfair Display', serif", marginBottom: 3 }
const tableWrapStyle: React.CSSProperties  = { background: 'white', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }
const tableHeaderStyle: React.CSSProperties = { padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
const tableHeadingStyle: React.CSSProperties = { fontSize: '0.95rem', fontWeight: 700, fontFamily: 'DM Sans, sans-serif' }
const tableStyle: React.CSSProperties      = { width: '100%', borderCollapse: 'collapse' }
const theadStyle: React.CSSProperties      = { background: 'var(--cream)' }
const thStyle: React.CSSProperties         = { padding: '10px 14px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', whiteSpace: 'nowrap' }
const trStyle: React.CSSProperties         = { borderTop: '1px solid var(--border)' }
const tdStyle: React.CSSProperties         = { padding: '12px 14px', fontSize: '0.875rem', verticalAlign: 'middle' }
const avatarStyle: React.CSSProperties     = { width: 30, height: 30, background: 'var(--cream)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }
const tagStyle: React.CSSProperties        = { background: 'var(--cream)', padding: '2px 10px', borderRadius: 20, fontSize: '0.75rem' }
const btnGoldStyle: React.CSSProperties    = { background: 'var(--gold)', color: 'white', border: 'none', borderRadius: 7, padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }
const btnOutlineSmStyle: React.CSSProperties = { background: 'none', border: '1.5px solid var(--border)', color: 'var(--ink)', borderRadius: 7, padding: '6px 14px', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'inline-flex', alignItems: 'center' }

// ─── BillingTab component ────────────────────────────────────────────────────
function BillingTab({ shop }: { shop: Shop }) {
  const [selectedPlan, setSelectedPlan] = useState<string>(shop.plan)
  const [isPending, startTransition]    = useTransition()

  const PLANS = [
    { id: 'starter', name: 'Starter', price: 3000, features: ["1 coiffeur", "Jusqu'à 5 services", "Réservation en ligne"] },
    { id: 'pro',     name: 'Pro',     price: 6500, features: ["Jusqu'à 5 coiffeurs", "Services illimités", "Analytics & rapports", "Badge Vérifié"], popular: true },
    { id: 'elite',   name: 'Elite',   price: 12000, features: ["Coiffeurs illimités", "Multi-adresses", "Support prioritaire 24/7", "Mise en avant"] },
  ]

  function handleUpgrade() {
    startTransition(async () => {
      const { createChargilyCheckoutAction } = await import('@/lib/chargily-actions')
      const fd = new FormData()
      fd.set('plan', selectedPlan)
      await createChargilyCheckoutAction(fd)
    })
  }

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={pageTitleStyle}>Abonnement</h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Gérez votre formule Hassanly</p>
      </div>

      {/* Current plan */}
      <div style={{ background: 'white', border: '2px solid var(--gold)', borderRadius: 10, padding: '1.75rem', maxWidth: 480, marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>Formule {PLAN_LABELS[shop.plan]}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 2 }}>
              {shop.plan_expires_at
                ? `Actif jusqu'au ${new Date(shop.plan_expires_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`
                : "En attente d'activation"}
            </div>
          </div>
          <span style={{ background: shop.is_active ? '#e8f5ee' : '#fff8e6', color: shop.is_active ? '#2d6b40' : '#a06010', padding: '4px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700 }}>
            {shop.is_active ? '✓ Actif' : '⏳ En attente'}
          </span>
        </div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.2rem', fontWeight: 800, color: 'var(--gold-dark)', marginBottom: 4 }}>
          {PLAN_PRICES[shop.plan].toLocaleString()} <span style={{ fontSize: '1rem' }}>DA/mois</span>
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Commission : 0% sur vos réservations</div>
      </div>

      {/* Plan picker for upgrade */}
      {shop.plan !== 'elite' && (
        <div style={{ maxWidth: 560, marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', fontFamily: 'DM Sans, sans-serif' }}>
            Changer de formule
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '1rem' }}>
            {PLANS.map(p => (
              <div
                key={p.id}
                onClick={() => setSelectedPlan(p.id)}
                style={{
                  border: `2px solid ${selectedPlan === p.id ? 'var(--gold)' : 'var(--border)'}`,
                  borderRadius: 10, padding: '1rem 1.25rem', cursor: 'pointer',
                  background: selectedPlan === p.id ? 'var(--gold-light)' : 'white',
                  transition: 'all 0.15s', position: 'relative',
                }}
              >
                {p.popular && <div style={{ position: 'absolute', top: -10, right: 14, background: 'var(--gold)', color: 'white', fontSize: '0.68rem', fontWeight: 700, padding: '2px 10px', borderRadius: 20 }}>⭐ Plus populaire</div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontWeight: 700 }}>{p.name}</span>
                  <span style={{ fontWeight: 800, color: selectedPlan === p.id ? 'var(--gold-dark)' : 'var(--ink)' }}>{p.price.toLocaleString()} DA/mois</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
                  {p.features.map(f => <span key={f} style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>✓ {f}</span>)}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleUpgrade}
            disabled={isPending || selectedPlan === shop.plan}
            style={{ ...btnGoldStyle, width: '100%', padding: '13px', fontSize: '0.95rem', opacity: (isPending || selectedPlan === shop.plan) ? 0.55 : 1, cursor: (isPending || selectedPlan === shop.plan) ? 'not-allowed' : 'pointer' }}
          >
            {isPending
              ? '⏳ Redirection vers le paiement...'
              : selectedPlan === shop.plan
              ? 'Formule actuelle'
              : `Passer à ${PLANS.find(p => p.id === selectedPlan)?.name} — ${PLANS.find(p => p.id === selectedPlan)?.price.toLocaleString()} DA →`}
          </button>
        </div>
      )}

      {/* Payment methods */}
      <div style={{ background: 'var(--cream)', borderRadius: 8, padding: '1rem 1.25rem', fontSize: '0.82rem', color: 'var(--muted)', maxWidth: 480 }}>
        <strong style={{ color: 'var(--ink)', display: 'block', marginBottom: 6 }}>Modes de paiement acceptés via Chargily Pay</strong>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
          {['💳 CIB', '📮 EDAHABIA'].map(m => (
            <span key={m} style={{ background: 'white', border: '1px solid var(--border)', padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem' }}>{m}</span>
          ))}
        </div>
        <span style={{ color: 'var(--gold-dark)', fontSize: '0.75rem' }}>Commission Chargily : ~2% sur les transactions</span>
      </div>
    </div>
  )
}

import { useTransition as useTransitionAlias } from 'react'
