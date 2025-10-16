'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { formatCurrency, getTierFromPoints } from '@/lib/utils'

interface LoyaltyCardProps {
  points?: number
  tier?: 'Bronze' | 'Silver' | 'Gold' | 'VIP'
  className?: string
}

export default function LoyaltyCard({ 
  points = 750, 
  tier = 'Silver',
  className 
}: LoyaltyCardProps) {
  // Calculate tier info based on points
  const tierInfo = getTierFromPoints(points)
  const currentTier = tier || tierInfo.tier
  
  // Tier configurations
  const tierConfig = {
    Bronze: {
      color: '#CD7F32',
      icon: '🥉',
      benefits: ['2 pistettä per €1', 'Ilmainen toimitus yli 50€']
    },
    Silver: {
      color: '#C0C0C0',
      icon: '🥈',
      benefits: ['2.5 pistettä per €1', 'Ilmainen toimitus yli 40€', 'Erikoistarjoukset']
    },
    Gold: {
      color: '#FFD700',
      icon: '🥇',
      benefits: ['3 pistettä per €1', 'Ilmainen toimitus yli 30€', 'Varhainen pääsy tuotteisiin']
    },
    VIP: {
      color: '#66e3a7',
      icon: '💎',
      benefits: ['4 pistettä per €1', 'Ilmainen toimitus', 'Henkilökohtainen asiakaspalvelu']
    }
  }

  const config = tierConfig[currentTier]

  return (
    <motion.div
      className={`card-base p-6 bg-gradient-to-br from-[var(--color-bg-secondary)] to-[var(--color-bg-tertiary)] border-2 border-[${config.color}]20 ${className || ''}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        borderColor: `${config.color}40`,
        boxShadow: `0 0 30px ${config.color}20`
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{ backgroundColor: `${config.color}20` }}
          >
            {config.icon}
          </div>
          <div>
            <h3 className="font-bold text-[var(--color-fg)] text-lg">
              {currentTier} Jäsen
            </h3>
            <p className="text-[var(--color-fg-secondary)] text-sm">
              Loyalty Program
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div 
            className="text-2xl font-bold"
            style={{ color: config.color }}
          >
            {points.toLocaleString()}
          </div>
          <div className="text-[var(--color-fg-secondary)] text-sm">
            pistettä
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-[var(--color-fg-secondary)]">Edistyminen</span>
          <span 
            className="font-medium"
            style={{ color: config.color }}
          >
            {tierInfo.progress.toFixed(0)}%
          </span>
        </div>
        
        <div className="w-full bg-[var(--color-bg-tertiary)] rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: config.color }}
            initial={{ width: 0 }}
            animate={{ width: `${tierInfo.progress}%` }}
            transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
          />
        </div>
        
        {tierInfo.pointsToNext > 0 && (
          <p className="text-xs text-[var(--color-fg-muted)] mt-2">
            {tierInfo.pointsToNext} pistettä seuraavaan tasoon
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div 
            className="text-lg font-bold"
            style={{ color: config.color }}
          >
            5
          </div>
          <div className="text-xs text-[var(--color-fg-secondary)]">
            Tilaukset
          </div>
        </div>
        
        <div className="text-center">
          <div 
            className="text-lg font-bold"
            style={{ color: config.color }}
          >
            3
          </div>
          <div className="text-xs text-[var(--color-fg-secondary)]">
            Streak
          </div>
        </div>
        
        <div className="text-center">
          <div 
            className="text-lg font-bold"
            style={{ color: config.color }}
          >
            {formatCurrency(375)}
          </div>
          <div className="text-xs text-[var(--color-fg-secondary)]">
            Kulutettu
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="space-y-2">
        <h4 className="font-semibold text-[var(--color-fg)] text-sm mb-3">
          {currentTier} edut:
        </h4>
        {config.benefits.map((benefit, index) => (
          <motion.div
            key={index}
            className="flex items-center space-x-2 text-sm text-[var(--color-fg-secondary)]"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + index * 0.1 }}
          >
            <div 
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: config.color }}
            />
            <span>{benefit}</span>
          </motion.div>
        ))}
      </div>

      {/* QR Code Placeholder */}
      <div className="mt-6 p-4 bg-[var(--color-bg-tertiary)] rounded-lg text-center">
        <div className="w-16 h-16 bg-white rounded-lg mx-auto mb-2 flex items-center justify-center">
          <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
        </div>
        <p className="text-xs text-[var(--color-fg-muted)]">
          Skannaa saadaksesi bonus-pisteitä
        </p>
      </div>
    </motion.div>
  )
}