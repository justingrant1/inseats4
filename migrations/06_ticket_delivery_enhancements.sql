-- Migration: Ticket Delivery Enhancements
-- Creates necessary tables and fields for electronic ticket delivery

-- Create ticket_deliveries table to track delivery history
CREATE TABLE ticket_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL,
  delivery_method TEXT NOT NULL,
  recipient TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  delivery_id TEXT,
  provider_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  attempts INTEGER DEFAULT 1,
  error_details TEXT,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id)
);

-- Add index for query optimization
CREATE INDEX idx_ticket_deliveries_ticket_id ON ticket_deliveries(ticket_id);
CREATE INDEX idx_ticket_deliveries_status ON ticket_deliveries(status);

-- Add electronic ticket fields to tickets table
ALTER TABLE tickets 
  ADD COLUMN IF NOT EXISTS barcode TEXT,
  ADD COLUMN IF NOT EXISTS barcode_type TEXT,
  ADD COLUMN IF NOT EXISTS electronic_ticket_url TEXT,
  ADD COLUMN IF NOT EXISTS wallet_pass_url TEXT,
  ADD COLUMN IF NOT EXISTS last_delivery_timestamp TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS delivery_status TEXT;

-- Add RLS policies
ALTER TABLE ticket_deliveries ENABLE ROW LEVEL SECURITY;

-- Only allow users to see their own ticket deliveries
CREATE POLICY ticket_deliveries_select_policy ON ticket_deliveries
  FOR SELECT
  USING (
    ticket_id IN (
      SELECT t.id FROM tickets t
      JOIN orders o ON t.id = o.ticket_id
      WHERE o.user_id = auth.uid()
    )
  );

-- Create webhook type for TicketVault deliveries
INSERT INTO webhook_event_types (name, description)
VALUES 
  ('ticketvault.delivery.success', 'Electronic ticket delivered successfully'),
  ('ticketvault.delivery.failed', 'Electronic ticket delivery failed'),
  ('ticketvault.transfer.success', 'Ticket transferred successfully'),
  ('ticketvault.transfer.failed', 'Ticket transfer failed')
ON CONFLICT (name) DO NOTHING;

-- Create function to update ticket status when delivery happens
CREATE OR REPLACE FUNCTION update_ticket_delivery_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the ticket with the latest delivery status
  IF NEW.status = 'completed' THEN
    UPDATE tickets
    SET 
      delivery_status = 'delivered',
      last_delivery_timestamp = NEW.completed_at
    WHERE id = NEW.ticket_id;
    
    -- Also update the order status if needed
    UPDATE orders
    SET 
      status = CASE WHEN status = 'paid' THEN 'delivered' ELSE status END,
      last_webhook_status = 'ticket_delivered',
      last_webhook_timestamp = NEW.completed_at,
      updated_at = NEW.completed_at
    WHERE ticket_id = NEW.ticket_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update ticket status
CREATE TRIGGER trigger_update_ticket_delivery_status
AFTER UPDATE OF status ON ticket_deliveries
FOR EACH ROW
WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
EXECUTE FUNCTION update_ticket_delivery_status();

COMMENT ON TABLE ticket_deliveries IS 'Tracks electronic ticket delivery attempts and status';
COMMENT ON COLUMN tickets.barcode IS 'Ticket barcode or QR code value';
COMMENT ON COLUMN tickets.barcode_type IS 'Type of barcode (QR, CODE128, etc.)';
