interface ToggleProps {
    label: string
    checked: boolean
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    className?: string
}

export const Toggle = ({ label, checked, onChange, className }: ToggleProps) => {
    return (
        <fieldset className={`fieldset bg-base-100 border-base-300 rounded-box ${className ? className : "border py-6 grow"}`}>
            <legend className={`${className ? className : "fieldset-legend"}`}>{label}</legend>
            <div className="m-auto">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    className={`toggle toggle-success`}
                />
            </div>
        </fieldset>
    )
}
