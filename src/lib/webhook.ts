import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database.types'
import crypto from 'crypto'

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const webhookSecret = import.meta.env.VITE_WEBHOOK_SECRET || ''

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

/**
 * Verify webhook request signature
 * Uses HMAC SHA-256 signature validation to verify the request is from a trusted source
 */
export function verifyWebhookSignature(
  payload: any,
  signature: string,
  secret: string = webhookSecret,
  timestamp?: string
): boolean {
  try {
    if (!secret) {
      console.warn('Webhook secret not provided, skipping signature verification')
      return true
    }

    if (!signature) {
      return false
    }

    // For timestamp-based verification (Stripe style)
    if (timestamp) {
      const signedPayload = `${timestamp}.${JSON.stringify(payload)}`
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(signedPayload)
        .digest('hex')

      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      )
    }

    // For direct payload verification (simple style)
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex')

    return expectedSignature === signature
  } catch (error) {
    console.error('Error verifying webhook signature:', error)
    return false
  }
}

/**
 * Process a webhook event from the Supabase Edge Function
 */
export async function processWebhookEvent(
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
    )
    
    if (error) {
      throw new Error(`Failed to record webhook event: ${error}`)
    }
    
    // Process based on event type
    switch (eventType) {
      case 'payment.completed':
        if (!payload.order_id) {
          throw new Error('Missing order_id in payment webhook payload')
        }
        
        await processPaymentWebhook(
          payload.order_id,
          'completed',
          webhookEventId!,
          payload
        )
        
        return {
          success: true,
          message: 'Payment completion processed successfully',
          orderId: payload.order_id
        }
        
      case 'payment.failed':
        if (!payload.order_id) {
          throw new Error('Missing order_id in payment webhook payload')
        }
        
        await processPaymentWebhook(
          payload.order_id,
          'failed',
          webhookEventId!,
          payload
        )
        
        return {
          success: true,
          message: 'Payment failure processed successfully',
          orderId: payload.order_id
        }
        
      case 'tickets.delivered':
        if (!payload.ticket_ids || !Array.isArray(payload.ticket_ids)) {
          throw new Error('Missing or invalid ticket_ids in ticket webhook payload')
        }
        
        await processTicketDeliveryWebhook(
          payload.ticket_ids,
          'delivered',
          webhookEventId!,
          payload
        )
        
        return {
          success: true,
          message: 'Ticket delivery processed successfully'
        }
        
      case 'tickets.failed':
        if (!payload.ticket_ids || !Array.isArray(payload.ticket_ids)) {
          throw new Error('Missing or invalid ticket_ids in ticket webhook payload')
        }
        
        await processTicketDeliveryWebhook(
          payload.ticket_ids,
          'failed',
          webhookEventId!,
          payload
        )
        
        return {
          success: true,
          message: 'Ticket delivery failure processed successfully'
        }
        
      default:
        // Mark as processed but note that we didn't handle it
        await markWebhookAsProcessed(webhookEventId!, 'success', {
          note: `Unhandled event type: ${eventType}`
        })
        
        return {
          success: true,
          message: `Recorded unhandled event type: ${eventType}`
        }
    }
  } catch (error: any) {
    console.error('Error processing webhook event:', error)
    return {
      success: false,
      message: `Webhook processing error: ${error.message}`
    }
  }
}

/**
 * Record webhook event in the database
 */
