'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiPostJson } from '@/app/api/webApi'
import { Button } from '@/components/Button'
import { Alert, AlertProps } from '@/components/Alert'

export const LoginPageClient = () => {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [alertProps, setAlertProps] = useState<AlertProps | undefined>()
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setAlertProps(undefined)
    setSubmitting(true)

    const { status, errorMessage } = await apiPostJson('/auth/login', { username, password })

    if (status !== 200) {
      if (status === 403 && errorMessage?.toLowerCase().includes('group')) {
        router.replace('/no-group')
        router.refresh()
        setSubmitting(false)
        return
      }

      setAlertProps({
        type: 'error',
        message: errorMessage ?? 'Invalid username or password',
        onCloseClick: () => setAlertProps(undefined),
      })
      setSubmitting(false)
      return
    }

    router.replace('/meal')
    router.refresh()
    setSubmitting(false)
  }

  return (
    <main className="min-h-screen flex items-center bg-base-100 justify-center px-4">
      {alertProps && (
        <Alert {...alertProps} className="top-5 left-4 right-4 sm:left-10 sm:right-10" />
      )}
      <div className="w-full max-w-sm border border-base-300 bg-info-content text-base-100 rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-semibold mb-4">Login</h1>

        <form className="flex flex-col gap-3" onSubmit={onSubmit}>
          <label className="form-control w-full">
            <span className="label-text">Username</span>
            <input
              className="input input-bordered w-full text-neutral"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </label>

          <label className="form-control w-full">
            <span className="label-text">Password</span>
            <input
              className="input input-bordered w-full text-neutral"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          <Button tone="success" className="w-full mt-2" type="submit" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>
    </main>
  )
}
