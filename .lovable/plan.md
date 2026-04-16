
# MedFlow Nexus — Part 1: Foundation + Architecture + UI System

## Design System
- **Dark premium theme** with glassmorphism effects
- Primary accent: teal/cyan neon (`oklch` based)
- Dark background with glass-effect cards (backdrop-blur, subtle borders)
- Smooth transitions and hover effects throughout
- Custom CSS variables for the full palette in styles.css

## Pages & Routes

### 1. Landing Page (`/`)
- Hero section: "MedFlow Nexus" headline + "AI-Powered Central Nervous System for Tamil Nadu Hospitals" subheadline
- Two CTA buttons: "Launch Platform" → `/dashboard`, "View Intelligence Demo"
- Animated metrics strip showing key healthcare stats (bed capacity, patient flow, AI predictions, districts covered)
- Glassmorphic cards showcasing key capabilities
- Tamil Nadu healthcare context throughout

### 2. Dashboard Shell (`/dashboard`)
- Layout route with **sidebar + top navbar**
- **Sidebar**: collapsible, glassmorphic, with nav links to all modules (icons + labels)
- **Top navbar**: search, notifications bell, user avatar area
- Dashboard home shows **wireframe layout zones**:
  - KPI cards row (4 cards with labeled placeholders)
  - Center map zone (labeled "Tamil Nadu District Map — Coming in Part 2")
  - Side alerts zone
  - Charts zone (2-3 chart placeholders)
  - AI Recommendation feed zone

### 3. Module Placeholder Pages (wireframe layouts)
Each page gets labeled empty zones showing where widgets will go:

- `/dashboard/capacity` — Capacity Intelligence (bed grid, occupancy chart, prediction zone)
- `/dashboard/workforce` — Workforce Intelligence (staff table, shift chart, fatigue zone)
- `/dashboard/equipment` — Equipment Intelligence (device list, maintenance timeline, utilization chart)
- `/dashboard/patient-flow` — Patient Flow (flow diagram zone, wait times, admission chart)
- `/dashboard/emergency` — Emergency Mode (alert panel, surge map, resource dispatch zone)
- `/dashboard/simulation` — Simulation Lab (parameter controls, simulation output, scenario cards)
- `/dashboard/reports` — Reports (report list, export zone, analytics summary)
- `/dashboard/settings` — Settings (profile, system config, API connections panel)

## Architecture
- Clean component structure: `src/components/layout/`, `src/components/ui/`, `src/components/dashboard/`
- Shared layout component for dashboard pages (sidebar + navbar)
- Placeholder data folder `src/data/` ready for real Tamil Nadu datasets in Part 2
- API folder `src/api/` stubbed for future FastAPI integration
- All zones clearly labeled with what data/component will fill them

## Key Components
- `DashboardLayout` — sidebar + topbar wrapper with `<Outlet />`
- `GlassCard` — reusable glassmorphic container
- `KPICard` — metric display card with icon, value, trend
- `WireframeZone` — labeled placeholder showing future content name and dimensions
- `AnimatedMetricsStrip` — scrolling/animated stats for landing page
