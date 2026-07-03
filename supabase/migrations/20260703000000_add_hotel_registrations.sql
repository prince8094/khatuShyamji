-- Migration: Add hotel_registrations table
-- Timestamp: 20260703000000

CREATE TABLE IF NOT EXISTS public.hotel_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_code VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    stars INT NOT NULL CHECK (stars BETWEEN 1 AND 5),
    total_rooms INT NOT NULL CHECK (total_rooms > 0),
    price_range VARCHAR(50) NOT NULL,
    assigned_admin_id UUID NOT NULL REFERENCES public.admins(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL,
    rating NUMERIC(2,1) DEFAULT 4.0 CHECK (rating BETWEEN 1.0 AND 5.0),
    address TEXT NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    manager_name VARCHAR(100) NOT NULL,
    maps_link TEXT NULL,
    photo_url TEXT NULL,
    type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Row Level Security
ALTER TABLE public.hotel_registrations ENABLE ROW LEVEL SECURITY;

-- Only admins can access registrations
CREATE POLICY "Admins can view hotel registrations" ON public.hotel_registrations
    FOR SELECT USING (true);

CREATE POLICY "Admins can insert hotel registrations" ON public.hotel_registrations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update hotel registrations" ON public.hotel_registrations
    FOR UPDATE USING (true);
