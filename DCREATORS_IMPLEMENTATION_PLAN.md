# DCreators — Flow-Fix & UI-Replication Implementation Plan

> **Audience:** This document is written to be executed by a coding model (Sonnet) **task by task, in order**.
> **Author intent:** Fix the broken role flow (things landing on the wrong side) and replicate the Figma UI exactly.
> **Golden rule for the executor:** Do **exactly** what each task says. Do **not** invent new screens, statuses, or navigation. When unsure, re-read PART A (Canonical Model) and PART B (Screen Ownership Matrix) — they are the source of truth. If a task conflicts with the old `DCREATORS_MASTER_PLAN.md`, **this document wins** (the master plan is partially stale).

---

## HOW TO USE THIS DOCUMENT (read first, every session)

1. Read **PART A** — the canonical model. 90% of the bugs come from violating it.
2. Find your current task in **PART F (Phases)**. Do **one task at a time**.
3. For every screen you touch, open its row in **PART B** to confirm: *which role owns it*, *which product it belongs to*, *which Figma PNG it must match*.
4. After each task, run the matching **verification checklist** in **PART H**.
5. Never mark a task done until its acceptance criteria pass.

**The reference image folder is `claudereferfigma/`.** Every screen names the exact PNG to match. Open it before styling.

**Companion file: `DCREATORS_FIGMA_SCREEN_NOTES.md`** — plain-text annotations of the key Figma screens (layout, text, colors) plus an exact current-code bug map. Read the matching screen note there before building, so you don't have to rely on reading the PNG.

---

# PART A — THE CANONICAL MODEL (source of truth)

The entire confusion in this codebase comes from **four** mixed-up concepts. Internalize these.

## A1. Terminology — "Creator" means CONSULTANT, not Client

This is the #1 trap. In the Figma and business docs:

| Word used in design/files | Actual role in code | Who they are |
|---|---|---|
| **Creator / Creator's Dashboard / Creators Dashboard** | **CONSULTANT** (`currentRole === 'consultant'`) | The professional: photographer, designer, sculptor/artist, artisan. They sell art and take project assignments. |
| **Open Gallery Dashboard / Hire & Assign / Buyer** | **CLIENT** (`currentRole === 'client'`) | The person who browses the gallery, hires consultants, and buys artwork. |

> ⚠️ **Therefore:** a Figma file named `"… - Creator's Dashboard"` is a **CONSULTANT screen**. A file named `"… - Open Gallery Dashboard"` is a **CLIENT screen**. This single rule resolves most "wrong side" bugs.

**Existing code mislabels this.** Example: `src/components/dashboard/ClientDashboard.tsx` has a comment `// ClientDashboard — "Creator's Dashboard"`. The *comment is wrong*; the file's actual content (browse creators) is correct **client** content. Fix misleading comments as you go, but **trust role behavior over comments**.

## A2. There are TWO separate products. NEVER conflate them.

| | **Product A — Creative Services** | **Product B — Artwork Marketplace** |
|---|---|---|
| What it is | Client hires a consultant for a custom **project** (logo, brand identity, shoot…) | Client **buys** a finished **artwork/product** from a consultant's shop |
| Core entity | `projects` table (`Project` type) | `shop_products` + `artwork_orders` (`ArtworkOrder` type) |
| Status machine | `ProjectStatus` (draft → … → completed) | `ArtworkOrderStatus` (requested → … → completed) |
| Client entry | "Hire & Assign Project" form | "Shop" / "Buy Art" |
| Consultant inbox | **Project Dashboard** (incoming assignment) | **Sales Dashboard** (incoming purchase request) |
| Money | advance + balance on the project | advance + balance on the artwork order |

> 🔴 **Current bug:** `src/components/dashboard/ConsultantDashboard.tsx` renders "Request received for Purchase" (a **Product B / Sales** card) but reads from the `projects` table filtered by `status === 'assigned'` (which is **Product A / project** data). That is the conflation. They must be split: project-assignment requests live in the **Project Dashboard**; artwork-purchase requests live in the **Sales Dashboard** and read from `artwork_orders`.

## A3. Role model — one account, role chosen per session

