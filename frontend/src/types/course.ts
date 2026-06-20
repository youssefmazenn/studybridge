export type Course = {
  id: number
  title: string
  courseCode: string
  semester: string
  instructor: string | null
  createdAt: string
}

export type CourseInput = {
  title: string
  courseCode: string
  semester: string
  instructor?: string
}
