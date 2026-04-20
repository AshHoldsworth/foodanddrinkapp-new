import { MacroOption } from '@/constants'
import { Badge } from '@/components/Badge'
import { XMarkIcon } from '@heroicons/react/16/solid'
import { RefObject } from 'react'

type IngredientSuggestion = {
  id: string
  name: string
  macro: MacroOption
}

type SelectedIngredientBadge = {
  id: string
  name: string
  macro: MacroOption
  onRemoveClick?: () => void
}

interface IngredientBadgeSelectorProps {
  label?: string
  inputValue: string
  onInputChange: (value: string) => void
  onInputClear: () => void
  suggestions: IngredientSuggestion[]
  onSuggestionClick: (ingredient: IngredientSuggestion) => void
  selectedBadges?: SelectedIngredientBadge[]
  onClearAllClick?: () => void
  inputRef?: RefObject<HTMLInputElement | null>
  suggestionsRef?: RefObject<HTMLDivElement | null>
  selectedEndRef?: RefObject<HTMLDivElement | null>
}

export const IngredientBadgeSelector = ({
  label = 'Ingredient',
  inputValue,
  onInputChange,
  onInputClear,
  suggestions,
  onSuggestionClick,
  selectedBadges = [],
  onClearAllClick,
  inputRef,
  suggestionsRef,
  selectedEndRef,
}: IngredientBadgeSelectorProps) => {
  return (
    <>
      <div className="flex gap-2 mb-2">
        <legend className="fieldset-legend">{label}</legend>
        <div className="relative grow">
          <input
            ref={inputRef}
            type="text"
            className="input w-full pr-10"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
              }
            }}
          />
          <XMarkIcon
            className="w-5 h-5 cursor-pointer text-gray-500 hover:text-gray-700 absolute right-3 top-1/2 transform -translate-y-1/2"
            onClick={onInputClear}
          />
        </div>
        {onClearAllClick && (
          <button className="btn btn-outline btn-error" type="button" onClick={onClearAllClick}>
            Clear All
          </button>
        )}
      </div>

      {suggestions.length > 0 && (
        <div ref={suggestionsRef} className="flex gap-2 flex-wrap mb-2">
          {suggestions.map((ingredient) => (
            <button
              key={ingredient.id}
              type="button"
              className="badge badge-soft badge-neutral cursor-pointer opacity-70 hover:opacity-100"
              onClick={() => onSuggestionClick(ingredient)}
            >
              {ingredient.name}
            </button>
          ))}
        </div>
      )}

      {selectedBadges.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {selectedBadges.map((ingredient) => (
            <Badge
              key={ingredient.id}
              type={ingredient.macro}
              labelOverride={ingredient.name}
              onCloseClick={ingredient.onRemoveClick ?? null}
            />
          ))}
          <div ref={selectedEndRef} />
        </div>
      )}
    </>
  )
}
