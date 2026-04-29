# DCreators — Master Project Reference

> **Purpose:** Single source of truth for any AI model or developer working on this project.  
> **Last Updated:** 2026-04-26  
> **Tech Stack:** Expo (React Native) + Supabase + Next.js (Admin)

---

## 1. PRODUCT OVERVIEW

DCreators connects **Clients** (who need creative work) with **Consultants** (photographers, designers, sculptors, artisans).

| Surface | Tech | Purpose |
|---------|------|---------|
| **Mobile App** | Expo / React Native | Client & Consultant (same app, role-based UI) |
| **Admin Website** | Next.js + Tailwind | Full platform control for administrators |
| **Backend** | Supabase (Auth + Postgres + Storage + Realtime) | All data, auth, files, notifications |

---

## 2. USER ROLES & ACCESS MODEL

**Key Rule: NO permanent roles. One account, flexible access.**

- Every verified user = **Client by default** (after basic signup)
- Consultant = Client + completed consultant onboarding
- **Role selection happens at each login** — user picks "Enter as Client" or "Enter as Consultant"
- If user picks Consultant but hasn't onboarded → redirect to Consultant Onboarding
- **Admin** is a separate login on the web dashboard (not in mobile app)

---

## 3. AUTHENTICATION FLOW

**Method:** Email + OTP via Supabase Auth with Gmail SMTP

### Setup:
1. Create Supabase project → Authentication → SMTP Settings → Enable Custom SMTP
2. Gmail SMTP: `smtp.gmail.com`, port 587, TLS, use Gmail App Password
3. Enable Email OTP in Authentication → Providers → Email

### Flow:
```
Splash → Welcome → Login (Email + Basic Info) → OTP Verify
  → Role Selection (Client / Consultant)
    → Client: ClientDashboard
    → Consultant (has profile): ConsultantDashboard
    → Consultant (no profile): ConsultantOnboarding → ConsultantDashboard
```

---

## 4. DATABASE SCHEMA (Supabase / Postgres)

### 4.1 profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT, address TEXT, pin TEXT,
  avatar_url TEXT,
  has_consultant_profile BOOLEAN DEFAULT FALSE,
  is_banned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.2 consultant_profiles
```sql
CREATE TABLE consultant_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL, -- D101, D207
  category TEXT NOT NULL, -- photographer, designer, sculptor, artisan
  subtitle TEXT, experience TEXT, expertise TEXT, bio TEXT,
  portfolio_images TEXT[],
  base_price DECIMAL(10,2),
  is_approved BOOLEAN DEFAULT FALSE, -- Admin must approve
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.3 categories
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0
);
```

### 4.4 projects (assignments)
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES profiles(id),
  consultant_id UUID REFERENCES consultant_profiles(id),
  assignment_type TEXT NOT NULL,
  assignment_details TEXT[],
  assignment_brief TEXT NOT NULL,
  deadline DATE,
  budget DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  -- Status flow: pending → accepted → advance_paid → in_progress →
  -- review_1 → review_2 → final_review → approved → balance_paid → completed
  progress_percent INTEGER DEFAULT 0,
  milestone_1_date DATE, milestone_2_date DATE, final_date DATE,
  final_offer DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.5 floating_queries
```sql
CREATE TABLE floating_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES profiles(id),
  assignment_type TEXT NOT NULL,
  assignment_brief TEXT NOT NULL,
  budget_min DECIMAL(10,2), budget_max DECIMAL(10,2),
  deadline DATE,
  status TEXT DEFAULT 'open', -- open, closed, expired
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.6 floating_query_responses
```sql
CREATE TABLE floating_query_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_id UUID REFERENCES floating_queries(id),
  consultant_id UUID REFERENCES consultant_profiles(id),
  proposed_price DECIMAL(10,2),
  proposed_timeline TEXT, message TEXT,
  status TEXT DEFAULT 'pending', -- pending, accepted, rejected
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.7 submissions
```sql
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  round TEXT NOT NULL, -- review_1, review_2, final
  files TEXT[] NOT NULL,
  consultant_note TEXT,
  selected_option INTEGER,
  feedback_colour BOOLEAN DEFAULT FALSE,
  feedback_concept BOOLEAN DEFAULT FALSE,
  feedback_design_look BOOLEAN DEFAULT FALSE,
  feedback_text TEXT,
  client_action TEXT, -- approve, revert, hold, cancel
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.8 payments
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  payer_id UUID REFERENCES profiles(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_type TEXT NOT NULL, -- advance, balance
  status TEXT DEFAULT 'pending', -- pending, completed, failed, refunded
  razorpay_order_id TEXT, razorpay_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.9 notifications
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL, message TEXT NOT NULL,
  type TEXT, -- assignment, payment, review, system
  is_read BOOLEAN DEFAULT FALSE,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.10 shop_products
```sql
CREATE TABLE shop_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id UUID REFERENCES consultant_profiles(id),
  title TEXT NOT NULL, description TEXT,
  price DECIMAL(10,2) NOT NULL,
  images TEXT[], category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. MOBILE APP ARCHITECTURE

