# Shopify Tokens & Credentials - HerbSpot.fi

## 🔑 Kerätyt tunnukset:

### Admin API Credentials:
```
Client ID (API Key): c5ccc5995ec950d2a10ecf391f0b579d
Secret (API Secret): 6d4cb56e2aca3b68a4a80590c020371e
Refresh Token: 2629b16b439c003b9944d728cbd0f1f3-1760426951
  (Expires: October 14 at 11:29 AM)
```

### ❌ Puuttuu vielä:
- **Admin API Access Token** (shpat_xxx...) 
  - EI sama kuin Secret!
  - Löytyy: Custom App → API credentials → "Admin API access token"
  - Pitää ehkä klikata "Install app" tai "Reveal token"

- **Storefront API Access Token**
  - Tarvitaan: Configure Storefront API scopes ensin
  - Scopet: 
    - unauthenticated_read_product_listings
    - unauthenticated_read_product_inventory
    - unauthenticated_read_product_pickup_locations
    - unauthenticated_read_customers

---

## 🌐 Nykyinen tila:

```env
# .env sisältö (TOIMII mock.shop -datalla):
SESSION_SECRET="foobar"
PUBLIC_STORE_DOMAIN="mock.shop"
```

**Sivusto:** http://localhost:3001
**Status:** Mock Shop demo-data käytössä

---

## 📍 Custom App -linkki:
https://admin.shopify.com/store/4uwt9i-ja/settings/apps/development

## 📋 Mitä tehdä kun saat tokenid:

1. Päivitä .env:
```env
PUBLIC_STORE_DOMAIN="herbspot.myshopify.com"
PUBLIC_STOREFRONT_API_TOKEN="[uusi-storefront-token]"
PUBLIC_STOREFRONT_API_VERSION="2024-10"
```

2. Omat tuotteet näkyvät!
