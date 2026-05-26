'use client'

import { useState, useTransition } from 'react'
import { addBarberAction, updateBarberAction, deleteBarberAction } from '@/lib/barber-actions'
import { uploadBarberPhotoAction } from '@/lib/upload-actions'

const EMOJIS = ['👨🏽','👨🏿','👨🏻','👨🏾','👨🏼','👨','👨‍🦱','👨‍🦳','👨‍🦲','🧔','🧔🏿','🧔🏻']
type Barber   = { id: string; name: string; emoji: string; bio: string | null; rating: number | null; review_count: number; photo_url?: string | null }
type Booking  = { id: string; status: string; price: number; booked_at: string; barbers: any }
type Props    = { barbers: Barber[]; bookings: Booking[] }
type FormState = { name: string; bio: string; emoji: string }
type ModalMode = 'add' | 'edit' | 'delete' | null

const EMPTY: FormState = { name: '', bio: '', emoji: '👨🏽' }

const inputStyle: React.CSSProperties = {
  background: 'var(--bg-2)', border: '1.5px solid var(--border)', borderRadius: 'var(--r)',
  padding: '10px 14px', fontSize: '0.875rem', color: 'var(--ink)', outline: 'none',
  transition: 'border-color 0.18s', width: '100%', fontFamily: 'var(--font-ui)',
}

