import { api } from './client'
import type { Course, CourseInput } from '../types/course'

export async function listCourses(): Promise<Course[]> {
  const { data } = await api.get<Course[]>('/api/v1/courses')
  return data
}

export async function getCourse(id: number): Promise<Course> {
  const { data } = await api.get<Course>(`/api/v1/courses/${id}`)
  return data
}

export async function createCourse(body: CourseInput): Promise<Course> {
  const { data } = await api.post<Course>('/api/v1/courses', body)
  return data
}

export async function updateCourse(id: number, body: CourseInput): Promise<Course> {
  const { data } = await api.put<Course>(`/api/v1/courses/${id}`, body)
  return data
}

export async function deleteCourse(id: number): Promise<void> {
  await api.delete(`/api/v1/courses/${id}`)
}