export async function recordWebhookEvent(
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
      .single()

    if (error) {
      throw error
    }

    return { success: true, id: data.id }
  } catch (error: any) {
    console.error('Error recording webhook event:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Mark webhook event as processed
 */
export async function markWebhookAsProcessed(
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
      .eq('id', id)

    if (error) {
      throw error
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error marking webhook as processed:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Process a payment webhook
 */
export async function processPaymentWebhook(
  orderId: string,
  status: 'completed' | 'failed',
  webhookEventId: string,
  details: any
): Promise<{ success: boolean; error?: string }> {
  try {
    // Update order status based on payment status
    const webhookStatus = status === 'completed' ? 'payment_completed' : 'payment_failed'
    
    // Get the current order to append to webhook logs
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('webhook_logs')
      .eq('id', orderId)
      .single()
      
    if (fetchError) {
      throw fetchError
    }
    
    // Add new webhook log
    const webhookLog = {
      webhook_id: webhookEventId,
      timestamp: new Date().toISOString(),
      event: `payment.${status}`,
      source: details.source || 'payment_provider',
      details
    }
    
    // Update the order with webhook information
    const { error } = await supabase
      .from('orders')
      .update({
        status: status === 'completed' ? 'paid' : 'payment_failed',
        payment_status: status,
        last_webhook_status: webhookStatus,
        last_webhook_timestamp: new Date().toISOString(),
        webhook_logs: order?.webhook_logs ? [...order.webhook_logs, webhookLog] : [webhookLog],
        notification_sent: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)

    if (error) {
      throw error
    }

    // Mark webhook event as processed
    await markWebhookAsProcessed(webhookEventId, 'success', {
      orderId,
      action: 'payment_update',
      result: status
    })

    return { success: true }
  } catch (error: any) {
    console.error('Error processing payment webhook:', error)
    
    // Mark webhook event as failed
    await markWebhookAsProcessed(webhookEventId, 'error', {
      orderId,
      action: 'payment_update',
      error: error.message
    })
    
    return { success: false, error: error.message }
  }
}

/**
 * Process a ticket delivery webhook
 */
export async function processTicketDeliveryWebhook(
  inputTicketIds: string[],
  status: 'delivered' | 'failed',
  webhookEventId: string,
  details: any
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!inputTicketIds || !inputTicketIds.length) {
      throw new Error('No ticket IDs provided')
    }
    
    // Find orders associated with these tickets
    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .select('id, event_id')
      .in('id', inputTicketIds)
      
    if (ticketsError) {
      throw ticketsError
    }
    
    if (!tickets || tickets.length === 0) {
      throw new Error('No tickets found with the provided IDs')
    }
    
    // Get ticket IDs from the query result
    const ticketIdList = tickets.map(t => t.id || '')
    
    // Find orders that reference these tickets
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('id')
      .in('ticket_id', ticketIdList)
      
    if (orderError) {
      throw orderError
    }
    
    if (!orderData || orderData.length === 0) {
      throw new Error('No orders found associated with these tickets')
    }
    
    const orderIds = [...new Set(orderData.map(o => o.id || ''))]
    
    // Update each order associated with the tickets
    for (const orderId of orderIds) {
      if (!orderId) continue
      
      // Get current order to append to webhook logs
      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('webhook_logs')
        .eq('id', orderId)
        .single()
        
      if (fetchError) {
        throw fetchError
      }
      
      // Add new webhook log
      const webhookLog = {
        webhook_id: webhookEventId,
        timestamp: new Date().toISOString(),
        event: `ticket.${status}`,
        source: details.source || 'delivery_provider',
        details: {
          ...details,
          ticket_ids: inputTicketIds
        }
      }
      
      // Update the order with delivery information
      const webhookStatus = status === 'delivered' ? 'ticket_delivered' : 'delivery_failed'
      const { error } = await supabase
        .from('orders')
        .update({
          status: status === 'delivered' ? 'delivered' : 'delivery_failed',
          last_webhook_status: webhookStatus,
          last_webhook_timestamp: new Date().toISOString(),
          webhook_logs: order?.webhook_logs ? [...order.webhook_logs, webhookLog] : [webhookLog],
          notification_sent: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

      if (error) {
        throw error
      }
    }

    // Mark webhook event as processed
    await markWebhookAsProcessed(webhookEventId, 'success', {
      ticketIds: inputTicketIds,
      action: 'ticket_delivery_update',
      result: status
    })

    return { success: true }
  } catch (error: any) {
    console.error('Error processing delivery webhook:', error)
    
    // Mark webhook event as failed
    await markWebhookAsProcessed(webhookEventId, 'error', {
      ticketIds: inputTicketIds,
      action: 'ticket_delivery_update',
      error: error.message
    })
    
    return { success: false, error: error.message }
  }
}

/**
 * Validate webhook payload based on expected schema
 */
export function validateWebhookPayload(
  payload: any,
  requiredFields: string[]
): { valid: boolean; missingFields?: string[] } {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, missingFields: ['entire payload'] }
  }
  
  const missingFields = requiredFields.filter(field => !payload[field])
  
  return {
    valid: missingFields.length === 0,
    missingFields: missingFields.length ? missingFields : undefined
  }
}

/**
 * Mark notification as read/sent for an order
 */
export async function markNotificationAsSent(orderId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ notification_sent: true })
      .eq('id', orderId)
      
    return !error
  } catch (error) {
    console.error('Error marking notification as sent:', error)
    return false
  }
}

/**
 * Get unprocessed webhook events
 */
export async function getUnprocessedWebhookEvents(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('webhook_events')
      .select('*')
      .eq('processed', false)
      .order('created_at', { ascending: true })
      
    if (error) {
      throw error
    }
    
    return data || []
  } catch (error) {
    console.error('Error fetching unprocessed webhook events:', error)
    return []
  }
}
