-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  venue TEXT NOT NULL,
  location TEXT NOT NULL,
  image_url TEXT,
  min_price NUMERIC(10,2),
  max_price NUMERIC(10,2),
  is_premium BOOLEAN DEFAULT FALSE,
  is_last_minute BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events (category);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events (date);
CREATE INDEX IF NOT EXISTS idx_events_is_premium ON public.events (is_premium);
CREATE INDEX IF NOT EXISTS idx_events_is_last_minute ON public.events (is_last_minute);

-- Set up RLS (Row Level Security)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create policy for reading (anyone can read events)
CREATE POLICY "Anyone can read events"
ON public.events
FOR SELECT
USING (true);

-- Create policy for inserting (only authenticated users can create events)
CREATE POLICY "Authenticated users can create events"
ON public.events
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create policy for updating (only event owners can update)
CREATE POLICY "Users can update their own events"
ON public.events
FOR UPDATE
USING (auth.uid() = created_by);

-- Add comment
COMMENT ON TABLE public.events IS 'Stores information about events available on the platform';
