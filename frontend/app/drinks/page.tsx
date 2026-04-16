'use client'

import { deleteDrink, getDrinkData } from '@/app/api/mealApi'
import { AddModal } from '@/components/modals/AddModal'
import { Alert, AlertProps } from '@/components/errors/Alert'
import { ConfirmModal } from '@/components/modals/ConfirmModal'
import { Error } from '@/components/errors/Error'
import Loading from '@/components/Loading'
import { MealFilterBar } from '@/components/home/MealFilterBar'
import {
  COST_LABEL_BY_VALUE,
  DIFFICULTY_LABEL_BY_VALUE,
  HEALTHY_CHOICE_LABEL,
  MEAL_MODAL_CONTENTS,
  SPEED_LABEL_BY_VALUE,
} from '@/constants'
import { Drink } from '@/models'
import { useEffect, useState } from 'react'
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
  const [pendingDeleteDrink, setPendingDeleteDrink] = useState<Drink | null>(null)
  const [editingDrink, setEditingDrink] = useState<Drink | null>(null)

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
      <MealFilterBar
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
              <div
                key={drink.id}
                className="card bg-base-100 w-96 shadow-sm grow border border-base-300"
              >
                <Image
                  src={drink.imagePath ? `/backend${drink.imagePath}` : '/meal-placeholder.png'}
                  alt={drink.name}
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                />
                <div className="card-body">
                  <h2 className="card-title">{drink.name}</h2>
                  <p>Rating: {drink.rating} / 10</p>
                  <p>Difficulty: {DIFFICULTY_LABEL_BY_VALUE[drink.difficulty]}</p>
                  <p>Speed: {SPEED_LABEL_BY_VALUE[drink.speed]}</p>
                  <p>Cost: {COST_LABEL_BY_VALUE[drink.cost]}</p>

                  <div className="card-actions justify-start">
                    {drink.isHealthyOption && (
                      <div className="badge badge-outline badge-success">
                        {HEALTHY_CHOICE_LABEL}
                      </div>
                    )}
                  </div>

                  <div className="card-actions justify-end">
                    <button className="btn btn-outline" onClick={() => setEditingDrink(drink)}>
                      Edit
                    </button>
                    <button
                      className="btn btn-outline btn-error"
                      onClick={() => setPendingDeleteDrink(drink)}
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

      {pendingDeleteDrink && (
        <ConfirmModal
          title="Delete Drink"
          message={`Are you sure you want to delete ${pendingDeleteDrink.name}?`}
          confirmLabel="Delete"
          onCancel={() => setPendingDeleteDrink(null)}
          onConfirm={async () => {
            const drinkToDelete = pendingDeleteDrink
            setPendingDeleteDrink(null)

            const { status, errorMessage } = await deleteDrink(drinkToDelete.id)
            if (status === 200) {
              window.location.reload()
            } else {
              setAlertProps({
                type: 'error',
                message: errorMessage ?? 'Failed to delete drink',
                onCloseClick: () => setAlertProps(undefined),
              })
            }
          }}
        />
      )}

      {editingDrink && (
        <AddModal
          setShowAddModal={(show) => {
            if (!show) {
              setEditingDrink(null)
            }
          }}
          modalContents={{ ...MEAL_MODAL_CONTENTS.drink }}
          setAlertProps={setAlertProps}
          initialValues={editingDrink}
          onSuccess={() => {
            setEditingDrink(null)
            void fetchData()
          }}
        />
      )}

      {alertProps && <Alert {...alertProps} />}
    </>
  )
}

export default DrinksPage
