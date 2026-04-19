'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiPostJson } from '@/app/api/webApi'

const Home = () => {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const { status, errorMessage } = await apiPostJson('/auth/login', { username, password })

    if (status !== 200) {
      setError(errorMessage ?? 'Invalid username or password')
      setSubmitting(false)
      return
    }

    router.replace('/meal')
    router.refresh()
    setSubmitting(false)
  }

  return (
    <main className="min-h-screen flex items-center bg-base-100 justify-center px-4">
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

          {error && <p className="text-error text-sm">{error}</p>}

          <button className="btn btn-success w-full mt-2" type="submit" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  )
}

export default Home
