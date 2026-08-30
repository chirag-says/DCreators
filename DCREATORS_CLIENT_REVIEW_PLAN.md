# DCreators — Client Review Implementation Plan

Sources:
- **HW** = `Review for Client.pdf` (6 pages, handwritten/marker annotations over device screenshots)
- **UX** = `DCREATORS_UI_UX_Review_Annotated.pdf` (7 pages, 13 numbered red-circle items)

Every item below was traced to a specific file and line in `dcreators-mobile/`. Nothing here is inferred from the PDFs alone.

## Read this first: the two PDFs were marked up against different builds

The UX PDF's home screenshot (p1) has no bid CTA and no Client/Creator pill, both of which are in `ClientDashboard.tsx` and `TopHeader.tsx` today. Its booking screenshot (p4) is cropped at ASSIGNMENT BRIEF. Consequences:

- **UX item 8's "missing budget field" is a crop artifact.** `BookConsultantScreen.tsx:229` already has a BUDGET (₹) input, below the fold of their screenshot. Only *time* and *duration* are genuinely missing.
- Everything else in the UX PDF still reproduces on current `FedUp` code. Verified item by item.

The HW PDF's screenshots are current. Its p1 right-hand image is a photo of the Figma reference board (BACK/HOME/SEARCH/SALES/PROFILE nav), not the app.

## Decisions taken (from your answers, where the two reviews conflicted)

| Conflict | Resolution |
|---|---|
| HW p3 "Not Required" on Price row vs UX 10 "clarify price unit" | Keep the price, add a unit (`/day`, `/project`) |
| HW p3 code callouts vs UX 12 "too prominent" | Remove both Code and Product Code from the client-facing profile |
| HW p3 "Not Required" on role switch vs UX 6 "add universal switch" | Remove the header pill; move Client ↔ Creator into the SideMenu |
| HW p1 arrow (role selection ← HOME) + UX 5 | **No change.** You confirmed with the client: home page and buttons stay as they are |
| UX 4 Activity/History overlap | Merge into one tab with Active / Completed segments |
| HW p2 HIRE ROLE dropdown | Keep the role picker, add a second consultant picker below it |
| Two "Hire & Assign Project" screens | `AssignProjectScreen` is canonical; `HireConsultantScreen` gets deleted |
| HW p3 "Need to add shop Dashboard" | A Shop button beside Hire Now on the creator's profile, client side, shown only when that creator has something listed |

---

# Phase 1 — Creator Profile (`CreatorProfileScreen.tsx`)

Highest density of findings; five separate items land on one screen.

### 1.1 "5-10 years Years Experience" — UX 11
`EXPERIENCE_OPTIONS` in `EditConsultantProfileScreen.tsx:20` stores the string `'5-10 years'`. `CreatorProfileScreen.tsx:160` renders `{experience} Years Experience` and `:186` renders `${experience} Years`, so both concatenate the unit twice.

Fix: drop the literal suffixes and render `{experience}` alone, since the stored value already reads `5-10 years`. Grep for the same pattern anywhere else experience is displayed before committing.

### 1.2 Name shows "User" — HW p3
`CreatorProfileScreen.tsx:54` falls back to `'Creator'`, so the literal "User" on screen is real data: a consultant profile whose `display_name` is "User". Two parts:
- Backfill/repair: find `consultant_profiles` rows with a placeholder `display_name` and make the field required at signup (`CreateCreatorAccountScreen.tsx`).
- Guard: when `display_name` is empty, fall back to the linked `profiles.name` before falling back to a generic word.

### 1.3 Remove Code and Product Code — HW p3 + UX 12
`CreatorProfileScreen.tsx:167-188` renders a 4-column stats grid. Delete the Code and Product Code columns; the grid becomes Expertise + Experience. Also delete the now-unused `productCode` derivation at `:66` and the `Hash`/`Box` icon imports.

Codes remain in the DB and admin panel. This is display-only.

### 1.4 Expertise icon is wrong — HW p3
`CreatorProfileScreen.tsx:179` hardcodes `<Camera>` for the Expertise column regardless of discipline, so a designer gets a camera. Map icon by `category`: Camera for photographer/videographer, PenTool for designer, Palette for sculptor, Hammer for artisan. Put the map next to the existing `CATEGORY_LABELS` at `:28`.

