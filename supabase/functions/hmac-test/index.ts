// supabase/functions/hmac-test/index.ts
// Test HMAC generation for Shopify webhooks
// This function generates HMAC signatures for testing

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { crypto } from "https://deno.land/std@0.224.0/crypto/mod.ts";

serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const { body, secret } = await req.json();
    
    if (!body || !secret) {
      return new Response(JSON.stringify({ 
        error: 'Missing body or secret' 
      }), { status: 400, headers: corsHeaders });
    }

    // Generate HMAC SHA256 signature
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
    const hmac = btoa(String.fromCharCode(...new Uint8Array(signature)));
    
    return new Response(JSON.stringify({
      hmac,
      body,
      secret: secret.substring(0, 4) + '...', // Hide full secret
      curl_example: `curl -X POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/points-add' \\
  -H 'Content-Type: application/json' \\
  -H 'X-Shopify-Hmac-Sha256: ${hmac}' \\
  -d '${body}'`
    }), { headers: { "Content-Type": "application/json", ...corsHeaders } });

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: String(error) 
    }), { status: 500, headers: corsHeaders });
  }
});
