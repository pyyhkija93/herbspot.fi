# Environment Variables Template

Kopioi tämä sisältö `.env` -tiedostoon projektin juuressa ja täytä oikeat arvot.

```env
# HerbSpot.fi - Environment Variables
# Kopioi tämä .env -tiedostoon ja täytä oikeat arvot

# ============================================
# SESSION & SECURITY
# ============================================
SESSION_SECRET="change-this-to-random-secret"

# ============================================
# SHOPIFY STOREFRONT API (PUBLIC - safe for browser)
# ============================================
PUBLIC_STORE_DOMAIN="herbspot.myshopify.com"
PUBLIC_STOREFRONT_API_TOKEN="your-storefront-token-here"
PUBLIC_STOREFRONT_API_VERSION="2024-10"

# ============================================
# SHOPIFY ADMIN API (PRIVATE - server only!)
# ============================================
# HUOM: Älä koskaan lähetä näitä selaimeen!
SHOPIFY_ADMIN_API_KEY="your-admin-api-key"
SHOPIFY_ADMIN_API_SECRET="your-admin-api-secret"
SHOPIFY_ADMIN_ACCESS_TOKEN="shpat_your-admin-access-token"

# ============================================
# WEBHOOKS
# ============================================
SHOPIFY_WEBHOOK_SECRET="your-webhook-secret"

# ============================================
# PAYMENT PROVIDERS (optional)
# ============================================
# STRIPE_PUBLIC_KEY="pk_test_..."
# STRIPE_SECRET_KEY="sk_test_..."

# ============================================
# TAX CALCULATION (optional)
# ============================================
# STRIPE_TAX_API_KEY="..."

# ============================================
# SHIPPING (optional)
# ============================================
# SHIPPO_API_KEY="..."

# ============================================
# ACCOUNTING (optional)
# ============================================
# NETVISOR_API_KEY="..."
# NETVISOR_CUSTOMER_ID="..."

# ============================================
# SEARCH (optional)
# ============================================
# ALGOLIA_APP_ID="..."
# ALGOLIA_API_KEY="..."
# MEILISEARCH_HOST="..."
# MEILISEARCH_API_KEY="..."

# ============================================
# ANALYTICS (optional)
# ============================================
# GOOGLE_ANALYTICS_ID="G-..."
# PLAUSIBLE_DOMAIN="..."

# ============================================
# EMAIL (optional)
# ============================================
# SENDGRID_API_KEY="..."
# RESEND_API_KEY="..."

# ============================================
# DEVELOPMENT
# ============================================
# NODE_ENV="development"
# PORT="3001"
```

## 🔒 Turvallisuus

**HUOM:** Älä koskaan commitoi `.env` -tiedostoa Gitiin!

Varmista että `.gitignore` sisältää:
```
.env
.env.local
.env.production
```

