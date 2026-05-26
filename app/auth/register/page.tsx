'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { registerAction } from '@/lib/auth-actions'

const WILAYAS = [
  'Adrar','Chlef','Laghouat','Oum El Bouaghi','Batna','Béjaïa','Biskra',
  'Béchar','Blida','Bouira','Tamanrasset','Tébessa','Tlemcen','Tiaret',
  'Tizi Ouzou','Alger','Djelfa','Jijel','Sétif','Saïda','Skikda',
  'Sidi Bel Abbès','Annaba','Guelma','Constantine','Médéa','Mostaganem',
  "M'Sila",'Mascara','Ouargla','Oran','El Bayadh','Illizi','Bordj Bou Arréridj',
  'Boumerdès','El Tarf','Tindouf','Tissemsilt','El Oued','Khenchela','Souk Ahras',
  'Tipaza','Mila','Aïn Defla','Naâma','Aïn Témouchent','Ghardaïa','Relizane',
]

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get('role') === 'barber_owner' ? 'barber_owner' : 'client'

  const [role, setRole] = useState<'client' | 'barber_owner'>(defaultRole)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const r = searchParams.get('role')
    if (r === 'barber_owner') setRole('barber_owner')
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set('role', role)
    startTransition(async () => {
      const result = await registerAction(formData)
      if (result?.error) setError(result.error)
    })
  }

  const isBarber = role === 'barber_owner'

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div className="auth-logo">
          Hass<span>anly</span>
          <div className="auth-logo-sub">الجزائر · Algeria</div>
        </div>

        {/* Role toggle */}
        <div className="role-toggle">
          <button type="button" className={`role-btn ${!isBarber ? 'active' : ''}`} onClick={() => setRole('client')}>
            👤 Je suis client
          </button>
          <button type="button" className={`role-btn ${isBarber ? 'active' : ''}`} onClick={() => setRole('barber_owner')}>
            ✂️ Je suis coiffeur
          </button>
        </div>

        <h1 className="auth-title">{isBarber ? 'Inscrire mon salon' : 'Créer un compte'}</h1>
        <p className="auth-subtitle">
          {isBarber
            ? 'Rejoignez Hassanly et recevez des réservations en ligne. Activation sous 24h.'
            : 'Trouvez et réservez le meilleur coiffeur près de chez vous.'}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="form-row">
            <div className="form-group">
              <label>Prénom & Nom</label>
              <input name="fullName" type="text" placeholder="Mohamed Amrani" required />
            </div>
            <div className="form-group">
              <label>Téléphone</label>
              <input name="phone" type="tel" placeholder="0550 000 000" />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" placeholder="vous@exemple.com" required autoComplete="email" />
          </div>

          <div className="form-group">
            <label>Wilaya</label>
            <select name="wilaya" required>
              <option value="">Choisir votre wilaya…</option>
              {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input name="password" type="password" placeholder="8 caractères minimum" required minLength={8} autoComplete="new-password" />
          </div>

          {isBarber && (
            <div className="auth-info-box">
              ✂️ Après inscription, vous configurerez votre salon en quelques minutes.
            </div>
          )}

          <button type="submit" className="auth-btn" disabled={isPending}>
            {isPending
              ? <span className="btn-loading"><span className="spinner" />Création…</span>
              : isBarber ? 'Inscrire mon salon →' : 'Créer mon compte →'
            }
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: '1.25rem' }}>
          Déjà un compte ?{' '}
          <Link href="/auth/login">Se connecter</Link>
        </div>
      </div>
    </div>
  )
}

