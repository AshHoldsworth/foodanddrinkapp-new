'use client'

import { useState } from 'react'
import { PlusIcon } from '@heroicons/react/16/solid'
import { MealModal } from '@/components/modals/MealModal'
import { IngredientModal } from '@/components/modals/IngredientModal'
import { Alert, AlertProps } from '@/components/Alert'
import { Button } from '@/components/Button'
import { useModal } from '@/contexts/ModalContext'
import { getIcon } from '@/utils/getIcon'

type AddModalKind = 'meal' | 'ingredient' | null

export const FloatingActionButton = () => {
  const [addModalKind, setAddModalKind] = useState<AddModalKind>(null)
  const [alertProps, setAlertProps] = useState<AlertProps | undefined>()
  const { isModalOpen, openModal, closeModal } = useModal()

  const onMealClick = () => {
    setAddModalKind('meal')
    openModal()
  }

  const onIngredientClick = () => {
    setAddModalKind('ingredient')
    openModal()
  }

  const closeAddModal = () => {
    setAddModalKind(null)
    closeModal()
  }

  return (
    <>
      {!addModalKind && !isModalOpen && (
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
            icon={getIcon({ type: 'ingredient', className: 'h-6 w-6' })}
            label="Add Ingredient"
            onClick={onIngredientClick}
          />
        </div>
      )}

      {addModalKind === 'meal' && (
        <MealModal
          setOpen={(open) => {
            if (!open) {
              closeAddModal()
            }
          }}
          setAlertProps={setAlertProps}
        />
      )}

      {addModalKind === 'ingredient' && (
        <IngredientModal
          setOpen={(open) => {
            if (!open) {
              closeAddModal()
            }
          }}
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
