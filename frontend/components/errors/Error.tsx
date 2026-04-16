import { ExclamationCircleIcon } from '@heroicons/react/16/solid'

interface ErrorProps {
  title: string
  message: string
  onRetry?: () => void
}

export const Error = ({ title, message, onRetry }: ErrorProps) => {
  return (
    <div className="flex flex-col items-center text-red-500">
      <ExclamationCircleIcon className="h-32 w-32" />
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="text-lg">{message}</p>
      {onRetry && (
        <button
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded cursor-pointer"
          onClick={onRetry}
        >
          Retry
        </button>
      )}
    </div>
  )
}

export default Error