- Every user is a **client by default**. A user who completed consultant onboarding *also* has a `consultant_profiles` row and can act as a **consultant**.
- `useAuthStore.currentRole` (`'client' | 'consultant'`) is the **single switch** that decides which dashboard, which bottom-nav tabs, and which action banner render.
- Role is selected after login (Welcome/Intro). A consultant who has no profile yet → send to consultant onboarding.
- **Rule:** before rendering ANY home/dashboard surface, branch on `currentRole`. Never show consultant-only UI to a client or vice-versa.

## A4. The Figma filename → role/product decoder

Use this to classify every reference PNG in `claudereferfigma/`:

| Filename contains… | Role | Product |
|---|---|---|
| `Open Gallery Dashboard` | CLIENT | (look at title) |
| `Creator's Dashboard` / `Creators Dashboard` | CONSULTANT | (look at title) |
| `Hire`, `Assign`, `Explore … Portfolio` | CLIENT | A (hiring) |
| `Sales Dashboard`, `Sales History`, `Product Sales`, `Request … for Purchase`, `Courier`, `Dispatch` | CONSULTANT | B (selling art) |
| `Project Dashboard`, `Negotiation`, `Collaboration`, `Manage Project`, `Submit … Review` | CONSULTANT | A (doing the project) |
| `Work Order`, `Workorder` | both (mirror screens — see A5) | A |
| `Payment Gateway for Buy Product`, `Buying Product` | CLIENT | B |
| `Advance Payment … for Hire`, `Ballance Pament` | CLIENT | A |
| `Rate Your Experience` (file: `Client Review.png`) | CLIENT | A (post-completion rating) |

## A5. Mirror screens — the same document on both sides

Several screens exist as **near-identical mirror pairs**, one per role. This is by design, and is the other big reason things land on the wrong side. Each pair = **one shared visual, two role behaviors**:

