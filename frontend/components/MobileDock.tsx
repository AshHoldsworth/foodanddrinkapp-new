'use client'

import { useEffect, useState } from 'react'
import {
  AdjustmentsHorizontalIcon,
  BeakerIcon,
  CakeIcon,
  PlusIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline'
import { AddModal } from '@/components/modals/AddModal'
import { Alert, AlertProps } from '@/components/errors/Alert'
import { MODAL_CONTENTS } from '@/constants'
import { useModal } from '@/contexts/ModalContext'
import { useDock } from '@/contexts/DockContext'
import { ModalContents } from '@/components/modals/interfaces/AddModal'

interface MobileDockProps {
  filterContent?: (closeOverlay: () => void) => React.ReactNode
}

export const MobileDock = ({ filterContent }: MobileDockProps) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false)
  const [modalContents, setModalContents] = useState<ModalContents | null>(null)
  const [alertProps, setAlertProps] = useState<AlertProps | undefined>()
  
  const { openModal, closeModal } = useModal()
  const { activeOverlay, setActiveOverlay, closeOverlay } = useDock()

  useEffect(() => {
    document.body.classList.toggle('mobile-overlay-open', Boolean(activeOverlay))

    return () => {
      document.body.classList.remove('mobile-overlay-open')
    }
  }, [activeOverlay])

  useEffect(() => {
    if (showAddModal) {
      openModal()
    } else {
      closeModal()
    }
  }, [showAddModal, openModal, closeModal])

  const onOpenAddModal = (contents: ModalContents) => {
    setModalContents(contents)
    setShowAddModal(true)
    setActiveOverlay(null)
  }

  const addButtons = [
    {
      icon: <CakeIcon className="h-5 w-5" />,
      label: 'Add Meal',
      onClick: () => onOpenAddModal({ ...MODAL_CONTENTS.meal }),
    },
    {
      icon: <BeakerIcon className="h-5 w-5" />,
      label: 'Add Drink',
      onClick: () => onOpenAddModal({ ...MODAL_CONTENTS.drink }),
    },
    {
      icon: <ShoppingCartIcon className="h-5 w-5" />,
      label: 'Add Ingredient',
      onClick: () => onOpenAddModal({ ...MODAL_CONTENTS.ingredient }),
    },
  ]

  return (
    <>
      <div className="fixed inset-0 z-40 sm:hidden pointer-events-none">
        <div
          className={`absolute inset-0 transition-colors duration-300 ${
            activeOverlay ? 'bg-black/40 pointer-events-auto' : 'bg-black/0'
          }`}
          onClick={() => closeOverlay()}
        />

        <div
          className={`absolute inset-x-0 bottom-16 bg-base-100 p-4 shadow-2xl transition-transform duration-300 pointer-events-auto ${
            activeOverlay ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          {activeOverlay === 'add' && (
            <div className="grid gap-4">
              {addButtons.map((button, index) => (
                <button
                  key={index}
                  className="btn btn-soft btn-neutral justify-between"
                  onClick={button.onClick}
                >
                  <div className="flex gap-2">
                    {button.icon}
                    {button.label}
                  </div>
                  <PlusIcon className="h-5 w-5" />
                </button>
              ))}
            </div>
          )}

          {activeOverlay === 'filters' && filterContent && filterContent(closeOverlay)}
        </div>
      </div>

      <div className="dock z-50 sm:hidden bg-info-content text-base-100">
        <button
          className={activeOverlay === 'add' ? 'dock-active' : ''}
          onClick={() => setActiveOverlay(activeOverlay === 'add' ? null : 'add')}
        >
          <PlusIcon className="h-5 w-5" />
          <span className="dock-label">Add</span>
        </button>

        {filterContent ? (
          <button
            className={activeOverlay === 'filters' ? 'dock-active' : ''}
            onClick={() => setActiveOverlay(activeOverlay === 'filters' ? null : 'filters')}
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
            <span className="dock-label">Filters</span>
          </button>
        ) : (
          <button disabled>
            <AdjustmentsHorizontalIcon className="h-5 w-5 opacity-50" />
            <span className="dock-label opacity-50">No Filters</span>
          </button>
        )}
      </div>

      <div className="h-16 sm:hidden" />

      {showAddModal && modalContents && (
        <AddModal
          setShowAddModal={(show) => {
            setShowAddModal(show)
            if (!show) {
              closeModal()
            }
          }}
          modalContents={modalContents}
          setAlertProps={setAlertProps}
        />
      )}

      {alertProps && <Alert {...alertProps} />}
    </>
  )
}
