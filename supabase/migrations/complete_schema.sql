-- ────────────────────────────────────────────────────────────────────────────
-- KHATU SHYAMJI E-SANCTUM COMPLETE DATABASE SCHEMA
-- Unified Migrations Build 2026-07-01
-- ────────────────────────────────────────────────────────────────────────────

-- 1. Drop existing structures cascadingly to ensure clean creation state
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_pilgrim_user(text, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.has_role(text) CASCADE;

DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.qr_scans CASCADE;
DROP TABLE IF EXISTS public.notification_logs CASCADE;
DROP TABLE IF EXISTS public.notification_recipients CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.device_tokens CASCADE;
DROP TABLE IF EXISTS public.approval_queue CASCADE;
DROP TABLE IF EXISTS public.feedback CASCADE;
DROP TABLE IF EXISTS public.claim_history CASCADE;
DROP TABLE IF EXISTS public.lost_items CASCADE;
DROP TABLE IF EXISTS public.found_items CASCADE;
DROP TABLE IF EXISTS public.emergency_requests CASCADE;
DROP TABLE IF EXISTS public.emergency_contacts CASCADE;
DROP TABLE IF EXISTS public.temple_information CASCADE;
DROP TABLE IF EXISTS public.announcement_translations CASCADE;
DROP TABLE IF EXISTS public.announcements CASCADE;
DROP TABLE IF EXISTS public.offering_order_items CASCADE;
DROP TABLE IF EXISTS public.offering_orders CASCADE;
DROP TABLE IF EXISTS public.offering_items CASCADE;
DROP TABLE IF EXISTS public.restaurant_reservations CASCADE;
DROP TABLE IF EXISTS public.restaurants CASCADE;
DROP TABLE IF EXISTS public.bus_bookings CASCADE;
DROP TABLE IF EXISTS public.bus_routes CASCADE;
DROP TABLE IF EXISTS public.transport_bookings CASCADE;
DROP TABLE IF EXISTS public.transport_vehicles CASCADE;
DROP TABLE IF EXISTS public.prashad_order_items CASCADE;
DROP TABLE IF EXISTS public.prashad_orders CASCADE;
DROP TABLE IF EXISTS public.prashad_items CASCADE;
DROP TABLE IF EXISTS public.donations CASCADE;
DROP TABLE IF EXISTS public.volunteer_applications CASCADE;
DROP TABLE IF EXISTS public.seva_bookings CASCADE;
DROP TABLE IF EXISTS public.seva_masters CASCADE;
DROP TABLE IF EXISTS public.traffic_alerts CASCADE;
DROP TABLE IF EXISTS public.traffic_routes CASCADE;
DROP TABLE IF EXISTS public.parking_history CASCADE;
DROP TABLE IF EXISTS public.parking_blocks CASCADE;
DROP TABLE IF EXISTS public.hotel_bookings CASCADE;
DROP TABLE IF EXISTS public.hotels CASCADE;
DROP TABLE IF EXISTS public.darshan_booking_members CASCADE;
DROP TABLE IF EXISTS public.darshan_bookings CASCADE;
DROP TABLE IF EXISTS public.admin_roles_bridge CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;
DROP TABLE IF EXISTS public.admins CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP TYPE IF EXISTS public.booking_category_type CASCADE;
DROP TYPE IF EXISTS public.booking_status_type CASCADE;
DROP TYPE IF EXISTS public.hotel_status_type CASCADE;
DROP TYPE IF EXISTS public.parking_status_type CASCADE;
DROP TYPE IF EXISTS public.severity_level_type CASCADE;
DROP TYPE IF EXISTS public.source_type CASCADE;
DROP TYPE IF EXISTS public.lost_found_status_type CASCADE;
DROP TYPE IF EXISTS public.approval_entity_type CASCADE;
DROP TYPE IF EXISTS public.approval_status_type CASCADE;

-- 2. Custom Types & Enums
CREATE TYPE public.booking_category_type AS ENUM ('solo', 'group');
CREATE TYPE public.booking_status_type AS ENUM ('upcoming', 'completed', 'cancelled', 'confirmed', 'pending');
CREATE TYPE public.hotel_status_type AS ENUM ('active', 'maintenance', 'closed');
CREATE TYPE public.parking_status_type AS ENUM ('open', 'full', 'closed');
CREATE TYPE public.severity_level_type AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.source_type AS ENUM ('AI', 'Google Maps', 'IoT', 'Manual');
CREATE TYPE public.lost_found_status_type AS ENUM ('registered', 'searching', 'possible-match', 'verification', 'ready-to-collect', 'collected');
CREATE TYPE public.approval_entity_type AS ENUM ('hotel-update', 'temple-info', 'announcement', 'service-listing', 'parking-info');
CREATE TYPE public.approval_status_type AS ENUM ('pending', 'approved', 'rejected');

-- 3. Schema Tables Definition

-- profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) NULL,
    address TEXT NULL,
    city VARCHAR(100) NULL,
    dob DATE NULL,
    gender VARCHAR(20) NULL,
    photo_url TEXT NULL,
    provider VARCHAR(50) DEFAULT 'google' NULL,
    last_login TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- admins table