### 1.5 Price unit — UX 10
`CreatorProfileScreen.tsx:198-202` renders `₹ 4,900 (INR)` with no unit. Needs:
- Migration: `consultant_profiles.price_unit TEXT` with a check constraint on `('per_project','per_day','per_hour')`, default `'per_project'`.
- Input: a unit selector in `ConsultantServicePricingScreen.tsx` next to base price.
- Display: `₹4,900 / project`. Replace the `(INR)` italic suffix, which carries no information next to a ₹ symbol.
- Also update `BookConsultantScreen.tsx:52`, which seeds the budget from `base_price` — with a per-day unit that seed is wrong unless multiplied by duration (see 3.2).

### 1.6 Shop button beside Hire Now — HW p3
`shopService.fetchConsultantProducts(consultantId, limit, 'listing')` already exists and already filters to sellable listings. So:
- Fetch this creator's `listing`-kind products on mount, alongside the existing ratings fetch at `:43`.
- When the count is > 0 and `currentRole !== 'consultant'`, render a secondary "Shop" button next to the existing Hire Now CTA at `:213-225` (row layout, Hire Now primary navy, Shop outlined).
- Target: a creator-scoped shop view. `ShopScreen.tsx` currently lists all products globally, so either add an optional `consultantId` route param that filters it, or add a small `CreatorShopScreen`. Filtering the existing screen is less code and keeps one product-card style.
- Show nothing when they have no listings, per your instruction ("if they have something to sell").

### 1.7 Standardize back navigation — UX 13
This screen renders `<TopHeader />` (hamburger + logo + avatar) at `:91` *and* its own `ChevronLeft` in the title row at `:96`. Meanwhile `BookConsultantScreen.tsx:145` and `HireConsultantScreen.tsx:121` use a circular white back button in a bare header, and `AssignProjectScreen.tsx:211` uses a third variant.

Fix: extract one `ScreenHeader` component (back affordance + optional title + optional right slot) and use it on every pushed detail screen. Detail screens should not render `TopHeader` at all — which also resolves the "switch not required here" half of HW p3, independently of Phase 2.

---

# Phase 2 — Navigation and role switching

### 2.1 Move the role switch into the SideMenu — HW p3 + UX 6
- Remove the switch block from `TopHeader.tsx:99-138` along with `SWITCH_WIDTH`/`TAB_WIDTH`/`PILL_HEIGHT`, `slideAnim`, and the `canSwitch` gate.
- Move `toggleRole` (`TopHeader.tsx:62-79`) into `SideMenu.tsx` as a menu row, keeping its `root.navigate('Main', { screen: 'Dashboard' })` reset intact — that line is what stops a consultant-only screen from staying mounted under a client session, and it must survive the move.
- Add the same entry to `SettingsScreen.tsx`, since `IntroScreen.tsx:79` already promises "You can switch roles later in settings" and that promise is currently unmet.
- `BottomNavigation.tsx:74-82` animates the tab reflow on role change; that still works, the trigger just moves.

### 2.2 Merge Activity and History — UX 4
Today `MyActivityScreen` shows a client's open bids plus in-progress projects and `HistoryScreen` shows their completed/all projects — genuinely overlapping sets.

- Build one client-side screen with Active / Completed segments; reuse `ClientProjectRow` for both.
- `HistoryScreen.tsx` also serves the consultant ("Sales History", earnings, reviews — see its header comment at `:1-14`). **Do not merge the consultant side.** Keep `HistoryScreen` as the consultant's Sales History and route the client role to the new merged screen.
- Client bottom nav (`BottomNavigation.tsx:56-62`) drops from 5 tabs to 4: HOME | SEARCH | ACTIVITY | SHOP. Update `MainTabParamList` in `types/navigation.ts` and the `Tab.Screen` list in `App.tsx:93-104`.
- Grep for `navigate('History')` and `navigate('MyActivity')` before deleting either route.

### 2.3 Delete the orphaned hire screen
`HireConsultantScreen.tsx` is not reachable — nothing navigates to it (only `AssignProject` has callers, from `ActionBanner.tsx:19` and `TermsScreen.tsx:52`). It also carries three defects that would ship the moment someone linked it: `$` labels on `:179`, a hardcoded 30% markup on `:61`, and a fake `4.9/5.0` rating on `:273`.