| Document | Client variant (Open Gallery) | Consultant variant (Creator's) | Difference |
|---|---|---|---|
| Work Order | `Workorder for Consultant - Open Gallery Dashboard.png` | `Submit Work-Order for Assin - Creators Dashboard.png` | Client **generates/views**; consultant **accepts** |
| Advance Payment confirmation | `Advance Payment Confirmatiom for Hire - Open Gallery Dashboard.png` | `Advance Payment Confirmation - Creator's Dashboard.png` | Client **paid**; consultant **notified** |
| Balance Payment | `Ballance Pament - Open Gallery Dashboard.png` | `Ballance Pament - Creators Dashboard.png` | Client **pays**; consultant **sees released** |
| Download / Final | `Pament Conformation for download Artwork - Open Gallery Dashboard.png` | `Download Artwork - Creators Dashboard.png` | Client **downloads**; consultant **delivers** |

**Implementation rule:** build mirror pairs as **two thin screens that share styled sub-components**, NOT one screen with tangled `if (role)` everywhere. Keep the role's *action* (the button + the status transition it triggers) clearly separated.

---

# PART B — SCREEN OWNERSHIP MATRIX

This is the master remap table. **Verdict legend:** ✅ correct · 🟡 exists but mis-wired/incomplete · 🔴 wrong side / conflated · ➕ missing.

> The executor must make every screen's **role**, **product**, and **Figma match** agree with this table.

### Auth & Onboarding (shared)
| Figma PNG | Role | Code file | Verdict | Action |
|---|---|---|---|---|
| `Welcome to Dcreators.png` | shared | `WelcomeScreen.tsx` | 🟡 | Match hero: "Unparallel Creative Ecosystem", vertical icon trail, single **Sign up** outline button, joint-venture credit line. |
| `Join Dcreators.png` / `Create Creator's Account.png` | shared→consultant | `RegisterScreen.tsx`, `CreatorOnboarding*.tsx` | 🟡 | Account creation, then consultant verification (KYC/bank/T&C). |
| `Sign Up with Brand Assets.png` | shared | `RegisterScreen.tsx` | 🟡 | profile photo, name, email, mobile/OTP, address. |
| — (role pick) | shared | `IntroScreen.tsx` | 🟡 | "Enter as Client / Enter as Consultant" → sets `currentRole`. Consultant w/o profile → onboarding. |

### Dashboards (the heart of the bug)
| Figma PNG | Role | Code file | Verdict | Action |
|---|---|---|---|---|
| `Explore Creative Consultant's Portfolio.png` | **CLIENT** | `ClientDashboard.tsx` | 🟡 | This is the **client home**. Add all **5** sections: *Creators in Demand, Photographer's Archive, Designer's Desk, Artist's Gallery, Artisan's Hub* (code only has 3). Category tabs at top. |
| `Creators Dashboard - Final.png` | **CONSULTANT** | *(no dedicated file — currently `ConsultantDashboard.tsx` shows Sales instead)* | 🔴 | **Consultant home** = portfolio grid of the consultant's own artworks/projects (image, title, price, size, availability, edit pencil) + a **Sales Dashboard / Project Dashboard** toggle at top. Build this as the consultant's Dashboard tab. |
| `Sales Dashboard.png` | **CONSULTANT** | `ConsultantDashboard.tsx` (currently mislabeled as home) | 🔴 | Move this content to a **Sales sub-screen** (Product B). Must read from `artwork_orders`, **not** `projects`. "Request received for Purchase", Accept/Pass, About the Buyer. |
| `Project Dashboard.png` / `Negotition.png` / `Collaboration Deshboard.png` | **CONSULTANT** | `CreatorWorkorderScreen.tsx` (negotiation/upload) + `CollaborationDashboard.tsx` | 🟡 | One multi-state **Project Dashboard**: states = *Negotiation*, *Collaboration*, *Review-upload*. Consolidate (see Phase 2). |
| `Manage Project.png` | **CONSULTANT** | `ConsultantProjectManagementScreen.tsx` | 🟡 | Ongoing list + delivered table + calendar. Keep. |
| `Sales History.png` / `Sales Dashboard - 2.png` | **CONSULTANT** | `ConsultantEarningsHistoryScreen.tsx` | 🟡 | Earnings + sales history (Product B). |

### Product A — Creative Services flow
| Figma PNG | Role | Code file | Verdict | Action |
|---|---|---|---|---|
| `Hire a Consultant - Open Gallery Dashboard.png` | **CLIENT** | `AssignProjectScreen.tsx` / `HireConsultantScreen.tsx` | 🟡 | Hire & Assign form: Hire Role, Creative Items, Date, Budget, Brief, T&C, Submit/Save Draft/Reset. |
| `Hire from Creative Consultant List - Open Gallery Dashboard.png` | **CLIENT** | `ConsultantMatchingScreen.tsx` | 🟡 | Candidate list near budget, View Portfolio, Hire Now, Refine Search. |
| `Hire Consultant - creator's Dashboard.png` | **CONSULTANT** | `CollaborationDashboard.tsx` / `ConsultantProjectCollaborationScreen.tsx` | 🔴 | This is consultant **hiring another consultant to collaborate** — NOT the client hire. Keep on consultant side only. |
| `Negotition.png` | **CONSULTANT** | `CreatorWorkorderScreen.tsx` | 🟡 | Consultant proposes amount + deadline (sets `final_offer`); "Submit Offer". |
| `Advance Payment process.png` / `Complete Payment … for Hire.png` | **CLIENT** | `PaymentScreen.tsx` (paymentType `advance`) | 🟡 | Project advance payment. Copy must say "Project Advance", not artwork. |
| `Pament Confirmation and Generate workorder - Open Gallery Dashboard.png` | **CLIENT** | `GenerateWorkOrderScreen.tsx` | 🟡 | "Payment Confirmed" → "Generate Work Order" (advance_paid → work_order_generated). |
| `Workorder for Consultant - Open Gallery Dashboard.png` | **CLIENT** | *(client WO view — currently missing a clean screen)* | 🟡 | Client views the generated Work Order document. |
| `Submit Work-Order for Assin - Creators Dashboard.png` | **CONSULTANT** | `ConsultantWorkOrderScreen.tsx` | ✅ | Consultant accepts WO (work_order_generated → work_order_accepted). |
| `Project Flow/.../Client Review` (timeline) | **CLIENT** | `ClientWorkorderScreen.tsx` (review timeline) + `ClientReviewScreen.tsx` | 🟡 | Round-by-round review: view design, pick option, structured feedback (Colour/Concept/Design Look), Approve/Revert/Hold/Cancel. **Note:** `ClientWorkorderScreen` is misnamed — it is the client *review timeline*, not the WO doc. |
| `Accept Project - Final Submission.png` | **CLIENT** | part of `ClientReviewScreen.tsx` | 🟡 | Final approval (final_review → final_approved). |
| `Ballance Pament - Open Gallery Dashboard.png` | **CLIENT** | `PaymentScreen.tsx` (paymentType `balance`) | 🟡 | Balance payment (final_approved → balance_pending → balance_paid). |
| `Pament Conformation for download Artwork - Open Gallery Dashboard.png` | **CLIENT** | `PaymentConfirmedScreen.tsx` | 🟡 | Success + unlock **Download** (green) (balance_paid → delivered). |
| `Download Artwork - Creators Dashboard.png` | **CONSULTANT** | *(consultant delivered view)* | ➕ | Consultant sees project delivered/closed. |
| `Client Review.png` (= "Rate Your Experience") | **CLIENT** | `RateConsultantScreen.tsx` / `RatingReviewScreen.tsx` | 🟡 | Star rating + feedback + tags (delivered → completed). |

### Product B — Artwork Marketplace flow
| Figma PNG | Role | Code file | Verdict | Action |
|---|---|---|---|---|
| `Product Sales.png` | **CLIENT** | `ShopScreen.tsx` | 🟡 | Buy Art marketplace listing. |
| (product detail) | **CLIENT** | `ProductDetailsScreen.tsx` | 🟡 | Detail + "Buy Art" → creates `artwork_orders` row (status `requested`). |
| `Sales Dashboard.png` | **CONSULTANT** | `ArtistSalesRequestScreen.tsx` / `ArtistSalesRequestDetailScreen.tsx` | 🟡 | Incoming purchase request: Accept/Pass/Decline. |
| `Payment Gateway for Buy Product.png` / `Complete Payment Gateway - Open Gallery Dashboard.png` | **CLIENT** | `ArtworkPaymentScreen.tsx` | 🟡 | Artwork advance/balance payment. |
| `Payment/Courier Confirmation for Buying Product.png` | **CLIENT/CONSULTANT** | `ArtworkOrderTrackingScreen.tsx` / `ArtistOrderDispatchScreen.tsx` | 🟡 | Consultant enters consignment no.; buyer tracks. |
| `Payment & Delivery for Assignment Confirmation.png` | **CLIENT** | `ArtworkOrderTrackingScreen.tsx` | 🟡 | Delivery confirm → balance → complete. |

### Consultant profile & setup
| Figma PNG | Role | Code file | Verdict | Action |
|---|---|---|---|---|
| `Update Creators Portfolio.png` | **CONSULTANT** | `ConsultantPortfolioUpdateScreen.tsx` | 🟡 | Upload artwork, title/size/medium/price/availability, 5-slot counter. |
| `Consultancy Details.png` | **CONSULTANT** | `ConsultantServicePricingScreen.tsx` | 🟡 | Service catalog + fees + T&C. |
| `Explore Photographer's/Designer's/Artist's/Artisan's Portfolio.png` | **CLIENT** | `ExploreConsultantsScreen.tsx` / category views | 🟡 | Per-category browse. |
| (creator profile) | **CLIENT viewing** | `CreatorProfileScreen.tsx` | 🟡 | View consultant + Hire / Add to Cart action banner. |

---

# PART C — CANONICAL FLOWS (status-by-status, who acts, which screen)

> Use the **code's** status machine (in `src/types/index.ts` and `src/services/projectService.ts`). The `ProjectStatus` names below are authoritative. **Ignore the older status names** (`pending/accepted/approved`) in `DCREATORS_MASTER_PLAN.md` — they are stale.

## Flow A — Direct Hire (Product A). Each arrow = exactly one screen + one role.

| # | Status before → after | Actor | Screen (role) | Trigger |
|---|---|---|---|---|
| 1 | `draft` → `assigned` | CLIENT | `AssignProjectScreen` (CLIENT) | Submit assignment + pick consultant (`ConsultantMatchingScreen`) |
| 2 | `assigned` → `advance_pending` | CONSULTANT then CLIENT | Consultant negotiates in **Project Dashboard** (`CreatorWorkorderScreen`, sets `final_offer`); client proceeds to pay | Consultant "Submit Offer" → client opens advance payment |
| 3 | `advance_pending` → `advance_paid` | CLIENT | `PaymentScreen` (advance) | Pay Advance |
| 4 | `advance_paid` → `work_order_generated` | CLIENT | `GenerateWorkOrderScreen` (CLIENT) | Generate Work Order |
| 5 | `work_order_generated` → `work_order_accepted` | CONSULTANT | `ConsultantWorkOrderScreen` (CONSULTANT) | Accept Work Order |
| 6 | `work_order_accepted` → `in_progress` | CLIENT | client WO approval (`ClientWorkorderScreen`) | Approve WO |
| 7 | `in_progress` → `review_1` | CONSULTANT | **Project Dashboard** upload (`CreatorWorkorderScreen`) | Submit for 1st review |
| 8 | `review_1` → `review_2` *(or → `in_progress` on revert)* | CLIENT | `ClientReviewScreen` | Approve round / Revert |
| 9 | `review_2` → `final_review` *(or → `in_progress`)* | CLIENT | `ClientReviewScreen` | Approve / Revert |
| 10 | `final_review` → `final_approved` *(or → `in_progress`)* | CLIENT | `ClientReviewScreen` | Approve final |
| 11 | `final_approved` → `balance_pending` | CLIENT | `PaymentScreen` (balance) | Pay Balance (initiate) |
| 12 | `balance_pending` → `balance_paid` | CLIENT | `PaymentScreen` (balance) | Payment success |
| 13 | `balance_paid` → `delivered` | CLIENT | `PaymentConfirmedScreen` | Download unlocked (green) |
| 14 | `delivered` → `completed` | CLIENT | `RateConsultantScreen` | Submit review |

> Max **3** review rounds (review_1, review_2, final_review). No round 4. Revert sends back to `in_progress`. These rules are already encoded in `STATUS_TRANSITIONS` — **do not change them**.

## Flow B — Floating Query (Product A, bidding path)
Client posts query (`FloatingQueryScreen`, `floating_queries`) → consultants respond (`floating_query_responses`) → client accepts one → **joins Flow A at step 2** (`assigned`).

## Flow C — Artwork Purchase (Product B). Status machine = `ArtworkOrderStatus`.
| # | Status | Actor | Screen |
|---|---|---|---|
| 1 | create `requested` | CLIENT (buyer) | `ProductDetailsScreen` → "Buy Art" |
| 2 | `requested` → `accepted`/`declined` | CONSULTANT (artist) | `ArtistSalesRequestScreen` (Accept/Pass/Decline) |
| 3 | `accepted` → `advance_paid` | CLIENT | `ArtworkPaymentScreen` (artwork_advance) |
| 4 | `advance_paid` → `dispatched` | CONSULTANT | `ArtistOrderDispatchScreen` (enter consignment no.) |
| 5 | `dispatched` → `delivered` | CLIENT | `ArtworkOrderTrackingScreen` (confirm receipt) |
| 6 | `delivered` → `completed` | CLIENT | `ArtworkPaymentScreen` (artwork_balance) |

## Flow D — Consultant Sales management (Product B, consultant side)
`Sales Dashboard` (incoming `requested` orders) → Accept → Dispatch → payout on completion. Reads `artwork_orders` joined to `shop_products` + buyer profile. **Never** reads `projects`.

---

# PART D — NAVIGATION BACKBONE (must match Figma bottom bars)

Bottom navs differ by role (verified against Figma):

- **Client bottom nav:** the Figma shows `BACK · EXPLORE · PROJECTS · SEARCH · PROFILE` on hire screens and `BACK · HOME · SEARCH · SALES · PROFILE` on others. Standardize the **client tabs** to: **Home (Explore), Search, History** (matches BRD), keeping Back/Profile as chrome. Action banner: "Assign Project / Hire Creative Consultant" + Shop.
- **Consultant bottom nav:** `BACK · HOME · SEARCH · SALES · PROFILE`. Standardize **consultant tabs** to: **Home, Sales, History** (or Home/Queries/Orders as currently coded — pick one and keep consistent). Action banner: "My Profile / Portfolio & Settings".

> The current `BottomNavigation.tsx` already branches on `currentRole`. **Keep that pattern.** Fix the tab set + action-banner labels to match Figma; do not introduce a third nav variant.

**Stack vs Tabs cleanup:** `AssignProject`, `CreatorWorkorder`, `FloatingQuery` are currently **tab** screens (`MainTabParamList`) but behave like pushed sub-screens. Leave them registered to avoid breakage, but always navigate to them as actions, not as primary tabs.

---

# PART E — DESIGN TOKENS & UI FIDELITY RULES

**Source of truth for tokens = the Figma PNGs**, then `src/styles/theme.ts`. Observed palette from the reference screens:

| Token | Value | Use |
|---|---|---|
| Screen background | `#F4F4F8` light lavender / `#EDF1F5` | all screens (`colors.screenBg`) |
| Heading navy/indigo | `#1B3A5C` / `#21317A` | screen titles ("Project Dashboard", "Hire & Assign Project") |
| Brand orange | `#E8854A` / `#F5821F` | accents, "Sales Dashboard" title, sub-labels, dates |
| Teal | `#2D8B7F` / `#0D7F7A` | consultant accents, success CTAs |
| Primary button fill | `#1B3A5C` navy | Submit / Pay / Accept |
| Outline button | navy border, transparent | Save Draft / secondary |
| Card surface | `#FFFFFF`, radius 16, soft shadow | all cards |
| Input | off-white, radius 12–16, 1px border | forms |
| Text primary / secondary | `#1F2937` / `#6B7280` | body |

**Fidelity rules for the executor:**
1. Open the named Figma PNG **side by side** before styling a screen.
2. Match in this order: layout structure → spacing → typography hierarchy → color → icons. Use `lucide-react-native` icons (already the project standard).
3. Reuse the existing components (`TopHeader`, `BottomNavigation`, `ProjectCard`, `CreatorCard`, `CloudImage`, `SkeletonBar`). Do **not** create parallel duplicates.
4. Keep the `ImageBackground` texture wrapper + `SafeAreaView edges={['top']}` + `TopHeader` pattern on every main screen.
5. Build the reusable component library named in the UI Doc §8.2 (`PrimaryButton`, `SecondaryButton`, `InputField`, `TextareaField`, `UploadDropzone`, `StatusBadge`, `PaymentSummaryCard`, `SectionHeader`, `FeedbackTag`, `ReviewForm`) **once**, then reuse. This is the antidote to per-screen hardcoding.

---

# PART F — THE PHASES (do these in order)

> Each task lists: **files**, **what to do**, **acceptance**. Do not start a phase until the previous phase's acceptance all passes. Commit after each phase.

## PHASE 0 — Orient & guardrail (no behavior change)
- **0.1** Read PART A–E of this doc. Open `src/types/index.ts`, `src/services/projectService.ts`, `App.tsx`, `BottomNavigation.tsx`, both dashboard components.
- **0.2** Build a quick map: in a scratch comment or `FLOW_NOTES.md`, list every screen file with its **role** + **product** per PART B. Do not edit logic yet.
- **0.3** Add the reusable component library skeleton (PART E rule 5) with correct tokens. No wiring yet.
- **Acceptance:** app still builds and runs unchanged; new components exist but unused.

## PHASE 1 — Fix the role & navigation backbone (the core "wrong side" fix)
This phase alone fixes most of the broken flow.
- **1.1 Dashboard router.** In `DashboardScreen.tsx`, keep the `currentRole` branch. Ensure:
  - `client` → **Client Home** = *Explore Creative Consultant's Portfolio* (`ClientDashboard.tsx`).
  - `consultant` → **Consultant Home** = *Creators Dashboard - Final* (the portfolio grid). **Create this** (new `ConsultantHomeDashboard` or repurpose) — it must show the consultant's own artworks/projects with edit pencils + a **Sales Dashboard / Project Dashboard** toggle. Match `Creators Dashboard - Final.png`.
- **1.2 De-conflate the consultant dashboard.** Move the current "Request received for Purchase" content out of the consultant **home** into the **Sales Dashboard** sub-screen (Product B). Re-point it to read `artwork_orders` (Flow D), not `projects`. (If `artwork_orders` data wiring isn't ready, render the empty/loading state — do **not** fall back to `projects`.)
- **1.3 Client home sections.** In `ClientDashboard.tsx`, add all **5** category sections (Creators in Demand, Photographer's Archive, Designer's Desk, Artist's Gallery, Artisan's Hub) per `Explore Creative Consultant's Portfolio.png`.
- **1.4 Bottom nav + action banner** per PART D. Confirm client vs consultant tab sets and banner labels match Figma. Fix the `\\n` literal bug in `ConsultantDashboard` quick tiles ("Update\\nPortfolio").
- **1.5 Fix misleading comments** on the two dashboard files so future readers aren't misled.
- **Acceptance:** Logging in as client shows the explore hub (5 sections); switching to consultant shows the portfolio-grid home with Sales/Project toggles; no project-assignment data appears on the Sales (artwork) surface; both bottom navs match Figma.

## PHASE 2 — Product A: Creative Services flow correctness + UI
Walk Flow A (PART C) end to end. For **each** numbered step:
- **2.1** Confirm the screen that owns that transition is reachable **only** by the correct role, and that it calls `updateProjectStatus(projectId, nextStatus)` for exactly the transition in the table.
- **2.2 Consolidate the Project Dashboard.** Make `CreatorWorkorderScreen` (consultant) the single multi-state **Project Dashboard** with states *Negotiation* (Submit Offer), *Collaboration* (search & invite consultants — fold in `CollaborationDashboard`/`ConsultantProjectCollaborationScreen` so there is **one** collaboration surface, not two), and *Review-upload* (Submit for Nth review). Match `Project Dashboard.png`, `Negotition.png`, `Collaboration Deshboard.png`.
- **2.3 Rename for clarity (optional but recommended):** `ClientWorkorderScreen` → it is the **client review timeline**; keep filename but fix the header comment, or rename to `ClientProjectFlowScreen`. Keep `ConsultantWorkOrderScreen` = the formal WO accept (it's correct).
- **2.4 Client review cycle.** `ClientReviewScreen`: structured feedback (Colour/Concept/Design Look checkboxes + text), option select, Approve/Revert/Hold/Cancel → correct transition. Enforce max 3 rounds.
- **2.5 Payments copy.** `PaymentScreen` must show **project** wording for advance/balance (not artwork). Order summary uses project title + `final_offer ?? budget`, advance/balance split.
- **2.6 Download gating.** Final files locked until `balance_paid`; Download button grey→green on `delivered`. 
- **2.7 Rating.** `RateConsultantScreen` → `completed`.
- **Acceptance:** Run PART H checklist A. A project can travel `draft → completed` with each screen appearing for the right role at the right status, and no invalid-transition errors.

## PHASE 3 — Product B: Artwork Marketplace flow correctness + UI
Walk Flow C/D (PART C).
- **3.1** "Buy Art" in `ProductDetailsScreen` creates an `artwork_orders` row (`requested`). 
- **3.2** Consultant `Sales Dashboard` lists incoming `requested` orders (`ArtistSalesRequestScreen`) → Accept/Pass/Decline.
- **3.3** Buyer pays advance (`ArtworkPaymentScreen` artwork_advance) → `advance_paid`.
- **3.4** Consultant dispatch (`ArtistOrderDispatchScreen`, consignment no.) → `dispatched`.
- **3.5** Buyer confirms delivery (`ArtworkOrderTrackingScreen`) → `delivered`; pays balance → `completed`.
- **3.6** Ensure Product B **never** touches `projects` and Product A never touches `artwork_orders`.
- **Acceptance:** Run PART H checklist C. An artwork order travels `requested → completed` with correct role per step.

## PHASE 4 — Consultant onboarding, profile, portfolio, services
- **4.1** `CreatorOnboarding*` saves to `consultant_profiles` (`is_approved=false`). Match `Create Creator's Account.png`.
- **4.2** `ConsultantPortfolioUpdateScreen` — 5-slot artwork upload (title/size/medium/price/availability). Match `Update Creators Portfolio.png`.
- **4.3** `ConsultantServicePricingScreen` — service catalog + fees + T&C. Match `Consultancy Details.png`.
- **4.4** `CreatorProfileScreen` (client viewing) — Hire / Add to Cart banner; portfolio gallery.
- **Acceptance:** New consultant can onboard, add portfolio + services, and appears in client explore (when approved).

## PHASE 5 — Supporting features (already partly built — verify & align)
Notifications (triggers per old master plan §14), Chat (project-scoped), Floating Queries, History (client vs consultant), Settings/Menu, Saved Creators, Invoice. Verify each respects role and the correct entity. No flow rework — just correctness + Figma styling.

## PHASE 6 — UI fidelity sweep + QA
- **6.1** Screen-by-screen pass against `claudereferfigma/` using PART B. Fix spacing/typography/color drift to tokens (PART E).
- **6.2** Ensure all reusable components are used (no orphaned per-screen duplicates).
- **6.3** Run **all** PART H checklists for both roles. Fix any remaining wrong-side leaks.
- **Acceptance:** Every Figma PNG has a matching screen; both end-to-end flows pass; visual diff is close.

---

# PART G — GUARDRAILS FOR THE EXECUTOR (DO / DO NOT)

**DO**
- Do branch on `currentRole` before rendering any home/dashboard/banner.
- Do use `updateProjectStatus()` for Product A transitions and the `ArtworkOrderStatus` equivalents for Product B — they validate the machine.
- Do keep Product A (`projects`) and Product B (`artwork_orders`) strictly separate.
- Do open the named Figma PNG before styling each screen.
- Do reuse existing components and the new shared library.
- Do handle Loading / Error / Empty / Success on every data screen.

**DO NOT**
- Do **not** add or rename `ProjectStatus` / `ArtworkOrderStatus` values, or add transitions not in `STATUS_TRANSITIONS`.
- Do **not** read `projects` to populate any "purchase/sales/artwork" UI (that's the original bug).
- Do **not** show consultant-only screens to clients or vice-versa.
- Do **not** create a new screen when PART B maps the function to an existing file — fix the existing one.
- Do **not** trust the old `DCREATORS_MASTER_PLAN.md` status names or the comments inside dashboard files — they are stale/wrong. This document + the code's type definitions win.
- Do **not** invent data shapes — use `src/types/index.ts`.

---

# PART H — VERIFICATION CHECKLISTS (click-through QA)

### Checklist A — Product A end to end (run as 2 users: a Client and a Consultant)
1. Client: Explore hub shows 5 category sections. ☐
2. Client: open a consultant → Hire → fill brief → Submit → status `assigned`. ☐
3. Consultant: project appears in **Project Dashboard** (Negotiation state) → Submit Offer sets `final_offer`. ☐
4. Client: Pay Advance → `advance_paid`. ☐
5. Client: Generate Work Order → `work_order_generated`. ☐
6. Consultant: Accept Work Order → `work_order_accepted`. ☐
7. Client: Approve WO → `in_progress`. ☐
8. Consultant: upload 1st review → `review_1`; Client review → `review_2`; … final → `final_approved`. ☐
9. Client: Pay Balance → `balance_paid` → Download turns green → `delivered`. ☐
10. Client: Rate consultant → `completed`. ☐
11. At **no** step did a screen meant for the other role appear. ☐

### Checklist C — Product B end to end
1. Client: Shop → product → Buy Art → `artwork_orders` row `requested`. ☐
2. Consultant: Sales Dashboard shows it (data from `artwork_orders`, not `projects`). ☐
3. Accept → Client pays advance → `advance_paid`. ☐
4. Consultant dispatch (consignment) → `dispatched`. ☐
5. Client confirm delivery → balance → `completed`. ☐
6. Sales Dashboard never shows project-assignment data. ☐

### Checklist Nav/Role
1. Client bottom nav + action banner match Figma. ☐
2. Consultant bottom nav + action banner match Figma. ☐
3. Switching role swaps the home dashboard correctly. ☐

---

*End of plan. Keep this file open while working. When a task and an old doc disagree, this file is authoritative.*
