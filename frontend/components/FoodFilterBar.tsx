interface FoodFilterBarProps {
    onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    searchInput?: string
    onHealthyToggleChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    healthyToggleState?: boolean
    onCostChange?: (value: number) => void
    cost?: number
    onRatingChange?: (value: number) => void
    rating?: number
    onSpeedChange?: (value: number) => void
    speed?: number
}

export const FoodFilterBar = ({
    onSearchChange,
    searchInput,
    onHealthyToggleChange,
    healthyToggleState,
    onCostChange,
    cost,
    onRatingChange,
    rating,
    onSpeedChange,
    speed,
}: FoodFilterBarProps) => {
    return (
        <div className="flex justify-center mx-5 gap-3 flex-col">
            {/* Search Input */}
            <div className="flex grow">
            <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-full border p-4">
                <legend className="fieldset-legend">Search</legend>
                <input
                    type="text"
                    className="input w-full"
                    placeholder="eg. Chicken Salad"
                    onChange={onSearchChange}
                    value={searchInput}
                />
            </fieldset>
            </div>

            <div className="flex grow gap-3">
            {/* Healthy Choice Toggle */}
            <fieldset className="fieldset bg-base-100 border-base-300 rounded-box w-32 border py-6 grow">
                <legend className="fieldset-legend">Healthy Choice</legend>
                <div className="m-auto">
                    <input
                        type="checkbox"
                        checked={healthyToggleState}
                        onChange={onHealthyToggleChange}
                        className="toggle toggle-success"
                    />
                </div>
            </fieldset>

            {/* Cost Range */}
            <fieldset className="fieldset bg-base-100 border-base-300 rounded-box w-64 border p-4 grow">
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

            {/* Rating Range */}
            <fieldset className="fieldset bg-base-100 border-base-300 rounded-box w-64 border p-4 grow">
                <legend className="fieldset-legend">Rating</legend>
                <input
                    type="range"
                    min={1}
                    max={10}
                    value={rating}
                    className="range"
                    step={1}
                    onChange={(e) => onRatingChange?.(Number(e.target.value))}
                />
                <div className="flex justify-between px-2.5 mt-2">
                    <span>1</span>
                    <span>5</span>
                    <span>10</span>
                </div>
            </fieldset>

            {/* Speed Range */}
            <fieldset className="fieldset bg-base-100 border-base-300 rounded-box w-64 border p-4 grow">
                <legend className="fieldset-legend">Speed</legend>
                <input
                    type="range"
                    min={1}
                    max={3}
                    value={speed}
                    className="range"
                    step={1}
                    onChange={(e) => onSpeedChange?.(Number(e.target.value))}
                />
                <div className="flex justify-between px-2.5 mt-2">
                    <span>Slow</span>
                    <span>Average</span>
                    <span>Fast</span>
                </div>
            </fieldset>
            </div>
        </div>
    )
}
