'use client'

import { useEffect, useState } from 'react'
import { navigation } from '@/constants'
import { useRouter } from 'next/navigation'
import { apiPostJson } from '@/app/api/webApi'

export const Header = () => {
  const router = useRouter()
  const [role, setRole] = useState<'admin' | 'user'>('user')

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/backend/auth/me', {
          method: 'GET',
          credentials: 'include',
        })

        if (!response.ok) return

        const json = (await response.json()) as { data?: { role?: 'admin' | 'user' } }
        setRole(json.data?.role === 'admin' ? 'admin' : 'user')
      } catch {
        setRole('user')
      }
    }

    void fetchCurrentUser()
  }, [])

  const visibleNavigation = navigation.filter((item) => !item.requiresAdmin || role === 'admin')

  const onLogout = async () => {
    await apiPostJson('/auth/logout', {})
    router.replace('/')
    router.refresh()
  }

  return (
    <div className="navbar bg-info-content text-base-100 shadow-sm">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {' '}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />{' '}
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-xl dropdown-content bg-base-100 text-info-content rounded-box z-1 mt-3 w-52 p-2 shadow"
          >
            {visibleNavigation.map((element) => (
              <li key={element.title}>
                <a href={element.href}>{element.title}</a>
              </li>
            ))}
          </ul>
        </div>
        <a className="btn btn-ghost text-xl">Food & Drink App</a>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          {visibleNavigation.map((element) => (
            <li key={element.title}>
              <a href={element.href}>{element.title}</a>
            </li>
          ))}
        </ul>
      </div>
      <div className="navbar-end px-2">
        <button className="btn btn-ghost btn-sm" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  )
}
