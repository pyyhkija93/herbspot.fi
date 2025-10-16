# HerbSpot.fi - Supabase Production Setup Guide

## 🚀 **Production-Ready Edge Functions with HMAC Validation**

Tämä guide sisältää kaiken mitä tarvitset tuotantotason Supabase Edge Functions -systeemin käyttöönottoon.

---

## 📋 **Sisältö**

1. **Production Edge Functions** - HMAC validation + idempotency
2. **Database Schema** - Tuotantotason taulut ja indeksit
3. **HMAC Testing** - Testaus työkalut
4. **Shopify Integration** - Webhook setup
5. **Deployment** - Tuotantoon vieminen

---

## 🔧 **1. Edge Functions**

### **points-add** (Production Ready)
- ✅ **HMAC validation** - Shopify webhook security
- ✅ **Idempotency** - UNIQUE constraints prevent duplicates
- ✅ **Error handling** - Comprehensive error management
- ✅ **Multi-source support** - Shopify orders + QR codes
- ✅ **Auto user creation** - By email fallback

### **hmac-test** (Testing Tool)
- ✅ **HMAC generation** - For testing webhooks
- ✅ **Curl examples** - Ready-to-use commands

---

## 🗄️ **2. Database Schema**

### **Core Tables**
```sql
-- Users (existing)
users (id, email, name, created_at, updated_at)

-- Detailed transactions
loyalty_transactions (
  id, user_id, order_id, points, source, 
  amount, qr_code, items, created_at
)

-- Summary table
loyalty_points (
  id, user_id, points, tier, streak,
  total_orders, total_spent, last_order_date
)

-- Webhook monitoring
webhook_logs (
  id, webhook_type, shopify_order_id,
  processed_at, success, points_added, error_message
)
```

### **Key Features**
- **Idempotency**: `UNIQUE(order_id, source)` constraint
- **Performance**: Optimized indexes for fast queries
- **Auto-summary**: Triggers update loyalty_points automatically
- **Monitoring**: Webhook logs for debugging

---

## 🔐 **3. HMAC Validation**

### **Security Features**
- **Timing-safe comparison** - Prevents timing attacks
- **SHA-256 HMAC** - Industry standard
- **Shopify compatible** - Works with Shopify webhooks
- **Configurable secret** - Environment variable

### **Testing HMAC**
```bash
# Generate HMAC for testing
curl -X POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/hmac-test' \
  -H 'Content-Type: application/json' \
  -d '{
    "body": "{\"id\":123,\"email\":\"test@herbspot.fi\",\"total_price\":\"50.00\"}",
    "secret": "your_shopify_webhook_secret"
  }'
```

---

## 🛠️ **4. Environment Variables**

### **Required Variables**
```bash
# Supabase
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Shopify
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret

# Configuration
POINTS_PER_EURO=1
```

### **Set in Supabase Dashboard**
1. Go to **Settings** → **Edge Functions**
2. Add environment variables
3. Deploy functions

---

## 🚀 **5. Deployment Commands**

### **Deploy All Functions**
```bash
# Install Supabase CLI
npm install -g supabase

# Login and link project
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# Deploy functions
supabase functions deploy points-add
supabase functions deploy webhook-shopify
supabase functions deploy hmac-test

# Run migrations
supabase db push
```

### **Verify Deployment**
```bash
# Check function status
supabase functions list

# View logs
supabase functions logs points-add --follow
```

---

## 🧪 **6. Testing**

### **Run Production Tests**
```bash
# Full test suite
deno run --allow-net supabase/functions/test-production.ts

# Performance test only
deno run --allow-net supabase/functions/test-production.ts --performance

# Full test with performance
deno run --allow-net supabase/functions/test-production.ts --full
```

### **Test Cases Included**
1. ✅ Basic Shopify order processing
2. ✅ QR code bonus handling
3. ✅ High-value orders
4. ✅ Duplicate order idempotency
5. ✅ Missing email validation
6. ✅ Invalid amount handling
7. ✅ Unsupported currency rejection
8. ✅ User ID vs email handling
9. ✅ Small orders
10. ✅ Manual points addition

---

## 🛒 **7. Shopify Webhook Setup**

### **Admin Configuration**
1. **Shopify Admin** → **Settings** → **Notifications**
2. **Webhooks** → **Create webhook**
3. **Settings**:
   - **Event**: `Order payment`
   - **Format**: `JSON`
   - **URL**: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/points-add`
   - **Secret**: Same as `SHOPIFY_WEBHOOK_SECRET`

### **Test Webhook**
```bash
# Send test notification from Shopify Admin
# Or use curl with proper HMAC:

