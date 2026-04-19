'use client'

import { FormEvent, useEffect, useState } from 'react'
import { apiDelete, apiPostJson, apiPutJson } from '@/app/api/webApi'
import { ConfirmModal } from '@/components/modals/ConfirmModal'
import { Alert, AlertProps } from '@/components/errors/Alert'

type UserSummary = {
  id: string
  username: string
  role: 'admin' | 'user'
  createdAt: string
}

type CurrentUser = {
  id: string
  username: string
  role: 'admin' | 'user'
}

const AdminUsersPage = () => {
  const [users, setUsers] = useState<UserSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [alertProps, setAlertProps] = useState<AlertProps | undefined>()
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'admin' | 'user'>('user')
  const [submitting, setSubmitting] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editingUsername, setEditingUsername] = useState('')
  const [editingRole, setEditingRole] = useState<'admin' | 'user'>('user')
  const [savingUserId, setSavingUserId] = useState<string | null>(null)
  const [deleteCandidate, setDeleteCandidate] = useState<UserSummary | null>(null)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/backend/auth/me', {
        method: 'GET',
        credentials: 'include',
      })

      if (!response.ok) return

      const json = (await response.json()) as { data?: CurrentUser }
      setCurrentUser(json.data ?? null)
    } catch {
      setCurrentUser(null)
    }
  }

  const fetchUsers = async () => {
    setLoading(true)

    try {
      const response = await fetch('/backend/auth/users', {
        method: 'GET',
        credentials: 'include',
      })

      if (!response.ok) {
        setAlertProps({
          type: 'error',
          message: 'Failed to load users.',
          onCloseClick: () => setAlertProps(undefined),
        })
        return
      }

      const json = (await response.json()) as { data?: UserSummary[] }
      setUsers(json.data ?? [])
    } catch {
      setAlertProps({
        type: 'error',
        message: 'Failed to load users.',
        onCloseClick: () => setAlertProps(undefined),
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const loadPage = async () => {
      await Promise.all([fetchCurrentUser(), fetchUsers()])
    }

    void loadPage()
  }, [])

  useEffect(() => {
    if (!alertProps || alertProps.type !== 'success') return

    const timeoutId = window.setTimeout(() => {
      setAlertProps(undefined)
    }, 5000)

    return () => window.clearTimeout(timeoutId)
  }, [alertProps])

  const resetMessages = () => {
    setAlertProps(undefined)
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    resetMessages()
    setSubmitting(true)

    try {
      const { status, errorMessage } = await apiPostJson('/auth/register', { username, password, role })

      if (status !== 200) {
        setAlertProps({
          type: 'error',
          message: errorMessage ?? 'Failed to create user.',
          onCloseClick: () => setAlertProps(undefined),
        })
        return
      }

      setUsername('')
      setPassword('')
      setRole('user')
      setAlertProps({
        type: 'success',
        message: 'User created.',
        onCloseClick: () => setAlertProps(undefined),
      })
      await fetchUsers()
    } catch {
      setAlertProps({
        type: 'error',
        message: 'Failed to create user.',
        onCloseClick: () => setAlertProps(undefined),
      })
    } finally {
      setSubmitting(false)
    }
  }

  const startEditing = (user: UserSummary) => {
    resetMessages()
    setEditingUserId(user.id)
    setEditingUsername(user.username)
    setEditingRole(user.role)
  }

  const cancelEditing = () => {
    setEditingUserId(null)
    setEditingUsername('')
    setEditingRole('user')
  }

  const onSaveUser = async (userId: string) => {
    resetMessages()
    setSavingUserId(userId)

    try {
      const { status, errorMessage } = await apiPutJson(`/auth/users/${userId}`, {
        username: editingUsername,
        role: editingRole,
      })

      if (status !== 200) {
        setAlertProps({
          type: 'error',
          message: errorMessage ?? 'Failed to update user.',
          onCloseClick: () => setAlertProps(undefined),
        })
        return
      }

      cancelEditing()
      setAlertProps({
        type: 'success',
        message: 'User updated.',
        onCloseClick: () => setAlertProps(undefined),
      })
      await fetchUsers()
    } catch {
      setAlertProps({
        type: 'error',
        message: 'Failed to update user.',
        onCloseClick: () => setAlertProps(undefined),
      })
    } finally {
      setSavingUserId(null)
    }
  }

  const onDeleteUser = async () => {
    if (!deleteCandidate) return

    resetMessages()
    setDeletingUserId(deleteCandidate.id)

    try {
      const { status, errorMessage } = await apiDelete(
        `/auth/users/${deleteCandidate.id}`,
        {},
        {
          ErrorMessage: 'Failed to delete user.',
          FallbackErrorMessage: 'Failed to delete user.',
          LogLabel: 'delete user',
        },
      )

      if (status !== 200) {
        setAlertProps({
          type: 'error',
          message: errorMessage ?? 'Failed to delete user.',
          onCloseClick: () => setAlertProps(undefined),
        })
        return
      }

      setDeleteCandidate(null)
      setAlertProps({
        type: 'success',
        message: 'User deleted.',
        onCloseClick: () => setAlertProps(undefined),
      })
      await fetchUsers()
    } catch {
      setAlertProps({
        type: 'error',
        message: 'Failed to delete user.',
        onCloseClick: () => setAlertProps(undefined),
      })
    } finally {
      setDeletingUserId(null)
    }
  }

  const formatCreatedAt = (value: string) => {
    const date = new Date(value)

    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      full: date.toLocaleString(),
    }
  }

  return (
    <main className="p-5 space-y-5">
      <section className="border border-base-300 rounded-lg p-4">
        <h1 className="text-xl font-semibold mb-3">User Management</h1>

        <form className="grid gap-3 sm:grid-cols-4" onSubmit={onSubmit}>
          <input
            className="input input-bordered w-full"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            className="input input-bordered w-full"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <select
            className="select select-bordered w-full"
            value={role}
            onChange={(e) => setRole(e.target.value as 'admin' | 'user')}
          >
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
          <button className="btn btn-success" type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create User'}
          </button>
        </form>
      </section>

      <section className="border border-base-300 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">Users</h2>

        {loading ? (
          <p>Loading users...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra table-sm table-fixed w-full">
              <colgroup>
                <col className="w-[24%]" />
                <col className="w-[22%]" />
                <col className="w-[22%]" />
                <col className="w-[32%]" />
              </colgroup>
              <thead>
                <tr>
                  <th className="py-2">Username</th>
                  <th className="py-2">Role</th>
                  <th className="py-2">Created</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isEditing = editingUserId === user.id
                  const isCurrentUser = currentUser?.id === user.id
                  const createdAt = formatCreatedAt(user.createdAt)

                  return (
                    <tr key={user.id}>
                      <td className="py-2 align-middle">
                        {isEditing ? (
                          <input
                            className="input input-bordered input-sm w-full"
                            value={editingUsername}
                            onChange={(e) => setEditingUsername(e.target.value)}
                          />
                        ) : (
                          <div className="h-8 flex items-center truncate">{user.username}</div>
                        )}
                      </td>
                      <td className="py-2 align-middle">
                        {isEditing ? (
                          <select
                            className="select select-bordered select-sm w-full"
                            value={editingRole}
                            onChange={(e) => setEditingRole(e.target.value as 'admin' | 'user')}
                          >
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                          </select>
                        ) : (
                          <div className="h-8 flex items-center">{user.role}</div>
                        )}
                      </td>
                      <td className="py-2 align-middle">
                        <div className="text-xs leading-tight" title={createdAt.full}>
                          <div>{createdAt.date}</div>
                          <div>{createdAt.time}</div>
                        </div>
                      </td>
                      <td className="py-2 align-middle">
                        {isCurrentUser ? (
                          <span className="text-xs sm:text-sm opacity-70 whitespace-nowrap">Current account</span>
                        ) : isEditing ? (
                          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 whitespace-nowrap">
                            <button
                              className="btn btn-neutral btn-xs sm:btn-sm w-16 sm:w-20"
                              type="button"
                              disabled={savingUserId === user.id}
                              onClick={() => void onSaveUser(user.id)}
                            >
                              {savingUserId === user.id ? 'Saving...' : 'Save'}
                            </button>
                            <button className="btn btn-outline btn-xs sm:btn-sm w-16 sm:w-20" type="button" onClick={cancelEditing}>
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 whitespace-nowrap">
                            <button className="btn btn-outline btn-xs sm:btn-sm w-16 sm:w-20" type="button" onClick={() => startEditing(user)}>
                              Edit
                            </button>
                            <button
                              className="btn btn-error btn-xs sm:btn-sm w-16 sm:w-20"
                              type="button"
                              disabled={deletingUserId === user.id}
                              onClick={() => setDeleteCandidate(user)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {deleteCandidate && (
        <ConfirmModal
          title="Delete User"
          message={`Are you sure you want to delete ${deleteCandidate.username}?`}
          confirmLabel={deletingUserId === deleteCandidate.id ? 'Deleting...' : 'Delete'}
          onCancel={() => setDeleteCandidate(null)}
          onConfirm={() => void onDeleteUser()}
        />
      )}

      {alertProps && <Alert {...alertProps} className="top-20 left-4 right-4 sm:left-10 sm:right-10" />}
    </main>
  )
}

export default AdminUsersPage
