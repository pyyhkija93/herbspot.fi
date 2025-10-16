'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Button variants using CVA for type-safe styling
const buttonVariants = cva(
  'btn-base',
  {
    variants: {
      variant: {
        primary: [
          'bg-[var(--color-accent)]',
          'text-black',
          'hover:bg-[var(--color-accent-hover)]',
          'active:scale-[0.98]',
          'shadow-sm'
        ],
        secondary: [
          'bg-[var(--color-bg-tertiary)]',
          'text-[var(--color-fg)]',
          'border border-[var(--color-border)]',
          'hover:bg-[var(--color-border)]',
          'hover:border-[var(--color-border-hover)]'
        ],
        ghost: [
          'bg-transparent',
          'text-[var(--color-fg-secondary)]',
          'hover:bg-[var(--color-bg-secondary)]',
          'hover:text-[var(--color-fg)]'
        ],
        destructive: [
          'bg-[var(--color-error)]',
          'text-white',
          'hover:bg-red-600',
          'active:scale-[0.98]'
        ],
        outline: [
          'border border-[var(--color-border)]',
          'bg-transparent',
          'text-[var(--color-fg)]',
          'hover:bg-[var(--color-bg-secondary)]',
          'hover:border-[var(--color-border-hover)]'
        ]
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        default: 'h-10 px-4 py-2',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10'
      },
      loading: {
        true: 'cursor-not-allowed opacity-70',
        false: ''
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
      loading: false
    }
  }
)

// Loading spinner component
const LoadingSpinner = ({ size = 'default' }: { size?: string }) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    default: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
    icon: 'w-4 h-4'
  }

  return (
    <span 
      className={cn(
        'animate-spin border-2 border-current border-t-transparent rounded-full',
        sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.default
      )}
      aria-hidden="true"
    />
  )
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    loading = false, 
    disabled,
    leftIcon,
    rightIcon,
    fullWidth,
    children, 
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading

    return (
      <button
        className={cn(
          buttonVariants({ variant, size, loading, className }),
          fullWidth && 'w-full',
          className
        )}
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && (
          <LoadingSpinner size={size} />
        )}
        {!loading && leftIcon && (
          <span className="flex-shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        <span className={cn(
          'flex-1 text-center',
          loading && 'opacity-0'
        )}>
          {children}
        </span>
        {!loading && rightIcon && (
          <span className="flex-shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
