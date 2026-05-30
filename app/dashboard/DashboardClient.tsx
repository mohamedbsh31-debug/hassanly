'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { logoutAction } from '@/lib/auth-actions'
import ServicesManager from './services/ServicesManager'
import StaffManager from './staff/StaffManager'
import WorkingHoursManager from './hours/WorkingHoursManager'
import { getPlanLimits } from '@/lib/plan-limits'

import type { WeekSchedule } from '@/lib/working-hours-actions'

type Profile  = { full_name: string | null; role: string; wilaya: string | null }
type Shop     = { id: string; name: string; wilaya: string; plan: string; is_active: boolean; is_verified: boolean; rating: number | null; plan_expires_at: string | null }
type Booking  = { id: string; booked_at: string; duration: number; price: number; status: string; notes: string | null; profiles: any; services: any; barbers: any }
type Service  = { id: string; name: string; duration: number; price: number; icon: string }
type Barber   = { id: string; name: string; emoji: string; rating: number | null; review_count: number }
type Props    = { profile: Profile; shop: Shop; bookings: Booking[]; services: Service[]; barbers: Barber[]; shopHours: WeekSchedule | null; barberHours: Record<string, WeekSchedule | null> }
type Tab      = 'overview' | 'appointments' | 'clients' | 'services' | 'staff' | 'hours' | 'billing' | 'analytics'

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'overview',     icon: '📊', label: "Vue d'ensemble" },
  { id: 'appointments', icon: '📅', label: 'Rendez-vous' },
  { id: 'clients',      icon: '👥', label: 'Clients' },
  { id: 'services',     icon: '✂️',  label: 'Services & Tarifs' },
  { id: 'staff',        icon: '👨‍💼', label: 'Mon équipe' },
  { id: 'hours',        icon: '🕐', label: 'Horaires' },
  { id: 'analytics',   icon: '📈', label: 'Analytiques' },
  { id: 'billing',      icon: '💳', label: 'Abonnement' },
]

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente', confirmed: 'Confirmé', completed: 'Terminé', cancelled: 'Annulé',
}
const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending:   { bg: '#fff8e6', color: '#a06010' },
  confirmed: { bg: '#e8f5ee', color: '#2e6e45' },
  completed: { bg: '#eff6ff', color: '#1d4ed8' },
  cancelled: { bg: '#fef2f2', color: '#dc2626' },
}
const PLAN_LABELS: Record<string, string> = { starter: 'Starter', pro: 'Pro', elite: 'Elite' }
const PLAN_PRICES: Record<string, number>  = { starter: 3000, pro: 6500, elite: 12000 }

