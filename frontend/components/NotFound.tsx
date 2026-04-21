import { getIcon } from '@/utils/getIcon'
import { PlusIcon } from '@heroicons/react/16/solid'

export const NotFound = ({ label }: { label: string }) => {
  return (
    <div>
      <p>No {label}s found.</p>
      <br />
      To add a new {label.toLowerCase()}, click the{' '}
      <span className="font-bold">
        <PlusIcon className="inline-block w-4 h-4" /> Add
      </span>{' '}
      button and select{' '}
      <span className="font-bold">
        {getIcon({ type: label, className: 'inline-block w-4 h-4' })} Add {label}
      </span>
      .
      <p>
        <br />
        If you have made changes to the filters, please adjust them accordingly.
      </p>
    </div>
  )
}
