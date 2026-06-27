import { useCallback, useEffect, useMemo, useState } from 'react'
import { Search, ShieldCheck, Trash2, UserCheck, UserX } from 'lucide-react'
import * as adminUserApi from '../api/adminUserApi'
import { getErrorMessage } from '../api/errors'
import { ErrorAlert } from '../components/ErrorAlert'
import { Spinner } from '../components/Spinner'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import type { UserProfile } from '../types/user'

function formatCreatedAt(value: string | null, locale: string): string {
  if (!value) return '-'
  return new Date(value).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function AdminUsersPage() {
  const { user: currentUser } = useAuth()
  const { locale, t } = useLanguage()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [busyUserId, setBusyUserId] = useState<number | null>(null)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const list = await adminUserApi.listUsers()
      setUsers(list)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadUsers()
  }, [loadUsers])

  const filteredUsers = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return users
    return users.filter((user) =>
      [user.name, user.email, user.preferredLanguage, user.role]
        .join(' ')
        .toLowerCase()
        .includes(needle),
    )
  }, [query, users])

  async function toggleEnabled(user: UserProfile) {
    if (user.id === currentUser?.id && user.enabled) return
    setBusyUserId(user.id)
    setError('')
    try {
      const updated = await adminUserApi.updateUserEnabled(user.id, !user.enabled)
      setUsers((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      )
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusyUserId(null)
    }
  }

  async function handleDelete(user: UserProfile) {
    if (user.id === currentUser?.id) return
    if (!window.confirm(t('admin.deleteConfirm', { email: user.email }))) return
    setBusyUserId(user.id)
    setError('')
    try {
      await adminUserApi.deleteUser(user.id)
      setUsers((current) => current.filter((item) => item.id !== user.id))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusyUserId(null)
    }
  }

  const enabledCount = users.filter((user) => user.enabled).length
  const disabledCount = users.length - enabledCount

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t('admin.title')}</h1>
          <p className="mt-1 text-muted-foreground">{t('admin.description')}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-sm sm:min-w-96">
          <div className="rounded-lg border border-white/8 bg-muted px-3 py-2">
            <p className="text-xs text-muted-foreground">{t('admin.total')}</p>
            <p className="mt-1 font-semibold text-foreground">{users.length}</p>
          </div>
          <div className="rounded-lg border border-white/8 bg-muted px-3 py-2">
            <p className="text-xs text-muted-foreground">{t('admin.active')}</p>
            <p className="mt-1 font-semibold text-emerald-400">{enabledCount}</p>
          </div>
          <div className="rounded-lg border border-white/8 bg-muted px-3 py-2">
            <p className="text-xs text-muted-foreground">{t('admin.disabled')}</p>
            <p className="mt-1 font-semibold text-destructive">{disabledCount}</p>
          </div>
        </div>
      </div>

      <div className="relative max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('admin.search')}
          className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-3 text-sm text-foreground outline-none ring-offset-background placeholder:text-muted-foreground focus:border-primary"
        />
      </div>

      <ErrorAlert message={error} />

      {loading ? (
        <Spinner label={t('admin.loading')} />
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 bg-muted p-12 text-center">
          <p className="font-medium text-foreground">{t('admin.noUsers')}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t('admin.noUsersHint')}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/8 bg-muted">
          <div className="hidden min-w-full md:block">
            <table className="min-w-full divide-y divide-white/8">
              <thead className="bg-background/40 text-left text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">{t('admin.user')}</th>
                  <th className="px-4 py-3">{t('admin.role')}</th>
                  <th className="px-4 py-3">{t('admin.status')}</th>
                  <th className="px-4 py-3">{t('admin.joined')}</th>
                  <th className="px-4 py-3 text-right">{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {filteredUsers.map((user) => {
                  const isCurrentUser = user.id === currentUser?.id
                  const busy = busyUserId === user.id
                  return (
                    <tr key={user.id}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/15 px-2 py-1 text-xs font-semibold text-primary">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold ${
                            user.enabled
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-red-500/15 text-destructive'
                          }`}
                        >
                          {user.enabled ? (
                            <UserCheck className="h-3.5 w-3.5" />
                          ) : (
                            <UserX className="h-3.5 w-3.5" />
                          )}
                          {user.enabled ? t('admin.active') : t('admin.disabled')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {formatCreatedAt(user.createdAt, locale)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => void toggleEnabled(user)}
                            disabled={busy || (isCurrentUser && user.enabled)}
                            className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label={
                              user.enabled ? t('admin.deactivate') : t('admin.activate')
                            }
                          >
                            {user.enabled ? (
                              <UserX className="h-4 w-4" />
                            ) : (
                              <UserCheck className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(user)}
                            disabled={busy || isCurrentUser}
                            className="rounded-lg p-2 text-muted-foreground hover:bg-red-950/40 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label={t('common.delete')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-white/8 md:hidden">
            {filteredUsers.map((user) => {
              const isCurrentUser = user.id === currentUser?.id
              const busy = busyUserId === user.id
              return (
                <article key={user.id} className="space-y-3 p-4">
                  <div>
                    <p className="font-medium text-foreground">{user.name}</p>
                    <p className="break-all text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-semibold">
                    <span className="rounded-md bg-primary/15 px-2 py-1 text-primary">
                      {user.role}
                    </span>
                    <span
                      className={`rounded-md px-2 py-1 ${
                        user.enabled
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-red-500/15 text-destructive'
                      }`}
                    >
                      {user.enabled ? t('admin.active') : t('admin.disabled')}
                    </span>
                    <span className="rounded-md bg-background/50 px-2 py-1 text-muted-foreground">
                      {formatCreatedAt(user.createdAt, locale)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => void toggleEnabled(user)}
                      disabled={busy || (isCurrentUser && user.enabled)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {user.enabled ? (
                        <UserX className="h-4 w-4" />
                      ) : (
                        <UserCheck className="h-4 w-4" />
                      )}
                      {user.enabled ? t('admin.deactivate') : t('admin.activate')}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(user)}
                      disabled={busy || isCurrentUser}
                      className="rounded-lg border border-white/10 px-3 py-2 text-muted-foreground hover:bg-red-950/40 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={t('common.delete')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
