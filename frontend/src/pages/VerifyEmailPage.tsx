import { useEffect, useState } from 'react'
import { CheckCircle2, MailCheck, XCircle } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import * as authApi from '../api/authApi'
import { getErrorMessage } from '../api/errors'
import { useLanguage } from '../context/LanguageContext'
import { Spinner } from '../components/Spinner'
import heroImage from '../assets/hero.png'

type VerifyState = 'loading' | 'success' | 'error'

export function VerifyEmailPage() {
  const { t } = useLanguage()
  const [params] = useSearchParams()
  const [state, setState] = useState<VerifyState>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = params.get('token')
    if (!token) {
      setState('error')
      setMessage(t('verifyEmail.missingToken'))
      return
    }
    const verificationToken = token

    let cancelled = false

    async function verify() {
      try {
        await authApi.verifyEmail(verificationToken)
        if (!cancelled) {
          setState('success')
          setMessage(t('verifyEmail.successCopy'))
        }
      } catch (err) {
        if (!cancelled) {
          setState('error')
          setMessage(getErrorMessage(err))
        }
      }
    }

    void verify()

    return () => {
      cancelled = true
    }
  }, [params, t])

  return (
    <div className="auth-page relative min-h-screen overflow-hidden bg-[#10131f] text-white">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25"
        style={{ backgroundImage: `url(${heroImage})` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(16,19,31,0.98),rgba(16,19,31,0.86)_52%,rgba(22,78,99,0.56))]" />

      <main className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10">
        <div className="w-full max-w-md rounded-2xl border border-white/12 bg-[#141728]/90 p-8 text-center shadow-2xl shadow-black/50 backdrop-blur-xl">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/20 shadow-lg shadow-primary/10">
            {state === 'loading' ? (
              <MailCheck className="h-6 w-6 text-primary" />
            ) : state === 'success' ? (
              <CheckCircle2 className="h-6 w-6 text-emerald-300" />
            ) : (
              <XCircle className="h-6 w-6 text-destructive" />
            )}
          </div>
          <h1 className="text-3xl font-semibold text-foreground">
            {state === 'success'
              ? t('verifyEmail.successTitle')
              : state === 'error'
                ? t('verifyEmail.errorTitle')
                : t('verifyEmail.loadingTitle')}
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {state === 'loading' ? t('verifyEmail.loadingCopy') : message}
          </p>
          {state === 'loading' ? (
            <div className="mt-6">
              <Spinner label={t('verifyEmail.loadingSpinner')} />
            </div>
          ) : (
            <Link
              to="/login"
              className="mt-7 inline-flex w-full items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-xl shadow-primary/20 transition hover:-translate-y-0.5 hover:opacity-90"
            >
              {t('common.signIn')}
            </Link>
          )}
        </div>
      </main>
    </div>
  )
}
