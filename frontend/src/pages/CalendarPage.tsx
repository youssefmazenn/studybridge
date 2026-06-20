import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import * as assignmentApi from '../api/assignmentApi'
import { getErrorMessage } from '../api/errors'
import { ErrorAlert } from '../components/ErrorAlert'
import { Spinner } from '../components/Spinner'
import type { Assignment } from '../types/assignment'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDate(dateString: string): string {
  return new Date(dateString + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function CalendarPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [viewDate, setViewDate] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const list = await assignmentApi.listAssignments()
        if (!cancelled) setAssignments(list)
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

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

  const byDate = useMemo(() => {
    const map = new Map<string, Assignment[]>()
    for (const assignment of assignments) {
      const list = map.get(assignment.dueDate) ?? []
      list.push(assignment)
      map.set(assignment.dueDate, list)
    }
    return map
  }, [assignments])

  const selectedAssignments = byDate.get(selectedDate) ?? []
  const pendingCount = assignments.filter((a) => a.status === 'PENDING').length
  const completedCount = assignments.filter((a) => a.status === 'COMPLETED').length
  const monthLabel = viewDate.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })
  const todayKey = toDateKey(new Date())
  const cells: (number | null)[] = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let day = 1; day <= daysInMonth; day++) cells.push(day)

  function shiftMonth(delta: number) {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1))
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Calendar</h1>
        <p className="mt-1 text-muted-foreground">
          Review assignment deadlines across the month.
        </p>
      </div>

      <ErrorAlert message={error} />

      {loading ? (
        <Spinner label="Loading calendar..." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-white/8 bg-muted p-5 shadow-sm">
              <p className="text-sm text-muted-foreground">Total assignments</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {assignments.length}
              </p>
            </div>
            <div className="rounded-xl border border-white/8 bg-muted p-5 shadow-sm">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {pendingCount}
              </p>
            </div>
            <div className="rounded-xl border border-white/8 bg-muted p-5 shadow-sm">
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {completedCount}
              </p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
            <section className="rounded-xl border border-white/8 bg-muted p-4 shadow-sm md:p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">{monthLabel}</h2>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => shiftMonth(-1)}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => shiftMonth(1)}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                    aria-label="Next month"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center text-xs">
                {WEEKDAYS.map((weekday) => (
                  <div key={weekday} className="py-2 font-medium text-muted-foreground">
                    {weekday}
                  </div>
                ))}
                {cells.map((day, index) => {
                  if (day === null) {
                    return <div key={`empty-${index}`} className="min-h-20" />
                  }
                  const key = toDateKey(new Date(year, month, day))
                  const dayAssignments = byDate.get(key) ?? []
                  const hasPending = dayAssignments.some((a) => a.status === 'PENDING')
                  const isSelected = key === selectedDate
                  const isToday = key === todayKey
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedDate(key)}
                      className={`min-h-20 rounded-lg border p-2 text-left transition-colors ${
                        isSelected
                          ? 'border-primary/40 bg-primary/10'
                          : 'border-white/6 bg-accent hover:bg-white/5'
                      }`}
                    >
                      <span
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${
                          isToday ? 'bg-primary text-primary-foreground' : 'text-foreground'
                        }`}
                      >
                        {day}
                      </span>
                      {dayAssignments.length > 0 ? (
                        <div className="mt-2 space-y-1">
                          <span
                            className={`block h-1.5 rounded-full ${
                              hasPending ? 'bg-primary' : 'bg-emerald-500'
                            }`}
                          />
                          <p className="truncate text-xs text-muted-foreground">
                            {dayAssignments.length} due
                          </p>
                        </div>
                      ) : null}
                    </button>
                  )
                })}
              </div>
            </section>

            <aside className="rounded-xl border border-white/8 bg-muted p-5 shadow-sm">
              <h2 className="font-semibold text-foreground">
                {formatDate(selectedDate)}
              </h2>
              <div className="mt-4 space-y-3">
                {selectedAssignments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No assignments due on this day.
                  </p>
                ) : (
                  selectedAssignments.map((assignment) => (
                    <div key={assignment.id} className="rounded-lg bg-accent p-4">
                      <p className="font-medium text-foreground">{assignment.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {assignment.courseCode} · {assignment.courseTitle}
                      </p>
                      <span
                        className={`mt-3 inline-flex rounded-md px-2 py-1 text-xs font-semibold ${
                          assignment.status === 'COMPLETED'
                            ? 'bg-emerald-950/60 text-emerald-400'
                            : 'bg-primary/15 text-primary'
                        }`}
                      >
                        {assignment.status === 'COMPLETED' ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  )
}
