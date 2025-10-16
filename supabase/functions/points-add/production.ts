// supabase/functions/points-add/production.ts
// HerbSpot.fi Loyalty Points System - PRODUCTION READY
// HMAC validation, idempotency, and comprehensive error handling

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.224.0/crypto/mod.ts";

type WebhookPayload = {
  order_id?: string | number;
  user_id?: string;
  email?: string;
  amount?: number; // total price in EUR
  currency?: string;
  qr_code?: string | null;
  // Raw Shopify order payload fields if you post straight from Shopify:
  id?: number;
  total_price?: string;
  note_attributes?: Array<{ name: string; value: string }>;
  customer?: { id?: number; email?: string };
};

// HMAC validation utilities
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a[i] ^ b[i];
  return out === 0;
}

async function verifyShopifyHmac(req: Request, secret: string): Promise<boolean> {
  const hmacHeader = req.headers.get("X-Shopify-Hmac-Sha256");
  if (!hmacHeader) return false;
  
  const rawBody = new Uint8Array(await req.arrayBuffer());
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify", "sign"],
  );
  
  const signature = await crypto.subtle.sign("HMAC", key, rawBody);
  const computed = new Uint8Array(signature);
  const given = Uint8Array.from(atob(hmacHeader), c => c.charCodeAt(0));
  
  return timingSafeEqual(computed, given);
}

serve(async (req: Request) => {
  // CORS headers for web requests
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-shopify-hmac-sha256, x-shopify-topic, x-shopify-shop-domain',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }

  try {
    // Environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const shopifySecret = Deno.env.get("SHOPIFY_WEBHOOK_SECRET")!;
    const pointsPerEuro = Number(Deno.env.get("POINTS_PER_EURO") ?? "1");

    // HMAC validation (mandatory in production)
    const hmacOk = await verifyShopifyHmac(req, shopifySecret);
    if (!hmacOk) {
      console.error('Invalid HMAC signature');
      return new Response(JSON.stringify({ error: "Invalid HMAC" }), { 
        status: 401, 
        headers: corsHeaders 
      });
    }

    // Read body again since verifyShopifyHmac consumed arrayBuffer
    const bodyText = await req.clone().text();
    const payload: WebhookPayload = JSON.parse(bodyText || "{}");

    // Normalize payload from different sources
    const orderId = String(payload.order_id ?? payload.id ?? "");
    const email = payload.email ?? payload.customer?.email ?? "";
    const currency = payload.currency ?? "EUR";
    const amount = typeof payload.amount === "number"
      ? payload.amount
      : payload.total_price
      ? Number(payload.total_price)
      : 0;

    // Try to read QR attribute from Shopify note_attributes list
    const qrAttr = payload.note_attributes?.find(n => 
      n.name?.toLowerCase() === "qr_code")?.value ?? null;
    const qr_code = payload.qr_code ?? qrAttr;

    // Validation
    if (!orderId) {
      return new Response(JSON.stringify({ error: "Missing order_id" }), { 
        status: 400, 
        headers: corsHeaders 
      });
    }
    if (!email && !payload.user_id) {
      return new Response(JSON.stringify({ error: "Missing user identifier (email or user_id)" }), {
        status: 400,
        headers: corsHeaders
      });
    }
    if (!Number.isFinite(amount) || amount < 0) {
      return new Response(JSON.stringify({ error: "Invalid amount" }), { 
        status: 400, 
        headers: corsHeaders 
      });
    }
    if (currency !== "EUR") {
      return new Response(JSON.stringify({ error: "Unsupported currency" }), { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    const points = Math.floor(amount * pointsPerEuro);

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find user by id or email
    let userId = payload.user_id ?? null;

    if (!userId && email) {
      const { data: userByEmail, error: userByEmailErr } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (userByEmailErr) {
        console.error('Error finding user by email:', userByEmailErr);
        return new Response(JSON.stringify({ error: userByEmailErr.message }), { 
          status: 500, 
          headers: corsHeaders 
        });
      }
      if (!userByEmail) {
        // Optionally create user here if needed
        console.error('User not found:', email);
        return new Response(JSON.stringify({ error: "User not found" }), { 
          status: 404, 
          headers: corsHeaders 
        });
      }
      userId = userByEmail.id;
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: "User not found" }), { 
        status: 404, 
        headers: corsHeaders 
      });
    }

    // Idempotency: UNIQUE(order_id, source)
    const source = qr_code ? "qr" : "shopify";

    // Try insert... if duplicate, fetch existing and continue
    const { error: insErr } = await supabase.from("loyalty_transactions").insert([
      {
        user_id: userId,
        order_id: String(orderId),
        points,
        source,
        qr_code: qr_code ?? null,
        amount,
        created_at: new Date().toISOString(),
      },
    ]);

    if (insErr) {
      // If violated unique constraint, just read total and return ok = true
      const isUniqueViolation =
        (insErr.details || "").toLowerCase().includes("duplicate") ||
        (insErr.message || "").toLowerCase().includes("duplicate") ||
        (insErr.code || "") === "23505";
      if (!isUniqueViolation) {
        console.error('Database insert error:', insErr);
        return new Response(JSON.stringify({ error: insErr.message }), { 
          status: 500, 
          headers: corsHeaders 
        });
      }
    }

    // Calculate total points for user
    const { data: ptsRows, error: sumErr } = await supabase
      .from("loyalty_transactions")
      .select("points")
      .eq("user_id", userId);

    if (sumErr) {
      console.error('Error calculating total points:', sumErr);
      return new Response(JSON.stringify({ error: sumErr.message }), { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    const total = (ptsRows ?? []).reduce((acc, r) => acc + (r.points ?? 0), 0);

    // Update loyalty_points summary table
    const { error: updateErr } = await supabase
      .from("loyalty_points")
      .upsert({
        user_id: userId,
        points: total,
        tier: total >= 4000 ? 'VIP' : 
              total >= 1500 ? 'Gold' : 
              total >= 500 ? 'Silver' : 'Bronze',
        total_orders: (ptsRows?.length || 0) + 1,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (updateErr) {
      console.error('Error updating loyalty summary:', updateErr);
      // Don't fail the request for summary update errors
    }

    console.log(`Successfully added ${points} points for order ${orderId}, total: ${total}`);

    return new Response(
      JSON.stringify({
        success: true,
        user_id: userId,
        order_id: String(orderId),
        points_added: points,
        total_points: total,
        source,
        timestamp: new Date().toISOString()
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error) {
    console.error('Points-add function error:', error);
    return new Response(
      JSON.stringify({ error: String(error) }), 
      { status: 500, headers: corsHeaders }
    );
  }
});
