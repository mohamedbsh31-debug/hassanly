'use client'

import { useState, useTransition } from 'react'
import { createShopAction } from '@/lib/shop-actions'

const WILAYAS = [
  'Adrar','Chlef','Laghouat','Oum El Bouaghi','Batna','Béjaïa','Biskra','Béchar','Blida','Bouira',
  'Tamanrasset','Tébessa','Tlemcen','Tiaret','Tizi Ouzou','Alger','Djelfa','Jijel','Sétif','Saïda',
  'Skikda','Sidi Bel Abbès','Annaba','Guelma','Constantine','Médéa','Mostaganem',"M'Sila",'Mascara',
  'Ouargla','Oran','El Bayadh','Illizi','Bordj Bou Arréridj','Boumerdès','El Tarf','Tindouf',
  'Tissemsilt','El Oued','Khenchela','Souk Ahras','Tipaza','Mila','Aïn Defla','Naâma',
  'Aïn Témouchent','Ghardaïa','Relizane',
]
const SERVICE_ICONS  = ['✂️','🪒','💈','🔥','👦','💎','🌿','✨','👑','⚡']
const BARBER_EMOJIS  = ['👨🏽','👨🏿','👨🏻','👨🏾','👨🏼','👨','👨‍🦱','👨‍🦳','👨‍🦲']

const PLANS = [
  { id: 'starter', name: 'Starter', price: 3000, desc: 'Idéal pour démarrer', features: ['1 profil coiffeur','Réservation en ligne',"Jusqu'à 5 services",'Page salon publique'] },
  { id: 'pro', name: 'Pro', price: 6500, desc: 'Le plus populaire', popular: true, features: ["Jusqu'à 5 coiffeurs","Services illimités","Analytics & rapports","Badge Salon Vérifié"] },
  { id: 'elite', name: 'Elite', price: 12000, desc: 'Pour les grandes enseignes', features: ['Coiffeurs illimités','Services illimités','Analytics & rapports','Badge Salon Vérifié','Mise en avant dans les résultats'] },
]

type Profile = { full_name: string | null; phone: string | null; wilaya: string | null }

