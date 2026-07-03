-- Drop conflicting tables cascadingly first
DROP TABLE IF EXISTS public.notification_logs CASCADE;
DROP TABLE IF EXISTS public.notification_recipients CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;

-- 1. Create notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title_en VARCHAR(150) NOT NULL,
    title_hi VARCHAR(150) NOT NULL,
    body_en TEXT NOT NULL,
    body_hi TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    icon VARCHAR(50) DEFAULT 'Bell' NOT NULL,
    tone VARCHAR(20) DEFAULT 'success' NOT NULL,
    is_read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 2. Index profile_id for user query performance
CREATE INDEX IF NOT EXISTS idx_notifications_profile ON public.notifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);

-- 3. Populate default initial notifications for devotees
INSERT INTO public.notifications (title_en, title_hi, body_en, body_hi, type, icon, tone)
VALUES 
(
  'Welcome to Khatu Shyam Ji E-Sanctum', 
  'खाटू श्याम जी ई-गर्भगृह में आपका स्वागत है', 
  'Explore temple routes, booking status logs, local transport lines, and emergency support tools directly from the app.',
  'ऐप से सीधे मंदिर मार्ग, बुकिंग स्थिति लॉग, स्थानीय परिवहन मार्ग और आपातकालीन सहायता टूल का अन्वेषण करें।',
  'temple', 
  'Bell', 
  'info'
),
(
  'Monsoon Advisory', 
  'मानसून एडवाइजरी', 
  'Devotees are advised to carry umbrellas and follow specific rain shelter pathways designated near VIP Gate 3.',
  'श्रद्धालुओं को सलाह दी जाती है कि वे छाते साथ रखें और वीआईपी गेट 3 के पास बने रेन शेल्टरों का उपयोग करें।',
  'temple', 
  'CloudRain', 
  'warning'
);
