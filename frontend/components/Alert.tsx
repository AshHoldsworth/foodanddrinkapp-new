import {
    ExclamationCircleIcon,
    QuestionMarkCircleIcon,
    XCircleIcon,
    CheckCircleIcon,
    XMarkIcon,
} from "@heroicons/react/16/solid"
import { JSX } from "react"

export interface AlertProps {
    message: string
    type: "error" | "warning" | "info" | "success"
    onCloseClick?: () => void
}

export const Alert = ({ message, type, onCloseClick }: AlertProps) => {
    let icon : JSX.Element
    let className: string
    switch (type) {
        case "error":
            icon = <XCircleIcon className="h-6 w-6" />
            className = `alert alert-error fixed top-5 left-10 right-10 z-200`
            break
        case "warning":
            icon = <ExclamationCircleIcon className="h-6 w-6" />
            className = `alert alert-warning fixed top-5 left-10 right-10 z-200`
            break
        case "info":
            icon = <QuestionMarkCircleIcon className="h-6 w-6" />
            className = `alert alert-info fixed top-5 left-10 right-10 z-200`
            break
        case "success":
            icon = <CheckCircleIcon className="h-6 w-6" />
            className = `alert alert-success fixed top-5 left-10 right-10 z-200`
            break
        default:
            throw new Error(`Unknown alert type: ${type}`)
    }

    return (
        <div role="alert" className={className}>
            {icon}
            {message}
            <XMarkIcon className="h-6 w-6 cursor-pointer" onClick={onCloseClick} />
        </div>
    )
}
