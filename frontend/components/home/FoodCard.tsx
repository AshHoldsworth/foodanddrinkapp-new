import { deleteFood } from '@/app/api/foodApi'
import { costMapping, difficultyMapping, speedMapping } from '@/utils/foodMappings'
import { isNewOrRecentlyUpdated } from '@/utils/isNewOrRecentlyUpdated'
import Image from 'next/image'
import Link from 'next/link'
import { Dispatch, SetStateAction, useState } from 'react'
import { AlertProps } from '../Alert'
import { ConfirmModal } from '../ConfirmModal'

interface FoodCardProps {
  id: string
  name: string
  imagePath?: string | null
  rating: number
  isHealthyOption: boolean
  cost: number
  course: string
  difficulty: number
  speed: number
  createdAt: Date
  updatedAt: Date | null
  setAlertProps: Dispatch<SetStateAction<AlertProps | undefined>>
}

export const FoodCard = ({
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
  setAlertProps,
}: FoodCardProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const onAlertCloseClick = () => {
    setAlertProps(undefined)
  }

  const onEdit = () => {
    console.log('Edit Clicked')
  }

  const onDelete = async () => {
    const { status, errorMessage } = await deleteFood(id)

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
      <Link href={`/food/${id}`}>
        <Image
          src={imagePath ? `/backend${imagePath}` : '/food-placeholder.png'}
          alt="Food Image"
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
          <button className="btn btn-outline" onClick={onEdit}>
            Edit
          </button>
          <button className="btn btn-outline btn-error" onClick={() => setShowDeleteConfirm(true)}>
            Delete
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <ConfirmModal
          title="Delete Food"
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
