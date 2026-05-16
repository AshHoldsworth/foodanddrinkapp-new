'use client'
import { useEffect, useState } from 'react'
import { MealFilterBar } from '@/components/filters/MealFilterBar'
import { Meal } from '@/models'
import { getMealData } from '@/app/api/mealsApi'
import { useModal } from '@/contexts/ModalContext'
import { useDock } from '@/contexts/DockContext'
import { SearchBox } from '@/components/selectors/SearchBox'
import { Button } from '@/components/Button'
import { Alert, AlertProps } from '@/components/Alert'
import Loading from '@/components/Loading'
import { MealCardDisplay } from '@/components/MealCardDisplay'
import { MealModal } from '@/components/modals/MealModal'
import { consumePendingAlert } from '@/utils/pendingAlert'

const MealPage = () => {
  const { openModal, closeModal } = useModal()

  const [mealItems, setMealItems] = useState<Meal[]>([])
  const [mealItemsToRender, setMealItemsToRender] = useState<Meal[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [alertProps, setAlertProps] = useState<AlertProps | undefined>()

  const [searchInput, setSearchInput] = useState<string>('')

  const [healthyToggleState, setHealthyToggleState] = useState<boolean>(false)
  const [newOrUpdatedToggleState, setNewOrUpdatedToggleState] = useState<boolean>(false)

  const [editingMeal, setEditingMeal] = useState<Meal | null>(null)

  const { setDockConfig, clearDockConfig } = useDock()

  useEffect(() => {
    if (editingMeal) {
      openModal()
    } else {
      closeModal()
    }
  }, [editingMeal, openModal, closeModal])

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

    const { mealItems: data, error: fetchError } = await getMealData({
      search: searchInput || undefined,
      isHealthy: healthyToggleState || undefined,
      newOrUpdated: newOrUpdatedToggleState || undefined,
    })

    setMealItems(data ?? [])
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const filtered = mealItems.filter((meal) =>
      meal.name.toLowerCase().includes(searchInput.toLowerCase()),
    )
    setMealItemsToRender(filtered)
  }, [searchInput, mealItems])

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
      <div className="hidden sm:block">
        <MealFilterBar {...filterBarProps} />
      </div>
      {loading ? (
        <div className="m-5">
          <Loading label="Loading Meals..." />
        </div>
      ) : !error ? (
        <>
          <div className="mx-5 mt-3">
            <SearchBox
              onSearchChange={onSearchChange}
              searchInput={searchInput}
              onClear={onSearchClear}
              className="p-2"
            />
          </div>
          <MealCardDisplay
            mealItems={mealItemsToRender}
            setAlertProps={setAlertProps}
            onEdit={(meal) => setEditingMeal(meal)}
            onDeleteSuccess={fetchData}
          />
        </>
      ) : (
        <div className="my-20 flex flex-col items-center gap-4">
          <p className="text-sm opacity-70">Unable to load meals.</p>
          <Button variant="outline" onClick={() => void fetchData()}>
            Retry
          </Button>
        </div>
      )}

      {editingMeal && (
        <MealModal
          setOpen={(open) => {
            if (!open) {
              setEditingMeal(null)
            }
          }}
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
