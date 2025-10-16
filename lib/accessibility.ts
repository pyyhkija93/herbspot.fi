/**
 * Accessibility utilities and helpers for HerbSpot.fi
 * Ensures WCAG 2.1 AA compliance and excellent user experience
 */

// ARIA roles and attributes
export const ARIA_ROLES = {
  ALERT: 'alert',
  ALERTDIALOG: 'alertdialog',
  BUTTON: 'button',
  CHECKBOX: 'checkbox',
  DIALOG: 'dialog',
  FORM: 'form',
  GROUP: 'group',
  LINK: 'link',
  LIST: 'list',
  LISTITEM: 'listitem',
  MENU: 'menu',
  MENUITEM: 'menuitem',
  NAVIGATION: 'navigation',
  RADIO: 'radio',
  RADIOGROUP: 'radiogroup',
  REGION: 'region',
  TAB: 'tab',
  TABLIST: 'tablist',
  TABPANEL: 'tabpanel',
  TEXTBOX: 'textbox',
  TOOLBAR: 'toolbar'
} as const

// ARIA states and properties
export const ARIA_STATES = {
  ARIA_EXPANDED: 'aria-expanded',
  ARIA_SELECTED: 'aria-selected',
  ARIA_CHECKED: 'aria-checked',
  ARIA_DISABLED: 'aria-disabled',
  ARIA_HIDDEN: 'aria-hidden',
  ARIA_INVALID: 'aria-invalid',
  ARIA_REQUIRED: 'aria-required',
  ARIA_BUSY: 'aria-busy',
  ARIA_LIVE: 'aria-live',
  ARIA_ATOMIC: 'aria-atomic',
  ARIA_RELEVANT: 'aria-relevant'
} as const

// Live regions for announcements
export const LIVE_REGIONS = {
  POLITE: 'polite',
  ASSERTIVE: 'assertive',
  OFF: 'off'
} as const

// Keyboard navigation
export const KEYBOARD_KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown'
} as const

// Focus management
export class FocusManager {
  private focusHistory: HTMLElement[] = []
  private currentFocusIndex = -1

  // Save current focus
  saveFocus(): void {
    const activeElement = document.activeElement as HTMLElement
    if (activeElement && activeElement !== document.body) {
      this.focusHistory.push(activeElement)
      this.currentFocusIndex = this.focusHistory.length - 1
    }
  }

  // Restore previous focus
  restoreFocus(): void {
    if (this.focusHistory.length > 0 && this.currentFocusIndex >= 0) {
      const element = this.focusHistory[this.currentFocusIndex]
      if (element && document.contains(element)) {
        element.focus()
      }
    }
  }

  // Trap focus within a container
  trapFocus(container: HTMLElement): () => void {
    const focusableElements = this.getFocusableElements(container)
    
    if (focusableElements.length === 0) return () => {}

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === KEYBOARD_KEYS.TAB) {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    // Focus first element
    firstElement.focus()
    
    // Add event listener
    container.addEventListener('keydown', handleKeyDown)
    
    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }

  // Get all focusable elements within a container
  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ')

    return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[]
  }
}

// Announce messages to screen readers
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

// Skip link component
export function createSkipLink(targetId: string, label: string = 'Siirry pääsisältöön'): HTMLElement {
  const skipLink = document.createElement('a')
  skipLink.href = `#${targetId}`
  skipLink.textContent = label
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-[var(--color-accent)] text-black px-4 py-2 rounded-lg font-medium z-[var(--z-tooltip)]'
  skipLink.style.position = 'absolute'
  
  return skipLink
}

// High contrast mode detection
export function isHighContrastMode(): boolean {
  return window.matchMedia('(prefers-contrast: high)').matches
}

// Reduced motion detection
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Color scheme detection
export function getColorScheme(): 'light' | 'dark' | 'no-preference' {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light'
  }
  return 'no-preference'
}

