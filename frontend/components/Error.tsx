import { ExclamationCircleIcon } from "@heroicons/react/16/solid"

interface ErrorProps {
    title: string
    message: string
}

export const Error = ({ title, message }: ErrorProps) => {
    return (
        <div className="flex flex-col items-center text-red-500">
            <ExclamationCircleIcon className="h-32 w-32"/>
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="text-lg">{message}</p>
        </div>
    )
}

export default Error