CREATE TABLE public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    admin_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    initials VARCHAR(10) NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- roles table
CREATE TABLE public.roles (
    key VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL
);

-- admin_roles_bridge table
CREATE TABLE public.admin_roles_bridge (
    admin_id UUID REFERENCES public.admins(id) ON DELETE CASCADE,
    role_key VARCHAR(50) REFERENCES public.roles(key) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    PRIMARY KEY (admin_id, role_key)
);

-- darshan_bookings table
CREATE TABLE public.darshan_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_number VARCHAR(50) UNIQUE NOT NULL,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    booking_type public.booking_category_type NOT NULL,
    booking_date DATE NOT NULL,
    day_name VARCHAR(15) NOT NULL,
    visitor_count INT NOT NULL CHECK (visitor_count > 0),
    group_name VARCHAR(100) NULL,
    status public.booking_status_type DEFAULT 'upcoming' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT check_group_name CHECK (
        (booking_type = 'group' AND group_name IS NOT NULL) OR 
        (booking_type = 'solo' AND group_name IS NULL)
    )
);

-- darshan_booking_members table
CREATE TABLE public.darshan_booking_members (
    id BIGSERIAL PRIMARY KEY,
    booking_id UUID NOT NULL REFERENCES public.darshan_bookings(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    age INT NOT NULL CHECK (age >= 0 AND age <= 120),
    gender VARCHAR(20) NOT NULL,
    relationship VARCHAR(50) NULL,
    identity_proof_type VARCHAR(50) NULL,
    identity_proof_number VARCHAR(50) NULL,
    nationality VARCHAR(50) DEFAULT 'India' NOT NULL,
    is_child BOOLEAN DEFAULT false NOT NULL,
    passenger_id VARCHAR(50) NOT NULL,
    checked_in BOOLEAN DEFAULT false NOT NULL,
    checked_in_at TIMESTAMP WITH TIME ZONE NULL
);

-- hotels table
CREATE TABLE public.hotels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    stars INT NOT NULL CHECK (stars BETWEEN 1 AND 5),
    total_rooms INT NOT NULL CHECK (total_rooms > 0),
    price_range VARCHAR(50) NOT NULL,
    assigned_admin_id UUID NOT NULL REFERENCES public.admins(id) ON DELETE RESTRICT,
    status public.hotel_status_type DEFAULT 'active' NOT NULL,
    rating NUMERIC(2,1) DEFAULT 4.0 CHECK (rating BETWEEN 1.0 AND 5.0),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- hotel_registrations table
CREATE TABLE public.hotel_registrations (
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

-- hotel_bookings table
CREATE TABLE public.hotel_bookings (
    id BIGSERIAL PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE RESTRICT,
    guest_name VARCHAR(100) NOT NULL,
    guest_phone VARCHAR(20) NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NULL,
    nights_count INT DEFAULT 1 NOT NULL,
    guests_count INT NOT NULL CHECK (guests_count > 0),
    rooms_count INT NOT NULL CHECK (rooms_count > 0),
    status public.booking_status_type DEFAULT 'upcoming' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- parking_blocks table
CREATE TABLE public.parking_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    block_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    total_capacity INT NOT NULL CHECK (total_capacity > 0),
    occupied INT DEFAULT 0 NOT NULL CHECK (occupied >= 0),
    status public.parking_status_type DEFAULT 'open' NOT NULL,
    assigned_admin_id UUID NOT NULL REFERENCES public.admins(id) ON DELETE RESTRICT,
    vehicle_types VARCHAR(50)[] NOT NULL,
    revenue_today INT DEFAULT 0 NOT NULL,
    shuttle_active BOOLEAN DEFAULT true NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT check_occupancy_limit CHECK (occupied <= total_capacity)
);

-- parking_history table
CREATE TABLE public.parking_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    block_id UUID NOT NULL REFERENCES public.parking_blocks(id) ON DELETE CASCADE,
    total_capacity INT NOT NULL,
    occupied INT NOT NULL,
    entries_count INT DEFAULT 0 NOT NULL,
    exits_count INT DEFAULT 0 NOT NULL,
    cars_parked INT DEFAULT 0 NOT NULL,
    bikes_parked INT DEFAULT 0 NOT NULL,
    scooters_parked INT DEFAULT 0 NOT NULL,
    updated_by_admin_id UUID NOT NULL REFERENCES public.admins(id) ON DELETE RESTRICT,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- traffic_routes table
CREATE TABLE public.traffic_routes (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'smooth' NOT NULL,
    eta VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- traffic_alerts table
CREATE TABLE public.traffic_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_code VARCHAR(50) UNIQUE NOT NULL,
    route_id BIGINT NOT NULL REFERENCES public.traffic_routes(id) ON DELETE CASCADE,
    severity public.severity_level_type DEFAULT 'low' NOT NULL,
    message TEXT NOT NULL,
    source public.source_type DEFAULT 'Manual' NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    published_by_admin_id UUID NOT NULL REFERENCES public.admins(id) ON DELETE RESTRICT,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    latitude NUMERIC(9,6) NULL,
    longitude NUMERIC(9,6) NULL,
    alert_type VARCHAR(50) DEFAULT 'closure' NOT NULL
);

-- seva_masters table
CREATE TABLE public.seva_masters (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    price INT NOT NULL,
    description TEXT,
    total_slots INT NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL
);

-- seva_bookings table
CREATE TABLE public.seva_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_number VARCHAR(50) UNIQUE NOT NULL,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    seva_id BIGINT NOT NULL REFERENCES public.seva_masters(id) ON DELETE RESTRICT,
    booking_date DATE NOT NULL,
    devotee_name VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    amount INT NOT NULL,
    status public.booking_status_type DEFAULT 'confirmed' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- volunteer_applications table
CREATE TABLE public.volunteer_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    age INT NOT NULL CHECK (age >= 16),
    gender VARCHAR(20) NOT NULL,
    city VARCHAR(100) NOT NULL,
    preferred_role VARCHAR(100) NOT NULL,
    preferred_date DATE NOT NULL,
    preferred_time_slot VARCHAR(50) NOT NULL,
    experience TEXT NULL,
    reason TEXT NOT NULL,
    emergency_contact VARCHAR(100) NULL,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- donations table
CREATE TABLE public.donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donation_number VARCHAR(50) UNIQUE NOT NULL,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    donor_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    pan_number VARCHAR(20) NULL,
    amount INT NOT NULL CHECK (amount > 0),
    payment_mode VARCHAR(50) DEFAULT 'UPI' NOT NULL,
    purpose VARCHAR(100) NOT NULL,
    receipt_generated BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- prashad_items table
CREATE TABLE public.prashad_items (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    price INT NOT NULL,
    weight_desc VARCHAR(50) NOT NULL,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL
);

-- prashad_orders table
CREATE TABLE public.prashad_orders (
    id BIGSERIAL PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    total_amount INT NOT NULL,
    delivery_type VARCHAR(20) DEFAULT 'pickup',
    recipient_name VARCHAR(100) NOT NULL,
    recipient_phone VARCHAR(20) NOT NULL,
    shipping_address TEXT NULL,
    postal_code VARCHAR(10) NULL,
    status VARCHAR(50) DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- prashad_order_items table
CREATE TABLE public.prashad_order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES public.prashad_orders(id) ON DELETE CASCADE,
    prashad_id BIGINT NOT NULL REFERENCES public.prashad_items(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0)
);

-- transport_vehicles table
CREATE TABLE public.transport_vehicles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    capacity VARCHAR(20) NOT NULL,
    description TEXT,
    estimated_fare VARCHAR(50) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL
);

-- transport_bookings table
CREATE TABLE public.transport_bookings (
    id BIGSERIAL PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    vehicle_id BIGINT NOT NULL REFERENCES public.transport_vehicles(id) ON DELETE RESTRICT,
    devotee_name VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    pickup_point VARCHAR(100) NOT NULL,
    custom_pickup_address TEXT NULL,
    pickup_date DATE NOT NULL,
    pickup_time TIME NOT NULL,
    status VARCHAR(50) DEFAULT 'confirmed' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- bus_routes table
CREATE TABLE public.bus_routes (
    id BIGSERIAL PRIMARY KEY,
    from_city VARCHAR(100) NOT NULL,
    to_city VARCHAR(100) NOT NULL,
    departure_time VARCHAR(20) NOT NULL,
    fare INT NOT NULL,
    total_seats INT DEFAULT 40 NOT NULL
);

-- bus_bookings table
CREATE TABLE public.bus_bookings (
    id BIGSERIAL PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    bus_route_id BIGINT NOT NULL REFERENCES public.bus_routes(id) ON DELETE RESTRICT,
    devotee_name VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    travel_date DATE NOT NULL,
    seat_count INT NOT NULL CHECK (seat_count > 0 AND seat_count <= 6),
    status VARCHAR(50) DEFAULT 'confirmed' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- restaurants table
CREATE TABLE public.restaurants (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    rating NUMERIC(2,1) DEFAULT 4.0,
    distance VARCHAR(50) NOT NULL,
    image_url TEXT,
    reservations_required BOOLEAN DEFAULT false NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL
);

-- restaurant_reservations table
CREATE TABLE public.restaurant_reservations (
    id BIGSERIAL PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    restaurant_id BIGINT NOT NULL REFERENCES public.restaurants(id) ON DELETE RESTRICT,
    guest_name VARCHAR(100) NOT NULL,
    guest_phone VARCHAR(20) NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NULL,
    reservation_time TIME NOT NULL,
    people_count INT NOT NULL,
    status VARCHAR(50) DEFAULT 'confirmed' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- offering_items table
CREATE TABLE public.offering_items (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price INT NOT NULL,
    icon VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL
);

-- offering_orders table
CREATE TABLE public.offering_orders (
    id BIGSERIAL PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    total_amount INT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- offering_order_items table
CREATE TABLE public.offering_order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES public.offering_orders(id) ON DELETE CASCADE,
    offering_id BIGINT NOT NULL REFERENCES public.offering_items(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0)
);

-- found_items table
CREATE TABLE public.found_items (
    id BIGSERIAL PRIMARY KEY,
    item_name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    location_found VARCHAR(100) NOT NULL,
    date_found DATE NOT NULL,
    status public.lost_found_status_type DEFAULT 'registered' NOT NULL,
    category_icon VARCHAR(50) DEFAULT 'PackageSearch' NOT NULL,
    item_color VARCHAR(50) NOT NULL,
    image_url TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- lost_items table
CREATE TABLE public.lost_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number VARCHAR(50) UNIQUE NOT NULL,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    item_name VARCHAR(150) NOT NULL,
    color_description TEXT NOT NULL,
    location_lost VARCHAR(100) NOT NULL,
    date_lost DATE NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    additional_details TEXT NULL,
    status public.lost_found_status_type DEFAULT 'registered' NOT NULL,
    assigned_admin_id UUID NULL REFERENCES public.admins(id) ON DELETE SET NULL,
    matched_found_item_id BIGINT NULL REFERENCES public.found_items(id) ON DELETE SET NULL,
    image_url TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- claim_history table
CREATE TABLE public.claim_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lost_item_id UUID NOT NULL REFERENCES public.lost_items(id) ON DELETE CASCADE,
    claimed_by_name VARCHAR(100) NOT NULL,
    identity_proof_type VARCHAR(50) NOT NULL,
    identity_proof_number VARCHAR(50) NOT NULL,
    collected_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    verified_by_admin_id UUID NOT NULL REFERENCES public.admins(id) ON DELETE RESTRICT
);

-- emergency_contacts table
CREATE TABLE public.emergency_contacts (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    icon VARCHAR(50) NOT NULL
);

-- emergency_requests table
CREATE TABLE public.emergency_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    assigned_admin_id UUID NULL REFERENCES public.admins(id) ON DELETE SET NULL,
    incident_type VARCHAR(50) NOT NULL,
    location_latitude NUMERIC(9,6) NOT NULL,
    location_longitude NUMERIC(9,6) NOT NULL,
    location_text TEXT NULL,
    status VARCHAR(50) DEFAULT 'pending' NOT NULL,
    resolution_details TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE NULL
);

-- temple_information table
CREATE TABLE public.temple_information (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_key VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(150) NOT NULL,
    content JSONB NOT NULL,
    last_updated_by_admin_id UUID NOT NULL REFERENCES public.admins(id) ON DELETE RESTRICT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- announcements table
CREATE TABLE public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    priority public.severity_level_type DEFAULT 'low' NOT NULL,
    target_audience VARCHAR(50) DEFAULT 'all' NOT NULL,
    status VARCHAR(50) DEFAULT 'published' NOT NULL,
    publish_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    expiry_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by_admin_id UUID NOT NULL REFERENCES public.admins(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- announcement_translations table
CREATE TABLE public.announcement_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    announcement_id UUID NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL
);

-- approval_queue table
CREATE TABLE public.approval_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type public.approval_entity_type NOT NULL,
    title VARCHAR(200) NOT NULL,
    submitted_by_admin_id UUID NOT NULL REFERENCES public.admins(id) ON DELETE CASCADE,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    status public.approval_status_type DEFAULT 'pending' NOT NULL,
    department VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    draft_payload JSONB NOT NULL,
    approved_by_admin_id UUID NULL REFERENCES public.admins(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE NULL,
    rejected_by_admin_id UUID NULL REFERENCES public.admins(id) ON DELETE SET NULL,
    rejected_at TIMESTAMP WITH TIME ZONE NULL,
    rejection_reason TEXT NULL,
    review_notes TEXT NULL,
    version_number INT DEFAULT 1 NOT NULL
);

-- notifications table
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

-- qr_scans table
CREATE TABLE public.qr_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    darshan_booking_id UUID NOT NULL REFERENCES public.darshan_bookings(id) ON DELETE CASCADE,
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    validation_gate VARCHAR(50) NOT NULL,
    scanner_admin_id UUID NOT NULL REFERENCES public.admins(id) ON DELETE RESTRICT,
    scan_status VARCHAR(50) NOT NULL
);

-- audit_logs table
CREATE TABLE public.audit_logs (
    id BIGSERIAL PRIMARY KEY,
    admin_id UUID NULL REFERENCES public.admins(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    department VARCHAR(50) NOT NULL,
    actor_name VARCHAR(100) NOT NULL,
    ip_address INET NULL,
    device_user_agent TEXT NULL,
    session_id UUID NULL,
    old_values JSONB NULL,
    new_values JSONB NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 4. Indexes for Search Optimization
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_darshan_bookings_profile ON public.darshan_bookings(profile_id);
CREATE INDEX IF NOT EXISTS idx_darshan_bookings_date ON public.darshan_bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_darshan_booking_members_booking ON public.darshan_booking_members(booking_id);
CREATE INDEX IF NOT EXISTS idx_hotel_bookings_profile ON public.hotel_bookings(profile_id);
CREATE INDEX IF NOT EXISTS idx_hotel_bookings_hotel ON public.hotel_bookings(hotel_id);
CREATE INDEX IF NOT EXISTS idx_parking_history_block ON public.parking_history(block_id);
CREATE INDEX IF NOT EXISTS idx_traffic_alerts_route ON public.traffic_alerts(route_id);
CREATE INDEX IF NOT EXISTS idx_seva_bookings_profile ON public.seva_bookings(profile_id);
CREATE INDEX IF NOT EXISTS idx_donations_profile ON public.donations(profile_id);
CREATE INDEX IF NOT EXISTS idx_prashad_orders_profile ON public.prashad_orders(profile_id);
CREATE INDEX IF NOT EXISTS idx_prashad_order_items_order ON public.prashad_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_lost_items_profile ON public.lost_items(profile_id);
CREATE INDEX IF NOT EXISTS idx_emergency_requests_profile ON public.emergency_requests(profile_id);
CREATE INDEX IF NOT EXISTS idx_announcement_translations_ann ON public.announcement_translations(announcement_id);
CREATE INDEX IF NOT EXISTS idx_approval_queue_status ON public.approval_queue(status);
CREATE INDEX IF NOT EXISTS idx_qr_scans_booking ON public.qr_scans(darshan_booking_id);
CREATE INDEX IF NOT EXISTS idx_notifications_profile ON public.notifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);

-- 5. Row-Level Security (RLS) Configuration
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_roles_bridge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.darshan_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.darshan_booking_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotel_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.traffic_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.traffic_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seva_masters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seva_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prashad_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prashad_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prashad_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bus_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bus_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offering_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offering_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offering_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.found_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lost_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temple_information ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 6. Custom Database Helper Functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  BEGIN
    INSERT INTO public.profiles (id, name, phone, email, city, provider)
    VALUES (
      new.id,
      coalesce(new.raw_user_meta_data->>'name', 'Pilgrim'),
      coalesce(new.phone, '+99' || floor(random() * 9000000000 + 1000000000)::text),
      coalesce(new.email, ''),
      coalesce(new.raw_user_meta_data->>'city', ''),
      'google'
    )
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Database trigger handle_new_user failed: %', SQLERRM;
  END;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.create_pilgrim_user(p_name text, p_phone text, p_city text)
RETURNS uuid AS $$
DECLARE
    v_user_id uuid;
BEGIN
    SELECT id INTO v_user_id FROM public.profiles WHERE phone = p_phone;
    IF v_user_id IS NOT NULL THEN
        RETURN v_user_id;
    END IF;

    INSERT INTO auth.users (phone)
    VALUES (p_phone)
    RETURNING id INTO v_user_id;

    INSERT INTO public.profiles (id, name, phone, city)
    VALUES (v_user_id, p_name, p_phone, p_city);

    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins
    WHERE auth_user_id = auth.uid() AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.has_role(p_role_key text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins a
    JOIN public.admin_roles_bridge b ON a.id = b.admin_id
    WHERE a.auth_user_id = auth.uid() AND a.is_active = true AND b.role_key = p_role_key
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. RBAC Policies
CREATE POLICY profiles_select ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY profiles_insert ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY profiles_update ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());

CREATE POLICY admins_select ON public.admins FOR SELECT USING (public.is_admin());
CREATE POLICY admins_all ON public.admins FOR ALL USING (public.has_role('super-admin'));
CREATE POLICY roles_select ON public.roles FOR SELECT USING (true);
CREATE POLICY roles_all ON public.roles FOR ALL USING (public.has_role('super-admin'));
CREATE POLICY bridge_select ON public.admin_roles_bridge FOR SELECT USING (public.is_admin());
CREATE POLICY bridge_all ON public.admin_roles_bridge FOR ALL USING (public.has_role('super-admin'));

CREATE POLICY darshan_bookings_select ON public.darshan_bookings FOR SELECT USING (auth.uid() = profile_id OR public.is_admin());
CREATE POLICY darshan_bookings_insert ON public.darshan_bookings FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY darshan_bookings_update ON public.darshan_bookings FOR UPDATE USING (auth.uid() = profile_id OR public.is_admin());

CREATE POLICY members_select ON public.darshan_booking_members FOR SELECT USING (EXISTS (SELECT 1 FROM public.darshan_bookings b WHERE b.id = booking_id AND (b.profile_id = auth.uid() OR public.is_admin())));
CREATE POLICY members_insert ON public.darshan_booking_members FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.darshan_bookings b WHERE b.id = booking_id AND b.profile_id = auth.uid()));
CREATE POLICY members_update ON public.darshan_booking_members FOR UPDATE USING (EXISTS (SELECT 1 FROM public.darshan_bookings b WHERE b.id = booking_id AND (b.profile_id = auth.uid() OR public.is_admin())));

CREATE POLICY hotel_select ON public.hotels FOR SELECT USING (true);
CREATE POLICY hotel_all ON public.hotels FOR ALL USING (public.is_admin());
CREATE POLICY hotel_bookings_select ON public.hotel_bookings FOR SELECT USING (auth.uid() = profile_id OR public.is_admin());
CREATE POLICY hotel_bookings_insert ON public.hotel_bookings FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY hotel_bookings_update ON public.hotel_bookings FOR UPDATE USING (auth.uid() = profile_id OR public.is_admin());

CREATE POLICY parking_select ON public.parking_blocks FOR SELECT USING (true);
CREATE POLICY parking_all ON public.parking_blocks FOR ALL USING (public.is_admin());
CREATE POLICY p_hist_all ON public.parking_history FOR ALL USING (public.is_admin());
CREATE POLICY traffic_select ON public.traffic_routes FOR SELECT USING (true);
CREATE POLICY traffic_all ON public.traffic_routes FOR ALL USING (public.is_admin());
CREATE POLICY alerts_select ON public.traffic_alerts FOR SELECT USING (true);
CREATE POLICY alerts_all ON public.traffic_alerts FOR ALL USING (public.is_admin());

CREATE POLICY seva_select ON public.seva_masters FOR SELECT USING (true);
CREATE POLICY seva_all ON public.seva_masters FOR ALL USING (public.is_admin());
CREATE POLICY seva_bookings_select ON public.seva_bookings FOR SELECT USING (auth.uid() = profile_id OR public.is_admin());
CREATE POLICY seva_bookings_insert ON public.seva_bookings FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY seva_bookings_update ON public.seva_bookings FOR UPDATE USING (auth.uid() = profile_id OR public.is_admin());

CREATE POLICY volunteer_select ON public.volunteer_applications FOR SELECT USING (auth.uid() = profile_id OR public.is_admin());
CREATE POLICY volunteer_insert ON public.volunteer_applications FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY volunteer_update ON public.volunteer_applications FOR UPDATE USING (auth.uid() = profile_id OR public.is_admin());

CREATE POLICY donations_select ON public.donations FOR SELECT USING (auth.uid() = profile_id OR public.is_admin());
CREATE POLICY donations_insert ON public.donations FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY prasad_items_select ON public.prashad_items FOR SELECT USING (true);
CREATE POLICY prasad_items_all ON public.prashad_items FOR ALL USING (public.is_admin());
CREATE POLICY prasad_orders_select ON public.prashad_orders FOR SELECT USING (auth.uid() = profile_id OR public.is_admin());
CREATE POLICY prasad_orders_insert ON public.prashad_orders FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY prasad_orders_update ON public.prashad_orders FOR UPDATE USING (auth.uid() = profile_id OR public.is_admin());
CREATE POLICY prasad_items_link ON public.prashad_order_items FOR ALL USING (EXISTS (SELECT 1 FROM public.prashad_orders o WHERE o.id = order_id AND (o.profile_id = auth.uid() OR public.is_admin())));

CREATE POLICY trans_vehicles_select ON public.transport_vehicles FOR SELECT USING (true);
CREATE POLICY trans_vehicles_all ON public.transport_vehicles FOR ALL USING (public.is_admin());
CREATE POLICY trans_bookings_select ON public.transport_bookings FOR SELECT USING (auth.uid() = profile_id OR public.is_admin());
CREATE POLICY trans_bookings_insert ON public.transport_bookings FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY trans_bookings_update ON public.transport_bookings FOR UPDATE USING (auth.uid() = profile_id OR public.is_admin());

CREATE POLICY bus_select ON public.bus_routes FOR SELECT USING (true);
CREATE POLICY bus_all ON public.bus_routes FOR ALL USING (public.is_admin());
CREATE POLICY bus_bookings_select ON public.bus_bookings FOR SELECT USING (auth.uid() = profile_id OR public.is_admin());
CREATE POLICY bus_bookings_insert ON public.bus_bookings FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY bus_bookings_update ON public.bus_bookings FOR UPDATE USING (auth.uid() = profile_id OR public.is_admin());

CREATE POLICY rest_select ON public.restaurants FOR SELECT USING (true);
CREATE POLICY rest_all ON public.restaurants FOR ALL USING (public.is_admin());
CREATE POLICY rest_bookings_select ON public.restaurant_reservations FOR SELECT USING (auth.uid() = profile_id OR public.is_admin());
CREATE POLICY rest_bookings_insert ON public.restaurant_reservations FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY rest_bookings_update ON public.restaurant_reservations FOR UPDATE USING (auth.uid() = profile_id OR public.is_admin());

CREATE POLICY offerings_items_select ON public.offering_items FOR SELECT USING (true);
CREATE POLICY offerings_items_all ON public.offering_items FOR ALL USING (public.is_admin());
CREATE POLICY offerings_orders_select ON public.offering_orders FOR SELECT USING (auth.uid() = profile_id OR public.is_admin());
CREATE POLICY offerings_orders_insert ON public.offering_orders FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY offerings_orders_update ON public.offering_orders FOR UPDATE USING (auth.uid() = profile_id OR public.is_admin());
CREATE POLICY offerings_items_link ON public.offering_order_items FOR ALL USING (EXISTS (SELECT 1 FROM public.offering_orders o WHERE o.id = order_id AND (o.profile_id = auth.uid() OR public.is_admin())));

CREATE POLICY found_select ON public.found_items FOR SELECT USING (true);
CREATE POLICY found_all ON public.found_items FOR ALL USING (public.is_admin());
CREATE POLICY lost_select ON public.lost_items FOR SELECT USING (auth.uid() = profile_id OR public.is_admin());
CREATE POLICY lost_insert ON public.lost_items FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY lost_update ON public.lost_items FOR UPDATE USING (auth.uid() = profile_id OR public.is_admin());
CREATE POLICY claims_all ON public.claim_history FOR ALL USING (public.is_admin());

CREATE POLICY emergency_select ON public.emergency_requests FOR SELECT USING (auth.uid() = profile_id OR public.is_admin());
CREATE POLICY emergency_insert ON public.emergency_requests FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY emergency_update ON public.emergency_requests FOR UPDATE USING (auth.uid() = profile_id OR public.is_admin());

CREATE POLICY info_select ON public.temple_information FOR SELECT USING (true);
CREATE POLICY info_all ON public.temple_information FOR ALL USING (public.is_admin());
CREATE POLICY ann_select ON public.announcements FOR SELECT USING (status = 'published' OR public.is_admin());
CREATE POLICY ann_all ON public.announcements FOR ALL USING (public.is_admin());
CREATE POLICY ann_trans_select ON public.announcement_translations FOR SELECT USING (true);
CREATE POLICY ann_trans_all ON public.announcement_translations FOR ALL USING (public.is_admin());

CREATE POLICY approval_all ON public.approval_queue FOR ALL USING (public.is_admin());

CREATE POLICY notifications_select ON public.notifications 
    FOR SELECT USING (auth.uid() = profile_id OR profile_id IS NULL OR public.is_admin());
CREATE POLICY notifications_insert ON public.notifications 
    FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY notifications_update ON public.notifications 
    FOR UPDATE USING (auth.uid() = profile_id OR public.is_admin());

CREATE POLICY scans_all ON public.qr_scans FOR ALL USING (public.is_admin());
CREATE POLICY audits_all ON public.audit_logs FOR ALL USING (public.is_admin());

-- 8. Storage Buckets Creation
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('lost-found-images', 'lost-found-images', true),
  ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Select for lost-found-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'lost-found-images');
CREATE POLICY "Authenticated Insert for lost-found-images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'lost-found-images');
CREATE POLICY "Admins Delete for lost-found-images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'lost-found-images' AND public.is_admin());

CREATE POLICY "Public Select for profile-photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-photos');
CREATE POLICY "Owner All for profile-photos" ON storage.objects
  FOR ALL TO authenticated USING (bucket_id = 'profile-photos' AND (owner::text = auth.uid()::text OR public.is_admin()));

-- 9. Seed Configuration Data
INSERT INTO public.roles (key, name, description)
VALUES
  ('super-admin', 'Temple Operations Command Center', 'Full operational oversight & system control'),
  ('accommodation', 'Accommodation Management', 'Manage hotels, rooms & bookings'),
  ('parking', 'Parking Management', 'Parking blocks, capacity & shuttle ops'),
  ('traffic', 'Traffic Operations', 'Route monitoring & traffic alerts'),
  ('lost-found', 'Lost & Found', 'Item recovery & devotee assistance'),
  ('temple-info', 'Temple Information', 'Content, timings & guidelines'),
  ('donation', 'Donation Management', 'Donations, receipts & campaigns'),
  ('emergency', 'Emergency Operations', 'Alerts, incidents & crowd control'),
  ('commerce', 'Commerce Management', 'Manage transport, dining, prasad & offerings bookings')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.admins (id, admin_code, name, phone, email, initials, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'ADM-001',
  'Nand Kumar',
  '+91 98290 10001',
  'nand@khatushyamji.org',
  'NK',
  true
)
ON CONFLICT (admin_code) DO NOTHING;

INSERT INTO public.admin_roles_bridge (admin_id, role_key)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'super-admin'),
  ('00000000-0000-0000-0000-000000000001', 'commerce'),
  ('00000000-0000-0000-0000-000000000001', 'accommodation'),
  ('00000000-0000-0000-0000-000000000001', 'parking'),
  ('00000000-0000-0000-0000-000000000001', 'traffic'),
  ('00000000-0000-0000-0000-000000000001', 'lost-found'),
  ('00000000-0000-0000-0000-000000000001', 'temple-info'),
  ('00000000-0000-0000-0000-000000000001', 'donation'),
  ('00000000-0000-0000-0000-000000000001', 'emergency')
