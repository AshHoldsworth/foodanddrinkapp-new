'use client'

import { useEffect, useMemo, useState } from 'react'
import { getIngredientData, updateIngredientStockBatch } from '@/app/api/ingredientApi'
import { Ingredient } from '@/models'
import { Alert, AlertProps } from '@/components/errors/Alert'
import { IngredientBadgeSelector } from '@/components/selectors/IngredientBadgeSelector'

const AdminInventoryPage = () => {
  const [inventoryIngredients, setInventoryIngredients] = useState<Ingredient[]>([])
  const [searchResults, setSearchResults] = useState<Ingredient[]>([])
  const [loadingInventory, setLoadingInventory] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [alertProps, setAlertProps] = useState<AlertProps | undefined>()
  const [pendingStockChanges, setPendingStockChanges] = useState<Record<string, number>>({})
  const [savingAllChanges, setSavingAllChanges] = useState(false)
  const [ingredientInput, setIngredientInput] = useState('')

  const fetchInventory = async () => {
    setLoadingInventory(true)

    const { ingredients: data, error } = await getIngredientData({ inStockOnly: true })

    if (error) {
      setAlertProps({
        type: 'error',
        message: error,
        onCloseClick: () => setAlertProps(undefined),
      })
      setLoadingInventory(false)
      return
    }

    setInventoryIngredients(data ?? [])
    setLoadingInventory(false)
  }

  useEffect(() => {
    void fetchInventory()
  }, [])

  useEffect(() => {
    const runSearch = async () => {
      const term = ingredientInput.trim()

      if (term.length < 2) {
        setSearchResults([])
        return
      }

      setSearchLoading(true)
      const { ingredients, error } = await getIngredientData({ search: term })

      if (error) {
        setAlertProps({
          type: 'error',
          message: error,
          onCloseClick: () => setAlertProps(undefined),
        })
        setSearchLoading(false)
        return
      }

      const results = ingredients ?? []
      setSearchResults(results)
      setSearchLoading(false)
    }

    void runSearch()
  }, [ingredientInput])

  const sortedInventory = useMemo(
    () =>
      inventoryIngredients
        .filter((ingredient) => ingredient.stockQuantity > 0)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [inventoryIngredients],
  )

  const updateStockQuantityLocally = (ingredient: Ingredient, nextQuantity: number) => {
    if (nextQuantity < 0) {
      return
    }

    setInventoryIngredients((current) => {
      const existing = current.find((item) => item.id === ingredient.id)

      if (nextQuantity <= 0) {
        return current.filter((item) => item.id !== ingredient.id)
      }

      if (existing) {
        return current.map((item) =>
          item.id === ingredient.id ? { ...item, stockQuantity: nextQuantity } : item,
        )
      }

      return [...current, { ...ingredient, stockQuantity: nextQuantity }]
    })

    setSearchResults((current) =>
      current.map((item) =>
        item.id === ingredient.id ? { ...item, stockQuantity: nextQuantity } : item,
      ),
    )

    setPendingStockChanges((current) => ({ ...current, [ingredient.id]: nextQuantity }))
  }

  const saveAllChanges = async () => {
    const items = Object.entries(pendingStockChanges).map(([id, stockQuantity]) => ({
      id,
      stockQuantity,
    }))

    if (items.length === 0) {
      setAlertProps({
        type: 'info',
        message: 'No inventory changes to save.',
        onCloseClick: () => setAlertProps(undefined),
      })
      return
    }

    setSavingAllChanges(true)

    const { status, errorMessage } = await updateIngredientStockBatch({ items })

    if (status !== 200) {
      setAlertProps({
        type: 'error',
        message: errorMessage ?? 'Failed to save inventory changes.',
        onCloseClick: () => setAlertProps(undefined),
      })
      setSavingAllChanges(false)
      return
    }

    setPendingStockChanges({})

    setAlertProps({
      type: 'success',
      message: 'Inventory changes saved.',
      onCloseClick: () => setAlertProps(undefined),
    })

    setSavingAllChanges(false)
  }

  const onAddIngredientToInventory = async (ingredient: Ingredient) => {
    const inInventory = inventoryIngredients.find((item) => item.id === ingredient.id)
    const currentQuantity = inInventory?.stockQuantity ?? ingredient.stockQuantity
    const nextQuantity = currentQuantity > 0 ? currentQuantity + 1 : 1

    updateStockQuantityLocally(ingredient, nextQuantity)
    setIngredientInput('')
    setSearchResults([])
  }

  const onAdjustInventory = async (ingredient: Ingredient, delta: number) => {
    const nextQuantity = ingredient.stockQuantity + delta
    updateStockQuantityLocally(ingredient, nextQuantity)
  }

  return (
    <main className="p-5 space-y-5">
      <section className="border border-base-300 rounded-lg p-4">
        <h1 className="text-xl font-semibold mb-2">Inventory</h1>
        <p className="text-sm opacity-80 mb-4">
          Search for an ingredient, then click its badge to add it to your inventory.
        </p>

        <IngredientBadgeSelector
          label="Ingredient"
          inputValue={ingredientInput}
          onInputChange={setIngredientInput}
          onInputClear={() => {
            setIngredientInput('')
            setSearchResults([])
          }}
          suggestions={searchResults.map((ingredient) => ({
            id: ingredient.id,
            name: ingredient.name,
            macro: ingredient.macro,
          }))}
          onSuggestionClick={(suggestion) => {
            const ingredient = searchResults.find((item) => item.id === suggestion.id)
            if (!ingredient) return
            void onAddIngredientToInventory(ingredient)
          }}
        />

        {searchLoading && <p className="text-sm opacity-70 mt-2">Searching ingredients...</p>}
      </section>

      <section className="border border-base-300 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div>
            <h2 className="text-lg font-semibold">Current Inventory</h2>
            <p className="text-sm opacity-80">
              Use the +/- controls to adjust stock quantities, then click Save.
            </p>
          </div>
          <button
            className="btn btn-success btn-sm"
            type="button"
            onClick={() => void saveAllChanges()}
            disabled={savingAllChanges || Object.keys(pendingStockChanges).length === 0}
          >
            {savingAllChanges ? 'Saving...' : 'Save'}
          </button>
        </div>

        {loadingInventory ? (
          <p>Loading inventory...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra table-sm w-full">
              <thead>
                <tr>
                  <th>Ingredient</th>
                  <th>Macro</th>
                  <th>Quantity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedInventory.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4 opacity-70">
                      No ingredients in inventory yet.
                    </td>
                  </tr>
                ) : (
                  sortedInventory.map((ingredient) => (
                    <tr key={ingredient.id}>
                      <td className="align-middle">{ingredient.name}</td>
                      <td className="align-middle">{ingredient.macro}</td>
                      <td className="align-middle font-semibold">{ingredient.stockQuantity}</td>
                      <td className="align-middle">
                        <button
                          className="btn btn-outline btn-xs sm:btn-sm mr-2"
                          disabled={savingAllChanges || ingredient.stockQuantity <= 0}
                          type="button"
                          onClick={() => void onAdjustInventory(ingredient, -1)}
                        >
                          -
                        </button>
                        <button
                          className="btn btn-neutral btn-xs sm:btn-sm"
                          disabled={savingAllChanges}
                          type="button"
                          onClick={() => void onAdjustInventory(ingredient, 1)}
                        >
                          +
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {alertProps && (
        <Alert {...alertProps} className="top-20 left-4 right-4 sm:left-10 sm:right-10" />
      )}
    </main>
  )
}

export default AdminInventoryPage
