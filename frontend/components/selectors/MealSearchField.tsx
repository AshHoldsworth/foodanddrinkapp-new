'use client'

import { XMarkIcon } from '@heroicons/react/16/solid'
import { Meal } from '@/models'

type MealSearchFieldProps = {
  label: string
  value: string
  suggestions: Meal[]
  disabled: boolean
  onInputChange: (value: string) => void
  onSuggestionClick: (meal: Meal) => void
  onClear: () => void
}

const MealSearchField = ({
  label,
  value,
  suggestions,
  disabled,
  onInputChange,
  onSuggestionClick,
  onClear,
}: MealSearchFieldProps) => {
  return (
    <div className="space-y-2">
      <label className="fieldset-legend min-h-0 py-0">{label}</label>
      <div className="relative">
        <input
          type="text"
          className="input input-sm w-full pr-10"
          value={value}
          disabled={disabled}
          placeholder="Search meals"
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
            }
          }}
        />
        {!disabled && value && (
          <XMarkIcon
            className="w-4 h-4 cursor-pointer text-gray-500 hover:text-gray-700 absolute right-3 top-1/2 -translate-y-1/2"
            onClick={onClear}
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
    </div>
  )
}

export type { MealSearchFieldProps }
export { MealSearchField }