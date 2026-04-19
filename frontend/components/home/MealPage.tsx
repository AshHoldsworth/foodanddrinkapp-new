'use client'
import { useEffect, useState } from 'react'
import { Error } from '@/components/errors/Error'
import { MealFilterBar } from '@/components/home/MealFilterBar'
import { MealCardDisplay } from './MealCardDisplay'
import { FILTER_LIMITS, MODAL_CONTENTS } from '@/constants'
import { Meal } from '@/models'
import { Alert, AlertProps } from '../errors/Alert'
import { getMealData } from '@/app/api/mealsApi'
import Loading from '../Loading'
import { AddModal } from '../modals/AddModal'
import { MealDetailsModal } from '../modals/MealDetailsModal'
import { useModal } from '@/contexts/ModalContext'
import { useDock } from '@/contexts/DockContext'
import { SearchBox } from '@/components/selectors/SearchBox'

const MealPage = () => {
  const { openModal, closeModal } = useModal()

  const [mealItems, setMealItems] = useState<Meal[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [alertProps, setAlertProps] = useState<AlertProps | undefined>()

  const [searchInput, setSearchInput] = useState<string>('')

  const [healthyToggleState, setHealthyToggleState] = useState<boolean>(false)
  const [newOrUpdatedToggleState, setNewOrUpdatedToggleState] = useState<boolean>(false)
  const [cost, setCost] = useState<number>(FILTER_LIMITS.costMax)
  const [rating, setRating] = useState<number>(FILTER_LIMITS.ratingMax)
  const [speed, setSpeed] = useState<number>(FILTER_LIMITS.speedMax)

  const [editingMeal, setEditingMeal] = useState<Meal | null>(null)
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null)

  const { setDockConfig, clearDockConfig } = useDock()

  useEffect(() => {
    if (editingMeal || selectedMeal) {
      openModal()
    } else {
      closeModal()
    }
  }, [editingMeal, selectedMeal, openModal, closeModal])

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    const { mealItems: data, error: fetchError } = await getMealData({
      search: searchInput || undefined,
      isHealthy: healthyToggleState || undefined,
      maxCost: cost < FILTER_LIMITS.costMax ? cost : undefined,
      maxRating: rating < FILTER_LIMITS.ratingMax ? rating : undefined,
      maxSpeed: speed < FILTER_LIMITS.speedMax ? speed : undefined,
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

  const filterBarProps = {
    onApplyFilters: () => {
      fetchData()
    },
    onHealthyToggleChange,
    healthyToggleState,
    onNewOrUpdatedToggleChange,
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
      <div className="mx-5 mt-3">
        <SearchBox
          onSearchChange={onSearchChange}
          searchInput={searchInput}
          onClear={onSearchClear}
          className="p-2"
        />
      </div>
      <div className="hidden sm:block">
        <MealFilterBar {...filterBarProps} />
      </div>
      {loading ? (
        <div className="my-20">
          <Loading />
        </div>
      ) : !error ? (
        <MealCardDisplay
          mealItems={mealItems}
          setAlertProps={setAlertProps}
          onEdit={(meal) => setEditingMeal(meal)}
          onDeleteSuccess={fetchData}
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
          modalContents={{ ...MODAL_CONTENTS.meal }}
          setAlertProps={setAlertProps}
          initialValues={editingMeal}
          onSuccess={() => {
            setEditingMeal(null)
            void fetchData()
          }}
        />
      )}

      {selectedMeal && (
        <MealDetailsModal
          meal={selectedMeal}
          onClose={() => {
            setSelectedMeal(null)
          }}
          onEdit={(meal: Meal) => {
            setSelectedMeal(null)
            setEditingMeal(meal)
          }}
          onDeleteSuccess={async () => {
            setSelectedMeal(null)
            await fetchData()
          }}
          setAlertProps={setAlertProps}
        />
      )}

      {alertProps && <Alert {...alertProps} />}
    </>
  )
}

export default MealPage
