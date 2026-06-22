import { type FormEvent, useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import type { Course, CourseInput } from '../types/course'

type CourseFormModalProps = {
  open: boolean
  title: string
  submitLabel: string
  initial?: Course | null
  submitting: boolean
  onClose: () => void
  onSubmit: (input: CourseInput) => Promise<void>
}

const emptyForm: CourseInput = {
  title: '',
  courseCode: '',
  semester: '',
  instructor: '',
}

const inputClass =
  'w-full rounded-lg border border-white/10 bg-accent px-3 py-2.5 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'

export function CourseFormModal({
  open,
  title,
  submitLabel,
  initial,
  submitting,
  onClose,
  onSubmit,
}: CourseFormModalProps) {
  const { t } = useLanguage()
  const [form, setForm] = useState<CourseInput>(emptyForm)

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              title: initial.title,
              courseCode: initial.courseCode,
              semester: initial.semester,
              instructor: initial.instructor ?? '',
            }
          : emptyForm,
      )
    }
  }, [open, initial])

  if (!open) {
    return null
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    await onSubmit({
      title: form.title.trim(),
      courseCode: form.courseCode.trim(),
      semester: form.semester.trim(),
      instructor: (form.instructor ?? '').trim() || undefined,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="course-form-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-muted shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
          <h2 id="course-form-title" className="text-lg font-semibold text-foreground">
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
          <div>
            <label htmlFor="course-title" className="mb-1.5 block text-sm font-medium text-slate-300">
              {t('courses.courseTitle')}
            </label>
            <input
              id="course-title"
              required
              maxLength={200}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className={inputClass}
              placeholder="Enterprise Web Development"
            />
          </div>
          <div>
            <label htmlFor="course-code" className="mb-1.5 block text-sm font-medium text-slate-300">
              {t('courses.courseCode')}
            </label>
            <input
              id="course-code"
              required
              maxLength={50}
              value={form.courseCode}
              onChange={(e) => setForm((f) => ({ ...f, courseCode: e.target.value }))}
              className={inputClass}
              placeholder="EWD"
            />
          </div>
          <div>
            <label htmlFor="course-semester" className="mb-1.5 block text-sm font-medium text-slate-300">
              {t('courses.semester')}
            </label>
            <input
              id="course-semester"
              required
              maxLength={50}
              value={form.semester}
              onChange={(e) => setForm((f) => ({ ...f, semester: e.target.value }))}
              className={inputClass}
              placeholder="SS 2026"
            />
          </div>
          <div>
            <label htmlFor="course-instructor" className="mb-1.5 block text-sm font-medium text-slate-300">
              {t('courses.instructor')}{' '}
              <span className="font-normal text-muted-foreground">
                ({t('common.optional')})
              </span>
            </label>
            <input
              id="course-instructor"
              maxLength={200}
              value={form.instructor}
              onChange={(e) => setForm((f) => ({ ...f, instructor: e.target.value }))}
              className={inputClass}
              placeholder="Prof. von Klinski"
            />
          </div>

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
              disabled={submitting}
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
