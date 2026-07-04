-- Migration: Update Lost & Found schema and add claim_requests table
-- Timestamp: 20260704000000

-- Convert status columns to VARCHAR(50) to support all status progressions
ALTER TABLE public.found_items ALTER COLUMN status TYPE VARCHAR(50);
ALTER TABLE public.lost_items ALTER COLUMN status TYPE VARCHAR(50);

-- Add audit and details columns to found_items
ALTER TABLE public.found_items ADD COLUMN IF NOT EXISTS time_found VARCHAR(50) NULL;
ALTER TABLE public.found_items ADD COLUMN IF NOT EXISTS storage_location VARCHAR(150) NULL;
ALTER TABLE public.found_items ADD COLUMN IF NOT EXISTS found_by VARCHAR(150) NULL;
ALTER TABLE public.found_items ADD COLUMN IF NOT EXISTS remarks TEXT NULL;
ALTER TABLE public.found_items ADD COLUMN IF NOT EXISTS category VARCHAR(100) NULL;

-- Create claim_requests table to track devotee claims on found items
CREATE TABLE IF NOT EXISTS public.claim_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    found_item_id BIGINT NOT NULL REFERENCES public.found_items(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    claimant_name VARCHAR(100) NOT NULL,
    identity_proof_type VARCHAR(50) NOT NULL,
    identity_proof_number VARCHAR(50) NOT NULL,
    claim_description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL, -- pending, approved, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- RLS policies for claim_requests
ALTER TABLE public.claim_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS claim_select ON public.claim_requests;
CREATE POLICY claim_select ON public.claim_requests
    FOR SELECT USING (auth.uid() = profile_id OR public.is_admin());

DROP POLICY IF EXISTS claim_insert ON public.claim_requests;
CREATE POLICY claim_insert ON public.claim_requests
    FOR INSERT WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS claim_update ON public.claim_requests;
CREATE POLICY claim_update ON public.claim_requests
    FOR UPDATE USING (auth.uid() = profile_id OR public.is_admin());
