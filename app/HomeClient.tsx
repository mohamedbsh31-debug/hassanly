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
  { label: 'Fade', icon: '✂️' },
  { label: 'Barbe', icon: '🧔' },
  { label: 'Enfant', icon: '👶' },
  { label: 'Luxe', icon: '👑' },
  { label: 'Rasage', icon: '🪒' },
  { label: 'Classique', icon: '💈' },
  { label: 'Moderne', icon: '✨' },
  { label: 'Express', icon: '⚡' },
]

const ALL_WILAYAS = ['Toutes les wilayas', 'Alger', 'Oran', 'Constantine', 'Annaba', 'Tlemcen', 'Sétif', 'Blida', 'Béjaïa', 'Batna']

type ShopDisplay = { id: string; name: string; emoji?: string; rating: number | null; reviews?: number; wilaya: string; quartier?: string; description: string | null; tags?: string[]; min_price?: number; badge?: string; plan: string; image?: string }
type Props = { shops: Shop[]; user: { user: any; profile: Profile | null } | null }

function Logo() {
  return (
    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--foreground)' }}>
      <svg width="26" height="20" viewBox="0 0 28 22" fill="none">
        <path d="M2 14c4-8 8-8 12 0s8 8 12 0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <span>hass<span style={{ color: '#d97706' }}>anly</span></span>
    </Link>
  )
}

