'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  completeShoppingList,
  createManualShoppingList,
  generateShoppingList,
  getCompletedShoppingLists,
  getCurrentShoppingList,
  setShoppingListItemPurchased,
  addItemToShoppingList,
  updateShoppingListItemQuantity,
  removeItemFromShoppingList,
} from '@/app/api/shoppingListApi'
import { getAllIngredients } from '@/app/api/ingredientApi'
import { Alert, AlertProps } from '@/components/errors/Alert'
import Loading from '@/components/Loading'
import { ShoppingList, ShoppingListType } from '@/models'
import { Ingredient } from '@/models'
import { StepperInput } from '@/components/selectors/StepperInput'

type ShoppingListModalProps = {
  onClose: () => void
}

type PendingChange = {
  purchasedChanges: Record<string, boolean>
  quantityChanges: Record<string, number>
  newItems: { ingredientId: string; ingredientName: string; quantity: number }[]
  removedItems: string[]
}

const formatDate = (value: string) => {
  return new Date(value).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export const ShoppingListModal = ({ onClose }: ShoppingListModalProps) => {
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [alertProps, setAlertProps] = useState<AlertProps | undefined>()
  const [daysAhead, setDaysAhead] = useState(7)
  const [currentList, setCurrentList] = useState<ShoppingList | null>(null)
  const [completedLists, setCompletedLists] = useState<ShoppingList[]>([])
  const [showCompleted, setShowCompleted] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [preparingManualList, setPreparingManualList] = useState(false)
  const [pendingChanges, setPendingChanges] = useState<PendingChange>({
    purchasedChanges: {},
    quantityChanges: {},
    newItems: [],
    removedItems: [],
  })
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Ingredient[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)

  const loadData = async () => {
    setLoading(true)
    setError(null)

    const [
      { shoppingList, error: currentError },
      { shoppingLists, error: completedError },
      { ingredients, error: ingredientError },
    ] = await Promise.all([
      getCurrentShoppingList(),
      getCompletedShoppingLists(),
      getAllIngredients(),
    ])

    if (currentError || completedError) {
      setError(currentError ?? completedError ?? 'Failed to load shopping list.')
      setLoading(false)
      return
    }

    setCurrentList(shoppingList)
    setCompletedLists(shoppingLists)
    setAllIngredients(ingredients ?? [])
    setPendingChanges({
      purchasedChanges: {},
      quantityChanges: {},
      newItems: [],
      removedItems: [],
    })
    setPreparingManualList(false)
    setEditMode(false)
    setLoading(false)
  }

  useEffect(() => {
    void loadData()
  }, [])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = allIngredients
      .filter((ing) => ing.name.toLowerCase().includes(query))
      .slice(0, 5)

    setSearchResults(filtered)
    setShowSearchResults(true)
  }, [searchQuery, allIngredients])

  const onStartManualList = () => {
    setPreparingManualList(true)
    setError(null)
    setSearchQuery('')
    setShowSearchResults(false)
    setPendingChanges({
      purchasedChanges: {},
      quantityChanges: {},
      newItems: [],
      removedItems: [],
    })
  }

  const onSaveManualList = async () => {
    if (pendingChanges.newItems.length === 0) {
      setError('Please add at least one ingredient.')
      return
    }

    setBusy(true)
    setError(null)

    const { shoppingList: newList, error: createError } = await createManualShoppingList()
    if (createError || !newList) {
      setError(createError ?? 'Failed to create manual shopping list.')
      setBusy(false)
      return
    }

    let latestList: ShoppingList | null = newList

    for (const item of pendingChanges.newItems) {
      const { shoppingList, error: addError } = await addItemToShoppingList(
        newList.id,
        item.ingredientId,
        item.ingredientName,
        item.quantity,
      )

      if (addError || !shoppingList) {
        setError(addError ?? 'Failed to add item to shopping list.')
        setBusy(false)
        return
      }

      latestList = shoppingList
    }

    setCurrentList(latestList)
    setPreparingManualList(false)
    setPendingChanges({
      purchasedChanges: {},
      quantityChanges: {},
      newItems: [],
      removedItems: [],
    })
    setEditMode(false)
    setAlertProps({
      type: 'success',
      message: 'Manual shopping list created.',
      onCloseClick: () => setAlertProps(undefined),
    })
    setBusy(false)
  }

  const onGenerate = async () => {
    setBusy(true)
    setError(null)

    const { shoppingList, error: generateError } = await generateShoppingList(daysAhead)
    if (generateError || !shoppingList) {
      setError(generateError ?? 'Failed to generate shopping list.')
      setBusy(false)
      return
    }

    setCurrentList(shoppingList)
    setPendingChanges({
      purchasedChanges: {},
      quantityChanges: {},
      newItems: [],
      removedItems: [],
    })
    setEditMode(false)
    setAlertProps({
      type: 'success',
      message: 'Shopping list generated.',
      onCloseClick: () => setAlertProps(undefined),
    })
    setBusy(false)
  }

  const onToggleEditMode = () => {
    if (editMode) {
      setEditMode(false)
      setPendingChanges({
        purchasedChanges: {},
        quantityChanges: {},
        newItems: [],
        removedItems: [],
      })
    } else {
      setEditMode(true)
    }
  }

  const onTogglePurchased = (ingredientId: string, isPurchased: boolean) => {
    if (!editMode) return

    setPendingChanges((prev) => ({
      ...prev,
      purchasedChanges: {
        ...prev.purchasedChanges,
        [ingredientId]: isPurchased,
      },
    }))
  }

  const onUpdateQuantity = (ingredientId: string, quantity: number) => {
    if (!editMode) return

    if (quantity === 0) {
      setPendingChanges((prev) => ({
        ...prev,
        quantityChanges: { ...prev.quantityChanges, [ingredientId]: 0 },
        removedItems: [...prev.removedItems, ingredientId],
      }))
    } else {
      setPendingChanges((prev) => ({
        ...prev,
        quantityChanges: { ...prev.quantityChanges, [ingredientId]: quantity },
        removedItems: prev.removedItems.filter((id) => id !== ingredientId),
      }))
    }
  }

  const onAddItemFromSearch = (ingredient: Ingredient) => {
    if (!preparingManualList && (!currentList || !editMode)) return

    const existingItem = currentList?.items.find((item) => item.ingredientId === ingredient.id)
    const newItem = pendingChanges.newItems.find((item) => item.ingredientId === ingredient.id)

    if (!existingItem && !newItem) {
      setPendingChanges((prev) => ({
        ...prev,
        newItems: [
          ...prev.newItems,
          { ingredientId: ingredient.id, ingredientName: ingredient.name, quantity: 1 },
        ],
      }))
    }

    setSearchQuery('')
    setShowSearchResults(false)
  }

  const onSaveChanges = async () => {
    if (!currentList) return

    const hasChanges =
      Object.keys(pendingChanges.purchasedChanges).length > 0 ||
      Object.keys(pendingChanges.quantityChanges).length > 0 ||
      pendingChanges.newItems.length > 0

    if (!hasChanges) {
      setEditMode(false)
      return
    }

    setBusy(true)
    setError(null)

    let latestList: ShoppingList | null = currentList

    // Add new items
    for (const item of pendingChanges.newItems) {
      const { shoppingList, error: addError } = await addItemToShoppingList(
        currentList.id,
        item.ingredientId,
        item.ingredientName,
        item.quantity,
      )

      if (addError || !shoppingList) {
        setError(addError ?? 'Failed to add item to shopping list.')
        setBusy(false)
        return
      }

      latestList = shoppingList
    }

    // Update quantities
    for (const [ingredientId, quantity] of Object.entries(pendingChanges.quantityChanges)) {
      const { shoppingList, error: updateError } = await updateShoppingListItemQuantity(
        currentList.id,
        ingredientId,
        quantity,
      )

      if (updateError || !shoppingList) {
        setError(updateError ?? 'Failed to update item quantity.')
        setBusy(false)
        return
      }

      latestList = shoppingList
    }

    // Update purchased status
    for (const [ingredientId, isPurchased] of Object.entries(pendingChanges.purchasedChanges)) {
      const { shoppingList, error: toggleError } = await setShoppingListItemPurchased(
        currentList.id,
        ingredientId,
        isPurchased,
      )

      if (toggleError || !shoppingList) {
        setError(toggleError ?? 'Failed to save shopping list changes.')
        setBusy(false)
        return
      }

      latestList = shoppingList
    }

    setCurrentList(latestList)
    setPendingChanges({
      purchasedChanges: {},
      quantityChanges: {},
      newItems: [],
      removedItems: [],
    })
    setEditMode(false)
    setAlertProps({
      type: 'success',
      message: 'Shopping list updated.',
      onCloseClick: () => setAlertProps(undefined),
    })
    setBusy(false)
  }

  const onComplete = async (wasCancelled: boolean = false) => {
    if (!currentList) return

    setBusy(true)
    setError(null)

    const { error: completeError } = await completeShoppingList(currentList.id)
    if (completeError) {
      setError(completeError)
      setBusy(false)
      return
    }

    await loadData()
    setAlertProps({
      type: 'success',
      message: wasCancelled ? 'Shopping list cancelled.' : 'Shopping list completed.',
      onCloseClick: () => setAlertProps(undefined),
    })
    setBusy(false)
  }

  const canComplete = useMemo(() => {
    if (!currentList) return false
    return currentList.items.every((item) => {
      const quantity = pendingChanges.quantityChanges[item.ingredientId] ?? item.quantity
      const isPurchased = pendingChanges.purchasedChanges[item.ingredientId] ?? item.isPurchased
      return quantity > 0 && isPurchased === true
    })
  }, [currentList, pendingChanges])

  const hasPendingChanges =
    Object.keys(pendingChanges.purchasedChanges).length > 0 ||
    Object.keys(pendingChanges.quantityChanges).length > 0 ||
    pendingChanges.newItems.length > 0

  const isManualList = currentList?.type === ShoppingListType.Manual

  if (preparingManualList) {
    return (
      <div className="w-screen h-screen z-100 flex justify-center items-center fixed top-0 left-0 bg-black/75 p-4">
        <div className="bg-base-100 p-4 rounded shadow-md w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-bold text-lg">Create Manual Shopping List</h3>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setPreparingManualList(false)}
            >
              Cancel
            </button>
          </div>

          {alertProps && (
            <Alert {...alertProps} className="top-20 left-4 right-4 sm:left-10 sm:right-10" />
          )}

          <div className="space-y-2 p-3 bg-base-200 rounded">
            <label className="form-control">
              <span className="label-text text-sm">Search & Add Ingredients</span>
              <input
                type="text"
                placeholder="Search ingredients..."
                className="input input-sm input-bordered"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={busy}
              />
            </label>

            {showSearchResults && searchResults.length > 0 && (
              <div className="bg-base-100 border border-base-300 rounded max-h-32 overflow-y-auto">
                {searchResults.map((ingredient) => (
                  <button
                    key={ingredient.id}
                    className="w-full text-left px-3 py-2 hover:bg-base-200 text-sm"
                    onClick={() => onAddItemFromSearch(ingredient)}
                    type="button"
                  >
                    {ingredient.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {pendingChanges.newItems.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold">Items to add:</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {pendingChanges.newItems.map((item) => (
                  <div
                    key={item.ingredientId}
                    className="flex items-center justify-between bg-base-200 p-2 rounded"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.ingredientName}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StepperInput
                        value={item.quantity}
                        min={0}
                        onChange={(newQty) =>
                          setPendingChanges((prev) => ({
                            ...prev,
                            newItems: prev.newItems.map((i) =>
                              i.ingredientId === item.ingredientId ? { ...i, quantity: newQty } : i,
                            ),
                          }))
                        }
                        disabled={busy}
                      />
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        onClick={() =>
                          setPendingChanges((prev) => ({
                            ...prev,
                            newItems: prev.newItems.filter(
                              (i) => i.ingredientId !== item.ingredientId,
                            ),
                          }))
                        }
                        disabled={busy}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setPreparingManualList(false)}
              disabled={busy}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-success btn-sm"
              onClick={onSaveManualList}
              disabled={busy || pendingChanges.newItems.length === 0}
            >
              Save & Create List
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-screen h-screen z-100 flex justify-center items-center fixed top-0 left-0 bg-black/75 p-4">
      <div className="bg-base-100 p-4 rounded shadow-md w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-bold text-lg">Shopping List</h3>
          <button className="btn btn-outline btn-sm" onClick={onClose}>
            Close
          </button>
        </div>

        {alertProps && (
          <Alert {...alertProps} className="top-20 left-4 right-4 sm:left-10 sm:right-10" />
        )}

        {error && <div className="alert alert-error text-sm">{error}</div>}

        {loading ? (
          <Loading label="Loading shopping list..." />
        ) : currentList ? (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm opacity-80">
                {isManualList ? 'Manual' : 'Generated'} list for {formatDate(currentList.startDate)}{' '}
                - {formatDate(currentList.endDate)}
              </div>
            </div>

            {editMode && (
              <div className="space-y-2 p-3 bg-base-200 rounded">
                <label className="form-control">
                  <span className="label-text text-sm">Search & Add Ingredients</span>
                  <input
                    type="text"
                    placeholder="Search ingredients..."
                    className="input input-sm input-bordered"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={busy}
                  />
                </label>

                {showSearchResults && searchResults.length > 0 && (
                  <div className="bg-base-100 border border-base-300 rounded max-h-32 overflow-y-auto">
                    {searchResults.map((ingredient) => (
                      <button
                        key={ingredient.id}
                        className="w-full text-left px-3 py-2 hover:bg-base-200 text-sm"
                        onClick={() => onAddItemFromSearch(ingredient)}
                        type="button"
                      >
                        {ingredient.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentList.items.length === 0 && pendingChanges.newItems.length === 0 ? (
              <p className="text-sm opacity-80">
                {isManualList ? 'No items added yet.' : 'No purchases needed for this range.'}
              </p>
            ) : (
              <div className="space-y-2">
                {currentList.items
                  .filter((item) => !pendingChanges.removedItems.includes(item.ingredientId))
                  .map((item) => {
                    const isPurchased =
                      pendingChanges.purchasedChanges[item.ingredientId] ?? item.isPurchased
                    const quantity =
                      pendingChanges.quantityChanges[item.ingredientId] ?? item.quantity

                    return (
                      <div
                        key={item.ingredientId}
                        className="flex items-center justify-between gap-3 border border-base-300 rounded p-2"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm"
                            checked={isPurchased}
                            disabled={busy || (!editMode && item.isPurchased)}
                            onChange={(e) =>
                              editMode
                                ? onTogglePurchased(item.ingredientId, e.target.checked)
                                : onTogglePurchased(item.ingredientId, e.target.checked)
                            }
                          />
                          <span className={isPurchased ? 'line-through opacity-60' : ''}>
                            {item.ingredientName}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {editMode ? (
                            <StepperInput
                              value={quantity}
                              min={0}
                              onChange={(newQty) => onUpdateQuantity(item.ingredientId, newQty)}
                              disabled={busy}
                            />
                          ) : (
                            <span className="badge badge-neutral">{quantity}</span>
                          )}
                        </div>
                      </div>
                    )
                  })}

                {pendingChanges.newItems.map((item) => (
                  <div
                    key={item.ingredientId}
                    className="flex items-center justify-between gap-3 border border-base-300 rounded p-2 bg-base-200"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        checked={false}
                        disabled={busy}
                      />
                      <span>{item.ingredientName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <StepperInput
                        value={item.quantity}
                        min={0}
                        onChange={(newQty) =>
                          setPendingChanges((prev) => ({
                            ...prev,
                            newItems: prev.newItems.map((i) =>
                              i.ingredientId === item.ingredientId ? { ...i, quantity: newQty } : i,
                            ),
                          }))
                        }
                        disabled={busy}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {hasPendingChanges && editMode && (
              <p className="text-sm opacity-70">You have unsaved changes.</p>
            )}

            <div className="flex flex-wrap gap-2">
              {editMode ? (
                <>
                  <button
                    type="button"
                    className="btn btn-success btn-sm"
                    disabled={busy || !hasPendingChanges}
                    onClick={() => void onSaveChanges()}
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    disabled={busy}
                    onClick={onToggleEditMode}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={busy}
                    onClick={onToggleEditMode}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="btn btn-success btn-sm"
                    disabled={busy || !canComplete || hasPendingChanges}
                    onClick={() => void onComplete()}
                  >
                    Complete List
                  </button>
                  <button
                    type="button"
                    className="btn btn-error btn-sm"
                    onClick={() => void onComplete(true)}
                  >
                    Cancel List
                  </button>
                </>
              )}
            </div>
          </section>
        ) : (
          <section className="space-y-3">
            <p className="text-sm opacity-80">No active shopping list. Choose an option below.</p>
            <div className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Generate List</h4>
                <div className="flex items-end gap-3">
                  <label className="form-control">
                    <span className="label-text text-sm mx-2">Days Ahead</span>
                    <input
                      type="number"
                      min={1}
                      max={28}
                      className="input input-sm input-bordered w-28"
                      value={daysAhead}
                      onChange={(e) => setDaysAhead(Number(e.target.value))}
                      disabled={busy}
                    />
                  </label>
                  <button
                    type="button"
                    className="btn btn-success btn-sm"
                    disabled={busy || daysAhead < 1 || daysAhead > 28}
                    onClick={() => void onGenerate()}
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div className="divider my-2"></div>

              <div className="space-y-2">
                <button
                  type="button"
                  className="btn btn-info btn-sm w-1/2"
                  disabled={busy}
                  onClick={onStartManualList}
                >
                  Create Manual List
                </button>
              </div>
            </div>
          </section>
        )}

        <section className="space-y-2">
          <button
            type="button"
            className="btn btn-outline btn-sm w-1/2"
            onClick={() => setShowCompleted((value) => !value)}
          >
            {showCompleted ? 'Hide Completed Lists' : 'View Completed Lists'}
          </button>

          {showCompleted && (
            <div className="space-y-2">
              {completedLists.length === 0 ? (
                <p className="text-sm opacity-70">No completed shopping lists yet.</p>
              ) : (
                completedLists.map((list) => (
                  <div
                    key={list.id}
                    className="border border-base-300 rounded p-3 text-sm space-y-1"
                  >
                    <div className="font-medium">
                      {formatDate(list.startDate)} - {formatDate(list.endDate)}
                    </div>
                    <div className="opacity-75">
                      Type: {list.type === ShoppingListType.Manual ? 'Manual' : 'Generated'}
                    </div>
                    <div className="opacity-75">
                      Completed: {list.completedAt ? formatDate(list.completedAt) : 'N/A'}
                    </div>
                    <div className="opacity-75">
                      Completed by: {list.completedBy ?? 'Unknown user'}
                    </div>
                    <div className="opacity-75">Items:</div>
                    {list.items.length === 0 ? (
                      <div className="opacity-60">No items</div>
                    ) : (
                      <ul className="list-disc pl-5 space-y-1">
                        {list.items.map(
                          (item) =>
                            item.isPurchased && (
                              <li key={item.ingredientId}>
                                {item.ingredientName} x{item.quantity}
                              </li>
                            ),
                        )}
                      </ul>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
