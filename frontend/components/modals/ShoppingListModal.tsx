'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  completeShoppingList,
  generateShoppingList,
  getCompletedShoppingLists,
  getCurrentShoppingList,
  setShoppingListItemPurchased,
} from '@/app/api/shoppingListApi'
import { Alert, AlertProps } from '@/components/errors/Alert'
import { ShoppingList } from '@/models'

type ShoppingListModalProps = {
  onClose: () => void
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
  const [pendingPurchasedChanges, setPendingPurchasedChanges] = useState<Record<string, boolean>>(
    {},
  )

  const loadData = async () => {
    setLoading(true)
    setError(null)

    const [{ shoppingList, error: currentError }, { shoppingLists, error: completedError }] =
      await Promise.all([getCurrentShoppingList(), getCompletedShoppingLists()])

    if (currentError || completedError) {
      setError(currentError ?? completedError ?? 'Failed to load shopping list.')
      setLoading(false)
      return
    }

    setCurrentList(shoppingList)
    setCompletedLists(shoppingLists)
    setPendingPurchasedChanges({})
    setLoading(false)
  }

  useEffect(() => {
    void loadData()
  }, [])

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
    setPendingPurchasedChanges({})
    setAlertProps({
      type: 'success',
      message: 'Shopping list generated.',
      onCloseClick: () => setAlertProps(undefined),
    })
    setBusy(false)
  }

  const onToggleItem = (ingredientId: string, isPurchased: boolean) => {
    if (!currentList) return

    const currentItem = currentList.items.find((item) => item.ingredientId === ingredientId)
    if (!currentItem) return

    setPendingPurchasedChanges((previous) => {
      if (isPurchased === currentItem.isPurchased) {
        const { [ingredientId]: _, ...rest } = previous
        return rest
      }

      return {
        ...previous,
        [ingredientId]: isPurchased,
      }
    })
  }

  const onSaveChanges = async () => {
    if (!currentList) return

    const entries = Object.entries(pendingPurchasedChanges)
    if (entries.length === 0) return

    setBusy(true)
    setError(null)

    let latestList: ShoppingList | null = currentList

    for (const [ingredientId, isPurchased] of entries) {
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
    setPendingPurchasedChanges({})
    setAlertProps({
      type: 'success',
      message: 'Shopping list updated.',
      onCloseClick: () => setAlertProps(undefined),
    })
    setBusy(false)
  }

  const onComplete = async () => {
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
      message: 'Shopping list completed.',
      onCloseClick: () => setAlertProps(undefined),
    })
    setBusy(false)
  }

  const canComplete = useMemo(() => {
    if (!currentList) return false
    return currentList.items.every(
      (item) => (pendingPurchasedChanges[item.ingredientId] ?? item.isPurchased) === true,
    )
  }, [currentList, pendingPurchasedChanges])

  const hasPendingChanges = Object.keys(pendingPurchasedChanges).length > 0

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
          <p>Loading shopping list...</p>
        ) : currentList ? (
          <section className="space-y-3">
            <div className="text-sm opacity-80">
              Current list for {formatDate(currentList.startDate)} -{' '}
              {formatDate(currentList.endDate)}
            </div>

            {currentList.items.length === 0 ? (
              <p className="text-sm opacity-80">No purchases needed for this range.</p>
            ) : (
              <div className="space-y-2">
                {currentList.items.map((item) => (
                  <label
                    key={item.ingredientId}
                    className="flex items-center justify-between gap-3 border border-base-300 rounded p-2"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        checked={pendingPurchasedChanges[item.ingredientId] ?? item.isPurchased}
                        disabled={busy}
                        onChange={(e) => onToggleItem(item.ingredientId, e.target.checked)}
                      />
                      <span
                        className={
                          (pendingPurchasedChanges[item.ingredientId] ?? item.isPurchased)
                            ? 'line-through opacity-60'
                            : ''
                        }
                      >
                        {item.ingredientName}
                      </span>
                    </div>
                    <span className="badge badge-neutral">{item.quantity}</span>
                  </label>
                ))}
              </div>
            )}

            {hasPendingChanges && (
              <p className="text-sm opacity-70">You have unsaved purchase changes.</p>
            )}

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-success btn-sm"
                disabled={busy || !hasPendingChanges}
                onClick={() => void onSaveChanges()}
              >
                Save
              </button>

              <button
                type="button"
                className="btn btn-success btn-sm"
                disabled={busy || !canComplete || hasPendingChanges}
                onClick={() => void onComplete()}
              >
                Complete List
              </button>
            </div>
          </section>
        ) : (
          <section className="space-y-3">
            <p className="text-sm opacity-80">
              No active shopping list. Choose how many days ahead to plan purchases.
            </p>
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
                className="btn btn-neutral btn-sm"
                disabled={busy || daysAhead < 1 || daysAhead > 28}
                onClick={() => void onGenerate()}
              >
                Generate List
              </button>
            </div>
          </section>
        )}

        <section className="space-y-2">
          <button
            type="button"
            className="btn btn-outline btn-sm"
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
                      Completed: {list.completedAt ? formatDate(list.completedAt) : 'N/A'}
                    </div>
                    <div className="opacity-75">Items: {list.items.length}</div>
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
