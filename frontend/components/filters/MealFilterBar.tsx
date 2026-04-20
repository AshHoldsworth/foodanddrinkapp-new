import { FILTER_LABELS, FILTER_LIMITS } from '../../constants/filter'
import { RangeSelector } from '../selectors/RangeSelector'
import { Toggle } from '../selectors/Toggle'
import { COST_OPTIONS, RATING_FILTER_OPTIONS, SPEED_OPTIONS } from '@/constants'

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
  onCostChange,
  cost,
  onRatingChange,
  rating,
  onSpeedChange,
  speed,
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

        <RangeSelector
          label={FILTER_LABELS.cost}
          min={FILTER_LIMITS.costMin}
          max={FILTER_LIMITS.costMax}
          step={1}
          value={cost}
          onChange={onCostChange}
          options={COST_OPTIONS.map((option) => option.label)}
          className="p-2 text-xs"
        />

        <RangeSelector
          label={FILTER_LABELS.rating}
          min={FILTER_LIMITS.ratingMin}
          max={FILTER_LIMITS.ratingMax}
          step={1}
          value={rating}
          onChange={onRatingChange}
          options={RATING_FILTER_OPTIONS.map((option) => option)}
          className="p-2 text-xs"
        />

        <RangeSelector
          label={FILTER_LABELS.speed}
          min={FILTER_LIMITS.speedMin}
          max={FILTER_LIMITS.speedMax}
          step={1}
          value={speed}
          onChange={onSpeedChange}
          options={SPEED_OPTIONS.map((option) => option.label)}
          className="p-2 text-xs"
        />
      </div>

      <div className={`flex ${mobileDockMode ? '' : 'sm:justify-end'}`}>
        <button className="btn btn-sm btn-success w-full sm:w-auto" onClick={handleApplyFilters}>
          {FILTER_LABELS.applyFilters}
        </button>
      </div>
    </div>
  )
}
