interface SelectProps {
  defaultValue: string
  options: { label: string; value: number }[]
  onChange?: (value: string) => void
}

export const Select = ({ defaultValue, options, onChange }: SelectProps) => {
  return (
    <select
      defaultValue={defaultValue}
      className="select"
      onChange={(e) => onChange?.(e.target.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
