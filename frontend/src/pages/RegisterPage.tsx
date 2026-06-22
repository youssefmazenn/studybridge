import { type FormEvent, useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BellRing,
  CheckCircle2,
  Languages,
  Lock,
  Mail,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { getErrorMessage } from '../api/errors'
import { ErrorAlert } from '../components/ErrorAlert'
import { LanguageSelect } from '../components/LanguageSelect'
import { Spinner } from '../components/Spinner'
import { ThemeToggle } from '../components/ThemeToggle'
import heroImage from '../assets/hero.png'
import type { Language } from '../i18n/translations'

const inputClass =
  'w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-foreground outline-none ring-cyan-500/25 transition focus:border-primary focus:ring-2 placeholder:text-muted-foreground'

export function RegisterPage() {
  const { register, isAuthenticated } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const benefits = [
    t('register.benefitWorkspace'),
    t('register.benefitTranslation'),
    t('register.benefitCalendar'),
  ]

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        preferredLanguage: language === 'de' ? 'German' : 'English',
      })
      navigate('/login', { replace: true, state: { registered: true } })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#10131f] text-white">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25"
        style={{ backgroundImage: `url(${heroImage})` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(16,19,31,0.98),rgba(16,19,31,0.84)_48%,rgba(88,28,135,0.45))]" />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[0.96fr_1.04fr]">
        <section className="hidden min-h-screen flex-col justify-between px-10 py-8 lg:flex">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex w-fit items-center gap-3">
              <img
                src="/logo.png"
                alt="StudyBridge logo"
                className="h-10 w-10 rounded-lg object-cover shadow-lg shadow-cyan-950/30"
              />
              <span className="text-lg font-semibold">StudyBridge</span>
            </Link>
            <div className="flex items-center gap-2">
              <LanguageSelect compact className="theme-hero-toggle border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white" />
              <ThemeToggle className="theme-hero-toggle border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white" />
            </div>
          </div>

          <div className="landing-fade-up max-w-2xl pb-10">
            <div className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold text-violet-200 backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-amber-300" />
              {t('register.heroBadge')}
            </div>
            <h1 className="mt-6 text-5xl font-semibold leading-tight">
              {t('register.heroTitle')}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">
              {t('register.heroCopy')}
            </p>

            <div className="mt-9 grid max-w-xl gap-3">
              {benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-center gap-3 rounded-xl border border-white/12 bg-white/10 p-4 shadow-xl shadow-black/15 backdrop-blur-xl"
                >
                  <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                  <p className="text-sm font-semibold text-slate-100">{benefit}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex max-w-md gap-3">
              <div className="rounded-xl bg-white/10 p-4 backdrop-blur-xl">
                <Languages className="h-5 w-5 text-violet-300" />
                <p className="mt-3 text-sm font-semibold">
                  {t('register.multilingualNotes')}
                </p>
              </div>
              <div className="rounded-xl bg-white/10 p-4 backdrop-blur-xl">
                <BellRing className="h-5 w-5 text-cyan-300" />
                <p className="mt-3 text-sm font-semibold">
                  {t('register.smartReminders')}
                </p>
              </div>
            </div>
          </div>
        </section>

        <main className="flex min-h-screen items-center justify-center px-5 py-10 md:px-8">
          <div className="landing-fade-up w-full max-w-md">
            <Link
              to="/"
              className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-white lg:hidden"
            >
              <ArrowLeft className="h-4 w-4" />
              StudyBridge
            </Link>
            <div className="mb-4 flex gap-2 lg:hidden">
              <LanguageSelect compact className="theme-hero-toggle border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white" />
              <ThemeToggle className="theme-hero-toggle border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white" />
            </div>

            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <img
                src="/logo.png"
                alt="StudyBridge logo"
                className="h-12 w-12 rounded-xl object-cover shadow-lg shadow-cyan-950/30"
              />
              <span className="text-xl font-semibold text-white">StudyBridge</span>
            </div>

            <div className="rounded-2xl border border-white/12 bg-[#141728]/90 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-8">
              <div className="mb-8">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 shadow-lg shadow-primary/10">
                  <UserRound className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm font-bold uppercase text-cyan-400">
                  {t('register.newWorkspace')}
                </p>
                <h1 className="mt-2 text-3xl font-semibold text-foreground">
                  {t('register.title')}
                </h1>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {t('register.description')}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <ErrorAlert message={error} />

                <div>
                  <label
                    htmlFor="name"
                    className="mb-1.5 block text-sm font-semibold text-slate-300"
                  >
                    {t('register.fullName')}
                  </label>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputClass}
                      placeholder="Youssef Mazen"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="reg-email"
                    className="mb-1.5 block text-sm font-semibold text-slate-300"
                  >
                    {t('common.email')}
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      id="reg-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                      placeholder="you@university.edu"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="reg-password"
                    className="mb-1.5 block text-sm font-semibold text-slate-300"
                  >
                    {t('auth.password')}
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      id="reg-password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={inputClass}
                      placeholder={t('register.passwordPlaceholder')}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="preferredLanguage"
                    className="mb-1.5 block text-sm font-semibold text-slate-300"
                  >
                    {t('register.preferredLanguage')}
                  </label>
                  <div className="relative">
                    <Languages className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <select
                      id="preferredLanguage"
                      name="preferredLanguage"
                      required
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as Language)}
                      className={inputClass}
                    >
                      <option value="en">{t('language.english')}</option>
                      <option value="de">{t('language.german')}</option>
                    </select>
                  </div>
                </div>

                {submitting ? (
                  <Spinner label={t('register.creating')} />
                ) : (
                  <button
                    type="submit"
                    className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-xl shadow-primary/20 transition hover:-translate-y-0.5 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-transparent"
                  >
                    {t('common.register')}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </form>

              <p className="mt-8 text-center text-sm text-muted-foreground">
                {t('register.alreadyHaveAccount')}{' '}
                <Link
                  to="/login"
                  className="font-bold text-cyan-400 hover:text-cyan-300"
                >
                  {t('common.signIn')}
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
