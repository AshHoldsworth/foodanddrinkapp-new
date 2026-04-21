'use client'

import { deleteDrink, getDrinkData } from '@/app/api/drinkApi'
import { AddModal } from '@/components/modals/AddModal'
import { Button } from '@/components/Button'
import { Alert, AlertProps } from '@/components/errors/Alert'
import { ConfirmModal } from '@/components/modals/ConfirmModal'
import Loading from '@/components/Loading'
import { MealFilterBar } from '@/components/filters/MealFilterBar'
import { SearchBox } from '@/components/selectors/SearchBox'
import {
  COST_LABEL_BY_VALUE,
  DIFFICULTY_LABEL_BY_VALUE,
  HEALTHY_CHOICE_LABEL,
  MODAL_CONTENTS,
  SPEED_LABEL_BY_VALUE,
} from '@/constants'
import { Drink } from '@/models'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useDock } from '@/contexts/DockContext'
import { Badge } from '@/components/Badge'
import { consumePendingAlert } from '@/utils/pendingAlert'
import { NotFound } from '@/components/NotFound'

const COST_MAX = 3
const RATING_MAX = 10
const SPEED_MAX = 3

const DrinksPage = () => {
  const { setDockConfig, clearDockConfig } = useDock()
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

  useEffect(() => {
    const pendingAlert = consumePendingAlert()
    if (!pendingAlert) return

    setAlertProps({
      ...pendingAlert,
      onCloseClick: () => setAlertProps(undefined),
    })
  }, [])

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
    if (fetchError) {
      setAlertProps({
        type: 'error',
        message: fetchError,
        onCloseClick: () => setAlertProps(undefined),
      })
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filterBarProps = {
    onApplyFilters: () => {
      void fetchData()
    },
    onHealthyToggleChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setHealthyToggleState(e.target.checked),
    healthyToggleState,
    onNewOrUpdatedToggleChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setNewOrUpdatedToggleState(e.target.checked),
    newOrUpdatedToggleState,
    onCostChange: setCost,
    cost,
    onRatingChange: setRating,
    rating,
    onSpeedChange: setSpeed,
    speed,
  }

  useEffect(() => {
    setDockConfig({
      filterContent: (closeOverlay) => (
        <MealFilterBar
          {...filterBarProps}
          mobileDockMode={true}
          className="mx-0"
          closeOverlay={closeOverlay}
        />
      ),
    })

    return () => {
      clearDockConfig()
    }
  }, [setDockConfig, clearDockConfig])

  return (
    <>
      {loading ? (
        <div className="m-5">
          <Loading label="Loading Drinks..." />
        </div>
      ) : !error ? (
        <>
          <div className="mx-5 mt-3">
            <SearchBox
              onSearchChange={(e) => setSearchInput(e.target.value)}
              searchInput={searchInput}
              onClear={() => setSearchInput('')}
              className="p-2"
              placeholder="eg. Long Island Iced Tea"
            />
          </div>
          <div className="hidden sm:block">
            <MealFilterBar {...filterBarProps} />
          </div>
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
                      {drink.isHealthyOption && <Badge type={HEALTHY_CHOICE_LABEL} />}
                    </div>

                    <div className="card-actions justify-end">
                      <Button variant="outline" onClick={() => setEditingDrink(drink)}>
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        tone="error"
                        onClick={() => setPendingDeleteDrink(drink)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <NotFound label="Drink" />
            )}
          </div>
        </>
      ) : (
        <div className="my-20 flex flex-col items-center gap-4">
          <p className="text-sm opacity-70">Unable to load drinks.</p>
          <Button variant="outline" onClick={() => void fetchData()}>
            Retry
          </Button>
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
              await fetchData()
              setAlertProps({
                type: 'success',
                message: 'Drink deleted.',
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
        />
      )}

      {editingDrink && (
        <AddModal
          setShowAddModal={(show) => {
            if (!show) {
              setEditingDrink(null)
            }
          }}
          modalContents={{ ...MODAL_CONTENTS.drink }}
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
