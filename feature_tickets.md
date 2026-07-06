# Feature Ticket List & Agile Breakdown
## Smart Pilgrim Management System — Khatu Shyam Ji

This document contains a structured backlog of features broken down into developer-ready task tickets. Each ticket is designed to serve as a direct prompt for an AI coding tool or developer task description.

---

### Ticket 1: Devotee Authentication (SMS OTP & Google OAuth)
- **Priority:** Must-Have for Launch
- **Dependencies:** None
- **Description:** Implement the unified Devotee login screen. It must support two flows: SMS-based OTP login via phone number and Google OAuth Single-Sign-On (SSO). The login must verify if a user profile exists in `public.profiles`. If not, it redirects the user to complete their registration or automatically creates a profile.
- **Acceptance Criteria:**
  1. Phone input checks for exactly 10 digits and triggers `supabase.auth.signInWithOtp` with prefixed `+91`.
  2. Google button triggers `supabase.auth.signInWithOAuth` redirecting to `/auth/callback`.
  3. The callback page retrieves the user session, checks for user presence in `profiles`, and auto-creates a profile with a unique placeholder phone number if missing.
  4. User sessions survive page refresh via LocalStorage cache.
  5. UI displays clear error messages (e.g., Network Error, Provider Issues) instead of generic alerts.
- **AI Coding Tool Prompt:**
  ```text
  Configure the devotee authentication system in components/screens/auth/login.tsx and app/auth/callback/page.tsx. Set up Supabase signInWithOtp for standard 10-digit Indian phone numbers (prefixed with +91) and signInWithOAuth for Google logins. Create a client-side callback handler in app/auth/callback/page.tsx that checks if a public.profiles record exists for the authenticated user ID. If it does not exist, auto-create a profile generating a random placeholder phone number starting with +99 (check for collisions first) and map the Google display name, email, and avatar photo_url to the fields. If it exists, update its updated_at/last_login columns. Handle missing columns in the DB gracefully by falling back to inserts/updates without provider or last_login. Wrap the pages in a loading spinner with a devotional theme matching Ivory background (#FAF6F0) and Maroon brand accents (#800000).
  ```

---

### Ticket 2: Solo & Group Darshan Booking Flow
- **Priority:** Must-Have for Launch
- **Dependencies:** Ticket 1 (Devotee Authentication)
- **Description:** Build the multi-step Darshan Booking wizard. Devotees select a booking type (Solo or Group), pick a date, input visitor details (Name, Age, Gender, Nationality, ID Proof), and save the reservation in `public.darshan_bookings` and `public.darshan_booking_members`.
- **Acceptance Criteria:**
  1. Wizard includes three phases: 1) Date & Count Selection, 2) Passenger Details Input, 3) Booking Confirmation Review.
  2. Solo booking limits visitor count to 1 and locks details to the user's profile.
  3. Group booking dynamically generates form fields matching the selected visitor count (up to 10 members).
  4. Verifies validation rules: age is between 1 and 100, ID proofs are alphanumeric, and dates are in the future.
  5. Inserts a parent booking record in `darshan_bookings` and corresponding child entries in `darshan_booking_members` in a single transactional flow.
- **AI Coding Tool Prompt:**
  ```text
  Implement a multi-step Darshan Booking wizard in components/screens/book-darshan.tsx and components/screens/group-booking.tsx. Create forms to capture visitor counts, booking dates, and list detail arrays (Name, Age, Gender, Nationality, ID Proof Type, and ID Proof Number). Add field validations: visitor count is 1 for Solo, and between 2 to 10 for Group; ages must be valid numbers; ID proofs must not be blank. On submission, write the booking details to the public.darshan_bookings table, and map each member row into public.darshan_booking_members referencing the parent booking ID. If the insert succeeds, navigate the screen to 'booking-success' showing the generated booking number. Utilize Framer Motion transitions between wizard step panels.
  ```

---

### Ticket 3: Digital QR Pass Generation & Details View
- **Priority:** Must-Have for Launch
- **Dependencies:** Ticket 2 (Darshan Booking Flow)
- **Description:** Create the digital pass screen. It must load upcoming active passes for the authenticated user, format pass details, and render a scannable client-side QR Code encoding verification parameters.
- **Acceptance Criteria:**
  1. Fetches data from `darshan_bookings` where status is `upcoming` and profile matches.
  2. Integrates the `qrcode` library to compile metadata into a scan code.
  3. The QR code must encode a verification payload string: `KSJ-PASS-VERIFY:booking_number=<NUM>;holder=<NAME>;date=<DATE>;visitors=<COUNT>`.
  4. Renders details clearly: Date, Booking Number, Pilgrim Count, and Status with custom theme ornaments.
