import { api } from './client'
import type { UserProfile } from '../types/user'

export async function listUsers(): Promise<UserProfile[]> {
  const { data } = await api.get<UserProfile[]>('/api/v1/admin/users')
  return data
}

export async function updateUserEnabled(
  userId: number,
  enabled: boolean,
): Promise<UserProfile> {
  const { data } = await api.patch<UserProfile>(
    `/api/v1/admin/users/${userId}/enabled`,
    { enabled },
  )
  return data
}

export async function deleteUser(userId: number): Promise<void> {
  await api.delete(`/api/v1/admin/users/${userId}`)
}
