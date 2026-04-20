'use client'

import { XMarkIcon } from '@heroicons/react/16/solid'
import { Meal } from '@/models'

type MealSearchFieldProps = {
  label: string
  searchValue: string
  selectedMealId: string | null
  selectedMealName: string | null
  suggestions: Meal[]
  disabled: boolean
  onInputChange: (value: string) => void
  onSuggestionClick: (meal: Meal) => void
  onClear: () => void
}

const MealSearchField = ({
  label,
  searchValue,
  selectedMealId,
  selectedMealName,
  suggestions,
  disabled,
  onInputChange,
  onSuggestionClick,
  onClear,
}: MealSearchFieldProps) => {
  const isSelected = selectedMealId !== null && selectedMealName

  return (
    <div className="space-y-2">
      <label className="fieldset-legend min-h-0 py-0">{label}</label>

      {isSelected ? (
        <div className="flex items-center gap-2">
          <div className="flex-1 px-3 py-2 rounded bg-base-200 text-sm font-medium">
            {selectedMealName}
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={onClear}
              className="btn btn-ghost btn-xs"
              title="Clear selection"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="relative">
            <input
              type="text"
              className="input input-sm w-full pr-10"
              value={searchValue}
              disabled={disabled}
              placeholder="Search meals"
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                }
              }}
            />
            {!disabled && searchValue && (
              <XMarkIcon
                className="w-4 h-4 cursor-pointer text-gray-500 hover:text-gray-700 absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => onInputChange('')}
              />
            )}
          </div>

          {!disabled && suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {suggestions.map((meal) => (
                <button
                  key={meal.id}
                  type="button"
                  className="badge badge-soft badge-neutral cursor-pointer opacity-80 hover:opacity-100"
                  onClick={() => onSuggestionClick(meal)}
                >
                  {meal.name}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export type { MealSearchFieldProps }
export { MealSearchField }
