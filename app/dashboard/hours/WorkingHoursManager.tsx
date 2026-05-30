'use client'

import { useState, useTransition } from 'react'
import {
  saveShopWorkingHoursAction,
  saveBarberWorkingHoursAction,
  type WeekSchedule,
  type DaySchedule,
} from '@/lib/working-hours-actions'

// ─── Types ────────────────────────────────────────────────────────────────────

type Barber = { id: string; name: string; emoji: string }
type Props  = {
  shopId:        string
  shopName:      string
  shopHours:     WeekSchedule | null
  barbers:       Barber[]
  barberHours:   Record<string, WeekSchedule | null>  // barberId → schedule
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = [
  { key: '0', labelFr: 'Dimanche',  short: 'Dim' },
  { key: '1', labelFr: 'Lundi',     short: 'Lun' },
  { key: '2', labelFr: 'Mardi',     short: 'Mar' },
  { key: '3', labelFr: 'Mercredi',  short: 'Mer' },
  { key: '4', labelFr: 'Jeudi',     short: 'Jeu' },
  { key: '5', labelFr: 'Vendredi',  short: 'Ven' },
  { key: '6', labelFr: 'Samedi',    short: 'Sam' },
]

const ALGERIAN_DEFAULT: WeekSchedule = {
  '0': { open: false, start: '09:00', end: '18:00' },            // Dimanche
  '1': { open: true,  start: '09:00', end: '19:00' },
  '2': { open: true,  start: '09:00', end: '19:00' },
  '3': { open: true,  start: '09:00', end: '19:00' },
  '4': { open: true,  start: '09:00', end: '19:00' },
  '5': { open: true,  start: '08:00', end: '12:00', break_start: null, break_end: null },  // Vendredi midi
  '6': { open: true,  start: '09:00', end: '19:00' },
}

const TIME_OPTIONS: string[] = []
for (let h = 6; h <= 23; h++) {
  for (const m of [0, 30]) {
    TIME_OPTIONS.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`)
  }
}
TIME_OPTIONS.push('00:00')

// ─── Shared styles ────────────────────────────────────────────────────────────

const selectStyle: React.CSSProperties = {
  background: 'var(--bg-2)', border: '1.5px solid var(--border)', borderRadius: 'var(--r-sm)',
  padding: '7px 10px', fontSize: '0.82rem', color: 'var(--ink)', outline: 'none',
  fontFamily: 'var(--font-ui)', cursor: 'pointer', minWidth: 90,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function defaultSchedule(existing: WeekSchedule | null): WeekSchedule {
  if (existing) {
    // fill in any missing days
    const out = { ...ALGERIAN_DEFAULT }
    for (const [k, v] of Object.entries(existing)) out[k] = v
    return out
  }
  return { ...ALGERIAN_DEFAULT }
}

// ─── DayRow ───────────────────────────────────────────────────────────────────

function DayRow({
  dayKey, day, schedule, onChange,
}: {
  dayKey: string
  day: typeof DAYS[number]
  schedule: DaySchedule
  onChange: (key: string, next: DaySchedule) => void
}) {
  const [showBreak, setShowBreak] = useState(!!(schedule.break_start && schedule.break_end))

  function update(patch: Partial<DaySchedule>) {
    onChange(dayKey, { ...schedule, ...patch })
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '90px 52px 1fr',
      alignItems: 'center',
      gap: 12,
      padding: '10px 16px',
      borderBottom: '1px solid var(--border)',
      background: schedule.open ? 'var(--surface)' : 'var(--bg-1)',
      transition: 'background 0.15s',
    }}>
      {/* Day label */}
      <span style={{
        fontSize: '0.82rem',
        fontWeight: 600,
        color: schedule.open ? 'var(--ink)' : 'var(--ink-3)',
        transition: 'color 0.15s',
      }}>
        {day.labelFr}
      </span>

      {/* Toggle */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', userSelect: 'none' }}>
        <div style={{ position: 'relative', width: 34, height: 20 }}>
          <input
            type="checkbox"
            checked={schedule.open}
            onChange={e => update({ open: e.target.checked })}
            style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', margin: 0 }}
          />
          <div style={{
            width: '100%', height: '100%',
            background: schedule.open ? '#d97706' : 'var(--bg-3)',
            borderRadius: 10, transition: 'background 0.2s',
          }} />
          <div style={{
            position: 'absolute', top: 3, left: schedule.open ? 17 : 3,
            width: 14, height: 14,
            background: '#fff', borderRadius: '50%', transition: 'left 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }} />
        </div>
      </label>

      {/* Times */}
      {schedule.open ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {/* Open / Close row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <select style={selectStyle} value={schedule.start} onChange={e => update({ start: e.target.value })}>
              {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <span style={{ fontSize: '0.78rem', color: 'var(--ink-3)' }}>→</span>
            <select style={selectStyle} value={schedule.end} onChange={e => update({ end: e.target.value })}>
              {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <button
              type="button"
              onClick={() => {
                setShowBreak(b => !b)
                if (showBreak) update({ break_start: null, break_end: null })
              }}
              style={{
                background: showBreak ? 'var(--copper-dim)' : 'var(--bg-2)',
                border: `1px solid ${showBreak ? 'var(--copper)' : 'var(--border)'}`,
                color: showBreak ? 'var(--copper)' : 'var(--ink-3)',
                borderRadius: 'var(--r-sm)', padding: '5px 10px', fontSize: '0.72rem',
                fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-ui)',
                whiteSpace: 'nowrap',
              }}
            >
              {showBreak ? '✕ Pause' : '+ Pause'}
            </button>
          </div>

          {/* Break row */}
          {showBreak && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 4, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--ink-3)', minWidth: 36 }}>Pause</span>
              <select
                style={{ ...selectStyle, borderColor: 'var(--copper)', minWidth: 82 }}
                value={schedule.break_start ?? '12:00'}
                onChange={e => update({ break_start: e.target.value })}
              >
                {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <span style={{ fontSize: '0.78rem', color: 'var(--ink-3)' }}>→</span>
              <select
                style={{ ...selectStyle, borderColor: 'var(--copper)', minWidth: 82 }}
                value={schedule.break_end ?? '13:00'}
                onChange={e => update({ break_end: e.target.value })}
              >
                {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          )}
        </div>
      ) : (
        <span style={{ fontSize: '0.78rem', color: 'var(--ink-3)', fontStyle: 'italic' }}>Fermé</span>
      )}
    </div>
  )
}

// ─── ScheduleEditor ───────────────────────────────────────────────────────────

function ScheduleEditor({
  schedule,
  onChange,
}: {
  schedule: WeekSchedule
  onChange: (s: WeekSchedule) => void
}) {
  function handleDayChange(key: string, next: DaySchedule) {
    onChange({ ...schedule, [key]: next })
  }

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        display: 'grid', gridTemplateColumns: '90px 52px 1fr',
        gap: 12, padding: '8px 16px',
        background: 'var(--bg-2)', borderBottom: '1px solid var(--border)',
      }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Jour</span>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ouvert</span>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Horaires</span>
      </div>

      {/* Day rows */}
      {DAYS.map(day => (
        <DayRow
          key={day.key}
          dayKey={day.key}
          day={day}
          schedule={schedule[day.key] ?? { open: false, start: '09:00', end: '18:00' }}
          onChange={handleDayChange}
        />
      ))}
    </div>
  )
}

// ─── SummaryPills ─────────────────────────────────────────────────────────────

function SummaryPills({ schedule }: { schedule: WeekSchedule }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
      {DAYS.map(d => {
        const s = schedule[d.key]
        return (
          <span
            key={d.key}
            style={{
              fontSize: '0.7rem', fontWeight: 600,
              padding: '2px 8px', borderRadius: 999,
              background: s?.open ? 'var(--copper-dim)' : 'var(--bg-2)',
              color: s?.open ? 'var(--copper-2)' : 'var(--ink-3)',
              border: `1px solid ${s?.open ? 'rgba(200,133,74,0.25)' : 'var(--border)'}`,
            }}
          >
            {d.short}
          </span>
        )
      })}
    </div>
  )
}

// ─── ShopHoursSection ─────────────────────────────────────────────────────────

function ShopHoursSection({ shopId, shopName, initialHours }: {
  shopId: string
  shopName: string
  initialHours: WeekSchedule | null
}) {
  const [schedule, setSchedule] = useState<WeekSchedule>(defaultSchedule(initialHours))
  const [saved, setSaved]       = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [isPending, startT]     = useTransition()

  function handleSave() {
    setError(null); setSaved(false)
    const fd = new FormData()
    fd.set('schedule', JSON.stringify(schedule))
    startT(async () => {
      const res = await saveShopWorkingHoursAction(fd)
      if (res?.error) { setError(res.error); return }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    })
  }

  return (
    <section style={{ marginBottom: '2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ink)', marginBottom: 2 }}>
            🏪 Horaires du salon
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--ink-3)' }}>
            Horaires par défaut affichés aux clients
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {saved && (
            <span style={{ fontSize: '0.78rem', color: 'var(--green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              ✓ Enregistré
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isPending}
            className="btn-copper"
            style={{ fontSize: '0.82rem', padding: '8px 18px' }}
          >
            {isPending
              ? <span className="btn-loading"><span className="spinner" />Enregistrement…</span>
              : 'Enregistrer'}
          </button>
        </div>
      </div>

      {error && (
        <div className="auth-error" style={{ marginBottom: '1rem', fontSize: '0.82rem' }}>
          {error}
        </div>
      )}

      <ScheduleEditor schedule={schedule} onChange={setSchedule} />
    </section>
  )
}

// ─── BarberHoursSection ───────────────────────────────────────────────────────

function BarberHoursCard({ barber, shopHours, initialHours }: {
  barber: Barber
  shopHours: WeekSchedule | null
  initialHours: WeekSchedule | null
}) {
  const [expanded, setExpanded]   = useState(false)
  const [useCustom, setUseCustom] = useState(initialHours !== null)
  const [schedule, setSchedule]   = useState<WeekSchedule>(
    defaultSchedule(initialHours ?? shopHours)
  )
  const [saved, setSaved]         = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [isPending, startT]       = useTransition()

  function handleSave() {
    setError(null); setSaved(false)
    const fd = new FormData()
    fd.set('barber_id', barber.id)
    fd.set('schedule', JSON.stringify(schedule))
    startT(async () => {
      const res = await saveBarberWorkingHoursAction(fd)
      if (res?.error) { setError(res.error); return }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    })
  }

  return (
    <div style={{
      border: '1px solid var(--border)', borderRadius: 'var(--r)',
      overflow: 'hidden', background: 'var(--surface)',
    }}>
      {/* Card header */}
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 16px', background: 'transparent', border: 'none',
          cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-ui)',
        }}
      >
        <span style={{ fontSize: '1.4rem' }}>{barber.emoji}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>
            {barber.name}
          </div>
          {!expanded && (
            <div style={{ display: 'flex', gap: 4 }}>
              {useCustom
                ? <SummaryPills schedule={schedule} />
                : <span style={{ fontSize: '0.72rem', color: 'var(--ink-3)', fontStyle: 'italic' }}>Suit les horaires du salon</span>
              }
            </div>
          )}
        </div>
        <span style={{
          fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 999,
          background: useCustom ? 'var(--copper-dim)' : 'var(--bg-2)',
          color: useCustom ? 'var(--copper-2)' : 'var(--ink-3)',
          border: `1px solid ${useCustom ? 'rgba(200,133,74,0.25)' : 'var(--border)'}`,
          marginRight: 8, whiteSpace: 'nowrap',
        }}>
          {useCustom ? 'Perso' : 'Salon'}
        </span>
        <span style={{
          fontSize: '0.7rem', color: 'var(--ink-3)',
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s', display: 'inline-block',
        }}>▼</span>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '16px' }}>
          {/* Custom toggle */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--bg-1)', borderRadius: 'var(--r-sm)',
            padding: '10px 14px', marginBottom: '1rem',
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none', flex: 1 }}>
              <div style={{ position: 'relative', width: 34, height: 20, flexShrink: 0 }}>
                <input
                  type="checkbox"
                  checked={useCustom}
                  onChange={e => {
                    setUseCustom(e.target.checked)
                    if (!e.target.checked) setSchedule(defaultSchedule(shopHours))
                  }}
                  style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', margin: 0 }}
                />
                <div style={{
                  width: '100%', height: '100%',
                  background: useCustom ? '#d97706' : 'var(--bg-3)',
                  borderRadius: 10, transition: 'background 0.2s',
                }} />
                <div style={{
                  position: 'absolute', top: 3, left: useCustom ? 17 : 3,
                  width: 14, height: 14,
                  background: '#fff', borderRadius: '50%', transition: 'left 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink)' }}>Horaires personnalisés</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--ink-3)' }}>
                  {useCustom ? 'Ce coiffeur a ses propres horaires' : 'Reprend les horaires du salon'}
                </div>
              </div>
            </label>
          </div>

          {useCustom && (
            <>
              <ScheduleEditor schedule={schedule} onChange={setSchedule} />

              {error && (
                <div className="auth-error" style={{ marginTop: '0.75rem', fontSize: '0.82rem' }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10, marginTop: '0.75rem' }}>
                {saved && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--green)', fontWeight: 600 }}>
                    ✓ Enregistré
                  </span>
                )}
                <button
                  onClick={handleSave}
                  disabled={isPending}
                  className="btn-copper"
                  style={{ fontSize: '0.82rem', padding: '8px 18px' }}
                >
                  {isPending
                    ? <span className="btn-loading"><span className="spinner" />Enregistrement…</span>
                    : 'Enregistrer'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ─── WorkingHoursManager (main export) ────────────────────────────────────────

export default function WorkingHoursManager({
  shopId, shopName, shopHours, barbers, barberHours,
}: Props) {
  const realBarbers = barbers.filter(b => b.name !== 'Premier disponible')

  return (
    <div>
      {/* Page title */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: 'var(--ink)', fontWeight: 400, marginBottom: 4 }}>
          Horaires d'ouverture
        </h2>
        <p style={{ color: 'var(--ink-3)', fontSize: '0.82rem' }}>
          Configurez les heures d'ouverture du salon et de chaque coiffeur.
        </p>
      </div>

      {/* Info box */}
      <div style={{
        background: 'var(--copper-dim)', border: '1px solid rgba(200,133,74,0.25)',
        borderRadius: 'var(--r)', padding: '12px 16px', marginBottom: '2rem',
        fontSize: '0.82rem', color: 'var(--ink-2)', display: 'flex', alignItems: 'flex-start', gap: 10,
      }}>
        <span style={{ fontSize: '1rem', flexShrink: 0 }}>💡</span>
        <span>
          Les clients voient ces horaires lors de la réservation.
          Chaque coiffeur peut avoir ses propres horaires ou suivre ceux du salon.
        </span>
      </div>

      {/* Shop hours */}
      <ShopHoursSection shopId={shopId} shopName={shopName} initialHours={shopHours} />

      {/* Per-barber hours */}
      {realBarbers.length > 0 && (
        <section>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>
            👨‍💼 Horaires par coiffeur
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--ink-3)', marginBottom: '1rem' }}>
            Cliquez sur un coiffeur pour personnaliser ses heures de disponibilité.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {realBarbers.map(b => (
              <BarberHoursCard
                key={b.id}
                barber={b}
                shopHours={shopHours}
                initialHours={barberHours[b.id] ?? null}
              />
            ))}
          </div>
        </section>
      )}

      {realBarbers.length === 0 && (
        <div style={{
          background: 'var(--bg-1)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)', padding: '2rem', textAlign: 'center', color: 'var(--ink-3)',
        }}>
          <div style={{ fontSize: '1.5rem', marginBottom: 8, opacity: 0.5 }}>👨‍💼</div>
          <p style={{ fontSize: '0.875rem' }}>
            Ajoutez des coiffeurs dans l'onglet <strong>Mon équipe</strong> pour configurer leurs horaires.
          </p>
        </div>
      )}
    </div>
  )
}
