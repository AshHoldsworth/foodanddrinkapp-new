'use client'

import { getIngredientData } from '@/app/api/mealApi'
import { AddModal } from '@/components/modals/AddModal'
import { Alert, AlertProps } from '@/components/errors/Alert'
import { Error } from '@/components/errors/Error'
import Loading from '@/components/Loading'
import { RangeSelector } from '@/components/selectors/RangeSelector'
import { SearchBox } from '@/components/selectors/SearchBox'
import { Toggle } from '@/components/selectors/Toggle'
import {
  COST_LABEL_BY_VALUE,
  COST_OPTIONS,
  HEALTHY_CHOICE_LABEL,
  MODAL_CONTENTS,
  RATING_FILTER_OPTIONS,
} from '@/constants'
import { Ingredient } from '@/models'
import { useEffect, useState } from 'react'

const COST_MAX = 3
const RATING_MAX = 10

const IngredientsPage = () => {
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

  return (
    <>
      <div className="flex justify-center mx-5 gap-3 flex-col">
        <div className="flex gap-3 items-center">
          <div className="flex grow">
            <SearchBox
              onSearchChange={(e) => setSearchInput(e.target.value)}
              searchInput={searchInput}
              onClear={() => setSearchInput('')}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 grow">
          <div className="flex gap-3 grow">
            <Toggle
              label={HEALTHY_CHOICE_LABEL}
              checked={healthyToggleState}
              onChange={(e) => setHealthyToggleState(e.target.checked)}
            />
          </div>

          <RangeSelector
            label="Cost"
            min={1}
            max={3}
            step={1}
            value={cost}
            onChange={setCost}
            options={COST_OPTIONS.map((option) => option.label)}
          />

          <RangeSelector
            label="Rating"
            min={1}
            max={10}
            step={1}
            value={rating}
            onChange={setRating}
            options={RATING_FILTER_OPTIONS.map((option: string) => option)}
          />
        </div>

        <div className="flex justify-end">
          <button className="btn btn-neutral w-full sm:w-auto" onClick={fetchIngredients}>
            Apply Filters
          </button>
        </div>
      </div>

      {loading ? (
        <div className="my-20 flex justify-center">
          <Loading />
        </div>
      ) : !error ? (
        <div className="flex flex-wrap gap-5 justify-start py-8 mx-5">
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