function formatDate(iso: string) {
  const d = new Date(iso)
  const days   = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam']
  const months = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} · ${d.getHours()}h${String(d.getMinutes()).padStart(2,'0')}`
}

function isToday(iso: string) {
  const d = new Date(iso), n = new Date()
  return d.getDate() === n.getDate() && d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear()
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function DashboardClient({ profile, shop, bookings, services, barbers, shopHours, barberHours }: Props) {
  const searchParams = useSearchParams()
  const tabParam  = searchParams.get('tab') as Tab | null
  const validTabs: Tab[] = ['overview', 'appointments', 'clients', 'services', 'staff', 'hours', 'analytics', 'billing']
  const initialTab: Tab  = tabParam && validTabs.includes(tabParam) ? tabParam : 'overview'

  const [activeTab,    setActiveTab]    = useState<Tab>(initialTab)
  const [sidebarOpen,  setSidebarOpen]  = useState(false)
  const [localBookings, setBookings]    = useState<Booking[]>(bookings)
  const [toast,        setToast]        = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')

  const firstName    = profile.full_name?.split(' ')[0] ?? 'vous'
  const pendingCount = localBookings.filter(b => b.status === 'pending').length
  const planLimits   = getPlanLimits(shop.plan)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  async function confirmBooking(id: string) {
    const res = await fetch('/api/bookings/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: id }),
    })
    if (res.ok) {
      setBookings(b => b.map(bk => bk.id === id ? { ...bk, status: 'confirmed' } : bk))
      showToast('Rendez-vous confirmé !')
    }
  }

  const todayBookings = localBookings.filter(b => isToday(b.booked_at))
  const todayRevenue  = todayBookings.filter(b => b.status === 'completed').reduce((s, b) => s + b.price, 0)
  const monthRevenue  = localBookings.filter(b => {
    const d = new Date(b.booked_at), n = new Date()
    return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear() && b.status === 'completed'
  }).reduce((s, b) => s + b.price, 0)

  const filteredBookings = statusFilter === 'all' ? localBookings : localBookings.filter(b => b.status === statusFilter)
  const uniqueClients    = [...new Map(localBookings.map(b => [b.profiles?.full_name, b])).values()]

  function navItem(tab: Tab) {
    const t   = TABS.find(x => x.id === tab)!
    const active = activeTab === tab
    const locked = tab === 'analytics' && !planLimits.hasAnalytics
    return (
      <button
        key={tab}
        onClick={() => { if (!locked) { setActiveTab(tab); setSidebarOpen(false) } }}
        style={{
          width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 20px', border: 'none', cursor: locked ? 'not-allowed' : 'pointer', fontSize: 14, fontFamily: 'inherit',
          borderLeft: `3px solid ${active ? '#d97706' : 'transparent'}`,
          background: active ? '#fff7ed' : 'transparent',
          color: active ? '#d97706' : locked ? '#c4c9d4' : '#6b7280',
          fontWeight: active ? 600 : 400,
          transition: 'all 0.15s',
          opacity: locked ? 0.6 : 1,
        }}
      >
        <span style={{ fontSize: 16 }}>{t.icon}</span>
        <span>{t.label}</span>
        {tab === 'appointments' && pendingCount > 0 && (
          <span style={{ marginLeft: 'auto', background: '#d97706', color: '#fff', borderRadius: 999, fontSize: 11, fontWeight: 700, padding: '1px 7px' }}>
            {pendingCount}
          </span>
        )}
        {locked && <span style={{ marginLeft: 'auto', fontSize: 12 }}>🔒</span>}
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>

      {/* ── SIDEBAR ──────────────────────────────────────────────────── */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 99 }} />
      )}
      <aside style={{
        width: 240, background: '#fff', borderRight: '1px solid #e5e7eb', flexShrink: 0,
        display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #e5e7eb' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', color: '#111827', textDecoration: 'none' }}>
            <svg width="22" height="16" viewBox="0 0 28 22" fill="none">
              <path d="M2 14c4-8 8-8 12 0s8 8 12 0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            hass<span style={{ color: '#d97706' }}>anly</span>
          </Link>
        </div>

        {/* Shop info */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 2 }}>{shop.name}</div>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>{shop.wilaya}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-block', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999,
              background: shop.is_active ? '#ecfdf5' : '#fff8e6',
              color: shop.is_active ? '#065f46' : '#92400e',
              border: `1px solid ${shop.is_active ? '#6ee7b7' : '#fde68a'}`,
            }}>
              {shop.is_active ? `✓ ${PLAN_LABELS[shop.plan]}` : '⏳ En attente'}
            </span>
            {planLimits.hasVerifiedBadge && shop.is_verified && (
              <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                ✓ Vérifié
              </span>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, paddingTop: 8 }}>
          {validTabs.map(t => navItem(t))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Link href="/" style={{ fontSize: 13, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}>
            👁 Vue client
          </Link>
          <form action={logoutAction}>
            <button style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: 13, cursor: 'pointer', padding: 0, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
              🚪 Déconnexion
            </button>
          </form>
        </div>
      </aside>

      {/* ── MAIN ─────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Top bar */}
        <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <h1 style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>
            {TABS.find(t => t.id === activeTab)?.label}
          </h1>
          <div style={{ fontSize: 13, color: '#6b7280' }}>
            Bonjour, <strong style={{ color: '#111827' }}>{firstName}</strong> 👋
          </div>
        </header>

        <main style={{ flex: 1, padding: 24, overflowX: 'auto' }}>

          {/* Inactive banner */}
          {!shop.is_active && (
            <div style={{ background: '#fff8e6', border: '1px solid #fde68a', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#92400e', display: 'flex', alignItems: 'center', gap: 8 }}>
              ⏳ <strong>Salon en cours d'activation.</strong> Notre équipe le vérifiera sous 24h.
            </div>
          )}

          {/* ── OVERVIEW ───────────────────────────────────────────── */}
          {activeTab === 'overview' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                <StatCard label="Recettes du jour"  value={todayRevenue > 0 ? `${todayRevenue.toLocaleString()} DA` : '—'} />
                <StatCard label="RDV aujourd'hui"   value={String(todayBookings.length)} />
                <StatCard label="Recettes du mois"  value={monthRevenue > 0 ? `${monthRevenue.toLocaleString()} DA` : '—'} />
                <StatCard label="Note moyenne"       value={shop.rating ? `${shop.rating} ★` : '—'} />
              </div>
              <BookingsTable bookings={localBookings.slice(0, 8)} onConfirm={confirmBooking} />
            </div>
          )}

          {/* ── APPOINTMENTS ───────────────────────────────────────── */}
          {activeTab === 'appointments' && (
            <div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                {['all','pending','confirmed','completed','cancelled'].map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)} style={{
                    padding: '6px 14px', borderRadius: 999, fontSize: 12, cursor: 'pointer', border: '1.5px solid',
                    borderColor: statusFilter === s ? '#d97706' : '#e5e7eb',
                    background: statusFilter === s ? '#fff7ed' : '#fff',
                    color: statusFilter === s ? '#d97706' : '#6b7280',
                    fontWeight: statusFilter === s ? 600 : 400, fontFamily: 'inherit',
                  }}>
                    {s === 'all' ? 'Tous' : STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
              <BookingsTable bookings={filteredBookings} onConfirm={confirmBooking} />
            </div>
          )}

          {/* ── CLIENTS ────────────────────────────────────────────── */}
          {activeTab === 'clients' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                <StatCard label="Total clients"  value={String(uniqueClients.length)} />
                <StatCard label="En attente"     value={String(pendingCount)} />
                <StatCard label="Terminés"       value={String(localBookings.filter(b => b.status === 'completed').length)} />
              </div>
              {uniqueClients.length === 0 ? (
                <EmptyState icon="👥" message="Vos clients apparaîtront ici après les premières réservations." />
              ) : (
                <TableWrap>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <THead cols={['Client', 'Téléphone', 'Visites', 'Total dépensé', 'Dernier RDV']} />
                    <tbody>
                      {uniqueClients.map((b, i) => {
                        const cb    = localBookings.filter(bk => bk.profiles?.full_name === b.profiles?.full_name)
                        const spent = cb.filter(bk => bk.status === 'completed').reduce((s, bk) => s + bk.price, 0)
                        return (
                          <tr key={i} style={{ borderTop: '1px solid #f3f4f6' }}>
                            <td style={td}><strong>{b.profiles?.full_name ?? 'Client'}</strong></td>
                            <td style={{ ...td, color: '#6b7280' }}>{b.profiles?.phone ?? '—'}</td>
                            <td style={td}>{cb.length}</td>
                            <td style={{ ...td, fontWeight: 600 }}>{spent > 0 ? `${spent.toLocaleString()} DA` : '—'}</td>
                            <td style={{ ...td, color: '#6b7280' }}>{formatDate(cb[0].booked_at)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </TableWrap>
              )}
            </div>
          )}

          {/* ── SERVICES ───────────────────────────────────────────── */}
          {activeTab === 'services' && (
            <div>
              {planLimits.maxServices !== -1 && (
                <PlanUsageBanner
                  used={services.length}
                  max={planLimits.maxServices}
                  label="services"
                  plan={shop.plan}
                  upgradeTo="Pro"
                />
              )}
              <ServicesManager services={services} bookings={localBookings} />
            </div>
          )}

          {/* ── STAFF ──────────────────────────────────────────────── */}
          {activeTab === 'staff' && (
            <div>
              {planLimits.maxBarbers !== -1 && (
                <PlanUsageBanner
                  used={barbers.length}
                  max={planLimits.maxBarbers}
                  label="coiffeur(s)"
                  plan={shop.plan}
                  upgradeTo="Pro"
                />
              )}
              <StaffManager barbers={barbers} bookings={localBookings} />
            </div>
          )}

          {/* ── HOURS ──────────────────────────────────────────────── */}
          {activeTab === 'hours' && (
            <WorkingHoursManager
              shopId={shop.id}
              shopName={shop.name}
              shopHours={shopHours}
              barbers={barbers}
              barberHours={barberHours}
            />
          )}

          {/* ── ANALYTICS (Pro/Elite only) ──────────────────────────── */}
          {activeTab === 'analytics' && (
            planLimits.hasAnalytics
              ? <AnalyticsTab bookings={localBookings} />
              : <LockedFeature
                  icon="📈"
                  title="Analytiques — Formule Pro ou Elite"
                  description="Accédez aux statistiques avancées de votre salon : revenus par période, services les plus demandés, taux d'occupation et fidélisation clients."
                  ctaLabel="Passer à Pro — 6 500 DA/mois"
                />
          )}

          {/* ── BILLING ────────────────────────────────────────────── */}
          {activeTab === 'billing' && <BillingTab shop={shop} />}

        </main>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#111827', color: '#fff', padding: '10px 20px', borderRadius: 8, fontSize: 13, boxShadow: '0 4px 16px rgba(0,0,0,0.2)', zIndex: 9999, whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}
    </div>
  )
}

// ─── Shared style atoms ───────────────────────────────────────────────────────
const td: React.CSSProperties = { padding: '12px 16px', verticalAlign: 'middle' }

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px' }}>
      <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>{value}</div>
    </div>
  )
}

function TableWrap({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>{children}</div>
    </div>
  )
}

function THead({ cols }: { cols: string[] }) {
  return (
    <thead>
      <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
        {cols.map(c => (
          <th key={c} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af', whiteSpace: 'nowrap' }}>{c}</th>
        ))}
      </tr>
    </thead>
  )
}

function BookingsTable({ bookings, onConfirm }: { bookings: Booking[]; onConfirm: (id: string) => void }) {
  if (bookings.length === 0) return <EmptyState icon="📅" message="Aucun rendez-vous pour le moment." />
  return (
    <TableWrap>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <THead cols={['Client', 'Service', 'Coiffeur', 'Date & Heure', 'Montant', 'Statut', '']} />
        <tbody>
          {bookings.map(b => {
            const sc = STATUS_COLORS[b.status] ?? STATUS_COLORS.pending
            return (
              <tr key={b.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                <td style={td}><strong>{b.profiles?.full_name ?? 'Client'}</strong></td>
                <td style={td}>{b.services?.name ?? '—'}</td>
                <td style={{ ...td, color: '#6b7280' }}>{b.barbers?.name ?? 'Premier dispo'}</td>
                <td style={{ ...td, color: '#6b7280', whiteSpace: 'nowrap' }}>{formatDate(b.booked_at)}</td>
                <td style={{ ...td, fontWeight: 600 }}>{b.price.toLocaleString()} DA</td>
                <td style={td}>
                  <span style={{ background: sc.bg, color: sc.color, borderRadius: 999, padding: '3px 10px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {STATUS_LABELS[b.status]}
                  </span>
                </td>
                <td style={td}>
                  {b.status === 'pending' && (
                    <button onClick={() => onConfirm(b.id)} style={{ background: '#d97706', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                      Confirmer
                    </button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </TableWrap>
  )
}

function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '48px 24px', textAlign: 'center', color: '#9ca3af' }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>{icon}</div>
      <p style={{ fontSize: 14, maxWidth: 300, margin: '0 auto' }}>{message}</p>
    </div>
  )
}

// ─── Billing tab ─────────────────────────────────────────────────────────────
function BillingTab({ shop }: { shop: Shop }) {
  const [selectedPlan, setSelectedPlan] = useState(shop.plan)
  const [isPending, startTransition]    = useTransition()

  const PLANS = [
    { id: 'starter', name: 'Starter', price: 3000,  features: ["1 coiffeur", "Jusqu'à 5 services", "Réservation en ligne", "Notifications SMS"] },
    { id: 'pro',     name: 'Pro',     price: 6500,  features: ["Jusqu'à 5 coiffeurs", "Services illimités", "Analytics & rapports", "Badge Vérifié", "WhatsApp"], popular: true },
    { id: 'elite',   name: 'Elite',   price: 12000, features: ["Coiffeurs illimités", "Multi-adresses", "Support 24/7", "Mise en avant", "Programme fidélité"] },
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
    <div style={{ maxWidth: 700 }}>
      {/* Current plan */}
      <div style={{ background: '#fff', border: '2px solid #d97706', borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Formule {PLAN_LABELS[shop.plan]}</div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>
              {shop.plan_expires_at
                ? `Active jusqu'au ${new Date(shop.plan_expires_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`
                : "En attente d'activation"}
            </div>
          </div>
          <span style={{ background: shop.is_active ? '#ecfdf5' : '#fff8e6', color: shop.is_active ? '#065f46' : '#92400e', border: `1px solid ${shop.is_active ? '#6ee7b7' : '#fde68a'}`, borderRadius: 999, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>
            {shop.is_active ? '✓ Actif' : '⏳ En attente'}
          </span>
        </div>
        <div style={{ fontSize: 32, fontWeight: 700, color: '#d97706', letterSpacing: '-0.02em' }}>
          {PLAN_PRICES[shop.plan].toLocaleString()} <span style={{ fontSize: 16, fontWeight: 400, color: '#6b7280' }}>DA/mois</span>
        </div>
      </div>

      {/* Plan picker */}
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Changer de formule</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {PLANS.map(p => (
          <div
            key={p.id}
            onClick={() => setSelectedPlan(p.id)}
            style={{
              border: `2px solid ${selectedPlan === p.id ? '#d97706' : '#e5e7eb'}`,
              borderRadius: 10, padding: '16px 20px', cursor: 'pointer',
              background: selectedPlan === p.id ? '#fff7ed' : '#fff',
              position: 'relative', transition: 'all 0.15s',
            }}
          >
            {p.popular && (
              <div style={{ position: 'absolute', top: -11, right: 16, background: '#d97706', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 999 }}>
                Populaire
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{p.name}</span>
              <span style={{ fontWeight: 700, fontSize: 15, color: selectedPlan === p.id ? '#d97706' : '#111827' }}>{p.price.toLocaleString()} DA/mois</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
              {p.features.map(f => <span key={f} style={{ fontSize: 12, color: '#6b7280' }}>✓ {f}</span>)}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleUpgrade}
        disabled={isPending || selectedPlan === shop.plan}
        style={{
          width: '100%', padding: '13px', borderRadius: 8, fontSize: 14, fontWeight: 600,
          border: 'none', cursor: (isPending || selectedPlan === shop.plan) ? 'not-allowed' : 'pointer',
          background: (isPending || selectedPlan === shop.plan) ? '#e5e7eb' : '#d97706',
          color: (isPending || selectedPlan === shop.plan) ? '#9ca3af' : '#fff',
          fontFamily: 'inherit', transition: 'all 0.15s',
        }}
      >
        {isPending
          ? '⏳ Redirection vers le paiement…'
          : selectedPlan === shop.plan
          ? 'Formule actuelle'
          : `Passer à ${PLANS.find(p => p.id === selectedPlan)?.name} — ${PLANS.find(p => p.id === selectedPlan)?.price.toLocaleString()} DA →`}
      </button>

      {/* Payment info */}
      <div style={{ marginTop: 16, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '14px 16px', fontSize: 13, color: '#6b7280' }}>
        <strong style={{ color: '#111827', display: 'block', marginBottom: 6 }}>Paiement via Chargily Pay</strong>
        <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
          {['💳 CIB', '📮 Edahabia'].map(m => (
            <span key={m} style={{ background: '#fff', border: '1px solid #e5e7eb', padding: '3px 10px', borderRadius: 999, fontSize: 12 }}>{m}</span>
          ))}
        </div>
        Commission Chargily : ~2% sur les transactions
      </div>
    </div>
  )
}

// ─── Analytics Tab (Pro/Elite) ────────────────────────────────────────────────
function AnalyticsTab({ bookings }: { bookings: Booking[] }) {
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    return { label: d.toLocaleDateString('fr-FR', { month: 'short' }), m: d.getMonth(), y: d.getFullYear() }
  })

  const revenueByMonth = months.map(({ label, m, y }) => ({
    label,
    revenue: bookings
      .filter(b => b.status === 'completed')
      .filter(b => { const d = new Date(b.booked_at); return d.getMonth() === m && d.getFullYear() === y })
      .reduce((s, b) => s + b.price, 0),
    count: bookings.filter(b => { const d = new Date(b.booked_at); return d.getMonth() === m && d.getFullYear() === y }).length,
  }))

  const maxRev = Math.max(...revenueByMonth.map(r => r.revenue), 1)

  const totalRevenue   = bookings.filter(b => b.status === 'completed').reduce((s, b) => s + b.price, 0)
  const completedCount = bookings.filter(b => b.status === 'completed').length
  const cancelRate     = bookings.length ? Math.round(bookings.filter(b => b.status === 'cancelled').length / bookings.length * 100) : 0

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard label="Revenu total" value={`${totalRevenue.toLocaleString()} DA`} />
        <StatCard label="RDV terminés"  value={String(completedCount)} />
        <StatCard label="Taux annulation" value={`${cancelRate}%`} />
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 16 }}>Revenu mensuel (DA)</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 160, paddingBottom: 8, borderBottom: '1px solid #f3f4f6' }}>
          {revenueByMonth.map(r => (
            <div key={r.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ fontSize: 11, color: '#6b7280' }}>{r.revenue > 0 ? `${(r.revenue / 1000).toFixed(0)}k` : ''}</div>
              <div style={{ width: '100%', maxWidth: 40, background: '#d97706', borderRadius: '4px 4px 0 0', height: `${(r.revenue / maxRev) * 120}px`, minHeight: r.revenue ? 4 : 2, transition: 'height 0.4s', opacity: r.revenue ? 1 : 0.2 }} />
              <div style={{ fontSize: 12, color: '#9ca3af' }}>{r.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Plan Usage Banner ────────────────────────────────────────────────────────
function PlanUsageBanner({ used, max, label, plan, upgradeTo }: { used: number; max: number; label: string; plan: string; upgradeTo: string }) {
  const pct   = Math.min(Math.round(used / max * 100), 100)
  const nearLimit = used >= max - 1
  const atLimit   = used >= max

  if (!nearLimit) return null // only show when close or at limit

  return (
    <div style={{
      background: atLimit ? '#fef2f2' : '#fff7ed',
      border: `1px solid ${atLimit ? '#fecaca' : '#fed7aa'}`,
      borderRadius: 10, padding: '12px 16px', marginBottom: 16,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
    }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: atLimit ? '#dc2626' : '#92400e', marginBottom: 2 }}>
          {atLimit ? `🔒 Limite atteinte — ${used}/${max} ${label}` : `⚠️ Limite proche — ${used}/${max} ${label}`}
        </div>
        <div style={{ fontSize: 12, color: '#9ca3af' }}>
          Passez à {upgradeTo} pour en ajouter plus
        </div>
      </div>
      <a href="/dashboard?tab=billing" style={{ background: '#d97706', color: '#fff', borderRadius: 7, padding: '7px 14px', fontSize: 12, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
        Passer à {upgradeTo} →
      </a>
    </div>
  )
}

// ─── Locked Feature ───────────────────────────────────────────────────────────
function LockedFeature({ icon, title, description, ctaLabel }: { icon: string; title: string; description: string; ctaLabel: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320, textAlign: 'center', padding: 40 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 10 }}>{title}</div>
      <p style={{ fontSize: 14, color: '#6b7280', maxWidth: 360, lineHeight: 1.7, marginBottom: 24 }}>{description}</p>
      <a href="/dashboard?tab=billing" style={{ background: '#d97706', color: '#fff', borderRadius: 8, padding: '11px 24px', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
        {ctaLabel}
      </a>
    </div>
  )
}
