// supabase/functions/webhook-shopify/index.ts
// Shopify Webhook Handler for HerbSpot.fi
// Processes Shopify order webhooks and triggers loyalty points

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req: Request) => {
  // CORS headers
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
    // Verify Shopify webhook signature
    const signature = req.headers.get('x-shopify-hmac-sha256');
    const topic = req.headers.get('x-shopify-topic');
    const shopDomain = req.headers.get('x-shopify-shop-domain');
    
    if (!signature || !topic) {
      console.error('Missing Shopify webhook headers');
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    // Get webhook secret from environment
    const webhookSecret = Deno.env.get('SHOPIFY_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('Missing SHOPIFY_WEBHOOK_SECRET environment variable');
      return new Response('Server configuration error', { status: 500, headers: corsHeaders });
    }

    // Read request body
    const body = await req.text();
    
    // Verify HMAC signature
    const crypto = globalThis.crypto;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(webhookSecret);
    const messageData = encoder.encode(body);
    
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, messageData);
    const expectedSignature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));
    
    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    console.log(`Received Shopify webhook: ${topic} from ${shopDomain}`);

    // Parse webhook payload
    const webhookData = JSON.parse(body);
    
    // Handle different webhook topics
    switch (topic) {
      case 'orders/paid':
        return await handleOrderPaid(webhookData, corsHeaders);
      case 'orders/fulfilled':
        return await handleOrderFulfilled(webhookData, corsHeaders);
      case 'orders/cancelled':
        return await handleOrderCancelled(webhookData, corsHeaders);
      default:
        console.log(`Unhandled webhook topic: ${topic}`);
        return new Response('OK', { status: 200, headers: corsHeaders });
    }

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});

async function handleOrderPaid(order: any, corsHeaders: any) {
  console.log(`Processing paid order: ${order.id}`);

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract order data
    const orderData = {
      order_id: order.id.toString(),
      shopify_order_id: order.id.toString(),
      order_number: order.order_number,
      email: order.customer?.email,
      customer_id: order.customer?.id?.toString(),
      total_amount: parseFloat(order.total_price),
      currency: order.currency,
      status: 'paid',
      items: order.line_items?.map((item: any) => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        price: parseFloat(item.price),
        variant_id: item.variant_id,
        product_id: item.product_id
      })),
      shipping_address: order.shipping_address,
      billing_address: order.billing_address,
      created_at: order.created_at,
      updated_at: order.updated_at
    };

    // Store order in database
    const { error: orderError } = await supabase
      .from('orders')
      .upsert([orderData], { onConflict: 'shopify_order_id' });

    if (orderError) {
      console.error('Error storing order:', orderError);
      // Continue anyway - don't fail the webhook for database errors
    }

    // Call points-add function to add loyalty points
    const pointsResponse = await fetch(`${supabaseUrl}/functions/v1/points-add`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        order_id: order.id.toString(),
        email: order.customer?.email,
        amount: parseFloat(order.total_price),
        shopify_order_id: order.id.toString(),
        items: order.line_items,
        source: 'shopify'
      })
    });

    const pointsResult = await pointsResponse.json();
    
    if (pointsResponse.ok) {
      console.log(`Successfully added ${pointsResult.points_added} points for order ${order.id}`);
    } else {
      console.error('Failed to add points:', pointsResult);
    }

    // Log the webhook processing
    await supabase
      .from('webhook_logs')
      .insert([{
        webhook_type: 'orders/paid',
        shopify_order_id: order.id.toString(),
        processed_at: new Date().toISOString(),
        success: pointsResponse.ok,
        points_added: pointsResult.points_added || 0,
        error_message: pointsResponse.ok ? null : pointsResult.error
      }]);

    return new Response(
      JSON.stringify({ 
        success: true, 
        order_id: order.id,
        points_added: pointsResult.points_added || 0
      }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Error processing order paid webhook:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process order' }),
      { status: 500, headers: corsHeaders }
    );
  }
}

async function handleOrderFulfilled(order: any, corsHeaders: any) {
  console.log(`Processing fulfilled order: ${order.id}`);

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update order status
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: 'fulfilled',
        updated_at: new Date().toISOString()
      })
      .eq('shopify_order_id', order.id.toString());

    if (error) {
      console.error('Error updating order status:', error);
    }

    // Log fulfillment
    await supabase
      .from('webhook_logs')
      .insert([{
        webhook_type: 'orders/fulfilled',
        shopify_order_id: order.id.toString(),
        processed_at: new Date().toISOString(),
        success: true
      }]);

    return new Response(
      JSON.stringify({ success: true, order_id: order.id }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Error processing order fulfilled webhook:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process fulfillment' }),
      { status: 500, headers: corsHeaders }
    );
  }
}

async function handleOrderCancelled(order: any, corsHeaders: any) {
  console.log(`Processing cancelled order: ${order.id}`);

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update order status
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('shopify_order_id', order.id.toString());

    if (error) {
      console.error('Error updating cancelled order:', error);
    }

    // Note: We don't remove points for cancelled orders by default
    // This could be implemented if needed for business logic

    // Log cancellation
    await supabase
      .from('webhook_logs')
      .insert([{
        webhook_type: 'orders/cancelled',
        shopify_order_id: order.id.toString(),
        processed_at: new Date().toISOString(),
        success: true
      }]);

    return new Response(
      JSON.stringify({ success: true, order_id: order.id }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Error processing order cancelled webhook:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process cancellation' }),
      { status: 500, headers: corsHeaders }
    );
  }
}

