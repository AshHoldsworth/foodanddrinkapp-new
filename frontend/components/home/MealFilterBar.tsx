import { useState } from 'react'
import { MEAL_FILTER_LABELS, MEAL_FILTER_LIMITS, MEAL_FILTER_OPTIONS } from '../../constants/meal'
import { RangeSelector } from '../selectors/RangeSelector'
import { SearchBox } from '../selectors/SearchBox'
import { Toggle } from '../selectors/Toggle'

interface MealFilterBarProps {
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  searchInput?: string
  onSearchClear: () => void
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
}

export const MealFilterBar = ({
  onSearchChange,
  searchInput,
  onSearchClear,
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
}: MealFilterBarProps) => {
  const [showFilters, setShowFilters] = useState(false)

  return (
    <div className="flex justify-center mx-5 gap-3 flex-col">
      <div className="flex gap-3 items-center">
        <div className="flex grow">
          <SearchBox
            onSearchChange={onSearchChange}
            searchInput={searchInput}
            onClear={onSearchClear}
          />
        </div>
      </div>

      <button
        onClick={() => setShowFilters(!showFilters)}
        className="btn btn-outline btn-neutral sm:hidden"
      >
        {showFilters ? MEAL_FILTER_LABELS.hideFilters : MEAL_FILTER_LABELS.showFilters}
      </button>

      <div className={`flex-col grow sm:flex-row gap-3 ${showFilters ? 'flex' : 'hidden sm:flex'}`}>
        <div className="flex gap-3 grow">
          <Toggle
            label={MEAL_FILTER_LABELS.healthyOptions}
            checked={healthyToggleState}
            onChange={onHealthyToggleChange}
          />

          <Toggle
            label={MEAL_FILTER_LABELS.newOrUpdated}
            checked={newOrUpdatedToggleState}
            onChange={onNewOrUpdatedToggleChange}
          />
        </div>

        <RangeSelector
          label={MEAL_FILTER_LABELS.cost}
          min={MEAL_FILTER_LIMITS.costMin}
          max={MEAL_FILTER_LIMITS.costMax}
          step={1}
          value={cost}
          onChange={onCostChange}
          options={MEAL_FILTER_OPTIONS.cost.map((option) => option.label)}
        />

        <RangeSelector
          label={MEAL_FILTER_LABELS.rating}
          min={MEAL_FILTER_LIMITS.ratingMin}
          max={MEAL_FILTER_LIMITS.ratingMax}
          step={1}
          value={rating}
          onChange={onRatingChange}
          options={[...MEAL_FILTER_OPTIONS.rating]}
        />

        <RangeSelector
          label={MEAL_FILTER_LABELS.speed}
          min={MEAL_FILTER_LIMITS.speedMin}
          max={MEAL_FILTER_LIMITS.speedMax}
          step={1}
          value={speed}
          onChange={onSpeedChange}
          options={MEAL_FILTER_OPTIONS.speed.map((option) => option.label)}
        />
      </div>

      <div className={`${showFilters ? 'flex' : 'hidden'} sm:hidden`}>
        <button className="btn btn-neutral w-full" onClick={onApplyFilters}>
          {MEAL_FILTER_LABELS.applyFilters}
        </button>
      </div>

      <div className="hidden sm:flex sm:justify-end">
        <button className="btn btn-neutral w-full sm:w-auto" onClick={onApplyFilters}>
          {MEAL_FILTER_LABELS.applyFilters}
        </button>
      </div>

      <div>{/* <Select /> */}</div>
    </div>
  )
}
