import { FILTER_LABELS } from '../../constants/filter'
import { Toggle } from '../selectors/Toggle'
import { Button } from '../Button'

interface MealFilterBarProps {
  onApplyFilters: () => void
  onHealthyToggleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  healthyToggleState: boolean
  onNewOrUpdatedToggleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  newOrUpdatedToggleState: boolean
  onCostChange: (value: number) => void
  cost: number
  onRatingChange: (value: number) => void
  rating: number
  onSpeedChange: (value: number) => void
  speed: number
  mobileDockMode?: boolean
  className?: string
  closeOverlay?: () => void
}

export const MealFilterBar = ({
  onApplyFilters,
  onHealthyToggleChange,
  healthyToggleState,
  onNewOrUpdatedToggleChange,
  newOrUpdatedToggleState,
  mobileDockMode = false,
  className = '',
  closeOverlay,
}: MealFilterBarProps) => {
  const handleApplyFilters = () => {
    onApplyFilters()
    closeOverlay?.()
  }

  return (
    <div className={`flex mx-5 gap-2 flex-col ${className}`.trim()}>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex gap-2 shrink-0">
          <Toggle
            label={FILTER_LABELS.healthyOptions}
            checked={healthyToggleState}
            onChange={onHealthyToggleChange}
            className="border p-2 grow"
          />

          <Toggle
            label={FILTER_LABELS.newOrUpdated}
            checked={newOrUpdatedToggleState}
            onChange={onNewOrUpdatedToggleChange}
            className="border p-2 grow"
          />
        </div>
      </div>

      <div className={`flex ${mobileDockMode ? '' : 'sm:justify-end'}`}>
        <Button size="sm" tone="success" className="w-full sm:w-auto" onClick={handleApplyFilters}>
          {FILTER_LABELS.applyFilters}
        </Button>
      </div>
    </div>
  )
}
