'use client'

import { getIngredientData } from '@/app/api/ingredientApi'
import { AddModal } from '@/components/modals/AddModal'
import { Alert, AlertProps } from '@/components/errors/Alert'
import { Error } from '@/components/errors/Error'
import Loading from '@/components/Loading'
import { SearchBox } from '@/components/selectors/SearchBox'
import { COST_LABEL_BY_VALUE, HEALTHY_CHOICE_LABEL, MODAL_CONTENTS } from '@/constants'
import { Ingredient } from '@/models'
import { useEffect, useState } from 'react'
import { useDock } from '@/contexts/DockContext'
import { IngredientFilterBar } from '@/components/IngredientFilterBar'

const COST_MAX = 3
const RATING_MAX = 10

const IngredientsPage = () => {
  const { setDockConfig, clearDockConfig } = useDock()
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [alertProps, setAlertProps] = useState<AlertProps | undefined>()
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null)

  const [searchInput, setSearchInput] = useState<string>('')
  const [healthyToggleState, setHealthyToggleState] = useState<boolean>(false)
  const [cost, setCost] = useState<number>(COST_MAX)
  const [rating, setRating] = useState<number>(RATING_MAX)

  const fetchIngredients = async () => {
    setLoading(true)
    setError(null)

    const { ingredients: data, error: fetchError } = await getIngredientData({
      search: searchInput || undefined,
      isHealthy: healthyToggleState || undefined,
      maxCost: cost < COST_MAX ? cost : undefined,
      maxRating: rating < RATING_MAX ? rating : undefined,
    })

    setIngredients(data ?? [])
    setError(fetchError)
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
  }, [setDockConfig, clearDockConfig])

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
                <div
                  key={ingredient.id}
                  className="card bg-base-100 w-96 shadow-sm grow border border-base-300"
                >
                  <div className="card-body">
                    <h2 className="card-title">{ingredient.name}</h2>
                    <p>Rating: {ingredient.rating} / 10</p>
                    <p>Cost: {COST_LABEL_BY_VALUE[ingredient.cost]}</p>

                    <div className="card-actions justify-start">
                      <div className="badge badge-outline badge-accent">{ingredient.macro}</div>
                      {ingredient.isHealthyOption && (
                        <div className="badge badge-outline badge-success">
                          {HEALTHY_CHOICE_LABEL}
                        </div>
                      )}
                    </div>

                    <div className="card-actions justify-end">
                      <button
                        className="btn btn-outline"
                        onClick={() => setEditingIngredient(ingredient)}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div>No ingredient items</div>
            )}
          </div>
        </>
      ) : (
        <div className="my-20">
          <Error title="Error" message={error} onRetry={async () => window.location.reload()} />
        </div>
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
