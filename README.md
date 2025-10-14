# HerbSpot.fi - Shopify Hydrogen Verkkokauppa

Shopify Hydrogen -pohjainen verkkokauppa aromatiikka- ja kosmetiikkatuotteille.

## 🛠️ Teknologia

- **Shopify Hydrogen** - Shopifyn virallinen headless commerce framework
- **Remix** - Full-stack React framework
- **TypeScript** - Tyypitetty JavaScript
- **Tailwind CSS** - Utility-first CSS
- **GraphQL** - Shopify Storefront API
- **Vite** - Build tool

## 🚀 Aloitus

### 1. Asenna riippuvuudet (jo tehty)

```bash
npm install
```

### 2. Konfiguroi Shopify-yhteys

Päivitä `.env` -tiedosto:

```env
PUBLIC_STORE_DOMAIN="herbspot.myshopify.com"
PUBLIC_STOREFRONT_API_TOKEN="your-storefront-api-token"
PUBLIC_STOREFRONT_API_VERSION="2024-10"
PUBLIC_MOCK_SHOP=false  # true = käytä demo-dataa, false = oikea Shopify
```

### 3. Käynnistä kehitysserveri

```bash
npm run dev
```

Avaa [http://localhost:3000](http://localhost:3000)

## 📦 Tuotekategoriat

### 🔵 Cartit & Akut
- 510-kierteelliset akut
- Herbal diffuser cartridget  
- USB-lataajat ja lisävarusteet

### 🟢 Aroma & Kosmetiikka
- Aroma cartridget
- Cosmetic oil -tuotteet
- Aromaöljyt

### 🟣 Lab & R&D
- Laboratoriotuotteet
- Tutkimuskäyttöön
- Terpeenianalyysit

### 🟠 Outlet
- Erikoistarjoukset
- Alennustuotteet
- Rajoitetut erät

## 🔒 Turvalliset termit

Kaikissa tuotteissa käytetään turvallisia termejä:
- ✅ **Aroma cartridge**
- ✅ **Herbal diffuser cart**
- ✅ **Cosmetic oil**
- ✅ **Lab use / R&D use**

**HUOM:** Kaikissa aroma- ja kosmetiikkatuotteissa merkintä: **"Ei sisäiseen käyttöön"**

## 📁 Projektin rakenne

```
herbspot.fi/
├── app/
│   ├── routes/           # Remix-reitit
│   ├── components/       # React-komponentit
│   ├── lib/              # Apufunktiot
│   ├── graphql/          # GraphQL-kyselyt
│   └── styles/           # CSS-tyylit
├── .env                  # Ympäristömuuttujat (ei Gitiin!)
└── server.ts             # Remix-serveri
```

## 🌐 Deployment

### Vercel (ei suositeltu Hydrogenille)
Hydrogen on optimoitu **Oxygen**-platformille (Shopifyn oma hosting).

### Oxygen (Suositeltu)

```bash
npm run build
shopify hydrogen deploy
```

### Netlify / Custom Server

```bash
npm run build
# Deploy dist/ -kansio
```

## 📝 Lisätietoa

- [Hydrogen Docs](https://shopify.dev/custom-storefronts/hydrogen)
- [Remix Docs](https://remix.run/docs)
- [Shopify Storefront API](https://shopify.dev/api/storefront)

## 📜 Lisenssi

© 2024 HerbSpot.fi - Kaikki oikeudet pidätetään
