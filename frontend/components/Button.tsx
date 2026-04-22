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

const variantClassByVariant: Record<ButtonVariant, string | null> = {
  solid: null,
  outline: 'btn-outline',
  ghost: 'btn-ghost',
  soft: 'btn-soft',
}

const toneClassByTone: Record<ButtonTone, string> = {
  neutral: 'btn-neutral',
  primary: 'btn-primary',
  success: 'btn-success',
  error: 'btn-error',
  info: 'btn-info',
}

const sizeClassBySize: Record<ButtonSize, string> = {
  xs: 'btn-xs',
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
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
    variantClassByVariant[variant],
    tone ? toneClassByTone[tone] : null,
    size ? sizeClassBySize[size] : null,
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
