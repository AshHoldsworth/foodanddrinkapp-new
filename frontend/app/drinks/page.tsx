'use client'

import { getFoodData } from '@/app/api/foodApi'
import { Error } from '@/components/Error'
import Loading from '@/components/Loading'
import { FoodFilterBar } from '@/components/home/FoodFilterBar'
import { FoodCardDisplay } from '@/components/home/FoodCardDisplay'
import { Alert, AlertProps } from '@/components/Alert'
import { Food } from '@/models/food'
import { useEffect, useState } from 'react'

const COST_MAX = 3
const RATING_MAX = 10
const SPEED_MAX = 3

const DrinksPage = () => {
  const [items, setItems] = useState<Food[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState<string>('')
  const [healthyToggleState, setHealthyToggleState] = useState<boolean>(false)
  const [newOrUpdatedToggleState, setNewOrUpdatedToggleState] = useState<boolean>(false)
  const [cost, setCost] = useState<number>(COST_MAX)
  const [rating, setRating] = useState<number>(RATING_MAX)
  const [speed, setSpeed] = useState<number>(SPEED_MAX)
  const [alertProps, setAlertProps] = useState<AlertProps | undefined>()

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    const { foodItems: data, error: fetchError } = await getFoodData({
      search: searchInput || undefined,
      isHealthy: healthyToggleState || undefined,
      maxCost: cost < COST_MAX ? cost : undefined,
      maxRating: rating < RATING_MAX ? rating : undefined,
      maxSpeed: speed < SPEED_MAX ? speed : undefined,
      newOrUpdated: newOrUpdatedToggleState || undefined,
    })

    setItems(data ?? [])
    setError(fetchError)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <FoodFilterBar
        onSearchChange={(e) => setSearchInput(e.target.value)}
        searchInput={searchInput}
        onSearchClear={() => setSearchInput('')}
        onApplyFilters={fetchData}
        onHealthyToggleChange={(e) => setHealthyToggleState(e.target.checked)}
        healthyToggleState={healthyToggleState}
        onNewOrUpdatedToggleChange={(e) => setNewOrUpdatedToggleState(e.target.checked)}
        newOrUpdatedToggleState={newOrUpdatedToggleState}
        onCostChange={setCost}
        cost={cost}
        onRatingChange={setRating}
        rating={rating}
        onSpeedChange={setSpeed}
        speed={speed}
      />

      {loading ? (
        <div className="my-20 flex justify-center">
          <Loading />
        </div>
      ) : !error ? (
        <FoodCardDisplay foodItems={items} setAlertProps={setAlertProps} />
      ) : (
        <div className="my-20">
          <Error title="Error" message={error} onRetry={async () => window.location.reload()} />
        </div>
      )}

      {alertProps && <Alert {...alertProps} />}
    </>
  )
}

export default DrinksPage