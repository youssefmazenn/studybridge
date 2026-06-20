import { useCallback, useEffect, useState } from 'react'
import { BookOpen, Pencil, Plus, Trash2 } from 'lucide-react'
import * as courseApi from '../api/courseApi'
import { getErrorMessage } from '../api/errors'
import { CourseFormModal } from '../components/CourseFormModal'
import { ErrorAlert } from '../components/ErrorAlert'
import { Spinner } from '../components/Spinner'
import type { Course, CourseInput } from '../types/course'

export function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Course | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const loadCourses = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const list = await courseApi.listCourses()
      setCourses(list)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadCourses()
  }, [loadCourses])

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(course: Course) {
    setEditing(course)
    setModalOpen(true)
  }

  function closeModal() {
    if (!submitting) {
      setModalOpen(false)
      setEditing(null)
    }
  }

  async function handleSubmit(input: CourseInput) {
    setSubmitting(true)
    setError('')
    try {
      if (editing) {
        await courseApi.updateCourse(editing.id, input)
      } else {
        await courseApi.createCourse(input)
      }
      setModalOpen(false)
      setEditing(null)
      await loadCourses()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(course: Course) {
    const confirmed = window.confirm(
      `Delete "${course.title}"? This cannot be undone.`,
    )
    if (!confirmed) return

    setError('')
    try {
      await courseApi.deleteCourse(course.id)
      await loadCourses()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Courses</h1>
          <p className="mt-1 text-muted-foreground">
            Organize your academic courses and related materials.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add course
        </button>
      </div>

      <ErrorAlert message={error} />

      {loading ? (
        <Spinner label="Loading courses…" />
      ) : courses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 bg-muted p-12 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 font-medium text-foreground">No courses yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add your first course to get started.
          </p>
          <button
            type="button"
            onClick={openCreate}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
            Add course
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <article
              key={course.id}
              className="flex flex-col rounded-xl border border-white/8 bg-muted p-5 shadow-sm"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <span className="rounded-md bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                  {course.courseCode}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(course)}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                    aria-label={`Edit ${course.title}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(course)}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-red-950/40 hover:text-destructive"
                    aria-label={`Delete ${course.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <h2 className="text-lg font-semibold text-foreground">{course.title}</h2>
              {course.instructor ? (
                <p className="mt-1 text-sm text-muted-foreground">{course.instructor}</p>
              ) : null}
              <p className="mt-0.5 text-sm text-muted-foreground">{course.semester}</p>
            </article>
          ))}
        </div>
      )}

      <CourseFormModal
        open={modalOpen}
        title={editing ? 'Edit course' : 'Add course'}
        submitLabel={editing ? 'Save changes' : 'Create course'}
        initial={editing}
        submitting={submitting}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
