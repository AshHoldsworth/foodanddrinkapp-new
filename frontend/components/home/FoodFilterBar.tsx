import { useState } from "react"
import { RangeSelector } from "../RangeSelector"
import { SearchBox } from "../SearchBox"
import { Toggle } from "../Toggle"

interface FoodFilterBarProps {
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    searchInput?: string
    onSearchClear: () => void
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

export const FoodFilterBar = ({
    onSearchChange,
    searchInput,
    onSearchClear,
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
}: FoodFilterBarProps) => {
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
                className="btn btn-outline btn-neutral sm:hidden">
                {showFilters ? "Hide Filters" : "Show Filters"}
            </button>

            <div
                className={`flex-col grow sm:flex-row gap-3 ${
                    showFilters ? "flex" : "hidden sm:flex"
                }`}>
                <div className="flex gap-3 grow">
                    <Toggle
                        label="Healthy Options"
                        checked={healthyToggleState}
                        onChange={onHealthyToggleChange}
                    />

                    <Toggle
                        label="New / Updated"
                        checked={newOrUpdatedToggleState}
                        onChange={onNewOrUpdatedToggleChange}
                    />
                </div>

                <RangeSelector
                    label="Cost"
                    min={1}
                    max={3}
                    step={1}
                    value={cost}
                    onChange={onCostChange}
                    options={["Cheap", "Moderate", "Expensive"]}
                />

                <RangeSelector
                    label="Rating"
                    min={1}
                    max={10}
                    step={1}
                    value={rating}
                    onChange={onRatingChange}
                    options={["1", "5", "10"]}
                />

                <RangeSelector
                    label="Speed"
                    min={1}
                    max={3}
                    step={1}
                    value={speed}
                    onChange={onSpeedChange}
                    options={["Slow", "Average", "Fast"]}
                />
            </div>
        </div>
    )
}