function BarberPhotoUpload({ barber, onUploaded }: { barber: Barber; onUploaded: (url: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const [, startT] = useTransition()

  return (
    <label style={{ position: 'relative', width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, cursor: 'pointer', display: 'block' }}>
      {barber.photo_url
        ? <img src={barber.photo_url} alt={barber.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <div style={{ width: '100%', height: '100%', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem' }}>{barber.emoji}</div>
      }
      {/* Hover overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: uploading ? 1 : 0, transition: 'opacity 0.15s', borderRadius: '50%', fontSize: uploading ? '0rem' : '0.9rem' }} className="photo-overlay">
        {uploading ? <span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff', width: 18, height: 18 }} /> : '📷'}
      </div>
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        disabled={uploading}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (!file) return
          setUploading(true)
          const fd = new FormData()
          fd.set('file', file)
          fd.set('barber_id', barber.id)
          startT(async () => {
            const res = await uploadBarberPhotoAction(fd)
            setUploading(false)
            if (res?.success && res.url) onUploaded(res.url)
          })
        }}
      />
      <style>{`.photo-overlay:hover { opacity: 1 !important; }`}</style>
    </label>
  )
}

export default function StaffManager({ barbers: init, bookings }: Props) {
  const [barbers, setBarbers]   = useState<Barber[]>(init)
  const [modal, setModal]       = useState<ModalMode>(null)
  const [selected, setSelected] = useState<Barber | null>(null)
  const [form, setForm]         = useState<FormState>(EMPTY)
  const [error, setError]       = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const realBarbers = barbers.filter(b => b.name !== 'Premier disponible')
  const quickSlot   = barbers.find(b => b.name === 'Premier disponible')

  function openAdd()            { setSelected(null); setForm(EMPTY); setError(null); setModal('add') }
  function openEdit(b: Barber)  { setSelected(b); setForm({ name: b.name, bio: b.bio ?? '', emoji: b.emoji }); setError(null); setModal('edit') }
  function openDelete(b: Barber){ setSelected(b); setError(null); setModal('delete') }
  function closeModal()          { setModal(null); setSelected(null); setError(null) }

  function getStats(b: Barber) {
    const bks    = bookings.filter(bk => bk.barbers?.name === b.name)
    const done   = bks.filter(bk => bk.status === 'completed')
    const revenue = done.reduce((s, bk) => s + bk.price, 0)
    const pending = bks.filter(bk => bk.status === 'pending').length
    return { total: bks.length, done: done.length, revenue, pending }
  }

  function handleAdd() {
    setError(null)
    const fd = new FormData(); fd.set('name', form.name); fd.set('emoji', form.emoji); fd.set('bio', form.bio)
    startTransition(async () => {
      const res = await addBarberAction(fd)
      if (res?.error) { setError(res.error); return }
      setBarbers(b => [...b, { id: res.barber?.id ?? Date.now().toString(), name: form.name, emoji: form.emoji, bio: form.bio || null, rating: null, review_count: 0 }])
      closeModal()
    })
  }

  function handleEdit() {
    if (!selected) return; setError(null)
    const fd = new FormData(); fd.set('id', selected.id); fd.set('name', form.name); fd.set('emoji', form.emoji); fd.set('bio', form.bio)
    startTransition(async () => {
      const res = await updateBarberAction(fd)
      if (res?.error) { setError(res.error); return }
      setBarbers(b => b.map(brb => brb.id === selected.id ? { ...brb, name: form.name, emoji: form.emoji, bio: form.bio || null } : brb))
      closeModal()
    })
  }

  function handleDelete() {
    if (!selected) return; setError(null)
    const fd = new FormData(); fd.set('id', selected.id)
    startTransition(async () => {
      const res = await deleteBarberAction(fd)
      if (res?.error) { setError(res.error); return }
      setBarbers(b => b.filter(brb => brb.id !== selected.id)); closeModal()
    })
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: 'var(--ink)', fontWeight: 400, marginBottom: 4 }}>Mon équipe</h2>
          <p style={{ color: 'var(--ink-3)', fontSize: '0.82rem' }}>{realBarbers.length} coiffeur{realBarbers.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openAdd} className="btn-copper">+ Ajouter un coiffeur</button>
      </div>

      {/* Quick slot info */}
      {quickSlot && (
        <div style={{ background: 'var(--copper-dim)', border: '1px solid rgba(200,133,74,0.25)', borderRadius: 'var(--r)', padding: '12px 16px', marginBottom: '1.5rem', fontSize: '0.82rem', color: 'var(--ink-2)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.1rem' }}>⚡</span>
          <span><strong style={{ color: 'var(--copper)' }}>Premier disponible</strong> est actif — les clients peuvent réserver sans choisir de coiffeur spécifique.</span>
        </div>
      )}

      {realBarbers.length === 0 ? (
        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '3.5rem', textAlign: 'center', color: 'var(--ink-3)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem', opacity: 0.5 }}>◉</div>
          <p style={{ fontSize: '0.875rem', marginBottom: '1.25rem' }}>Aucun coiffeur configuré.</p>
          <button onClick={openAdd} className="btn-copper">+ Premier coiffeur</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1px', background: 'var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
          {realBarbers.map(b => {
            const stats = getStats(b)
            return (
              <div key={b.id} style={{ background: 'var(--bg-1)', padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {/* Avatar with upload overlay */}
                    <BarberPhotoUpload barber={b} onUploaded={(url) => setBarbers(bs => bs.map(br => br.id === b.id ? { ...br, photo_url: url } : br))} />
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '0.9rem' }}>{b.name}</div>
                      {b.rating && <div style={{ fontSize: '0.72rem', color: 'var(--copper)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>★ {b.rating} ({b.review_count} avis)</div>}
                      {b.bio && <div style={{ fontSize: '0.72rem', color: 'var(--ink-3)', marginTop: 3 }}>{b.bio}</div>}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1px', background: 'var(--border)', borderRadius: 'var(--r-sm)', overflow: 'hidden', marginBottom: '1rem' }}>
                  {[
                    { label: 'RDV', value: stats.total },
                    { label: 'Terminés', value: stats.done },
                    { label: 'En attente', value: stats.pending },
                  ].map(s => (
                    <div key={s.label} style={{ background: 'var(--bg-2)', padding: '8px', textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--ink)', fontWeight: 700 }}>{s.value}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {stats.revenue > 0 && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--ink-3)', marginBottom: '1rem', fontFamily: 'var(--font-mono)' }}>
                    Revenus : <strong style={{ color: 'var(--copper)' }}>{stats.revenue.toLocaleString()} DA</strong>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => openEdit(b)} className="btn-ghost" style={{ flex: 1, justifyContent: 'center', padding: '7px 10px', fontSize: '0.78rem' }}>Modifier</button>
                  <button onClick={() => openDelete(b)} className="btn-danger" style={{ padding: '7px 12px', fontSize: '0.78rem' }}>✕</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">{modal === 'add' ? 'Nouveau coiffeur' : 'Modifier le coiffeur'}</h3>
            {error && <div className="auth-error" style={{ marginBottom: '1rem' }}>{error}</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Avatar</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {EMOJIS.map(em => (
                    <button key={em} type="button" onClick={() => setForm(f => ({ ...f, emoji: em }))} style={{ width: 40, height: 40, fontSize: '1.4rem', background: form.emoji === em ? 'var(--copper-dim)' : 'var(--bg-2)', border: `1.5px solid ${form.emoji === em ? 'var(--copper)' : 'var(--border)'}`, borderRadius: 'var(--r-sm)', cursor: 'pointer' }}>
                      {em}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Prénom *</label>
                <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Karim, Youcef…" />
              </div>
              <div className="form-group">
                <label>Bio (optionnel)</label>
                <input style={inputStyle} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Spécialiste Fade, 5 ans d'expérience…" />
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={closeModal} className="btn-ghost" disabled={isPending}>Annuler</button>
              <button onClick={modal === 'add' ? handleAdd : handleEdit} className="btn-copper" disabled={isPending || !form.name.trim()}>
                {isPending ? <span className="btn-loading"><span className="spinner" />{modal === 'add' ? 'Ajout…' : 'Enregistrement…'}</span> : modal === 'add' ? 'Ajouter' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modal === 'delete' && selected && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 380, textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{selected.emoji}</div>
            <h3 className="modal-title" style={{ fontSize: '1.2rem' }}>Supprimer ce coiffeur ?</h3>
            <p style={{ color: 'var(--ink-3)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              "<strong>{selected.name}</strong>" sera retiré de votre équipe.
            </p>
            {error && <div className="auth-error" style={{ marginBottom: '1rem' }}>{error}</div>}
            <div className="modal-actions" style={{ justifyContent: 'center' }}>
              <button onClick={closeModal} className="btn-ghost">Annuler</button>
              <button onClick={handleDelete} className="btn-danger" disabled={isPending}>
                {isPending ? 'Suppression…' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
