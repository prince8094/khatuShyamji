# Smart Pilgrim Management System - Database Implementation Plan

This document outlines the architectural plan, review objectives, and decisions for the relational database schema supporting the Smart Pilgrim Management System at Shri Khatu Shyam Ji Temple.

---

## Final Database Architecture Review

### 1. Remove Duplicate Entities
- **Recommendation**: Merge `booking_passengers` (solo companions) and `group_booking_members` (group devotees) into a single consolidated table: **`darshan_booking_members`**.
- **Justification**: Both tables serve the identical logical purpose—tracking the individual devotees attending the temple under a parent booking. Merging them simplifies querying (a single JOIN fetches all members), consolidates Row-Level Security (RLS) rules, and eliminates schema redundancy. Unused fields for solo booking companions (like `relationship` or `identity_proof_number`) will simply remain nullable.

### 2. Relationship Review
- All tables strictly enforce foreign key constraints with `UUID`s. No name/text columns are used for relational mappings.
- Cascade actions:
  - `ON DELETE CASCADE` for parent-child dependencies (e.g., booking members, orders, translations).
  - `ON DELETE RESTRICT` for reference data (e.g., hotels, seva masters) to protect historical logs.

### 3. Role-Based Access Control (RBAC)
- The current bridge layout (`admins` -> `admin_roles_bridge` -> `roles`) is sufficient. It allows a single admin to possess multiple roles (e.g., Super Admin + SOS Admin) without overengineering permissions at the individual operation level. Supabase RLS policies check role possession using helper functions.

### 4. Emergency Request Consistency
- `profile_id` in `emergency_requests` is marked `NOT NULL`.
- **Reasoning**: This complies with the strict project rule that all transactional and assistance features require user authentication, protecting the system from denial-of-service/spam attacks on SOS dispatchers.

### 5. Soft Delete Strategy
- Soft delete (`is_active` / `deleted_at`) is recommended for catalog and content tables to protect relational integrity of historical transactions:
  - `hotels`, `seva_masters`, `parking_blocks`, `restaurants`, `offering_items`, and `prashad_items` will support soft delete.
  - Transactional tables (`darshan_bookings`, `donations`, `feedback`, `emergency_requests`) will **not** use soft deletes, as they rely on explicit state machines (e.g., `cancelled`, `resolved`).

### 6. Media/File Management
- **Decision**: Storing URLs directly in target tables (e.g., `hotels.image_url`, `profiles.photo_url`) is chosen for Version 1.
- **Justification**: Simple, high-performance, and matches Next.js image rendering directly. Centralizing in a `media_files` table adds join overhead without functional benefit at this stage.

### 7. Version 1 Validation
- Every table matches an active frontend route or dashboard module (e.g. taxi, bus, restaurant, lost/found, SOS, donations, notifications). No tables are classified as "Future Scope Only"; all are active.

---

## Verification Plan

### Automated Tests
- Test schema deployment script on a PostgreSQL instance.
- Test sync trigger via auth signups.
- Validate RLS policies with simulated JWT tokens.

### Manual Verification
- Deploy schema to a Supabase preview branch and verify administrative write-backs from the `approval_queue`.
