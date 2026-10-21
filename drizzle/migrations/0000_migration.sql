CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_no text NOT NULL UNIQUE,
  request_id text NOT NULL UNIQUE,
  customer_name text NOT NULL,
  items jsonb NOT NULL,
  total numeric NOT NULL,
  currency text NOT NULL DEFAULT 'THB',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;