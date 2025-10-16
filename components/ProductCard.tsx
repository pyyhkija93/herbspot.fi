'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'

interface Product {
  id: string
  title: string
  handle: string
  featuredImage?: {
    url: string
    altText?: string
  }
  priceRange: {
    minVariantPrice: {
      amount: string
      currencyCode: string
    }
  }
  variants?: {
    edges: Array<{
      node: {
        id: string
        price: {
          amount: string
          currencyCode: string
        }
        availableForSale: boolean
      }
    }>
  }
}

interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product) => void
  className?: string
}

export default function ProductCard({ product, onAddToCart, className }: ProductCardProps) {
  const price = parseFloat(product.priceRange.minVariantPrice.amount)
  const isAvailable = product.variants?.edges?.[0]?.node?.availableForSale ?? true

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product)
    } else {
      // Default action - navigate to order page
      window.location.href = '/order'
    }
  }

  return (
    <motion.div
      className={`card-base p-4 group hover:scale-105 transition-all duration-300 ${className || ''}`}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Product Image */}
      <div className="relative aspect-square mb-4 overflow-hidden rounded-lg">
        {product.featuredImage ? (
          <img
            src={product.featuredImage.url}
            alt={product.featuredImage.altText || product.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-[var(--color-bg-tertiary)] flex items-center justify-center">
            <svg 
              className="w-16 h-16 text-[var(--color-fg-muted)]" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
          </div>
        )}
        
        {/* Availability Badge */}
        {!isAvailable && (
          <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-medium">
            Loppuunmyyty
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-3">
        <h3 className="font-semibold text-[var(--color-fg)] text-lg line-clamp-2 group-hover:text-[var(--color-accent)] transition-colors">
          {product.title}
        </h3>
        
        <div className="flex items-center justify-between">
          <span className="text-[var(--color-accent)] font-bold text-xl">
            {formatCurrency(price)}
          </span>
          
          {product.variants?.edges?.[0]?.node?.availableForSale && (
            <span className="text-[var(--color-success)] text-sm font-medium">
              ✓ Varastossa
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={!isAvailable}
          variant={isAvailable ? "primary" : "ghost"}
          size="sm"
          fullWidth
          className="mt-4"
        >
          {isAvailable ? 'Lisää ostoskoriin' : 'Ei saatavilla'}
        </Button>
      </div>
    </motion.div>
  )
}