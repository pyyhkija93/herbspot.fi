'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { calculatePoints, getTierFromPoints } from './utils'

// Zod schemas for type safety
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string()
})

export const LoyaltyPointsSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  points: z.number().min(0),
  tier: z.enum(['Bronze', 'Silver', 'Gold', 'VIP']),
  streak: z.number().min(0),
  total_orders: z.number().min(0),
  total_spent: z.number().min(0),
  last_order_date: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string()
})

export const LoyaltyTransactionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  order_id: z.string(),
  shopify_order_id: z.string().optional(),
  points: z.number(),
  source: z.enum(['shopify', 'qr', 'manual', 'bonus']),
  amount: z.number().min(0),
  qr_code: z.string().optional(),
  items: z.any().optional(),
  created_at: z.string()
})

export const OrderSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid().optional(),
  shopify_order_id: z.string().optional(),
  order_number: z.string().optional(),
  email: z.string().email(),
  total_amount: z.number().min(0),
  currency: z.string().default('EUR'),
  status: z.enum(['pending', 'paid', 'fulfilled', 'cancelled']),
  items: z.any().optional(),
  shipping_address: z.any().optional(),
  billing_address: z.any().optional(),
  created_at: z.string(),
  updated_at: z.string()
})

export const ProductSchema = z.object({
  id: z.string(),
  title: z.string(),
  handle: z.string(),
  featuredImage: z.object({
    url: z.string().url()
  }).optional(),
  priceRange: z.object({
    minVariantPrice: z.object({
      amount: z.string()
    })
  }),
  inventory: z.object({
    availableForSale: z.boolean(),
    quantity: z.number().optional()
  }).optional()
})

// Type exports
export type User = z.infer<typeof UserSchema>
export type LoyaltyPoints = z.infer<typeof LoyaltyPointsSchema>
export type LoyaltyTransaction = z.infer<typeof LoyaltyTransactionSchema>
export type Order = z.infer<typeof OrderSchema>
export type Product = z.infer<typeof ProductSchema>

// API endpoints
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api'

// Query keys factory
export const queryKeys = {
  user: (id: string) => ['user', id] as const,
  userByEmail: (email: string) => ['user', 'email', email] as const,
  loyaltyPoints: (userId: string) => ['loyalty', 'points', userId] as const,
  loyaltyTransactions: (userId: string, limit?: number) => ['loyalty', 'transactions', userId, limit] as const,
  orders: (userId?: string, limit?: number) => ['orders', userId, limit] as const,
  products: (limit?: number) => ['products', limit] as const,
  userProfile: (userId: string) => ['profile', userId] as const
}

