'use client'

import { useEffect, useState } from 'react'
import {
  AdjustmentsHorizontalIcon,
  ClipboardDocumentListIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import { usePathname } from 'next/navigation'
import { MealModal } from '@/components/modals/MealModal'
import { IngredientModal } from '@/components/modals/IngredientModal'
import { Alert, AlertProps } from '@/components/Alert'
import { Button } from '@/components/Button'
import { useModal } from '@/contexts/ModalContext'
import { useDock } from '@/contexts/DockContext'
import { ShoppingListModal } from '@/components/modals/ShoppingListModal'
import { getIcon } from '@/utils/getIcon'
import { INGREDIENT_LABEL, MEAL_LABEL } from '@/constants/addModalContents'

interface MobileDockProps {
  filterContent?: (closeOverlay: () => void) => React.ReactNode
}

export const MobileDock = ({ filterContent }: MobileDockProps) => {
  const pathname = usePathname()
  const [addModalKind, setAddModalKind] = useState<typeof MEAL_LABEL | typeof INGREDIENT_LABEL | null>(null)
  const [showShoppingListModal, setShowShoppingListModal] = useState<boolean>(false)
  const [alertProps, setAlertProps] = useState<AlertProps | undefined>()
  const [hasMounted, setHasMounted] = useState<boolean>(false)

  const { openModal, closeModal } = useModal()
  const { activeOverlay, setActiveOverlay, closeOverlay } = useDock()

  useEffect(() => {
    document.body.classList.toggle('mobile-overlay-open', Boolean(activeOverlay))

    return () => {
      document.body.classList.remove('mobile-overlay-open')
    }
  }, [activeOverlay])

  useEffect(() => {
    if (addModalKind || showShoppingListModal) {
      openModal()
    } else {
      closeModal()
    }
  }, [addModalKind, showShoppingListModal, openModal, closeModal])

  useEffect(() => {
    setHasMounted(true)
  }, [])

  const hasFilters = Boolean(filterContent)
  const addRoutes = ['/meal', '/ingredients', '/inventory', '/planner']
  const showAddButton = addRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )
  const showShoppingListButton =
    pathname === '/inventory' ||
    (!pathname.startsWith('/admin') && !pathname.startsWith('/account'))

  useEffect(() => {
    if (!showAddButton && activeOverlay === 'add') {
      setActiveOverlay(null)
    }

    if (!hasFilters && activeOverlay === 'filters') {
      setActiveOverlay(null)
    }
  }, [showAddButton, hasFilters, activeOverlay, setActiveOverlay])

  if (!hasMounted) {
    return <div className="h-16 sm:hidden" />
  }

  const onOpenAddModal = (kind: typeof MEAL_LABEL | typeof INGREDIENT_LABEL) => {
    setAddModalKind(kind)
    setActiveOverlay(null)
  }

  const addButtons = [
    {
      icon: getIcon({ type: 'meal', className: 'h-5 w-5' }),
      label: 'Add Meal',
      onClick: () => onOpenAddModal(MEAL_LABEL),
    },
    {
      icon: getIcon({ type: 'ingredient', className: 'h-5 w-5' }),
      label: 'Add Ingredient',
      onClick: () => onOpenAddModal(INGREDIENT_LABEL),
    },
  ]

  return (
    <>
      <div className="fixed inset-0 z-40 sm:hidden pointer-events-none">
        <div
          className={`absolute inset-0 transition-colors duration-300 ${
            activeOverlay ? 'bg-black/40 pointer-events-auto' : 'bg-black/0'
          }`}
          onClick={() => closeOverlay()}
        />

        <div
          className={`absolute inset-x-0 bottom-16 bg-base-100 p-4 shadow-2xl transition-transform duration-300 pointer-events-auto ${
            activeOverlay ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          {activeOverlay === 'add' && (
            <div className="grid gap-4">
              {addButtons.map((button, index) => (
                <Button
                  key={index}
                  variant="soft"
                  className="justify-between"
                  onClick={button.onClick}
                >
                  <div className="flex gap-2">
                    {button.icon}
                    {button.label}
                  </div>
                  <PlusIcon className="h-5 w-5" />
                </Button>
              ))}
            </div>
          )}

          {activeOverlay === 'filters' && filterContent && filterContent(closeOverlay)}
        </div>
      </div>

      <div className="dock z-50 sm:hidden bg-info-content text-base-100">
        {showAddButton && (
          <button
            className={activeOverlay === 'add' ? 'dock-active' : ''}
            onClick={() => setActiveOverlay(activeOverlay === 'add' ? null : 'add')}
          >
            <PlusIcon className="h-5 w-5" />
            <span className="dock-label">Add</span>
          </button>
        )}

        {showShoppingListButton && (
          <button
            onClick={() => {
              setShowShoppingListModal(true)
              setActiveOverlay(null)
            }}
          >
            <ClipboardDocumentListIcon className="h-5 w-5" />
            <span className="dock-label">Shopping List</span>
          </button>
        )}

        <button
          disabled={!hasFilters}
          className={activeOverlay === 'filters' && hasFilters ? 'dock-active' : ''}
          onClick={() => {
            if (!hasFilters) return
            setActiveOverlay(activeOverlay === 'filters' ? null : 'filters')
          }}
        >
          <AdjustmentsHorizontalIcon
            className={`h-5 w-5 ${hasFilters ? '' : 'opacity-50'}`.trim()}
          />
          <span className={`dock-label ${hasFilters ? '' : 'opacity-50'}`.trim()}>
            {hasFilters ? 'Filters' : 'No Filters'}
          </span>
        </button>
      </div>

      <div className="h-16 sm:hidden" />

      {addModalKind === MEAL_LABEL && (
        <MealModal
          setOpen={(open) => {
            if (!open) {
              setAddModalKind(null)
              closeModal()
            }
          }}
          setAlertProps={setAlertProps}
        />
      )}

      {addModalKind === INGREDIENT_LABEL && (
        <IngredientModal
          setOpen={(open) => {
            if (!open) {
              setAddModalKind(null)
              closeModal()
            }
          }}
          setAlertProps={setAlertProps}
        />
      )}

      {showShoppingListModal && (
        <ShoppingListModal
          onClose={() => {
            setShowShoppingListModal(false)
            closeModal()
          }}
        />
      )}

      {alertProps && <Alert {...alertProps} />}
    </>
  )
}
