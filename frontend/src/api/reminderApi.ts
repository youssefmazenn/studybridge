import { api } from './client'
import type { Reminder, ReminderInput } from '../types/reminder'

export async function listReminders(dueOnly = false): Promise<Reminder[]> {
  const { data } = await api.get<Reminder[]>('/api/v1/reminders', {
    params: dueOnly ? { dueOnly: true } : undefined,
  })
  return data
}

export async function listRemindersForAssignment(assignmentId: number): Promise<Reminder[]> {
  const { data } = await api.get<Reminder[]>(
    `/api/v1/assignments/${assignmentId}/reminders`,
  )
  return data
}

export async function createReminder(
  assignmentId: number,
  body: ReminderInput,
): Promise<Reminder> {
  const { data } = await api.post<Reminder>(
    `/api/v1/assignments/${assignmentId}/reminders`,
    body,
  )
  return data
}

export async function updateReminder(id: number, body: ReminderInput): Promise<Reminder> {
  const { data } = await api.put<Reminder>(`/api/v1/reminders/${id}`, body)
  return data
}

export async function markReminderSent(id: number, sent: boolean): Promise<Reminder> {
  const { data } = await api.patch<Reminder>(`/api/v1/reminders/${id}/sent`, null, {
    params: { sent },
  })
  return data
}

export async function deleteReminder(id: number): Promise<void> {
  await api.delete(`/api/v1/reminders/${id}`)
}
