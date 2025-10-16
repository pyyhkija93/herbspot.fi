-- Production-ready database schema for HerbSpot.fi loyalty system
-- Includes proper indexes, constraints, and idempotency

-- Add unique constraint to users email if not exists
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS users_email_key UNIQUE (email);

-- Create loyalty_transactions table for detailed tracking
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

-- Idempotency: One row per (order_id, source) combination
CREATE UNIQUE INDEX IF NOT EXISTS loyalty_transactions_order_source_uidx
ON loyalty_transactions (order_id, source);

-- Performance indexes
CREATE INDEX IF NOT EXISTS loyalty_transactions_user_id_idx
ON loyalty_transactions (user_id);

CREATE INDEX IF NOT EXISTS loyalty_transactions_created_at_idx
ON loyalty_transactions (created_at);

CREATE INDEX IF NOT EXISTS loyalty_transactions_source_idx
ON loyalty_transactions (source);

-- Webhook logs table for monitoring
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_type TEXT NOT NULL,
  shopify_order_id TEXT,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  success BOOLEAN NOT NULL,
  points_added INTEGER DEFAULT 0,
  error_message TEXT,
  request_data JSONB
);

CREATE INDEX IF NOT EXISTS webhook_logs_processed_at_idx
ON webhook_logs (processed_at);

CREATE INDEX IF NOT EXISTS webhook_logs_shopify_order_id_idx
ON webhook_logs (shopify_order_id);

-- RLS policies for webhook_logs
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access webhook_logs" ON webhook_logs
  FOR ALL USING (auth.role() = 'service_role');

-- Update loyalty_points to be a summary table
-- This table now stores aggregated data, not individual transactions
ALTER TABLE loyalty_points DROP COLUMN IF EXISTS order_id;
ALTER TABLE loyalty_points DROP COLUMN IF EXISTS source;
ALTER TABLE loyalty_points DROP COLUMN IF EXISTS created_at;

-- Add fields for better tracking
ALTER TABLE loyalty_points ADD COLUMN IF NOT EXISTS last_order_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE loyalty_points ADD COLUMN IF NOT EXISTS total_spent DECIMAL(10,2) DEFAULT 0.00;

-- Function to update loyalty summary when transactions are added
CREATE OR REPLACE FUNCTION update_loyalty_summary()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert loyalty_points summary
  INSERT INTO loyalty_points (user_id, points, tier, total_orders, last_order_date, total_spent, updated_at)
  SELECT 
    NEW.user_id,
    SUM(points) as total_points,
    CASE 
      WHEN SUM(points) >= 4000 THEN 'VIP'
      WHEN SUM(points) >= 1500 THEN 'Gold'
      WHEN SUM(points) >= 500 THEN 'Silver'
      ELSE 'Bronze'
    END as tier,
    COUNT(*) as order_count,
    MAX(created_at) as last_order,
    SUM(amount) as total_spent,
    NOW()
  FROM loyalty_transactions 
  WHERE user_id = NEW.user_id
  ON CONFLICT (user_id) DO UPDATE SET
    points = EXCLUDED.points,
    tier = EXCLUDED.tier,
    total_orders = EXCLUDED.total_orders,
    last_order_date = EXCLUDED.last_order_date,
    total_spent = EXCLUDED.total_spent,
    updated_at = EXCLUDED.updated_at;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update summary when transactions are added
DROP TRIGGER IF EXISTS trigger_update_loyalty_summary ON loyalty_transactions;
CREATE TRIGGER trigger_update_loyalty_summary
  AFTER INSERT ON loyalty_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_loyalty_summary();

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

-- Function to get tier multiplier
CREATE OR REPLACE FUNCTION get_tier_multiplier(tier TEXT)
RETURNS DECIMAL AS $$
BEGIN
  CASE
    WHEN tier = 'VIP' THEN RETURN 2.0;
    WHEN tier = 'Gold' THEN RETURN 1.5;
    WHEN tier = 'Silver' THEN RETURN 1.25;
    ELSE RETURN 1.0; -- Bronze
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Clean up old loyalty_points data and migrate to new structure
-- This will be run only if there's existing data to migrate
DO $$
BEGIN
  -- Check if old loyalty_points table has transaction data
  IF EXISTS (
    SELECT 1 FROM loyalty_points 
    WHERE order_id IS NOT NULL 
    LIMIT 1
  ) THEN
    -- Migrate existing transaction data
    INSERT INTO loyalty_transactions (user_id, order_id, points, source, amount, created_at)
    SELECT 
      user_id,
      order_id,
      points,
      COALESCE(source, 'manual'),
      COALESCE(points / 2.0, 0), -- Estimate amount from points
      COALESCE(created_at, NOW())
    FROM loyalty_points 
    WHERE order_id IS NOT NULL
    ON CONFLICT (order_id, source) DO NOTHING;
    
    RAISE NOTICE 'Migrated existing loyalty_points transaction data to loyalty_transactions';
  END IF;
END $$;

-- Update sample data for testing
UPDATE loyalty_points SET 
  points = 750,
  tier = 'Silver',
  total_orders = 5,
  last_order_date = NOW() - INTERVAL '2 days',
  total_spent = 375.00
WHERE user_id = (SELECT id FROM users WHERE email = 'demo@herbspot.fi' LIMIT 1);

-- Add some sample transactions
INSERT INTO loyalty_transactions (user_id, order_id, points, source, amount, created_at)
SELECT 
  u.id,
  'SAMPLE-001',
  60,
  'shopify',
  30.00,
  NOW() - INTERVAL '5 days'
FROM users u 
WHERE u.email = 'demo@herbspot.fi'
ON CONFLICT (order_id, source) DO NOTHING;

INSERT INTO loyalty_transactions (user_id, order_id, points, source, amount, created_at)
SELECT 
  u.id,
  'SAMPLE-002',
  90,
  'qr',
  30.00,
  NOW() - INTERVAL '3 days'
FROM users u 
WHERE u.email = 'demo@herbspot.fi'
ON CONFLICT (order_id, source) DO NOTHING;
