import { type FormEvent, useState } from 'react'
import { X } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import type { Course } from '../types/course'
import type { DocumentUploadInput } from '../types/document'

type DocumentUploadModalProps = {
  open: boolean
  courses: Course[]
  submitting: boolean
  onClose: () => void
  onSubmit: (input: DocumentUploadInput) => Promise<void>
}

const inputClass =
  'w-full rounded-lg border border-white/10 bg-accent px-3 py-2.5 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'

export function DocumentUploadModal({
  open,
  courses,
  submitting,
  onClose,
  onSubmit,
}: DocumentUploadModalProps) {
  const { t } = useLanguage()
  const [courseId, setCourseId] = useState('')
  const [title, setTitle] = useState('')
  const [originalLanguage, setOriginalLanguage] = useState('German')
  const [file, setFile] = useState<File | null>(null)

  if (!open) {
    return null
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!file) return
    await onSubmit({
      courseId: Number(courseId),
      title: title.trim(),
      originalLanguage: originalLanguage.trim(),
      file,
    })
    setCourseId('')
    setTitle('')
    setOriginalLanguage('German')
    setFile(null)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="document-upload-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-muted shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
          <h2 id="document-upload-title" className="text-lg font-semibold text-foreground">
            {t('documents.upload')}
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
              {t('documents.addCourseFirst')}
            </p>
          ) : (
            <>
              <div>
                <label htmlFor="document-course" className="mb-1.5 block text-sm font-medium text-slate-300">
                  {t('common.course')}
                </label>
                <select
                  id="document-course"
                  required
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className={inputClass}
                >
                  <option value="" disabled>
                    {t('common.selectCourse')}
                  </option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.courseCode} - {course.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="document-title" className="mb-1.5 block text-sm font-medium text-slate-300">
                  {t('assignments.titleField')}
                </label>
                <input
                  id="document-title"
                  required
                  maxLength={200}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputClass}
                  placeholder={t('documents.filePlaceholder')}
                />
              </div>
              <div>
                <label htmlFor="document-language" className="mb-1.5 block text-sm font-medium text-slate-300">
                  {t('documents.originalLanguage')}
                </label>
                <input
                  id="document-language"
                  required
                  maxLength={100}
                  value={originalLanguage}
                  onChange={(e) => setOriginalLanguage(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="document-file" className="mb-1.5 block text-sm font-medium text-slate-300">
                  {t('documents.file')}
                </label>
                <input
                  id="document-file"
                  required
                  type="file"
                  accept=".pdf,.txt,text/plain,application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
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
              {submitting ? t('documents.uploading') : t('common.upload')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
