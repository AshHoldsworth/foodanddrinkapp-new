import { macroOptions, courseOptions, costOptionsShort, difficultyOptions, speedOptions, costOptionsNumbered } from '@/lib/constants';
import { ComponentProps } from 'react';

interface BaseSelectProps extends Omit<ComponentProps<'select'>, 'onChange'> {
  value: string | number | undefined;
  onChange: (value: string) => void;
  includeBlank?: boolean;
  blankLabel?: string;
  options: readonly { value: string | number; label: string }[];
}

export function GenericSelect({ value, onChange, includeBlank, blankLabel = 'Select', options, className = '', ...rest }: BaseSelectProps) {
  return (
    <select
      value={value === undefined ? '' : value}
      onChange={(e) => onChange(e.target.value)}
      className={className || 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'}
      {...rest}
    >
      {includeBlank && <option value="">{blankLabel}</option>}
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

// Domain-specific helpers
export const CourseSelect = (p: Omit<BaseSelectProps, 'options'>) => (
  <GenericSelect includeBlank blankLabel="All Courses" {...p} options={courseOptions.map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))} />
);
export const DifficultySelect = (p: Omit<BaseSelectProps, 'options'>) => (
  <GenericSelect includeBlank blankLabel="All Difficulties" {...p} options={difficultyOptions} />
);
export const SpeedSelect = (p: Omit<BaseSelectProps, 'options'>) => (
  <GenericSelect includeBlank blankLabel="All Speeds" {...p} options={speedOptions} />
);
export const CostSelect = (p: Omit<BaseSelectProps, 'options'> & { numbered?: boolean }) => (
  <GenericSelect includeBlank blankLabel="All Costs" {...p} options={(p.numbered ? costOptionsNumbered : costOptionsShort)} />
);
export const MacroSelect = (p: Omit<BaseSelectProps, 'options'> & { allowAll?: boolean; exclude?: string[] }) => {
  const { allowAll, exclude = [], ...rest } = p;
  const opts = macroOptions.filter(m => !exclude.includes(m)).map(m => ({ value: m, label: m }));
  return <GenericSelect includeBlank={allowAll} blankLabel={allowAll ? 'All Macros' : 'Select macro'} {...rest} options={opts} />;
};
