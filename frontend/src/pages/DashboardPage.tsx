import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, BookOpen, Calendar, Clock, FileText } from 'lucide-react'
import * as assignmentApi from '../api/assignmentApi'
import * as courseApi from '../api/courseApi'
import * as documentApi from '../api/documentApi'
import * as reminderApi from '../api/reminderApi'
import { getErrorMessage } from '../api/errors'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/Card'
import { Calendar as CalendarComponent } from '../components/Calendar'
import { ErrorAlert } from '../components/ErrorAlert'
import { Spinner } from '../components/Spinner'
import type { Assignment } from '../types/assignment'
import type { Reminder } from '../types/reminder'
import { REMINDER_TYPE_LABELS } from '../utils/reminderPresets'
import type { DashboardDeadline } from '../types/dashboard'
import type { Course } from '../types/course'
import type { StudyDocument } from '../types/document'

function toDashboardDeadline(assignment: Assignment): DashboardDeadline {
  return {
    id: assignment.id,
    title: assignment.title,
    course: assignment.courseCode,
    dueDate: assignment.dueDate,
    status: assignment.status === 'PENDING' ? 'pending' : 'completed',
  }
}

function getDaysUntil(dateString: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueDate = new Date(dateString + 'T00:00:00')
  return Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function formatDaysUntil(daysUntil: number): string {
  if (daysUntil < 0) return 'Overdue'
  if (daysUntil === 0) return 'Today'
  if (daysUntil === 1) return 'Tomorrow'
  return `${daysUntil} days`
}

export function DashboardPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [documents, setDocuments] = useState<StudyDocument[]>([])
  const [dueReminders, setDueReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const [courseList, assignmentList, documentList, remindersDue] = await Promise.all([
          courseApi.listCourses(),
          assignmentApi.listAssignments(),
          documentApi.listDocuments(),
          reminderApi.listReminders(true),
        ])
        if (!cancelled) {
          setCourses(courseList)
          setAssignments(assignmentList)
          setDocuments(documentList)
          setDueReminders(remindersDue)
        }
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

  const calendarAssignments = useMemo(
    () => assignments.map(toDashboardDeadline),
    [assignments],
  )

  const pendingDeadlines = useMemo(
    () =>
      assignments
        .filter((a) => a.status === 'PENDING')
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
        .slice(0, 5),
    [assignments],
  )

  const pendingCount = assignments.filter((a) => a.status === 'PENDING').length
  const completedCount = assignments.filter((a) => a.status === 'COMPLETED').length
  const dashboardCourses = courses.slice(0, 3)
  const recentDocuments = documents.slice(0, 4)

  async function dismissReminder(id: number) {
    try {
      await reminderApi.markReminderSent(id, true)
      setDueReminders((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Welcome back! Here&apos;s your study overview.
        </p>
      </div>

      <ErrorAlert message={error} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Courses</p>
              <p className="text-2xl font-semibold text-foreground">
                {loading ? '—' : courses.length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Documents</p>
              <p className="text-2xl font-semibold text-foreground">
                {loading ? '—' : documents.length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-950/50">
              <Clock className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Due Soon</p>
              <p className="text-2xl font-semibold text-foreground">
                {loading ? '—' : pendingCount}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-950/50">
              <Calendar className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-semibold text-foreground">
                {loading ? '—' : completedCount}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {!loading && dueReminders.length > 0 ? (
        <Card className="border-amber-700/40 bg-amber-950/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-400" />
              <CardTitle>Reminders due</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {dueReminders.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between gap-3 rounded-lg bg-accent p-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{r.assignmentTitle}</p>
                    <p className="text-sm text-muted-foreground">
                      {r.courseCode} · {REMINDER_TYPE_LABELS[r.reminderType]}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.remindAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void dismissReminder(r.id)}
                    className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
                  >
                    Dismiss
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Upcoming Deadlines</CardTitle>
              <Link
                to="/assignments"
                className="text-sm font-medium text-primary hover:underline"
              >
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Spinner label="Loading deadlines…" />
            ) : (
              <div className="space-y-3">
                {pendingDeadlines.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No upcoming deadlines.
                  </p>
                ) : (
                  pendingDeadlines.map((assignment) => {
                    const daysUntil = getDaysUntil(assignment.dueDate)
                    return (
                      <div
                        key={assignment.id}
                        className="flex items-center justify-between rounded-lg bg-accent p-4 transition-colors hover:bg-white/5"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-foreground">
                            {assignment.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {assignment.courseCode}
                          </p>
                        </div>
                        <p
                          className={`ml-3 shrink-0 text-sm ${
                            daysUntil <= 2 ? 'text-destructive' : 'text-muted-foreground'
                          }`}
                        >
                          {formatDaysUntil(daysUntil)}
                        </p>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Documents</CardTitle>
              <Link
                to="/documents"
                className="text-sm font-medium text-primary hover:underline"
              >
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Spinner label="Loading documents…" />
            ) : recentDocuments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents uploaded.</p>
            ) : (
              <div className="space-y-3">
                {recentDocuments.map((doc) => (
                  <Link
                    key={doc.id}
                    to={`/documents/${doc.id}`}
                    className="block rounded-lg bg-accent p-4 transition-colors hover:bg-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground">
                          {doc.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {doc.courseCode} · {new Date(doc.uploadDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Active Courses</CardTitle>
            <Link
              to="/courses"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Spinner label="Loading courses…" />
          ) : dashboardCourses.length === 0 ? (
            <div className="rounded-lg bg-accent p-6 text-center">
              <p className="text-sm text-muted-foreground">No courses yet.</p>
              <Link
                to="/courses"
                className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
              >
                Add your first course
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {dashboardCourses.map((course) => (
                <div key={course.id} className="rounded-lg bg-accent p-4">
                  <p className="text-xs font-semibold text-primary">{course.courseCode}</p>
                  <h4 className="mb-1 mt-1 font-medium text-foreground">{course.title}</h4>
                  {course.instructor ? (
                    <p className="text-sm text-muted-foreground">{course.instructor}</p>
                  ) : null}
                  <p className="text-xs text-muted-foreground">{course.semester}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Assignment Calendar
          </h2>
          <Link
            to="/calendar"
            className="text-sm font-medium text-primary hover:underline"
          >
            View full calendar
          </Link>
        </div>
        {loading ? (
          <Spinner label="Loading calendar…" />
        ) : (
          <CalendarComponent assignments={calendarAssignments} compact />
        )}
      </div>
    </div>
  )
}