export default function OnboardingClient({ profile }: { profile: Profile | null }) {
  const [step, setStep] = useState(1)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [shopName, setShopName]       = useState('')
  const [wilaya, setWilaya]           = useState(profile?.wilaya ?? '')
  const [address, setAddress]         = useState('')
  const [phone, setPhone]             = useState(profile?.phone ?? '')
  const [description, setDescription] = useState('')
  const [services, setServices] = useState([
    { name: '', duration: '30', price: '', icon: '✂️' },
    { name: '', duration: '20', price: '', icon: '🪒' },
  ])
  const [barbers, setBarbers] = useState([{ name: profile?.full_name ?? '', emoji: '👨🏽' }])
  const [plan, setPlan] = useState<'starter' | 'pro' | 'elite'>('pro')
  const [refCode, setRefCode] = useState('')

  const STEP_LABELS = ['Salon', 'Services', 'Équipe', 'Formule']

  function addService() { setServices(s => [...s, { name: '', duration: '30', price: '', icon: '✂️' }]) }
  function removeService(i: number) { setServices(s => s.filter((_, idx) => idx !== i)) }
  function updateService(i: number, field: string, val: string) {
    setServices(s => s.map((svc, idx) => idx === i ? { ...svc, [field]: val } : svc))
  }
  function addBarber() { setBarbers(b => [...b, { name: '', emoji: '👨🏽' }]) }
  function removeBarber(i: number) { setBarbers(b => b.filter((_, idx) => idx !== i)) }
  function updateBarber(i: number, field: string, val: string) {
    setBarbers(b => b.map((brb, idx) => idx === i ? { ...brb, [field]: val } : brb))
  }

  function validateStep1() {
    if (!shopName.trim()) return 'Le nom du salon est requis.'
    if (!wilaya) return 'Sélectionnez une wilaya.'
    return null
  }
  function validateStep2() {
    if (!services.some(s => s.name.trim() && s.price)) return 'Ajoutez au moins un service avec un prix.'
    return null
  }

  function handleNext() {
    const err = step === 1 ? validateStep1() : step === 2 ? validateStep2() : null
    if (err) { setError(err); return }
    setError(null); setStep(s => s + 1)
  }

  function handleSubmit() {
    setError(null)
    const validServices = services.filter(s => s.name.trim() && s.price)
    const validBarbers  = barbers.filter(b => b.name.trim())

    const fd = new FormData()
    fd.set('name', shopName); fd.set('wilaya', wilaya); fd.set('address', address)
    fd.set('phone', phone); fd.set('description', description); fd.set('plan', plan)
    fd.set('services', JSON.stringify(validServices)); fd.set('barbers', JSON.stringify(validBarbers))
    if (refCode) fd.set('referred_by', refCode)

    startTransition(async () => {
      const result = await createShopAction(fd)
      if (result?.error) setError(result.error)
    })
  }

  const inputStyle: React.CSSProperties = {
    background: 'var(--bg-2)', border: '1.5px solid var(--border)', borderRadius: 'var(--r)',
    padding: '10px 14px', fontSize: '0.875rem', color: 'var(--ink)', outline: 'none',
    transition: 'border-color 0.18s', width: '100%', fontFamily: 'var(--font-ui)',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '3rem 1rem 4rem' }}>

      {/* Logo */}
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: 'var(--ink)', lineHeight: 1 }}>
          Hass<span style={{ color: 'var(--copper)' }}>anly</span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--ink-3)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 4 }}>Configuration du salon</div>
      </div>

      {/* Steps indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: '2.5rem' }}>
        {STEP_LABELS.map((label, i) => {
          const n = i + 1
          const done = step > n, active = step === n
          return (
            <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: done ? 'var(--copper)' : active ? 'var(--copper-dim)' : 'var(--bg-2)',
                  border: `2px solid ${done || active ? 'var(--copper)' : 'var(--border)'}`,
                  color: done ? 'white' : active ? 'var(--copper)' : 'var(--ink-3)',
                  fontSize: '0.8rem', fontWeight: 700, transition: 'all 0.2s',
                }}>
                  {done ? '✓' : n}
                </div>
                <span style={{ fontSize: '0.65rem', color: active ? 'var(--copper)' : 'var(--ink-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{label}</span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div style={{ width: 48, height: 1, background: step > n ? 'var(--copper)' : 'var(--border)', margin: '0 6px', marginBottom: 22, transition: 'background 0.3s' }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Card */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '2rem', width: '100%', maxWidth: 560 }}>

        {error && <div className="auth-error" style={{ marginBottom: '1.25rem' }}>{error}</div>}

        {/* STEP 1 — Shop info */}
        {step === 1 && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--ink)', marginBottom: '0.4rem', fontWeight: 400 }}>Votre salon</h2>
            <p style={{ color: 'var(--ink-3)', fontSize: '0.82rem', marginBottom: '1.75rem' }}>Les informations de base de votre établissement.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Nom du salon *</label>
                <input style={inputStyle} value={shopName} onChange={e => setShopName(e.target.value)} placeholder="Barber Palace Oran" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Wilaya *</label>
                  <select style={inputStyle} value={wilaya} onChange={e => setWilaya(e.target.value)}>
                    <option value="">Choisir…</option>
                    {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Téléphone</label>
                  <input style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)} placeholder="0550 000 000" />
                </div>
              </div>
              <div className="form-group">
                <label>Adresse</label>
                <input style={inputStyle} value={address} onChange={e => setAddress(e.target.value)} placeholder="Rue Ibn Badis, centre-ville" />
              </div>
              <div className="form-group">
                <label>Description courte</label>
                <textarea style={{ ...inputStyle, resize: 'vertical' }} value={description} onChange={e => setDescription(e.target.value)} placeholder="Décrivez votre salon en 1-2 phrases…" rows={2} />
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  Code de parrainage
                  <span style={{ fontSize: '0.7rem', color: 'var(--ink-3)', fontWeight: 400 }}>(optionnel)</span>
                </label>
                <input
                  style={inputStyle}
                  value={refCode}
                  onChange={e => setRefCode(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                  placeholder="ex : KARIM01"
                  maxLength={20}
                />
                {refCode && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--copper)', marginTop: 4 }}>
                    👍 Code « {refCode} » appliqué
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 — Services */}
        {step === 2 && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--ink)', marginBottom: '0.4rem', fontWeight: 400 }}>Vos services</h2>
            <p style={{ color: 'var(--ink-3)', fontSize: '0.82rem', marginBottom: '1.5rem' }}>Ajoutez au moins un service avec son prix.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)', borderRadius: 'var(--r)', overflow: 'hidden', marginBottom: '1rem' }}>
              {services.map((svc, i) => (
                <div key={i} style={{ background: 'var(--bg-2)', padding: '14px' }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <select value={svc.icon} onChange={e => updateService(i, 'icon', e.target.value)} style={{ ...inputStyle, width: 54, padding: '8px', textAlign: 'center', fontSize: '1.1rem' }}>
                      {SERVICE_ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                    </select>
                    <input style={inputStyle} value={svc.name} onChange={e => updateService(i, 'name', e.target.value)} placeholder="Nom du service (ex: Skin Fade)" />
                    {services.length > 1 && (
                      <button onClick={() => removeService(i)} style={{ background: 'var(--red-dim)', border: '1px solid var(--red)', color: 'var(--red)', borderRadius: 'var(--r-sm)', padding: '0 10px', cursor: 'pointer', flexShrink: 0, fontSize: '0.9rem' }}>✕</button>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div className="form-group">
                      <label>Durée (min)</label>
                      <select style={inputStyle} value={svc.duration} onChange={e => updateService(i, 'duration', e.target.value)}>
                        {[10,15,20,25,30,40,45,60,75,90].map(d => <option key={d} value={d}>{d} min</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Prix (DA)</label>
                      <input style={inputStyle} type="number" value={svc.price} onChange={e => updateService(i, 'price', e.target.value)} placeholder="500" min="0" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={addService} className="btn-ghost" style={{ width: '100%', justifyContent: 'center', padding: '10px' }}>
              + Ajouter un service
            </button>
          </div>
        )}

        {/* STEP 3 — Staff */}
        {step === 3 && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--ink)', marginBottom: '0.4rem', fontWeight: 400 }}>Votre équipe</h2>
            <p style={{ color: 'var(--ink-3)', fontSize: '0.82rem', marginBottom: '1.5rem' }}>Ajoutez les coiffeurs de votre salon.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)', borderRadius: 'var(--r)', overflow: 'hidden', marginBottom: '1rem' }}>
              {barbers.map((b, i) => (
                <div key={i} style={{ background: 'var(--bg-2)', padding: '14px', display: 'flex', gap: 8, alignItems: 'center' }}>
                  <select value={b.emoji} onChange={e => updateBarber(i, 'emoji', e.target.value)} style={{ ...inputStyle, width: 54, padding: '8px', fontSize: '1.3rem', textAlign: 'center' }}>
                    {BARBER_EMOJIS.map(em => <option key={em} value={em}>{em}</option>)}
                  </select>
                  <input style={inputStyle} value={b.name} onChange={e => updateBarber(i, 'name', e.target.value)} placeholder="Prénom du coiffeur" />
                  {barbers.length > 1 && (
                    <button onClick={() => removeBarber(i)} style={{ background: 'var(--red-dim)', border: '1px solid var(--red)', color: 'var(--red)', borderRadius: 'var(--r-sm)', padding: '0 10px', cursor: 'pointer', flexShrink: 0, fontSize: '0.9rem', height: 40 }}>✕</button>
                  )}
                </div>
              ))}
            </div>

            <button onClick={addBarber} className="btn-ghost" style={{ width: '100%', justifyContent: 'center', padding: '10px' }}>
              + Ajouter un coiffeur
            </button>
          </div>
        )}

        {/* STEP 4 — Plan */}
        {step === 4 && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--ink)', marginBottom: '0.4rem', fontWeight: 400 }}>Choisir votre formule</h2>
            <p style={{ color: 'var(--ink-3)', fontSize: '0.82rem', marginBottom: '1.5rem' }}>Vous pourrez changer de formule à tout moment.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)', borderRadius: 'var(--r)', overflow: 'hidden', marginBottom: '1.5rem' }}>
              {PLANS.map(p => (
                <div key={p.id} onClick={() => setPlan(p.id as any)} style={{ background: plan === p.id ? 'var(--copper-dim)' : 'var(--bg-2)', padding: '16px', cursor: 'pointer', borderLeft: `2px solid ${plan === p.id ? 'var(--copper)' : 'transparent'}`, transition: 'all 0.15s', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${plan === p.id ? 'var(--copper)' : 'var(--border)'}`, background: plan === p.id ? 'var(--copper)' : 'transparent', flexShrink: 0, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'white' }}>
                    {plan === p.id ? '✓' : ''}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontWeight: 700, color: plan === p.id ? 'var(--copper)' : 'var(--ink)', fontSize: '0.95rem' }}>{p.name}</span>
                      {p.popular && <span className="badge-copper">Populaire</span>}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: plan === p.id ? 'var(--copper)' : 'var(--ink)', marginBottom: 6 }}>
                      {p.price.toLocaleString()} <span style={{ fontSize: '0.7rem', color: 'var(--ink-3)' }}>DA/mois</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
                      {p.features.map(f => (
                        <span key={f} style={{ fontSize: '0.72rem', color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ color: 'var(--copper)' }}>✓</span> {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '12px 14px', fontSize: '0.78rem', color: 'var(--ink-3)', lineHeight: 1.5 }}>
              🔒 Vous serez redirigé vers le paiement sécurisé Chargily dès que votre salon est créé.
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', gap: 10 }}>
          {step > 1
            ? <button onClick={() => { setStep(s => s - 1); setError(null) }} className="btn-ghost">← Retour</button>
            : <div />
          }
          {step < 4
            ? <button onClick={handleNext} className="btn-copper">Suivant →</button>
            : <button onClick={handleSubmit} disabled={isPending} className="btn-copper" style={{ opacity: isPending ? 0.6 : 1 }}>
                {isPending ? <span className="btn-loading"><span className="spinner" />Création…</span> : 'Créer mon salon →'}
              </button>
          }
        </div>
      </div>
    </div>
  )
}
