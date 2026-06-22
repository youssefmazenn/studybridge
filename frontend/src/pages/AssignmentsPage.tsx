import { useCallback, useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Circle, Pencil, Plus, Trash2 } from 'lucide-react'
import * as assignmentApi from '../api/assignmentApi'
import * as courseApi from '../api/courseApi'
import { getErrorMessage } from '../api/errors'
import { useLanguage } from '../context/LanguageContext'
import { AssignmentFormModal } from '../components/AssignmentFormModal'
import { AssignmentReminders } from '../components/AssignmentReminders'
import { ErrorAlert } from '../components/ErrorAlert'
import { Spinner } from '../components/Spinner'
import type { Assignment, AssignmentInput, AssignmentStatus } from '../types/assignment'
import type { Course } from '../types/course'

type Filter = 'all' | 'pending' | 'completed'

function formatDueDate(isoDate: string, locale: string): string {
  return new Date(isoDate + 'T00:00:00').toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function AssignmentsPage() {
  const { locale, t } = useLanguage()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Assignment | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [assignmentList, courseList] = await Promise.all([
        assignmentApi.listAssignments(),
        courseApi.listCourses(),
      ])
      setAssignments(assignmentList)
      setCourses(courseList)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const filtered = useMemo(() => {
    if (filter === 'pending') {
      return assignments.filter((a) => a.status === 'PENDING')
    }
    if (filter === 'completed') {
      return assignments.filter((a) => a.status === 'COMPLETED')
    }
    return assignments
  }, [assignments, filter])

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(assignment: Assignment) {
    setEditing(assignment)
    setModalOpen(true)
  }

  function closeModal() {
    if (!submitting) {
      setModalOpen(false)
      setEditing(null)
    }
  }

  async function handleSubmit(input: AssignmentInput) {
    setSubmitting(true)
    setError('')
    try {
      if (editing) {
        await assignmentApi.updateAssignment(editing.id, input)
      } else {
        await assignmentApi.createAssignment(input)
      }
      setModalOpen(false)
      setEditing(null)
      await loadData()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function toggleStatus(assignment: Assignment) {
    const next: AssignmentStatus =
      assignment.status === 'PENDING' ? 'COMPLETED' : 'PENDING'
    setError('')
    try {
      await assignmentApi.updateAssignmentStatus(assignment.id, next)
      await loadData()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function handleDelete(assignment: Assignment) {
    if (!window.confirm(t('assignments.deleteConfirm', { title: assignment.title }))) return
    setError('')
    try {
      await assignmentApi.deleteAssignment(assignment.id)
      await loadData()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const filterButtons: { key: Filter; label: string }[] = [
    { key: 'all', label: t('common.all') },
    { key: 'pending', label: t('common.pending') },
    { key: 'completed', label: t('common.completed') },
  ]

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t('assignments.title')}</h1>
          <p className="mt-1 text-muted-foreground">
            {t('assignments.description')}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          {t('assignments.add')}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {filterButtons.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground ring-1 ring-white/10 hover:bg-accent hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <ErrorAlert message={error} />

      {loading ? (
        <Spinner label={t('assignments.loading')} />
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 bg-muted p-12 text-center">
          <p className="font-medium text-foreground">{t('assignments.noFound')}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {filter === 'all'
              ? t('assignments.emptyAll')
              : t('assignments.emptyFiltered', { filter: t(`common.${filter}`) })}
          </p>
          {filter === 'all' ? (
            <button
              type="button"
              onClick={openCreate}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              <Plus className="h-4 w-4" />
              {t('assignments.add')}
            </button>
          ) : null}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((assignment) => (
            <article
              key={assignment.id}
              className={`rounded-xl border border-white/8 bg-muted p-5 shadow-sm ${
                assignment.status === 'COMPLETED' ? 'opacity-70' : ''
              }`}
            >
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => void toggleStatus(assignment)}
                  className="mt-0.5 shrink-0 text-primary hover:opacity-80"
                  aria-label={
                    assignment.status === 'PENDING'
                      ? t('assignments.markCompleted')
                      : t('assignments.markPending')
                  }
                >
                  {assignment.status === 'COMPLETED' ? (
                    <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                  ) : (
                    <Circle className="h-6 w-6 text-muted-foreground" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h2
                        className={`font-semibold text-foreground ${
                          assignment.status === 'COMPLETED' ? 'line-through' : ''
                        }`}
                      >
                        {assignment.title}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {assignment.courseCode} — {assignment.courseTitle}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(assignment)}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                        aria-label={t('common.edit')}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(assignment)}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-red-950/40 hover:text-destructive"
                        aria-label={t('common.delete')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {assignment.description ? (
                    <p className="mt-2 text-sm text-muted-foreground">{assignment.description}</p>
                  ) : null}
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {t('assignments.due', {
                      date: formatDueDate(assignment.dueDate, locale),
                    })}
                  </p>
                  <AssignmentReminders assignment={assignment} />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <AssignmentFormModal
        open={modalOpen}
        title={editing ? t('assignments.edit') : t('assignments.add')}
        submitLabel={editing ? t('common.saveChanges') : t('assignments.create')}
        courses={courses}
        initial={editing}
        submitting={submitting}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
