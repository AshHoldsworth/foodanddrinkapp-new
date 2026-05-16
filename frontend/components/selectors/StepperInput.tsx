import { Button } from '@/components/Button'
import { MinusIcon, PlusIcon } from '@heroicons/react/16/solid'

interface StepperInputProps {
  id: string
  value: number
  min?: number
  onChange: (value: number) => void
  disabled?: boolean
}

export const StepperInput = ({
  id: id,
  value,
  min = 0,
  onChange,
  disabled = false,
}: StepperInputProps) => {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="sm"
        disabled={disabled || value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        data-testid={`decrement-button-${id}`}
      >
        <MinusIcon className="w-4 h-4" />
      </Button>
      <input
        className="font-semibold w-8 text-center tabular-nums"
        type="text"
        value={value}
        onChange={(e) => onChange(Number(e.target.value.replace(/[^0-9]/g, '')))}
        min={min}
        disabled={disabled}
        id={`stepper-input-${id}`}
      />
      <Button
        tone="neutral"
        size="sm"
        disabled={disabled}
        onClick={() => onChange(value + 1)}
        data-testid={`increment-button-${id}`}
      >
        <PlusIcon className="w-4 h-4" />
      </Button>
    </div>
  )
}
