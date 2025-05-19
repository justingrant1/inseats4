-- Create webhook_events table to track incoming webhook notifications
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  processed_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  retry_count INTEGER NOT NULL DEFAULT 0,
  idempotency_key TEXT UNIQUE
);

-- Add index for efficient status-based queries
CREATE INDEX webhook_events_status_idx ON webhook_events (status);

-- Add index for event type filtering
CREATE INDEX webhook_events_event_type_idx ON webhook_events (event_type);

-- Add webhook_logs column to orders table to track status updates
ALTER TABLE orders ADD COLUMN IF NOT EXISTS webhook_logs JSONB[];

-- Add webhook notification flags to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS last_webhook_status TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS last_webhook_timestamp TIMESTAMPTZ;

-- Add RLS policies
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Create policy for admins only
CREATE POLICY webhook_events_admin_policy ON webhook_events
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE email IN (
      'admin@inseats.com'
    )
  ));

-- Create notification_sent field in orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notification_sent BOOLEAN DEFAULT FALSE;
