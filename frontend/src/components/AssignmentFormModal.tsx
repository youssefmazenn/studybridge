import { type FormEvent, useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import type { Assignment, AssignmentInput } from '../types/assignment'
import type { Course } from '../types/course'

type AssignmentFormModalProps = {
  open: boolean
  title: string
  submitLabel: string
  courses: Course[]
  initial?: Assignment | null
  submitting: boolean
  onClose: () => void
  onSubmit: (input: AssignmentInput) => Promise<void>
}

const emptyForm = {
  courseId: '',
  title: '',
  description: '',
  dueDate: '',
}

export function AssignmentFormModal({
  open,
  title,
  submitLabel,
  courses,
  initial,
  submitting,
  onClose,
  onSubmit,
}: AssignmentFormModalProps) {
  const { t } = useLanguage()
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              courseId: String(initial.courseId),
              title: initial.title,
              description: initial.description ?? '',
              dueDate: initial.dueDate,
            }
          : {
              ...emptyForm,
              courseId: courses.length === 1 ? String(courses[0].id) : '',
            },
      )
    }
  }, [open, initial, courses])

  if (!open) {
    return null
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    await onSubmit({
      courseId: Number(form.courseId),
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      dueDate: form.dueDate,
    })
  }

  const inputClass =
    'w-full rounded-lg border border-white/10 bg-accent px-3 py-2.5 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="assignment-form-title"
    >
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-muted shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
          <h2 id="assignment-form-title" className="text-lg font-semibold text-foreground">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent"
            aria-label={t('common.close')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 px-6 py-5">
          {courses.length === 0 ? (
            <p className="text-sm text-destructive">
              {t('assignments.addCourseFirst')}
            </p>
          ) : (
            <>
              <div>
                <label htmlFor="assignment-course" className="mb-1.5 block text-sm font-medium text-slate-300">
                  {t('common.course')}
                </label>
                <select
                  id="assignment-course"
                  required
                  value={form.courseId}
                  onChange={(e) => setForm((f) => ({ ...f, courseId: e.target.value }))}
                  className={inputClass}
                >
                  <option value="" disabled>
                    {t('common.selectCourse')}
                  </option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.courseCode} — {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="assignment-title" className="mb-1.5 block text-sm font-medium text-slate-300">
                  {t('assignments.titleField')}
                </label>
                <input
                  id="assignment-title"
                  required
                  maxLength={200}
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  htmlFor="assignment-description"
                  className="mb-1.5 block text-sm font-medium text-slate-300"
                >
                  {t('assignments.descriptionField')}{' '}
                  <span className="font-normal text-muted-foreground">
                    ({t('common.optional')})
                  </span>
                </label>
                <textarea
                  id="assignment-description"
                  rows={3}
                  maxLength={5000}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="assignment-due" className="mb-1.5 block text-sm font-medium text-slate-300">
                  {t('assignments.dueDate')}
                </label>
                <input
                  id="assignment-due"
                  type="date"
                  required
                  value={form.dueDate}
                  onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                  className={inputClass}
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent disabled:opacity-50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting || courses.length === 0}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? t('courses.saving') : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
