/** Shared shapes for dashboard widgets; replace with API types in Milestone 2. */

export type DashboardDeadline = {
  id: number
  title: string
  course: string
  dueDate: string
  status: 'pending' | 'completed'
  reminder?: boolean
}

export type DashboardDocument = {
  id: number
  name: string
  course: string
  uploadedAt: string
}

export type DashboardCourse = {
  id: number
  name: string
  instructor: string
  progress: number
}
