'use client'

import { useState, useMemo, useTransition } from 'react'
import Link from 'next/link'
import { logoutAction } from '@/lib/auth-actions'
import {
  verifyShopAction,
  banShopAction,
  deleteShopAction,
  setShopPlanAction,
  banUserAction,
  deleteUserAction,
} from './admin-actions'

// ── Types ──────────────────────────────────────────────────────────────────
type Profile = { id: string; full_name: string | null; phone: string | null; role: string; wilaya: string | null; created_at: string }
type Shop    = { id: string; owner_id: string; name: string; wilaya: string; plan: string; is_active: boolean; is_verified: boolean; rating: number | null; plan_expires_at: string | null; created_at: string; phone: string | null; description: string | null }
type Booking = { id: string; shop_id: string; client_id: string; booked_at: string; price: number; status: string }
type Payment = { id: string; shop_id: string; plan: string; amount: number; status: string; paid_at: string | null; created_at: string }
type Tab     = 'overview' | 'shops' | 'users' | 'payments' | 'analytics'

type Props = {
  adminProfile: Profile
  profiles: Profile[]
  shops: Shop[]
  bookings: Booking[]
  payments: Payment[]
}

const PLAN_PRICES: Record<string, number> = { starter: 3000, pro: 6500, elite: 12000 }
const PLAN_COLOR:  Record<string, { bg: string; color: string; border: string }> = {
  starter: { bg: '#f0fdf4', color: '#166534', border: '#86efac' },
  pro:     { bg: '#fffbeb', color: '#92400e', border: '#fde68a' },
  elite:   { bg: '#fdf4ff', color: '#6b21a8', border: '#e9d5ff' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}
function ago(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return `${s}s`
  if (s < 3600) return `${Math.floor(s / 60)}min`
  if (s < 86400) return `${Math.floor(s / 3600)}h`
  return `${Math.floor(s / 86400)}j`
}

// ── Root component ──────────────────────────────────────────────────────────
export default function AdminClient({ adminProfile, profiles, shops, bookings, payments }: Props) {
  const [tab, setTab]         = useState<Tab>('overview')
  const [toast, setToast]     = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)
  const [sidebarOpen, setSidebar] = useState(false)

  function showToast(msg: string, type: 'ok' | 'err' = 'ok') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview',   label: 'Vue d\'ensemble', icon: '📊' },
    { id: 'shops',      label: 'Salons',           icon: '💈' },
    { id: 'users',      label: 'Utilisateurs',     icon: '👥' },
    { id: 'payments',   label: 'Paiements',        icon: '💳' },
    { id: 'analytics',  label: 'Analytiques',      icon: '📈' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', flexDirection: 'column' }}>

      {/* ── Top bar ── */}
      <header style={{ background: '#111827', color: '#fff', height: 56, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16, flexShrink: 0, zIndex: 50, position: 'sticky', top: 0 }}>
        <button onClick={() => setSidebar(!sidebarOpen)} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: 20, cursor: 'pointer', display: 'none' }} className="admin-burger">☰</button>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
          <svg width="22" height="16" viewBox="0 0 28 22" fill="none"><path d="M2 14c4-8 8-8 12 0s8 8 12 0" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/></svg>
          hass<span style={{ color: '#d97706' }}>anly</span>
        </Link>
        <span style={{ background: '#dc2626', color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 4 }}>ADMIN</span>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 13, color: '#9ca3af' }}>{adminProfile.full_name}</span>
        <form action={logoutAction}>
          <button style={{ background: 'none', border: '1px solid #374151', color: '#9ca3af', borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Déconnexion</button>
        </form>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── Sidebar ── */}
        <aside style={{ width: 220, background: '#1f2937', flexShrink: 0, display: 'flex', flexDirection: 'column', padding: '16px 0' }} className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setSidebar(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px',
                background: tab === t.id ? 'rgba(217,119,6,0.15)' : 'none',
                borderLeft: tab === t.id ? '3px solid #d97706' : '3px solid transparent',
                color: tab === t.id ? '#fbbf24' : '#9ca3af',
                border: 'none', borderRight: 'none', borderTop: 'none', borderBottom: 'none',
                borderLeftWidth: 3, borderLeftStyle: 'solid',
                cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', width: '100%', textAlign: 'left',
                fontWeight: tab === t.id ? 600 : 400, transition: 'all 0.15s',
              }}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ padding: '12px 20px', fontSize: 11, color: '#4b5563' }}>
            {profiles.length} users · {shops.length} salons
          </div>
        </aside>

        {/* ── Content ── */}
        <main style={{ flex: 1, overflow: 'auto', padding: 28 }}>
          {tab === 'overview'  && <OverviewTab  shops={shops} profiles={profiles} bookings={bookings} payments={payments} />}
          {tab === 'shops'     && <ShopsTab     shops={shops} profiles={profiles} onToast={showToast} />}
          {tab === 'users'     && <UsersTab     profiles={profiles} shops={shops} onToast={showToast} />}
          {tab === 'payments'  && <PaymentsTab  payments={payments} shops={shops} onToast={showToast} />}
          {tab === 'analytics' && <AnalyticsTab shops={shops} profiles={profiles} bookings={bookings} payments={payments} />}
        </main>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: toast.type === 'ok' ? '#111827' : '#dc2626',
          color: '#fff', padding: '10px 22px', borderRadius: 8, fontSize: 13,
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)', zIndex: 9999, whiteSpace: 'nowrap',
        }}>
          {toast.type === 'ok' ? '✓ ' : '✕ '}{toast.msg}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar { position: fixed; top: 56px; left: -220px; height: calc(100vh - 56px); z-index: 40; transition: left 0.2s; }
          .admin-sidebar.open { left: 0; }
          .admin-burger { display: block !important; }
        }
      `}</style>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── OVERVIEW TAB ────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function OverviewTab({ shops, profiles, bookings, payments }: { shops: Shop[]; profiles: Profile[]; bookings: Booking[]; payments: Payment[] }) {
  const totalRevenue    = payments.filter(p => p.status === 'paid' || p.status === 'paid_manual').reduce((s, p) => s + p.amount, 0)
  const activeShops     = shops.filter(s => s.is_active).length
  const pendingShops    = shops.filter(s => !s.is_verified && !s.is_active).length
  const totalClients    = profiles.filter(p => p.role === 'client').length
  const totalOwners     = profiles.filter(p => p.role === 'barber_owner').length
  const totalBookings   = bookings.length
  const thisMonthPay    = payments.filter(p => {
    const d = new Date(p.created_at)
    const n = new Date()
    return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear() && (p.status === 'paid' || p.status === 'paid_manual')
  })
  const monthRevenue    = thisMonthPay.reduce((s, p) => s + p.amount, 0)
  const recentPayments  = payments.filter(p => p.status === 'paid' || p.status === 'paid_manual').slice(0, 5)

  // Growth: users registered in last 30 days
  const last30 = new Date(Date.now() - 30 * 86400000)
  const newUsers = profiles.filter(p => new Date(p.created_at) > last30).length

  const planCounts = { starter: 0, pro: 0, elite: 0 }
  shops.forEach(s => { if (s.plan in planCounts) (planCounts as any)[s.plan]++ })

  const stats = [
    { label: 'Utilisateurs totaux',   value: profiles.length.toString(),           sub: `+${newUsers} ce mois` },
    { label: 'Salons actifs',          value: activeShops.toString(),               sub: `${pendingShops} en attente` },
    { label: 'Revenu total (DA)',      value: totalRevenue.toLocaleString('fr-DZ'), sub: `${monthRevenue.toLocaleString()} DA ce mois` },
    { label: 'Réservations',           value: totalBookings.toString(),             sub: `${totalClients} clients · ${totalOwners} gérants` },
  ]

  return (
    <div>
      <h1 style={h1}>Vue d'ensemble</h1>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
        {stats.map(s => (
          <div key={s.label} style={card}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6b7280', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 30, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Plan distribution + pending */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
        {/* Plans */}
        <div style={card}>
          <h2 style={h2}>Répartition des formules</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
            {(['starter', 'pro', 'elite'] as const).map(plan => {
              const count = planCounts[plan]
              const pct   = shops.length ? Math.round(count / shops.length * 100) : 0
              const pc    = PLAN_COLOR[plan]
              return (
                <div key={plan}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{plan}</span>
                    <span style={{ color: '#6b7280' }}>{count} salon{count !== 1 ? 's' : ''} · {pct}%</span>
                  </div>
                  <div style={{ height: 8, background: '#f3f4f6', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: plan === 'elite' ? '#a855f7' : plan === 'pro' ? '#d97706' : '#22c55e', borderRadius: 999, transition: 'width 0.4s' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Pending shops */}
        <div style={card}>
          <h2 style={h2}>Salons en attente de vérification</h2>
          {pendingShops === 0
            ? <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 16 }}>Aucun salon en attente. ✓</p>
            : (
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {shops.filter(s => !s.is_verified && !s.is_active).slice(0, 5).map(s => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{s.wilaya}</div>
                    </div>
                    <span style={{ fontSize: 11, color: '#92400e' }}>En attente</span>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      </div>

      {/* Recent payments */}
      <div style={card}>
        <h2 style={h2}>Paiements récents</h2>
        {recentPayments.length === 0
          ? <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 12 }}>Aucun paiement enregistré.</p>
          : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginTop: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  {['Salon', 'Formule', 'Montant', 'Date'].map(c => (
                    <th key={c} style={{ padding: '6px 12px', textAlign: 'left', fontSize: 11, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentPayments.map(p => (
                  <tr key={p.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                    <td style={td}>{p.shop_id.slice(0, 8)}…</td>
                    <td style={td}><PlanBadge plan={p.plan} /></td>
                    <td style={{ ...td, fontWeight: 600 }}>{p.amount.toLocaleString()} DA</td>
                    <td style={{ ...td, color: '#6b7280' }}>{p.paid_at ? formatDate(p.paid_at) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── SHOPS TAB ───────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function ShopsTab({ shops, profiles, onToast }: { shops: Shop[]; profiles: Profile[]; onToast: (m: string, t?: 'ok' | 'err') => void }) {
  const [isPending, start] = useTransition()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'banned'>('all')
  const [planModal, setPlanModal] = useState<Shop | null>(null)
  const [selectedPlan, setSelectedPlan] = useState('pro')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [localShops, setShops] = useState<Shop[]>(shops)

  const ownerMap = useMemo(() => {
    const m: Record<string, string> = {}
    profiles.forEach(p => { m[p.id] = p.full_name ?? p.id.slice(0, 8) })
    return m
  }, [profiles])

  const filtered = useMemo(() => {
    let list = localShops
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(s => s.name.toLowerCase().includes(q) || s.wilaya.toLowerCase().includes(q))
    }
    if (filter === 'pending') list = list.filter(s => !s.is_verified && !s.is_active)
    if (filter === 'active')  list = list.filter(s => s.is_active)
    if (filter === 'banned')  list = list.filter(s => !s.is_active && s.is_verified)
    return list
  }, [localShops, search, filter])

  function mutateShop(id: string, patch: Partial<Shop>) {
    setShops(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s))
  }

  async function handleVerify(shop: Shop) {
    start(async () => {
      const res = await verifyShopAction(shop.id, !shop.is_verified)
      if (res.error) { onToast(res.error, 'err'); return }
      mutateShop(shop.id, { is_verified: !shop.is_verified, is_active: !shop.is_verified })
      onToast(shop.is_verified ? 'Salon rejeté' : 'Salon vérifié ✓')
    })
  }

  async function handleBan(shop: Shop) {
    start(async () => {
      const res = await banShopAction(shop.id, shop.is_active)
      if (res.error) { onToast(res.error, 'err'); return }
      mutateShop(shop.id, { is_active: !shop.is_active })
      onToast(shop.is_active ? 'Salon suspendu' : 'Salon réactivé')
    })
  }

  async function handleDelete(shopId: string) {
    start(async () => {
      const res = await deleteShopAction(shopId)
      if (res.error) { onToast(res.error, 'err'); return }
      setShops(prev => prev.filter(s => s.id !== shopId))
      setConfirmDelete(null)
      onToast('Salon supprimé')
    })
  }

  async function handleSetPlan() {
    if (!planModal) return
    start(async () => {
      const res = await setShopPlanAction(planModal.id, selectedPlan)
      if (res.error) { onToast(res.error, 'err'); return }
      mutateShop(planModal.id, { plan: selectedPlan, is_active: true })
      setPlanModal(null)
      onToast(`Formule mise à jour → ${selectedPlan} ✓`)
    })
  }

  return (
    <div>
      <h1 style={h1}>Gestion des salons <span style={{ fontSize: 16, color: '#6b7280', fontWeight: 400 }}>({localShops.length})</span></h1>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un salon…" style={searchInput} />
        {(['all', 'pending', 'active', 'banned'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ ...filterBtn, background: filter === f ? '#111827' : '#fff', color: filter === f ? '#fff' : '#374151', border: '1px solid ' + (filter === f ? '#111827' : '#e5e7eb') }}>
            {{ all: 'Tous', pending: 'En attente', active: 'Actifs', banned: 'Suspendus' }[f]}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['Salon', 'Propriétaire', 'Wilaya', 'Formule', 'Statut', 'Inscrit', 'Actions'].map(c => (
                  <th key={c} style={thStyle}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Aucun salon trouvé</td></tr>
              )}
              {filtered.map(s => (
                <tr key={s.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                  <td style={td}>
                    <div style={{ fontWeight: 600, color: '#111827' }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{s.id.slice(0, 8)}…</div>
                  </td>
                  <td style={{ ...td, color: '#6b7280' }}>{ownerMap[s.owner_id] ?? '—'}</td>
                  <td style={{ ...td, color: '#6b7280' }}>{s.wilaya}</td>
                  <td style={td}><PlanBadge plan={s.plan} /></td>
                  <td style={td}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <StatusPill active={s.is_active} label={s.is_active ? 'Actif' : 'Inactif'} />
                      {s.is_verified && <StatusPill active={true} color="blue" label="Vérifié" />}
                      {!s.is_verified && !s.is_active && <StatusPill active={false} color="amber" label="En attente" />}
                    </div>
                  </td>
                  <td style={{ ...td, color: '#9ca3af', whiteSpace: 'nowrap' }}>{formatDate(s.created_at)}</td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {/* Verify / Reject */}
                      <ActionBtn color={s.is_verified ? 'red' : 'green'} disabled={isPending}
                        onClick={() => handleVerify(s)}>
                        {s.is_verified ? 'Rejeter' : 'Vérifier'}
                      </ActionBtn>
                      {/* Ban / Unban */}
                      <ActionBtn color={s.is_active ? 'amber' : 'gray'} disabled={isPending}
                        onClick={() => handleBan(s)}>
                        {s.is_active ? 'Suspendre' : 'Réactiver'}
                      </ActionBtn>
                      {/* Plan */}
                      <ActionBtn color="blue" disabled={isPending}
                        onClick={() => { setPlanModal(s); setSelectedPlan(s.plan) }}>
                        Formule
                      </ActionBtn>
                      {/* Delete */}
                      <ActionBtn color="red" disabled={isPending}
                        onClick={() => setConfirmDelete(s.id)}>
                        Suppr.
                      </ActionBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Plan modal */}
      {planModal && (
        <Modal title={`Changer la formule — ${planModal.name}`} onClose={() => setPlanModal(null)}>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
            Formule actuelle : <strong>{planModal.plan}</strong>. Utilisez ceci si Chargily n'a pas fonctionné.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {(['starter', 'pro', 'elite'] as const).map(p => {
              const pc = PLAN_COLOR[p]
              return (
                <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', border: `2px solid ${selectedPlan === p ? '#d97706' : '#e5e7eb'}`, borderRadius: 8, cursor: 'pointer', background: selectedPlan === p ? '#fff7ed' : '#fff' }}>
                  <input type="radio" name="plan" value={p} checked={selectedPlan === p} onChange={() => setSelectedPlan(p)} />
                  <div>
                    <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{p}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>{PLAN_PRICES[p].toLocaleString()} DA/mois</div>
                  </div>
                </label>
              )
            })}
          </div>
          <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>
            ⚠ Ceci activera le salon pour 30 jours et enregistrera un paiement manuel.
          </p>
          <button onClick={handleSetPlan} disabled={isPending || selectedPlan === planModal.plan}
            style={{ width: '100%', ...btnCopper, opacity: (isPending || selectedPlan === planModal.plan) ? 0.5 : 1 }}>
            {isPending ? 'Enregistrement…' : `Appliquer — ${selectedPlan}`}
          </button>
        </Modal>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <Modal title="Supprimer ce salon ?" onClose={() => setConfirmDelete(null)}>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20, lineHeight: 1.6 }}>
            Cette action est <strong>irréversible</strong>. Toutes les réservations, services et données du salon seront supprimés.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, ...btnGhost }}>Annuler</button>
            <button onClick={() => handleDelete(confirmDelete)} disabled={isPending}
              style={{ flex: 1, background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: isPending ? 0.6 : 1 }}>
              {isPending ? 'Suppression…' : 'Supprimer définitivement'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── USERS TAB ───────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function UsersTab({ profiles, shops, onToast }: { profiles: Profile[]; shops: Shop[]; onToast: (m: string, t?: 'ok' | 'err') => void }) {
  const [isPending, start] = useTransition()
  const [search, setSearch]         = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [localProfiles, setProfiles] = useState<Profile[]>(profiles)

  const shopCountByOwner = useMemo(() => {
    const m: Record<string, number> = {}
    shops.forEach(s => { m[s.owner_id] = (m[s.owner_id] ?? 0) + 1 })
    return m
  }, [shops])

  const filtered = useMemo(() => {
    let list = localProfiles
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(p => p.full_name?.toLowerCase().includes(q) || p.phone?.includes(q) || p.wilaya?.toLowerCase().includes(q))
    }
    if (roleFilter !== 'all') list = list.filter(p => p.role === roleFilter)
    return list
  }, [localProfiles, search, roleFilter])

  async function handleBan(profile: Profile) {
    const isBanned = profile.role === 'banned'
    start(async () => {
      const res = await banUserAction(profile.id, !isBanned)
      if (res.error) { onToast(res.error, 'err'); return }
      setProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, role: isBanned ? 'client' : 'banned' } : p))
      onToast(isBanned ? 'Compte réactivé' : 'Compte suspendu')
    })
  }

  async function handleDelete(userId: string) {
    start(async () => {
      const res = await deleteUserAction(userId)
      if (res.error) { onToast(res.error, 'err'); return }
      setProfiles(prev => prev.filter(p => p.id !== userId))
      setConfirmDelete(null)
      onToast('Utilisateur supprimé')
    })
  }

  const ROLE_LABELS: Record<string, string> = {
    client: 'Client', barber_owner: 'Gérant', admin: 'Admin', banned: 'Suspendu',
  }
  const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
    client:       { bg: '#eff6ff', color: '#1d4ed8' },
    barber_owner: { bg: '#fff7ed', color: '#c2410c' },
    admin:        { bg: '#fdf4ff', color: '#7e22ce' },
    banned:       { bg: '#fef2f2', color: '#dc2626' },
  }

  return (
    <div>
      <h1 style={h1}>Utilisateurs <span style={{ fontSize: 16, color: '#6b7280', fontWeight: 400 }}>({localProfiles.length})</span></h1>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Nom, téléphone, wilaya…" style={searchInput} />
        {['all', 'client', 'barber_owner', 'admin', 'banned'].map(r => (
          <button key={r} onClick={() => setRoleFilter(r)}
            style={{ ...filterBtn, background: roleFilter === r ? '#111827' : '#fff', color: roleFilter === r ? '#fff' : '#374151', border: '1px solid ' + (roleFilter === r ? '#111827' : '#e5e7eb') }}>
            {{ all: 'Tous', client: 'Clients', barber_owner: 'Gérants', admin: 'Admins', banned: 'Suspendus' }[r]}
          </button>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['Nom', 'Téléphone', 'Wilaya', 'Rôle', 'Salons', 'Inscrit', 'Actions'].map(c => (
                  <th key={c} style={thStyle}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Aucun utilisateur trouvé</td></tr>
              )}
              {filtered.map(p => {
                const rc = ROLE_COLORS[p.role] ?? ROLE_COLORS.client
                const isBanned = p.role === 'banned'
                const isAdmin  = p.role === 'admin'
                return (
                  <tr key={p.id} style={{ borderTop: '1px solid #f3f4f6', opacity: isBanned ? 0.6 : 1 }}>
                    <td style={td}>
                      <div style={{ fontWeight: 600 }}>{p.full_name ?? 'Sans nom'}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{p.id.slice(0, 8)}…</div>
                    </td>
                    <td style={{ ...td, color: '#6b7280' }}>{p.phone ?? '—'}</td>
                    <td style={{ ...td, color: '#6b7280' }}>{p.wilaya ?? '—'}</td>
                    <td style={td}>
                      <span style={{ background: rc.bg, color: rc.color, borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>
                        {ROLE_LABELS[p.role] ?? p.role}
                      </span>
                    </td>
                    <td style={{ ...td, color: '#6b7280' }}>{shopCountByOwner[p.id] ?? 0}</td>
                    <td style={{ ...td, color: '#9ca3af', whiteSpace: 'nowrap' }}>{formatDate(p.created_at)}</td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>
                      {!isAdmin && (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <ActionBtn color={isBanned ? 'gray' : 'amber'} disabled={isPending}
                            onClick={() => handleBan(p)}>
                            {isBanned ? 'Réactiver' : 'Suspendre'}
                          </ActionBtn>
                          <ActionBtn color="red" disabled={isPending}
                            onClick={() => setConfirmDelete(p.id)}>
                            Suppr.
                          </ActionBtn>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {confirmDelete && (
        <Modal title="Supprimer cet utilisateur ?" onClose={() => setConfirmDelete(null)}>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20, lineHeight: 1.6 }}>
            Cette action supprimera définitivement le compte et tous ses salons/données.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, ...btnGhost }}>Annuler</button>
            <button onClick={() => handleDelete(confirmDelete)} disabled={isPending}
              style={{ flex: 1, background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: isPending ? 0.6 : 1 }}>
              {isPending ? 'Suppression…' : 'Supprimer définitivement'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── PAYMENTS TAB ────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function PaymentsTab({ payments, shops, onToast }: { payments: Payment[]; shops: Shop[]; onToast: (m: string, t?: 'ok' | 'err') => void }) {
  const [isPending, start] = useTransition()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [manualModal, setManualModal] = useState<string | null>(null) // shopId
  const [selectedPlan, setSelectedPlan] = useState('pro')

  const shopMap = useMemo(() => {
    const m: Record<string, string> = {}
    shops.forEach(s => { m[s.id] = s.name })
    return m
  }, [shops])

  const filtered = useMemo(() => {
    let list = payments
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(p => shopMap[p.shop_id]?.toLowerCase().includes(q) || p.plan.includes(q))
    }
    if (statusFilter !== 'all') list = list.filter(p => p.status === statusFilter)
    return list
  }, [payments, search, statusFilter, shopMap])

  const totalPaid = payments
    .filter(p => p.status === 'paid' || p.status === 'paid_manual')
    .reduce((s, p) => s + p.amount, 0)

  const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
    paid:         { bg: '#ecfdf5', color: '#065f46' },
    paid_manual:  { bg: '#eff6ff', color: '#1d4ed8' },
    pending:      { bg: '#fff7ed', color: '#92400e' },
    failed:       { bg: '#fef2f2', color: '#dc2626' },
  }
  const STATUS_LABEL: Record<string, string> = {
    paid: 'Payé', paid_manual: 'Manuel', pending: 'En attente', failed: 'Échoué',
  }

  async function handleManual() {
    if (!manualModal) return
    start(async () => {
      const res = await setShopPlanAction(manualModal, selectedPlan)
      if (res.error) { onToast(res.error, 'err'); return }
      setManualModal(null)
      onToast(`Formule manuelle appliquée → ${selectedPlan}`)
    })
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <h1 style={{ ...h1, marginBottom: 0 }}>Paiements & Abonnements</h1>
        <button onClick={() => setManualModal(shops[0]?.id ?? '')} style={btnCopper}>
          + Paiement manuel
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Revenu total', value: `${totalPaid.toLocaleString()} DA` },
          { label: 'Payés', value: payments.filter(p => p.status === 'paid' || p.status === 'paid_manual').length.toString() },
          { label: 'En attente', value: payments.filter(p => p.status === 'pending').length.toString() },
          { label: 'Échoués', value: payments.filter(p => p.status === 'failed').length.toString() },
        ].map(s => (
          <div key={s.label} style={{ ...card, padding: 16 }}>
            <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Chercher un salon…" style={searchInput} />
        {['all', 'paid', 'paid_manual', 'pending', 'failed'].map(f => (
          <button key={f} onClick={() => setStatusFilter(f)}
            style={{ ...filterBtn, background: statusFilter === f ? '#111827' : '#fff', color: statusFilter === f ? '#fff' : '#374151', border: '1px solid ' + (statusFilter === f ? '#111827' : '#e5e7eb') }}>
            {{ all: 'Tous', paid: 'Payé', paid_manual: 'Manuel', pending: 'En attente', failed: 'Échoué' }[f]}
          </button>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['Salon', 'Formule', 'Montant', 'Statut', 'Créé le', 'Payé le', 'Action'].map(c => (
                  <th key={c} style={thStyle}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Aucun paiement trouvé</td></tr>
              )}
              {filtered.map(p => {
                const sc = STATUS_STYLE[p.status] ?? STATUS_STYLE.pending
                return (
                  <tr key={p.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                    <td style={td}>
                      <div style={{ fontWeight: 600 }}>{shopMap[p.shop_id] ?? '—'}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{p.shop_id.slice(0, 8)}…</div>
                    </td>
                    <td style={td}><PlanBadge plan={p.plan} /></td>
                    <td style={{ ...td, fontWeight: 600 }}>{p.amount.toLocaleString()} DA</td>
                    <td style={td}>
                      <span style={{ background: sc.bg, color: sc.color, borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>
                        {STATUS_LABEL[p.status] ?? p.status}
                      </span>
                    </td>
                    <td style={{ ...td, color: '#9ca3af' }}>{formatDate(p.created_at)}</td>
                    <td style={{ ...td, color: '#6b7280' }}>{p.paid_at ? formatDate(p.paid_at) : '—'}</td>
                    <td style={td}>
                      {p.status !== 'paid' && p.status !== 'paid_manual' && (
                        <ActionBtn color="blue" disabled={isPending}
                          onClick={() => { setManualModal(p.shop_id); setSelectedPlan(p.plan) }}>
                          Forcer
                        </ActionBtn>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {manualModal !== null && (
        <Modal title="Appliquer un paiement manuel" onClose={() => setManualModal(null)}>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16, lineHeight: 1.6 }}>
            Utilisez ceci si Chargily n'a pas déclenché le webhook. Cela active le salon pour 30 jours.
          </p>
          {manualModal === '' && (
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Salon</label>
              <select style={selectStyle} onChange={e => setManualModal(e.target.value)} defaultValue="">
                <option value="" disabled>Sélectionner un salon…</option>
                {shops.map(s => <option key={s.id} value={s.id}>{s.name} — {s.wilaya}</option>)}
              </select>
            </div>
          )}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Formule à appliquer</label>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              {(['starter', 'pro', 'elite'] as const).map(p => (
                <button key={p} onClick={() => setSelectedPlan(p)}
                  style={{ flex: 1, padding: '10px', border: `2px solid ${selectedPlan === p ? '#d97706' : '#e5e7eb'}`, borderRadius: 8, background: selectedPlan === p ? '#fff7ed' : '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize' }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleManual} disabled={isPending || !manualModal}
            style={{ width: '100%', ...btnCopper, opacity: (isPending || !manualModal) ? 0.5 : 1 }}>
            {isPending ? 'Application…' : `Appliquer ${selectedPlan} — ${PLAN_PRICES[selectedPlan].toLocaleString()} DA`}
          </button>
        </Modal>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── ANALYTICS TAB ───────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function AnalyticsTab({ shops, profiles, bookings, payments }: { shops: Shop[]; profiles: Profile[]; bookings: Booking[]; payments: Payment[] }) {
  // Registrations per month (last 6 months)
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    return { month: d.toLocaleDateString('fr-FR', { month: 'short' }), year: d.getFullYear(), m: d.getMonth() }
  })

  const registrations = months.map(({ month, m, year }) => ({
    label: month,
    users: profiles.filter(p => { const d = new Date(p.created_at); return d.getMonth() === m && d.getFullYear() === year }).length,
    shops: shops.filter(s => { const d = new Date(s.created_at); return d.getMonth() === m && d.getFullYear() === year }).length,
  }))

  const revenueByMonth = months.map(({ month, m, year }) => ({
    label: month,
    revenue: payments
      .filter(p => (p.status === 'paid' || p.status === 'paid_manual') && p.paid_at)
      .filter(p => { const d = new Date(p.paid_at!); return d.getMonth() === m && d.getFullYear() === year })
      .reduce((s, p) => s + p.amount, 0),
  }))

  const maxRev    = Math.max(...revenueByMonth.map(r => r.revenue), 1)
  const maxUsers  = Math.max(...registrations.map(r => r.users + r.shops), 1)

  // Wilaya breakdown
  const wilayaMap: Record<string, number> = {}
  shops.forEach(s => { wilayaMap[s.wilaya] = (wilayaMap[s.wilaya] ?? 0) + 1 })
  const topWilayas = Object.entries(wilayaMap).sort((a, b) => b[1] - a[1]).slice(0, 8)
  const maxW = Math.max(...topWilayas.map(w => w[1]), 1)

  return (
    <div>
      <h1 style={h1}>Analytiques</h1>

      {/* Revenue chart */}
      <div style={{ ...card, marginBottom: 20 }}>
        <h2 style={h2}>Revenu mensuel (DA)</h2>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 160, marginTop: 16, paddingBottom: 8, borderBottom: '1px solid #f3f4f6' }}>
          {revenueByMonth.map(r => (
            <div key={r.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>{r.revenue > 0 ? `${(r.revenue / 1000).toFixed(0)}k` : ''}</div>
              <div style={{ width: '100%', maxWidth: 40, background: '#d97706', borderRadius: '4px 4px 0 0', height: `${(r.revenue / maxRev) * 120}px`, minHeight: 4, transition: 'height 0.4s' }} />
              <div style={{ fontSize: 12, color: '#9ca3af' }}>{r.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Registrations chart */}
      <div style={{ ...card, marginBottom: 20 }}>
        <h2 style={h2}>Inscriptions mensuelles</h2>
        <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 12, height: 12, background: '#3b82f6', borderRadius: 2, display: 'inline-block' }} />Utilisateurs</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 12, height: 12, background: '#d97706', borderRadius: 2, display: 'inline-block' }} />Salons</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 140, marginTop: 12, paddingBottom: 8, borderBottom: '1px solid #f3f4f6' }}>
          {registrations.map(r => (
            <div key={r.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 2, height: 110 }}>
                <div style={{ width: '45%', background: '#3b82f6', borderRadius: '3px 3px 0 0', height: `${(r.users / maxUsers) * 100}px`, minHeight: r.users ? 4 : 0 }} />
                <div style={{ width: '45%', background: '#d97706', borderRadius: '3px 3px 0 0', height: `${(r.shops / maxUsers) * 100}px`, minHeight: r.shops ? 4 : 0 }} />
              </div>
              <div style={{ fontSize: 12, color: '#9ca3af' }}>{r.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Top wilayas */}
        <div style={card}>
          <h2 style={h2}>Salons par wilaya (top 8)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
            {topWilayas.map(([w, count]) => (
              <div key={w}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span style={{ fontWeight: 500 }}>{w}</span>
                  <span style={{ color: '#6b7280' }}>{count}</span>
                </div>
                <div style={{ height: 6, background: '#f3f4f6', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(count / maxW) * 100}%`, background: '#d97706', borderRadius: 999 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global KPIs */}
        <div style={card}>
          <h2 style={h2}>Indicateurs clés</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
            {[
              { label: 'Taux d\'activation salons', value: `${shops.length ? Math.round(shops.filter(s => s.is_active).length / shops.length * 100) : 0}%` },
              { label: 'Taux de vérification', value: `${shops.length ? Math.round(shops.filter(s => s.is_verified).length / shops.length * 100) : 0}%` },
              { label: 'Revenu moyen/salon/mois', value: `${shops.length ? Math.round(payments.filter(p => p.status === 'paid' || p.status === 'paid_manual').reduce((s, p) => s + p.amount, 0) / Math.max(shops.length, 1)).toLocaleString() : 0} DA` },
              { label: 'Réservations totales', value: bookings.length.toString() },
              { label: 'Salons Elite', value: shops.filter(s => s.plan === 'elite').length.toString() },
              { label: 'Comptes suspendus', value: profiles.filter(p => p.role === 'banned').length.toString() },
            ].map(k => (
              <div key={k.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ fontSize: 13, color: '#6b7280' }}>{k.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{k.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── Shared UI atoms ──────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function PlanBadge({ plan }: { plan: string }) {
  const pc = PLAN_COLOR[plan] ?? PLAN_COLOR.starter
  return (
    <span style={{ background: pc.bg, color: pc.color, border: `1px solid ${pc.border}`, borderRadius: 999, padding: '2px 10px', fontSize: 11, fontWeight: 700, textTransform: 'capitalize' }}>
      {plan}
    </span>
  )
}

function StatusPill({ active, label, color }: { active: boolean; label: string; color?: string }) {
  const bg = color === 'blue' ? '#eff6ff' : color === 'amber' ? '#fff7ed' : active ? '#ecfdf5' : '#fef2f2'
  const cl = color === 'blue' ? '#1d4ed8' : color === 'amber' ? '#92400e' : active ? '#065f46' : '#dc2626'
  return <span style={{ background: bg, color: cl, borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 600, display: 'inline-block' }}>{label}</span>
}

function ActionBtn({ children, onClick, color, disabled }: { children: React.ReactNode; onClick: () => void; color: 'green' | 'red' | 'amber' | 'blue' | 'gray'; disabled?: boolean }) {
  const styles: Record<string, { bg: string; hov: string; text: string }> = {
    green: { bg: '#ecfdf5', hov: '#d1fae5', text: '#065f46' },
    red:   { bg: '#fef2f2', hov: '#fee2e2', text: '#dc2626' },
    amber: { bg: '#fff7ed', hov: '#ffedd5', text: '#92400e' },
    blue:  { bg: '#eff6ff', hov: '#dbeafe', text: '#1d4ed8' },
    gray:  { bg: '#f9fafb', hov: '#f3f4f6', text: '#374151' },
  }
  const s = styles[color]
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ background: s.bg, color: s.text, border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: disabled ? 0.5 : 1, whiteSpace: 'nowrap' }}>
      {children}
    </button>
  )
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>{title}</h3>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', fontSize: 16, display: 'grid', placeItems: 'center' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── Style constants ──────────────────────────────────────────────────────────
const h1: React.CSSProperties = { fontSize: 22, fontWeight: 700, color: '#111827', letterSpacing: '-0.01em', marginBottom: 20 }
const h2: React.CSSProperties = { fontSize: 15, fontWeight: 700, color: '#111827' }
const card: React.CSSProperties = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }
const td:   React.CSSProperties = { padding: '10px 14px', verticalAlign: 'middle' }
const thStyle: React.CSSProperties = { padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af', whiteSpace: 'nowrap' }
const searchInput: React.CSSProperties = { border: '1px solid #e5e7eb', borderRadius: 8, padding: '7px 14px', fontSize: 13, outline: 'none', background: '#fff', fontFamily: 'inherit', minWidth: 200 }
const filterBtn: React.CSSProperties = { borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }
const btnCopper: React.CSSProperties = { background: '#d97706', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }
const btnGhost: React.CSSProperties = { background: '#fff', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6b7280', marginBottom: 4 }
const selectStyle: React.CSSProperties = { width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '9px 12px', fontSize: 13, fontFamily: 'inherit', background: '#fff' }
