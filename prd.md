# Product Requirements Document (PRD)
## Smart Pilgrim Management System — Khatu Shyam Ji

---

## 📋 1. Executive Summary & Objective

### 1.1 What the App Does
The **Smart Pilgrim Management System** is a unified digital platform built for the holy town of Khatu Shyam Ji. It simplifies travel planning for devotees visiting the temple by offering pre-booked Darshan slots, real-time tracking of parking availability, gate crowd levels, regional traffic updates, and integration of essential services (hotels, buses, emergency assistance, and local amenities).

### 1.2 The Problem it Solves
Every year, millions of pilgrims visit the Khatu Shyam Ji temple. During peak mela festivals, crowd sizes surge dramatically, creating massive challenges:
- **Crowd & Safety Hazards:** Intense gate congestion and lack of real-time crowd status reports.
- **Logistical Delays:** Hours wasted searching for available parking spots and navigating road closures.
- **Unverified Entry:** Long manual lines for verification, causing entry bottlenecks.
- **Lack of Information:** Pilgrims struggle to find trusted hotel lodging, transport, local facilities, or lost belongings.

### 1.3 Who it is For
1. **Pilgrims (Devotees):** Visitors of all age groups seeking a secure, planned, and hassle-free spiritual journey.
2. **Temple Administration & Security:** Officers monitoring crowd numbers, managing check-ins, and broadcasting announcements.
3. **Logistics Operators:** Parking wardens and transport coordinators updating availability.

---

## 🎯 2. Product Scope & Feature Matrix

To deliver value quickly, features are categorized into critical launch components (Must-Haves) and future expansions (Nice-to-Haves).

### 2.1 Feature Prioritization Table

| Feature Name | Category | Description | Priority |
| :--- | :--- | :--- | :--- |
| **Unified Authentication** | Core Auth | OTP mobile login and Google OAuth SSO with automatic profile creation. | **Must-Have** |
| **Darshan Pass Booking** | Ticketing | Interactive form for booking Solo or Group passes, capturing visitor metadata and ID numbers. | **Must-Have** |
| **Digital QR Pass** | Verification | Instant pass generation displaying booking details and a scannable verification QR code. | **Must-Have** |
| **Admin Control Desk** | Operations | Dashboard for admins to verify passes, update parking slot counts, and toggle crowd alert levels. | **Must-Have** |
| **Live Crowd Status** | Logistical | Colored indicators displaying congestion levels (Low, Medium, High) at key temple gates. | **Must-Have** |
| **Live Parking Tracker** | Logistical | Displays available slots across major parking zones. | **Should-Have** |
| **Shyam Path Map** | Navigation | Google Maps view highlighting facility checkpoints (Water, Restrooms, First Aid). | **Should-Have** |
| **Shyam Sahayak AI Chatbot** | Helpdesk | AI chatbot answering queries about temple hours, guidelines, and facilities. | **Should-Have** |
| **Bhakti Audio Player** | Multimedia | Ambient devotional music controls (Bhajans) to enhance user experience. | **Nice-to-Have** |
| **Lost & Found Portal** | Community | Public notice board to report lost items or view found assets. | **Nice-to-Have** |
| **Bus / Transit Tracker** | Transit | Real-time shuttle schedule tracking. | **Nice-to-Have** |

---

## 🔄 3. End-to-End User Journeys

### 3.1 The Pilgrim Journey
```
[ Welcome Screen ] ──> [ Google/OTP Login ] ──> [ Home Dashboard ]
                                                      │
         ┌───────────────────┬────────────────────────┴────────────────────┐
         ▼                   ▼                                             ▼
[ Book Darshan Pass ]   [ Check Live Trackers ]                     [ Navigation & Help ]
  - Select Solo/Group     - View Gate Congestion                      - Browse Shyam Path Map
  - Input Visitor Details - View Available Parking Slots              - Ask Shyam Sahayak AI
  - Review & Confirm      - Check Road Traffic Alerts
         │
         ▼
[ Pass QR Generated ] ──> [ Check-in Scan at Temple ] ──> [ Complete Visit / Feedback ]
```

1. **Onboarding:** Devotee lands on the Welcome Screen, chooses Language (English/Hindi), and logs in via Google SSO or mobile phone OTP.
2. **Dashboard & Planning:** The devotee views live crowd status, parking availability, and road traffic alerts.
3. **Booking a Pass:** The devotee clicks "Book Darshan", chooses Group Booking, inputs visitor names/IDs, and submits. A digital pass with a secure QR code is instantly generated.
4. **Arrival & Navigation:** On arrival, the devotee uses the interactive map to locate the nearest parking lot with open slots and follows the walking route.
5. **Entry:** At the temple gate, the devotee displays the QR pass. An admin scans the pass, checking them in.

### 3.2 The Temple Administrator Journey
1. **Secure Login:** Admin signs in with their assigned staff code (e.g. `ADM-001`) and password.
2. **Live Feed Control:** The admin updates gate congestion levels (Low, Medium, High) and posts emergency announcements.
3. **Pass Verification:** At checkpoints, the admin uses a scanner to verify devotee QR codes, updating booking statuses from `upcoming` to `completed`.

---

## 📦 4. Minimum Viable Product (MVP) Definition

The MVP focuses on the core user flow: booking a pass and ensuring smooth entry.

- **Scope Included in MVP (v1.0):**
  - Devotee sign-in via Google OAuth and SMS OTP.
  - Multi-step solo and group Darshan ticket booking (max 10 visitors per group).
  - Client-side QR code generator.
  - Live crowd status (Low, Medium, Heavy) updated by admins.
  - Admin workspace containing list tables for pass checking.
  - Basic multi-language localization (English / Hindi).
- **Simulations for MVP:**
  - *Payment integrations:* Hotel bookings and donations use simulated triggers (no actual bank gateways integrated in v1).

---

## 🚫 5. Out of Scope for Version 1 (Deliberately Deferred)

1. **Real-time Video CCTV Feeds:** Devotees will see updated crowd indicators rather than raw camera feeds to reduce bandwidth usage.
2. **Financial Payment Gateway Integration:** Services like hotel booking and donations will run on simulated checkouts to speed up the initial launch.
3. **Automated Drone Crowd Counting:** Gates rely on manual staff updates rather than automated computer-vision systems.
4. **Offline Mobile Mode:** The app requires a cellular connection to verify passes and update live metrics.

---

## 📈 6. Success Metrics & Performance KPIs

We will measure product success using the following metrics:

- **Adoption & Usage:**
  - *Daily Active Users (DAU):* Number of pilgrims planning journeys using the app.
  - *Passes Generated:* Target of over 85% of temple entrants using digital pre-booked passes.
- **Operational Efficiency:**
  - *Entry Queue Wait Time:* Target check-in time of under 8 seconds per pass.
  - *Parking Fill Rate:* Reduction in traffic bottlenecks around full parking zones by directing drivers to open lots.
- **System Quality:**
  - *Page Load Time:* Under 2 seconds on standard 3G/4G networks.
  - *Real-time Sync Latency:* Under 500ms broadcast delay for crowd and parking updates.
