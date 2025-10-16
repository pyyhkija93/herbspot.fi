# HerbSpot.fi - Setup Status

**Päivitetty:** 14. Lokakuuta 2025

---

## ✅ Mitä on tehty

### 1. 📄 Dokumentaatio luotu

- ✅ **API_KEYS_REQUEST.md** - Ammattimaiset ohjeet API-avainten pyytämiseen asiakkaalta
- ✅ **ENV_TEMPLATE.md** - Ympäristömuuttujien template
- ✅ **PROXY_ROUTES_GUIDE.md** - Admin API proxy-reitit ja turvallisuusohjeet
- ✅ **GET_STOREFRONT_TOKEN.md** - Päivitetty Storefront API scope-ohjeilla
- ✅ **SHOPIFY_TOKENS.md** - Päivitetty Storefront scopeilla

### 2. 🔑 API-avaimet konfiguroitu

#### Shopify Storefront API (julkinen)
```env
PUBLIC_STORE_DOMAIN="herbspot.myshopify.com"
PUBLIC_STOREFRONT_API_TOKEN="***hidden***"
PUBLIC_STOREFRONT_API_VERSION="2025-01"
```

**Status:** ⚠️ Token ei toimi vielä - tarvitsee scopet tai kauppa ei ole aktiivinen

#### Shopify Admin API (palvelin)
```env
SHOPIFY_ADMIN_ACCESS_TOKEN="shpat_***hidden***"
```

**Status:** ✅ Token saatu, ei vielä testattu

#### Stripe Payment API
```env
PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_***hidden***"
STRIPE_SECRET_KEY="sk_test_***hidden***"
```

**Status:** ✅ Konfiguroitu, ei vielä testattu

### 3. 🛠️ Koodi päivitetty

- ✅ `app/root.tsx` - Lisätty turvatarkistukset SEO-datalle
- ✅ `.env` - Luotu ja konfiguroitu

---

## ❌ Mitä ei toimi vielä

### Storefront API - 404 virhe

**Ongelma:**
```bash
curl -X POST "https://herbspot.myshopify.com/api/2025-01/graphql.json" \
  -H "X-Shopify-Storefront-Access-Token: de2439b8974704d64b1deb73bc6c81cf" \
  -d '{"query":"{ shop { name } }"}'

# Vastaus:
{"errors":[{"message":"Not Found","extensions":{"code":"NOT_FOUND"}}]}
```

**Mahdolliset syyt:**
1. Storefront API scopet puuttuvat tai eivät tallentuneet
2. Custom app ei ole asennettu (installed) kauppaan
3. Kauppa ei ole aktiivinen (trial/paused)
4. Väärä shop domain
5. API-versio ei ole saatavilla tälle kaualle

---

## 🔧 Seuraavat toimenpiteet

### 1️⃣ Tarkista Shopify Adminissa

**Avaa:** https://admin.shopify.com/store/4uwt9i-ja/settings/apps/development

#### A. Varmista shop domain
- Settings → Store details
- Mikä on "myshopify.com domain"?

#### B. Tarkista custom app status
- Custom app → Overview
- Onko app **"Installed"**?
- Jos ei, klikkaa **"Install app"**

#### C. Tarkista Storefront API scopet
- Custom app → Configuration
- Storefront API access scopes:
  - ☑️ `unauthenticated_read_product_listings`
  - ☑️ `unauthenticated_read_product_inventory`
  - ☑️ `unauthenticated_read_product_pickup_locations`
  - ☑️ `unauthenticated_read_customers`
- Save jos muutoksia

#### D. Tarkista API credentials
- Custom app → API credentials
- Kopioi uusi **Storefront API access token** jos muuttunut

### 2️⃣ Väliaikainen ratkaisu

Jos Storefront API ei toimi, voit kehittää sivustoa **mock.shop** -datalla:

```env
# Vaihda .env -tiedostossa:
PUBLIC_STORE_DOMAIN="mock.shop"
# Kommentoi pois: PUBLIC_STOREFRONT_API_TOKEN ja PUBLIC_STOREFRONT_API_VERSION
```

Sitten:
```bash
npm run dev
```

Sivu toimii demo-datalla!

---

## 📋 Tiedostot

### Luodut dokumentit:
- `/Applications/herbspot.fi/API_KEYS_REQUEST.md`
- `/Applications/herbspot.fi/ENV_TEMPLATE.md`
- `/Applications/herbspot.fi/PROXY_ROUTES_GUIDE.md`
- `/Applications/herbspot.fi/SETUP_STATUS.md` (tämä tiedosto)

### Päivitetyt dokumentit:
- `/Applications/herbspot.fi/GET_STOREFRONT_TOKEN.md`
- `/Applications/herbspot.fi/SHOPIFY_TOKENS.md`

### Konfiguraatiot:
- `/Applications/herbspot.fi/.env` (ei gitissä, sisältää salaisuudet)

---

## 🚀 Quick Start

### Dev-serveri käyntiin:
```bash
cd /Applications/herbspot.fi
npm run dev
```

### Avaa selaimessa:
- **App:** http://localhost:3000/
- **GraphiQL:** http://localhost:3000/graphiql
- **Network profiler:** http://localhost:3000/subrequest-profiler

---

## 📞 Tuki

Jos Storefront API ei toimi:
1. Tarkista yllä olevat kohdat 1️⃣ A-D
2. Ota kuvakaappaukset administa
3. Tarkista onko kauppa aktiivinen (ei trial)
4. Käytä väliaikaisesti mock.shop -dataa

## 🔒 Turvallisuus

**MUISTA:**
- ❌ ÄLÄ koskaan committaa `.env` -tiedostoa Gitiin
- ❌ ÄLÄ lähetä Admin API tokeneita selaimeen
- ✅ Käytä Stripe test-avaimia kehityksessä
- ✅ Vaihda production-avaimet kun julkaiset

---

**Status:** ⚠️ Odottaa Shopify custom appin aktivointia/scopeja