ON CONFLICT DO NOTHING;

INSERT INTO public.seva_masters (id, name, time_slot, price, description, total_slots)
VALUES
  (1, 'Chappan Bhog', '12:00 PM - 01:00 PM', 5100, 'Offering of 56 sacred food items to Lord Shyam.', 5),
  (2, 'Shringar Seva', '08:00 AM - 09:00 AM', 2100, 'Lord Shyam floral dress decoration offering.', 10),
  (3, 'Maha Aarti sponsor', '07:30 PM - 08:30 PM', 11000, 'VIP participation in evening Sandhya Maha Aarti.', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.transport_vehicles (id, name, capacity, description, estimated_fare, icon)
VALUES
  (1, 'Sedan Cab (AC)', '4 Devotees', 'Comfortable 4-seater cab. Perfect for small families.', '₹1,800 approx', 'Car'),
  (2, 'SUV (AC) - Innova / Ertiga', '6-7 Devotees', 'Spacious 6-7 seater. Best for larger groups & luggage.', '₹2,600 approx', 'CarFront'),
  (3, 'E-Rickshaw / Auto', '3-5 Devotees', 'Available for local shuttle from Ringas Junction to Khatu Dham.', '₹50/seat or ₹300 full', 'Shuffle')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.bus_routes (id, from_city, to_city, departure_time, fare, total_seats)
VALUES
  (1, 'Jaipur Sindhi Camp', 'Khatu Dham Gate 3', '06:00 AM', 120, 40),
  (2, 'Ringas Junction Stn', 'Khatu Dham Gate 3', 'Continuous', 30, 40),
  (3, 'Delhi Kashmiri Gate', 'Khatu Dham Gate 3', '08:00 PM', 550, 40)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.restaurants (id, name, description, rating, distance, image_url, reservations_required)
VALUES
  (1, 'Shyam Rasoi (Trust Bhandara)', 'Desi Ghee Churma, Dal Bati, Kadhi. Traditional bhojan.', 4.9, '500m from Temple', 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=300&auto=format&fit=crop&q=60', false),
  (2, 'Radhey Haveli Restaurant', 'Royal Rajasthani Thali (Unlimited premium).', 4.8, '1km from Temple', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=300&auto=format&fit=crop&q=60', true),
  (3, 'Baba Shyam Bhojanalaya', 'Tandoori Roti, Shahi Paneer, Dal Fry dhaba meals.', 4.5, '1.5km from Temple', 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=300&auto=format&fit=crop&q=60', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.offering_items (id, name, description, price, icon)
VALUES
  (1, 'Flower Garland', 'Fresh marigold garland for the deity', 50, 'Flower'),
  (2, 'Coconut', 'Sacred coconut for offering', 30, 'Circle'),
  (3, 'Incense Pack', 'Premium incense sticks (20 pcs)', 40, 'Wind'),
  (4, 'Chunri (Red)', 'Auspicious red cloth offering', 150, 'Shirt'),
  (5, 'Diyas (5 pcs)', 'Clay lamps for evening aarti', 25, 'Sun'),
  (6, 'Puja Thali', 'Complete thali with all essentials', 200, 'LayoutGrid')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.prashad_items (id, name, price, weight_desc, description, image_url)
VALUES
  (1, 'Desi Ghee Churma Prashad', 320, '500g Box', 'Traditional sweet prasad prepared in pure desi ghee.', 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=300&auto=format&fit=crop&q=60'),
  (2, 'Makhan Mishri & dry fruits', 180, '250g Box', 'Shri Krishna favorite makhan mishri with almonds & cashews.', 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=300&auto=format&fit=crop&q=60'),
  (3, 'Baba Shyam Khazana', 650, 'Gift Box', 'Blessed silver coin, dry fruits, and incense sticks.', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=300&auto=format&fit=crop&q=60')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.parking_blocks (id, block_code, name, total_capacity, occupied, status, assigned_admin_id, vehicle_types, revenue_today, shuttle_active)
VALUES
  ('00000000-0000-0000-0000-000000000010', 'PKG-A', 'Parking Block A', 500, 420, 'open', '00000000-0000-0000-0000-000000000001', ARRAY['Car', 'SUV'], 42000, true),
  ('00000000-0000-0000-0000-000000000011', 'PKG-B', 'Parking Block B', 400, 320, 'open', '00000000-0000-0000-0000-000000000001', ARRAY['Car', 'SUV', 'Bus'], 38000, true),
  ('00000000-0000-0000-0000-000000000012', 'PKG-C', 'Parking Block C', 300, 300, 'full', '00000000-0000-0000-0000-000000000001', ARRAY['Two-Wheeler'], 15000, false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.traffic_routes (id, name, status, eta)
VALUES
  (1, 'NH-148D (Jaipur → Khatu)', 'moderate', '1h 55m'),
  (2, 'Sikar Road', 'smooth', '1h 35m'),
  (3, 'Temple Approach Road', 'congested', '45m'),
  (4, 'NH-148D (Delhi → Khatu)', 'smooth', '6h 10m')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.hotels (id, hotel_code, name, stars, total_rooms, price_range, assigned_admin_id, status, rating)
VALUES
  ('00000000-0000-0000-0000-000000000020', 'HTL-001', 'Shyam Palace', 4, 120, '₹2,500 – ₹6,000', '00000000-0000-0000-0000-000000000001', 'active', 4.5),
  ('00000000-0000-0000-0000-000000000021', 'HTL-002', 'Khatu Dham Residency', 3, 80, '₹1,200 – ₹3,500', '00000000-0000-0000-0000-000000000001', 'active', 4.2),
  ('00000000-0000-0000-0000-000000000022', 'HTL-003', 'Bhakti Niwas', 3, 60, '₹800 – ₹2,000', '00000000-0000-0000-0000-000000000001', 'active', 4.0)
ON CONFLICT (id) DO NOTHING;

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
