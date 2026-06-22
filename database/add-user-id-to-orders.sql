-- Add user_id linkage from orders to auth.users
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS user_id uuid NULL;

ALTER TABLE public.orders
DROP CONSTRAINT IF EXISTS orders_user_id_fkey;

ALTER TABLE public.orders
ADD CONSTRAINT orders_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_orders_user_id
ON public.orders (user_id);
