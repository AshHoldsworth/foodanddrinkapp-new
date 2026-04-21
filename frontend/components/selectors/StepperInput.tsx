import { Button } from '@/components/Button'

interface StepperInputProps {
  value: number
  min?: number
  onChange: (value: number) => void
  disabled?: boolean
}

export const StepperInput = ({ value, min = 0, onChange, disabled = false }: StepperInputProps) => {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="sm"
        disabled={disabled || value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        -
      </Button>
      <span className="font-semibold w-8 text-center tabular-nums">{value}</span>
      <Button tone="neutral" size="sm" disabled={disabled} onClick={() => onChange(value + 1)}>
        +
      </Button>
    </div>
  )
}
