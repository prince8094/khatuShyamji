-- Database upgrade for Traffic Routes & Dynamic Parking Blocks

-- 1. Upgrade traffic_routes
ALTER TABLE public.traffic_routes ADD COLUMN IF NOT EXISTS origin VARCHAR(150);
ALTER TABLE public.traffic_routes ADD COLUMN IF NOT EXISTS destination VARCHAR(150);
ALTER TABLE public.traffic_routes ADD COLUMN IF NOT EXISTS coordinates JSONB;
ALTER TABLE public.traffic_routes ADD COLUMN IF NOT EXISTS congestion_level VARCHAR(50) DEFAULT 'smooth';
ALTER TABLE public.traffic_routes ADD COLUMN IF NOT EXISTS alert_count INT DEFAULT 0;
ALTER TABLE public.traffic_routes ADD COLUMN IF NOT EXISTS google_maps_polyline TEXT;
ALTER TABLE public.traffic_routes ADD COLUMN IF NOT EXISTS google_maps_url TEXT;
ALTER TABLE public.traffic_routes ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;

-- 2. Backfill coordinates and meta for seeded routes
UPDATE public.traffic_routes SET
  origin = 'Jaipur',
  destination = 'Khatu',
  coordinates = '[{"lat": 27.3512, "lng": 75.5629}, {"lat": 27.3565, "lng": 75.5280}, {"lat": 27.3602, "lng": 75.4851}, {"lat": 27.3650, "lng": 75.4815}, {"lat": 27.3672, "lng": 75.4795}, {"lat": 27.3693, "lng": 75.4746}]'::jsonb,
  congestion_level = 'moderate',
  google_maps_url = 'https://www.google.com/maps/dir/?api=1&origin=Jaipur&destination=Shree+Khatu+Shyam+Ji+Temple+Khatu'
WHERE name = 'NH-148D (Jaipur → Khatu)' OR id = 1;

UPDATE public.traffic_routes SET
  origin = 'Sikar',
  destination = 'Khatu',
  coordinates = '[{"lat": 27.3512, "lng": 75.5629}, {"lat": 27.3540, "lng": 75.5350}, {"lat": 27.3750, "lng": 75.4900}, {"lat": 27.3768, "lng": 75.4810}, {"lat": 27.3730, "lng": 75.4760}]'::jsonb,
  congestion_level = 'smooth',
  google_maps_url = 'https://www.google.com/maps/dir/?api=1&origin=Sikar&destination=Shree+Khatu+Shyam+Ji+Temple+Khatu'
WHERE name = 'Sikar Road' OR id = 2;

UPDATE public.traffic_routes SET
  origin = 'Ringas Junction',
  destination = 'Khatu Temple Gate',
  coordinates = '[{"lat": 27.3512, "lng": 75.5629}, {"lat": 27.3565, "lng": 75.5280}, {"lat": 27.3602, "lng": 75.4851}, {"lat": 27.3693, "lng": 75.4746}]'::jsonb,
  congestion_level = 'heavy',
  google_maps_url = 'https://www.google.com/maps/dir/?api=1&origin=Ringas+Junction&destination=Shree+Khatu+Shyam+Ji+Temple+Khatu'
WHERE name = 'Temple Approach Road' OR id = 3;

UPDATE public.traffic_routes SET
  origin = 'Delhi',
  destination = 'Khatu',
  coordinates = '[{"lat": 27.3512, "lng": 75.5629}, {"lat": 27.3550, "lng": 75.5200}, {"lat": 27.3602, "lng": 75.4851}, {"lat": 27.3638, "lng": 75.4925}]'::jsonb,
  congestion_level = 'smooth',
  google_maps_url = 'https://www.google.com/maps/dir/?api=1&origin=Delhi&destination=Shree+Khatu+Shyam+Ji+Temple+Khatu'
WHERE name = 'NH-148D (Delhi → Khatu)' OR id = 4;


-- 3. Upgrade parking_blocks table
ALTER TABLE public.parking_blocks ALTER COLUMN assigned_admin_id DROP NOT NULL;
ALTER TABLE public.parking_blocks ADD COLUMN IF NOT EXISTS manager_name VARCHAR(100);
ALTER TABLE public.parking_blocks ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 8);
ALTER TABLE public.parking_blocks ADD COLUMN IF NOT EXISTS longitude NUMERIC(11, 8);
ALTER TABLE public.parking_blocks ADD COLUMN IF NOT EXISTS google_maps_url TEXT;

-- 4. Backfill parking block meta
UPDATE public.parking_blocks SET
  latitude = 27.3602,
  longitude = 75.4851,
  manager_name = 'Vikram Singh',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=27.3602,75.4851'
WHERE block_code = 'PKG-A';

UPDATE public.parking_blocks SET
  latitude = 27.3638,
  longitude = 75.4925,
  manager_name = 'Vijay Kumar Gupta',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=27.3638,75.4925'
WHERE block_code = 'PKG-B';

UPDATE public.parking_blocks SET
  latitude = 27.3550,
  longitude = 75.5200,
  manager_name = 'Vikram Singh',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=27.3550,75.5200'
WHERE block_code = 'PKG-C';