// Validate ARIA attributes
export function validateAriaAttributes(element: HTMLElement): string[] {
  const errors: string[] = []
  
  // Check for required ARIA attributes
  if (element.getAttribute('aria-label') && element.getAttribute('aria-labelledby')) {
    errors.push('Element has both aria-label and aria-labelledby')
  }
  
  if (element.getAttribute('aria-expanded') && !['button', 'link'].includes(element.getAttribute('role') || '')) {
    errors.push('aria-expanded should only be used on button or link elements')
  }
  
  if (element.getAttribute('aria-controls')) {
    const controlsId = element.getAttribute('aria-controls')
    const controlledElement = document.getElementById(controlsId || '')
    if (!controlledElement) {
      errors.push(`aria-controls references non-existent element: ${controlsId}`)
    }
  }
  
  return errors
}

// Keyboard navigation helpers
export function handleKeyboardNavigation(
  event: KeyboardEvent,
  options: {
    onEnter?: () => void
    onSpace?: () => void
    onEscape?: () => void
    onArrowUp?: () => void
    onArrowDown?: () => void
    onArrowLeft?: () => void
    onArrowRight?: () => void
    onHome?: () => void
    onEnd?: () => void
  }
): void {
  switch (event.key) {
    case KEYBOARD_KEYS.ENTER:
      options.onEnter?.()
      event.preventDefault()
      break
    case KEYBOARD_KEYS.SPACE:
      options.onSpace?.()
      event.preventDefault()
      break
    case KEYBOARD_KEYS.ESCAPE:
      options.onEscape?.()
      event.preventDefault()
      break
    case KEYBOARD_KEYS.ARROW_UP:
      options.onArrowUp?.()
      event.preventDefault()
      break
    case KEYBOARD_KEYS.ARROW_DOWN:
      options.onArrowDown?.()
      event.preventDefault()
      break
    case KEYBOARD_KEYS.ARROW_LEFT:
      options.onArrowLeft?.()
      event.preventDefault()
      break
    case KEYBOARD_KEYS.ARROW_RIGHT:
      options.onArrowRight?.()
      event.preventDefault()
      break
    case KEYBOARD_KEYS.HOME:
      options.onHome?.()
      event.preventDefault()
      break
    case KEYBOARD_KEYS.END:
      options.onEnd?.()
      event.preventDefault()
      break
  }
}

// Form accessibility helpers
export function createFieldError(element: HTMLElement, message: string): void {
  const errorId = `${element.id}-error`
  
  // Remove existing error
  const existingError = document.getElementById(errorId)
  if (existingError) {
    existingError.remove()
  }
  
  // Create error element
  const errorElement = document.createElement('div')
  errorElement.id = errorId
  errorElement.className = 'text-sm text-[var(--color-error)] mt-1'
  errorElement.setAttribute('role', 'alert')
  errorElement.textContent = message
  
  // Insert after element
  element.parentNode?.insertBefore(errorElement, element.nextSibling)
  
  // Update element attributes
  element.setAttribute('aria-invalid', 'true')
  element.setAttribute('aria-describedby', errorId)
}

export function removeFieldError(element: HTMLElement): void {
  const errorId = `${element.id}-error`
  const errorElement = document.getElementById(errorId)
  
  if (errorElement) {
    errorElement.remove()
  }
  
  element.removeAttribute('aria-invalid')
  element.removeAttribute('aria-describedby')
}

// Loading state management
export function setLoadingState(element: HTMLElement, isLoading: boolean): void {
  if (isLoading) {
    element.setAttribute('aria-busy', 'true')
    element.setAttribute('aria-disabled', 'true')
  } else {
    element.removeAttribute('aria-busy')
    element.removeAttribute('aria-disabled')
  }
}

// Focus indicators
export function ensureFocusIndicator(element: HTMLElement): void {
  if (!element.style.outline && !element.classList.contains('focus-visible')) {
    element.style.outline = '2px solid var(--color-accent)'
    element.style.outlineOffset = '2px'
  }
}

// Screen reader only text
export function createScreenReaderOnly(text: string): HTMLElement {
  const element = document.createElement('span')
  element.className = 'sr-only'
  element.textContent = text
  return element
}

// Export focus manager instance
export const focusManager = new FocusManager()