Delete the file and its `App.tsx:180` route. Salvage nothing except the SELECTED CONSULTANT card layout (`:244-277`), which Phase 4 reuses.

---

# Phase 3 — Booking screen (`BookConsultantScreen.tsx`)

### 3.1 Keyboard covers the input — HW p5 ("Not Visible while typing")
The screen has `keyboardShouldPersistTaps` but no `KeyboardAvoidingView`, so the numeric keypad hides the BUDGET field being typed into. `AssignProjectScreen.tsx:199-202` already does this correctly — copy that pattern: wrap the `ScrollView` in `KeyboardAvoidingView` with `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}`.

### 3.2 Add time and duration — UX 8
Budget already exists (`:229`); only time and duration are missing.
- Migration: `projects.start_time TIME` and `projects.duration_value INTEGER` + `projects.duration_unit TEXT CHECK (duration_unit IN ('hours','days'))`.
- UI: a time picker and a duration stepper between SELECT A DATE and the creative-items chips.
- Wire into `createProject` at `:105-120` and into `canSubmit` at `:90-94`.
- If 1.5 lands first and the consultant's `price_unit` is per-day or per-hour, seed the budget as `base_price × duration` rather than raw `base_price`.
- Surface both on the consultant's side too, or they'll accept a booking without knowing the call time: `ConsultantWorkOrderScreen`, `ClientWorkorderScreen`, `CreatorWorkorderScreen`.

### 3.3 Calendar contrast — UX 7
`MonthCalendar.tsx` uses `#F8F9FB` for past days and `#E5E7EB` for booked — nearly indistinguishable from the white "available" state, and the legend at `:113-126` doesn't mention past days at all.
- Give booked days a visible treatment (strikethrough or a distinctly darker fill) and past days a clearly lighter, lower-contrast one.
- Add a "Past" legend entry, or drop past days out of the grid entirely.
- Check the resulting text-on-fill pairs against WCAG AA (4.5:1); the current disabled grey on near-white fails.

### 3.4 Sticky CTA — UX 9
The Send Booking Request button (`:239`) sits at the end of a long scroll. Pin it to the bottom in a bar outside the `ScrollView`, above the safe-area inset. When disabled, say why ("Pick a date to continue") rather than only dimming — `canSubmit` at `:90` has four independent conditions and the user currently can't tell which one is unmet.

---

# Phase 4 — Direct Hire from the dashboard (HW p2)

### 4.1 Entry point
`ClientDashboard.tsx:111-126` has a bid CTA and nothing for direct hire. Add a Direct Hire card alongside it, routed to `AssignProject`. This is what the red "Direct Hire from the Dashboard" title on HW p2 is asking for.

### 4.2 Consultant picker
Per your answer: keep `HIRE ROLE` as the role picker (`AssignProjectScreen.tsx:258-295`), then add a `SELECT CONSULTANT` dropdown below it listing approved consultants in the chosen discipline. `SELECT CREATIVE ITEMS` (`:297-329`) already does what the second annotation describes and needs no change.

- Data: `fetchActiveConsultants()` already exists in `consultantService`; filter client-side by `categoryForRole(hireRole)`.
- Reset the selected consultant when the role changes, the same way `:281` already resets the creative item.
- When the screen is entered with a consultant already attached (from a profile), pre-select and lock the picker.

### 4.3 Selected Consultant card
HW p2 circles the SELECTED CONSULTANT block. `AssignProjectScreen` shows a thin chip at the top (`:234-253`); the reviewed layout has a fuller card at the bottom. Port the card markup from `HireConsultantScreen.tsx:244-277` before deleting that file — but drop the hardcoded `4.9/5.0` and use the real `fetchConsultantRatings`, as `CreatorProfileScreen.tsx:47` does.

### 4.4 Open question
HW p2 also circles the T&C checkbox with no accompanying text. The checkbox exists and gates submission (`AssignProjectScreen.tsx:396-411`), so I can't tell what's being asked. **Flagging for the client rather than guessing.** Best hypothesis: the Terms link should open the actual terms (`TermsScreen`), which it currently does not — `:408` renders styled text with no `onPress`. I'd fix that regardless; it's a small, clearly correct change.

