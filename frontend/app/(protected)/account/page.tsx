'use client'

import { FormEvent, useState } from 'react'
import { apiPostJson } from '@/app/api/webApi'
import { Alert, AlertProps } from '@/components/errors/Alert'

const AccountPage = () => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [alertProps, setAlertProps] = useState<AlertProps | undefined>()
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setAlertProps(undefined)

    if (newPassword !== confirmPassword) {
      setAlertProps({
        type: 'error',
        message: 'New password and confirmation must match.',
        onCloseClick: () => setAlertProps(undefined),
      })
      return
    }

    setSubmitting(true)

    try {
      const { status, errorMessage } = await apiPostJson('/auth/change-password', {
        currentPassword,
        newPassword,
      })

      if (status !== 200) {
        setAlertProps({
          type: 'error',
          message: errorMessage ?? 'Failed to change password.',
          onCloseClick: () => setAlertProps(undefined),
        })
        return
      }

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setAlertProps({
        type: 'success',
        message: 'Password updated.',
        onCloseClick: () => setAlertProps(undefined),
      })
    } catch {
      setAlertProps({
        type: 'error',
        message: 'Failed to change password.',
        onCloseClick: () => setAlertProps(undefined),
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="p-5">
      <section className="max-w-xl border border-base-300 rounded-lg p-4 space-y-4">
        <div>
          <h1 className="text-xl font-semibold">Account</h1>
          <p className="text-sm opacity-75 mt-1">Change your password.</p>
        </div>

        <form className="flex flex-col gap-3" onSubmit={onSubmit}>
          <label className="form-control w-full">
            <span className="label-text mb-1">Current Password</span>
            <input
              className="input input-bordered w-full"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          <label className="form-control w-full">
            <span className="label-text mb-1">New Password</span>
            <input
              className="input input-bordered w-full"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </label>

          <label className="form-control w-full">
            <span className="label-text mb-1">Confirm New Password</span>
            <input
              className="input input-bordered w-full"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </label>

          <button className="btn btn-success mt-2" type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Change Password'}
          </button>
        </form>
      </section>

      {alertProps && (
        <Alert {...alertProps} className="top-20 left-4 right-4 sm:left-10 sm:right-10" />
      )}
    </main>
  )
}

export default AccountPage
