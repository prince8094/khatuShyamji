-- 1. Add alert_type, latitude, and longitude to traffic_alerts
ALTER TABLE public.traffic_alerts 
ADD COLUMN IF NOT EXISTS alert_type VARCHAR(50) DEFAULT 'closure' NOT NULL,
ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 8) NULL,
ADD COLUMN IF NOT EXISTS longitude NUMERIC(11, 8) NULL;

-- 2. Backfill existing alerts with default coordinate mappings (near Ringas Junction & Khatu Road)
UPDATE public.traffic_alerts
SET 
  latitude = 27.3512, 
  longitude = 75.5629, 
  alert_type = 'congestion'
WHERE alert_code = 'TRF-001';

UPDATE public.traffic_alerts
SET 
  latitude = 27.3602, 
  longitude = 75.4851, 
  alert_type = 'closure'
WHERE alert_code = 'TRF-002';
