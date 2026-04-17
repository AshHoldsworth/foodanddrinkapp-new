'use client'

import { useState } from 'react'
import { BeakerIcon, CakeIcon, PlusIcon, ShoppingCartIcon } from '@heroicons/react/16/solid'
import { AddModal } from '@/components/modals/AddModal'
import { Alert, AlertProps } from '@/components/errors/Alert'
import { MODAL_CONTENTS } from '@/constants'
import { ModalContents } from './modals/interfaces/AddModal'
import { useModal } from '@/contexts/ModalContext'

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
        <div className="fab">
          {/* a focusable div with tabIndex is necessary to work on all browsers. role="button" is necessary for accessibility */}
          <div tabIndex={0} role="button" className="btn btn-lg btn-circle btn-neutral">
            <PlusIcon className="h-6 w-6" />
          </div>

          {/* buttons that show up when FAB is open */}
          <FabItem icon={<CakeIcon className="h-6 w-6" />} label="Add Meal" onClick={onMealClick} />
          <FabItem
            icon={<BeakerIcon className="h-6 w-6" />}
            label="Add Drink"
            onClick={onDrinkClick}
          />
          <FabItem
            icon={<ShoppingCartIcon className="h-6 w-6" />}
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
      <button className="btn btn-lg btn-circle mx-2">{icon}</button>
    </div>
  )
}