### Navigation Structure
```
Root Stack
├── Splash, Welcome, Login, OTPVerification, RoleSelection
├── ConsultantOnboarding (3 steps)
├── ClientMain (Tab Navigator)
│   ├── ClientDashboard (Discovery Hub)
│   ├── Search
│   └── History (My Projects)
├── ConsultantMain (Tab Navigator)
│   ├── ConsultantDashboard (My Workorders)
│   ├── MyShop
│   └── History (Completed Work)
└── Shared Screens: CreatorProfile, AssignProject, Chat, Payment, Review, etc.
```

### Client vs Consultant Dashboard

| Feature | Client | Consultant |
|---------|--------|------------|
| Hero | Browse creators | My active workorders |
| Cards | Creator cards (hire) | Project cards (manage) |
| Action Banner | "Assign Project / Shop" | "My Shop / Earnings" |
| Bottom Nav | Home, Search, History | Home, My Shop, History |

### State Management: Zustand
- `useAuthStore` — user, profile, consultantProfile, currentRole
- `useProjectStore` — active projects, submissions
- `useNotificationStore` — unread count, notifications list

---

## 6. ADMIN WEBSITE (Next.js)

### Pages
```
/login, /dashboard, /users, /consultants, /projects,
/payments, /categories, /notifications, /settings
```

### Capabilities
1. User Management (view, ban/unban)
2. Consultant Approval (approve/reject profiles)
3. Project Oversight (all projects, statuses, disputes)
4. Payment Tracking (history, refunds)
5. Category Management (CRUD)

---

## 7. CORE FLOWS

### Flow A: Direct Hire
```
Client browses → taps Creator → views Profile → taps Hire
→ fills Assign Project form → submits → Consultant notified
→ Consultant sets timeline + offer → Client pays advance (mock)
→ Workorder generated → Consultant submits Round 1
→ Client reviews/feedbacks → Round 2 → Final → Client approves
→ Client pays balance → Download unlocked → DONE
```

### Flow B: Floating Query
```
Client posts query (type, brief, budget range)
→ Consultants respond with price/timeline
→ Client accepts one → continues as Direct Hire from step 6
```

### Flow C: Shop
```
Consultant adds product → appears in Shop
→ Client browses → purchases → delivery
```

---

## 8. PHASED PLAN

### Phase 1: Foundation (Week 1-2) ✅ COMPLETE (2026-04-27)
- ✅ Supabase project created + Gmail SMTP configured
- ✅ All 10 DB tables created with CHECK constraints
- ✅ All RLS security policies deployed
- ✅ Auto-profile-creation trigger (on auth.users insert)
- ✅ 4 default categories seeded (photographer, designer, sculptor, artisan)
- ✅ Zustand auth store (`useAuthStore.ts`) — OTP send, verify, profile fetch, role switch
- ✅ TypeScript types for all entities (`src/types/index.ts`)
- ✅ Supabase client with AsyncStorage session persistence
- ✅ LoginScreen (email-only) + RegisterScreen (full form) — separate flows
- ✅ OTPVerificationScreen — 8-digit input, auto-focus, resend limits
- ✅ IntroScreen (role selection) wired to auth store
- ✅ App.tsx initializes auth on startup
- ✅ Wire Consultant Onboarding (both flows) to save to `consultant_profiles`
- ✅ Role-based navigation (BottomNavigation reads currentRole from Zustand)
- ✅ BottomNavigation shows different tabs per role (Client vs Consultant)
- ✅ Image upload via expo-image-picker (Register + CreatorOnboarding)
- ✅ Full end-to-end flow tested

