import {
    ExclamationCircleIcon,
    QuestionMarkCircleIcon,
    XCircleIcon,
    CheckCircleIcon,
} from "@heroicons/react/16/solid"

export interface AlertProps {
    message: string
    type: "error" | "warning" | "info" | "success"
}

export const Alert = ({ message, type }: AlertProps) => {
    let icon
    switch (type) {
        case "error":
            icon = <XCircleIcon className="h-6 w-6" />
            break
        case "warning":
            icon = <ExclamationCircleIcon className="h-6 w-6" />
            break
        case "info":
            icon = <QuestionMarkCircleIcon className="h-6 w-6" />
            break
        case "success":
            icon = <CheckCircleIcon className="h-6 w-6" />
            break
        default:
            throw new Error(`Unknown alert type: ${type}`)
    }

    return (
        <div role="alert" className={`alert alert-${type} fixed top-5 left-10 right-10 z-200`}>
            {icon}
            {message}
        </div>
    )
}
