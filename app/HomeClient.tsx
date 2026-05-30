'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { logoutAction } from '@/lib/auth-actions'
import type { Shop, Profile } from '@/types/database'

const DEMO_SHOPS = [
  { id: 'demo-1', name: 'Elite Cuts Studio', emoji: '✂️', rating: 4.9, reviews: 387, wilaya: 'Oran', quartier: 'Bir El Djir', description: 'Spécialistes du Skin Fade et dégradé américain.', tags: ['Fade', 'Barbe', 'Luxe'], min_price: 600, badge: 'Top Salon', plan: 'elite', image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80' },
  { id: 'demo-2', name: 'Le Gentleman Algérois', emoji: '🎩', rating: 4.8, reviews: 184, wilaya: 'Alger', quartier: 'Hydra', description: 'Barbier classique avec une touche contemporaine.', tags: ['Classique', 'Luxe', 'Rasage'], min_price: 800, badge: 'Luxe', plan: 'pro', image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80' },
  { id: 'demo-3', name: 'Salon Bab El Oued', emoji: '💈', rating: 4.7, reviews: 312, wilaya: 'Alger', quartier: 'Bab El Oued', description: 'Le salon du quartier depuis 15 ans.', tags: ['Fade', 'Classique', 'Enfant'], min_price: 400, badge: '', plan: 'starter', image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80' },
  { id: 'demo-4', name: 'Constantine Modern Barber', emoji: '🏛️', rating: 4.6, reviews: 98, wilaya: 'Constantine', quartier: 'Sidi Mabrouk', description: 'Coupes modernes dans la ville du Vieux Rocher.', tags: ['Fade', 'Barbe', 'Moderne'], min_price: 500, badge: '', plan: 'starter', image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&q=80' },
  { id: 'demo-5', name: 'Royal Grooming Tlemcen', emoji: '👑', rating: 4.9, reviews: 267, wilaya: 'Tlemcen', quartier: 'Centre', description: "L'expérience haut de gamme dans la perle du Maghreb.", tags: ['Luxe', 'VIP', 'Rasage'], min_price: 1200, badge: 'Premium', plan: 'elite', image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&q=80' },
  { id: 'demo-6', name: 'Coiffure Annaba Express', emoji: '⚡', rating: 4.5, reviews: 143, wilaya: 'Annaba', quartier: 'Sidi Amar', description: 'Rapide, propre, abordable.', tags: ['Express', 'Enfant', 'Fade'], min_price: 300, badge: '', plan: 'starter', image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80' },
  { id: 'demo-7', name: 'Krispi King Sétif', emoji: '💈', rating: 5.0, reviews: 250, wilaya: 'Sétif', quartier: 'Centre', description: 'Cuts haut de gamme, ambiance premium.', tags: ['Fade', 'Luxe'], min_price: 700, badge: '', plan: 'pro', image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80' },
  { id: 'demo-8', name: 'Studio Blida', emoji: '✨', rating: 4.8, reviews: 176, wilaya: 'Blida', quartier: 'Centre', description: 'Le meilleur salon de Blida.', tags: ['Moderne', 'Barbe'], min_price: 450, badge: '', plan: 'starter', image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80' },
]

const CATEGORIES = [
  { label: 'Fade', icon: '✂️' }, { label: 'Barbe', icon: '🧔' }, { label: 'Enfant', icon: '👦' },
  { label: 'Luxe', icon: '👑' }, { label: 'Rasage', icon: '🪒' }, { label: 'Classique', icon: '💈' },
  { label: 'Moderne', icon: '✨' }, { label: 'Express', icon: '⚡' },
]

const ALL_WILAYAS = ['Toutes', 'Alger', 'Oran', 'Constantine', 'Annaba', 'Tlemcen', 'Sétif', 'Blida', 'Béjaïa', 'Batna']

type ShopDisplay = { id: string; name: string; emoji?: string; rating: number | null; reviews?: number; wilaya: string; quartier?: string; description: string | null; tags?: string[]; min_price?: number; badge?: string; plan: string; image?: string; image_url?: string | null }
type Props = { shops: Shop[]; user: { user: any; profile: Profile | null } | null }

function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none' }}>
      <svg width="24" height="18" viewBox="0 0 28 22" fill="none">
        <path d="M2 14c4-8 8-8 12 0s8 8 12 0" stroke={light ? '#F5EFE0' : '#2A2418'} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: light ? '#F5EFE0' : '#2A2418' }}>
        hass<span style={{ color: '#C4793A' }}>anly</span>
      </span>
    </Link>
  )
}

function ShopCard({ shop }: { shop: ShopDisplay }) {
  return (
    <Link href={`/shops/${shop.id}`} style={{ display: 'block', textDecoration: 'none' }}>
      <div className="shop-card" style={{
        borderRadius: 12,
        overflow: 'hidden',
        background: '#FEFCF7',
        border: '1px solid #D9CEAF',
        transition: 'transform 0.22s cubic-bezier(.22,.68,0,1.2), box-shadow 0.22s',
        cursor: 'pointer',
      }}>
        {/* Image */}
        <div style={{ position: 'relative', aspectRatio: '3/2', overflow: 'hidden', background: '#EDE4CC' }}>
          {shop.image_url ? (
            <img src={shop.image_url} alt={shop.name} loading="lazy" className="card-img"
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s cubic-bezier(.22,.68,0,1.2)' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.8rem', background: '#EDE4CC' }}>
              {shop.emoji ?? '✂️'}
            </div>
          )}
          {/* Warm gradient overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(42,36,24,0.55) 0%, transparent 55%)' }} />

          {/* Rating */}
          <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(42,36,24,0.72)', backdropFilter: 'blur(8px)', borderRadius: 999, padding: '4px 10px' }}>
            <span style={{ fontSize: 10, color: '#C9922A' }}>★</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#F5EFE0' }}>{shop.rating?.toFixed(1) ?? '—'}</span>
            {shop.reviews && <span style={{ fontSize: 10, color: 'rgba(245,239,224,0.65)' }}>· {shop.reviews}</span>}
          </div>

          {/* Badge */}
          {shop.badge && (
            <div style={{ position: 'absolute', top: 10, left: 10, background: '#C4793A', color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '3px 9px', borderRadius: 999 }}>
              {shop.badge}
            </div>
          )}

          {/* Name overlay */}
          <div style={{ position: 'absolute', bottom: 10, left: 12, right: 12 }}>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 16, fontWeight: 700, color: '#F5EFE0', letterSpacing: '-0.01em', lineHeight: 1.2, textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
              {shop.name}
            </div>
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: '10px 12px 12px' }}>
          <div style={{ fontSize: 12, color: '#9A9E8A', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 10 }}>📍</span>
            {shop.wilaya}{shop.quartier ? ` · ${shop.quartier}` : ''}
          </div>
          {shop.tags && shop.tags.length > 0 && (
            <div style={{ marginTop: 7, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {shop.tags.slice(0, 3).map(t => (
                <span key={t} style={{ fontSize: 10, fontWeight: 600, background: '#F5EFE0', color: '#6B7160', border: '1px solid #D9CEAF', borderRadius: 999, padding: '2px 8px' }}>{t}</span>
              ))}
            </div>
          )}
          {shop.min_price && (
            <div style={{ marginTop: 8, fontSize: 12, color: '#9A9E8A' }}>
              Dès <strong style={{ color: '#C4793A', fontWeight: 700 }}>{shop.min_price.toLocaleString()} DA</strong>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

function Section({ title, subtitle, shops }: { title: string; subtitle?: string; shops: ShopDisplay[] }) {
  return (
    <section style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px 16px' }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 26, fontWeight: 700, color: '#2A2418', letterSpacing: '-0.02em' }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 13, color: '#9A9E8A', marginTop: 4 }}>{subtitle}</p>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 18 }}>
        {shops.map(s => <ShopCard key={s.id} shop={s} />)}
      </div>
    </section>
  )
}

export default function HomeClient({ shops, user }: Props) {
  const [search, setSearch] = useState('')
  const [wilaya, setWilaya] = useState('')
  const [activeCategory, setActiveCategory] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const displayShops: ShopDisplay[] = shops.length > 0
    ? shops.map(s => ({ id: s.id, name: s.name, rating: s.rating, wilaya: s.wilaya, description: s.description, plan: s.plan, image_url: s.image_url ?? null }))
    : DEMO_SHOPS

  const recommended = displayShops.slice(0, 4)
  const trending    = [...displayShops].slice(0, 4).reverse()

  const filtered = useMemo(() => {
    if (!search && !wilaya && !activeCategory) return null
    let list = [...displayShops]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(s => s.name.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q) || s.wilaya.toLowerCase().includes(q) || s.tags?.some(t => t.toLowerCase().includes(q)))
    }
    if (wilaya) list = list.filter(s => s.wilaya === wilaya)
    if (activeCategory) list = list.filter(s => s.tags?.includes(activeCategory))
    return list
  }, [displayShops, search, wilaya, activeCategory])

  const navLinkStyle = { fontSize: 14, fontWeight: 500, color: '#4A5240', transition: 'color 0.15s' }

  return (
    <div style={{ minHeight: '100vh', background: '#F5EFE0', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── NAV ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(254,252,247,0.94)', backdropFilter: 'blur(14px)', borderBottom: '1px solid #D9CEAF', height: 62, display: 'flex', alignItems: 'center', padding: '0 28px', justifyContent: 'space-between' }}>
        <Logo />
        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <Link href="/" style={navLinkStyle}>Accueil</Link>
          <Link href="/pricing" style={{ ...navLinkStyle, color: '#9A9E8A' }}>Pour les coiffeurs</Link>
          {user ? (
            <>
              {user.profile?.role === 'barber_owner' && (
                <Link href="/dashboard" style={{ ...navLinkStyle, color: '#9A9E8A' }}>Dashboard</Link>
              )}
              {user.profile?.role === 'admin' && (
                <Link href="/admin" style={{ ...navLinkStyle, color: '#8B3A2A', fontWeight: 700 }}>Admin</Link>
              )}
              <span style={{ fontSize: 13, color: '#9A9E8A' }}>{user.profile?.full_name?.split(' ')[0]}</span>
              <form action={logoutAction}>
                <button style={{ padding: '7px 16px', border: '1px solid #D9CEAF', borderRadius: 999, fontSize: 13, fontWeight: 500, background: 'transparent', color: '#4A5240', cursor: 'pointer', fontFamily: 'inherit' }}>Déconnexion</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/auth/login" style={navLinkStyle}>Connexion</Link>
              <Link href="/auth/register" style={{ borderRadius: 999, background: '#2A2418', color: '#F5EFE0', padding: '9px 20px', fontSize: 13, fontWeight: 600, display: 'inline-block', letterSpacing: '0.01em' }}>S'inscrire</Link>
            </>
          )}
          <Link href="/auth/register?role=barber_owner" style={{ borderRadius: 999, background: '#C4793A', color: '#fff', padding: '9px 20px', fontSize: 13, fontWeight: 600, display: 'inline-block', letterSpacing: '0.01em' }}>
            Inscrire mon salon
          </Link>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} className="mobile-menu-btn" style={{ display: 'none', background: 'none', border: 'none', fontSize: 22, color: '#2A2418', cursor: 'pointer' }}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {menuOpen && (
        <div style={{ background: '#FEFCF7', borderBottom: '1px solid #D9CEAF', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Link href="/" style={{ fontSize: 15, color: '#2A2418' }} onClick={() => setMenuOpen(false)}>Accueil</Link>
          <Link href="/pricing" style={{ fontSize: 15, color: '#9A9E8A' }} onClick={() => setMenuOpen(false)}>Pour les coiffeurs</Link>
          {user ? (
            <>
              {user.profile?.role === 'barber_owner' && <Link href="/dashboard" style={{ fontSize: 15, color: '#2A2418' }} onClick={() => setMenuOpen(false)}>Dashboard</Link>}
              <form action={logoutAction}><button style={{ background: 'none', border: 'none', color: '#C4793A', fontSize: 15, padding: 0, textAlign: 'left', fontFamily: 'inherit', cursor: 'pointer' }}>Déconnexion</button></form>
            </>
          ) : (
            <>
              <Link href="/auth/login" style={{ fontSize: 15, color: '#2A2418' }} onClick={() => setMenuOpen(false)}>Connexion</Link>
              <Link href="/auth/register" style={{ fontSize: 15, color: '#C4793A', fontWeight: 600 }} onClick={() => setMenuOpen(false)}>S'inscrire</Link>
            </>
          )}
        </div>
      )}

      {/* ── HERO ── */}
      <header style={{ position: 'relative', height: 580, width: '100%', overflow: 'hidden' }}>
        <video src="/videos/output.mp4" autoPlay muted loop playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} className="hero-vid-1" />
        <video src="/videos/output-2.mp4" autoPlay muted loop playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} className="hero-vid-2" />
        {/* Warm gradient overlays */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(42,36,24,0.52) 0%, rgba(42,36,24,0.3) 50%, rgba(42,36,24,0.7) 100%)', zIndex: 1 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(196,121,58,0.15) 0%, transparent 70%)', zIndex: 2 }} />

        {/* Zellige corner ornament */}
        <div style={{ position: 'absolute', top: 24, right: 28, zIndex: 3, opacity: 0.4 }}>
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
            <rect x="20" y="5" width="20" height="20" transform="rotate(45 30 15)" stroke="#F5EFE0" strokeWidth="1"/>
            <rect x="20" y="35" width="20" height="20" transform="rotate(45 30 45)" stroke="#F5EFE0" strokeWidth="1"/>
            <rect x="5" y="20" width="20" height="20" transform="rotate(45 15 30)" stroke="#F5EFE0" strokeWidth="1"/>
            <rect x="35" y="20" width="20" height="20" transform="rotate(45 45 30)" stroke="#F5EFE0" strokeWidth="1"/>
          </svg>
        </div>

        {/* Hero content */}
        <div style={{ position: 'relative', zIndex: 10, maxWidth: 680, margin: '0 auto', textAlign: 'center', paddingTop: 108, paddingLeft: 24, paddingRight: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9922A', marginBottom: 14, fontFamily: "'Tajawal', sans-serif" }}>
            الجزائر · Réservez partout en Algérie
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(2.6rem, 6vw, 4.4rem)', fontWeight: 800, color: '#F5EFE0', letterSpacing: '-0.02em', lineHeight: 1.07 }}>
            Soyez brave,<br />soyez élégant
          </h1>
          <p style={{ marginTop: 18, fontSize: 17, color: 'rgba(245,239,224,0.82)', lineHeight: 1.65, maxWidth: 480, margin: '18px auto 0' }}>
            Découvrez et réservez les meilleurs barbiers près de chez vous
          </p>

          {/* Search bar */}
          <div style={{ marginTop: 34, display: 'flex', alignItems: 'center', gap: 0, background: '#FEFCF7', borderRadius: 12, padding: '6px 6px 6px 18px', boxShadow: '0 12px 48px rgba(42,36,24,0.35)', border: '1px solid rgba(217,206,175,0.6)' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, opacity: 0.5 }}>
              <circle cx="11" cy="11" r="7" stroke="#4A5240" strokeWidth="2" />
              <path d="m20 20-3-3" stroke="#4A5240" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Salon, service, wilaya…"
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, color: '#2A2418', background: 'transparent', padding: '8px 12px', fontFamily: 'inherit' }}
            />
            <button style={{ flexShrink: 0, background: '#C4793A', color: '#fff', border: 'none', borderRadius: 8, padding: '11px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#9E5C24')}
              onMouseLeave={e => (e.currentTarget.style.background = '#C4793A')}>
              Chercher
            </button>
          </div>
        </div>

        {/* Category strip */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10, background: 'linear-gradient(to top, rgba(42,36,24,0.6) 0%, transparent 100%)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 4, overflowX: 'auto', padding: '0 24px 20px', justifyContent: 'center' }}>
            {CATEGORIES.map(c => (
              <button key={c.label} onClick={() => setActiveCategory(activeCategory === c.label ? '' : c.label)}
                style={{
                  flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                  padding: '8px 14px', borderRadius: 10, cursor: 'pointer',
                  background: activeCategory === c.label ? 'rgba(196,121,58,0.55)' : 'rgba(254,252,247,0.1)',
                  border: activeCategory === c.label ? '1px solid rgba(196,121,58,0.8)' : '1px solid rgba(245,239,224,0.2)',
                  color: '#F5EFE0', fontSize: 12, fontWeight: 500, fontFamily: 'inherit',
                  backdropFilter: 'blur(4px)', transition: 'all 0.15s',
                }}>
                <span style={{ fontSize: 18 }}>{c.icon}</span>
                <span>{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── WILAYA FILTER ── */}
      <div style={{ borderBottom: '1px solid #D9CEAF', background: '#FEFCF7', padding: '10px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto' }}>
          <span style={{ fontSize: 12, color: '#9A9E8A', flexShrink: 0, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Wilaya</span>
          <div style={{ width: 1, height: 16, background: '#D9CEAF', flexShrink: 0 }} />
          {ALL_WILAYAS.map(w => {
            const val = w === 'Toutes' ? '' : w
            const active = wilaya === val
            return (
              <button key={w} onClick={() => setWilaya(val)} style={{
                flexShrink: 0, padding: '5px 14px', borderRadius: 999, cursor: 'pointer',
                border: `1px solid ${active ? '#C4793A' : '#D9CEAF'}`,
                background: active ? '#C4793A' : 'transparent',
                color: active ? '#fff' : '#4A5240',
                fontSize: 13, fontWeight: active ? 600 : 400, fontFamily: 'inherit', transition: 'all 0.15s',
              }}>{w}</button>
            )
          })}
        </div>
      </div>

      {/* ── SHOPS ── */}
      {filtered ? (
        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 24, fontWeight: 700, color: '#2A2418' }}>
              {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
            </h2>
          </div>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 24px', color: '#9A9E8A' }}>
              <div style={{ fontSize: 42, marginBottom: 16 }}>🔍</div>
              <p style={{ fontSize: 15 }}>Aucun salon trouvé. Essayez une autre recherche.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 18 }}>
              {filtered.map(s => <ShopCard key={s.id} shop={s} />)}
            </div>
          )}
        </section>
      ) : (
        <>
          <Section title="Recommandés pour vous" subtitle="Les salons les mieux notés près de chez vous" shops={recommended} />

          {/* ── Decorative divider ── */}
          <div style={{ maxWidth: 1200, margin: '8px auto', padding: '0 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, #D9CEAF)' }} />
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ opacity: 0.4 }}>
                <rect x="7" y="1" width="6" height="6" transform="rotate(45 10 4)" fill="#C4793A"/>
                <rect x="7" y="13" width="6" height="6" transform="rotate(45 10 16)" fill="#C4793A"/>
              </svg>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, #D9CEAF)' }} />
            </div>
          </div>

          <Section title="Tendances du moment" subtitle="Les salons les plus réservés cette semaine" shops={trending} />
        </>
      )}

      {/* ── CTA BAND ── */}
      <section style={{ background: '#2A2418', color: '#F5EFE0', position: 'relative', overflow: 'hidden', marginTop: 40 }}>
        {/* Zellige background pattern */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: "repeating-linear-gradient(45deg, #C4793A 0px, #C4793A 1px, transparent 1px, transparent 14px), repeating-linear-gradient(-45deg, #C4793A 0px, #C4793A 1px, transparent 1px, transparent 14px)" }} />
        <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, padding: '80px 24px', alignItems: 'center' }} className="cta-grid">
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9922A', marginBottom: 16, fontFamily: "'Tajawal', sans-serif" }}>
              Professionnels de la coiffure
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Développez votre salon avec hassanly
            </h2>
            <p style={{ marginTop: 16, color: 'rgba(245,239,224,0.65)', lineHeight: 1.75, maxWidth: 420, fontSize: 15 }}>
              Rejoignez des milliers de professionnels qui remplissent leur agenda, sont payés plus vite et développent leur réputation.
            </p>
            <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/auth/register?role=barber_owner" style={{ display: 'inline-block', background: '#C4793A', color: '#fff', padding: '12px 28px', borderRadius: 999, fontSize: 14, fontWeight: 600, letterSpacing: '0.01em' }}>
                Inscrire mon salon →
              </Link>
              <Link href="/pricing" style={{ display: 'inline-block', background: 'transparent', color: 'rgba(245,239,224,0.8)', padding: '12px 24px', borderRadius: 999, fontSize: 14, fontWeight: 500, border: '1px solid rgba(245,239,224,0.2)' }}>
                Voir les tarifs
              </Link>
            </div>
          </div>
          <div style={{ borderRadius: 14, overflow: 'hidden', aspectRatio: '16/9', boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}>
            <img src="https://images.unsplash.com/photo-1621607512214-68297480165e?w=800&q=80" alt="Salon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid #D9CEAF', background: '#FEFCF7' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '32px 24px', fontSize: 13, color: '#9A9E8A' }}>
          <Logo />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Tajawal', sans-serif" }}>
            <span>الجزائر</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>© {new Date().getFullYear()} hassanly</span>
          </div>
        </div>
      </footer>

      <style>{`
        .shop-card:hover { box-shadow: 0 12px 40px rgba(42,36,24,0.14); transform: translateY(-3px); }
        .shop-card:hover .card-img { transform: scale(1.06); }
        .hero-vid-1 { animation: crossfade1 16s ease-in-out infinite; }
        .hero-vid-2 { animation: crossfade2 16s ease-in-out infinite; }
        @keyframes crossfade1 { 0%,40%{opacity:1} 50%,90%{opacity:0} 100%{opacity:1} }
        @keyframes crossfade2 { 0%,40%{opacity:0} 50%,90%{opacity:1} 100%{opacity:0} }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
          .cta-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
