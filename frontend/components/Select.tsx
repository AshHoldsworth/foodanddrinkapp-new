interface SelectProps {
    defaultValue: string
    options: string[]
    onChange?: (value: string) => void
}

export const Select = ({ defaultValue, options, onChange }: SelectProps) => {
    return (
        <select value={defaultValue} className="select" onChange={e => onChange?.(e.target.value)}>
            {options.map(option => (
                <option key={option} value={option}>
                    {option}
                </option>
            ))}
        </select>
    )
}
