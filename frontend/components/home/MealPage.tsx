'use client'
import { useEffect, useState } from 'react'
import { Error } from '@/components/errors/Error'
import { MealFilterBar } from '@/components/home/MealFilterBar'
import { MealCardDisplay } from './MealCardDisplay'
import { MEAL_FILTER_LIMITS, MEAL_MODAL_CONTENTS } from '@/constants'
import { Meal } from '@/models'
import { Alert, AlertProps } from '../errors/Alert'
import { getMealData } from '@/app/api/mealApi'
import Loading from '../Loading'
import { AddModal } from '../modals/AddModal'

const MealPage = () => {
  const [mealItems, setMealItems] = useState<Meal[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState<string>('')
  const [healthyToggleState, setHealthyToggleState] = useState<boolean>(false)
  const [newOrUpdatedToggleState, setNewOrUpdatedToggleState] = useState<boolean>(false)
  const [cost, setCost] = useState<number>(MEAL_FILTER_LIMITS.costMax)
  const [rating, setRating] = useState<number>(MEAL_FILTER_LIMITS.ratingMax)
  const [speed, setSpeed] = useState<number>(MEAL_FILTER_LIMITS.speedMax)
  const [alertProps, setAlertProps] = useState<AlertProps | undefined>()
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    const { mealItems: data, error: fetchError } = await getMealData({
      search: searchInput || undefined,
      isHealthy: healthyToggleState || undefined,
      maxCost: cost < MEAL_FILTER_LIMITS.costMax ? cost : undefined,
      maxRating: rating < MEAL_FILTER_LIMITS.ratingMax ? rating : undefined,
      maxSpeed: speed < MEAL_FILTER_LIMITS.speedMax ? speed : undefined,
      newOrUpdated: newOrUpdatedToggleState || undefined,
    })

    setMealItems(data ?? [])
    setError(fetchError)
    setLoading(false)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchData()
  }, [])

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value)
  }

  const onSearchClear = () => {
    setSearchInput('')
  }

  const onHealthyToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHealthyToggleState(e.target.checked)
  }

  const onNewOrUpdatedToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewOrUpdatedToggleState(e.target.checked)
  }

  return (
    <>
      <MealFilterBar
        onSearchChange={onSearchChange}
        searchInput={searchInput}
        onSearchClear={onSearchClear}
        onApplyFilters={fetchData}
        onHealthyToggleChange={onHealthyToggleChange}
        healthyToggleState={healthyToggleState}
        onNewOrUpdatedToggleChange={onNewOrUpdatedToggleChange}
        newOrUpdatedToggleState={newOrUpdatedToggleState}
        onCostChange={setCost}
        cost={cost}
        onRatingChange={setRating}
        rating={rating}
        onSpeedChange={setSpeed}
        speed={speed}
      />

      {loading ? (
        <div className="my-20">
          <Loading />
        </div>
      ) : !error ? (
        <MealCardDisplay
          mealItems={mealItems}
          setAlertProps={setAlertProps}
          onEdit={(meal) => setEditingMeal(meal)}
        />
      ) : (
        <div className="my-20">
          <Error title="Error" message={error} onRetry={async () => window.location.reload()} />
        </div>
      )}

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
            void fetchData()
          }}
        />
      )}

      {alertProps && <Alert {...alertProps} />}
    </>
  )
}

export default MealPage
