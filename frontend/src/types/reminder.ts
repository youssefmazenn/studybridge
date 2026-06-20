export type ReminderType =
  | 'ONE_DAY_BEFORE'
  | 'THREE_DAYS_BEFORE'
  | 'ONE_WEEK_BEFORE'
  | 'CUSTOM'

export type Reminder = {
  id: number
  assignmentId: number
  assignmentTitle: string
  courseCode: string
  assignmentDueDate: string
  remindAt: string
  reminderType: ReminderType
  sent: boolean
}

export type ReminderInput = {
  remindAt: string
  reminderType: ReminderType
}
