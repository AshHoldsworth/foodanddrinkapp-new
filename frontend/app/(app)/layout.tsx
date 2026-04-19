'use client'

import { usePathname } from 'next/navigation'
import { Header } from '@/components/Header'
import { FloatingActionButton } from '@/components/FloatingActionButton'
import { ModalProvider } from '@/contexts/ModalContext'
import { DockProvider } from '@/contexts/DockContext'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showFloatingActionButton = !pathname.startsWith('/admin') && !pathname.startsWith('/account')

  return (
    <ModalProvider>
      <DockProvider>
        <div className="min-h-screen mx-auto container bg-base-100">
          <Header />
          {children}
          {showFloatingActionButton && <FloatingActionButton />}
        </div>
      </DockProvider>
    </ModalProvider>
  )
}
