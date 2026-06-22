import { type FormEvent, useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Lock,
  Mail,
} from 'lucide-react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../api/errors'
import { ErrorAlert } from '../components/ErrorAlert'
import { Spinner } from '../components/Spinner'
import { ThemeToggle } from '../components/ThemeToggle'
import heroImage from '../assets/hero.png'

const activity = [
  ['Translation saved', 'Database lecture notes'],
  ['Reminder queued', 'Milestone report at 18:00'],
  ['Calendar synced', '3 assignments this week'],
]

const inputClass =
  'w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-foreground outline-none ring-cyan-500/25 transition focus:border-primary focus:ring-2 placeholder:text-muted-foreground'

export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } } | null)?.from
    ?.pathname
  const justRegistered = Boolean(
    (location.state as { registered?: boolean } | null)?.registered,
  )

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from ?? '/dashboard', { replace: true })
    }
  }, [isAuthenticated, from, navigate])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email.trim(), password)
      navigate(from ?? '/dashboard', { replace: true })
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
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(16,19,31,0.98),rgba(16,19,31,0.86)_52%,rgba(22,78,99,0.56))]" />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.02fr_0.98fr]">
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
            <ThemeToggle className="theme-hero-toggle border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white" />
          </div>

          <div className="landing-fade-up max-w-2xl pb-10">
            <p className="text-sm font-bold uppercase text-cyan-300">
              Welcome back
            </p>
            <h1 className="mt-5 text-5xl font-semibold leading-tight">
              Return to your semester command center.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">
              Pick up your documents, translations, reminders, and course progress
              exactly where you left them.
            </p>

            <div className="mt-9 w-full max-w-md rounded-2xl border border-white/15 bg-white/10 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold">Workspace pulse</p>
                <CalendarDays className="h-4 w-4 text-cyan-300" />
              </div>
              <div className="space-y-3">
                {activity.map(([title, subtitle]) => (
                  <div
                    key={title}
                    className="flex items-center gap-3 rounded-xl bg-white/10 p-3"
                  >
                    <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                    <div>
                      <p className="text-sm font-semibold text-white">{title}</p>
                      <p className="text-xs text-slate-300">{subtitle}</p>
                    </div>
                  </div>
                ))}
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
            <ThemeToggle className="theme-hero-toggle mb-4 border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white lg:hidden" />

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
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm font-bold uppercase text-cyan-400">
                  Secure access
                </p>
                <h1 className="mt-2 text-3xl font-semibold text-foreground">
                  Sign in
                </h1>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Access your student dashboard and continue your workflow.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {justRegistered ? (
                  <div
                    className="rounded-lg border border-emerald-700/40 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-300"
                    role="status"
                  >
                    Registration successful. You can sign in now.
                  </div>
                ) : null}
                <ErrorAlert message={error} />

                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-sm font-semibold text-slate-300"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      id="email"
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
                    htmlFor="password"
                    className="mb-1.5 block text-sm font-semibold text-slate-300"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={inputClass}
                      placeholder="Password"
                    />
                  </div>
                </div>

                {submitting ? (
                  <Spinner label="Signing you in…" />
                ) : (
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-xl shadow-primary/20 transition hover:-translate-y-0.5 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-transparent"
                  >
                    Sign in
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </form>

              <p className="mt-8 text-center text-sm text-muted-foreground">
                No account?{' '}
                <Link
                  to="/register"
                  className="font-bold text-cyan-400 hover:text-cyan-300"
                >
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