function ShopCard({ shop }: { shop: ShopDisplay }) {
  return (
    <Link href={`/shops/${shop.id}`} style={{ display: 'block', textDecoration: 'none' }}>
      <div className="shop-card" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--card)', transition: 'transform 0.2s, box-shadow 0.2s' }}>
        {/* Media */}
        <div style={{ position: 'relative', aspectRatio: '4/5', overflow: 'hidden', background: '#f3f4f6' }}>
          {shop.image ? (
            <img src={shop.image} alt={shop.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} className="card-media" />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', background: '#f9fafb' }}>{shop.emoji ?? '✂️'}</div>
          )}
          {/* Rating badge */}
          <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', borderRadius: 999, padding: '4px 10px' }}>
            <span style={{ fontSize: 11, color: '#fbbf24' }}>★</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{shop.rating?.toFixed(1) ?? '—'}</span>
            {shop.reviews && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>· {shop.reviews}</span>}
          </div>
          {/* Promo badge */}
          {shop.badge && (
            <div style={{ position: 'absolute', top: 10, left: 10, background: '#d97706', color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 999 }}>
              {shop.badge}
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: '12px 4px 4px' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--foreground)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{shop.name}</h3>
          <p style={{ fontSize: 13, color: 'var(--muted-foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {shop.wilaya}{shop.quartier ? ` · ${shop.quartier}` : ''}
          </p>
          {shop.min_price && (
            <p style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 4 }}>
              À partir de <strong style={{ color: 'var(--foreground)' }}>{shop.min_price.toLocaleString()} DA</strong>
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}

function Section({ title, shops }: { title: string; shops: ShopDisplay[] }) {
  return (
    <section style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, letterSpacing: '-0.01em' }}>{title}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
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
    ? shops.map(s => ({ id: s.id, name: s.name, rating: s.rating, wilaya: s.wilaya, description: s.description, plan: s.plan }))
    : DEMO_SHOPS

  const recommended = displayShops.slice(0, 4)
  const trending = displayShops.slice(0, 4).reverse()

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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', height: 64, display: 'flex', alignItems: 'center', padding: '0 24px', justifyContent: 'space-between' }}>
        <Logo />

        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link href="/" style={{ fontSize: 14, fontWeight: 500, color: 'var(--foreground)' }}>Accueil</Link>
          <Link href="/pricing" style={{ fontSize: 14, color: 'var(--muted-foreground)' }}>Pour les coiffeurs</Link>
          {user ? (
            <>
              {user.profile?.role === 'barber_owner' && (
                <Link href="/dashboard" style={{ fontSize: 14, color: 'var(--muted-foreground)' }}>Dashboard</Link>
              )}
              <span style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>{user.profile?.full_name?.split(' ')[0]}</span>
              <form action={logoutAction}>
                <button style={{ padding: '8px 16px', border: '1px solid var(--border)', borderRadius: 999, fontSize: 13, fontWeight: 500, background: 'transparent', color: 'var(--foreground)' }}>
                  Déconnexion
                </button>
              </form>
            </>
          ) : (
            <>
              <button style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500, color: 'var(--foreground)', background: 'none', border: 'none', padding: 0 }}>
                <span style={{ display: 'grid', placeItems: 'center', width: 36, height: 36, borderRadius: 999, background: '#f3f4f6' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" /><path d="M4 21c0-4 4-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" /></svg>
                </span>
                <Link href="/auth/login" style={{ color: 'inherit' }}>Connexion</Link>
              </button>
              <Link href="/auth/register" style={{ borderRadius: 999, background: 'var(--foreground)', color: '#fff', padding: '10px 20px', fontSize: 14, fontWeight: 600, display: 'inline-block' }}>
                S'inscrire
              </Link>
            </>
          )}
          <Link href="/auth/register?role=barber_owner" style={{ borderRadius: 999, background: '#fff', border: '1px solid var(--border)', color: 'var(--foreground)', padding: '10px 20px', fontSize: 14, fontWeight: 600, display: 'inline-block' }}>
            Inscrire mon salon
          </Link>
        </div>

        <button onClick={() => setMenuOpen(!menuOpen)} className="mobile-menu-btn" style={{ display: 'none', background: 'none', border: 'none', fontSize: 22, color: 'var(--foreground)' }}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {menuOpen && (
        <div style={{ background: '#fff', borderBottom: '1px solid var(--border)', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Link href="/" style={{ fontSize: 15 }} onClick={() => setMenuOpen(false)}>Accueil</Link>
          <Link href="/pricing" style={{ fontSize: 15, color: 'var(--muted-foreground)' }} onClick={() => setMenuOpen(false)}>Pour les coiffeurs</Link>
          {user ? (
            <>
              {user.profile?.role === 'barber_owner' && <Link href="/dashboard" style={{ fontSize: 15 }} onClick={() => setMenuOpen(false)}>Dashboard</Link>}
              <form action={logoutAction}><button style={{ background: 'none', border: 'none', color: '#d97706', fontSize: 15, padding: 0, textAlign: 'left', fontFamily: 'inherit' }}>Déconnexion</button></form>
            </>
          ) : (
            <>
              <Link href="/auth/login" style={{ fontSize: 15 }} onClick={() => setMenuOpen(false)}>Connexion</Link>
              <Link href="/auth/register" style={{ fontSize: 15, color: '#d97706', fontWeight: 600 }} onClick={() => setMenuOpen(false)}>S'inscrire</Link>
            </>
          )}
        </div>
      )}

      {/* HERO */}
      <header style={{ position: 'relative', height: 560, width: '100%', overflow: 'hidden' }}>
        {/* Both videos stacked — CSS animation crossfades between them */}
        <video src="/videos/output.mp4" autoPlay muted loop playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} className="hero-vid-1" />
        <video src="/videos/output-2.mp4" autoPlay muted loop playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} className="hero-vid-2" />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1 }} />

        {/* Hero content */}
        <div style={{ position: 'relative', zIndex: 10, maxWidth: 640, margin: '0 auto', textAlign: 'center', paddingTop: 100, paddingLeft: 24, paddingRight: 24, isolation: 'isolate' }}>
          <h1 style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.05 }}>
            Soyez brave
          </h1>
          <p style={{ marginTop: 16, fontSize: 18, color: 'rgba(255,255,255,0.88)', lineHeight: 1.6 }}>
            Découvrez et réservez les meilleurs barbiers et coiffeurs près de chez vous
          </p>

          {/* Search bar */}
          <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 999, padding: '8px 8px 8px 20px', boxShadow: '0 8px 40px rgba(0,0,0,0.3)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="7" stroke="#9ca3af" strokeWidth="2" />
              <path d="m20 20-3-3" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Salon, service, quartier…"
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, color: 'var(--foreground)', background: 'transparent', padding: '6px 0' }}
            />
            <button style={{ flexShrink: 0, background: 'var(--foreground)', color: '#fff', border: 'none', borderRadius: 999, padding: '12px 24px', fontSize: 15, fontWeight: 600 }}>
              Chercher
            </button>
          </div>
        </div>

        {/* Category strip */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10 }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 4, overflowX: 'auto', padding: '0 24px 24px', justifyContent: 'center' }}>
            {CATEGORIES.map(c => (
              <button
                key={c.label}
                onClick={() => setActiveCategory(activeCategory === c.label ? '' : c.label)}
                style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 999, background: activeCategory === c.label ? 'rgba(255,255,255,0.25)' : 'transparent', border: 'none', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', backdropFilter: 'blur(4px)', transition: 'background 0.15s' }}
              >
                <span style={{ fontSize: 20 }}>{c.icon}</span>
                <span>{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Wilaya filter bar */}
      <div style={{ borderBottom: '1px solid var(--border)', background: '#fff', padding: '12px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12, overflowX: 'auto' }}>
          <span style={{ fontSize: 13, color: 'var(--muted-foreground)', flexShrink: 0 }}>Wilaya :</span>
          {ALL_WILAYAS.map(w => {
            const val = w === 'Toutes les wilayas' ? '' : w
            return (
              <button key={w} onClick={() => setWilaya(val)} style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 999, border: `1px solid ${wilaya === val ? 'var(--foreground)' : 'var(--border)'}`, background: wilaya === val ? 'var(--foreground)' : 'transparent', color: wilaya === val ? '#fff' : 'var(--foreground)', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s' }}>
                {w}
              </button>
            )
          })}
        </div>
      </div>

      {/* Filtered results or sections */}
      {filtered ? (
        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</h2>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px', color: 'var(--muted-foreground)' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
              <p>Aucun salon trouvé pour cette recherche.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
              {filtered.map(s => <ShopCard key={s.id} shop={s} />)}
            </div>
          )}
        </section>
      ) : (
        <>
          <Section title="Recommandés" shops={recommended} />
          <Section title="Tendances près de vous" shops={trending} />
        </>
      )}

      {/* CTA band */}
      <section style={{ background: 'var(--foreground)', color: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, padding: '80px 24px', alignItems: 'center' }} className="cta-grid">
          <div>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 700, letterSpacing: '-0.01em' }}>
              Vous êtes propriétaire d'un salon ?
            </h2>
            <p style={{ marginTop: 16, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, maxWidth: 420 }}>
              Rejoignez des milliers de professionnels qui utilisent hassanly pour remplir leur agenda, être payés plus vite et développer leur marque.
            </p>
            <Link href="/auth/register?role=barber_owner" style={{ display: 'inline-block', marginTop: 32, background: '#fff', color: 'var(--foreground)', padding: '12px 28px', borderRadius: 999, fontSize: 14, fontWeight: 600 }}>
              Inscrire mon salon
            </Link>
          </div>
          <div style={{ borderRadius: 16, overflow: 'hidden', aspectRatio: '16/9' }}>
            <img src="https://images.unsplash.com/photo-1621607512214-68297480165e?w=800&q=80" alt="Salon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', background: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '40px 24px', fontSize: 13, color: 'var(--muted-foreground)' }}>
          <Logo />
          <p>© {new Date().getFullYear()} hassanly. Tous droits réservés.</p>
        </div>
      </footer>

      <style>{`
        .shop-card:hover .card-media { transform: scale(1.05); }
        .shop-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.12); transform: translateY(-2px); }
        /* Hero crossfade: vid-1 fades out while vid-2 fades in, then swaps back */
        .hero-vid-1 { animation: crossfade1 16s ease-in-out infinite; }
        .hero-vid-2 { animation: crossfade2 16s ease-in-out infinite; }
        @keyframes crossfade1 {
          0%, 40%  { opacity: 1; }
          50%, 90% { opacity: 0; }
          100%     { opacity: 1; }
        }
        @keyframes crossfade2 {
          0%, 40%  { opacity: 0; }
          50%, 90% { opacity: 1; }
          100%     { opacity: 0; }
        }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
          .cta-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
