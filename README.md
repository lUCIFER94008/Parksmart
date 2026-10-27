# ParkSmart — Smart Parking Availability and Reservation System

ParkSmart is a full-stack smart parking discovery, reservation, and automated gate validation system built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **MongoDB / Mongoose**.

---

## 🌟 Key Features

1. **Smart Discovery & Instant Booking**
   - Search parking garages by destination, neighborhood, or facility name.
   - Filter by vehicle type (Standard Car, Electric Vehicle with Level-2/DC Fast Charging, Motorcycle, Wheelchair Accessible).
   - Filter by price, amenities (24/7 access, CCTV security, covered parking, elevator), and distance.
   - List View and Interactive Area Map View.

2. **Atomic Conflict-Free Reservation Engine**
   - Server-side overlapping interval check ensures zero double-booking:
     `newStart < existingEnd && newEnd > existingStart`
   - Real-time availability calculated for the user's requested time window.
   - Dynamic server-side price recalculation with transparent tax and service fee breakdown.
   - Preserved booking-time pricing snapshot.

3. **Touchless Digital QR Parking Passes**
   - Instant cryptographic QR pass generated upon reservation confirmation.
   - On-screen pass with facility directions, reserved slot number, vehicle plate, and time window.
   - Ready for mobile presentation, download, or one-click printing.

4. **Dedicated Multi-Role Dashboards**
   - **Driver Dashboard (`/dashboard`)**: Active parking session banner, upcoming/completed bookings, and registered vehicle manager.
   - **Operator Scanner (`/operator`)**: Simulated live gate camera feed, QR pass validation, check-in barrier trigger, check-out processing, and active session manager.
   - **Admin Console (`/admin`)**: Facility occupancy metrics, revenue stats, bookings master table with CSV export, and access control.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** v18+ (tested on v24)
- **npm** v10+

### 2. Environment Configuration
Copy the template environment file:
```bash
cp .env.example .env.local
```

Configure your variables in `.env.local`:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/parksmart
AUTH_SECRET=development-secret-must-be-at-least-32-characters-long
NEXTAUTH_URL=http://localhost:3000
```
> **Note on Demo Mode**: If MongoDB is not yet connected or configured, ParkSmart automatically activates its verified operational demo mode with pre-configured facilities and slots so you can evaluate the UI and workflows immediately.

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Automated Unit Tests
```bash
npm test
```
Executes the Vitest test suite testing interval overlap conflict detection, boundary condition rules, turnover buffers, and server-side pricing calculators.

### 5. Seed Database
When MongoDB is running:
```bash
npm run seed
```
Creates:
- 1 Super Administrator (`admin@parksmart.io` / `Password123!`)
- 2 Parking Operators (`operator@parksmart.io` / `Password123!`)
- 2 Regular Drivers (`driver@parksmart.io` / `Password123!`)
- 5 Parking Facilities across Metro City
- 80+ Parking Slots across Floor 1 & Floor 2
- Registered vehicles, active sessions, and booking records

---

## 📱 Quick Navigation & Demo Accounts

| Portal | URL | Demo Credentials |
| :--- | :--- | :--- |
| **Homepage** | [`/`](http://localhost:3000) | Public |
| **Search & Map** | [`/parking`](http://localhost:3000/parking) | Public |
| **Sign In** | [`/auth/login`](http://localhost:3000/auth/login) | Quick-Fill buttons available |
| **Driver Portal** | [`/dashboard`](http://localhost:3000/dashboard) | `driver@parksmart.io` / `Password123!` |
| **Operator Scanner** | [`/operator`](http://localhost:3000/operator) | `operator@parksmart.io` / `Password123!` |
| **Admin Console** | [`/admin`](http://localhost:3000/admin) | `admin@parksmart.io` / `Password123!` |

---

## 🏗️ Project Architecture

```
app/
├── page.tsx                     # Landing page with hero search & featured facilities
├── layout.tsx                   # Root layout with Navbar, Footer & Sonner toast engine
├── globals.css                  # Modern Tailwind v4 tokens & emerald color palette
├── parking/
│   ├── page.tsx                 # Search results with filters, sorting & map toggle
│   └── [id]/
│       ├── page.tsx             # Facility details server page
│       └── ParkingDetailClient.tsx # Interactive slot visualizer & checkout
├── auth/
│   ├── login/page.tsx           # Authentication with quick-fill role presets
│   └── register/page.tsx        # Driver registration
├── dashboard/page.tsx           # User bookings, active session & vehicle manager
├── operator/page.tsx            # Operator camera QR scanner & gate controller
├── admin/page.tsx               # Analytics, occupancy, facilities & CSV export
└── api/
    ├── parking/route.ts         # Parking search & query endpoint
    ├── parking/[id]/slots/route.ts # Slot interval availability engine
    ├── bookings/route.ts        # Reservation creation with conflict prevention
    └── operator/validate-qr/route.ts # QR pass validation

components/
├── layout/Navbar.tsx            # Brand header, links & role switcher
├── layout/Footer.tsx            # Platform footer with support links
├── home/HeroSearch.tsx          # Hero section with interval search form
├── home/StatsSection.tsx        # Operational live availability metrics
├── home/FeaturedLocations.tsx   # Verified facility cards
├── home/HowItWorks.tsx          # 4-step workflow guide
├── home/BenefitsSection.tsx     # Enterprise feature highlights
└── home/TestimonialsSection.tsx # Verified pilot user feedback

lib/
├── booking/conflict.ts          # Overlapping interval conflict detection engine
├── pricing/calculator.ts        # Server-side pricing recalculation
├── db/mongodb.ts                # Resilient connection pooling
└── data/sample-parking.ts       # Curated facilities dataset

models/
├── User.ts
├── Vehicle.ts
├── ParkingLocation.ts
├── ParkingSlot.ts
├── Booking.ts
├── ParkingSession.ts
├── Notification.ts
└── AuditLog.ts

tests/
└── booking.test.ts              # Unit tests for conflicts & pricing formulas
```
