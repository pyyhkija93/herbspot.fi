# Admin API Proxy Routes - Turvallisuusohje

## 🚨 Miksi tarvitaan proxy-reitit?

**TÄRKEÄÄ:** Admin API -avaimia EI SAA koskaan lähettää selaimeen!

- ❌ **VÄÄRIN:** Suora kutsu Admin API:iin selaimesta
- ✅ **OIKEIN:** Proxy-reitti palvelimella, joka käyttää Admin API:a

---

## 📋 Arkkitehtuuri

```
┌─────────┐          ┌─────────────┐          ┌─────────────┐
│ Selain  │  HTTPS   │  Palvelin   │  HTTPS   │   Shopify   │
│         │ ──────>  │   (Remix)   │ ──────>  │  Admin API  │
│ (Public)│          │  (Private)  │          │             │
└─────────┘          └─────────────┘          └─────────────┘
                           ↑
                    Admin API avaimet
                    (EI koskaan selaimessa)
```

---

## 🔧 Esimerkki: Admin API Proxy (Remix)

### 1. Luo proxy-reitti: `app/routes/($locale).api.admin.tsx`

```typescript
import { json, type LoaderFunctionArgs } from '@shopify/remix-oxygen';

/**
 * Admin API Proxy
 * HUOM: Tämä reitti käsittelee Admin API -kutsut turvallisesti palvelimella
 */
export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const action = url.searchParams.get('action');
  
  // Tarkista että käyttäjällä on oikeudet (session, auth, jne.)
  // const session = await getSession(request.headers.get('Cookie'));
  // if (!session) return json({ error: 'Unauthorized' }, { status: 401 });
  
  const {
    SHOPIFY_ADMIN_ACCESS_TOKEN,
    PUBLIC_STORE_DOMAIN,
    PUBLIC_STOREFRONT_API_VERSION,
  } = context.env;

  try {
    switch (action) {
      case 'create_discount':
        return handleCreateDiscount(
          SHOPIFY_ADMIN_ACCESS_TOKEN,
          PUBLIC_STORE_DOMAIN,
          PUBLIC_STOREFRONT_API_VERSION,
          request
        );
      
      case 'update_inventory':
        return handleUpdateInventory(
          SHOPIFY_ADMIN_ACCESS_TOKEN,
          PUBLIC_STORE_DOMAIN,
          PUBLIC_STOREFRONT_API_VERSION,
          request
        );
      
      default:
        return json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Admin API error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleCreateDiscount(
  adminToken: string,
  domain: string,
  version: string,
  request: Request
) {
  const body = await request.json();
  
  const response = await fetch(
    `https://${domain}/admin/api/${version}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': adminToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          mutation discountCodeCreate($discount: DiscountCodeAppInput!) {
            discountCodeAppCreate(discountCodeApp: $discount) {
              codeDiscountNode {
                id
                codeDiscount {
                  ... on DiscountCodeApp {
                    title
                    codes(first: 1) {
                      nodes {
                        code
                      }
                    }
                  }
                }
              }
              userErrors {
                field
                message
              }
            }
          }
        `,
        variables: {
          discount: body.discount,
        },
      }),
    }
  );

  const data = await response.json();
  return json(data);
}

async function handleUpdateInventory(
  adminToken: string,
  domain: string,
  version: string,
  request: Request
) {
  const body = await request.json();
  
  const response = await fetch(
    `https://${domain}/admin/api/${version}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': adminToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          mutation inventoryAdjustQuantity($input: InventoryAdjustQuantityInput!) {
            inventoryAdjustQuantity(input: $input) {
              inventoryLevel {
                id
                available
              }
              userErrors {
                field
                message
              }
            }
          }
        `,
        variables: {
          input: body.input,
        },
      }),
    }
  );

  const data = await response.json();
  return json(data);
}
```

### 2. Käytä selaimesta

```typescript
// app/components/AdminActions.tsx

async function createDiscount(discountData: any) {
  const response = await fetch('/api/admin?action=create_discount', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      discount: discountData,
    }),
  });
  
  const data = await response.json();
  return data;
}

async function updateInventory(inventoryData: any) {
  const response = await fetch('/api/admin?action=update_inventory', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: inventoryData,
    }),
  });
  
  const data = await response.json();
  return data;
}
```

---

## 🔒 Turvallisuus-checklist