### Phase 2: Client Core (Week 3-4) ✅ COMPLETE (2026-04-27)
- ✅ Dashboard fetches real `consultant_profiles` from Supabase (with fallback)
- ✅ Search screen — live Supabase queries with debounce + category filter pills + demo fallback
- ✅ CreatorProfile — handles both mock & real data, shows price/category, "Hire" button for clients
- ✅ Assign Project form — editable fields, saves to `projects` table, pre-fills consultant
- ✅ Mock payment summary (Step 2) — advance/balance split display
- ✅ Enriched demo data — real Indian institutions, unique codes, pricing
- ✅ Full client flow tested

### Phase 3: Consultant Core (Week 5-6) ✅ COMPLETE (2026-04-27)
- ✅ Consultant Dashboard — role-aware, shows assigned projects from `projects` table
- ✅ Accept/Reject project assignments with confirmation alerts
- ✅ Timeline/offer submission — editable milestones + final offer saved to Supabase
- ✅ Workorder screen wired to real project data
- ✅ Edit Consultant Profile — change photo, portfolio, categories, pricing anytime
- ✅ File upload for deliverables — modal with round selection, 3 images, note, saves to `submissions` table

### Phase 4: Review Cycle (Week 7-8) ✅ COMPLETE (2026-04-27)
- ✅ Client Dashboard — "My Active Projects" section with status chips + navigation to workorder
- ✅ Client Workorder — real project data, progress bar, "Review Submission" button
- ✅ Client Review — fetches submissions from Supabase, image carousel, option selection
- ✅ Approve / Request Changes — feedback checkboxes (Colour/Concept/Design Look) + text
- ✅ Status progression — approve moves to next phase, revert sends back to in_progress
- ✅ Balance payment flow — PaymentScreen with cost breakdown, method selector, Supabase persistence
- ✅ Payment notifications — consultant notified on advance/balance payment

### Phase 5: Secondary Features (Week 9-10) ✅ COMPLETE (2026-04-27)
- ✅ Notifications — real-time from Supabase, pull-to-refresh, mark read, clear all
- ✅ Notification triggers — auto-notify on design upload, review, payment
- ✅ Floating Queries — clients create queries, consultants browse open ones
- ✅ Shop — Supabase-backed product listing with search/filter, category pills, featured banner
- ✅ Chat — real-time project-scoped messaging via Supabase Realtime, date groups, auto-scroll
- ✅ Chat access — both client and consultant workorder screens have Chat buttons

### Phase 6: Admin Website (Week 11-12) ✅ COMPLETE (2026-04-27)
- ✅ Vite + React scaffold with dark premium theme
- ✅ Dashboard — 6 stat cards (users, consultants, projects, revenue, pending, active) + recent projects table
- ✅ Users — search, ban/unban toggle, consultant indicator
- ✅ Consultants — approve/revoke, detail modal with portfolio, pending/approved counts
- ✅ Projects — search, status filter, progress bars, detail modal
- ✅ Payments — revenue summary (total/advance/balance), payment history table
- ✅ Categories — full CRUD (add, edit inline, delete)

---

## 9. CURRENT STATUS (Updated: 2026-04-27)

### Backend ✅
- **Supabase** — live project at `pkuhdcrcpfvdwbhsnrfg.supabase.co`
- **Database** — all 10 tables created with RLS + trigger
- **Auth** — Email OTP working via Gmail SMTP
- **Categories** — 4 defaults seeded

### Mobile App — Partially Connected
- **37 screens built** — mostly UI-only
- **Auth flow CONNECTED:** Login → OTP → Role Selection (real Supabase auth)
- **State management:** Zustand installed, `useAuthStore` operational
- **Session persistence:** AsyncStorage — returning users stay logged in
- **Still UI-only:** Dashboard, Search, Profile, Payment, Review, Chat, Shop, etc.

### Admin Website
- **Scaffolded** — Next.js + Tailwind, static mock only

### New Files Created This Session
- `src/types/index.ts` — TypeScript types for all DB entities
- `src/store/useAuthStore.ts` — Zustand auth store
- `supabase-schema.sql` — Complete DB schema (runnable)

### Files Modified This Session
- `src/lib/supabase.ts` — Added AsyncStorage for sessions
- `src/screens/LoginScreen.tsx` — Real OTP via Supabase
- `src/screens/OTPVerificationScreen.tsx` — 8-digit OTP, auto-focus
- `src/screens/IntroScreen.tsx` — Role selection wired to store
- `App.tsx` — Auth initialization on startup

