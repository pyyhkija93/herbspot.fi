# 🔑 Storefront API Token - Tarkat ohjeet

## 📍 AVAA TÄMÄ LINKKI:
https://admin.shopify.com/store/4uwt9i-ja/settings/apps/development

---

## 📋 ASKEL ASKELEELTA:

### 1️⃣ Luo Custom App (jos ei ole)
- Klikkaa **"Create an app"**
- App name: `HerbSpot Website`
- Klikkaa **"Create app"**

### 2️⃣ Mene API credentials -välilehdelle
- Custom App aukeaa
- Näet välilehdet: Overview | Configuration | API credentials
- Klikkaa **"API credentials"**

### 3️⃣ Admin API -osio
Näet:
```
Admin API
┌──────────────────────────────────────────┐
│ ✅ API key (Client ID):                  │
│    c5ccc5995ec950d2a10ecf391f0b579d      │
│                                          │
│ ✅ API secret key:                       │
│    6d4cb56e2aca3b68a4a80590c020371e      │
│                                          │
│ ⚠️  Admin API access token:              │
│    [Install app] tai [Reveal token]      │ ← KLIKKAA JOS NÄKYY!
└──────────────────────────────────────────┘
```

Jos näkyy **"Install app"** -nappi → KLIKKAA sitä!
Jos näkyy **"Reveal token"** -nappi → KLIKKAA sitä!

Saat **Admin API access token** (alkaa `shpat_...`)

### 4️⃣ Scrollaa ALAS → Storefront API -osio
```
Storefront API
┌──────────────────────────────────────────┐
│ [Configure Storefront API scopes]        │ ← KLIKKAA!
└──────────────────────────────────────────┘
```

Klikkaa **"Configure Storefront API scopes"**

### 5️⃣ Valitse scopet:
Ruksaa nämä:
- ☑️ `unauthenticated_read_product_listings`
- ☑️ `unauthenticated_read_products`
- ☑️ `unauthenticated_read_product_inventory`
- ☑️ `unauthenticated_read_collections`

Klikkaa **"Save"**

### 6️⃣ Storefront API access token ilmestyy:
```
Storefront API
┌──────────────────────────────────────────┐
│ Storefront API access token:             │
│ shpat_xxxxxxxxxxxxxxxxxxxxxxxx           │ ← KOPIOI TÄMÄ!
│                                          │
│ [Regenerate token] [Revoke token]        │
└──────────────────────────────────────────┘
```

### 7️⃣ Kopioi token ja lähetä tähän chat-ikkunaan!

---

## ✅ KUN SAAT TOKENIN:

Lähetä token tähän, niin:
1. Päivitän .env-tiedoston
2. Serveri käynnistyy uudelleen
3. OMAT Shopify-tuotteet näkyvät!

---

## 💡 HUOM:
- Storefront API token ≠ Admin API Secret
- Storefront token alkaa usein `shpat_...`
- Se on PITKÄ merkkijono (50+ merkkiä)

