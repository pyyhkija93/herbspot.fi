# Points Add Edge Function

This Supabase Edge Function automatically adds loyalty points to users based on Shopify orders and QR code scans.

## 🚀 Features

- **Automatic Points Calculation** - Configurable points per euro spent
- **Tier-based Multipliers** - Bronze, Silver, Gold, VIP tiers with different multipliers
- **QR Code Bonuses** - Extra points for QR code scans
- **User Auto-creation** - Creates users if they don't exist
- **Comprehensive Logging** - Tracks all transactions and QR scans
- **Error Handling** - Robust error handling with detailed logging

## 📋 Configuration

Edit the configuration variables at the top of `index.ts`:

```typescript
const POINTS_PER_EURO = 2; // Base points per €1 spent
const BONUS_MULTIPLIER = 1.5; // QR scan bonus multiplier
const MIN_ORDER_AMOUNT = 5; // Minimum order for points
```

## 🔧 Setup

### 1. Deploy the Function

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the function
supabase functions deploy points-add
```

### 2. Set Environment Variables

In your Supabase project dashboard, go to Settings > Edge Functions and add:

- `SUPABASE_URL` - Your project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (not anon key!)

## 📡 API Usage

### Basic Order Points

```bash
curl -X POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/points-add' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "order_id": "ORD-123",
    "user_id": "user-uuid",
    "amount": 29.99,
    "source": "shopify"
  }'
```

### QR Code Bonus Points

```bash
curl -X POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/points-add' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "order_id": "ORD-123",
    "user_id": "user-uuid",
    "amount": 29.99,
    "qr_code": "herbspot://qr/ABC123",
    "source": "qr"
  }'
```

### Auto-create User by Email

```bash
curl -X POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/points-add' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "order_id": "ORD-123",
    "email": "customer@example.com",
    "amount": 29.99,
    "source": "shopify"
  }'
```

## 📊 Response Format

### Success Response

```json
{
  "success": true,
  "user_id": "user-uuid",
  "points_added": 60,
  "total_points": 810,
  "tier": "Silver",
  "tier_progress": {
    "current": 810,
    "next_tier": 1500,
    "points_to_next": 690
  },
  "order_id": "ORD-123",
  "timestamp": "2024-10-14T12:00:00Z"
}
```

### Error Response

```json
{
  "error": "Missing required fields: order_id, user_id/email, amount"
}
```

## 🎯 Points Calculation

### Base Points
- **Bronze**: 2 points per €1
- **Silver**: 2.5 points per €1 (1.25x multiplier)
- **Gold**: 3 points per €1 (1.5x multiplier)
- **VIP**: 4 points per €1 (2x multiplier)

### QR Code Bonuses
- QR scans get 1.5x bonus multiplier
- Example: Silver tier + QR = 2.5 × 1.5 = 3.75 points per €1

### Examples
- €29.99 order, Bronze tier, regular: 59 points
- €29.99 order, Silver tier, QR scan: 112 points
- €89.99 order, Gold tier, regular: 269 points

## 🔗 Integration Examples

### Shopify Webhook Integration

```javascript
// In your Shopify webhook handler
app.post('/webhooks/orders/paid', async (req, res) => {
  const order = req.body;
  
  // Call Supabase Edge Function
  const response = await fetch(
    'https://YOUR_PROJECT_REF.supabase.co/functions/v1/points-add',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        order_id: order.id,
        email: order.customer.email,
        amount: parseFloat(order.total_price),
        shopify_order_id: order.id,
        items: order.line_items,
        source: 'shopify'
      })
    }
  );
  
  const result = await response.json();
  console.log('Points added:', result);
});
```

### Next.js Frontend Integration

```typescript
// In your Next.js app
export async function addPointsFromOrder(orderData: any) {
  const response = await fetch('/api/loyalty/add-points', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order_id: orderData.id,
      user_id: orderData.userId,
      amount: orderData.total,
      source: 'manual'
    })
  });
  
  return response.json();
}

// API route: /api/loyalty/add-points
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const response = await fetch(
    `${process.env.SUPABASE_URL}/functions/v1/points-add`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    }
  );
  
  const data = await response.json();
  res.status(response.status).json(data);
}
```

## 🧪 Testing

### Test with curl

```bash
# Test basic functionality
curl -X POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/points-add' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "order_id": "TEST-001",
    "email": "test@herbspot.fi",
    "amount": 25.00,
    "source": "manual"
  }'

# Test QR bonus
curl -X POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/points-add' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "order_id": "TEST-002",
    "email": "test@herbspot.fi",
    "amount": 25.00,
    "qr_code": "herbspot://qr/TEST123",
    "source": "qr"
  }'
```

## 🔍 Monitoring

### View Logs

```bash
# View function logs
supabase functions logs points-add

# View real-time logs
supabase functions logs points-add --follow
```

### Database Queries

```sql
-- Check user loyalty status
SELECT 
  u.email,
  lp.points,
  lp.tier,
  lp.streak,
  lp.total_orders
FROM users u
JOIN loyalty_points lp ON u.id = lp.user_id
WHERE u.email = 'demo@herbspot.fi';

-- View recent transactions
SELECT 
  lt.*,
  u.email
FROM loyalty_transactions lt
JOIN users u ON lt.user_id = u.id
ORDER BY lt.created_at DESC
LIMIT 10;

-- QR scan statistics
SELECT 
  COUNT(*) as total_scans,
  SUM(points_earned) as total_qr_points
FROM qr_scans
WHERE scanned_at >= NOW() - INTERVAL '30 days';
```

## 🚨 Error Handling

The function handles various error scenarios:

- **Missing required fields** - Returns 400 with specific error message
- **User not found** - Creates new user if email provided
- **Database errors** - Returns 500 with error details
- **Invalid data** - Validates input and returns appropriate errors

## 🔐 Security

- **CORS enabled** - Allows web requests from any origin
- **Input validation** - Validates all required fields
- **SQL injection protection** - Uses parameterized queries
- **Rate limiting** - Consider adding rate limiting for production
- **Authentication** - Uses Supabase service role key for database access

## 📈 Performance

- **Optimized queries** - Uses indexes for fast lookups
- **Batch operations** - Efficient database operations
- **Error logging** - Comprehensive logging for debugging
- **Response caching** - Consider adding Redis for high-traffic scenarios

## 🔄 Future Enhancements

- **Rate limiting** - Prevent abuse
- **Batch processing** - Handle multiple orders at once
- **Webhook retries** - Automatic retry for failed webhooks
- **Analytics** - Detailed analytics and reporting
- **Notifications** - Email/SMS notifications for tier upgrades

