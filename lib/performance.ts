/**
 * Performance optimization utilities for HerbSpot.fi
 * Implements Core Web Vitals monitoring and optimization techniques
 */

import { debounce, throttle } from './utils'

// Core Web Vitals thresholds
export const CORE_WEB_VITALS = {
  LCP: {
    GOOD: 2500,
    NEEDS_IMPROVEMENT: 4000
  },
  FID: {
    GOOD: 100,
    NEEDS_IMPROVEMENT: 300
  },
  CLS: {
    GOOD: 0.1,
    NEEDS_IMPROVEMENT: 0.25
  },
  INP: {
    GOOD: 200,
    NEEDS_IMPROVEMENT: 500
  }
} as const

// Performance monitoring
export class PerformanceMonitor {
  private metrics: Record<string, number> = {}
  private observers: PerformanceObserver[] = []

  constructor() {
    this.initializeObservers()
  }

  private initializeObservers(): void {
    // LCP Observer
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1] as PerformanceEntry & { element?: Element }
          this.metrics.lcp = lastEntry.startTime
          this.reportMetric('LCP', lastEntry.startTime)
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
        this.observers.push(lcpObserver)
      } catch (error) {
        console.warn('LCP observer not supported:', error)
      }

      // CLS Observer
      try {
        let clsValue = 0
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value
            }
          }
          this.metrics.cls = clsValue
          this.reportMetric('CLS', clsValue)
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
        this.observers.push(clsObserver)
      } catch (error) {
        console.warn('CLS observer not supported:', error)
      }

      // FID Observer
      try {
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const fid = (entry as any).processingStart - entry.startTime
            this.metrics.fid = fid
            this.reportMetric('FID', fid)
          }
        })
        fidObserver.observe({ entryTypes: ['first-input'] })
        this.observers.push(fidObserver)
      } catch (error) {
        console.warn('FID observer not supported:', error)
      }
    }
  }

  private reportMetric(name: string, value: number): void {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}: ${value.toFixed(2)}ms`)
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production' && 'gtag' in window) {
      (window as any).gtag('event', name, {
        value: Math.round(value),
        metric_id: name.toLowerCase(),
        metric_value: value,
        metric_delta: value
      })
    }
  }

  getMetrics(): Record<string, number> {
    return { ...this.metrics }
  }

  disconnect(): void {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

// Image optimization
export class ImageOptimizer {
  private static instance: ImageOptimizer
  private intersectionObserver?: IntersectionObserver
  private loadedImages = new Set<string>()

  static getInstance(): ImageOptimizer {
    if (!ImageOptimizer.instance) {
      ImageOptimizer.instance = new ImageOptimizer()
    }
    return ImageOptimizer.instance
  }

  private constructor() {
    this.initializeLazyLoading()
  }

  private initializeLazyLoading(): void {
    if ('IntersectionObserver' in window) {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement
              this.loadImage(img)
              this.intersectionObserver?.unobserve(img)
            }
          })
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.1
        }
      )
    }
  }

  private loadImage(img: HTMLImageElement): void {
    const src = img.dataset.src
    if (!src || this.loadedImages.has(src)) return

    const image = new Image()
    image.onload = () => {
      img.src = src
      img.classList.remove('opacity-0')
      img.classList.add('opacity-100')
      this.loadedImages.add(src)
    }
    image.onerror = () => {
      img.classList.add('error')
      img.alt = 'Kuva ei voitu ladata'
    }
    image.src = src
  }

  observe(img: HTMLImageElement): void {
    if (this.intersectionObserver && img.dataset.src) {
      this.intersectionObserver.observe(img)
    } else if (img.src) {
      // Already has src, load immediately
      this.loadImage(img)
    }
  }

  unobserve(img: HTMLImageElement): void {
    this.intersectionObserver?.unobserve(img)
  }

  // Preload critical images
  preloadImages(urls: string[]): void {
    urls.forEach(url => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = url
      document.head.appendChild(link)
    })
  }
}

// Bundle optimization
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
): React.ComponentType<React.ComponentProps<T>> {
  return React.lazy(importFn)
}

// Virtual scrolling for large lists
export class VirtualScroller {
  private container: HTMLElement
  private itemHeight: number
  private visibleCount: number
  private totalCount: number
  private scrollTop: number = 0
  private renderCallback: (startIndex: number, endIndex: number) => void

  constructor(
    container: HTMLElement,
    itemHeight: number,
    visibleCount: number,
    totalCount: number,
    renderCallback: (startIndex: number, endIndex: number) => void
  ) {
    this.container = container
    this.itemHeight = itemHeight
    this.visibleCount = visibleCount
    this.totalCount = totalCount
    this.renderCallback = renderCallback

    this.container.style.height = `${visibleCount * itemHeight}px`
    this.container.style.overflow = 'auto'

    this.handleScroll = throttle(this.handleScroll.bind(this), 16)
    this.container.addEventListener('scroll', this.handleScroll)
  }

  private handleScroll(): void {
    this.scrollTop = this.container.scrollTop
    this.render()
  }

  private render(): void {
    const startIndex = Math.floor(this.scrollTop / this.itemHeight)
    const endIndex = Math.min(startIndex + this.visibleCount + 1, this.totalCount)
    
    this.renderCallback(startIndex, endIndex)
  }

  updateTotalCount(totalCount: number): void {
    this.totalCount = totalCount
    this.container.style.height = `${Math.max(this.totalCount * this.itemHeight, this.visibleCount * this.itemHeight)}px`
    this.render()
  }

  destroy(): void {
    this.container.removeEventListener('scroll', this.handleScroll)
  }
}

// Resource hints
export function addResourceHints(): void {
  // Preconnect to external domains
  const domains = [
    'https://cdn.shopify.com',
    'https://cdnjs.cloudflare.com',
    'https://fonts.googleapis.com'
  ]

  domains.forEach(domain => {
    const link = document.createElement('link')
    link.rel = 'preconnect'
    link.href = domain
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
  })

  // Prefetch critical routes
  const criticalRoutes = ['/order', '/account']
  criticalRoutes.forEach(route => {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = route
    document.head.appendChild(link)
  })
}

// Critical CSS extraction
export function inlineCriticalCSS(): void {
  // In a real implementation, you would extract critical CSS
  // and inline it in the HTML head
  const criticalCSS = `
    /* Critical above-the-fold styles */
    body { background: var(--color-bg); color: var(--color-fg); }
    .hero { min-height: 100vh; display: flex; align-items: center; }
    .btn-primary { background: var(--color-accent); color: black; }
  `
  
  const style = document.createElement('style')
  style.textContent = criticalCSS
  document.head.appendChild(style)
}

// Service Worker registration
export function registerServiceWorker(): void {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration)
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError)
      })
  }
}

// Performance budget monitoring
export class PerformanceBudget {
  private budgets: Record<string, number> = {
    js: 250000, // 250KB
    css: 50000, // 50KB
    images: 1000000, // 1MB
    fonts: 100000, // 100KB
    total: 2000000 // 2MB
  }

  checkBudget(resourceType: string, size: number): boolean {
    const budget = this.budgets[resourceType] || this.budgets.total
    return size <= budget
  }

  reportBudgetViolation(resourceType: string, size: number): void {
    const budget = this.budgets[resourceType] || this.budgets.total
    console.warn(
      `Performance budget exceeded for ${resourceType}: ` +
      `${(size / 1024).toFixed(2)}KB > ${(budget / 1024).toFixed(2)}KB`
    )
  }
}

// Memory leak prevention
export class MemoryManager {
  private cleanupFunctions: (() => void)[] = []

  addCleanup(cleanup: () => void): void {
    this.cleanupFunctions.push(cleanup)
  }

  cleanup(): void {
    this.cleanupFunctions.forEach(cleanup => {
      try {
        cleanup()
      } catch (error) {
        console.warn('Cleanup function failed:', error)
      }
    })
    this.cleanupFunctions = []
  }
}

// Initialize performance optimizations
export function initializePerformanceOptimizations(): void {
  // Add resource hints
  addResourceHints()
  
  // Inline critical CSS
  inlineCriticalCSS()
  
  // Register service worker
  registerServiceWorker()
  
  // Start performance monitoring
  const monitor = new PerformanceMonitor()
  
  // Initialize image optimizer
  const imageOptimizer = ImageOptimizer.getInstance()
  
  return {
    monitor,
    imageOptimizer,
    memoryManager: new MemoryManager()
  }
}

// Export instances
export const performanceMonitor = new PerformanceMonitor()
export const imageOptimizer = ImageOptimizer.getInstance()
export const performanceBudget = new PerformanceBudget()
export const memoryManager = new MemoryManager()
