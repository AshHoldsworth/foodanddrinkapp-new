import { deleteMeal } from '@/app/api/mealsApi'
import {
  COST_LABEL_BY_VALUE,
  DIFFICULTY_LABEL_BY_VALUE,
  HEALTHY_CHOICE_LABEL,
  SPEED_LABEL_BY_VALUE,
} from '@/constants'
import { Meal } from '@/models'
import Image from 'next/image'
import { Dispatch, SetStateAction, useState } from 'react'
import { AlertProps } from '../errors/Alert'
import { ConfirmModal } from '../modals/ConfirmModal'
import { Badge } from '../Badge'
import { IsNewOrRecentlyUpdated } from '../IsNewOrRecentlyUpdated'

interface MealCardProps {
  meal: Meal
  setAlertProps: Dispatch<SetStateAction<AlertProps | undefined>>
  onEdit: (meal: Meal) => void
  onDeleteSuccess: () => void | Promise<void>
}

export const MealCard = ({ meal, setAlertProps, onEdit, onDeleteSuccess }: MealCardProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const {
    id,
    name,
    imagePath,
    rating,
    isHealthyOption,
    cost,
    course,
    difficulty,
    speed,
    createdAt,
    updatedAt,
  } = meal

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

  return (
    <div className="card bg-base-100 w-96 shadow-lg grow" tabIndex={0} key={id}>
      <button type="button" className="w-full">
        <Image
          src={imagePath ? `/backend${imagePath}` : '/meal-placeholder.png'}
          alt="Meal Image"
          width={600}
          height={400}
          className="w-full h-auto object-cover cursor-pointer"
          loading="eager"
        />
      </button>

      <div className="card-body">
        <h2 className="card-title">
          {name}
          {<IsNewOrRecentlyUpdated createdAt={createdAt} updatedAt={updatedAt} />}
          {isHealthyOption && <Badge type={HEALTHY_CHOICE_LABEL} />}
        </h2>

        <div className="divider my-2"></div>

        <p>Rating: {rating} / 10 </p>
        <p>Difficulty: {DIFFICULTY_LABEL_BY_VALUE[difficulty]}</p>
        <p>Speed: {SPEED_LABEL_BY_VALUE[speed]}</p>
        <p>Cost: {COST_LABEL_BY_VALUE[cost]}</p>

        <div className="card-actions justify-start mt-2">
          <Badge type={course} />
        </div>

        <div className="card-actions justify-end mt-8">
          <button className="btn btn-outline" onClick={() => onEdit(meal)}>
            Edit
          </button>
          <button className="btn btn-error" onClick={() => setShowDeleteConfirm(true)}>
            Delete
          </button>
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
