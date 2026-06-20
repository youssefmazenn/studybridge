export type AssignmentStatus = 'PENDING' | 'COMPLETED'

export type Assignment = {
  id: number
  courseId: number
  courseCode: string
  courseTitle: string
  title: string
  description: string | null
  dueDate: string
  status: AssignmentStatus
  createdAt: string
}

export type AssignmentInput = {
  courseId: number
  title: string
  description?: string
  dueDate: string
  status?: AssignmentStatus
}
