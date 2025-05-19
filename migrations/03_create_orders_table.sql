-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id),
  quantity INTEGER NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'canceled')),
  payment_intent_id TEXT,
  payment_method TEXT,
  billing_address JSONB,
  shipping_address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_ticket_id ON public.orders(ticket_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_intent_id ON public.orders(payment_intent_id);

-- Set up RLS (Row Level Security)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policy for reading (authenticated users can read their own orders)
CREATE POLICY "Users can read their own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create policy for inserting (authenticated users can create orders)
CREATE POLICY "Authenticated users can create orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create policy for updating (authenticated users can update their own orders)
CREATE POLICY "Users can update their own orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Create policy for system updates (service role can update any order)
CREATE POLICY "Service role can update any order"
ON public.orders
FOR UPDATE
TO service_role
USING (true);

-- Add comment
COMMENT ON TABLE public.orders IS 'Stores information about ticket orders';

-- Create function to update ticket status when an order is created or updated
CREATE OR REPLACE FUNCTION public.handle_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If a new order is created with status 'completed' or an existing order changes to 'completed'
  IF (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status != 'completed')) AND NEW.status = 'completed' THEN
    -- Update the ticket status to 'sold'
    UPDATE public.tickets
    SET status = 'sold'
    WHERE id = NEW.ticket_id;
  -- If order status changes to 'canceled' from 'pending'
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status = 'canceled' THEN
    -- Update the ticket status back to 'available'
    UPDATE public.tickets
    SET status = 'available'
    WHERE id = NEW.ticket_id AND status = 'reserved';
  -- If a new order is created with status 'pending'
  ELSIF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
    -- Update the ticket status to 'reserved'
    UPDATE public.tickets
    SET status = 'reserved'
    WHERE id = NEW.ticket_id AND status = 'available';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for order status changes
CREATE TRIGGER order_status_change_trigger
AFTER INSERT OR UPDATE OF status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.handle_order_status_change();
