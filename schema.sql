-- KhatuShyamji Smart Pilgrim Management System - Database Schema
-- Compatible with PostgreSQL / Supabase

-- ────────────────────────────────────────────────────────────────────────────
-- 1. Create Enums & Types
-- ────────────────────────────────────────────────────────────────────────────

CREATE TYPE booking_category_type AS ENUM ('solo', 'group');
CREATE TYPE booking_status_type AS ENUM ('upcoming', 'completed', 'cancelled', 'confirmed', 'pending');
CREATE TYPE hotel_status_type AS ENUM ('active', 'maintenance', 'closed');
CREATE TYPE parking_status_type AS ENUM ('open', 'full', 'closed');
CREATE TYPE severity_level_type AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE source_type AS ENUM ('AI', 'Google Maps', 'IoT', 'Manual');
CREATE TYPE lost_found_status_type AS ENUM ('registered', 'searching', 'possible-match', 'verification', 'ready-to-collect', 'collected');
CREATE TYPE approval_entity_type AS ENUM ('hotel-update', 'temple-info', 'announcement', 'service-listing', 'parking-info');
CREATE TYPE approval_status_type AS ENUM ('pending', 'approved', 'rejected');

-- Mock auth schema if not exists (for clean standalone testing)
CREATE SCHEMA IF NOT EXISTS auth;
CREATE TABLE IF NOT EXISTS auth.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ────────────────────────────────────────────────────────────────────────────
-- 2. Module A: Core Identity & Auth
-- ────────────────────────────────────────────────────────────────────────────

-- profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
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
CREATE TABLE IF NOT EXISTS public.admins (
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
CREATE TABLE IF NOT EXISTS public.roles (
    key VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL
);

-- admin_roles_bridge table
CREATE TABLE IF NOT EXISTS public.admin_roles_bridge (
    admin_id UUID REFERENCES public.admins(id) ON DELETE CASCADE,
    role_key VARCHAR(50) REFERENCES public.roles(key) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    PRIMARY KEY (admin_id, role_key)
);

-- ────────────────────────────────────────────────────────────────────────────
-- 3. Module B: Bookings & Stays
-- ────────────────────────────────────────────────────────────────────────────

-- darshan_bookings table
CREATE TABLE IF NOT EXISTS public.darshan_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_number VARCHAR(50) UNIQUE NOT NULL,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    booking_type booking_category_type NOT NULL,
    booking_date DATE NOT NULL,
    day_name VARCHAR(15) NOT NULL,
    visitor_count INT NOT NULL CHECK (visitor_count > 0),
    group_name VARCHAR(100) NULL,
    status booking_status_type DEFAULT 'upcoming' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT check_group_name CHECK (
        (booking_type = 'group' AND group_name IS NOT NULL) OR 
        (booking_type = 'solo' AND group_name IS NULL)
    )
);

