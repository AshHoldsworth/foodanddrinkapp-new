import { HEALTHY_CHOICE_LABEL, MACRO_OPTIONS, MacroOption } from '@/constants'
import { Button } from '../Button'
import { Select } from '../selectors/Select'
import { Toggle } from '../selectors/Toggle'

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
      </div>

      <div className={`flex ${mobileDockMode ? '' : 'sm:justify-end'}`}>
        <Button tone="success" className="w-full sm:w-auto" onClick={handleApplyFilters}>
          Apply Filters
        </Button>
      </div>
    </div>
  )
}
