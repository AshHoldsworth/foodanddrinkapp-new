'use client'

import { MobileDock } from '@/components/MobileDock'
import { createContext, useContext, useMemo, useState } from 'react'

interface DockConfig {
  filterContent?: (closeOverlay: () => void) => React.ReactNode
}

interface DockContextType {
  setDockConfig: (config: DockConfig) => void
  clearDockConfig: () => void
  activeOverlay: string | null
  setActiveOverlay: (overlay: string | null) => void
  closeOverlay: () => void
}

const DockContext = createContext<DockContextType | undefined>(undefined)

export const DockProvider = ({ children }: { children: React.ReactNode }) => {
  const [dockConfig, setDockConfig] = useState<DockConfig>({})
  const [activeOverlay, setActiveOverlay] = useState<string | null>(null)

  const clearDockConfig = () => {
    setDockConfig({})
  }

  const closeOverlay = () => {
    setActiveOverlay(null)
  }

  const value = useMemo(
    () => ({
      setDockConfig,
      clearDockConfig,
      activeOverlay,
      setActiveOverlay,
      closeOverlay,
    }),
    [activeOverlay],
  )

  return (
    <DockContext.Provider value={value}>
      {children}
      <MobileDock {...dockConfig} />
    </DockContext.Provider>
  )
}

export const useDock = () => {
  const context = useContext(DockContext)

  if (!context) {
    throw new Error('useDock must be used within DockProvider')
  }

  return context
}
