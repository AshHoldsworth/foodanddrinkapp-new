interface SelectProps {
  label?: string | null
  defaultValue?: string | number
  value?: string | number
  options: { label: string; value: string | number }[]
  onChange?: (value: string) => void
  className?: string
  direction?: 'row' | 'col'
  disabled?: boolean
}

export const Select = ({
  defaultValue,
  value,
  options,
  onChange,
  label = null,
  direction = 'row',
  className = '',
  disabled = false,
}: SelectProps) => {
  return (
    <>
      <div
        className={`flex gap-3 mb-2 grow ${direction === 'col' ? 'flex-col' : 'flex-row'}`.trim()}
      >
        {label && <label className="fieldset-legend">{label}</label>}
        <select
          {...(value !== undefined ? { value } : { defaultValue: defaultValue ?? '' })}
          className={`select ${className}`.trim()}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.value)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </>
  )
}
