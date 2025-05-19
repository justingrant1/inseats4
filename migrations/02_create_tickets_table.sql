-- Create tickets table
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  tier_name TEXT NOT NULL,
  section TEXT,
  row TEXT,
  seat TEXT,
  price NUMERIC(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  seller_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL CHECK (status IN ('available', 'sold', 'reserved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON public.tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_seller_id ON public.tickets(seller_id);
CREATE INDEX IF NOT EXISTS idx_tickets_price ON public.tickets(price);

-- Set up RLS (Row Level Security)
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Create policy for reading (anyone can read available tickets)
CREATE POLICY "Anyone can read available tickets"
ON public.tickets
FOR SELECT
USING (status = 'available');

-- Create policy for reading all tickets (owners can see all their tickets)
CREATE POLICY "Users can read all their own tickets"
ON public.tickets
FOR SELECT
TO authenticated
USING (auth.uid() = seller_id);

-- Create policy for inserting (only authenticated users can create tickets)
CREATE POLICY "Authenticated users can create tickets"
ON public.tickets
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = seller_id);

-- Create policy for updating (only ticket owners can update their tickets)
CREATE POLICY "Users can update their own tickets"
ON public.tickets
FOR UPDATE
TO authenticated
USING (auth.uid() = seller_id);

-- Add comment
COMMENT ON TABLE public.tickets IS 'Stores information about tickets available for events';
