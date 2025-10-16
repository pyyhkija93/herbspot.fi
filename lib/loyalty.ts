import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface LoyaltyPoints {
  id?: string;
  user_id: string;
  points: number;
  tier: string;
  streak: number;
  total_orders: number;
  created_at?: string;
  updated_at?: string;
}

export const TIERS = {
  BRONZE: { name: 'Bronze', minPoints: 0, maxPoints: 499, color: '#CD7F32' },
  SILVER: { name: 'Silver', minPoints: 500, maxPoints: 1499, color: '#C0C0C0' },
  GOLD: { name: 'Gold', minPoints: 1500, maxPoints: 3999, color: '#FFD700' },
  VIP: { name: 'VIP', minPoints: 4000, maxPoints: Infinity, color: '#39FF14' }
};

export function getTierFromPoints(points: number): string {
  if (points >= TIERS.VIP.minPoints) return TIERS.VIP.name;
  if (points >= TIERS.GOLD.minPoints) return TIERS.GOLD.name;
  if (points >= TIERS.SILVER.minPoints) return TIERS.SILVER.name;
  return TIERS.BRONZE.name;
}

export function getTierColor(tier: string): string {
  switch (tier) {
    case 'VIP': return TIERS.VIP.color;
    case 'Gold': return TIERS.GOLD.color;
    case 'Silver': return TIERS.SILVER.color;
    default: return TIERS.BRONZE.color;
  }
}

export function getPointsToNextTier(points: number): number {
  const currentTier = getTierFromPoints(points);
  switch (currentTier) {
    case 'Bronze': return TIERS.SILVER.minPoints - points;
    case 'Silver': return TIERS.GOLD.minPoints - points;
    case 'Gold': return TIERS.VIP.minPoints - points;
    default: return 0; // VIP - max tier
  }
}

export async function getUserPoints(userId: string): Promise<LoyaltyPoints | null> {
  try {
    const { data, error } = await supabase
      .from('loyalty_points')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching user points:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserPoints:', error);
    return null;
  }
}

export async function addPoints(userId: string, points: number, reason: string = 'order'): Promise<boolean> {
  try {
    // Get current points
    const currentData = await getUserPoints(userId);
    const currentPoints = currentData?.points || 0;
    const currentStreak = currentData?.streak || 0;
    const currentOrders = currentData?.total_orders || 0;

    const newPoints = currentPoints + points;
    const newTier = getTierFromPoints(newPoints);

    const pointsData: LoyaltyPoints = {
      user_id: userId,
      points: newPoints,
      tier: newTier,
      streak: currentStreak + 1,
      total_orders: currentOrders + 1
    };

    const { error } = await supabase
      .from('loyalty_points')
      .upsert(pointsData, { onConflict: 'user_id' });

    if (error) {
      console.error('Error adding points:', error);
      return false;
    }

    // Log the transaction
    await supabase
      .from('loyalty_transactions')
      .insert({
        user_id: userId,
        points_added: points,
        reason: reason,
        total_points: newPoints
      });

    return true;
  } catch (error) {
    console.error('Error in addPoints:', error);
    return false;
  }
}

export async function createLoyaltyUser(userId: string): Promise<boolean> {
  try {
    const initialData: LoyaltyPoints = {
      user_id: userId,
      points: 0,
      tier: 'Bronze',
      streak: 0,
      total_orders: 0
    };

    const { error } = await supabase
      .from('loyalty_points')
      .insert(initialData);

    if (error) {
      console.error('Error creating loyalty user:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in createLoyaltyUser:', error);
    return false;
  }
}

// Mock functions for development (when Supabase is not configured)
export const mockLoyalty = {
  getUserPoints: async (userId: string) => ({
    user_id: userId,
    points: 750,
    tier: 'Silver',
    streak: 3,
    total_orders: 5
  }),
  
  addPoints: async (userId: string, points: number) => {
    console.log(`Mock: Added ${points} points to user ${userId}`);
    return true;
  }
};

