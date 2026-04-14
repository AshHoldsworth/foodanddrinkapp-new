'use client'

import { deleteDrink, getDrinkData } from '@/app/api/foodApi'
import { Error } from '@/components/Error'
import Loading from '@/components/Loading'
import { FoodFilterBar } from '@/components/home/FoodFilterBar'
import { Alert, AlertProps } from '@/components/Alert'
import { Drink } from '@/models/drink'
import { useEffect, useState } from 'react'
import { costMapping, difficultyMapping, speedMapping } from '@/utils/foodMappings'
import Image from 'next/image'

const COST_MAX = 3
const RATING_MAX = 10
const SPEED_MAX = 3

const DrinksPage = () => {
  const [items, setItems] = useState<Drink[]>([])
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

    const { drinks: data, error: fetchError } = await getDrinkData({
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
        <div className="flex flex-wrap gap-5 justify-start py-8 mx-5">
          {items.length > 0 ? (
            items.map((drink) => (
              <div key={drink.id} className="card bg-base-100 w-96 shadow-sm grow border border-base-300">
                <Image
                  src={drink.imagePath ? `/backend${drink.imagePath}` : '/food-placeholder.png'}
                  alt={drink.name}
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                />
                <div className="card-body">
                  <h2 className="card-title">{drink.name}</h2>
                  <p>Rating: {drink.rating} / 10</p>
                  <p>Difficulty: {difficultyMapping[drink.difficulty]}</p>
                  <p>Speed: {speedMapping[drink.speed]}</p>
                  <p>Cost: {costMapping[drink.cost]}</p>

                  <div className="card-actions justify-start">
                    {drink.isHealthyOption && <div className="badge badge-outline badge-success">Healthy Choice</div>}
                  </div>

                  <div className="card-actions justify-end">
                    <button
                      className="btn btn-outline btn-error"
                      onClick={async () => {
                        const { status, errorMessage } = await deleteDrink(drink.id)
                        if (status === 200) {
                          setItems((prev) => prev.filter((d) => d.id !== drink.id))
                          setAlertProps({
                            type: 'success',
                            message: `Drink ${drink.name} deleted successfully`,
                            onCloseClick: () => setAlertProps(undefined),
                          })
                        } else {
                          setAlertProps({
                            type: 'error',
                            message: errorMessage ?? 'Failed to delete drink',
                            onCloseClick: () => setAlertProps(undefined),
                          })
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div>No drink items</div>
          )}
        </div>
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