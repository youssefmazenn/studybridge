import {
  ArrowRight,
  BellRing,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  FileText,
  Languages,
  Lock,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import heroImage from '../assets/hero.png'

const features = [
  {
    icon: FileText,
    title: 'Course documents',
    copy: 'Upload notes and PDFs, then keep every file attached to the course it belongs to.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-950/60',
  },
  {
    icon: Languages,
    title: 'Translation workspace',
    copy: 'Turn extracted document text into another language and keep the result beside the original.',
    color: 'text-violet-400',
    bg: 'bg-violet-950/60',
  },
  {
    icon: BellRing,
    title: 'Reminder engine',
    copy: 'Track deadlines and let StudyBridge send email reminders when work needs attention.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-950/60',
  },
]

const timeline = [
  { label: 'Upload lecture notes', meta: 'EWD', status: 'Complete' },
  { label: 'Translate database chapter', meta: 'DBS', status: 'In progress' },
  { label: 'Submit milestone report', meta: 'EWD', status: 'Due today' },
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0d0f1a] text-foreground">
      <section className="relative isolate overflow-hidden bg-[#10131f] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35"
          style={{ backgroundImage: `url(${heroImage})` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(16,19,31,0.98),rgba(16,19,31,0.72)_48%,rgba(37,75,98,0.64))]" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,rgba(13,15,26,0),#0d0f1a)]" />

        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="StudyBridge logo"
              className="h-10 w-10 rounded-lg object-cover shadow-lg shadow-cyan-950/30"
            />
            <span className="text-lg font-semibold">StudyBridge</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-cyan-950/25 transition hover:-translate-y-0.5 hover:opacity-90"
            >
              Start
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </header>

        <div className="relative z-10 mx-auto grid min-h-[calc(100svh-72px)] max-w-7xl items-center gap-12 px-5 pb-20 pt-10 md:grid-cols-[1fr_0.92fr] md:px-8 md:pb-24">
          <div className="landing-fade-up max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm font-medium text-cyan-100 shadow-xl shadow-cyan-950/20 backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-amber-200" />
              Built for multilingual, deadline-heavy semesters
            </div>
            <h1 className="mt-7 max-w-3xl text-5xl font-semibold leading-[1.02] text-white md:text-7xl">
              StudyBridge
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200 md:text-xl">
              A premium workspace for course documents, translation, assignments,
              calendar planning, and reminder emails in one focused academic flow.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-300 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-2xl shadow-cyan-950/40 transition hover:-translate-y-0.5 hover:bg-cyan-200"
              >
                Create workspace
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/15"
              >
                Open account
              </Link>
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3 text-sm text-slate-300">
              <div>
                <p className="text-2xl font-semibold text-white">4</p>
                <p className="mt-1">core modules</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-white">24h</p>
                <p className="mt-1">JWT sessions</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-white">SMTP</p>
                <p className="mt-1">reminders</p>
              </div>
            </div>
          </div>

          <div className="landing-fade-up landing-fade-up-delay relative min-h-[520px]">
            <div className="landing-float absolute left-2 top-4 w-[88%] overflow-hidden rounded-2xl border border-white/16 bg-white/12 shadow-2xl shadow-black/35 backdrop-blur-xl md:left-0">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-cyan-100">
                    Semester cockpit
                  </p>
                  <p className="mt-1 text-lg font-semibold">Enterprise Web Development</p>
                </div>
                <span className="rounded-lg bg-emerald-300 px-3 py-1 text-xs font-bold text-emerald-950">
                  Live
                </span>
              </div>

              <div className="grid gap-4 p-5">
                <div className="grid grid-cols-3 gap-3">
                  {['Docs', 'Tasks', 'Alerts'].map((item, index) => (
                    <div
                      key={item}
                      className="rounded-xl border border-white/10 bg-white/10 p-3"
                    >
                      <p className="text-xs text-slate-300">{item}</p>
                      <p className="mt-2 text-2xl font-semibold">
                        {[12, 7, 3][index]}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl bg-slate-950/45 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold">Document intelligence</p>
                    <Languages className="h-4 w-4 text-violet-200" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-2.5 w-full rounded-full bg-white/10">
                      <div className="landing-line h-2.5 rounded-full bg-cyan-300" />
                    </div>
                    <div className="h-2.5 w-4/5 rounded-full bg-white/10">
                      <div className="landing-line landing-line-delay h-2.5 rounded-full bg-violet-300" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {timeline.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 p-3"
                    >
                      <CheckCircle2 className="h-5 w-5 text-emerald-200" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{item.label}</p>
                        <p className="text-xs text-slate-300">{item.meta}</p>
                      </div>
                      <span className="rounded-md bg-white/10 px-2.5 py-1 text-xs text-slate-200">
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="landing-float-alt absolute bottom-4 right-0 w-[68%] rounded-2xl border border-white/15 bg-white/8 p-5 text-white shadow-2xl shadow-black/50 backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Today
                  </p>
                  <p className="mt-1 text-lg font-semibold">Deadline rhythm</p>
                </div>
                <CalendarDays className="h-5 w-5 text-rose-400" />
              </div>
              <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-semibold text-slate-400">
                {Array.from({ length: 21 }, (_, index) => (
                  <span
                    key={index}
                    className={[
                      'flex aspect-square items-center justify-center rounded-md',
                      index === 10
                        ? 'bg-rose-500 text-white'
                        : index === 15
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-white/10 text-slate-400',
                    ].join(' ')}
                  >
                    {index + 1}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-20 mx-auto -mt-8 grid max-w-7xl gap-4 px-5 pb-14 md:grid-cols-3 md:px-8">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <div
              key={feature.title}
              className="landing-rise rounded-xl border border-white/8 bg-[#141728] p-6 shadow-xl shadow-black/30 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50"
            >
              <span
                className={`inline-flex h-11 w-11 items-center justify-center rounded-lg ${feature.bg}`}
              >
                <Icon className={`h-5 w-5 ${feature.color}`} />
              </span>
              <h2 className="mt-5 text-lg font-semibold text-foreground">
                {feature.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{feature.copy}</p>
            </div>
          )
        })}
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-20 md:grid-cols-[0.85fr_1fr] md:px-8">
        <div className="self-center">
          <p className="text-sm font-bold uppercase text-cyan-400">Built for focus</p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight text-foreground md:text-5xl">
            Everything a semester generates, organized before it becomes noise.
          </h2>
          <p className="mt-5 text-base leading-8 text-muted-foreground">
            StudyBridge turns scattered files, due dates, and language barriers into
            a single workflow that feels calm even when the semester does not.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ['Secure by default', 'JWT stays out of localStorage and API access is user-scoped.', Lock],
            ['Real persistence', 'Production profile is ready for PostgreSQL deployments.', BookOpen],
            ['Email reminders', 'Due reminders can trigger SMTP delivery on a schedule.', BellRing],
            ['Calendar clarity', 'Assignments become a month view with clear daily context.', CalendarDays],
          ].map(([title, copy, Icon]) => (
            <div
              key={title as string}
              className="rounded-xl border border-white/8 bg-[#141728] p-5"
            >
              <Icon className="h-5 w-5 text-primary" />
              <h3 className="mt-4 font-semibold text-foreground">{title as string}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy as string}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-white/8 bg-[#0b0d19] px-5 py-8 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase text-muted-foreground">Ready when you are</p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">
              Build your semester command center.
            </h2>
          </div>
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:-translate-y-0.5 hover:opacity-90"
          >
            Get started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
