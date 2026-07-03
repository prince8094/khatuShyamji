-- 1. Enable Row-Level Security (RLS) on notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 2. Establish RLS Security Access Policies
-- SELECT: Devotees select their own profile records or global announcements
CREATE POLICY notifications_select ON public.notifications 
    FOR SELECT USING (auth.uid() = profile_id OR profile_id IS NULL OR public.is_admin());

-- INSERT: Restrict inserts to administrators
CREATE POLICY notifications_insert ON public.notifications 
    FOR INSERT WITH CHECK (public.is_admin());

-- UPDATE: Admins edit anything; devotees update is_read statuses
CREATE POLICY notifications_update ON public.notifications 
    FOR UPDATE USING (auth.uid() = profile_id OR public.is_admin());

-- 3. Drop dead/unused tables to clean production schema
DROP TABLE IF EXISTS public.feedback CASCADE;
DROP TABLE IF EXISTS public.device_tokens CASCADE;
