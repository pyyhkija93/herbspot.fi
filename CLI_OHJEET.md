# Shopify CLI - Tokenien luonti

## ⚠️ HUOM: Aja nämä komennot PAIKALLISESSA terminaalissasi (ei Cursorissa)!

### 1️⃣ Avaa Mac Terminal (⌘+Space → "Terminal")

### 2️⃣ Siirry projektikansioon:
```bash
cd /Applications/herbspot.fi
```

### 3️⃣ Kirjaudu Shopifyyn:
```bash
shopify auth login
```
→ Avaa selain, kirjaudu, valitse kauppa

### 4️⃣ Linkitä projekti kauppaan:
```bash
shopify hydrogen link
```
→ Valitse: `herbspot.myshopify.com`
→ CLI luo automaattisesti tokenid `.env`:iin!

### 5️⃣ Tarkista .env:
```bash
cat .env
```

Pitäisi näyttää:
```
PUBLIC_STORE_DOMAIN="herbspot.myshopify.com"
PUBLIC_STOREFRONT_API_TOKEN="shpat_xxxxx..."
SESSION_SECRET="xxxxx"
```

### 6️⃣ Käynnistä dev-serveri uudelleen:
```bash
npm run dev
```

### 7️⃣ Avaa http://localhost:3000

✅ OMAT Shopify-tuotteet näkyvät!

---

## 🎯 VAIHTOEHTO: Manuaalinen token-haku

Jos CLI ei toimi, hae Shopifysta:

1. https://admin.shopify.com/store/4uwt9i-ja/settings/apps/development
2. Custom App → API credentials
3. Storefront API → Configure scopes
4. Kopioi token → Lähetä Cursoriin
