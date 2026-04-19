import { deleteMeal } from '@/app/api/mealsApi'
import { AlertProps } from '@/components/errors/Alert'
import {
  COST_LABEL_BY_VALUE,
  DIFFICULTY_LABEL_BY_VALUE,
  HEALTHY_CHOICE_LABEL,
  NEW_OR_UPDATED_LABEL,
  SPEED_LABEL_BY_VALUE,
} from '@/constants'
import { Meal } from '@/models'
import { getMacroOrder } from '@/utils/macroOrder'
import Image from 'next/image'
import { Dispatch, SetStateAction, useState } from 'react'
import { ConfirmModal } from './ConfirmModal'
import { isNewOrRecentlyUpdated } from '@/utils/isNewOrRecentlyUpdated'
import { Badge } from '../Badge'

interface MealDetailsModalProps {
  meal: Meal
  onClose: () => void
  onEdit: (meal: Meal) => void
  onDeleteSuccess: () => void | Promise<void>
  setAlertProps: Dispatch<SetStateAction<AlertProps | undefined>>
}

export const MealDetailsModal = ({
  meal,
  onClose,
  onEdit,
  onDeleteSuccess,
  setAlertProps,
}: MealDetailsModalProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const recentlyUpdated = isNewOrRecentlyUpdated(meal.createdAt, meal.updatedAt)

  const onAlertCloseClick = () => {
    setAlertProps(undefined)
  }

  const onDelete = async () => {
    const { status, errorMessage } = await deleteMeal(meal.id)

    if (status === 200) {
      await onDeleteSuccess()
      return
    }

    setAlertProps({
      type: 'error',
      message: errorMessage ?? 'Failed to delete meal',
      onCloseClick: onAlertCloseClick,
    })
  }

  const orderedIngredients = meal.ingredients
    .map((ingredient, originalIndex) => ({ ingredient, originalIndex }))
    .sort((a, b) => {
      const macroOrderDifference =
        getMacroOrder(a.ingredient.macro) - getMacroOrder(b.ingredient.macro)
      if (macroOrderDifference !== 0) return macroOrderDifference

      const nameDifference = a.ingredient.name.localeCompare(b.ingredient.name)
      if (nameDifference !== 0) return nameDifference

      return a.originalIndex - b.originalIndex
    })

  return (
    <>
      <div className="w-screen h-screen z-100 flex justify-center items-start sm:items-center fixed top-0 left-0 bg-black/75 p-2 sm:p-4 overflow-y-auto">
        <div className="card bg-base-100 border-base-300 w-full max-w-5xl max-h-5/6 overflow-y-auto">
          <Image
            src={meal.imagePath ? `/backend${meal.imagePath}` : '/meal-placeholder.png'}
            alt={meal.name}
            width={1200}
            height={700}
            className="w-full"
          />

          <div className="card-body">
            <h2 className="card-title text-3xl">
              {meal.name}
              {recentlyUpdated && <Badge type="new" />}
            </h2>

            <div className="divider"></div>

            <p>Rating: {meal.rating} / 10</p>
            <p>Difficulty: {DIFFICULTY_LABEL_BY_VALUE[meal.difficulty]}</p>
            <p>Speed: {SPEED_LABEL_BY_VALUE[meal.speed]}</p>
            <p>Cost: {COST_LABEL_BY_VALUE[meal.cost]}</p>

            <div className="flex flex-wrap gap-2 mt-2">
              <Badge type={meal.course} />
              {meal.isHealthyOption && (
                <Badge type={HEALTHY_CHOICE_LABEL} />
              )}
            </div>

            <div className="divider my-2" />

            <h3 className="font-semibold">Ingredients</h3>
            <div className="flex flex-wrap gap-2">
              {orderedIngredients.map(({ ingredient, originalIndex }) => (
                <Badge key={`${ingredient.name}-${originalIndex}`} type={ingredient.macro} labelOverride={ingredient.name} />
              ))}
            </div>

            <div className="card-actions justify-end mt-4">
              <button className="btn btn-outline" onClick={() => onEdit(meal)}>
                Edit
              </button>
              <button className="btn btn-error" onClick={() => setShowDeleteConfirm(true)}>
                Delete
              </button>
              <button className="btn btn-outline btn-error" onClick={() => onClose()}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <ConfirmModal
          title="Delete Meal"
          message={`Are you sure you want to delete ${meal.name}?`}
          confirmLabel="Delete"
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={async () => {
            setShowDeleteConfirm(false)
            await onDelete()
          }}
        />
      )}
    </>
  )
}
