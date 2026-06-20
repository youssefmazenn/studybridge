import { api } from './client'
import type { Assignment, AssignmentInput, AssignmentStatus } from '../types/assignment'

export async function listAssignments(
  status?: AssignmentStatus,
): Promise<Assignment[]> {
  const params = status ? { status } : undefined
  const { data } = await api.get<Assignment[]>('/api/v1/assignments', { params })
  return data
}

export async function createAssignment(body: AssignmentInput): Promise<Assignment> {
  const { data } = await api.post<Assignment>('/api/v1/assignments', body)
  return data
}

export async function updateAssignment(
  id: number,
  body: AssignmentInput,
): Promise<Assignment> {
  const { data } = await api.put<Assignment>(`/api/v1/assignments/${id}`, body)
  return data
}

export async function updateAssignmentStatus(
  id: number,
  status: AssignmentStatus,
): Promise<Assignment> {
  const { data } = await api.patch<Assignment>(`/api/v1/assignments/${id}/status`, {
    status,
  })
  return data
}

export async function deleteAssignment(id: number): Promise<void> {
  await api.delete(`/api/v1/assignments/${id}`)
}
