import { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'soft'
type ButtonTone = 'neutral' | 'primary' | 'success' | 'error' | 'info'
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

type ButtonProps = {
  variant?: ButtonVariant
  tone?: ButtonTone
  size?: ButtonSize
  circle?: boolean
  isLoading?: boolean
  startIcon?: ReactNode
  endIcon?: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>

const loadingClassBySize: Record<ButtonSize, string> = {
  xs: 'loading-xs',
  sm: 'loading-sm',
  md: 'loading-md',
  lg: 'loading-lg',
}

export const Button = ({
  variant = 'solid',
  tone,
  size,
  circle = false,
  isLoading = false,
  startIcon,
  endIcon,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) => {
  const classes = [
    'btn',
    variant !== 'solid' ? `btn-${variant}` : null,
    tone ? `btn-${tone}` : null,
    size ? `btn-${size}` : null,
    circle ? 'btn-circle' : null,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={classes} disabled={disabled || isLoading} {...props}>
      {isLoading && (
        <span className={`loading loading-spinner ${loadingClassBySize[size ?? 'md']}`}></span>
      )}
      {startIcon}
      {children}
      {endIcon}
    </button>
  )
}
