'use client'

import { FormEvent, useEffect, useState } from 'react'
import { apiDelete, apiPostJson, apiPutJson } from '@/app/api/webApi'
import { ConfirmModal } from '@/components/modals/ConfirmModal'
import { Alert, AlertProps } from '@/components/errors/Alert'
import Loading from '@/components/Loading'
import { Select } from '@/components/selectors/Select'

type UserSummary = {
  id: string
  username: string
  role: 'admin' | 'user'
  groupId: string | null
  createdAt: string
}

type UserGroup = {
  id: string
  name: string
  createdAt: string
}

type AdminUsersPageClientProps = {
  currentUserId: string | null
}

const AdminUsersPageClient = ({ currentUserId }: AdminUsersPageClientProps) => {
  const [users, setUsers] = useState<UserSummary[]>([])
  const [groups, setGroups] = useState<UserGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingGroups, setLoadingGroups] = useState(true)
  const [alertProps, setAlertProps] = useState<AlertProps | undefined>()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'admin' | 'user'>('user')
  const [groupId, setGroupId] = useState<string>('')
  const [newGroupName, setNewGroupName] = useState('')
  const [creatingGroup, setCreatingGroup] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editingUsername, setEditingUsername] = useState('')
  const [editingRole, setEditingRole] = useState<'admin' | 'user'>('user')
  const [editingGroupId, setEditingGroupId] = useState<string>('')
  const [savingUserId, setSavingUserId] = useState<string | null>(null)
  const [deleteCandidate, setDeleteCandidate] = useState<UserSummary | null>(null)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)

  const fetchGroups = async () => {
    setLoadingGroups(true)

    try {
      const response = await fetch('/backend/auth/user-groups', {
        method: 'GET',
        credentials: 'include',
      })

      if (!response.ok) {
        setAlertProps({
          type: 'error',
          message: 'Failed to load user groups.',
          onCloseClick: () => setAlertProps(undefined),
        })
        return
      }

      const json = (await response.json()) as { data?: UserGroup[] }
      setGroups(json.data ?? [])
    } catch {
      setAlertProps({
        type: 'error',
        message: 'Failed to load user groups.',
        onCloseClick: () => setAlertProps(undefined),
      })
    } finally {
      setLoadingGroups(false)
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
    void fetchUsers()
    void fetchGroups()
  }, [])

  const resetMessages = () => {
    setAlertProps(undefined)
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    resetMessages()
    setSubmitting(true)

    try {
      const { status, errorMessage } = await apiPostJson('/auth/register', {
        username,
        password,
        role,
        groupId: groupId || null,
      })

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
      setGroupId('')
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
    setEditingGroupId(user.groupId ?? '')
  }

  const cancelEditing = () => {
    setEditingUserId(null)
    setEditingUsername('')
    setEditingRole('user')
    setEditingGroupId('')
  }

  const onSaveUser = async (userId: string) => {
    resetMessages()
    setSavingUserId(userId)

    try {
      const { status, errorMessage } = await apiPutJson(`/auth/users/${userId}`, {
        username: editingUsername,
        role: editingRole,
        groupId: editingGroupId || null,
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

  const onCreateGroup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    resetMessages()
    setCreatingGroup(true)

    try {
      const { status, errorMessage } = await apiPostJson('/auth/user-groups', {
        name: newGroupName,
      })

      if (status !== 200) {
        setAlertProps({
          type: 'error',
          message: errorMessage ?? 'Failed to create user group.',
          onCloseClick: () => setAlertProps(undefined),
        })
        return
      }

      setNewGroupName('')
      setAlertProps({
        type: 'success',
        message: 'User group created.',
        onCloseClick: () => setAlertProps(undefined),
      })
      await fetchGroups()
    } catch {
      setAlertProps({
        type: 'error',
        message: 'Failed to create user group.',
        onCloseClick: () => setAlertProps(undefined),
      })
    } finally {
      setCreatingGroup(false)
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

        <form className="flex flex-col sm:flex-row gap-3 mb-4" onSubmit={onCreateGroup}>
          <input
            className="input input-bordered w-full"
            placeholder="New group name"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            required
          />
          <button className="btn btn-outline" type="submit" disabled={creatingGroup}>
            {creatingGroup ? 'Creating Group...' : 'Create Group'}
          </button>
        </form>

        <form className="grid gap-3 sm:grid-cols-5" onSubmit={onSubmit}>
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
          <Select
            value={role}
            className="w-full"
            options={[
              { label: 'user', value: 'user' },
              { label: 'admin', value: 'admin' },
            ]}
            onChange={(v) => setRole(v as 'admin' | 'user')}
          />
          <Select
            value={groupId}
            className="w-full"
            options={[
              { label: 'No group', value: '' },
              ...groups.map((group) => ({ label: group.name, value: group.id })),
            ]}
            onChange={(v) => setGroupId(v)}
            disabled={loadingGroups}
          />
          <button className="btn btn-success" type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create User'}
          </button>
        </form>
      </section>

      <section className="border border-base-300 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">Users</h2>

        {loading ? (
          <Loading label="Loading users..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra table-sm table-fixed w-full">
              <colgroup>
                <col className="w-[20%]" />
                <col className="w-[16%]" />
                <col className="w-[22%]" />
                <col className="w-[18%]" />
                <col className="w-[24%]" />
              </colgroup>
              <thead>
                <tr>
                  <th className="py-2">Username</th>
                  <th className="py-2">Role</th>
                  <th className="py-2">Group</th>
                  <th className="py-2">Created</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isEditing = editingUserId === user.id
                  const isCurrentUser = currentUserId === user.id
                  const createdAt = formatCreatedAt(user.createdAt)
                  const groupName =
                    groups.find((group) => group.id === user.groupId)?.name ?? 'No group'

                  const primaryAction = isEditing
                    ? {
                        label: savingUserId === user.id ? 'Saving...' : 'Save',
                        className: 'btn btn-neutral btn-xs sm:btn-sm w-16 sm:w-20',
                        disabled: savingUserId === user.id,
                        onClick: () => void onSaveUser(user.id),
                      }
                    : {
                        label: 'Edit',
                        className: 'btn btn-outline btn-xs sm:btn-sm w-16 sm:w-20',
                        disabled: false,
                        onClick: () => startEditing(user),
                      }

                  const secondaryAction = isEditing
                    ? {
                        label: 'Cancel',
                        className: 'btn btn-outline btn-xs sm:btn-sm w-16 sm:w-20',
                        disabled: false,
                        onClick: cancelEditing,
                      }
                    : {
                        label: deletingUserId === user.id ? 'Deleting...' : 'Delete',
                        className: 'btn btn-error btn-xs sm:btn-sm w-16 sm:w-20',
                        disabled: deletingUserId === user.id,
                        onClick: () => setDeleteCandidate(user),
                      }

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
                          <Select
                            value={editingRole}
                            options={[
                              { label: 'user', value: 'user' },
                              { label: 'admin', value: 'admin' },
                            ]}
                            onChange={(v) => setEditingRole(v as 'admin' | 'user')}
                            className="select-sm w-full"
                          />
                        ) : (
                          <div className="h-8 flex items-center">{user.role}</div>
                        )}
                      </td>
                      <td className="py-2 align-middle">
                        {isEditing ? (
                          <Select
                            value={editingGroupId}
                            options={[
                              { label: 'No group', value: '' },
                              ...groups.map((group) => ({ label: group.name, value: group.id })),
                            ]}
                            onChange={(v) => setEditingGroupId(v)}
                            className="select-sm w-full"
                            disabled={loadingGroups}
                          />
                        ) : (
                          <div className="h-8 flex items-center truncate">{groupName}</div>
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
                          <span className="text-xs sm:text-sm opacity-70 whitespace-nowrap">
                            Current account
                          </span>
                        ) : (
                          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 whitespace-nowrap items-center">
                            <button
                              className={primaryAction.className}
                              type="button"
                              disabled={primaryAction.disabled}
                              onClick={primaryAction.onClick}
                            >
                              {primaryAction.label}
                            </button>
                            <button
                              className={secondaryAction.className}
                              type="button"
                              disabled={secondaryAction.disabled}
                              onClick={secondaryAction.onClick}
                            >
                              {secondaryAction.label}
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

      {alertProps && (
        <Alert {...alertProps} className="top-20 left-4 right-4 sm:left-10 sm:right-10" />
      )}
    </main>
  )
}

export default AdminUsersPageClient
