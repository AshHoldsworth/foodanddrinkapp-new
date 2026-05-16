import { deleteMeal } from '@/app/api/mealsApi'
import { HEALTHY_CHOICE_LABEL, MACRO_BG_CLASS } from '@/constants'
import { Meal } from '@/models'
import Image from 'next/image'
import { Dispatch, SetStateAction, useState } from 'react'
import { AlertProps } from '../Alert'
import { ConfirmModal } from '../modals/ConfirmModal'
import { Badge } from '../Badge'
import { IsNewOrRecentlyUpdated } from '../IsNewOrRecentlyUpdated'
import { Button } from '../Button'
import { orderIngredients } from '@/utils/orderIngredients'

interface MealCardProps {
  meal: Meal
  setAlertProps: Dispatch<SetStateAction<AlertProps | undefined>>
  onEdit: (meal: Meal) => void
  onDeleteSuccess: () => void | Promise<void>
}

export const MealCard = ({ meal, setAlertProps, onEdit, onDeleteSuccess }: MealCardProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { id, name, imagePath, isHealthyOption, course, createdAt, updatedAt } = meal

  const onAlertCloseClick = () => {
    setAlertProps(undefined)
  }

  const onDelete = async () => {
    const { status, errorMessage } = await deleteMeal(id)

    if (status === 200) {
      await onDeleteSuccess()
      setAlertProps({
        type: 'success',
        message: 'Meal deleted.',
        onCloseClick: onAlertCloseClick,
      })
    } else {
      setAlertProps({
        type: 'error',
        message: errorMessage ?? 'Failed to delete meal',
        onCloseClick: onAlertCloseClick,
      })
    }
  }

  const orderedIngredients = orderIngredients(meal.ingredients)

  return (
    <div className="card bg-base-100 w-96 shadow-lg grow" tabIndex={0} key={id}>
      <Image
        src={imagePath ? `/backend${imagePath}` : '/meal-placeholder.png'}
        alt="Meal Image"
        width={600}
        height={400}
        className="w-full h-auto object-cover"
        loading="eager"
      />

      <div className="card-body">
        <h2 className="card-title">
          {name}
          {<IsNewOrRecentlyUpdated createdAt={createdAt} updatedAt={updatedAt} />}
          {isHealthyOption && <Badge type={HEALTHY_CHOICE_LABEL} />}
          <Badge type={course} />
        </h2>

        <div className="divider my-2"></div>

        <div className="flex flex-col gap-0.5">
          {orderedIngredients.map(({ ingredient }) => (
            <div
              key={ingredient.ingredientId}
              className={`flex items-center justify-between ${MACRO_BG_CLASS[ingredient.macro]} rounded px-2 py-2`}
            >
              <span className="font-bold">{ingredient.name}</span>
              <span>
                <span className="font-medium">{ingredient.quantity} </span>
                <span className="text-sm min-w-12 text-center">{ingredient.uoM}</span>
              </span>
            </div>
          ))}
        </div>

        <div className="card-actions justify-end mt-2">
          <Button variant="outline" onClick={() => onEdit(meal)}>
            Edit
          </Button>
          <Button tone="error" onClick={() => setShowDeleteConfirm(true)}>
            Delete
          </Button>
        </div>
      </div>

      {showDeleteConfirm && (
        <ConfirmModal
          title="Delete Meal"
          message={`Are you sure you want to delete ${name}?`}
          confirmLabel="Delete"
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={async () => {
            setShowDeleteConfirm(false)
            await onDelete()
          }}
        />
      )}
    </div>
  )
}
