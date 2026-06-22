import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import type { DashboardDeadline } from '../types/dashboard'

type CalendarProps = {
  assignments: DashboardDeadline[]
  compact?: boolean
}

function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function Calendar({ assignments, compact = false }: CalendarProps) {
  const { locale } = useLanguage()
  const [viewDate, setViewDate] = useState(() => new Date())

  const dueDates = useMemo(() => {
    const set = new Set<string>()
    for (const a of assignments) {
      if (a.status === 'pending') {
        set.add(a.dueDate)
      }
    }
    return set
  }, [assignments])

  const { year, month, daysInMonth, startWeekday } = useMemo(() => {
    const y = viewDate.getFullYear()
    const m = viewDate.getMonth()
    const first = new Date(y, m, 1)
    const last = new Date(y, m + 1, 0)
    return {
      year: y,
      month: m,
      daysInMonth: last.getDate(),
      startWeekday: first.getDay(),
    }
  }, [viewDate])

  const monthLabel = viewDate.toLocaleDateString(locale, {
    month: 'long',
    year: 'numeric',
  })

  const weekdays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) =>
        new Date(2026, 5, index).toLocaleDateString(locale, {
          weekday: compact ? 'narrow' : 'short',
        }),
      ),
    [compact, locale],
  )

  function shiftMonth(delta: number) {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1))
  }

  const cells: (number | null)[] = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let day = 1; day <= daysInMonth; day++) cells.push(day)

  const todayKey = toDateKey(new Date())

  return (
    <div
      className={`rounded-xl border border-white/8 bg-muted shadow-sm ${compact ? 'p-4' : 'p-6'}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{monthLabel}</h3>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {weekdays.map((w, index) => (
          <div key={`${w}-${index}`} className="py-1 font-medium text-muted-foreground">
            {w}
          </div>
        ))}
        {cells.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />
          }
          const key = toDateKey(new Date(year, month, day))
          const hasDue = dueDates.has(key)
          const isToday = key === todayKey
          return (
            <div
              key={key}
              className={`relative flex aspect-square items-center justify-center rounded-lg text-sm ${
                isToday
                  ? 'bg-primary font-semibold text-primary-foreground'
                  : hasDue
                    ? 'bg-primary/15 font-medium text-primary'
                    : 'text-foreground'
              }`}
            >
              {day}
              {hasDue && !isToday ? (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" />
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
