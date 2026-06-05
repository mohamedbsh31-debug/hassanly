'use client'

import { useState, useTransition, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { loginAction, googleLoginAction } from '@/lib/auth-actions'
import { Logo } from '@/components/Logo'

function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isGooglePending, startGoogleTransition] = useTransition()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') ?? ''

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await loginAction(formData)
      if (result?.error) setError(result.error)
    })
  }

  function handleGoogle() {
    setError(null)
    startGoogleTransition(async () => {
      const result = await googleLoginAction(redirectTo || undefined)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <Logo height={52} />
          <div className="auth-logo-sub">الجزائر · Algeria</div>
        </div>

        <h1 className="auth-title">Bon retour</h1>
        <p className="auth-subtitle">Connectez-vous à votre espace.</p>

        {error && <div className="auth-error">{error}</div>}

        {/* Google button */}
        <button
          onClick={handleGoogle}
          disabled={isGooglePending || isPending}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '11px 16px',
            background: '#fff',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--r)',
            fontSize: '0.88rem',
            fontWeight: 600,
            fontFamily: 'var(--font-ui)',
            color: '#3c4043',
            cursor: isGooglePending || isPending ? 'not-allowed' : 'pointer',
            opacity: isGooglePending || isPending ? 0.7 : 1,
            transition: 'all 0.15s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}
          onMouseOver={e => { if (!isGooglePending) e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)' }}
          onMouseOut={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)' }}
        >
          {isGooglePending ? (
            <span className="btn-loading"><span className="spinner" />Redirection…</span>
          ) : (
            <>
              {/* Google SVG icon */}
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
              Continuer avec Google
            </>
          )}
        </button>

        <div className="auth-divider">ou</div>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Pass the redirect destination through the form */}
          <input type="hidden" name="redirect" value={redirectTo} />

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

          <button type="submit" className="auth-btn" disabled={isPending || isGooglePending}>
            {isPending
              ? <span className="btn-loading"><span className="spinner" />Connexion…</span>
              : 'Se connecter →'
            }
          </button>
        </form>

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

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