// API functions
const api = {
  async getUser(id: string): Promise<User> {
    const response = await fetch(`${API_BASE}/users/${id}`)
    if (!response.ok) throw new Error('Failed to fetch user')
    const data = await response.json()
    return UserSchema.parse(data)
  },

  async getUserByEmail(email: string): Promise<User> {
    const response = await fetch(`${API_BASE}/users/by-email?email=${encodeURIComponent(email)}`)
    if (!response.ok) throw new Error('Failed to fetch user by email')
    const data = await response.json()
    return UserSchema.parse(data)
  },

  async getLoyaltyPoints(userId: string): Promise<LoyaltyPoints> {
    const response = await fetch(`${API_BASE}/loyalty/points/${userId}`)
    if (!response.ok) throw new Error('Failed to fetch loyalty points')
    const data = await response.json()
    return LoyaltyPointsSchema.parse(data)
  },

  async getLoyaltyTransactions(userId: string, limit = 10): Promise<LoyaltyTransaction[]> {
    const response = await fetch(`${API_BASE}/loyalty/transactions/${userId}?limit=${limit}`)
    if (!response.ok) throw new Error('Failed to fetch loyalty transactions')
    const data = await response.json()
    return z.array(LoyaltyTransactionSchema).parse(data)
  },

  async getOrders(userId?: string, limit = 10): Promise<Order[]> {
    const url = userId 
      ? `${API_BASE}/orders?userId=${userId}&limit=${limit}`
      : `${API_BASE}/orders?limit=${limit}`
    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch orders')
    const data = await response.json()
    return z.array(OrderSchema).parse(data)
  },

  async getProducts(limit = 20): Promise<Product[]> {
    const response = await fetch(`${API_BASE}/products?limit=${limit}`)
    if (!response.ok) throw new Error('Failed to fetch products')
    const data = await response.json()
    return z.array(ProductSchema).parse(data)
  },

  async addPoints(input: {
    orderId: string
    userId?: string
    email?: string
    amount: number
    qrCode?: string
    source?: 'shopify' | 'qr' | 'manual' | 'bonus'
  }): Promise<{ points_added: number; total_points: number; tier: string }> {
    const response = await fetch(`${API_BASE}/loyalty/add-points`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    })
    if (!response.ok) throw new Error('Failed to add points')
    return response.json()
  },

  async createOrder(input: {
    userId?: string
    email: string
    items: Array<{ productId: string; quantity: number; price: number }>
    totalAmount: number
    shippingAddress?: any
  }): Promise<Order> {
    const response = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    })
    if (!response.ok) throw new Error('Failed to create order')
    const data = await response.json()
    return OrderSchema.parse(data)
  },

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
    const response = await fetch(`${API_BASE}/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    if (!response.ok) throw new Error('Failed to update user profile')
    const data = await response.json()
    return UserSchema.parse(data)
  }
}

// React Query hooks
export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.user(id),
    queryFn: () => api.getUser(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3
  })
}

export function useUserByEmail(email: string) {
  return useQuery({
    queryKey: queryKeys.userByEmail(email),
    queryFn: () => api.getUserByEmail(email),
    enabled: !!email,
    staleTime: 5 * 60 * 1000,
    retry: 3
  })
}

export function useLoyaltyPoints(userId: string) {
  return useQuery({
    queryKey: queryKeys.loyaltyPoints(userId),
    queryFn: () => api.getLoyaltyPoints(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 3
  })
}

export function useLoyaltyTransactions(userId: string, limit = 10) {
  return useQuery({
    queryKey: queryKeys.loyaltyTransactions(userId, limit),
    queryFn: () => api.getLoyaltyTransactions(userId, limit),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
    retry: 3
  })
}

export function useOrders(userId?: string, limit = 10) {
  return useQuery({
    queryKey: queryKeys.orders(userId, limit),
    queryFn: () => api.getOrders(userId, limit),
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 3
  })
}

export function useProducts(limit = 20) {
  return useQuery({
    queryKey: queryKeys.products(limit),
    queryFn: () => api.getProducts(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 3
  })
}

// Optimistic mutations
export function useAddPoints() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.addPoints,
    
    // Optimistic update
    onMutate: async (variables) => {
      const { userId, email } = variables
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.loyaltyPoints(userId || '') 
      })

      if (email) {
        await queryClient.cancelQueries({ 
          queryKey: queryKeys.userByEmail(email) 
        })
      }

      // Snapshot previous value
      const previousPoints = queryClient.getQueryData<LoyaltyPoints>(
        queryKeys.loyaltyPoints(userId || '')
      )

      // Optimistically update
      if (previousPoints) {
        const estimatedPoints = calculatePoints(
          variables.amount,
          previousPoints.tier,
          !!variables.qrCode
        )
        
        const optimisticPoints = {
          ...previousPoints,
          points: previousPoints.points + estimatedPoints,
          total_orders: previousPoints.total_orders + 1,
          total_spent: previousPoints.total_spent + variables.amount,
          last_order_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        // Update tier based on new points
        const { tier } = getTierFromPoints(optimisticPoints.points)
        optimisticPoints.tier = tier

        queryClient.setQueryData(
          queryKeys.loyaltyPoints(userId || ''),
          optimisticPoints
        )
      }

      return { previousPoints }
    },

    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousPoints) {
        queryClient.setQueryData(
          queryKeys.loyaltyPoints(variables.userId || ''),
          context.previousPoints
        )
      }
    },

    // Always refetch after error or success
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.loyaltyPoints(variables.userId || '') 
      })
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.loyaltyTransactions(variables.userId || '') 
      })
    }
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.createOrder,
    
    onSuccess: (newOrder, variables) => {
      // Invalidate orders query
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.orders(variables.userId) 
      })
      
      // Add to orders cache
      queryClient.setQueryData(
        queryKeys.orders(variables.userId),
        (old: Order[] | undefined) => [newOrder, ...(old || [])]
      )
    }
  })
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, updates }: { userId: string; updates: Partial<User> }) =>
      api.updateUserProfile(userId, updates),
    
    onSuccess: (updatedUser) => {
      // Update user cache
      queryClient.setQueryData(
        queryKeys.user(updatedUser.id),
        updatedUser
      )
      
      queryClient.setQueryData(
        queryKeys.userByEmail(updatedUser.email),
        updatedUser
      )
    }
  })
}

// Utility hooks
export function useUserProfile(userId: string) {
  const userQuery = useUser(userId)
  const loyaltyQuery = useLoyaltyPoints(userId)
  const transactionsQuery = useLoyaltyTransactions(userId, 5)

  return {
    user: userQuery.data,
    loyalty: loyaltyQuery.data,
    transactions: transactionsQuery.data,
    isLoading: userQuery.isLoading || loyaltyQuery.isLoading || transactionsQuery.isLoading,
    isError: userQuery.isError || loyaltyQuery.isError || transactionsQuery.isError,
    error: userQuery.error || loyaltyQuery.error || transactionsQuery.error
  }
}
