import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Constants for webhook handling
const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET') || '';
const WEBHOOK_SIGNATURE_HEADER = 'x-webhook-signature';
const WEBHOOK_TIMESTAMP_HEADER = 'x-webhook-timestamp';
const WEBHOOK_EVENT_TYPE_HEADER = 'x-webhook-event-type';
const WEBHOOK_IDEMPOTENCY_KEY_HEADER = 'x-idempotency-key';

// Initialize Supabase client from environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Verify webhook signature
 */
async function verifyWebhookSignature(
  payload: string,
  signature: string,
  timestamp?: string,
): Promise<boolean> {
  try {
    if (!WEBHOOK_SECRET) {
      console.warn('Webhook secret not provided, skipping signature verification');
      return true;
    }

    if (!signature) {
      return false;
    }

    // For timestamp-based verification (Stripe style)
    if (timestamp) {
      const signedPayload = `${timestamp}.${payload}`;
      const encoder = new TextEncoder();
      const data = encoder.encode(signedPayload);
      const keyData = encoder.encode(WEBHOOK_SECRET);
      
      // Create HMAC
      const key = await crypto.subtle.importKey(
        "raw", keyData, { name: "HMAC", hash: "SHA-256" }, 
        false, ["sign"]
      );
      
      const signatureBytes = await crypto.subtle.sign("HMAC", key, data);
      const expectedSignature = Array.from(
        new Uint8Array(signatureBytes)
      ).map(b => b.toString(16).padStart(2, '0')).join('');
      
      return expectedSignature === signature;
    }

    // For direct payload verification (simple style)
    const encoder = new TextEncoder();
    const data = encoder.encode(payload);
    const keyData = encoder.encode(WEBHOOK_SECRET);
    
    // Create HMAC
    const key = await crypto.subtle.importKey(
      "raw", keyData, { name: "HMAC", hash: "SHA-256" }, 
      false, ["sign"]
    );
    
    const signatureBytes = await crypto.subtle.sign("HMAC", key, data);
    const expectedSignature = Array.from(
      new Uint8Array(signatureBytes)
    ).map(b => b.toString(16).padStart(2, '0')).join('');
    
    return expectedSignature === signature;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

/**
 * Record webhook event in the database
 */
async function recordWebhookEvent(
  source: string,
  eventType: string,
  payload: any,
  signature: string,
  verified: boolean
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const { data, error } = await supabase
      .from('webhook_events')
      .insert({
        source,
        event_type: eventType,
        payload,
        signature,
        verified,
        processed: false
      })
      .select('id')
      .single();

    if (error) {
      throw error;
    }

    return { success: true, id: data.id };
  } catch (error: any) {
    console.error('Error recording webhook event:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Mark webhook event as processed
 */
async function markWebhookAsProcessed(
  id: string,
  status: 'success' | 'error',
  details?: any
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('webhook_events')
      .update({
        processed: true,
        processed_at: new Date().toISOString(),
        processing_status: status,
        processing_details: details || {}
      })
      .eq('id', id);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error marking webhook as processed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update order with webhook information
 */
async function updateOrderWithWebhook(
  orderId: string,
  status: string,
  webhookStatus: string,
  webhookEventId: string,
  event: string,
  source: string,
  details: any
): Promise<boolean> {
  try {
    // Get the current order to append to webhook logs
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('webhook_logs')
      .eq('id', orderId)
      .single();
      
    if (fetchError) {
      throw fetchError;
    }
    
    // Add new webhook log
    const webhookLog = {
      webhook_id: webhookEventId,
      timestamp: new Date().toISOString(),
      event,
      source,
      details
    };
    
    // Update the order
    const { error } = await supabase
      .from('orders')
      .update({
        status,
        last_webhook_status: webhookStatus,
        last_webhook_timestamp: new Date().toISOString(),
        webhook_logs: order?.webhook_logs ? [...order.webhook_logs, webhookLog] : [webhookLog],
        notification_sent: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating order with webhook:', error);
    return false;
  }
}

/**
 * Process webhook event
 */
async function processWebhookEvent(
  eventType: string,
  payload: any,
  idempotencyKey: string
): Promise<{ success: boolean; message: string; orderId?: string }> {
  try {
    // First record the webhook event
    const { id: webhookEventId, error } = await recordWebhookEvent(
      payload.source || 'unknown',
      eventType,
      payload,
      idempotencyKey,
      true
    );
    
    if (error) {
      throw new Error(`Failed to record webhook event: ${error}`);
    }
    
    // Process based on event type
    switch (eventType) {
      case 'payment.completed': {
        if (!payload.order_id) {
          throw new Error('Missing order_id in payment webhook payload');
        }
        
        const result = await updateOrderWithWebhook(
          payload.order_id,
          'paid',
          'payment_completed',
          webhookEventId!,
          'payment.completed',
          payload.source || 'payment_provider',
          payload
        );
        
        if (!result) {
          throw new Error('Failed to update order');
        }
        
        // Mark webhook event as processed
        await markWebhookAsProcessed(webhookEventId!, 'success', {
          orderId: payload.order_id,
          action: 'payment_update',
          result: 'completed'
        });
        
        return {
          success: true,
          message: 'Payment completion processed successfully',
          orderId: payload.order_id
        };
      }
        
      case 'payment.failed': {
        if (!payload.order_id) {
          throw new Error('Missing order_id in payment webhook payload');
        }
        
        const result = await updateOrderWithWebhook(
          payload.order_id,
          'payment_failed',
          'payment_failed',
          webhookEventId!,
          'payment.failed',
          payload.source || 'payment_provider',
          payload
        );
        
        if (!result) {
          throw new Error('Failed to update order');
        }
        
        // Mark webhook event as processed
        await markWebhookAsProcessed(webhookEventId!, 'success', {
          orderId: payload.order_id,
          action: 'payment_update',
          result: 'failed'
        });
        
        return {
          success: true,
          message: 'Payment failure processed successfully',
          orderId: payload.order_id
        };
      }
      
      // TicketVault events
      case 'ticket.delivered': {
        if (!payload.ticket_id || !payload.order_id) {
          throw new Error('Missing ticket_id or order_id in ticket webhook payload');
        }
        
        // Update ticket status
        const { error: ticketError } = await supabase
          .from('tickets')
          .update({
            delivery_status: 'delivered',
            last_delivery_timestamp: new Date().toISOString()
          })
          .eq('id', payload.ticket_id);
          
        if (ticketError) {
          throw new Error(`Failed to update ticket: ${ticketError.message}`);
        }
        
        // Update order with webhook information
        const result = await updateOrderWithWebhook(
          payload.order_id,
          'delivered',
          'ticket_delivered',
          webhookEventId!,
          'ticket.delivered',
          payload.source || 'ticketvault',
          payload
        );
        
        if (!result) {
          throw new Error('Failed to update order');
        }
        
        // Mark webhook event as processed
        await markWebhookAsProcessed(webhookEventId!, 'success', {
          orderId: payload.order_id,
          ticketId: payload.ticket_id,
          action: 'ticket_delivery',
          result: 'delivered'
        });
        
        return {
          success: true,
          message: 'Ticket delivery processed successfully',
          orderId: payload.order_id
        };
      }
      
      case 'ticket.delivery_failed': {
        if (!payload.ticket_id || !payload.order_id) {
          throw new Error('Missing ticket_id or order_id in ticket webhook payload');
        }
        
        // Update ticket status
        const { error: ticketError } = await supabase
          .from('tickets')
          .update({
            delivery_status: 'failed',
            last_delivery_timestamp: new Date().toISOString()
          })
          .eq('id', payload.ticket_id);
          
        if (ticketError) {
          throw new Error(`Failed to update ticket: ${ticketError.message}`);
        }
        
        // Update order with webhook information
        const result = await updateOrderWithWebhook(
          payload.order_id,
          'delivery_failed',
          'ticket_delivery_failed',
          webhookEventId!,
          'ticket.delivery_failed',
          payload.source || 'ticketvault',
          payload
        );
        
        if (!result) {
          throw new Error('Failed to update order');
        }
        
        // Mark webhook event as processed
        await markWebhookAsProcessed(webhookEventId!, 'success', {
          orderId: payload.order_id,
          ticketId: payload.ticket_id,
          action: 'ticket_delivery',
          result: 'failed',
          error: payload.error || 'Unknown delivery error'
        });
        
        return {
          success: true,
          message: 'Ticket delivery failure processed successfully',
          orderId: payload.order_id
        };
      }
      
      case 'ticket.wallet_generated': {
        if (!payload.ticket_id || !payload.wallet_type) {
          throw new Error('Missing ticket_id or wallet_type in wallet webhook payload');
        }
        
        // Update ticket with wallet pass information
        const { error: ticketError } = await supabase
          .from('tickets')
          .update({
            wallet_pass_url: payload.pass_url,
            delivery_status: 'wallet_ready',
            last_delivery_timestamp: new Date().toISOString()
          })
          .eq('id', payload.ticket_id);
          
        if (ticketError) {
          throw new Error(`Failed to update ticket: ${ticketError.message}`);
        }
        
        // If order_id is provided, update it too
        if (payload.order_id) {
          const result = await updateOrderWithWebhook(
            payload.order_id,
            'wallet_ready',
            'ticket_wallet_ready',
            webhookEventId!,
            'ticket.wallet_generated',
            payload.source || 'ticketvault',
            payload
          );
          
          if (!result) {
            throw new Error('Failed to update order');
          }
        }
        
        // Mark webhook event as processed
        await markWebhookAsProcessed(webhookEventId!, 'success', {
          ticketId: payload.ticket_id,
          orderId: payload.order_id,
          walletType: payload.wallet_type,
          action: 'wallet_generation',
          result: 'success'
        });
        
        return {
          success: true,
          message: 'Wallet pass generation processed successfully',
          orderId: payload.order_id
        };
      }
      
      case 'ticket.barcode_updated': {
        if (!payload.ticket_id) {
          throw new Error('Missing ticket_id in barcode webhook payload');
        }
        
        // Update ticket with barcode information
        const { error: ticketError } = await supabase
          .from('tickets')
          .update({
            barcode: payload.barcode,
            barcode_type: payload.barcode_type,
            electronic_ticket_url: payload.electronic_ticket_url,
            last_delivery_timestamp: new Date().toISOString()
          })
          .eq('id', payload.ticket_id);
          
        if (ticketError) {
          throw new Error(`Failed to update ticket: ${ticketError.message}`);
        }
        
        // Mark webhook event as processed
        await markWebhookAsProcessed(webhookEventId!, 'success', {
          ticketId: payload.ticket_id,
          action: 'barcode_update',
          result: 'success'
        });
        
        return {
          success: true,
          message: 'Ticket barcode update processed successfully'
        };
      }
        
      default: {
        // For unhandled events, just mark them as processed
        await markWebhookAsProcessed(webhookEventId!, 'success', {
          note: `Unhandled event type: ${eventType}`
        });
        
        return {
          success: true,
          message: `Recorded unhandled event type: ${eventType}`
        };
      }
    }
  } catch (error: any) {
    console.error('Error processing webhook event:', error);
    return {
      success: false,
      message: `Webhook processing error: ${error.message}`
    };
  }
}

serve(async (req) => {
  // Only allow POST requests for webhooks
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }), 
      { 
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    // Get signature and timestamp from headers for verification
    const signature = req.headers.get(WEBHOOK_SIGNATURE_HEADER) || '';
    const timestamp = req.headers.get(WEBHOOK_TIMESTAMP_HEADER) || '';
    const eventType = req.headers.get(WEBHOOK_EVENT_TYPE_HEADER) || '';
    const idempotencyKey = req.headers.get(WEBHOOK_IDEMPOTENCY_KEY_HEADER) || 
                           crypto.randomUUID(); // Generate one if not provided

    // Parse request body
    const payloadText = await req.text();
    
    if (!payloadText) {
      return new Response(
        JSON.stringify({ error: 'Empty request body' }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Verify webhook signature
    try {
      const isValid = await verifyWebhookSignature(payloadText, signature, timestamp);
      if (!isValid) {
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }), 
          { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    } catch (error: any) {
      return new Response(
        JSON.stringify({ 
          error: error.message || 'Signature verification failed',
          code: error.statusCode || 401
        }), 
        { 
          status: error.statusCode || 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Try to parse the payload to ensure it's valid JSON
    let parsedPayload: any;
    try {
      parsedPayload = JSON.parse(payloadText);
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Make sure we have an event type
    if (!eventType) {
      return new Response(
        JSON.stringify({ error: 'Missing event type header' }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Process the webhook event
    const result = await processWebhookEvent(
      eventType, 
      parsedPayload,
      idempotencyKey
    );

    return new Response(
      JSON.stringify({ 
        success: result.success,
        message: result.message,
        orderId: result.orderId
      }), 
      { 
        status: result.success ? 200 : 422,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        code: error.statusCode || 500
      }), 
      { 
        status: error.statusCode || 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});
