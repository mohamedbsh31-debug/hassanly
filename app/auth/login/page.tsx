'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { loginAction } from '@/lib/auth-actions'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await loginAction(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          Hass<span>anly</span>
          <div className="auth-logo-sub">الجزائر · Algeria</div>
        </div>

        <h1 className="auth-title">Bon retour</h1>
        <p className="auth-subtitle">Connectez-vous à votre espace.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" placeholder="vous@exemple.com" required autoComplete="email" />
          </div>

          <div className="form-group">
            <label>
              Mot de passe
              <Link href="/auth/forgot" className="forgot-link">Oublié ?</Link>
            </label>
            <input name="password" type="password" placeholder="••••••••" required autoComplete="current-password" />
          </div>

          <button type="submit" className="auth-btn" disabled={isPending}>
            {isPending
              ? <span className="btn-loading"><span className="spinner" />Connexion…</span>
              : 'Se connecter →'
            }
          </button>
        </form>

        <div className="auth-divider">ou</div>

        <div className="auth-footer">
          Pas encore de compte ?{' '}
          <Link href="/auth/register">Créer un compte</Link>
        </div>
        <div className="auth-footer" style={{ marginTop: '0.5rem' }}>
          Vous êtes coiffeur ?{' '}
          <Link href="/auth/register?role=barber_owner" style={{ color: '#d97706', fontWeight: 600 }}>Inscrire mon salon →</Link>
        </div>
      </div>
    </div>
  )
}

