# Database Structure & Entity-Relationship (ER) Diagram (Phase 2)

This document describes the schema structure, data types, and relationships for the KhatuShyamji Temple Management System, matching the SQL statements in [schema.sql](file:///c:/Users/princ/KhatuShyamji/schema.sql).

---

## Entity-Relationship Diagram

The following Mermaid diagram maps the database entities, keys, and their logical associations:

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
