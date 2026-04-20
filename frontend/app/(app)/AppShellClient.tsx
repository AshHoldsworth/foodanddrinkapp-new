'use client'

import { usePathname } from 'next/navigation'
import { Header } from '@/components/Header'
import { FloatingActionButton } from '@/components/FloatingActionButton'
import { ModalProvider } from '@/contexts/ModalContext'
import { DockProvider } from '@/contexts/DockContext'

type AppShellClientProps = {
  role: 'admin' | 'user'
  children: React.ReactNode
}

export const AppShellClient = ({ role, children }: AppShellClientProps) => {
  const pathname = usePathname()
  const showFloatingActionButton =
    !pathname.startsWith('/admin') && !pathname.startsWith('/account')

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