- **AI Coding Tool Prompt:**
  ```text
  Create the QR Pass generator component in components/screens/qr-pass.tsx. Using the qrcode library, write a client-side renderer that takes the active devotee's upcoming booking from public.darshan_bookings and compiles the verification parameters (booking number, primary holder name, booking date, visitor count) into a secure verification string: "KSJ-PASS-VERIFY:booking_number=<NUM>;holder=<NAME>;date=<DATE>;visitors=<COUNT>". Render the compiled QR code image alongside the readable ticket attributes in a glassmorphic container using Ivory base layout (#FAF6F0) and dark gold accents (#D4AF37). Show a skeleton loader while the booking data loads.
  ```

---

### Ticket 4: Real-time Infrastructure Trackers (Crowd, Traffic & Parking)
- **Priority:** Should-Have
- **Dependencies:** None
- **Description:** Implement live monitoring widgets displaying real-time levels of temple crowd congestion, parking slot capacities, and road traffic status. This component must subscribe to real-time database channels to update statistics instantly.
- **Acceptance Criteria:**
  1. Display three columns/tabs: Crowd Status (Toran Dwar, Temple Queue, exit gates), Parking blocks, and Traffic.
  2. Parking displays total slots vs. occupied slots and colors badges dynamically (Green: <70% full, Amber: 70-90%, Red: >90% full).
  3. Real-time updates occur via Supabase `.on('postgres_changes')` subscriptions on tables `parking_blocks`, `traffic_updates`, and system status configs.
  4. Includes pull-to-refresh action for manual fetching.
- **AI Coding Tool Prompt:**
  ```text
  Build the live infrastructure tracking screens in components/screens/parking.tsx and components/screens/traffic.tsx. Hook up real-time database listeners using the Supabase client to subscribe to updates on the public.parking_blocks and public.traffic_updates tables. In the UI, represent parking capacities using clean progress bars that dynamically transition in color (Green for open slots, Amber for limited, Red for full). Display traffic congestion levels at major gates using alert badges (Low, Medium, Heavy) styled according to the design system palette. Make sure the component cleans up DB subscription listeners when unmounting.
  ```

---

### Ticket 5: Service Booking Engine (Hotels, Transport & Prashad)
- **Priority:** Should-Have
- **Dependencies:** Ticket 1 (Devotee Authentication)
- **Description:** Build the Services tab containing booking portals for local hotels, transport links (Shyam Bus, e-chariots), Prashad pre-orders, and emergency support directories.
- **Acceptance Criteria:**
  1. Renders a service directory grid with navigation to sub-screens.
  2. Hotel Booking: Lists available Dharamshalas and hotels, filters by price/rating, and allows booking checks.
  3. Prashad ordering: Devotees select Prashad packet types, pre-pay simulated totals, and secure pick-up tokens.
  4. All service reservations write records to respective tables (`hotel_bookings`, `services_bookings`).
- **AI Coding Tool Prompt:**
  ```text
  Implement the Services and Places navigation hub in components/screens/services.tsx along with booking interfaces for hotel accommodations (components/screens/services/hotel-booking.tsx) and Prashad orders (components/screens/services/prashad.tsx). Load hotels dynamically from the public.hotels table. For bookings, collect reservation dates, check-in schedules, visitor counts, and write them to public.hotel_bookings. For Prashad pre-orders, show a quantities-counter form, calculate the total price, and insert a new order record into the database, generating a pick-up pass token. Style the interfaces with glassmorphic cards and standard Ivory inputs.
  ```

---

### Ticket 6: Shyam Path Interactive GPS Map Navigation
- **Priority:** Should-Have
- **Dependencies:** None
- **Description:** Embed an interactive GPS map using Google Maps JS API for locating checkpoints, first-aid centers, shoe storage, drinking water spots, and toilets along the main walking path (Shyam Path).
- **Acceptance Criteria:**
  1. Bootstraps Google Maps using `@googlemaps/js-api-loader`.
  2. Embeds maps centering coordinates of Khatu Shyam Ji temple (`27.3732° N, 75.3999° E`).
  3. Places custom markers with Lucide icon SVG indicators for facilities (Water, Restroom, Medical, Shoe Racks).
  4. Computes geodesic distance and estimated walking duration from the pilgrim's current location to Toran Dwar.
- **AI Coding Tool Prompt:**
  ```text
  Build the interactive navigation map screen in components/screens/khatu-path.tsx and components/screens/how-to-reach.tsx. Load the Google Maps JavaScript API via the js-api-loader package using the NEXT_PUBLIC_GOOGLE_MAPS_API_KEY. Render a map centered on the Khatu Shyam Ji temple. Map location coordinate arrays representing facilities (First Aid, Drinking Water, Shoe Racks, and Restrooms) and place markers using clean SVG icons matching the Maroon (#800000) and Gold (#D4AF37) color palette. Use the HTML5 Geolocation API to request the user's current location, calculate the walking route to Toran Dwar, and output the estimated distance and walking duration.
  ```

---

