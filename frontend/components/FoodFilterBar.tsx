interface FoodFilterBarProps {
    onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    searchInput?: string
    onHealthyToggleChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    healthyToggleState?: boolean
    onCostChange?: (value: number) => void
    cost?: number
}

export const FoodFilterBar = ({
    onSearchChange,
    searchInput,
    onHealthyToggleChange,
    healthyToggleState,
    onCostChange,
    cost,
}: FoodFilterBarProps) => {
    return (
        <div className="flex justify-start mx-5 gap-3">
            {/* Search Input */}
            <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
                <legend className="fieldset-legend">Search</legend>
                <input
                    type="text"
                    className="input"
                    placeholder="eg. Chicken Salad"
                    onChange={onSearchChange}
                    value={searchInput}
                />
            </fieldset>

            {/* Healthy Choice Toggle */}
            <fieldset className="fieldset bg-base-100 border-base-300 rounded-box w-32 border p-4">
                <legend className="fieldset-legend">Healthy Choice</legend>
                <div className="mx-auto">
                    <input
                        type="checkbox"
                        checked={healthyToggleState}
                        onChange={onHealthyToggleChange}
                        className="toggle toggle-success"
                    />
                </div>
            </fieldset>

            {/* Cost Range */}
            <fieldset className="fieldset bg-base-100 border-base-300 rounded-box w-64 border p-4">
                <legend className="fieldset-legend">Cost</legend>
                <input
                    type="range"
                    min={1}
                    max={3}
                    value={cost}
                    className="range"
                    step={1}
                    onChange={(e) => onCostChange?.(Number(e.target.value))}
                />
                <div className="flex justify-between px-2.5 mt-2">
                    <span>£</span>
                    <span>££</span>
                    <span>£££</span>
                </div>
            </fieldset>
        </div>
    )
}
