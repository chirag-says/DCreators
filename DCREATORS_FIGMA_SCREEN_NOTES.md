# DCreators — Figma Screen Notes (visual companion to the implementation plan)

> **Purpose:** Plain-text annotations of the Figma reference screens, so the coding model can replicate the UI **without relying on reading the PNGs**. Pair this with `DCREATORS_IMPLEMENTATION_PLAN.md` (the flow/role logic) and the PNGs in `claudereferfigma/` (the pixels).
>
> **Honesty flag:** Screens marked **[ANNOTATED — examined in detail]** were studied directly and are described accurately below. Screens marked **[NOT YET ANNOTATED — open the PNG]** were not opened in detail; for those, open the file in `claudereferfigma/` before building, and treat the structure note as a hint only, not gospel.
>
> **Global chrome (applies to almost every screen):**
> - Light lavender/off-white background (`#F4F4F8` → `#EDF1F5`).
> - **TopHeader**: small "D / Dcreators" logo top-left, tiny tagline "HIRE CREATIVES. BUY ART. BUILD IDEAS." under it, a **bell** icon and a circular **avatar** top-right.
> - **Screen title**: large, bold. Navy/indigo (`#1B3A5C`/`#21317A`) for most; **orange** (`#E8854A`) for "Sales Dashboard".
> - **Bottom nav** (dark or light bar): client = `BACK · EXPLORE · PROJECTS · SEARCH · PROFILE`; consultant = `BACK · HOME · SEARCH · SALES · PROFILE`. Active item tinted (navy/indigo or yellow).
> - Cards: white, radius ~16, soft shadow. Inputs: off-white, radius ~12, 1px border. Primary button: navy fill, pill/rounded, white text. Secondary: navy outline, transparent.

---

## AUTH / LANDING

### Welcome to Dcreators — **[ANNOTATED]** · shared
File: `Welcome to Dcreators.png`
- Centered "Dcreators" logo (the "D" is decorative/patterned, "creators" in indigo) with an orange swoosh underline.
- Tagline caps under logo: "HIRE CREATGERS. BUY ART. BUILD IDEAS." (note the Figma typo "CREATGERS" — use the correct "HIRE CREATIVES. BUY ART. BUILD IDEAS.").
- Big two-line headline in **orange**: "Unparallel Creative Ecosystem".
- A **vertical trail of 5 circular icons** connected by a dashed line: camera (photographer), pen-nib/bulb (designer), easel (artist), flask/beaker (artisan), and a filled navy circle with a **magnifier** (explore) at the bottom.
- Sub-copy: "User can Assign Projects, Buy Artwork and collaborate with photographers, designers, artists, and artisans."
- Single **"Sign up"** button — **outlined** (white fill, thin border, pill), full-width, large centered label.
- Footer credit (small, centered): "A Joint Venture of **Ishisoft Pvt.Ltd**, **Mr. Shoumik Mazumder** and **Design & Animation Club**, Department of Visual Arts, AUS / Honorary Design Mentor – **Dr. Gautam Dutta**, Department of Visual Arts, AUS".

### Join Dcreators / Sign Up with Brand Assets / Create Creator's Account — **[NOT YET ANNOTATED — open the PNG]** · shared→consultant
Files: `Join Dcreators.png`, `Sign Up with Brand Assets.png`, `Create Creator's Account.png`
- Structure (from UI Doc §4.2–4.3): account form (social login, profile photo, full name, email, mobile/OTP, address) → consultant verification (profile photo, experience, Aadhaar/PAN, bank name, IFSC, account number, upload T&C, confidentiality notice, Register CTA).

---

## DASHBOARDS

