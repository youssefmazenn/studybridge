import { useCallback, useEffect, useState } from 'react'
import { Bell, Plus, Trash2 } from 'lucide-react'
import * as reminderApi from '../api/reminderApi'
import { getErrorMessage } from '../api/errors'
import { ReminderFormModal } from './ReminderFormModal'
import type { Assignment } from '../types/assignment'
import type { Reminder, ReminderInput } from '../types/reminder'
import { REMINDER_TYPE_LABELS } from '../utils/reminderPresets'

type AssignmentRemindersProps = {
  assignment: Assignment
  onChanged?: () => void
}

export function AssignmentReminders({ assignment, onChanged }: AssignmentRemindersProps) {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Reminder | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const list = await reminderApi.listRemindersForAssignment(assignment.id)
      setReminders(list)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [assignment.id])

  useEffect(() => {
    void load()
  }, [load])

  async function handleSubmit(input: ReminderInput) {
    setSubmitting(true)
    setError('')
    try {
      if (editing) {
        await reminderApi.updateReminder(editing.id, input)
      } else {
        await reminderApi.createReminder(assignment.id, input)
      }
      setModalOpen(false)
      setEditing(null)
      await load()
      onChanged?.()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(reminder: Reminder) {
    if (!window.confirm('Delete this reminder?')) return
    try {
      await reminderApi.deleteReminder(reminder.id)
      await load()
      onChanged?.()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function handleDismiss(reminder: Reminder) {
    try {
      await reminderApi.markReminderSent(reminder.id, true)
      await load()
      onChanged?.()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div className="mt-4 border-t border-white/8 pt-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Bell className="h-4 w-4" />
          Reminders
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null)
            setModalOpen(true)
          }}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </div>

      {error ? <p className="mb-2 text-xs text-destructive">{error}</p> : null}

      {loading ? (
        <p className="text-xs text-muted-foreground">Loading reminders…</p>
      ) : reminders.length === 0 ? (
        <p className="text-xs text-muted-foreground">No reminders set.</p>
      ) : (
        <ul className="space-y-2">
          {reminders.map((r) => (
            <li
              key={r.id}
              className={`flex items-start justify-between gap-2 rounded-lg px-3 py-2 text-xs ${
                r.sent ? 'bg-accent/60 text-muted-foreground' : 'bg-primary/10 text-foreground'
              }`}
            >
              <div>
                <p className="font-medium">{REMINDER_TYPE_LABELS[r.reminderType]}</p>
                <p>{new Date(r.remindAt).toLocaleString()}</p>
                {r.sent ? <p className="mt-0.5 text-emerald-400">Dismissed</p> : null}
              </div>
              <div className="flex shrink-0 gap-1">
                {!r.sent ? (
                  <button
                    type="button"
                    onClick={() => void handleDismiss(r)}
                    className="rounded px-2 py-1 text-primary hover:bg-accent"
                  >
                    Dismiss
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    setEditing(r)
                    setModalOpen(true)
                  }}
                  className="rounded px-2 py-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(r)}
                  className="rounded p-1 text-destructive hover:bg-red-950/40"
                  aria-label="Delete reminder"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ReminderFormModal
        open={modalOpen}
        assignment={assignment}
        initial={editing}
        submitting={submitting}
        onClose={() => {
          if (!submitting) {
            setModalOpen(false)
            setEditing(null)
          }
        }}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