---

## 10. DEVELOPMENT RULES

1. Never hardcode user data — always fetch from Supabase
2. Always check `currentRole` before rendering dashboard
3. Consultant profiles MUST be admin-approved before appearing in search
4. Payments follow strict order: advance → work → balance → download
5. Final artwork locked until balance payment confirmed
6. All screens must handle: Loading, Error, Empty, Success states
7. Navigation must be role-aware (different tab bars per role)
8. Use TypeScript strictly — no `any` in new code
9. Supabase RLS is mandatory — users only access their own data
10. Admin is web-only — never mix admin features into mobile app

---

## 11. ENV VARIABLES

### Mobile (.env)
```
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=dcreators
```

### Admin (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## 12. PROJECT STATUS MACHINE (EXACT TRANSITIONS)

**NEVER skip a status. NEVER go backwards except via cancellation.**

```
pending ──[consultant accepts]──► accepted
accepted ──[client pays advance]──► advance_paid
advance_paid ──[workorder auto-generated]──► in_progress
in_progress ──[consultant uploads round 1]──► review_1
review_1 ──[client gives feedback / reverts]──► in_progress (back for revision)
review_1 ──[consultant uploads round 2]──► review_2
review_2 ──[client gives feedback / reverts]──► in_progress
review_2 ──[consultant uploads final]──► final_review
final_review ──[client approves]──► approved
approved ──[client pays balance]──► balance_paid
balance_paid ──[download unlocked]──► completed

ANY STATUS ──[client cancels]──► cancelled
ANY STATUS ──[consultant rejects (before advance)]──► rejected
```

### Progress Mapping:
| Status | progress_percent |
|--------|-----------------|
| pending | 0 |
| accepted | 10 |
| advance_paid | 15 |
| in_progress | 20 |
| review_1 | 40 |
| review_2 | 60 |
| final_review | 80 |
| approved | 90 |
| balance_paid | 95 |
| completed | 100 |

---

## 13. BUSINESS RULES & EDGE CASES

### Authentication:
- OTP expires after 5 minutes
- Max 3 OTP resend attempts per session
- First-time user MUST fill Name, Email, Mobile (Address and Pin optional)
- Returning user only needs Email + OTP

### Role Selection:
- Shown every login — not stored as permanent preference
- If user selects "Consultant" but has no consultant_profile → force onboarding
- User can switch roles by logging out and re-selecting (not mid-session)

### Consultant Onboarding:
- 3 steps: (1) Work details + Category, (2) Portfolio upload, (3) Pricing
- ALL 3 steps must complete to create `consultant_profiles` row
- `is_approved = false` by default — Admin must approve before visible
- Categories are fixed: photographer, designer, sculptor, artisan
- Consultant code (D101, D207) is auto-generated: D + category_prefix + sequence_number

### Project Assignment:
- Client CANNOT assign to an unapproved consultant
- Client CANNOT assign to a banned user
- Budget is entered by client — consultant can counter with `final_offer`
- If consultant doesn't respond in 7 days → status changes to `expired` (future feature)
- Client can cancel BEFORE advance payment with no penalty
- Client CANNOT cancel AFTER advance payment (dispute flow needed — Phase 6)

### Payments:
- Advance payment = fixed % of budget (suggest 30%, configurable by admin)
- Balance = budget - advance
- Mock payments for MVP: simulate success after 3 seconds
- Real Razorpay integration: Phase 5+
- Payment records ALWAYS created even for mock payments (for audit trail)

### File Downloads:
- Final artwork files stored in Supabase Storage
- Files are private (authenticated access only)
- Download button is DISABLED (greyed out) until balance_paid status
- Download button turns GREEN only after balance payment confirmed
- Files should have signed URLs with expiration (24 hours)

### Notifications:
- Never send duplicate notifications for the same event
- Max 50 unread notifications per user (oldest auto-marked as read)
- Notifications persist for 90 days, then auto-deleted

---

## 14. NOTIFICATION TRIGGERS