### Creators Dashboard - Final (CONSULTANT HOME) — **[ANNOTATED]** · consultant
File: `Creators Dashboard - Final.png`
- Title centered: **"Creator's Dashboard"**.
- Two pill toggle buttons under the title: **"Sales Dashboard"** | **"Project Dashboard"** (these switch the consultant's two sub-dashboards).
- Then a **vertical scroll of the consultant's own portfolio/project cards**. Each card:
  - Large image (artwork/project mockup) filling the card width.
  - Title (e.g., "IBM Newspaper AD", "INDIA SIGN + DIGITAL EXPO", "Indian Beach Cricket League", "IBCL Website", "Installation").
  - Subtitle/category line (e.g., "Print Campaign", "Logo Design", "Launch by Wave Vow Pvt Ltd", "Theme: Reflection").
  - Price on the right (e.g., "₹00.00", "₹1400.00").
  - Small "Artwork Brief..." link.
  - Size line (e.g., "Size: 33 cm x 25 cm", "Size: Open", "Size: 3 X 3").
  - Availability label: "**Not for Sale**" / "**Open**" / "**Available for Sale**".
  - An **edit pencil** icon on the right of each card.
- Bottom nav: `BACK · HOME · SEARCH · SALES · PROFILE`.
- ⚠️ This is the **consultant's home**. The current code does NOT build this — it shows the Sales request screen instead. Build this grid (see Plan Phase 1.1).

### Explore Creative Consultant's Portfolio (CLIENT HOME) — **[ANNOTATED]** · client
File: `Explore Creative Consultant's Portfolio.png`
- Subtitle under TopHeader: "Explore Creative Consultant's Portfolio".
- Horizontal **category tabs**: Photographer · Designer · Artist · Artisans.
- **5 stacked section blocks**, each a colored header bar + a **horizontal scroll of creator cards**, with a "View All →" link on the right of each header:
  1. **"Creators in Demand"** — header dark gray (`#4D4D4D`).
  2. **"Photographer's Archive"** — header near-black (`#1A1A1A`).
  3. **"Designer's Desk"** — header warm brown (`#4E3F30`). *(Note: current code calls this "Designer's Hub" — match the Figma word "Desk".)*
  4. **"Artist's Gallery"** — (code is MISSING this section).
  5. **"Artisan's Hub"** — (code is MISSING this section).
- Each creator card: portrait image, a name pill ("Mr. Gautam" / "Mr. Rajdeep"), and a code line.
- Near the bottom: **"Sales Dashboard"** | **"Project Dashboard"** buttons (shared chrome with the consultant dashboard — this is why the two got confused).
- Bottom nav (client).
- ⚠️ Current `ClientDashboard.tsx` only has 3 of the 5 sections. Add Artist's Gallery + Artisan's Hub and rename Designer's Hub → Desk (Plan Phase 1.3).

### Sales Dashboard (CONSULTANT, Product B) — **[ANNOTATED]** · consultant
File: `Sales Dashboard.png`
- Title in **orange**: "Sales Dashboard".
- Sub-copy: "Manage your creative transactions, pending artwork requests, and fulfillment status for your global collectors."
- Card header (navy): **"Request received for Purchase"**.
- **ARTWORK DETAIL**: a real artwork image with an overlaid caption ("Untitled #042" + "Digital Photography").
- **DELIVERY ADDRESS** (truck icon): e.g., "Rupok Kumar nug, Shibbany Road, Tarapur Silchar Cachar Assam 788003".
- **PAYMENT STATUS** (card icon): bullet "Invoice will be raised on acceptance", bullet "Artwork cost: (₹4,250.00)", italic orange note "Funds will be released upon delivery confirmation."
- Checkbox: "I agree to the **Terms and condition**".
- Two buttons: **"Accept Request"** (navy fill) and **"Pass on"** (orange outline).
- **ABOUT THE BUYER**: avatar + "Marcus Thorne", "Verified Collector since 2021", and a testimonial quote.
- Bottom nav (consultant).
- ⚠️ Must read from `artwork_orders`, NOT `projects` (Plan Phase 1.2 / 3.2). The current `ConsultantDashboard.tsx` is visually close to this but is wired to the wrong table and placed as the home screen.

---

## PRODUCT A — CREATIVE SERVICES

### Hire & Assign Project (CLIENT) — **[ANNOTATED]** · client
File: `Hire a Consultant - Open Gallery Dashboard.png`
- Title navy: "**Hire & Assign Project**".
- Sub-copy: "Create a professional assignment brief and secure the perfect talent for your creative vision."
- Form fields (labels are ALL-CAPS, gray, above each input):
  - **HIRE ROLE** — dropdown, value "Hire Creative Consultant".
  - **SELECT CREATIVE ITEMS** — dropdown, value "Logo Design".
  - **ASSIGNMENT DATE** — date input "mm/dd/yyyy" + calendar icon.
  - **ASSIGNMENT BUDGET ($)** — numeric "5,000.00" + a copy/stack icon.
  - **ASSIGNMENT BRIEF** — multiline textarea with sample paragraph text.
- Checkbox: "I agree to the **Terms and Condition** for creative assignments."
- Two buttons side by side: **"Submit Assignment"** (navy fill) + **"Save Draft"** (navy outline). Below them a centered **"Reset"** text link.
- Bottom nav: `BACK · EXPLORE · PROJECTS · SEARCH · PROFILE` (PROJECTS active).

### Project Dashboard — Negotiation state (CONSULTANT) — **[ANNOTATED]** · consultant
File: `Negotition.png`
- Title navy: "**Project Dashboard**".
- Orange line: "Project Assignment - D/05/09/26".
- Gray line: "Incoming Request from 'Aura Digital Agency'".
- **Brown banner**: "The project is open for **Negotiation** in Project Cost and Project Deadline".
- Big navy heading: "Brand Identity Overhaul for Fintech Startup".
- A light card: **ESTIMATED BUDGET** "₹4,500.00", **PROJECT DEADLINE** "Sep 15th 26 - (10 Days)".
- A blue-tinted card with: **"Negotiable amount"** input ("₹ Enter your proposed amount") and **"Suggested Deadline"** input ("00/00/2026 - Day- 00").
- **"Submit Offer"** button (navy fill, pill).
- Below: **"Download work order"** button (outline).
- An **upload dropzone**: "Upload Designs for 1st Review / Drag & drop or click to browse", note "Upload up to 3 variations for client review."
- **"Submit for 1st review"** button (teal fill).
- Bottom nav (consultant, SALES active).
- ⚠️ This single screen carries the Negotiation + Download-WO + Review-upload states. It maps to `CreatorWorkorderScreen.tsx`. Make it the consolidated consultant Project Dashboard (Plan Phase 2.2).

### Project Dashboard — Collaboration state (CONSULTANT) — **[ANNOTATED]** · consultant
File: `Collaboration Deshboard.png`
- Same header as above ("Project Dashboard", "Project Assignment - D/05/09/26", "Incoming Request from 'Aura Digital Agency'").
- **Brown banner**: "The project is open for **Collaboration**".
- Same budget/deadline card.
- Section label orange: "**SEARCH CREATIVE CONSULTANT FOR COLLABORATION**".
- Search input + "Total Candidates (10)" with a "»" expander.
- A candidate card: avatar + "**Alex Rivera**", "Code: AR-9024", "8+ Years", "**Verified Pro**" badge, **"Collaborate Now"** button (navy).
- Footer: "Received response".
- ⚠️ Collaboration is **consultant → consultant** (a consultant inviting another to help). Fold the two existing collaboration screens into one (Plan Phase 2.2).

### Work Order document — CONSULTANT accepts — **[ANNOTATED]** · consultant
File: `Submit Work-Order for Assin - Creators Dashboard.png`
- Header block: "**WORK ORDER**", "FORMAL AGREEMENT DOCUMENT", "Work Order No: WO-2026-001", "Date: 09 June 2026".
- Title: "Brand Identity Overhaul for Fintech Startup". CLIENT: "Aura Digital Agency". DESIGNER: "Alex Rivera".
- **§ Project Overview** — paragraph about creating a comprehensive brand identity system.
- **§ Detailed Deliverables** (numbered 01–04): Primary Logo Design; Secondary Brand Marks; Brand Guidelines (20-page); Social Media Templates (5 templates).
- **§ Project Cost**: Total Project Fee "₹6,500.00", Advance Paid "₹4,500.00", Balance Due "₹2,000.00".
- **§ Timeline**: FINAL DELIVERY "15 September 2026", "Milestone updates every 14 days".
- Legal sub-sections: DELIVERABLES, REVISIONS, ACCEPTANCE (with "By clicking 'Accept'..." text).
- **"Accept Work Order"** button (navy fill).
- Maps to `ConsultantWorkOrderScreen.tsx` (already correct). Transition: `work_order_generated → work_order_accepted`.

### Work Order document — CLIENT view — **[ANNOTATED]** · client
File: `Workorder for Consultant - Open Gallery Dashboard.png`
- **Visually near-identical** to the consultant version above (same sections/layout). Amounts in the mock differ slightly (Total ₹6,000 / Advance ₹4,000 / Balance ₹2,000) — these are placeholders; use real project values.
- Also shows an "Accept Work Order" button. This is the client's view/approval of the generated WO.
- ⚠️ This is a **mirror** of the consultant WO. Build as a thin client screen sharing the WO sub-components (Plan PART A5).

### Advance / Hire payment (CLIENT) — **[ANNOTATED]** · client
File: `Advance Payment process.png` (a.k.a. "Complete Payment for Hire & Assign Project")
- Title navy: "**Complete Payment for Hire & Assign Project**".
- Sub-copy: "Review your order details and select a secure payment method to finalize the acquisition."
- **Payment Method** section: two selectable rows — "CREDIT / DEBIT CARD / Visa, Mastercard, AMEX" (radio selected) and "DIGITAL WALLET / Apple Pay, Google Pay".
- Card fields: **Cardholder Name** ("Alex Rivera"), **Card Number** ("**** **** **** 4421" + card icon), **Expiry Date** ("MM/YY"), **CVV** ("***").
- Blue reassurance strip with shield icon: "Your transaction is encrypted and secured by high-standard industry protocols."
- **Order Summary**: item ("Untitled" / "High-Resolution Digital Print, Size 48cm X 55 Cm" / "ID: AR-2026-001").
- Breakdown rows: Artwork Price ₹6000.00, Advance ₹4000.00, Balance ₹2000.00.
- **Total Amount** (bold, orange value): ₹4000.00.
- **"Pay Advance Amount"** button (navy fill). Footer: "By clicking Pay Now, you agree to the Terms of Service."
- ⚠️ This mock reuses **artwork** wording for a **project** payment — that's the copy-bug the UI Doc flags. For Product A, the order summary must show the **project** title + project fee/advance/balance. Keep the same visual; fix the copy (Plan Phase 2.5).

### Rate Your Experience (CLIENT) — **[ANNOTATED]** · client
File: `Client Review.png`  *(filename says "Client Review" but the screen is the post-completion rating)*
- Title bold black: "**RATE YOUR EXPERIENCE**".
- Sub-copy: "Your feedback helps Alex Rivera maintain high creative standards."
- A card: consultant avatar + "**Alex Rivera**", "CREATIVE CONSULTANT • PROJECT COMPLETED".
- "How would you rate the service?" + a **5-star** row (orange filled stars, 4/5 shown).
- "SHARE YOUR FEEDBACK" textarea (placeholder: "Alex was incredible to work with...").
- **"SUBMIT REVIEW"** button (navy fill).
- Below the card: **tag chips** — "Fast Delivery", "Great Comms", "Exceeded Expectation".
- Bottom nav: `BACK · EXPLORE · PROFILE · SALES · PROJECTS` (PROFILE active).
- Maps to `RateConsultantScreen.tsx` / `RatingReviewScreen.tsx`. Transition: `delivered → completed`.

### Other Product-A screens — **[NOT YET ANNOTATED — open the PNG]**
- `Pament Confirmation and Generate workorder - Open Gallery Dashboard.png` (CLIENT) → "Payment Confirmed" + "Generate Work Order". Maps to `GenerateWorkOrderScreen.tsx`.
- `Advance Payment Confirmatiom for Hire - Open Gallery Dashboard.png` (CLIENT) + `Advance Payment Confirmation - Creator's Dashboard.png` (CONSULTANT) — mirror confirmation pair.
- `Accept/Negotiation/Payment response - Creator's Dashboard.png` (CONSULTANT) — consultant's view of negotiation/payment response.
- `Ballance Pament - Open Gallery Dashboard.png` (CLIENT) + `Ballance Pament - Creators Dashboard.png` (CONSULTANT) — balance payment mirror pair.
- `Accept Project - Final Submission.png` (CLIENT) — final approval (`final_review → final_approved`).
- `Pament Conformation for download Artwork - Open Gallery Dashboard.png` (CLIENT) + `Download Artwork - Creators Dashboard.png` (CONSULTANT) — download/deliver mirror pair.
- `Manage Project.png` (CONSULTANT) → ongoing list + delivered table + calendar (`ConsultantProjectManagementScreen.tsx`).
- `Project Dashboard.png` (CONSULTANT) — the base Project Dashboard (Negotition/Collaboration are its states).

---

## PRODUCT B — ARTWORK MARKETPLACE — **[NOT YET ANNOTATED — open the PNG]**
- `Product Sales.png` (CLIENT) — Buy Art marketplace listing (`ShopScreen.tsx`).
- `Payment Gateway for Buy Product.png` / `Complete Payment Gateway - Open Gallery Dashboard.png` (CLIENT) — artwork payment (`ArtworkPaymentScreen.tsx`). Likely same visual as the advance-payment screen above.
- `Payment/Courier Confirmation for Buying Product.png` (CLIENT/CONSULTANT) — dispatch/tracking (`ArtistOrderDispatchScreen.tsx` / `ArtworkOrderTrackingScreen.tsx`).
- `Payment & Delivery for Assignment Confirmation.png` (CLIENT) — delivery confirm.
- `Sales Dashboard - 2.png`, `Sales Dashboard - all sales item.png`, `Sales History.png` (CONSULTANT) — sales history/earnings (`ConsultantEarningsHistoryScreen.tsx`).
- `Advance Payment Confirmatiom for Hire - Open Gallery Dashboard.png`, `Hire from Creative Consultant List - Open Gallery Dashboard.png` (CLIENT, matching `ConsultantMatchingScreen.tsx` — candidate list).

---

## CONSULTANT SETUP — **[NOT YET ANNOTATED — open the PNG]**
- `Update Creators Portfolio.png` (CONSULTANT) — 5-slot artwork upload (`ConsultantPortfolioUpdateScreen.tsx`).
- `Consultancy Details.png` (CONSULTANT) — service catalog + fees + T&C (`ConsultantServicePricingScreen.tsx`).
- `Explore Photographer's / Designer's / Artist's / Artisan's Portfolio.png` (CLIENT) — per-category browse.
- `Any Creators Dashboard.png` (Creators Rajdeep folder) — a creator profile view sample.

---

## CURRENT-CODE BUG MAP (exact, for the executor)
| Symptom | File:approx line | Fix |
|---|---|---|
| Consultant "home" shows artwork purchase requests fed from `projects` | `src/components/dashboard/ConsultantDashboard.tsx` (filters `status==='assigned'`, renders "Request received for Purchase") | Split: home = portfolio grid (`Creators Dashboard - Final`); move purchase-request UI to Sales sub-screen reading `artwork_orders`. |
| Dashboard files have inverted/misleading comments | `ClientDashboard.tsx:1-3` ("Creator's Dashboard"), `ConsultantDashboard.tsx:1-16` | Correct the comments to match real role. |
| Client explore missing 2 of 5 sections; wrong section name | `ClientDashboard.tsx` `SECTIONS` array (only 3 entries; "Designer's Hub") | Add Artist's Gallery + Artisan's Hub; rename to "Designer's Desk". |
| Literal `\\n` shown in quick-tile labels | `ConsultantDashboard.tsx` ("Update\\nPortfolio", "Service\\nPricing") | Use a real newline `\n`. |
| 4 overlapping work-order screens with confused names | `ClientWorkorderScreen` (really client review timeline), `CreatorWorkorderScreen` (really consultant negotiation+upload), `ConsultantWorkOrderScreen` (correct: WO accept), `GenerateWorkOrderScreen` (correct: generate) | Keep WO-accept + generate; treat the other two as review-timeline / project-dashboard and fix their header comments (or rename). |
| Two collaboration screens | `CollaborationDashboard.tsx` + `ConsultantProjectCollaborationScreen.tsx` | Consolidate to one collaboration surface. |

---

*This file is descriptive notes only — it changes no logic. The flow/role rules live in `DCREATORS_IMPLEMENTATION_PLAN.md`.*
