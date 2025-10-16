-- HerbSpot.fi Database Schema
-- Loyalty System & User Management

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loyalty points summary table (one row per user)
CREATE TABLE IF NOT EXISTS loyalty_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  points INTEGER DEFAULT 0 NOT NULL,
  tier TEXT DEFAULT 'Bronze' NOT NULL CHECK (tier IN ('Bronze', 'Silver', 'Gold', 'VIP')),
  streak INTEGER DEFAULT 0 NOT NULL,
  total_orders INTEGER DEFAULT 0 NOT NULL,
  total_spent DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
  last_order_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Detailed loyalty transactions table (one row per transaction)
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  order_id TEXT NOT NULL,
  shopify_order_id TEXT,
  points INTEGER NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('shopify', 'qr', 'manual', 'bonus')),
  amount DECIMAL(10,2) NOT NULL,
  qr_code TEXT,
  items JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- QR code scans tracking
CREATE TABLE IF NOT EXISTS qr_scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  qr_data TEXT NOT NULL,
  points_earned INTEGER DEFAULT 0 NOT NULL,
  order_id TEXT,
  scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table (optional - for detailed order tracking)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  shopify_order_id TEXT UNIQUE,
  order_number TEXT,
  email TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  status TEXT DEFAULT 'pending',
  items JSONB,
  shipping_address JSONB,
  billing_address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_loyalty_points_user_id ON loyalty_points(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_user_id ON loyalty_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_order_id ON loyalty_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_created_at ON loyalty_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_qr_scans_user_id ON qr_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_qr_scans_qr_data ON qr_scans(qr_data);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_shopify_order_id ON orders(shopify_order_id);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Loyalty points policies
CREATE POLICY "Users can view own loyalty points" ON loyalty_points
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own loyalty transactions" ON loyalty_transactions
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own QR scans" ON qr_scans
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Service role can do everything (for edge functions)
CREATE POLICY "Service role full access users" ON users
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access loyalty_points" ON loyalty_points
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access loyalty_transactions" ON loyalty_transactions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access qr_scans" ON qr_scans
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access orders" ON orders
  FOR ALL USING (auth.role() = 'service_role');

-- Functions for common operations
CREATE OR REPLACE FUNCTION increment_points(uid UUID, add_points INTEGER)
RETURNS INTEGER AS $$
DECLARE
  new_total INTEGER;
BEGIN
  -- Update loyalty_points table
  UPDATE loyalty_points 
  SET 
    points = points + add_points,
    updated_at = NOW()
  WHERE user_id = uid
  RETURNING points INTO new_total;
  
  -- If no row exists, create one
  IF new_total IS NULL THEN
    INSERT INTO loyalty_points (user_id, points)
    VALUES (uid, add_points)
    RETURNING points INTO new_total;
  END IF;
  
  RETURN new_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user tier based on points
CREATE OR REPLACE FUNCTION get_user_tier(points INTEGER)
RETURNS TEXT AS $$
BEGIN
  CASE
    WHEN points >= 4000 THEN RETURN 'VIP';
    WHEN points >= 1500 THEN RETURN 'Gold';
    WHEN points >= 500 THEN RETURN 'Silver';
    ELSE RETURN 'Bronze';
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update user tier based on current points
CREATE OR REPLACE FUNCTION update_user_tier()
RETURNS TRIGGER AS $$
BEGIN
  NEW.tier = get_user_tier(NEW.points);
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update tier when points change
CREATE TRIGGER trigger_update_tier
  BEFORE UPDATE ON loyalty_points
  FOR EACH ROW
  EXECUTE FUNCTION update_user_tier();

-- Function to calculate points to next tier
CREATE OR REPLACE FUNCTION points_to_next_tier(points INTEGER)
RETURNS INTEGER AS $$
BEGIN
  CASE
    WHEN points < 500 THEN RETURN 500 - points;
    WHEN points < 1500 THEN RETURN 1500 - points;
    WHEN points < 4000 THEN RETURN 4000 - points;
    ELSE RETURN 0; -- VIP tier, no next tier
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Sample data for testing (optional)
INSERT INTO users (email, name) VALUES 
  ('demo@herbspot.fi', 'Demo User'),
  ('test@herbspot.fi', 'Test User')
ON CONFLICT (email) DO NOTHING;

INSERT INTO loyalty_points (user_id, points, tier, streak, total_orders)
SELECT 
  u.id,
  750,
  'Silver',
  3,
  5
FROM users u 
WHERE u.email = 'demo@herbspot.fi'
ON CONFLICT (user_id) DO NOTHING;