---

# Phase 5 — Client dashboard polish (`ClientDashboard.tsx`)

### 5.1 Typography hierarchy — UX 1
"Explore Creative Consultant's Portfolio" (`:245-251`, `fontSizes.base`, navy, bold, centered) competes with the section headers "Creators in Demand" etc. (`:300-303`, `fontSizes.lg`, orange, bold). Two bold headings a few pixels apart in weight, differing mainly in hue.

Fix: demote the subtitle to a caption (smaller, medium weight, tertiary colour) or promote it to a true page title well above the section headers. Pick one level per role and apply it consistently.

### 5.2 Duplicate creators — UX 2
Real bug in `getCreatorsForSection` (`:58-69`). "Creators in Demand" takes the first creator of each unique category; "Photographer's Archive" takes every photographer. The top photographer therefore appears in both — and because `FeaturedCreatorCard` picks its fallback work sample by `index` (`:53-54`), position 0 in both sections resolves to the same `photoArchive1` image. Identical name, identical picture, twice on one screen.

Fix: either exclude creators already shown in "Creators in Demand" from the category sections, or make "Creators in Demand" a genuinely different set (recent bookings, rating, admin-featured flag) rather than "first of each category". The second is the better product answer, since "in demand" should mean something.

### 5.3 Internal codes on cards — UX 3
`FeaturedCreatorCard.tsx:87-91` shows `DSTME` / `D21SK` in a pill under every name. These are internal identifiers with no meaning to a client. Replace with the discipline label ("Photographer") or the price, which is what someone browsing actually wants. Consistent with removing codes from the profile in 1.3.

### 5.4 Dead "View All" buttons
Not in either review, found while tracing. `ClientDashboard.tsx:159-162` renders a "View All" button per section with no `onPress`. Either wire it to a filtered `SearchScreen` or remove it — a control that does nothing on every section of the home screen is worse than no control.

---

# Migrations

Three columns across two tables:

```sql
ALTER TABLE consultant_profiles
  ADD COLUMN IF NOT EXISTS price_unit TEXT DEFAULT 'per_project'
    CHECK (price_unit IN ('per_project','per_day','per_hour'));

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS start_time TIME,
  ADD COLUMN IF NOT EXISTS duration_value INTEGER,
  ADD COLUMN IF NOT EXISTS duration_unit TEXT
    CHECK (duration_unit IN ('hours','days'));
```

Per your existing setup notes, `supabase db push` is not safe against the live project right now (no Docker, empty migration baseline). Write these as a numbered file in `supabase/migrations/` for the record **and** append them to `supabase/APPLY_MANUALLY.sql`, which is the pattern already in use. Apply through the SQL editor. All three are additive with defaults, so no downtime and no backfill.

---

# Suggested order

| # | Phase | Why here | Rough size |
|---|---|---|---|
| 1 | 1.1–1.4 (profile text, codes, icon) | Pure display, no schema, no nav. Ship immediately | Small |
| 2 | 3.1 keyboard, 3.4 sticky CTA, 3.3 contrast | Self-contained booking-screen defects | Small |
| 3 | 5.1–5.4 dashboard | Isolated to two files | Small–medium |
| 4 | Migrations + 1.5 price unit + 3.2 time/duration | Schema first, then the screens that read it | Medium |
| 5 | 1.6 Shop button | Depends on the shop-view decision in 1.6 | Medium |
| 6 | 2.3 delete + Phase 4 Direct Hire | Delete after salvaging the card | Medium |
| 7 | 2.1 role switch → SideMenu | Touches every screen with a header | Medium |
| 8 | 1.7 ScreenHeader + 2.2 tab merge | Widest blast radius; land last with the rest stable | Large |

## Items deliberately not actioned

- **UX 5 / HW p1** (role selection repeated, HOME arrow) — you confirmed with the client that the home page and buttons stay as they are.
- **UX 8's "missing budget"** — already implemented; the reviewer's screenshot was cropped.
- **HW p2 T&C circle** — intent unclear, raised in 4.4. The Terms link not being tappable will be fixed regardless.
