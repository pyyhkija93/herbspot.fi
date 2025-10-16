'use client'

import React, { Component, ReactNode } from 'react'
import { Button } from './Button'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, reset: () => void) => ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Log error to monitoring service
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset)
      }

      // Default error UI
      return <DefaultErrorFallback error={this.state.error} onReset={this.handleReset} />
    }

    return this.props.children
  }
}

// Default error fallback component
interface DefaultErrorFallbackProps {
  error: Error
  onReset: () => void
}

const DefaultErrorFallback: React.FC<DefaultErrorFallbackProps> = ({ error, onReset }) => {
  return (
    <div 
      role="alert" 
      className="min-h-[400px] flex items-center justify-center p-6"
      aria-live="polite"
    >
      <div className="max-w-md w-full text-center space-y-6">
        {/* Error Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-red-900/20 flex items-center justify-center">
          <svg 
            className="w-8 h-8 text-red-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
            />
          </svg>
        </div>

        {/* Error Message */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-[var(--color-fg)]">
            Jokin meni pieleen
          </h2>
          <p className="text-[var(--color-fg-secondary)] text-sm">
            Odottamaton virhe tapahtui. Yritämme korjata tilanteen.
          </p>
        </div>

        {/* Error Details (Development only) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="text-left">
            <summary className="cursor-pointer text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg-secondary)]">
              Näytä virheen yksityiskohdat
            </summary>
            <pre className="mt-2 p-3 bg-[var(--color-bg-tertiary)] rounded-lg text-xs text-red-300 overflow-auto max-h-32">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={onReset} variant="primary">
            Yritä uudelleen
          </Button>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
          >
            Päivitä sivu
          </Button>
        </div>

        {/* Help Text */}
        <p className="text-xs text-[var(--color-fg-muted)]">
          Jos ongelma jatkuu, ota yhteyttä{' '}
          <a 
            href="mailto:tuki@herbspot.fi" 
            className="text-[var(--color-accent)] hover:underline"
          >
            tukeen
          </a>
        </p>
      </div>
    </div>
  )
}

// Route-level error component for Next.js App Router
interface ErrorViewProps {
  error: Error & { digest?: string }
  reset: () => void
}

export const ErrorView: React.FC<ErrorViewProps> = ({ error, reset }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-bg)]">
      <div className="max-w-lg w-full">
        <DefaultErrorFallback error={error} onReset={reset} />
      </div>
    </div>
  )
}

// Error retry component for failed operations
interface ErrorRetryProps {
  error?: Error | string
  onRetry: () => void
  title?: string
  description?: string
}

export const ErrorRetry: React.FC<ErrorRetryProps> = ({ 
  error, 
  onRetry, 
  title = "Tapahtui virhe",
  description = "Yritä uudelleen tai päivitä sivu."
}) => {
  const errorMessage = typeof error === 'string' ? error : error?.message

  return (
    <div 
      role="alert" 
      className="p-4 rounded-[var(--radius-lg)] bg-red-900/20 border border-red-800/30"
      aria-live="polite"
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <svg 
            className="w-5 h-5 text-red-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-red-200">
            {title}
          </h3>
          <p className="mt-1 text-sm text-red-300">
            {description}
          </p>
          {errorMessage && (
            <p className="mt-2 text-xs text-red-400 font-mono">
              {errorMessage}
            </p>
          )}
          
          <div className="mt-3">
            <Button 
              onClick={onRetry}
              size="sm"
              variant="secondary"
              className="bg-red-800/30 border-red-700/50 text-red-200 hover:bg-red-800/50"
            >
              Yritä uudelleen
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Empty state component
interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon, 
  title, 
  description, 
  action 
}) => {
  return (
    <div className="text-center py-12 px-4">
      {icon && (
        <div className="mx-auto w-16 h-16 rounded-full bg-[var(--color-bg-tertiary)] flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      
      <h3 className="text-lg font-medium text-[var(--color-fg)] mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-[var(--color-fg-secondary)] text-sm max-w-md mx-auto mb-6">
          {description}
        </p>
      )}
      
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </div>
  )
}
