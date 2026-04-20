import {
  COST_OPTIONS,
  HEALTHY_CHOICE_LABEL,
  MACRO_OPTIONS,
  MacroOption,
  RATING_FILTER_OPTIONS,
} from '@/constants'
import { RangeSelector } from './selectors/RangeSelector'
import { Select } from './selectors/Select'
import { Toggle } from './selectors/Toggle'

interface IngredientFilterBarProps {
  onApplyFilters: () => void
  onHealthyToggleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  healthyToggleState: boolean
  onCostChange: (value: number) => void
  cost: number
  onRatingChange: (value: number) => void
  rating: number
  macroValue: '' | MacroOption
  onMacroChange: (value: '' | MacroOption) => void
  mobileDockMode?: boolean
  className?: string
  closeOverlay?: () => void
}

export const IngredientFilterBar = ({
  onApplyFilters,
  onHealthyToggleChange,
  healthyToggleState,
  onCostChange,
  cost,
  onRatingChange,
  rating,
  macroValue,
  onMacroChange,
  mobileDockMode = false,
  className = '',
  closeOverlay,
}: IngredientFilterBarProps) => {
  const handleApplyFilters = () => {
    onApplyFilters()
    closeOverlay?.()
  }

  return (
    <div className={`flex justify-center gap-3 flex-col ${className}`.trim()}>
      <div className="flex flex-col sm:flex-row gap-3 grow">
        <div className="flex gap-3 grow">
          <Select
            label="Macro"
            value={macroValue}
            onChange={(value) => onMacroChange(value as '' | MacroOption)}
            options={[
              { label: 'All macros', value: '' },
              ...MACRO_OPTIONS.map((macro) => ({ label: macro, value: macro })),
            ]}
            direction="col"
          />
          <Toggle
            label={HEALTHY_CHOICE_LABEL}
            checked={healthyToggleState}
            onChange={onHealthyToggleChange}
          />
        </div>

        <RangeSelector
          label="Cost"
          min={1}
          max={3}
          step={1}
          value={cost}
          onChange={onCostChange}
          options={COST_OPTIONS.map((option) => option.label)}
        />

        <RangeSelector
          label="Rating"
          min={1}
          max={10}
          step={1}
          value={rating}
          onChange={onRatingChange}
          options={RATING_FILTER_OPTIONS.map((option: string) => option)}
        />
      </div>

      <div className={`flex ${mobileDockMode ? '' : 'sm:justify-end'}`}>
        <button className="btn btn-success w-full sm:w-auto" onClick={handleApplyFilters}>
          Apply Filters
        </button>
      </div>
    </div>
  )
}
