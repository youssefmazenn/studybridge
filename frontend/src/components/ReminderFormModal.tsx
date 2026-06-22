import { type FormEvent, useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import type { Assignment } from '../types/assignment'
import type { Reminder, ReminderInput, ReminderType } from '../types/reminder'
import {
  computeRemindAt,
  toDatetimeLocalValue,
} from '../utils/reminderPresets'

type ReminderFormModalProps = {
  open: boolean
  assignment: Assignment
  initial?: Reminder | null
  submitting: boolean
  onClose: () => void
  onSubmit: (input: ReminderInput) => Promise<void>
}

const TYPES: ReminderType[] = [
  'ONE_DAY_BEFORE',
  'THREE_DAYS_BEFORE',
  'ONE_WEEK_BEFORE',
  'CUSTOM',
]

const inputClass =
  'w-full rounded-lg border border-white/10 bg-accent px-3 py-2.5 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'

export function ReminderFormModal({
  open,
  assignment,
  initial,
  submitting,
  onClose,
  onSubmit,
}: ReminderFormModalProps) {
  const { locale, t } = useLanguage()
  const [reminderType, setReminderType] = useState<ReminderType>('ONE_DAY_BEFORE')
  const [customAt, setCustomAt] = useState('')

  useEffect(() => {
    if (open) {
      if (initial) {
        setReminderType(initial.reminderType)
        setCustomAt(
          initial.reminderType === 'CUSTOM' ? toDatetimeLocalValue(initial.remindAt) : '',
        )
      } else {
        setReminderType('ONE_DAY_BEFORE')
        setCustomAt('')
      }
    }
  }, [open, initial])

  if (!open) {
    return null
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const remindAt = computeRemindAt(assignment.dueDate, reminderType, customAt)
    await onSubmit({ remindAt, reminderType })
  }

  const previewAt = computeRemindAt(
    assignment.dueDate,
    reminderType,
    reminderType === 'CUSTOM' ? customAt : undefined,
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-muted shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">
            {initial ? t('reminders.edit') : t('reminders.addTitle')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent"
            aria-label={t('common.close')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 px-6 py-5">
          <p className="text-sm text-muted-foreground">
            {t('reminders.for')}{' '}
            <span className="font-medium text-foreground">{assignment.title}</span>
            {' '}
            ({t('reminders.due', { date: assignment.dueDate })})
          </p>

          <div>
            <label htmlFor="reminder-type" className="mb-1.5 block text-sm font-medium text-slate-300">
              {t('reminders.when')}
            </label>
            <select
              id="reminder-type"
              value={reminderType}
              onChange={(e) => setReminderType(e.target.value as ReminderType)}
              className={inputClass}
            >
              {TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`reminderType.${type}`)}
                </option>
              ))}
            </select>
          </div>

          {reminderType === 'CUSTOM' ? (
            <div>
              <label htmlFor="reminder-custom" className="mb-1.5 block text-sm font-medium text-slate-300">
                {t('reminders.remindAt')}
              </label>
              <input
                id="reminder-custom"
                type="datetime-local"
                required
                value={customAt}
                onChange={(e) => setCustomAt(e.target.value)}
                className={inputClass}
              />
            </div>
          ) : null}

          <p className="rounded-lg bg-accent px-3 py-2 text-xs text-muted-foreground">
            {t('reminders.willRemind')}{' '}
            <span className="font-medium text-foreground">
              {new Date(previewAt).toLocaleString(locale)}
            </span>
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent disabled:opacity-50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {submitting
                ? t('reminders.saving')
                : initial
                  ? t('common.save')
                  : t('reminders.addTitle')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
