interface ToggleProps {
    label: string
    checked: boolean
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const Toggle = ({ label, checked, onChange }: ToggleProps) => {
    return (
        <fieldset className="fieldset bg-base-100 border-base-300 rounded-box border py-6 grow">
            <legend className="fieldset-legend">{label}</legend>
            <div className="m-auto">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    className="toggle toggle-success"
                />
            </div>
        </fieldset>
    )
}
