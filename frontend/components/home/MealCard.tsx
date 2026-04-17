import { deleteMeal } from '@/app/api/mealsApi'
import {
  COST_LABEL_BY_VALUE,
  DIFFICULTY_LABEL_BY_VALUE,
  HEALTHY_CHOICE_LABEL,
  NEW_OR_UPDATED_LABEL,
  SPEED_LABEL_BY_VALUE,
} from '@/constants'
import { Meal } from '@/models'
import { isNewOrRecentlyUpdated } from '@/utils/isNewOrRecentlyUpdated'
import Image from 'next/image'
import { Dispatch, SetStateAction, useState } from 'react'
import { AlertProps } from '../errors/Alert'
import { ConfirmModal } from '../modals/ConfirmModal'

interface MealCardProps {
  meal: Meal
  setAlertProps: Dispatch<SetStateAction<AlertProps | undefined>>
  onEdit: (meal: Meal) => void
  onOpen: (meal: Meal) => void
  onDeleteSuccess: () => void | Promise<void>
}

export const MealCard = ({
  meal,
  setAlertProps,
  onEdit,
  // onOpen,
  onDeleteSuccess,
}: MealCardProps) => {
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
    } else {
      setAlertProps({
        type: 'error',
        message: errorMessage ?? 'Failed to delete meal',
        onCloseClick: onAlertCloseClick,
      })
    }
  }

  const recentlyUpdated = isNewOrRecentlyUpdated(createdAt, updatedAt)

  return (
    <div className="card bg-base-100 w-96 shadow-sm grow" tabIndex={0} key={id}>
      <button type="button" className="w-full" onClick={() => {} /* onOpen(meal) */}>
        <Image
          src={imagePath ? `/backend${imagePath}` : '/meal-placeholder.png'}
          alt="Meal Image"
          width={600}
          height={400}
          className="w-full h-auto object-cover cursor-pointer"
        />
      </button>

      <div className="card-body">
        <h2 className="card-title">
          {name}
          {recentlyUpdated && <div className="badge badge-secondary">{NEW_OR_UPDATED_LABEL}</div>}
        </h2>

        <hr className="my-2" />

        <p>Rating: {rating} / 10 </p>
        <p>Difficulty: {DIFFICULTY_LABEL_BY_VALUE[difficulty]}</p>
        <p>Speed: {SPEED_LABEL_BY_VALUE[speed]}</p>
        <p>Cost: {COST_LABEL_BY_VALUE[cost]}</p>

        <div className="card-actions justify-start mt-2">
          <div className="badge badge-outline badge-primary">{course}</div>
          {isHealthyOption && (
            <div className="badge badge-outline badge-success">{HEALTHY_CHOICE_LABEL}</div>
          )}
        </div>

        <div className="card-actions justify-end mt-2">
          <button className="btn btn-outline" onClick={() => onEdit(meal)}>
            Edit
          </button>
          <button className="btn btn-error" onClick={() => setShowDeleteConfirm(true)}>
            Delete
          </button>
          {/* <button className="btn btn-outline btn-success" onClick={() => onOpen(meal)}>
            Open
          </button> */}
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