| Event | Who Gets Notified | Type |
|-------|-------------------|------|
| Client assigns project | Consultant | assignment |
| Consultant accepts | Client | assignment |
| Consultant rejects | Client | assignment |
| Consultant submits timeline/offer | Client | assignment |
| Client pays advance | Consultant | payment |
| Workorder generated | Both | assignment |
| Consultant uploads design (any round) | Client | review |
| Client submits feedback/revert | Consultant | review |
| Client approves final design | Consultant | review |
| Client pays balance | Consultant | payment |
| Download unlocked | Client | payment |
| Floating query posted | Matching consultants | assignment |
| Consultant responds to query | Client | assignment |
| Client accepts query response | Consultant | assignment |
| Admin approves consultant | Consultant | system |
| Admin bans user | User | system |
| Shop product purchased | Consultant (seller) | payment |

---

## 15. UI / DESIGN CONVENTIONS (FROM EXISTING CODE)

### Color Palette:
| Usage | Color | Hex |
|-------|-------|-----|
| Primary Brand / Icons | Indigo | `#4338CA` |
| Buttons / CTA | Dark Navy | `#1B3A5C` |
| Login button | Near Black | `#1F1F1F` |
| Warning / OTP button | Amber | `#F59E0B` |
| Danger / Assign icon | Red | `#EF4444` |
| Background | Light warm gray | `#e0ded8` / `#ededed` |
| Text Primary | Dark gray | `#1F2937` |
| Text Secondary | Medium gray | `#4B5563` / `#6B7280` |
| Borders | Light gray | `#D1D5DB` |
| Section: Creators in Demand header | Dark gray | `#4D4D4D` |
| Section: Photographer's Archive | Near black | `#1A1A1A` |
| Section: Designer's Hub | Warm brown | `#4E3F30` |
| Header text (Creators) | Yellow | `#FACC15` |

### Typography:
- iOS: `Avenir-Heavy` (bold), `Avenir-Medium` (medium), `Avenir-Book` (body)
- Android: `sans-serif` (bold), `sans-serif-medium`, `sans-serif-light`
- Common pattern in code:
  ```typescript
  const fontMedium = Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium';
  const fontBody = Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif-light';
  const fontHeavy = Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif';
  ```

### Layout Conventions:
- All screens use `<ImageBackground source={require('../../assets/bg-texture.png')}>` as outer wrapper
- `<SafeAreaView>` with `edges={['top']}` inside the background
- `<TopHeader>` as the first child (hamburger + logo + search/bell/user icons)
- `<ActionBanner>` sits between content and BottomNavigation (on main dashboard screens only)
- Inputs: white/transparent bg, 1px border, borderRadius 10, padding 14-16
- Buttons: borderRadius 8-12, paddingVertical 16
- Cards: borderRadius 8-10, with Platform-specific shadows
- iOS bottom padding: `Platform.OS === 'ios' ? 28 : 0`

### Component Patterns:
- Navigation: React Navigation v7 (native stack + bottom tabs)
- Icons: `lucide-react-native` (NOT react-native-vector-icons)
- Images: `expo-image` for performance, `CloudImage` component for Cloudinary
- SafeArea: `react-native-safe-area-context`

### DO NOT CHANGE:
- The bg-texture.png background pattern (already established across all screens)
- The TopHeader layout (hamburger + D logo + search/bell/user)
- The color palette above (matches the PDF design mockups)
- lucide-react-native as icon library (already installed and used everywhere)
- Font family patterns (Avenir on iOS, sans-serif on Android)

---

## 16. DESIGN MOCKUP → SCREEN FILE MAPPING

