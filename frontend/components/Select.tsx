interface SelectProps {
    default: string
    options: string[]
    onChange?: (value: string) => void
}

export const Select = ({ default: defaultValue, options, onChange }: SelectProps) => {
    return (
        <select defaultValue={defaultValue} className="select" onChange={e => onChange?.(e.target.value)}>
            {options.map(option => (
                <option key={option} value={option}>
                    {option}
                </option>
            ))}
        </select>
    )
}
