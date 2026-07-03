-- 1. Add checked_in column to darshan_booking_members
ALTER TABLE public.darshan_booking_members 
ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT false NOT NULL;

-- 2. Add checked_in_at column to darshan_booking_members
ALTER TABLE public.darshan_booking_members 
ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP WITH TIME ZONE NULL;

-- 3. Add passenger_id column to darshan_booking_members
ALTER TABLE public.darshan_booking_members 
ADD COLUMN IF NOT EXISTS passenger_id VARCHAR(50) UNIQUE NULL;

-- 4. Backfill existing members with custom passenger_id (e.g. PX-00001 etc.)
-- We set it to PX- followed by the auto-increment ID
UPDATE public.darshan_booking_members
SET passenger_id = 'PX-' || LPAD(id::text, 6, '0')
WHERE passenger_id IS NULL;

-- 5. Make passenger_id NOT NULL after backfill
ALTER TABLE public.darshan_booking_members 
ALTER COLUMN passenger_id SET NOT NULL;
