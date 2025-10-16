# API-avainten pyyntö ja turvallisuusohje

## 📧 Lähetä asiakkaalle/tiimille

"Tarvitsen kehityspääsyn integraatioihin. Luo ja jaa minulle seuraavat avaimet ja salaisuudet turvallisesti (esim. suojattu salasananhallinta tai projektin ympäristömuuttujat).

### 1. Ympäristöt
* Sandbox/dev‑ympäristö pääsy
* Tuotantoavain vain jos pakollinen, muuten myöhemmin

### 2. Avaimet ja salaisuudet
* Julkinen lukuavain (Storefront/Public) selaimelle
* Yksityinen kirjoitusavain (Admin/Secret) vain palvelimelle
* Webhook‑allekirjoitusavain
* Integraatioiden tokenit: maksut (Stripe/Adyen), verot (Stripe Tax), lähetykset (Shippo tms.), kirjanpito (Netvisor), haku (Algolia/Meilisearch)

### 3. Oikeudet ja rajaukset
* Least privilege: anna vain seuraavat scopet:
    * Luku: tuotteet, kokoelmat, varasto, hinnat
    * Kirjoitus: ostoskorit/checkout, tilaukset (vain jos välttämätöntä)
* Aseta erillinen dev‑avain, erillinen prod‑avain

### 4. Turva ja käytännöt
* Toimitustapa: ympäristömuuttujat (.env) tai salasananhallinta, ei sähköpostia tai chat‑selkotekstinä
* Avainkierto (rotation) 90–180 pv välein
* IP‑rajaukset ja rate limit mahdollisuuksien mukaan

### 5. Tarvittavat metatiedot
* API‑päätepisteet ja versiokäytäntö
* CORS‑asetukset (origin = dev‑domaini)
* Testitilit, esimerkkituotteet ja testimaksuohje

Vastaathan avaimet ja tiedot muodossa:
```
PUBLIC_API_KEY=
ADMIN_API_SECRET=
WEBHOOK_SECRET=
PAYMENT_PROVIDER_KEY=
…
```
"

---

## 🛍️ Shopify-spesifi avainpyyntö ja hankintaohje

Jos teet itse avaimet, käytä tätä muistilistana. Jos pyydät asiakkaalta, lähetä heille tämä.

### 1. Storefront API (julkinen luku, tuotteet/kori)

* **Polku:** Shopify Admin → Settings → Apps and channels → Develop apps → Storefront API tokens
* **Toimenpiteet:**
  1. Luo Storefront access token
  2. Rajoita Storefront permissions minimiin:
     * `unauthenticated_read_product_listings`
     * `unauthenticated_read_product_inventory`
     * `unauthenticated_read_product_pickup_locations`
     * `unauthenticated_read_customers`
  3. Tallenna: `SHOPIFY_STOREFRONT_TOKEN`, `SHOPIFY_DOMAIN`

### 2. Admin API (kirjoittavat operaatiot vain serverille/n8n:ään)

* **Polku:** Shopify Admin → Settings → Apps and channels → Develop apps → Create app
* **Admin API access scopes:** Valitse vain tarvittavat
  * `read_products`
  * `read_inventory`
  * `write_checkouts` tai `read_orders` / `write_orders` tarpeen mukaan
  * `read_discounts` / `write_discounts` jos kampanjat
* **Asenna app kauppaan**, kopioi:
  * `SHOPIFY_ADMIN_API_KEY`
  * `SHOPIFY_ADMIN_API_SECRET`
  * `SHOPIFY_ADMIN_ACCESS_TOKEN` (jos private custom app)
* **Turvallisuus:** Aseta IP‑rajaukset, jos käytössä

### 3. Webhook‑allekirjoitus

* Lisää Webhook‑salaisuus: `SHOPIFY_WEBHOOK_SECRET`
* Tilaa vähintään:
  * Orders create/paid
  * Products update
  * Inventory update
* Osoita dev‑webhook endpointtiin tai n8n‑webhookiin

### 4. Ympäristömuuttujat

* `.env.local` (dev) ja palvelun projektiasetukset (prod)
* **TÄRKEÄÄ:** Älä koskaan vuoda Admin‑avainta selaimeen
* Esimerkki:
  ```env
  SHOPIFY_DOMAIN=yourshop.myshopify.com
  SHOPIFY_STOREFRONT_TOKEN=…
  SHOPIFY_ADMIN_API_KEY=…
  SHOPIFY_ADMIN_API_SECRET=…
  SHOPIFY_ADMIN_ACCESS_TOKEN=…
  SHOPIFY_WEBHOOK_SECRET=…
  ```

### 5. CORS ja originit

* Lisää dev‑domainit sallittuihin (esim. `https://localhost:3000`, `dev.vercel.app`)
* **TÄRKEÄÄ:** Käytä proxy‑endpointteja serverillä, ei suoria Admin‑kutsuja selaimesta

### 6. Testaus

* Ota testimaksut käyttöön maksupalvelussa
* Luo 2–3 testituotetta ja alennuskoodi
* Toimita minulle:
  * Checkout‑politiikat
  * Verosäännöt
  * Toimitusvaihtoehdot

---

## 🔒 Turvallisuusperiaatteet

### Least Privilege (Pienin mahdollinen oikeus)
Anna vain ne scopet/oikeudet jotka ovat välttämättömiä toiminnallisuuden kannalta.

### Separation of Concerns (Erotettu vastuu)
* **Selain:** Vain julkiset Storefront API -avaimet
* **Palvelin:** Admin API -avaimet, salaisuudet, maksutokenit

### Key Rotation (Avainkierto)
* Vaihda avaimet 90–180 päivän välein
* Dokumentoi avaimen vaihtoprosessi

### Secure Storage (Turvallinen tallennus)
* Käytä ympäristömuuttujia (`.env`)
* Älä koskaan commitoi avaimia Gitiin
* Käytä salasananhallintaa (1Password, Bitwarden, jne.)
* Tuotannossa: Palvelun secrets-manageri (Vercel, Railway, jne.)

---

## ✅ Checklist ennen tuotantoon menoa

- [ ] Kaikki avaimet ympäristömuuttujaissa, ei hardcoded
- [ ] `.env` -tiedosto on `.gitignore`:ssa
- [ ] Admin API -avaimia ei koskaan selaimessa
- [ ] CORS-asetukset määritelty oikein
- [ ] Rate limit -suojaukset paikallaan
- [ ] Webhook-allekirjoitusten validointi käytössä
- [ ] Virheenkäsittely sensitiivisille tiedoille (ei vuoda avaimia logeihin)
- [ ] Avainkierto-prosessi dokumentoitu
- [ ] Erillinen tuotanto- ja kehitysympäristö

