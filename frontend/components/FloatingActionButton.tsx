'use client'

import { useState } from 'react'
import { BeakerIcon, CakeIcon, PlusIcon, ShoppingCartIcon } from '@heroicons/react/16/solid'
import { AddModal, ModalContents } from '@/components/AddModal'
import { Alert, AlertProps } from '@/components/Alert'
import { FOOD_MODAL_CONTENTS } from '@/constants/food'

export const FloatingActionButton = () => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false)
  const [modalContents, setModalContents] = useState<ModalContents | null>(null)
  const [alertProps, setAlertProps] = useState<AlertProps | undefined>()

  const onFoodClick = () => {
    setModalContents({ ...FOOD_MODAL_CONTENTS.food })
    setShowAddModal(true)
  }

  const onDrinkClick = () => {
    setModalContents({ ...FOOD_MODAL_CONTENTS.drink })
    setShowAddModal(true)
  }

  const onIngredientClick = () => {
    setModalContents({ ...FOOD_MODAL_CONTENTS.ingredient })
    setShowAddModal(true)
  }

  return (
    <>
      {!showAddModal && (
        <div className="fab">
          {/* a focusable div with tabIndex is necessary to work on all browsers. role="button" is necessary for accessibility */}
          <div tabIndex={0} role="button" className="btn btn-lg btn-circle btn-neutral">
            <PlusIcon className="h-6 w-6" />
          </div>

          {/* buttons that show up when FAB is open */}
          <FabItem icon={<CakeIcon className="h-6 w-6" />} label="Add Food" onClick={onFoodClick} />
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
          setShowAddModal={setShowAddModal}
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
