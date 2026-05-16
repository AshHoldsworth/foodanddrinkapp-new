import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '../Button'
import { useModal } from '@/contexts/ModalContext'

type ModalFormShellProps = {
  title: string
  children: ReactNode
  primaryButtonLabel: string
  onPrimaryClick: () => void
  onCancel: () => void
  overlayTestId: string
  backdropTestId: string
  contentTestId: string
}

export const ModalFormShell = ({
  title,
  children,
  primaryButtonLabel,
  onPrimaryClick,
  onCancel,
  overlayTestId,
  backdropTestId,
  contentTestId,
}: ModalFormShellProps) => {
  const [hasMounted, setHasMounted] = useState(false)
  const { openModal, closeModal } = useModal()

  useEffect(() => {
    setHasMounted(true)
  }, [])

  useEffect(() => {
    openModal()
    return () => {
      closeModal()
    }
  }, [openModal, closeModal])

  if (!hasMounted) {
    return null
  }

  return createPortal(
    <div className="fixed inset-0 z-100 overflow-y-auto" data-testid={overlayTestId}>
      <div className="absolute inset-0 bg-black/75" data-testid={backdropTestId} />
      <div className="relative min-h-full flex justify-center items-start sm:items-center p-2 sm:p-4">
        <div
          className="bg-white p-4 rounded shadow-md w-full sm:w-2xl max-h-[calc(100dvh-1rem)] sm:max-h-[90dvh] flex flex-col"
          data-testid={contentTestId}
        >
          <h3 className="font-bold text-lg mb-5">{title}</h3>
          <div className="modal-body flex-1 min-h-0 overflow-y-auto pr-1">{children}</div>
          <div className="modal-action mt-3">
            <Button tone="error" onClick={onCancel}>
              Cancel
            </Button>
            <Button tone="success" onClick={onPrimaryClick}>
              {primaryButtonLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
