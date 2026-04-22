'use client'

import { usePathname } from 'next/navigation'
import { Header } from '@/components/Header'
import { FloatingActionButton } from '@/components/FloatingActionButton'
import { ModalProvider } from '@/contexts/ModalContext'
import { DockProvider } from '@/contexts/DockContext'
import { UserRole } from '@/constants'

type ProtectedShellClientProps = {
  role: UserRole
  children: React.ReactNode
}

export const ProtectedShellClient = ({ role, children }: ProtectedShellClientProps) => {
  const pathname = usePathname()
  const desktopFabRoutes = ['/meal', '/ingredients', '/drinks', '/inventory', '/planner']
  const showFloatingActionButton = desktopFabRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )

  return (
    <ModalProvider>
      <DockProvider>
        <div className="min-h-screen mx-auto container bg-base-100">
          <Header role={role} />
          {children}
          {showFloatingActionButton && <FloatingActionButton />}
        </div>
      </DockProvider>
    </ModalProvider>
  )
}
