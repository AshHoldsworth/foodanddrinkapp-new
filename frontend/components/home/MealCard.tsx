import { deleteMeal } from '@/app/api/mealApi'
import { Meal } from '@/models/meal'
import { costMapping, difficultyMapping, speedMapping } from '@/utils/mealMappings'
import { isNewOrRecentlyUpdated } from '@/utils/isNewOrRecentlyUpdated'
import Image from 'next/image'
import Link from 'next/link'
import { Dispatch, SetStateAction, useState } from 'react'
import { AlertProps } from '../Alert'
import { ConfirmModal } from '../ConfirmModal'

interface MealCardProps {
  meal: Meal
  setAlertProps: Dispatch<SetStateAction<AlertProps | undefined>>
  onEdit: (meal: Meal) => void
}

export const MealCard = ({ meal, setAlertProps, onEdit }: MealCardProps) => {
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
      window.location.reload()
    } else {
      setAlertProps({
        type: 'error',
        message: errorMessage!,
        onCloseClick: onAlertCloseClick,
      })
    }
  }

  const recentlyUpdated = isNewOrRecentlyUpdated(createdAt, updatedAt)

  return (
    <div className="card bg-base-100 w-96 shadow-sm grow" tabIndex={0} key={id}>
      <Link href={`/meals/${id}`}>
        <Image
          src={imagePath ? `/backend${imagePath}` : '/meal-placeholder.png'}
          alt="Meal Image"
          width={600}
          height={400}
          className="w-full h-auto object-cover"
        />
      </Link>

      <div className="card-body">
        <h2 className="card-title">
          {name}
          {recentlyUpdated && <div className="badge badge-secondary">UPDATED</div>}
        </h2>

        <p>Rating: {rating} / 10 </p>
        <p>Difficulty: {difficultyMapping[difficulty]}</p>
        <p>Speed: {speedMapping[speed]}</p>
        <p>Cost: {costMapping[cost]}</p>

        <div className="card-actions justify-start">
          <div className="badge badge-outline badge-primary">{course}</div>
          {isHealthyOption && (
            <div className="badge badge-outline badge-success">Healthy Choice</div>
          )}
        </div>

        <div className="card-actions justify-end">
          <button className="btn btn-outline" onClick={() => onEdit(meal)}>
            Edit
          </button>
          <button className="btn btn-outline btn-error" onClick={() => setShowDeleteConfirm(true)}>
            Delete
          </button>
          <button className="btn btn-outline btn-success" onClick={() => window.location.href = `/meals/${id}`}>
            Open
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
