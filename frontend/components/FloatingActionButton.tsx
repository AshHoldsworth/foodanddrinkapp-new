'use client'

import { useState } from 'react'
import { PlusIcon } from '@heroicons/react/16/solid'
import { AddModal } from '@/components/modals/AddModal'
import { Alert, AlertProps } from '@/components/errors/Alert'
import { Button } from '@/components/Button'
import { MODAL_CONTENTS } from '@/constants'
import { ModalContents } from './modals/interfaces/AddModal'
import { useModal } from '@/contexts/ModalContext'
import { getIcon } from '@/utils/getIcon'

export const FloatingActionButton = () => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false)
  const [modalContents, setModalContents] = useState<ModalContents | null>(null)
  const [alertProps, setAlertProps] = useState<AlertProps | undefined>()
  const { isModalOpen, openModal, closeModal } = useModal()

  const onMealClick = () => {
    setModalContents({ ...MODAL_CONTENTS.meal })
    setShowAddModal(true)
    openModal()
  }

  const onDrinkClick = () => {
    setModalContents({ ...MODAL_CONTENTS.drink })
    setShowAddModal(true)
    openModal()
  }

  const onIngredientClick = () => {
    setModalContents({ ...MODAL_CONTENTS.ingredient })
    setShowAddModal(true)
    openModal()
  }

  return (
    <>
      {!showAddModal && !isModalOpen && (
        <div className="fab hidden sm:flex">
          {/* a focusable div with tabIndex is necessary to work on all browsers. role="button" is necessary for accessibility */}
          <div tabIndex={0} role="button" className="btn btn-lg btn-circle btn-neutral">
            <PlusIcon className="h-6 w-6" />
          </div>

          {/* buttons that show up when FAB is open */}
          <FabItem
            icon={getIcon({ type: 'meal', className: 'h-6 w-6' })}
            label="Add Meal"
            onClick={onMealClick}
          />
          <FabItem
            icon={getIcon({ type: 'drink', className: 'h-6 w-6' })}
            label="Add Drink"
            onClick={onDrinkClick}
          />
          <FabItem
            icon={getIcon({ type: 'ingredient', className: 'h-6 w-6' })}
            label="Add Ingredient"
            onClick={onIngredientClick}
          />
        </div>
      )}

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

const FabItem = ({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
}) => {
  return (
    <div
      className="font-bold bg-base-100 p-3 w-48 flex justify-end border rounded-lg shadow-sm"
      onClick={onClick}
      role="button"
    >
      {label}
      <Button size="lg" circle className="mx-2">
        {icon}
      </Button>
    </div>
  )
}
