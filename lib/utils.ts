import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes with tailwind-merge for deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency for display
 */
export function formatCurrency(
  amount: number,
  currency: string = 'EUR',
  locale: string = 'fi-FI'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Format number with proper locale formatting
 */
export function formatNumber(
  number: number,
  locale: string = 'fi-FI'
): string {
  return new Intl.NumberFormat(locale).format(number)
}

/**
 * Calculate points based on amount and tier
 */
export function calculatePoints(
  amount: number,
  tier: 'Bronze' | 'Silver' | 'Gold' | 'VIP' = 'Bronze',
  hasQrBonus: boolean = false
): number {
  const basePointsPerEuro = 2 // Bronze tier
  const tierMultipliers = {
    Bronze: 1.0,
    Silver: 1.25,
    Gold: 1.5,
    VIP: 2.0
  }
  
  const qrMultiplier = hasQrBonus ? 1.5 : 1.0
  const basePoints = Math.floor(amount * basePointsPerEuro)
  
  return Math.floor(basePoints * tierMultipliers[tier] * qrMultiplier)
}

/**
 * Get tier from points
 */
export function getTierFromPoints(points: number): {
  tier: 'Bronze' | 'Silver' | 'Gold' | 'VIP'
  pointsToNext: number
  progress: number
} {
  const thresholds = [
    { tier: 'Bronze' as const, min: 0, max: 499 },
    { tier: 'Silver' as const, min: 500, max: 1499 },
    { tier: 'Gold' as const, min: 1500, max: 3999 },
    { tier: 'VIP' as const, min: 4000, max: Infinity }
  ]
  
  const currentThreshold = thresholds.find(t => points >= t.min && points <= t.max) || thresholds[0]
  const nextThreshold = thresholds.find(t => t.min > points)
  
  const pointsToNext = nextThreshold ? nextThreshold.min - points : 0
  const progress = nextThreshold 
    ? ((points - currentThreshold.min) / (nextThreshold.min - currentThreshold.min)) * 100
    : 100
  
  return {
    tier: currentThreshold.tier,
    pointsToNext,
    progress: Math.min(100, Math.max(0, progress))
  }
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: any): boolean {
  if (value == null) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json)
  } catch {
    return fallback
  }
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2)
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  const intervals = [
    { label: 'vuosi', seconds: 31536000 },
    { label: 'kuukausi', seconds: 2592000 },
    { label: 'päivä', seconds: 86400 },
    { label: 'tunti', seconds: 3600 },
    { label: 'minuutti', seconds: 60 },
    { label: 'sekunti', seconds: 1 }
  ]
  
  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds)
    if (count > 0) {
      return `${count} ${interval.label}${count > 1 ? 'a' : ''} sitten`
    }
  }
  
  return 'juuri nyt'
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate Finnish phone number
 */
export function isValidFinnishPhone(phone: string): boolean {
  const phoneRegex = /^(\+358|0)[0-9]{8,9}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    try {
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return true
    } catch {
      document.body.removeChild(textArea)
      return false
    }
  }
}
