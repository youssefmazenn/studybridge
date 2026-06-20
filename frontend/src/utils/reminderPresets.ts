import type { ReminderType } from '../types/reminder'

/** Build ISO local datetime string for API (no timezone offset). */
export function computeRemindAt(
  assignmentDueDate: string,
  reminderType: ReminderType,
  customLocal?: string,
): string {
  if (reminderType === 'CUSTOM' && customLocal) {
    return customLocal.length === 16 ? `${customLocal}:00` : customLocal
  }

  const due = new Date(assignmentDueDate + 'T00:00:00')
  const remind = new Date(due)

  switch (reminderType) {
    case 'ONE_WEEK_BEFORE':
      remind.setDate(remind.getDate() - 7)
      break
    case 'THREE_DAYS_BEFORE':
      remind.setDate(remind.getDate() - 3)
      break
    case 'ONE_DAY_BEFORE':
    default:
      remind.setDate(remind.getDate() - 1)
      break
  }

  remind.setHours(9, 0, 0, 0)
  return formatLocalDateTime(remind)
}

export function formatLocalDateTime(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d}T${h}:${min}:00`
}

export function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso)
  return formatLocalDateTime(d).slice(0, 16)
}

export const REMINDER_TYPE_LABELS: Record<ReminderType, string> = {
  ONE_DAY_BEFORE: '1 day before due date',
  THREE_DAYS_BEFORE: '3 days before due date',
  ONE_WEEK_BEFORE: '1 week before due date',
  CUSTOM: 'Custom date & time',
}