| Pages | Description | Screen File | Status |
|-------|-------------|-------------|--------|
| 1 | Splash | `AnimatedSplashScreen.tsx` | ✅ Done |
| 2 | OTP Verification | `OTPVerificationScreen.tsx` | ⚠️ UI only |
| 3 | Role Selection (Client/Creator) | `WelcomeScreen.tsx` | ✅ Done |
| 5-6 | Consultant Onboarding | `CreatorOnboardingStep1/2/3.tsx` | ⚠️ UI only |
| 7-9 | Dashboard + Creator Profile | `DashboardScreen.tsx` + `CreatorProfileScreen.tsx` | ⚠️ UI only |
| 10 | Client Profile Setup | `ClientOnboardingScreen.tsx` | ⚠️ UI only |
| 12 | Client Dashboard | `DashboardScreen.tsx` (needs role split) | ⚠️ Shared |
| 13-14 | Search | `SearchScreen.tsx` + `FilterScreen.tsx` | ⚠️ UI only |
| 16-17 | Creator Profile + Portfolio | `CreatorProfileScreen.tsx` + `PortfolioGalleryScreen.tsx` | ⚠️ UI only |
| 19-20 | Floating Query Form | `FloatingQueryScreen.tsx` | ⚠️ UI only |
| 28-29 | Assign Project + Terms | `AssignProjectScreen.tsx` + `TermsScreen.tsx` | ⚠️ UI only |
| 30 | Payment (Advance) | `PaymentScreen.tsx` | ⚠️ UI only |
| 32-33 | Creator Workorder View | `CreatorWorkorderScreen.tsx` | ⚠️ UI only |
| 35 | Consultant Submits Timeline | `FinalizeOfferScreen.tsx` | ⚠️ UI only |
| 37-38 | Client Review (Rounds) | `ClientReviewScreen.tsx` | ⚠️ UI only |
| 42 | Balance Payment + Download | `PaymentScreen.tsx` (reuse) | ⚠️ UI only |
| 43-48 | Assignment Tracker states | `ClientWorkorderScreen.tsx` | ⚠️ UI only |
| N/A | Ratings/Reviews | `RatingReviewScreen.tsx` | ⚠️ UI only |
| N/A | Chat | `ChatScreen.tsx` | ⚠️ UI only |
| N/A | Shop | `ShopScreen.tsx` + `ProductDetailsScreen.tsx` | ⚠️ UI only |
| N/A | Settings | `SettingsScreen.tsx` | ⚠️ UI only |
| N/A | Menu/Drawer | `MenuScreen.tsx` | ⚠️ UI only |
| N/A | Messages | `MessagesListScreen.tsx` | ⚠️ UI only |
| N/A | Notifications | `NotificationsScreen.tsx` | ⚠️ UI only |
| N/A | Edit Profile | `EditProfileScreen.tsx` | ⚠️ UI only |
| N/A | Saved Creators | `SavedCreatorsScreen.tsx` | ⚠️ UI only |
| N/A | Invoice | `InvoiceScreen.tsx` | ⚠️ UI only |
| N/A | History | `HistoryScreen.tsx` | ⚠️ UI only |
| N/A | Assign Multiple | `AssignMultipleScreen.tsx` | ⚠️ UI only |

---

## 17. SUPABASE RLS POLICIES (TO IMPLEMENT)

```sql
-- profiles: users can read anyone's basic profile, but only edit their own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON profiles FOR SELECT USING (true);
CREATE POLICY "Own update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- consultant_profiles: only approved + active visible publicly
ALTER TABLE consultant_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved public read" ON consultant_profiles
  FOR SELECT USING (is_approved = true AND is_active = true);
CREATE POLICY "Own manage" ON consultant_profiles
  FOR ALL USING (auth.uid() = user_id);

-- projects: only involved parties can see
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Client sees own" ON projects
  FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Consultant sees assigned" ON projects
  FOR SELECT USING (
    consultant_id IN (SELECT id FROM consultant_profiles WHERE user_id = auth.uid())
  );

-- payments: only payer can see their payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own payments" ON payments
  FOR SELECT USING (auth.uid() = payer_id);

-- notifications: only recipient can see
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Admin bypasses all RLS via service_role key (used only in admin website backend)
```

---

## 18. GLOSSARY

| Term | Meaning |
|------|---------|
| **Client** | User who hires consultants or buys from shop |
| **Consultant** (aka Creator) | Professional offering creative services |
| **Assignment** | A project request from client to consultant |
| **Floating Query** | A broadcast request sent to multiple consultants |
| **Workorder** | Official document generated after advance payment |
| **Round / Review** | Design submission cycle (Round 1, Round 2, Final) |
| **Revert** | Client sends feedback asking for changes |
| **Advance** | First payment (before work starts) |
| **Balance** | Final payment (after work approved) |
| **Milestone** | Key dates: 1st review, 2nd review, final delivery |
| **Final Offer** | Consultant's confirmed price for the project |
| **Code** | Unique consultant ID (e.g., D101, D207) |
| **Category** | Type of consultant: photographer, designer, sculptor, artisan |
| **Discovery Hub** | Client dashboard showing categorized consultants |
| **Action Banner** | Floating bar with "Assign Project" and "Shop" buttons |

---

*End of Master Reference. This document must be read at the start of every development session.*
