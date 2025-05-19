// Webhook Testing Script
// Usage: node test-webhook.js [event_type]

const fetch = require('node-fetch');
const crypto = require('crypto');

// Configuration
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:54321/functions/v1/webhooks';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'test-secret';
const EVENT_TYPE = process.argv[2] || 'ticket.delivered';

// Valid event types for testing
const VALID_EVENTS = [
  'payment.completed',
  'payment.failed',
  'ticket.delivered',
  'ticket.delivery_failed',
  'ticket.wallet_generated',
  'ticket.barcode_updated'
];

if (!VALID_EVENTS.includes(EVENT_TYPE)) {
  console.error(`Invalid event type. Must be one of: ${VALID_EVENTS.join(', ')}`);
  process.exit(1);
}

// Generate a random ID
const randomId = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Create test payload based on event type
const createTestPayload = (eventType) => {
  const now = new Date().toISOString();
  const orderId = randomId();
  const ticketId = randomId();
  
  // Base payload for all events
  const basePayload = {
    timestamp: now,
    source: 'webhook-test'
  };
  
  // Event-specific payloads
  switch (eventType) {
    case 'payment.completed':
      return {
        ...basePayload,
        order_id: orderId,
        payment_id: randomId(),
        amount: 125.75,
        currency: 'USD',
        payment_method: 'credit_card'
      };
      
    case 'payment.failed':
      return {
        ...basePayload,
        order_id: orderId,
        payment_id: randomId(),
        amount: 125.75,
        currency: 'USD',
        payment_method: 'credit_card',
        error: 'card_declined',
        error_message: 'Your card was declined'
      };
      
    case 'ticket.delivered':
      return {
        ...basePayload,
        order_id: orderId,
        ticket_id: ticketId,
        delivery_method: 'email',
        recipient: 'test@example.com'
      };
      
    case 'ticket.delivery_failed':
      return {
        ...basePayload,
        order_id: orderId,
        ticket_id: ticketId,
        delivery_method: 'email',
        recipient: 'invalid@example',
        error: 'invalid_email',
        error_message: 'Email address is invalid'
      };
      
    case 'ticket.wallet_generated':
      return {
        ...basePayload,
        order_id: orderId,
        ticket_id: ticketId,
        wallet_type: 'apple',
        pass_url: 'https://example.com/wallet/passes/12345',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };
      
    case 'ticket.barcode_updated':
      return {
        ...basePayload,
        ticket_id: ticketId,
        barcode: '1234567890ABCDEF',
        barcode_type: 'qrcode',
        electronic_ticket_url: `https://example.com/tickets/${ticketId}`
      };
      
    default:
      return basePayload;
  }
};

// Generate signature for payload
const generateSignature = (payload, secret) => {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const message = `${timestamp}.${JSON.stringify(payload)}`;
  
  return {
    signature: crypto.createHmac('sha256', secret)
                     .update(message)
                     .digest('hex'),
    timestamp
  };
};

// Send webhook request
const sendWebhook = async (url, eventType, payload) => {
  const { signature, timestamp } = generateSignature(payload, WEBHOOK_SECRET);
  const idempotencyKey = randomId();
  
  console.log(`Sending ${eventType} webhook to ${url}`);
  console.log('Payload:', JSON.stringify(payload, null, 2));
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-signature': signature,
        'x-webhook-timestamp': timestamp,
        'x-webhook-event-type': eventType,
        'x-idempotency-key': idempotencyKey
      },
      body: JSON.stringify(payload)
    });
    
    const responseData = await response.json();
    
    console.log('\nResponse:');
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log('Body:', JSON.stringify(responseData, null, 2));
    
    if (response.ok) {
      console.log('\n✅ Webhook sent successfully!');
    } else {
      console.log('\n❌ Webhook request failed!');
    }
  } catch (error) {
    console.error('\n❌ Error sending webhook:', error.message);
  }
};

// Execute webhook test
const testPayload = createTestPayload(EVENT_TYPE);
sendWebhook(WEBHOOK_URL, EVENT_TYPE, testPayload);

console.log('\nNote: You can check the webhook event in your database using this SQL query:');
console.log(`SELECT * FROM webhook_events WHERE event_type = '${EVENT_TYPE}' ORDER BY created_at DESC LIMIT 1;`);
