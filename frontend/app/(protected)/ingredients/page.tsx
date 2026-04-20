'use client'

import { deleteIngredient, getIngredientData } from '@/app/api/ingredientApi'
import { AddModal } from '@/components/modals/AddModal'
import { Alert, AlertProps } from '@/components/errors/Alert'
import Loading from '@/components/Loading'
import { ConfirmModal } from '@/components/modals/ConfirmModal'
import { SearchBox } from '@/components/selectors/SearchBox'
import { MODAL_CONTENTS, MacroOption } from '@/constants'
import { Ingredient } from '@/models'
import { useEffect, useState } from 'react'
import { useDock } from '@/contexts/DockContext'
import { IngredientFilterBar } from '@/components/filters/IngredientFilterBar'
import { IngredientCard } from '@/components/cards/IngredientCard'
import { consumePendingAlert } from '@/utils/pendingAlert'

const COST_MAX = 3
const RATING_MAX = 10

const IngredientsPage = () => {
  const { setDockConfig, clearDockConfig } = useDock()
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [alertProps, setAlertProps] = useState<AlertProps | undefined>()
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null)
  const [pendingDeleteIngredient, setPendingDeleteIngredient] = useState<Ingredient | null>(null)

  const [searchInput, setSearchInput] = useState<string>('')
  const [healthyToggleState, setHealthyToggleState] = useState<boolean>(false)
  const [cost, setCost] = useState<number>(COST_MAX)
  const [rating, setRating] = useState<number>(RATING_MAX)
  const [macro, setMacro] = useState<'' | MacroOption>('')

  useEffect(() => {
    const pendingAlert = consumePendingAlert()
    if (!pendingAlert) return

    setAlertProps({
      ...pendingAlert,
      onCloseClick: () => setAlertProps(undefined),
    })
  }, [])

  const fetchIngredients = async () => {
    setLoading(true)
    setError(null)

    const { ingredients: data, error: fetchError } = await getIngredientData({
      search: searchInput || undefined,
      isHealthy: healthyToggleState || undefined,
      maxCost: cost < COST_MAX ? cost : undefined,
      maxRating: rating < RATING_MAX ? rating : undefined,
      macro: macro || undefined,
    })

    setIngredients(data ?? [])
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
    fetchIngredients()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filterBarProps = {
    onApplyFilters: () => {
      void fetchIngredients()
    },
    onHealthyToggleChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setHealthyToggleState(e.target.checked),
    healthyToggleState,
    onCostChange: setCost,
    cost,
    onRatingChange: setRating,
    rating,
    macroValue: macro,
    onMacroChange: setMacro,
  }

  useEffect(() => {
    setDockConfig({
      filterContent: (closeOverlay) => (
        <IngredientFilterBar
          {...filterBarProps}
          mobileDockMode={true}
          closeOverlay={closeOverlay}
        />
      ),
    })

    return () => {
      clearDockConfig()
    }
  }, [filterBarProps, setDockConfig, clearDockConfig])

  return (
    <>
      <div className="hidden sm:block mx-5">
        <IngredientFilterBar {...filterBarProps} />
      </div>

      {loading ? (
        <div className="my-20 flex justify-center">
          <Loading />
        </div>
      ) : !error ? (
        <>
          <div className="mx-5 mt-3">
            <SearchBox
              onSearchChange={(e) => setSearchInput(e.target.value)}
              searchInput={searchInput}
              onClear={() => setSearchInput('')}
              className="p-2"
            />
          </div>
          <div className="flex flex-wrap gap-5 justify-start py-4 mx-5">
            {ingredients.length > 0 ? (
              ingredients.map((ingredient) => (
                <IngredientCard
                  key={ingredient.id}
                  ingredient={ingredient}
                  setEditingIngredient={setEditingIngredient}
                  setPendingDeleteIngredient={setPendingDeleteIngredient}
                />
              ))
            ) : (
              <div>No ingredient items</div>
            )}
          </div>
        </>
      ) : (
        <div className="my-20 flex flex-col items-center gap-4">
          <p className="text-sm opacity-70">Unable to load ingredients.</p>
          <button className="btn btn-outline" onClick={() => void fetchIngredients()}>
            Retry
          </button>
        </div>
      )}

      {pendingDeleteIngredient && (
        <ConfirmModal
          title="Delete Ingredient"
          message={`Are you sure you want to delete ${pendingDeleteIngredient.name}?`}
          confirmLabel="Delete"
          onCancel={() => setPendingDeleteIngredient(null)}
          onConfirm={async () => {
            const ingredientToDelete = pendingDeleteIngredient
            setPendingDeleteIngredient(null)

            const { status, errorMessage } = await deleteIngredient(ingredientToDelete.id)
            if (status === 200) {
              await fetchIngredients()
              setAlertProps({
                type: 'success',
                message: 'Ingredient deleted.',
                onCloseClick: () => setAlertProps(undefined),
              })
            } else {
              setAlertProps({
                type: 'error',
                message: errorMessage ?? 'Failed to delete ingredient',
                onCloseClick: () => setAlertProps(undefined),
              })
            }
          }}
        />
      )}

      {editingIngredient && (
        <AddModal
          setShowAddModal={(show) => {
            if (!show) {
              setEditingIngredient(null)
            }
          }}
          modalContents={{ ...MODAL_CONTENTS.ingredient }}
          setAlertProps={setAlertProps}
          initialValues={editingIngredient}
          onSuccess={() => {
            setEditingIngredient(null)
            void fetchIngredients()
          }}
        />
      )}

      {alertProps && <Alert {...alertProps} />}
    </>
  )
}

export default IngredientsPage
