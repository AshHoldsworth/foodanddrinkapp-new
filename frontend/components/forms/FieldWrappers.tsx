import { ReactNode } from 'react';

interface FieldProps {
  label?: string;
  htmlFor?: string;
  children: ReactNode;
  helpText?: string;
  className?: string;
}

export function Field({ label, htmlFor, children, helpText, className = '' }: FieldProps) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      {children}
      {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
    </div>
  );
}

interface InlineCheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}
export function InlineCheckbox({ id, checked, onChange, label }: InlineCheckboxProps) {
  return (
    <label className="flex items-center">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
      <span className="ml-2 block text-sm text-gray-900">{label}</span>
    </label>
  );
}
