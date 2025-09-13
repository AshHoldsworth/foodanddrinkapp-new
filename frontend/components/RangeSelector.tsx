interface RangeSelectorProps {
    label: string
    min: number
    max: number
    step: number
    value: number
    onChange: (value: number) => void
    options: string[]
}

export const RangeSelector = ({
    label,
    min,
    max,
    step,
    value,
    onChange,
    options,
}: RangeSelectorProps) => {
    return (
        <fieldset className="fieldset bg-base-100 border-base-300 rounded-box border p-4 grow">
            <legend className="fieldset-legend">{label}</legend>
            <input
                type="range"
                min={min}
                max={max}
                value={value}
                className="range w-full"
                step={step}
                onChange={(e) => onChange?.(Number(e.target.value))}
            />
            <div className="flex justify-between px-2.5 mt-2">
                {options.map((option, index) => (
                    <span key={index}>{option}</span>
                ))}
            </div>
        </fieldset>
    )
}
