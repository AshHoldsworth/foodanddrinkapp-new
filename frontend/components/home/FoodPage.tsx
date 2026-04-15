'use client'
import { useEffect, useState } from 'react'
import { Error } from '@/components/Error'
import { FoodFilterBar } from '@/components/home/FoodFilterBar'
import { FoodCardDisplay } from './FoodCardDisplay'
import { Food } from '@/models/food'
import { Alert, AlertProps } from '../Alert'
import { getFoodData } from '@/app/api/foodApi'
import { FOOD_FILTER_LIMITS, FOOD_MODAL_CONTENTS } from '../../constants/food'
import Loading from '../Loading'
import { AddModal } from '../AddModal'

const FoodPage = () => {
  const [foodItems, setFoodItems] = useState<Food[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState<string>('')
  const [healthyToggleState, setHealthyToggleState] = useState<boolean>(false)
  const [newOrUpdatedToggleState, setNewOrUpdatedToggleState] = useState<boolean>(false)
  const [cost, setCost] = useState<number>(FOOD_FILTER_LIMITS.costMax)
  const [rating, setRating] = useState<number>(FOOD_FILTER_LIMITS.ratingMax)
  const [speed, setSpeed] = useState<number>(FOOD_FILTER_LIMITS.speedMax)
  const [alertProps, setAlertProps] = useState<AlertProps | undefined>()
  const [editingFood, setEditingFood] = useState<Food | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    const { foodItems: data, error: fetchError } = await getFoodData({
      search: searchInput || undefined,
      isHealthy: healthyToggleState || undefined,
      maxCost: cost < FOOD_FILTER_LIMITS.costMax ? cost : undefined,
      maxRating: rating < FOOD_FILTER_LIMITS.ratingMax ? rating : undefined,
      maxSpeed: speed < FOOD_FILTER_LIMITS.speedMax ? speed : undefined,
      newOrUpdated: newOrUpdatedToggleState || undefined,
    })

    setFoodItems(data ?? [])
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

  const onCostChange = (value: number) => {
    setCost(value)
  }

  const onRatingChange = (value: number) => {
    setRating(value)
  }

  const onSpeedChange = (value: number) => {
    setSpeed(value)
  }

  return (
    <>
      <FoodFilterBar
        onSearchChange={onSearchChange}
        searchInput={searchInput}
        onSearchClear={onSearchClear}
        onApplyFilters={fetchData}
        onHealthyToggleChange={onHealthyToggleChange}
        healthyToggleState={healthyToggleState}
        onNewOrUpdatedToggleChange={onNewOrUpdatedToggleChange}
        newOrUpdatedToggleState={newOrUpdatedToggleState}
        onCostChange={onCostChange}
        cost={cost}
        onRatingChange={onRatingChange}
        rating={rating}
        onSpeedChange={onSpeedChange}
        speed={speed}
      />

      {loading ? (
        <div className="my-20">
          <Loading />
        </div>
      ) : !error ? (
        <FoodCardDisplay
          foodItems={foodItems}
          setAlertProps={setAlertProps}
          onEdit={(food) => setEditingFood(food)}
        />
      ) : (
        <div className="my-20">
          <Error title="Error" message={error} onRetry={async () => window.location.reload()} />
        </div>
      )}

      {editingFood && (
        <AddModal
          setShowAddModal={(show) => {
            if (!show) {
              setEditingFood(null)
            }
          }}
          modalContents={{ ...FOOD_MODAL_CONTENTS.food }}
          setAlertProps={setAlertProps}
          initialValues={editingFood}
          onSuccess={() => {
            setEditingFood(null)
            void fetchData()
          }}
        />
      )}

      {alertProps && <Alert {...alertProps} />}
    </>
  )
}

export default FoodPage