### 1. Autentikointi & Auktorisointi
```typescript
export async function loader({ request, context }: LoaderFunctionArgs) {
  // 1. Tarkista session
  const session = await getSession(request.headers.get('Cookie'));
  if (!session) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // 2. Tarkista käyttäjän rooli (jos tarpeen)
  if (!session.user.isAdmin) {
    return json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // 3. Jatka turvallisesti...
}
```

### 2. Rate Limiting
```typescript
import { rateLimit } from '@/lib/rate-limit';

export async function loader({ request }: LoaderFunctionArgs) {
  const ip = request.headers.get('CF-Connecting-IP') || 
             request.headers.get('X-Forwarded-For') || 
             'unknown';
  
  const { success } = await rateLimit(ip, {
    limit: 10, // max 10 requests
    window: 60000, // per 60 seconds
  });
  
  if (!success) {
    return json({ error: 'Too many requests' }, { status: 429 });
  }
  
  // Jatka...
}
```

### 3. Input Validation
```typescript
import { z } from 'zod';

const CreateDiscountSchema = z.object({
  discount: z.object({
    title: z.string().min(1).max(255),
    code: z.string().min(3).max(50),
    percentage: z.number().min(1).max(100),
  }),
});

export async function loader({ request }: LoaderFunctionArgs) {
  const body = await request.json();
  
  // Validoi input
  const result = CreateDiscountSchema.safeParse(body);
  if (!result.success) {
    return json({ error: 'Invalid input', details: result.error }, { status: 400 });
  }
  
  // Käytä validoitua dataa
  const validatedData = result.data;
  // ...
}
```

### 4. Error Handling (älä vuoda sensitiivistä dataa)
```typescript
try {
  // Admin API kutsu...
} catch (error) {
  // ❌ VÄÄRIN: Paljastaa liikaa
  // return json({ error: error.message }, { status: 500 });
  
  // ✅ OIKEIN: Geneerinen virhe käyttäjälle, yksityiskohtainen logi palvelimelle
  console.error('Admin API error:', error);
  return json({ error: 'Failed to process request' }, { status: 500 });
}
```

---

## 📊 Webhook Proxy

### 1. Webhook-reitti: `app/routes/webhooks.shopify.tsx`

```typescript
import { json, type ActionFunctionArgs } from '@shopify/remix-oxygen';
import crypto from 'crypto';

/**
 * Shopify Webhook Handler
 */
export async function action({ request, context }: ActionFunctionArgs) {
  const { SHOPIFY_WEBHOOK_SECRET } = context.env;
  
  // 1. Validoi webhook signature
  const hmac = request.headers.get('X-Shopify-Hmac-Sha256');
  const topic = request.headers.get('X-Shopify-Topic');
  const shop = request.headers.get('X-Shopify-Shop-Domain');
  
  const body = await request.text();
  
  const isValid = verifyWebhook(body, hmac, SHOPIFY_WEBHOOK_SECRET);
  if (!isValid) {
    console.error('Invalid webhook signature');
    return json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // 2. Käsittele webhook topic
  const data = JSON.parse(body);
  
  switch (topic) {
    case 'orders/create':
      await handleOrderCreate(data);
      break;
    case 'orders/paid':
      await handleOrderPaid(data);
      break;
    case 'products/update':
      await handleProductUpdate(data);
      break;
    case 'inventory_levels/update':
      await handleInventoryUpdate(data);
      break;
    default:
      console.log('Unhandled webhook topic:', topic);
  }
  
  return json({ success: true });
}

function verifyWebhook(body: string, hmac: string | null, secret: string): boolean {
  if (!hmac) return false;
  
  const hash = crypto
    .createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('base64');
  
  return hash === hmac;
}

async function handleOrderCreate(order: any) {
  console.log('New order created:', order.id);
  // Lähetä email, päivitä tietokanta, jne.
}

async function handleOrderPaid(order: any) {
  console.log('Order paid:', order.id);
  // Käynnistä täyttöprosessi
}

async function handleProductUpdate(product: any) {
  console.log('Product updated:', product.id);
  // Päivitä cache, revalidate, jne.
}

async function handleInventoryUpdate(inventory: any) {
  console.log('Inventory updated:', inventory);
  // Päivitä varasto-UI
}
```

---

## 🚀 Seuraavat askeleet

Haluatko että:
1. ✅ Luon valmiin proxy-reitin projektiisi?
2. ✅ Lisään rate limiting -kirjaston?
3. ✅ Teen webhook-handlerin?
4. ✅ Lisään input validation -esimerkit?

Kerro mitä tarvitset, niin hoidan! 🔧

