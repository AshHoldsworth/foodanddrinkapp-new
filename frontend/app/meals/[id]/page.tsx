'use client'

import { deleteMeal, getMealById } from '@/app/api/mealApi'
import { AddModal } from '@/components/modals/AddModal'
import { Alert, AlertProps } from '@/components/errors/Alert'
import { ConfirmModal } from '@/components/modals/ConfirmModal'
import { Error } from '@/components/errors/Error'
import Loading from '@/components/Loading'
import {
  COST_LABEL_BY_VALUE,
  DIFFICULTY_LABEL_BY_VALUE,
  getMacroOrder,
  HEALTHY_CHOICE_LABEL,
  MEAL_MODAL_CONTENTS,
  SPEED_LABEL_BY_VALUE,
} from '@/constants'
import { Meal } from '@/models'
import { ChevronLeftIcon } from '@heroicons/react/16/solid'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getMacroBadgeClass } from '@/utils/macroBadge'

const MealPage = () => {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [meal, setMeal] = useState<Meal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [alertProps, setAlertProps] = useState<AlertProps | undefined>()
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    const fetchMeal = async () => {
      setLoading(true)
      setError(null)

      const { meal: data, error: fetchError } = await getMealById(id)
      setMeal(data)
      setError(fetchError)
      setLoading(false)
    }

    if (id) {
      fetchMeal()
    }
  }, [id])

  if (loading) {
    return (
      <div className="my-20 flex justify-center">
        <Loading />
      </div>
    )
  }

  if (error || !meal) {
    return (
      <div className="my-20">
        <Error
          title="Error"
          message={error ?? 'Meal not found'}
          onRetry={async () => window.location.reload()}
        />
      </div>
    )
  }

  const onAlertCloseClick = () => {
    setAlertProps(undefined)
  }

  const onDelete = async () => {
    const { status, errorMessage } = await deleteMeal(id)

    if (status === 200) {
      router.push('/')
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
    <div className="mx-5 my-8">
      <div className="mb-4">
        <button className="btn btn-square" onClick={() => window.history.back()}>
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="card bg-base-100 border-base-300">
        <Image
          src={meal.imagePath ? `/backend${meal.imagePath}` : '/meal-placeholder.png'}
          alt={meal.name}
          width={600}
          height={400}
          className="w-full"
        />

        <div className="card-body">
          <h1 className="card-title text-3xl">{meal.name}</h1>

          <div className="card-actions justify-end">
            <button className="btn btn-outline" onClick={() => setEditingMeal(meal)}>
              Edit
            </button>
            <button
              className="btn btn-outline btn-error"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-2">
            <div className="badge badge-outline badge-primary">{meal.course}</div>
            {meal.isHealthyOption && (
              <div className="badge badge-outline badge-success">{HEALTHY_CHOICE_LABEL}</div>
            )}
          </div>

          <p>Rating: {meal.rating} / 10</p>
          <p>Difficulty: {DIFFICULTY_LABEL_BY_VALUE[meal.difficulty]}</p>
          <p>Speed: {SPEED_LABEL_BY_VALUE[meal.speed]}</p>
          <p>Cost: {COST_LABEL_BY_VALUE[meal.cost]}</p>

          <div className="divider my-2" />

          <h2 className="font-semibold">Ingredients</h2>
          <div className="flex flex-wrap gap-2">
            {orderedIngredients.map(({ ingredient, originalIndex }) => {
              const badgeClass = getMacroBadgeClass(ingredient.macro)

              return (
                <div key={`${ingredient.name}-${originalIndex}`} className={`badge ${badgeClass}`}>
                  {ingredient.name}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {editingMeal && (
        <AddModal
          setShowAddModal={(show) => {
            if (!show) {
              setEditingMeal(null)
            }
          }}
          modalContents={{ ...MEAL_MODAL_CONTENTS.meal }}
          setAlertProps={setAlertProps}
          initialValues={editingMeal}
          onSuccess={() => {
            setEditingMeal(null)
            window.location.reload()
          }}
        />
      )}

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

      {alertProps && <Alert {...alertProps} />}
    </div>
  )
}

export default MealPage