-- darshan_booking_members table
CREATE TABLE IF NOT EXISTS public.darshan_booking_members (
    id BIGSERIAL PRIMARY KEY,
    booking_id UUID NOT NULL REFERENCES public.darshan_bookings(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    age INT NOT NULL CHECK (age >= 0 AND age <= 120),
    gender VARCHAR(20) NOT NULL,
    relationship VARCHAR(50) NULL,
    identity_proof_type VARCHAR(50) NULL,
    identity_proof_number VARCHAR(50) NULL,
    nationality VARCHAR(50) DEFAULT 'India' NOT NULL,
    is_child BOOLEAN DEFAULT false NOT NULL
);

-- hotels table
CREATE TABLE IF NOT EXISTS public.hotels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    stars INT NOT NULL CHECK (stars BETWEEN 1 AND 5),
    total_rooms INT NOT NULL CHECK (total_rooms > 0),
    price_range VARCHAR(50) NOT NULL,
    assigned_admin_id UUID NOT NULL REFERENCES public.admins(id) ON DELETE RESTRICT,
    status hotel_status_type DEFAULT 'active' NOT NULL,
    rating NUMERIC(2,1) DEFAULT 4.0 CHECK (rating BETWEEN 1.0 AND 5.0),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- hotel_bookings table
CREATE TABLE IF NOT EXISTS public.hotel_bookings (
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
    status booking_status_type DEFAULT 'upcoming' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- ────────────────────────────────────────────────────────────────────────────
-- 4. Module C: Infrastructure & Operations
-- ────────────────────────────────────────────────────────────────────────────

-- parking_blocks table
CREATE TABLE IF NOT EXISTS public.parking_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    block_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    total_capacity INT NOT NULL CHECK (total_capacity > 0),
    occupied INT DEFAULT 0 NOT NULL CHECK (occupied >= 0),
    status parking_status_type DEFAULT 'open' NOT NULL,
    assigned_admin_id UUID NOT NULL REFERENCES public.admins(id) ON DELETE RESTRICT,
    vehicle_types VARCHAR(50)[] NOT NULL,
    revenue_today INT DEFAULT 0 NOT NULL,
    shuttle_active BOOLEAN DEFAULT true NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT check_occupancy_limit CHECK (occupied <= total_capacity)
);

-- parking_history table
CREATE TABLE IF NOT EXISTS public.parking_history (
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
CREATE TABLE IF NOT EXISTS public.traffic_routes (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'smooth' NOT NULL,
    eta VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- traffic_alerts table
CREATE TABLE IF NOT EXISTS public.traffic_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_code VARCHAR(50) UNIQUE NOT NULL,
    route_id BIGINT NOT NULL REFERENCES public.traffic_routes(id) ON DELETE CASCADE,
    severity severity_level_type DEFAULT 'low' NOT NULL,
    message TEXT NOT NULL,
    source source_type DEFAULT 'Manual' NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    published_by_admin_id UUID NOT NULL REFERENCES public.admins(id) ON DELETE RESTRICT,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- ────────────────────────────────────────────────────────────────────────────
-- 5. Module D: Services & Commerce
-- ────────────────────────────────────────────────────────────────────────────

-- seva_masters table
CREATE TABLE IF NOT EXISTS public.seva_masters (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    price INT NOT NULL,
    description TEXT,
    total_slots INT NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL
);

-- seva_bookings table
CREATE TABLE IF NOT EXISTS public.seva_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_number VARCHAR(50) UNIQUE NOT NULL,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    seva_id BIGINT NOT NULL REFERENCES public.seva_masters(id) ON DELETE RESTRICT,
    booking_date DATE NOT NULL,
    devotee_name VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    amount INT NOT NULL,
    status booking_status_type DEFAULT 'confirmed' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- volunteer_applications table
CREATE TABLE IF NOT EXISTS public.volunteer_applications (
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
    status VARCHAR(20) DEFAULT 'pending' NOT NULL, -- pending, approved, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- donations table
CREATE TABLE IF NOT EXISTS public.donations (
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
CREATE TABLE IF NOT EXISTS public.prashad_items (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    price INT NOT NULL,
    weight_desc VARCHAR(50) NOT NULL,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL
);

-- prashad_orders table
CREATE TABLE IF NOT EXISTS public.prashad_orders (
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
CREATE TABLE IF NOT EXISTS public.prashad_order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES public.prashad_orders(id) ON DELETE CASCADE,
    prashad_id BIGINT NOT NULL REFERENCES public.prashad_items(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0)
);

-- transport_vehicles table
CREATE TABLE IF NOT EXISTS public.transport_vehicles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    capacity VARCHAR(20) NOT NULL,
    description TEXT,
    estimated_fare VARCHAR(50) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL
);

-- transport_bookings table
CREATE TABLE IF NOT EXISTS public.transport_bookings (
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
CREATE TABLE IF NOT EXISTS public.bus_routes (
    id BIGSERIAL PRIMARY KEY,
    from_city VARCHAR(100) NOT NULL,
    to_city VARCHAR(100) NOT NULL,
    departure_time VARCHAR(20) NOT NULL,
    fare INT NOT NULL,
    total_seats INT DEFAULT 40 NOT NULL
);

-- bus_bookings table
CREATE TABLE IF NOT EXISTS public.bus_bookings (
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
CREATE TABLE IF NOT EXISTS public.restaurants (
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
CREATE TABLE IF NOT EXISTS public.restaurant_reservations (
    id BIGSERIAL PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    restaurant_id BIGINT NOT NULL REFERENCES public.restaurants(id) ON DELETE RESTRICT,
    guest_name VARCHAR(100) NOT NULL,
    guest_phone VARCHAR(20) NOT NULL,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    people_count INT NOT NULL,
    status VARCHAR(50) DEFAULT 'confirmed' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- offering_items table
CREATE TABLE IF NOT EXISTS public.offering_items (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price INT NOT NULL,
    icon VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL
);

-- offering_orders table
CREATE TABLE IF NOT EXISTS public.offering_orders (
    id BIGSERIAL PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    total_amount INT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- offering_order_items table
CREATE TABLE IF NOT EXISTS public.offering_order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES public.offering_orders(id) ON DELETE CASCADE,
    offering_id BIGINT NOT NULL REFERENCES public.offering_items(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0)
);

-- ────────────────────────────────────────────────────────────────────────────
-- 6. Module E: Incidents & Support
-- ────────────────────────────────────────────────────────────────────────────

-- found_items table (dependency for lost_items)
CREATE TABLE IF NOT EXISTS public.found_items (
    id BIGSERIAL PRIMARY KEY,
    item_name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    location_found VARCHAR(100) NOT NULL,
    date_found DATE NOT NULL,
    status lost_found_status_type DEFAULT 'registered' NOT NULL,
    category_icon VARCHAR(50) DEFAULT 'PackageSearch' NOT NULL,
    item_color VARCHAR(50) NOT NULL,
    image_url TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- lost_items table
CREATE TABLE IF NOT EXISTS public.lost_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number VARCHAR(50) UNIQUE NOT NULL,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    item_name VARCHAR(150) NOT NULL,
    color_description TEXT NOT NULL,
    location_lost VARCHAR(100) NOT NULL,
    date_lost DATE NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    additional_details TEXT NULL,
    status lost_found_status_type DEFAULT 'registered' NOT NULL,
    assigned_admin_id UUID NULL REFERENCES public.admins(id) ON DELETE SET NULL,
    matched_found_item_id BIGINT NULL REFERENCES public.found_items(id) ON DELETE SET NULL,
    image_url TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- claim_history table
CREATE TABLE IF NOT EXISTS public.claim_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lost_item_id UUID NOT NULL REFERENCES public.lost_items(id) ON DELETE CASCADE,
    claimed_by_name VARCHAR(100) NOT NULL,
    identity_proof_type VARCHAR(50) NOT NULL,
    identity_proof_number VARCHAR(50) NOT NULL,
    collected_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    verified_by_admin_id UUID NOT NULL REFERENCES public.admins(id) ON DELETE RESTRICT
);

-- emergency_contacts table
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    icon VARCHAR(50) NOT NULL
);

-- emergency_requests table
CREATE TABLE IF NOT EXISTS public.emergency_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    incident_type VARCHAR(50) NOT NULL, -- medical, fire, crowd, security
    location_latitude NUMERIC(9,6) NOT NULL,
    location_longitude NUMERIC(9,6) NOT NULL,
    location_text TEXT NULL,
    status VARCHAR(50) DEFAULT 'pending' NOT NULL,
    assigned_admin_id UUID NULL REFERENCES public.admins(id) ON DELETE SET NULL,
    resolution_details TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE NULL
);

-- ────────────────────────────────────────────────────────────────────────────
-- 7. Module F: Temple Content & Feedback
-- ────────────────────────────────────────────────────────────────────────────

-- temple_information table
CREATE TABLE IF NOT EXISTS public.temple_information (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_key VARCHAR(50) UNIQUE NOT NULL, -- 'timings', 'guidelines', 'faqs', 'contacts'
    title VARCHAR(150) NOT NULL,
    content JSONB NOT NULL,
    last_updated_by_admin_id UUID NOT NULL REFERENCES public.admins(id) ON DELETE RESTRICT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    priority severity_level_type DEFAULT 'low' NOT NULL,
    target_audience VARCHAR(50) DEFAULT 'all' NOT NULL,
    status VARCHAR(50) DEFAULT 'published' NOT NULL,
    publish_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    expiry_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by_admin_id UUID NOT NULL REFERENCES public.admins(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- announcement_translations table
CREATE TABLE IF NOT EXISTS public.announcement_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    announcement_id UUID NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL, -- e.g., 'en', 'hi', 'gu'
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL
);

-- feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comments TEXT NULL,
    category VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' NOT NULL,
    admin_reply TEXT NULL,
    replied_by_admin_id UUID NULL REFERENCES public.admins(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- approval_queue table
CREATE TABLE IF NOT EXISTS public.approval_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type approval_entity_type NOT NULL,
    title VARCHAR(200) NOT NULL,
    submitted_by_admin_id UUID NOT NULL REFERENCES public.admins(id) ON DELETE CASCADE,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    status approval_status_type DEFAULT 'pending' NOT NULL,
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

-- ────────────────────────────────────────────────────────────────────────────
-- 8. Module G: Notifications & Devices
-- ────────────────────────────────────────────────────────────────────────────

-- device_tokens table
CREATE TABLE IF NOT EXISTS public.device_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    fcm_token TEXT UNIQUE NOT NULL,
    device_type VARCHAR(50) NOT NULL,
    platform VARCHAR(50) NOT NULL,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    action_url TEXT NULL,
    is_broadcast BOOLEAN DEFAULT false NOT NULL,
    target_role VARCHAR(50) NULL,
    created_by_admin_id UUID NOT NULL REFERENCES public.admins(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- notification_recipients table
CREATE TABLE IF NOT EXISTS public.notification_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
    profile_id UUID NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    admin_id UUID NULL REFERENCES public.admins(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT false NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE NULL
);

-- notification_logs table
CREATE TABLE IF NOT EXISTS public.notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
    recipient_token_id UUID NOT NULL REFERENCES public.device_tokens(id) ON DELETE CASCADE,
    delivery_status VARCHAR(50) NOT NULL,
    error_message TEXT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- ────────────────────────────────────────────────────────────────────────────
-- 9. Module H: Auditing & Scans
-- ────────────────────────────────────────────────────────────────────────────

-- qr_scans table
CREATE TABLE IF NOT EXISTS public.qr_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    darshan_booking_id UUID NOT NULL REFERENCES public.darshan_bookings(id) ON DELETE CASCADE,
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    validation_gate VARCHAR(50) NOT NULL,
    scanner_admin_id UUID NOT NULL REFERENCES public.admins(id) ON DELETE RESTRICT,
    scan_status VARCHAR(50) NOT NULL
);

-- audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id BIGSERIAL PRIMARY KEY,
    admin_id UUID NULL REFERENCES public.admins(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    department VARCHAR(50) NOT NULL,
    actor_name VARCHAR(100) NOT NULL,
    ip_address INET NULL, -- or VARCHAR(45) to support ipv4/ipv6 generally
    device_user_agent TEXT NULL,
    session_id UUID NULL,
    old_values JSONB NULL,
    new_values JSONB NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- ────────────────────────────────────────────────────────────────────────────
-- 10. Creation of Indexes for Performance
-- ────────────────────────────────────────────────────────────────────────────

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
CREATE INDEX IF NOT EXISTS idx_device_tokens_profile ON public.device_tokens(profile_id);
CREATE INDEX IF NOT EXISTS idx_notification_recipients_profile ON public.notification_recipients(profile_id);
CREATE INDEX IF NOT EXISTS idx_notification_recipients_admin ON public.notification_recipients(admin_id);
CREATE INDEX IF NOT EXISTS idx_qr_scans_booking ON public.qr_scans(darshan_booking_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 11. Custom Auth Helpers
-- ────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.create_pilgrim_user(p_name text, p_phone text, p_city text)
RETURNS uuid AS $$
DECLARE
    v_user_id uuid;
BEGIN
    -- Check if user already exists
    SELECT id INTO v_user_id FROM public.profiles WHERE phone = p_phone;
    IF v_user_id IS NOT NULL THEN
        RETURN v_user_id;
    END IF;

    -- Create user in mock auth.users table
    INSERT INTO auth.users (phone)
    VALUES (p_phone)
    RETURNING id INTO v_user_id;

    -- Create profile
    INSERT INTO public.profiles (id, name, phone, city)
    VALUES (v_user_id, p_name, p_phone, p_city);

    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

