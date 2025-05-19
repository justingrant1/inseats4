-- Add ticket_shares table for ticket sharing functionality
CREATE TABLE IF NOT EXISTS ticket_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  share_type TEXT NOT NULL CHECK (share_type IN ('email', 'sms', 'link')),
  recipient_email TEXT,
  recipient_phone TEXT,
  sender_name TEXT,
  personal_message TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  revoked BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,
  
  CONSTRAINT shares_has_recipient_check CHECK (
    (share_type = 'email' AND recipient_email IS NOT NULL) OR
    (share_type = 'sms' AND recipient_phone IS NOT NULL) OR
    (share_type = 'link')
  )
);

-- Add indexes for performance
CREATE INDEX idx_ticket_shares_ticket_id ON ticket_shares(ticket_id);
CREATE INDEX idx_ticket_shares_share_type ON ticket_shares(share_type);
CREATE INDEX idx_ticket_shares_expires_at ON ticket_shares(expires_at);

-- Column adjustments in tickets table (ensuring row_name is correctly named)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tickets' AND column_name = 'row_name'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tickets' AND column_name = 'row'
  ) THEN
    ALTER TABLE tickets RENAME COLUMN "row" TO row_name;
  END IF;
END
$$;

-- Update Database Types
COMMENT ON TABLE ticket_shares IS 'Stores shared ticket information and access controls';
COMMENT ON COLUMN ticket_shares.id IS 'Unique identifier for the share';
COMMENT ON COLUMN ticket_shares.ticket_id IS 'Reference to the shared ticket';
COMMENT ON COLUMN ticket_shares.share_type IS 'Type of share (email, sms, link)';
COMMENT ON COLUMN ticket_shares.recipient_email IS 'Email of the recipient (for email shares)';
COMMENT ON COLUMN ticket_shares.recipient_phone IS 'Phone number of the recipient (for SMS shares)';
COMMENT ON COLUMN ticket_shares.sender_name IS 'Name of the person sharing the ticket';
COMMENT ON COLUMN ticket_shares.personal_message IS 'Optional personal message from the sender';
COMMENT ON COLUMN ticket_shares.expires_at IS 'Expiration date for this share';
COMMENT ON COLUMN ticket_shares.created_at IS 'When the share was created';
COMMENT ON COLUMN ticket_shares.revoked IS 'Whether the share has been revoked';
COMMENT ON COLUMN ticket_shares.revoked_at IS 'When the share was revoked';
COMMENT ON COLUMN ticket_shares.view_count IS 'Number of times the shared ticket has been viewed';

-- Row Level Security
ALTER TABLE ticket_shares ENABLE ROW LEVEL SECURITY;

-- Policies for ticket_shares table
CREATE POLICY "Users can view their own shares" 
  ON ticket_shares 
  FOR SELECT 
  USING (
    ticket_id IN (
      SELECT id FROM tickets WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create shares for their own tickets" 
  ON ticket_shares 
  FOR INSERT 
  WITH CHECK (
    ticket_id IN (
      SELECT id FROM tickets WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own shares" 
  ON ticket_shares 
  FOR UPDATE 
  USING (
    ticket_id IN (
      SELECT id FROM tickets WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own shares" 
  ON ticket_shares 
  FOR DELETE 
  USING (
    ticket_id IN (
      SELECT id FROM tickets WHERE user_id = auth.uid()
    )
  );

-- Allow anonymous access to shared tickets via link
CREATE POLICY "Anyone can view shared tickets with valid share ID" 
  ON ticket_shares 
  FOR SELECT 
  USING (
    id = coalesce(nullif(current_setting('request.jwt.claim.share_id', true), ''), id)
  );

-- Create a function to get a shared ticket
CREATE OR REPLACE FUNCTION get_shared_ticket(p_share_id UUID)
RETURNS TABLE (
  ticket_id UUID,
  event_name TEXT,
  event_date TIMESTAMP WITH TIME ZONE,
  venue TEXT,
  section TEXT,
  row_name TEXT,
  seat TEXT,
  barcode TEXT,
  barcode_type TEXT,
  image_url TEXT,
  status TEXT,
  share_expires_at TIMESTAMP WITH TIME ZONE,
  is_revoked BOOLEAN
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- First check if share exists and is valid
  IF NOT EXISTS (
    SELECT 1 FROM ticket_shares 
    WHERE id = p_share_id 
      AND expires_at > NOW() 
      AND revoked = FALSE
  ) THEN
    RAISE EXCEPTION 'Shared ticket not found or expired';
  END IF;

  -- Update view count
  UPDATE ticket_shares 
  SET view_count = view_count + 1 
  WHERE id = p_share_id;

  -- Return ticket details
  RETURN QUERY
  SELECT 
    t.id,
    e.name, 
    e.date, 
    CONCAT(e.venue_name, ', ', e.venue_city, ', ', e.venue_state),
    t.section,
    t.row_name,
    t.seat,
    t.barcode,
    t.barcode_type,
    t.image_url,
    t.status,
    s.expires_at,
    s.revoked
  FROM 
    ticket_shares s
    JOIN tickets t ON s.ticket_id = t.id
    JOIN events e ON t.event_id = e.id
  WHERE 
    s.id = p_share_id;
END;
$$;
