'use client'

import React from 'react'
import { OrderFlow } from '@/components/flows/OrderFlow'
import { QueryProvider } from '@/components/providers/QueryProvider'

export default function OrderPage() {
  return (
    <QueryProvider>
      <div className="min-h-screen bg-[var(--color-bg)]">
        {/* Header */}
        <header className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => window.history.back()}
                  className="p-2 hover:bg-[var(--color-bg-tertiary)] rounded-lg transition-colors"
                  aria-label="Takaisin"
                >
                  <svg className="w-5 h-5 text-[var(--color-fg)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-xl font-bold text-[var(--color-fg)]">
                    HerbSpot.fi
                  </h1>
                  <p className="text-sm text-[var(--color-fg-secondary)]">
                    Premium 510 Cartridges & Aromatherapy
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => window.location.href = '/account'}
                  className="p-2 hover:bg-[var(--color-bg-tertiary)] rounded-lg transition-colors"
                  aria-label="Tili"
                >
                  <svg className="w-5 h-5 text-[var(--color-fg)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          <OrderFlow
            onComplete={(orderId) => {
              console.log('Order completed:', orderId)
              // You could redirect to a success page or show a toast
            }}
          />
        </main>

        {/* Footer */}
        <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] mt-16">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold text-[var(--color-fg)] mb-3">
                  HerbSpot.fi
                </h3>
                <p className="text-sm text-[var(--color-fg-secondary)]">
                  Premium 510 Cartridges & Aromatherapy Devices. 
                  Laadukkaat tuotteet suoraan kotiosoitteeseesi.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-[var(--color-fg)] mb-3">
                  Tuki
                </h3>
                <div className="space-y-2 text-sm text-[var(--color-fg-secondary)]">
                  <a href="/help" className="block hover:text-[var(--color-accent)] transition-colors">
                    Usein kysytyt kysymykset
                  </a>
                  <a href="/contact" className="block hover:text-[var(--color-accent)] transition-colors">
                    Ota yhteyttä
                  </a>
                  <a href="/shipping" className="block hover:text-[var(--color-accent)] transition-colors">
                    Toimitus
                  </a>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-[var(--color-fg)] mb-3">
                  Yritys
                </h3>
                <div className="space-y-2 text-sm text-[var(--color-fg-secondary)]">
                  <a href="/about" className="block hover:text-[var(--color-accent)] transition-colors">
                    Tietoa meistä
                  </a>
                  <a href="/terms" className="block hover:text-[var(--color-accent)] transition-colors">
                    Käyttöehdot
                  </a>
                  <a href="/privacy" className="block hover:text-[var(--color-accent)] transition-colors">
                    Tietosuoja
                  </a>
                </div>
              </div>
            </div>
            
            <div className="border-t border-[var(--color-border)] mt-8 pt-8 text-center">
              <p className="text-sm text-[var(--color-fg-muted)]">
                © 2024 HerbSpot.fi. Kaikki oikeudet pidätetään.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </QueryProvider>
  )
}
