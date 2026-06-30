# Smart Pilgrim Management System - Logical Database Structure & ERD (Phase 2)

This document contains the structural definition of all tables, fields, constraints, and relationships in the Smart Pilgrim Management System. The design uses standard UUID primary keys and incorporates all production readiness requirements.

---

## 1. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    auth_users {
        uuid id PK
        string email
        string phone
    }
    profiles {
        uuid id PK, FK "auth.users.id"
        string name
        string phone "unique"
        string email
        text address
        date dob
        string gender
        text photo_url
        timestamp created_at
        timestamp updated_at
    }
    admins {
        uuid id PK
        uuid auth_user_id FK "auth.users.id"
        string admin_code "unique"
        string name
        string phone
        string email "unique"
        string initials
        boolean is_active
        timestamp last_login
        timestamp created_at
    }
    roles {
        string key PK
        string name
        text description
    }
    admin_roles_bridge {
        uuid admin_id PK, FK "admins.id"
        string role_key PK, FK "roles.key"
        timestamp assigned_at
    }
    darshan_bookings {
        uuid id PK
        uuid profile_id FK "profiles.id"
        string booking_number "unique"
        string booking_type "solo / group"
        date booking_date
        string day_name
        int visitor_count
        string group_name
        string status "upcoming / completed / cancelled"
        timestamp created_at
        timestamp updated_at
    }
    darshan_booking_members {
        bigint id PK
        uuid booking_id FK "darshan_bookings.id"
        string name
        int age
        string gender
        string relationship
        string identity_proof_type
        string identity_proof_number
        string nationality
        boolean is_child
    }
    hotels {
        uuid id PK
        string hotel_code "unique"
        string name
        int stars
        int total_rooms
        string price_range
        uuid assigned_admin_id FK "admins.id"
        string status "active / maintenance / closed"
        numeric rating
        boolean is_active
        timestamp created_at
    }
    hotel_bookings {
        bigint id PK
        uuid profile_id FK "profiles.id"
        uuid hotel_id FK "hotels.id"
        string guest_name
        string guest_phone
        date check_in_date
        int guests_count
        int rooms_count
        string status "upcoming / completed / cancelled"
        timestamp created_at
    }
    parking_blocks {
        uuid id PK
        string block_code "unique"
        string name
        int total_capacity
        int occupied
        string status "open / full / closed"
        uuid assigned_admin_id FK "admins.id"
        string_array vehicle_types
        int revenue_today
        boolean shuttle_active
        boolean is_active
        timestamp updated_at
    }
    parking_history {
        uuid id PK
        uuid block_id FK "parking_blocks.id"
        int total_capacity
        int occupied
        int entries_count
        int exits_count
        int cars_parked
        int bikes_parked
        int scooters_parked
        uuid updated_by_admin_id FK "admins.id"
        timestamp recorded_at
    }
    traffic_routes {
        bigint id PK
        string name "unique"
        string status
        string eta
        timestamp updated_at
    }
    traffic_alerts {
        uuid id PK
        string alert_code "unique"
        bigint route_id FK "traffic_routes.id"
        string severity
        string message
        string source
        boolean is_active
        uuid published_by_admin_id FK "admins.id"
        timestamp published_at
    }
    seva_masters {
        bigint id PK
        string name
        string time_slot
        int price
        text description
        int total_slots
        boolean is_active
    }
    seva_bookings {
        uuid id PK
        string booking_number "unique"
        uuid profile_id FK "profiles.id"
        bigint seva_id FK "seva_masters.id"
        date booking_date
        string devotee_name
        string contact_phone
        int amount
        string status "confirmed / pending / completed / cancelled"
        timestamp created_at
    }
    donations {
        uuid id PK
        string donation_number "unique"
        uuid profile_id FK "profiles.id"
        string donor_name
        string email
        string phone
        string pan_number
        int amount
        string payment_mode "UPI / Card / Cash / Bank Transfer"
        string purpose
        boolean receipt_generated
        timestamp created_at
    }
    prashad_items {
        bigint id PK
        string name
        int price
        string weight_desc
        text description
        text image_url
        boolean is_active
    }
    prashad_orders {
        bigint id PK
        uuid profile_id FK "profiles.id"
        int total_amount
        string delivery_type "pickup / home"
        string recipient_name
        string recipient_phone
        text shipping_address
        string postal_code
        string status
        timestamp created_at
    }
    prashad_order_items {
        bigint id PK
        bigint order_id FK "prashad_orders.id"
        bigint prashad_id FK "prashad_items.id"
        int quantity
    }
    transport_vehicles {
        bigint id PK
        string name
        string capacity
        text description
        string estimated_fare
        string icon
        boolean is_active
    }
    transport_bookings {
        bigint id PK
        uuid profile_id FK "profiles.id"
        bigint vehicle_id FK "transport_vehicles.id"
        string devotee_name
        string contact_phone
        string pickup_point
        text custom_pickup_address
        date pickup_date
        time pickup_time
        string status
        timestamp created_at
    }
    bus_routes {
        bigint id PK
        string from_city
        string to_city
        string departure_time
        int fare
        int total_seats
    }
    bus_bookings {
        bigint id PK
        uuid profile_id FK "profiles.id"
        bigint bus_route_id FK "bus_routes.id"
        string devotee_name
        string contact_phone
        date travel_date
        int seat_count
        string status
        timestamp created_at
    }
    restaurants {
        bigint id PK
        string name
        text description
        numeric rating
        string distance
        text image_url
        boolean reservations_required
        boolean is_active
    }
    restaurant_reservations {
        bigint id PK
        uuid profile_id FK "profiles.id"
        bigint restaurant_id FK "restaurants.id"
        string guest_name
        string guest_phone
        date reservation_date
        time reservation_time
        int people_count
        string status
        timestamp created_at
    }
    offering_items {
        bigint id PK
        string name
        text description
        int price
        string icon
        boolean is_active
    }
    offering_orders {
        bigint id PK
        uuid profile_id FK "profiles.id"
        int total_amount
        string status
        timestamp created_at
    }
    offering_order_items {
        bigint id PK
        bigint order_id FK "offering_orders.id"
        bigint offering_id FK "offering_items.id"
        int quantity
    }
    lost_items {
        uuid id PK
        string case_number "unique"
        uuid profile_id FK "profiles.id"
        string item_name
        text color_description
        string location_lost
        date date_lost
        string contact_phone
        text additional_details
        string status "registered / searching / possible-match / verification / ready-to-collect / collected"
        uuid assigned_admin_id FK "admins.id"
        bigint matched_found_item_id FK "found_items.id"
        timestamp created_at
        timestamp updated_at
    }
    found_items {
        bigint id PK
        string item_name
        text description
        string location_found
        date date_found
        string status "registered / searching / verification / ready-to-collect / collected"
        string category_icon
        string item_color
        timestamp created_at
    }
    claim_history {
        uuid id PK
        uuid lost_item_id FK "lost_items.id"
        string claimed_by_name
        string identity_proof_type
        string identity_proof_number
        timestamp collected_at
        uuid verified_by_admin_id FK "admins.id"
    }
    emergency_requests {
        uuid id PK
        uuid profile_id FK "profiles.id"
        string incident_type "medical / fire / crowd / security"
        numeric location_latitude
        numeric location_longitude
        text location_text
        string status "pending / dispatched / resolved"
        uuid assigned_admin_id FK "admins.id" "nullable"
        text resolution_details
        timestamp created_at
        timestamp resolved_at
    }
    emergency_contacts {
        bigint id PK
        string name
        string phone
        string icon
    }
    temple_information {
        uuid id PK
        string section_key "unique"
        string title
        jsonb content
        uuid last_updated_by_admin_id FK "admins.id"
        timestamp updated_at
    }
    announcements {
        uuid id PK
        string priority "low / medium / high / critical"
        string target_audience "all / pilgrims / admins"
        string status "draft / published / expired"
        timestamp publish_at
        timestamp expiry_at
        uuid created_by_admin_id FK "admins.id"
        timestamp created_at
    }
    announcement_translations {
        uuid id PK
        uuid announcement_id FK "announcements.id"
        string language_code
        string title
        text description
    }
    feedback {
        uuid id PK
        uuid profile_id FK "profiles.id"
        int rating
        text comments
        string category
        string status "pending / reviewed"
        text admin_reply
        uuid replied_by_admin_id FK "admins.id"
        timestamp created_at
    }
    approval_queue {
        uuid id PK
        string type "hotel-update / temple-info / announcement / service-listing / parking-info"
        string title
        uuid submitted_by_admin_id FK "admins.id"
        timestamp submitted_at
        string status "pending / approved / rejected"
        string department
        text description
        jsonb draft_payload
        uuid approved_by_admin_id FK "admins.id" "nullable"
        timestamp approved_at
        uuid rejected_by_admin_id FK "admins.id" "nullable"
        timestamp rejected_at
        text rejection_reason
        text review_notes
        int version_number
    }
    device_tokens {
        uuid id PK
        uuid profile_id FK "profiles.id"
        text fcm_token "unique"
        string device_type "mobile / web"
        string platform "ios / android / chrome"
        timestamp last_active_at
    }
    notifications {
        uuid id PK
        string title
        text body
        string category
        text action_url
        boolean is_broadcast
        string target_role
        uuid created_by_admin_id FK "admins.id"
        timestamp created_at
    }
    notification_recipients {
        uuid id PK
        uuid notification_id FK "notifications.id"
        uuid profile_id FK "profiles.id" "nullable"
        uuid admin_id FK "admins.id" "nullable"
        boolean is_read
        timestamp read_at
    }
    notification_logs {
        uuid id PK
        uuid notification_id FK "notifications.id"
        uuid recipient_token_id FK "device_tokens.id"
        string delivery_status "success / failed"
        text error_message
        timestamp sent_at
    }
    qr_scans {
        uuid id PK
        uuid darshan_booking_id FK "darshan_bookings.id"
        timestamp scanned_at
        string validation_gate
        uuid scanner_admin_id FK "admins.id"
        string scan_status "valid / duplicate / expired"
    }
    audit_logs {
        bigint id PK
        uuid admin_id FK "admins.id"
        text action
        string department
        string actor_name
        inet ip_address
        text device_user_agent
        uuid session_id
        jsonb old_values
        jsonb new_values
        timestamp created_at
    }

    auth_users ||--o| profiles : "maps"
    auth_users ||--o| admins : "maps"
    admins ||--|{ admin_roles_bridge : "holds"
    roles ||--|{ admin_roles_bridge : "assigned"
    profiles ||--o{ darshan_bookings : "books"
    darshan_bookings ||--|{ darshan_booking_members : "devotees"
    profiles ||--o{ hotel_bookings : "books hotel"
    hotels ||--o{ hotel_bookings : "hosts stay"
    profiles ||--o{ donations : "donates"
    profiles ||--o{ lost_items : "reports"
    lost_items |o--o| found_items : "matches"
    lost_items ||--o| claim_history : "tracks handover"
    profiles ||--o{ emergency_requests : "triggers SOS"
    profiles ||--o{ seva_bookings : "books puja"
    seva_masters ||--o{ seva_bookings : "defines"
    admins ||--o{ approval_queue : "submits/moderates"
    admins ||--o{ audit_logs : "records activity"
    profiles ||--o{ device_tokens : "registers device"
    notifications ||--|{ notification_recipients : "targets"
    device_tokens ||--o{ notification_logs : "delivers to"
    darshan_bookings ||--o{ qr_scans : "checks pass"
    announcements ||--|{ announcement_translations : "translates"
    profiles ||--o{ prashad_orders : "orders prashad"
    prashad_items ||--o{ prashad_order_items : "contained in"
    prashad_orders ||--|{ prashad_order_items : "lists items"
    profiles ||--o{ transport_bookings : "reserves transport"
    transport_vehicles ||--o{ transport_bookings : "assigned vehicle"
    profiles ||--o{ bus_bookings : "reserves bus"
    bus_routes ||--o{ bus_bookings : "operates route"
    profiles ||--o{ restaurant_reservations : "reserves table"
    restaurants ||--o{ restaurant_reservations : "hosts dining"
    profiles ||--o{ offering_orders : "orders offerings"
    offering_items ||--o{ offering_order_items : "contained in"
    offering_orders ||--|{ offering_order_items : "lists items"
```

---

## 2. Table Column Mappings by Module

### Module A: Core Identity & Auth

#### 1. `profiles`
* `id`: `UUID PRIMARY KEY` (References `auth.users.id` cascade).
* `name`: `VARCHAR(100) NOT NULL`.
* `phone`: `VARCHAR(20) UNIQUE NOT NULL`.
* `email`: `VARCHAR(255) NULL`.
* `address`: `TEXT NULL`.
* `dob`: `DATE NULL`.
* `gender`: `VARCHAR(20) NULL`.
* `photo_url`: `TEXT NULL` (Supabase Storage reference).
* `created_at`: `TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL`.
* `updated_at`: `TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL`.

#### 2. `admins`
* `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`.
* `auth_user_id`: `UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL`.
* `admin_code`: `VARCHAR(50) UNIQUE NOT NULL` (e.g., `ADM-001`).
* `name`: `VARCHAR(100) NOT NULL`.
* `phone`: `VARCHAR(20) NOT NULL`.
* `email`: `VARCHAR(255) UNIQUE NOT NULL`.
* `initials`: `VARCHAR(10) NOT NULL`.
* `is_active`: `BOOLEAN DEFAULT true NOT NULL`.
* `last_login`: `TIMESTAMP WITH TIME ZONE NULL`.
* `created_at`: `TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL`.

#### 3. `roles`
* `key`: `VARCHAR(50) PRIMARY KEY`.
* `name`: `VARCHAR(100) NOT NULL`.
* `description`: `TEXT NOT NULL`.

#### 4. `admin_roles_bridge`
* `admin_id`: `UUID REFERENCES public.admins(id) ON DELETE CASCADE`.
* `role_key`: `VARCHAR(50) REFERENCES public.roles(key) ON DELETE CASCADE`.
* `assigned_at`: `TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL`.
* *PK*: `(admin_id, role_key)`.

---

### Module B: Bookings & Stays

#### 5. `darshan_bookings`
* `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`.
* `booking_number`: `VARCHAR(50) UNIQUE NOT NULL` (e.g., `KSJ-2026-08841`).
* `profile_id`: `UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT`.
* `booking_type`: `booking_category_type ('solo', 'group') NOT NULL`.
* `booking_date`: `DATE NOT NULL`.
* `day_name`: `VARCHAR(15) NOT NULL`.
* `visitor_count`: `INT NOT NULL CHECK (visitor_count > 0)`.
* `group_name`: `VARCHAR(100) NULL` (Required if booking_type = 'group').
* `status`: `booking_status_type DEFAULT 'upcoming' NOT NULL`.
* `created_at`: `TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL`.
* `updated_at`: `TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL`.

#### 6. `darshan_booking_members` (Visitor lists for solo/group bookings)
* `id`: `BIGSERIAL PRIMARY KEY`.
* `booking_id`: `UUID NOT NULL REFERENCES public.darshan_bookings(id) ON DELETE CASCADE`.
* `name`: `VARCHAR(100) NOT NULL`.
* `age`: `INT NOT NULL CHECK (age >= 0 AND age <= 120)`.
* `gender`: `VARCHAR(20) NOT NULL`.
* `relationship`: `VARCHAR(50) NULL` (Null for group leader or solo).
* `identity_proof_type`: `VARCHAR(50) NULL`.
* `identity_proof_number`: `VARCHAR(50) NULL`.
* `nationality`: `VARCHAR(50) DEFAULT 'India' NOT NULL`.
* `is_child`: `BOOLEAN DEFAULT false NOT NULL`.

#### 7. `hotels`
* `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`.
* `hotel_code`: `VARCHAR(50) UNIQUE NOT NULL` (e.g., `HTL-001`).
* `name`: `VARCHAR(150) NOT NULL`.
* `stars`: `INT NOT NULL CHECK (stars BETWEEN 1 AND 5)`.
* `total_rooms`: `INT NOT NULL CHECK (total_rooms > 0)`.
* `price_range`: `VARCHAR(50) NOT NULL`.
* `assigned_admin_id`: `UUID NOT NULL REFERENCES public.admins(id) ON DELETE RESTRICT`.
* `status`: `hotel_status_type DEFAULT 'active' NOT NULL`.
* `rating`: `NUMERIC(2,1) DEFAULT 4.0 CHECK (rating BETWEEN 1.0 AND 5.0)`.
* `is_active`: `BOOLEAN DEFAULT true NOT NULL`.
* `created_at`: `TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL`.

#### 8. `hotel_bookings`
* `id`: `BIGSERIAL PRIMARY KEY`.
* `profile_id`: `UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT`.
* `hotel_id`: `UUID NOT NULL REFERENCES public.hotels(id) ON DELETE RESTRICT`.
* `guest_name`: `VARCHAR(100) NOT NULL`.
* `guest_phone`: `VARCHAR(20) NOT NULL`.
* `check_in_date`: `DATE NOT NULL`.
* `guests_count`: `INT NOT NULL CHECK (guests_count > 0)`.
* `rooms_count`: `INT NOT NULL CHECK (rooms_count > 0)`.
* `status`: `booking_status_type DEFAULT 'upcoming' NOT NULL`.
* `created_at`: `TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL`.

---

### Module C: Infrastructure & Operations

#### 9. `parking_blocks`
* `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`.
* `block_code`: `VARCHAR(50) UNIQUE NOT NULL` (e.g., `PKG-A`).
* `name`: `VARCHAR(100) NOT NULL`.
* `total_capacity`: `INT NOT NULL CHECK (total_capacity > 0)`.
* `occupied`: `INT DEFAULT 0 NOT NULL CHECK (occupied >= 0)`.
* `status`: `parking_status_type DEFAULT 'open' NOT NULL`.
* `assigned_admin_id`: `UUID NOT NULL REFERENCES public.admins(id) ON DELETE RESTRICT`.
* `vehicle_types`: `VARCHAR(50)[] NOT NULL`.
* `revenue_today`: `INT DEFAULT 0 NOT NULL`.
* `shuttle_active`: `BOOLEAN DEFAULT true NOT NULL`.
* `is_active`: `BOOLEAN DEFAULT true NOT NULL`.
* `updated_at`: `TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL`.
* *Constraint*: `occupied <= total_capacity`.

#### 10. `parking_history` (Historical stats updates)
* `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`.
* `block_id`: `UUID NOT NULL REFERENCES public.parking_blocks(id) ON DELETE CASCADE`.
* `total_capacity`: `INT NOT NULL`.
* `occupied`: `INT NOT NULL`.
* `entries_count`: `INT DEFAULT 0 NOT NULL`.
* `exits_count`: `INT DEFAULT 0 NOT NULL`.
* `cars_parked`: `INT DEFAULT 0 NOT NULL`.
* `bikes_parked`: `INT DEFAULT 0 NOT NULL`.
* `scooters_parked`: `INT DEFAULT 0 NOT NULL`.
* `updated_by_admin_id`: `UUID NOT NULL REFERENCES public.admins(id) ON DELETE RESTRICT`.
* `recorded_at`: `TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL`.

#### 11. `traffic_routes`
* `id`: `BIGSERIAL PRIMARY KEY`.
* `name`: `VARCHAR(150) UNIQUE NOT NULL`.
* `status`: `VARCHAR(50) DEFAULT 'smooth' NOT NULL`.
* `eta`: `VARCHAR(50) NOT NULL`.
* `updated_at`: `TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL`.

#### 12. `traffic_alerts`
* `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`.
* `alert_code`: `VARCHAR(50) UNIQUE NOT NULL` (e.g., `TRF-001`).
* `route_id`: `BIGINT NOT NULL REFERENCES public.traffic_routes(id) ON DELETE CASCADE`.
* `severity`: `severity_level_type DEFAULT 'low' NOT NULL`.
* `message`: `TEXT NOT NULL`.
* `source`: `source_type DEFAULT 'Manual' NOT NULL`.
* `is_active`: `BOOLEAN DEFAULT true NOT NULL`.
* `published_by_admin_id`: `UUID NOT NULL REFERENCES public.admins(id) ON DELETE RESTRICT`.
* `published_at`: `TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL`.

---

### Module D: Services & Commerce

#### 13. `seva_masters`
* `id`: `BIGSERIAL PRIMARY KEY`.
* `name`: `VARCHAR(100) NOT NULL`.
* `time_slot`: `VARCHAR(50) NOT NULL`.
* `price`: `INT NOT NULL`.
* `description`: `TEXT`.
* `total_slots`: `INT NOT NULL`.
* `is_active`: `BOOLEAN DEFAULT true NOT NULL`.

#### 14. `seva_bookings`
* `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`.
* `booking_number`: `VARCHAR(50) UNIQUE NOT NULL`.
* `profile_id`: `UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT`.
* `seva_id`: `BIGINT NOT NULL REFERENCES public.seva_masters(id) ON DELETE RESTRICT`.
* `booking_date`: `DATE NOT NULL`.
* `devotee_name`: `VARCHAR(100) NOT NULL`.
* `contact_phone`: `VARCHAR(20) NOT NULL`.
* `amount`: `INT NOT NULL`.
* `status`: `booking_status_type DEFAULT 'confirmed' NOT NULL`.
* `created_at`: `TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL`.

#### 15. `donations`
* `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`.
* `donation_number`: `VARCHAR(50) UNIQUE NOT NULL`.
* `profile_id`: `UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT`.
* `donor_name`: `VARCHAR(100) NOT NULL`.
* `email`: `VARCHAR(255) NOT NULL`.
* `phone`: `VARCHAR(20) NOT NULL`.
* `pan_number`: `VARCHAR(20) NULL`.
* `amount`: `INT NOT NULL CHECK (amount > 0)`.
* `payment_mode`: `payment_mode_type DEFAULT 'UPI' NOT NULL`.
* `purpose`: `VARCHAR(100) NOT NULL`.
* `receipt_generated`: `BOOLEAN DEFAULT false NOT NULL`.
* `created_at`: `TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL`.

#### 16. `prashad_items`
* `id`: `BIGSERIAL PRIMARY KEY`.
* `name`: `VARCHAR(150) NOT NULL`.
* `price`: `INT NOT NULL`.
* `weight_desc`: `VARCHAR(50) NOT NULL`.
* `description`: `TEXT`.
* `image_url`: `TEXT`.
* `is_active`: `BOOLEAN DEFAULT true NOT NULL`.

#### 17. `prashad_orders`
* `id`: `BIGSERIAL PRIMARY KEY`.
* `profile_id`: `UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT`.
* `total_amount`: `INT NOT NULL`.
* `delivery_type`: `VARCHAR(20) DEFAULT 'pickup'`.
* `recipient_name`: `VARCHAR(100) NOT NULL`.
* `recipient_phone`: `VARCHAR(20) NOT NULL`.
* `shipping_address`: `TEXT NULL`.
* `postal_code`: `VARCHAR(10) NULL`.
* `status`: `VARCHAR(50) DEFAULT 'pending' NOT NULL`.
* `created_at`: `TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL`.

#### 18. `prashad_order_items`
* `id`: `BIGSERIAL PRIMARY KEY`.
* `order_id`: `BIGINT NOT NULL REFERENCES public.prashad_orders(id) ON DELETE CASCADE`.
* `prashad_id`: `BIGINT NOT NULL REFERENCES public.prashad_items(id) ON DELETE RESTRICT`.
* `quantity`: `INT NOT NULL CHECK (quantity > 0)`.

#### 19. `transport_vehicles`
* `id`: `BIGSERIAL PRIMARY KEY`.
* `name`: `VARCHAR(100) NOT NULL`.
* `capacity`: `VARCHAR(20) NOT NULL`.
* `description`: `TEXT`.
* `estimated_fare`: `VARCHAR(50) NOT NULL`.
* `icon`: `VARCHAR(50) NOT NULL`.
* `is_active`: `BOOLEAN DEFAULT true NOT NULL`.

#### 20. `transport_bookings`
* `id`: `BIGSERIAL PRIMARY KEY`.
* `profile_id`: `UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT`.
* `vehicle_id`: `BIGINT NOT NULL REFERENCES public.transport_vehicles(id) ON DELETE RESTRICT`.
* `devotee_name`: `VARCHAR(100) NOT NULL`.
* `contact_phone`: `VARCHAR(20) NOT NULL`.
* `pickup_point`: `VARCHAR(100) NOT NULL`.
* `custom_pickup_address`: `TEXT NULL`.
* `pickup_date`: `DATE NOT NULL`.
* `pickup_time`: `TIME NOT NULL`.
* `status`: `VARCHAR(50) DEFAULT 'confirmed' NOT NULL`.
* `created_at`: `TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL`.

#### 21. `bus_routes`
* `id`: `BIGSERIAL PRIMARY KEY`.
* `from_city`: `VARCHAR(100) NOT NULL`.
* `to_city`: `VARCHAR(100) NOT NULL`.
* `departure_time`: `VARCHAR(20) NOT NULL`.
* `fare`: `INT NOT NULL`.
* `total_seats`: `INT DEFAULT 40 NOT NULL`.

#### 22. `bus_bookings`
* `id`: `BIGSERIAL PRIMARY KEY`.
* `profile_id`: `UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT`.
* `bus_route_id`: `BIGINT NOT NULL REFERENCES public.bus_routes(id) ON DELETE RESTRICT`.
* `devotee_name`: `VARCHAR(100) NOT NULL`.
* `contact_phone`: `VARCHAR(20) NOT NULL`.
* `travel_date`: `DATE NOT NULL`.
* `seat_count`: `INT NOT NULL CHECK (seat_count > 0 AND seat_count <= 6)`.
* `status`: `VARCHAR(50) DEFAULT 'confirmed' NOT NULL`.
* `created_at`: `TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL`.

#### 23. `restaurants`
* `id`: `BIGSERIAL PRIMARY KEY`.
* `name`: `VARCHAR(150) NOT NULL`.
* `description`: `TEXT`.
* `rating`: `NUMERIC(2,1) DEFAULT 4.0`.
* `distance`: `VARCHAR(50) NOT NULL`.
* `image_url`: `TEXT`.
* `reservations_required`: `BOOLEAN DEFAULT false NOT NULL`.
* `is_active`: `BOOLEAN DEFAULT true NOT NULL`.

#### 24. `restaurant_reservations`
* `id`: `BIGSERIAL PRIMARY KEY`.
* `profile_id`: `UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT`.
* `restaurant_id`: `BIGINT NOT NULL REFERENCES public.restaurants(id) ON DELETE RESTRICT`.
* `guest_name`: `VARCHAR(100) NOT NULL`.
* `guest_phone`: `VARCHAR(20) NOT NULL`.
* `reservation_date`: `DATE NOT NULL`.
* `reservation_time`: `TIME NOT NULL`.
* `people_count`: `INT NOT NULL`.
* `status`: `VARCHAR(50) DEFAULT 'confirmed' NOT NULL`.
* `created_at`: `TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL`.

#### 25. `offering_items`
* `id`: `BIGSERIAL PRIMARY KEY`.
* `name`: `VARCHAR(100) NOT NULL`.
* `description`: `TEXT`.
* `price`: `INT NOT NULL`.
* `icon`: `VARCHAR(50) NOT NULL`.
* `is_active`: `BOOLEAN DEFAULT true NOT NULL`.

#### 26. `offering_orders`
* `id`: `BIGSERIAL PRIMARY KEY`.
* `profile_id`: `UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT`.
* `total_amount`: `INT NOT NULL`.
* `status`: `VARCHAR(50) DEFAULT 'pending' NOT NULL`.
* `created_at`: `TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL`.

#### 27. `offering_order_items`
* `id`: `BIGSERIAL PRIMARY KEY`.
* `order_id`: `BIGINT NOT NULL REFERENCES public.offering_orders(id) ON DELETE CASCADE`.
* `offering_id`: `BIGINT NOT NULL REFERENCES public.offering_items(id) ON DELETE RESTRICT`.
* `quantity`: `INT NOT NULL CHECK (quantity > 0)`.

---

### Module E: Incidents & Support

#### 28. `lost_items`
* `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`.
* `case_number`: `VARCHAR(50) UNIQUE NOT NULL` (e.g., `LF-2026-001`).
* `profile_id`: `UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT`.
* `item_name`: `VARCHAR(150) NOT NULL`.
* `color_description`: `TEXT NOT NULL`.
* `location_lost`: `VARCHAR(100) NOT NULL`.
* `date_lost`: `DATE NOT NULL`.
* `contact_phone`: `VARCHAR(20) NOT NULL`.
* `additional_details`: `TEXT NULL`.
* `status`: `lost_found_status_type DEFAULT 'registered' NOT NULL`.
* `assigned_admin_id`: `UUID NULL REFERENCES public.admins(id) ON DELETE SET NULL`.
* `matched_found_item_id`: `BIGINT NULL REFERENCES public.found_items(id) ON DELETE SET NULL`.
* `created_at`: `TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL`.
* `updated_at`: `TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL`.

#### 29. `found_items`
* `id`: `BIGSERIAL PRIMARY KEY`.
* `item_name`: `VARCHAR(150) NOT NULL`.
* `description`: `TEXT NOT NULL`.
* `location_found`: `VARCHAR(100) NOT NULL`.
* `date_found`: `DATE NOT NULL`.
* `status`: `lost_found_status_type DEFAULT 'registered' NOT NULL`.
* `category_icon`: `VARCHAR(50) DEFAULT 'PackageSearch' NOT NULL`.
* `item_color`: `VARCHAR(50) NOT NULL`.
* `created_at`: `TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL`.

#### 30. `claim_history` (Releasing missing items)
* `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`.
* `lost_item_id`: `UUID NOT NULL REFERENCES public.lost_items(id) ON DELETE CASCADE`.
* `claimed_by_name`: `VARCHAR(100) NOT NULL`.
* `identity_proof_type`: `VARCHAR(50) NOT NULL`.
* `identity_proof_number`: `VARCHAR(50) NOT NULL`.
* `collected_at`: `TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL`.
* `verified_by_admin_id`: `UUID NOT NULL REFERENCES public.admins(id) ON DELETE RESTRICT`.

#### 31. `emergency_contacts`
* `id`: `BIGSERIAL PRIMARY KEY`.
* `name`: `VARCHAR(100) NOT NULL`.
* `phone`: `VARCHAR(20) NOT NULL`.
* `icon`: `VARCHAR(50) NOT NULL`.

#### 32. `emergency_requests` (Mobile App SOS Trigger logs)
* `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`.
* `profile_id`: `UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT`.
* `incident_type`: `VARCHAR(50) NOT NULL` (medical, fire, crowd, security).
* `location_latitude`: `NUMERIC(9,6) NOT NULL`.
* `location_longitude`: `NUMERIC(9,6) NOT NULL`.
* `location_text`: `TEXT NULL`.
* `status`: `VARCHAR(50) DEFAULT 'pending' NOT NULL`.
* `assigned_admin_id`: `UUID NULL REFERENCES public.admins(id) ON DELETE SET NULL`.
* `resolution_details`: `TEXT NULL`.
* `created_at`: `TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL`.
* `resolved_at`: `TIMESTAMP WITH TIME ZONE NULL`.

---

### Module F: Temple Content & Feedback

#### 33. `temple_information`
* `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`.
* `section_key`: `VARCHAR(50) UNIQUE NOT NULL` ('timings', 'guidelines', 'faqs', 'contacts').
* `title`: `VARCHAR(150) NOT NULL`.
* `content`: `JSONB NOT NULL`.
* `last_updated_by_admin_id`: `UUID NOT NULL REFERENCES public.admins(id) ON DELETE RESTRICT`.
* `updated_at`: `TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL`.

#### 34. `announcements` (Targeted Broadcast system)
* `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`.
* `priority`: `public.severity_level_type DEFAULT 'low' NOT NULL`.
* `target_audience`: `VARCHAR(50) DEFAULT 'all' NOT NULL`.
* `status`: `VARCHAR(50) DEFAULT 'published' NOT NULL`.
* `publish_at`: `TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL`.
* `expiry_at`: `TIMESTAMP WITH TIME ZONE NOT NULL`.
* `created_by_admin_id`: `UUID NOT NULL REFERENCES public.admins(id) ON DELETE RESTRICT`.
* `created_at`: `TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL`.

#### 35. `announcement_translations` (Localized titles/descriptions)
* `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`.
* `announcement_id`: `UUID NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE`.
* `language_code`: `VARCHAR(10) NOT NULL` (e.g., 'en', 'hi', 'gu').
* `title`: `VARCHAR(200) NOT NULL`.
* `description`: `TEXT NOT NULL`.

#### 36. `feedback`
* `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`.
* `profile_id`: `UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE`.
* `rating`: `INT NOT NULL CHECK (rating BETWEEN 1 AND 5)`.
* `comments`: `TEXT NULL`.
* `category`: `VARCHAR(50) NOT NULL`.
* `status`: `VARCHAR(50) DEFAULT 'pending' NOT NULL`.
* `admin_reply`: `TEXT NULL`.
* `replied_by_admin_id`: `UUID NULL REFERENCES public.admins(id) ON DELETE SET NULL`.
* `created_at`: `TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL`.

#### 37. `approval_queue`
* `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`.
* `type`: `approval_entity_type NOT NULL`.
* `title`: `VARCHAR(200) NOT NULL`.
* `submitted_by_admin_id`: `UUID NOT NULL REFERENCES public.admins(id) ON DELETE CASCADE`.
* `submitted_at`: `TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL`.
* `status`: `approval_status_type DEFAULT 'pending' NOT NULL`.
* `department`: `VARCHAR(50) NOT NULL`.
* `description`: `TEXT NOT NULL`.
* `draft_payload`: `JSONB NOT NULL`.
* `approved_by_admin_id`: `UUID NULL REFERENCES public.admins(id) ON DELETE SET NULL`.
* `approved_at`: `TIMESTAMP WITH TIME ZONE NULL`.
* `rejected_by_admin_id`: `UUID NULL REFERENCES public.admins(id) ON DELETE SET NULL`.
* `rejected_at`: `TIMESTAMP WITH TIME ZONE NULL`.
* `rejection_reason`: `TEXT NULL`.
* `review_notes`: `TEXT NULL`.
* `version_number`: `INT DEFAULT 1 NOT NULL`.

---

### Module G: Notifications & Devices

#### 38. `device_tokens`
* `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`.
* `profile_id`: `UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE`.
* `fcm_token`: `TEXT UNIQUE NOT NULL`.
* `device_type`: `VARCHAR(50) NOT NULL`.
* `platform`: `VARCHAR(50) NOT NULL`.
* `last_active_at`: `TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL`.

#### 39. `notifications`
* `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`.
* `title`: `VARCHAR(200) NOT NULL`.
* `body`: `TEXT NOT NULL`.
* `category`: `VARCHAR(50) NOT NULL`.
* `action_url`: `TEXT NULL`.
* `is_broadcast`: `BOOLEAN DEFAULT false NOT NULL`.
* `target_role`: `VARCHAR(50) NULL`.
* `created_by_admin_id`: `UUID NOT NULL REFERENCES public.admins(id) ON DELETE RESTRICT`.
* `created_at`: `TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL`.

#### 40. `notification_recipients`
* `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`.
* `notification_id`: `UUID NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE`.
* `profile_id`: `UUID NULL REFERENCES public.profiles(id) ON DELETE CASCADE`.
* `admin_id`: `UUID NULL REFERENCES public.admins(id) ON DELETE CASCADE`.
* `is_read`: `BOOLEAN DEFAULT false NOT NULL`.
* `read_at`: `TIMESTAMP WITH TIME ZONE NULL`.

#### 41. `notification_logs` (Audit transmissions)
* `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`.
* `notification_id`: `UUID NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE`.
* `recipient_token_id`: `UUID NOT NULL REFERENCES public.device_tokens(id) ON DELETE CASCADE`.
* `delivery_status`: `VARCHAR(50) NOT NULL`.
* `error_message`: `TEXT NULL`.
* `sent_at`: `TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL`.

---

### Module H: Auditing & Scans

#### 42. `qr_scans` (Validation scanning)
* `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`.
* `darshan_booking_id`: `UUID NOT NULL REFERENCES public.darshan_bookings(id) ON DELETE CASCADE`.
* `scanned_at`: `TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL`.
* `validation_gate`: `VARCHAR(50) NOT NULL`.
* `scanner_admin_id`: `UUID NOT NULL REFERENCES public.admins(id) ON DELETE RESTRICT`.
* `scan_status`: `VARCHAR(50) NOT NULL`.

#### 43. `audit_logs`
* `id`: `BIGSERIAL PRIMARY KEY`.
* `admin_id`: `UUID NULL REFERENCES public.admins(id) ON DELETE SET NULL`.
* `action`: `TEXT NOT NULL`.
* `department`: `VARCHAR(50) NOT NULL`.
* `actor_name`: `VARCHAR(100) NOT NULL`.
* `ip_address`: `INET NULL`.
* `device_user_agent`: `TEXT NULL`.
* `session_id`: `UUID NULL`.
* `old_values`: `JSONB NULL`.
* `new_values`: `JSONB NULL`.
* `created_at`: `TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL`.