### Ticket 7: Lost & Found Directory & Reporter
- **Priority:** Nice-to-Have
- **Dependencies:** Ticket 1 (Devotee Authentication)
- **Description:** Build the Lost & Found listing and report module. Devotees browse registered found items or file reports for lost items with descriptions, dates, locations, and photo attachments.
- **Acceptance Criteria:**
  1. Displays lists under two tabs: "Lost Items" and "Found Items".
  2. "Report Item" button opens a form collecting Item Name, Category, Date Lost/Found, Location, Details, and optional Photo.
  3. Uploads image attachments to Supabase storage bucket (`lost-found-photos`).
  4. Saves form records in `public.lost_found_items` table.
- **AI Coding Tool Prompt:**
  ```text
  Create the Lost & Found module in components/screens/lost-found.tsx. Build a tabbed interface splitting listings between 'Lost' and 'Found'. Include a modal form to report a new item containing inputs for Name, Category, Approximate Time, Location within premises, Contact Info, and an Image Upload button. If an image is selected, upload it to the Supabase storage bucket 'lost-found-photos' and fetch the public URL. Write the final entry to the public.lost_found_items table. Style list entries using card outlines, displaying statuses (Reported, Claimed, Verifying) with distinct badge colors.
  ```

---

### Ticket 8: Shyam Sahayak AI Chatbot Companion
- **Priority:** Should-Have
- **Dependencies:** None
- **Description:** Set up the AI chatbot screen (`Shyam Sahayak`). The chatbot must answer query prompts regarding temple guidelines, timing, crowd density, and services, offering responsive answers with auto-scrolling message streams.
- **Acceptance Criteria:**
  1. Renders scrollable chat conversation view with messages grouped by sender (User vs. AI Assistant).
  2. Sends user messages to Next.js API endpoint `/api/chat/shyam-sahayak` via POST.
  3. Displays typing/loading state during API queries.
  4. Supports smooth physics-based scroll-to-bottom on new messages.
- **AI Coding Tool Prompt:**
  ```text
  Implement the Shyam Sahayak chatbot interface in components/screens/shyam-sahayak.tsx. Create a chat screen displaying scrollable conversation bubbles. Send user inputs via POST to /api/chat/shyam-sahayak and parse the response content. Render typing placeholder dots when awaiting the response. Style user message bubbles using the brand's Maroon-to-Saffron gradient and assistant bubbles in soft Ivory (#FAF0E4) with Charcoal text (#1A120B). Implement auto-scroll to the bottom of the container whenever a message is added.
  ```

---

### Ticket 9: Admin Workspace & Control Room Dashboard
- **Priority:** Must-Have for Launch
- **Dependencies:** Ticket 1 (Devotee Authentication)
- **Description:** Implement the Admin panel workspace (`AdminWorkspace`). Admins must log in using specific Admin codes and passwords, view bookings, update the status of parking zones, toggle queue warning levels, and publish system announcements.
- **Acceptance Criteria:**
  1. Admin panel is restricted via authentication state checking for admin roles (`admins` table).
  2. Dashboard displays overview metrics (Total bookings today, active crowd levels, parking status).
  3. Allows editing fields: Toggling crowd level indicator state (Low, Medium, High), updating parking spaces, and posting messages to announcements.
  4. Modifications write changes immediately to respective database tables.
- **AI Coding Tool Prompt:**
  ```text
  Implement the temple control room workspace in components/admin/admin-workspace.tsx and components/admin/screens/admin-login.tsx. Set up the authentication checks querying public.admins and admin_roles_bridge to restrict access. On the dashboard, build interfaces to update live crowd statuses (Low, Medium, High) and parking blocks occupancy. Include a form to compose announcements that inserts records into the public.announcements table. Build the panel using a robust administration layout with a sidebar menu, data grids for incoming bookings, and quick-toggle status switches.
  ```

---

### Ticket 10: Multi-Language & Bhakti Audio Integration
- **Priority:** Should-Have
- **Dependencies:** None
- **Description:** Complete the global context wrappers supporting English & Hindi language translation switches and background Bhakti audio controls.
- **Acceptance Criteria:**
  1. Clicking language toggle changes active text translations instantly across all views using `LanguageContext`.
  2. Language states are persisted in local storage so preference survives page refresh.
  3. Audio controllers support starting, pausing, and adjusting volume of devotional Bhajan background tracks (`AudioContext`).
  4. App background visual theme dynamically updates color accents based on time-of-day changes.
- **AI Coding Tool Prompt:**
  ```text
  Refine the language toggles and audio controls across the app using lib/contexts/LanguageContext.tsx and lib/contexts/AudioContext.tsx. Ensure all screens (Home, Book, Services, Profile) fetch translated keys via the translation function t(). Add persistency to the active language using LocalStorage. In the audio system, wire play/pause/mute buttons on the global header to play the temple Bhajan stream. Implement the visual time-of-day theme adapter that shifts backgrounds dynamically: soft golden Ivory (#FAF6F0) for morning/afternoon, and deep warm dusk/evening hues (#2D1E12) for nighttime.
  ```
