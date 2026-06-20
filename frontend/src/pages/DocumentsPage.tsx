import { useCallback, useEffect, useMemo, useState } from 'react'
import { Download, FileText, Plus, Search, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import * as courseApi from '../api/courseApi'
import * as documentApi from '../api/documentApi'
import { getErrorMessage } from '../api/errors'
import { DocumentUploadModal } from '../components/DocumentUploadModal'
import { ErrorAlert } from '../components/ErrorAlert'
import { Spinner } from '../components/Spinner'
import type { Course } from '../types/course'
import type { DocumentUploadInput, StudyDocument } from '../types/document'

function formatFileSize(size: number): string {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function DocumentsPage() {
  const [documents, setDocuments] = useState<StudyDocument[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [error, setError] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [documentList, courseList] = await Promise.all([
        documentApi.listDocuments(),
        courseApi.listCourses(),
      ])
      setDocuments(documentList)
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
    const normalizedSearch = search.trim().toLowerCase()
    return documents.filter((doc) => {
      const matchesCourse = courseFilter === '' || doc.courseId === Number(courseFilter)
      const matchesSearch =
        normalizedSearch === '' ||
        doc.title.toLowerCase().includes(normalizedSearch) ||
        doc.originalFilename.toLowerCase().includes(normalizedSearch) ||
        doc.courseCode.toLowerCase().includes(normalizedSearch)
      return matchesCourse && matchesSearch
    })
  }, [documents, search, courseFilter])

  async function handleUpload(input: DocumentUploadInput) {
    setSubmitting(true)
    setError('')
    try {
      await documentApi.uploadDocument(input)
      setModalOpen(false)
      await loadData()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(document: StudyDocument) {
    if (!window.confirm(`Delete "${document.title}"?`)) return
    setError('')
    try {
      await documentApi.deleteDocument(document.id)
      await loadData()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function handleDownload(document: StudyDocument) {
    setError('')
    try {
      await documentApi.downloadDocument(document)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Documents</h1>
          <p className="mt-1 text-muted-foreground">
            Upload lecture material and connect it to your courses.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Upload document
        </button>
      </div>

      <ErrorAlert message={error} />

      <div className="grid gap-3 rounded-xl border border-white/8 bg-muted p-4 shadow-sm md:grid-cols-[1fr_240px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-accent py-2.5 pl-9 pr-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="Search documents"
          />
        </label>
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="rounded-lg border border-white/10 bg-accent px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="">All courses</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.courseCode}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Spinner label="Loading documents..." />
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 bg-muted p-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 font-medium text-foreground">No documents found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload a PDF or text file to start using document support.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((document) => (
            <article
              key={document.id}
              className="rounded-xl border border-white/8 bg-muted p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <Link to={`/documents/${document.id}`} className="min-w-0">
                  <span className="rounded-md bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                    {document.courseCode}
                  </span>
                  <h2 className="mt-3 text-lg font-semibold text-foreground hover:text-primary">
                    {document.title}
                  </h2>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {document.originalFilename}
                  </p>
                </Link>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => void handleDownload(document)}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                    aria-label={`Download ${document.title}`}
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(document)}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-red-950/40 hover:text-destructive"
                    aria-label={`Delete ${document.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Course</dt>
                  <dd className="font-medium text-foreground">{document.courseTitle}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Uploaded</dt>
                  <dd className="font-medium text-foreground">
                    {formatDate(document.uploadDate)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Language</dt>
                  <dd className="font-medium text-foreground">
                    {document.originalLanguage}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Size</dt>
                  <dd className="font-medium text-foreground">
                    {formatFileSize(document.fileSize)}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      )}

      <DocumentUploadModal
        open={modalOpen}
        courses={courses}
        submitting={submitting}
        onClose={() => {
          if (!submitting) setModalOpen(false)
        }}
        onSubmit={handleUpload}
      />
    </div>
  )
}