curl -X POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/points-add' \
  -H 'Content-Type: application/json' \
  -H 'X-Shopify-Hmac-Sha256: GENERATED_HMAC' \
  -d '{
    "id": 12345,
    "email": "customer@herbspot.fi",
    "total_price": "29.99",
    "currency": "EUR",
    "customer": {"email": "customer@herbspot.fi"}
  }'
```

---

## 📊 **8. Monitoring & Debugging**

### **View Logs**
```bash
# Real-time logs
supabase functions logs points-add --follow

# Specific time range
supabase functions logs points-add --since 1h
```

### **Database Queries**
```sql
-- Check recent transactions
SELECT * FROM loyalty_transactions 
ORDER BY created_at DESC LIMIT 10;

-- User loyalty status
SELECT u.email, lp.points, lp.tier, lp.total_orders
FROM users u
JOIN loyalty_points lp ON u.id = lp.user_id
ORDER BY lp.points DESC;

-- Webhook success rate
SELECT 
  success,
  COUNT(*) as count,
  AVG(points_added) as avg_points
FROM webhook_logs
WHERE processed_at >= NOW() - INTERVAL '24 hours'
GROUP BY success;
```

### **Error Handling**
- **Invalid HMAC**: 401 Unauthorized
- **Missing fields**: 400 Bad Request
- **User not found**: 404 Not Found
- **Database errors**: 500 Internal Server Error
- **Duplicate orders**: Handled gracefully (idempotency)

---

## 🔄 **9. Points Calculation**

### **Base Rules**
- **1 point per €1** spent (configurable)
- **Tier multipliers**:
  - Bronze (0-499): 1.0x
  - Silver (500-1499): 1.25x
  - Gold (1500-3999): 1.5x
  - VIP (4000+): 2.0x
- **QR bonuses**: 1.5x multiplier

### **Examples**
- €29.99 order, Bronze tier: **29 points**
- €29.99 order, Silver tier + QR: **44 points** (29 × 1.25 × 1.5)
- €149.99 order, Gold tier: **224 points** (149 × 1.5)

---

## 🚨 **10. Production Checklist**

### **Before Going Live**
- [ ] All environment variables set
- [ ] Functions deployed successfully
- [ ] Database migrations applied
- [ ] HMAC validation working
- [ ] Test cases passing
- [ ] Shopify webhooks configured
- [ ] Monitoring setup
- [ ] Error handling verified

### **Post-Deployment**
- [ ] Monitor webhook logs
- [ ] Check database performance
- [ ] Verify points calculation
- [ ] Test with real orders
- [ ] Set up alerts for failures

---

## 🆘 **Troubleshooting**

### **Common Issues**

**HMAC Validation Fails**
```bash
# Check secret matches Shopify webhook secret
# Verify HMAC generation
curl -X POST '.../hmac-test' -d '{"body":"test","secret":"your_secret"}'
```

**Duplicate Orders**
```sql
-- Check unique constraint
SELECT order_id, source, COUNT(*) 
FROM loyalty_transactions 
GROUP BY order_id, source 
HAVING COUNT(*) > 1;
```

**Performance Issues**
```sql
-- Check indexes
EXPLAIN ANALYZE SELECT * FROM loyalty_transactions WHERE user_id = '...';

-- Monitor query performance
SELECT * FROM pg_stat_user_tables WHERE relname = 'loyalty_transactions';
```

---

## 📞 **Support**

### **Resources**
- **Supabase Docs**: https://supabase.com/docs
- **Shopify Webhooks**: https://shopify.dev/docs/admin-api/webhooks
- **HMAC Security**: https://en.wikipedia.org/wiki/HMAC

### **Debug Commands**
```bash
# Function status
supabase functions list

# Database status
supabase db status

# Project info
supabase projects list
```

---

## 🎉 **Success!**

Kun kaikki on konfiguroitu, sinulla on:

✅ **Tuotantovalmis** loyalty points system  
✅ **HMAC-validoidut** Shopify webhooks  
✅ **Idempotentti** pisteiden lisäys  
✅ **Automaattinen** tier management  
✅ **Kattava** monitoring ja logging  
✅ **Skalautuva** arkkitehtuuri  

**HerbSpot.fi on valmis tuotantoon!** 🚀
