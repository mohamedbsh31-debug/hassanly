'use client'

import { useState, useTransition } from 'react'
import { addServiceAction, updateServiceAction, deleteServiceAction } from '@/lib/service-actions'

const ICONS     = ['✂️','🪒','💈','🔥','👦','💎','🌿','✨','👑','⚡','🧴','🪮']
const DURATIONS = [10,15,20,25,30,35,40,45,50,60,75,90,120]

type Service  = { id: string; name: string; description: string | null; duration: number; price: number; icon: string }
type Props    = { services: Service[]; bookings: any[] }
type ModalMode = 'add' | 'edit' | 'delete' | null
type FormState = { name: string; description: string; duration: number; price: string; icon: string }

const EMPTY: FormState = { name: '', description: '', duration: 30, price: '', icon: '✂️' }

const inputStyle: React.CSSProperties = {
  background: 'var(--bg-2)', border: '1.5px solid var(--border)', borderRadius: 'var(--r)',
  padding: '10px 14px', fontSize: '0.875rem', color: 'var(--ink)', outline: 'none',
  transition: 'border-color 0.18s', width: '100%', fontFamily: 'var(--font-ui)',
}

export default function ServicesManager({ services: init, bookings }: Props) {
  const [services, setServices] = useState<Service[]>(init)
  const [modal, setModal]       = useState<ModalMode>(null)
  const [selected, setSelected] = useState<Service | null>(null)
  const [form, setForm]         = useState<FormState>(EMPTY)
  const [error, setError]       = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function openAdd()            { setSelected(null); setForm(EMPTY); setError(null); setModal('add') }
  function openEdit(s: Service) { setSelected(s); setForm({ name: s.name, description: s.description ?? '', duration: s.duration, price: String(s.price), icon: s.icon }); setError(null); setModal('edit') }
  function openDelete(s: Service) { setSelected(s); setError(null); setModal('delete') }
  function closeModal()          { setModal(null); setSelected(null); setError(null) }

  function handleAdd() {
    setError(null)
    const fd = new FormData()
    fd.set('name', form.name); fd.set('description', form.description)
    fd.set('duration', String(form.duration)); fd.set('price', form.price); fd.set('icon', form.icon)
    startTransition(async () => {
      const res = await addServiceAction(fd)
      if (res?.error) { setError(res.error); return }
      setServices(s => [...s, { id: Date.now().toString(), name: form.name, description: form.description || null, duration: form.duration, price: parseInt(form.price), icon: form.icon }])
      closeModal()
    })
  }

  function handleEdit() {
    if (!selected) return; setError(null)
    const fd = new FormData()
    fd.set('service_id', selected.id); fd.set('name', form.name); fd.set('description', form.description)
    fd.set('duration', String(form.duration)); fd.set('price', form.price); fd.set('icon', form.icon)
    startTransition(async () => {
      const res = await updateServiceAction(fd)
      if (res?.error) { setError(res.error); return }
      setServices(s => s.map(sv => sv.id === selected.id ? { ...sv, name: form.name, description: form.description || null, duration: form.duration, price: parseInt(form.price), icon: form.icon } : sv))
      closeModal()
    })
  }

  function handleDelete() {
    if (!selected) return; setError(null)
    const fd = new FormData(); fd.set('service_id', selected.id)
    startTransition(async () => {
      const res = await deleteServiceAction(fd)
      if (res?.error) { setError(res.error); return }
      setServices(s => s.filter(sv => sv.id !== selected.id)); closeModal()
    })
  }

  function getUsage(svc: Service) { return bookings.filter(b => b.services?.name === svc.name && b.status === 'completed').length }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: 'var(--ink)', fontWeight: 400, marginBottom: 4 }}>Services & Tarifs</h2>
          <p style={{ color: 'var(--ink-3)', fontSize: '0.82rem' }}>{services.length} service{services.length !== 1 ? 's' : ''} configuré{services.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openAdd} className="btn-copper">+ Ajouter un service</button>
      </div>

      {services.length === 0 ? (
        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '3.5rem', textAlign: 'center', color: 'var(--ink-3)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem', opacity: 0.5 }}>✦</div>
          <p style={{ fontSize: '0.875rem', marginBottom: '1.25rem' }}>Aucun service. Ajoutez vos prestations.</p>
          <button onClick={openAdd} className="btn-copper">+ Premier service</button>
        </div>
      ) : (
        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-2)' }}>
                  {['Service','Durée','Prix','Utilisations',''].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {services.map(svc => (
                  <tr key={svc.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: '1.3rem' }}>{svc.icon}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--ink)' }}>{svc.name}</div>
                          {svc.description && <div style={{ fontSize: '0.72rem', color: 'var(--ink-3)', marginTop: 2 }}>{svc.description}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '0.82rem', color: 'var(--ink-2)', fontFamily: 'var(--font-mono)' }}>{svc.duration} min</td>
                    <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--copper)', fontSize: '0.9rem' }}>{svc.price.toLocaleString()} DA</td>
                    <td style={{ padding: '14px 16px', fontSize: '0.8rem', color: 'var(--ink-3)' }}>{getUsage(svc)} fois</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => openEdit(svc)} className="btn-ghost" style={{ padding: '5px 12px', fontSize: '0.75rem' }}>Modifier</button>
                        <button onClick={() => openDelete(svc)} className="btn-danger" style={{ padding: '5px 12px', fontSize: '0.75rem' }}>Supprimer</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">{modal === 'add' ? 'Nouveau service' : 'Modifier le service'}</h3>
            {error && <div className="auth-error" style={{ marginBottom: '1rem' }}>{error}</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Icône</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {ICONS.map(ic => (
                    <button key={ic} type="button" onClick={() => setForm(f => ({ ...f, icon: ic }))} style={{ width: 38, height: 38, fontSize: '1.2rem', background: form.icon === ic ? 'var(--copper-dim)' : 'var(--bg-2)', border: `1.5px solid ${form.icon === ic ? 'var(--copper)' : 'var(--border)'}`, borderRadius: 'var(--r-sm)', cursor: 'pointer' }}>
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Nom du service *</label>
                <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Skin Fade, Taille barbe…" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input style={inputStyle} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Courte description (optionnel)" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Durée</label>
                  <select style={inputStyle} value={form.duration} onChange={e => setForm(f => ({ ...f, duration: parseInt(e.target.value) }))}>
                    {DURATIONS.map(d => <option key={d} value={d}>{d} min</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Prix (DA) *</label>
                  <input style={inputStyle} type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="500" min="0" />
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={closeModal} className="btn-ghost" disabled={isPending}>Annuler</button>
              <button onClick={modal === 'add' ? handleAdd : handleEdit} className="btn-copper" disabled={isPending || !form.name.trim() || !form.price}>
                {isPending ? <span className="btn-loading"><span className="spinner" />{modal === 'add' ? 'Ajout…' : 'Enregistrement…'}</span> : modal === 'add' ? 'Ajouter' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {modal === 'delete' && selected && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 380, textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{selected.icon}</div>
            <h3 className="modal-title" style={{ fontSize: '1.2rem' }}>Supprimer ce service ?</h3>
            <p style={{ color: 'var(--ink-3)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              "<strong>{selected.name}</strong>" sera définitivement supprimé.
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
