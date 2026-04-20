interface StepperInputProps {
  value: number
  min?: number
  onChange: (value: number) => void
  disabled?: boolean
}

export const StepperInput = ({ value, min = 0, onChange, disabled = false }: StepperInputProps) => {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="btn btn-outline btn-sm"
        disabled={disabled || value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        -
      </button>
      <span className="font-semibold w-8 text-center tabular-nums mx-2">{value}</span>
      <button
        type="button"
        className="btn btn-neutral btn-sm"
        disabled={disabled}
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  )
}
