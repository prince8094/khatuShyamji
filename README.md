# Smart Pilgrim Management System — Khatu Shyam Ji

## The Team : Diya Goyal, Prince Gupta, Priyanshu Mangal, Vijay Gupta, Shahanaj Khan, Jeneel Dangi, Pragya Kanwar, Aarul Sharma.

An interactive, premium, and feature-rich Next.js web application built to streamline and enhance the pilgrimage experience for devotees visiting the holy town of **Khatu Shyam Ji**. This system integrates live temple updates, Darshan bookings, infrastructure tracking, emergency services, and administrative workspaces.

🔗 **Live Application URL:** [https://khatu-shyamji-opal.vercel.app/?screen=welcome](https://khatu-shyamji-opal.vercel.app/?screen=welcome)

---

## Key Features

### 1. Devotee Portal (Client App)
- **Darshan Booking & digital passes:** Supports both Solo and Group bookings with validation for passenger details, age, and ID proofs. Generates a secure QR Pass for entry verification.
- **Live Crowd & Traffic Status:** Real-time updates on crowd congestion levels at different checkpoints, vehicle parking availability, and road traffic status.
- **Interactive Navigation (Shyam Path):** Real-time mapping, walking paths, and guidance to help pilgrims navigate the town easily.
- **Services & Amenities:**
  - **Pre-orders & Bookings:** Hotel lodging search/booking, local transport assistance, Prashad orders, and donation portals.
  - **Special Assistance:** Dormitory reservations, E-chariot booking, wheelchair support, and first-aid medical response.
- **Lost & Found Directory:** Integrated board to report lost items or view items found within the temple premises.
- **Shyam Sahayak AI Chatbot:** An intelligent, context-aware AI assistant helping users clear their doubts about temple hours, guidelines, routes, and services.
- **Rich Aesthetics & Localization:**
  - Full multi-language support (English & Hindi) toggled seamlessly.
  - Interactive background themes matching the time of day.
  - Devotional audio mode (Bhakti mode with ambient bhajan music controls).

### 2. Control Room & Admin Workspace
- **Dynamic System Controls:** Manage real-time crowd alerts, parking space capacity, road blockages, and active notices.
- **Booking Management:** Track, verify, or modify pilgrim passes.
- **Hotel & Service Registries:** Admin console for mapping local accommodations, assign active operators, and process feedback.

---

## Tech Stack

- **Frontend Framework:** [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **State Management & UI Shell:** Context-based multi-screen application layout with responsive navigation drawer and audio managers.
- **Styling & Animations:** [Tailwind CSS v4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/) (for smooth page transitions and micro-animations), Base UI, and Tw-animate.
- **Database & Backend Services:** [Supabase](https://supabase.com/) (Postgres DB integration for authentication, profiles, bookings, and services).
- **APIs & Utilities:** Google Maps API (Loader), Lucide React Icons, and Dynamic QR Code Generation.

---

## Project Structure

```bash
KhatuShyamji/
├── app/                  # Next.js App Router (Layouts & main Shell page)
├── components/           # UI Components
│   ├── admin/            # Admin workspace dashboards and specs
│   ├── screens/          # Individual app screens (Auth, Darshan, Services, etc.)
│   ├── ui/               # Reusable primitive UI widgets (Buttons, Inputs, etc.)
│   └── shared/           # Common components and helpers
├── lib/                  # State contexts, schema configurations, mock/static data
│   ├── contexts/         # Audio and Language context providers
│   └── supabase.ts       # Supabase client instantiation
├── supabase/             # Supabase migrations, configurations, and seed SQLs
├── public/               # Static assets (images, icons, vectors)
├── schema.sql            # Main database schema and ERD specifications
└── package.json          # Node dependencies and scripts
```

---

## Database Schema & Relational Design

The backend uses a PostgreSQL schema managed by **Supabase**. The core tables include:
- `profiles`: User information, phone, avatar link, and city.
- `admins` & `roles`: Multi-tenant role configurations (System Admin, Hotel Manager, Parking Operator, Temple Desk).
- `darshan_bookings` & `darshan_booking_members`: Relational data mapping solo/group ticket bookings.
- `hotels` & `hotel_bookings`: Management of pilgrim accommodation.
- `parking_blocks`: Slot availability, coordinates, and real-time status.
- `lost_found_items`: Database of claimed and unclaimed pilgrim assets.

Full database blueprints, ERDs, and specification documents can be found in [database_design.md](file:///c:/Users/princ/KhatuShyamji/database_design.md).

---

## Getting Started Locally

Follow these steps to run the application on your computer:

### 1. Clone the repository
```bash
git clone <repository-url>
cd KhatuShyamji
```

### 2. Install dependencies
```bash
npm install
# or
pnpm install
```

### 3. Setup environment variables
Create a `.env.local` file in the root directory and configure the following keys:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 4. Run the development server
```bash
npm run dev
# or
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 5. Build for production
```bash
npm run build
npm run start
```

---

## Contribution & License
This project is built for the smart administration of religious tourism and holy sites. Feel free to open issues or pull requests to improve the platform's utility!


