# Store listing copy

Paste into Play Console → Main store listing. Character limits are Google's and are counted
below with spaces.

---

## App name (30 max)

```
DCreators
```

9 characters. If you later want keywords in the name, `DCreators: Hire Creators` is 24 and
still fits, but a bare brand name reads better on the home screen.

---

## Short description (80 max)

```
Hire photographers, designers and artisans. Buy original art. Pay safely.
```

72 characters. This is the line shown in search results and it does more work than anything
else in the listing.

---

## Full description (4000 max)

```
DCreators connects you with photographers, designers, sculptors and artisans across India,
and lets you buy original artwork directly from the people who made it.

FOR CLIENTS

Browse creators by discipline and see their real portfolios before you commit. Book someone
directly for a date and a budget you set, or post your requirement and let creators bid for
it. Agree the price in chat, then pay half up front and half when the work is approved, so
nobody is out of pocket while a project runs.

- Search photographers, designers, sculptors and artisans
- See portfolios, rates and ratings from previous clients
- Book a specific date, time and duration
- Negotiate the price in the app, with both sides having to agree
- Track a project from brief to delivery
- Buy original artwork, shipped to your door with a tracking number

FOR CREATORS

Set up a profile once, show your work, and set your own rates by project, by day or by hour.
Clients come to you with briefs. Accept the ones you want, counter the price if it is wrong,
and get paid through the platform rather than chasing invoices. You can also list finished
pieces for sale in the shop.

- Publish a portfolio and set your own rates
- Receive booking requests and open bids
- Counter-offer on price rather than take it or leave it
- Manage projects, revisions and delivery in one place
- Sell original artwork with advance and balance payments
- Switch between hiring and creating on the same account

HOW PAYMENT WORKS

Every payment splits in two: an advance before work starts, and the balance when you approve
the finished piece. Payments are processed by Cashfree. We never see your card, UPI or
netbanking details. Prices are in Indian rupees.

VERIFIED CREATORS

Creators are reviewed before they appear in search. We check identity and bank details so
that the person you hire is the person whose work you saw.

Questions: support@dcreators.in
```

Roughly 1,750 characters, comfortably inside the limit.

---

## A caution on the copy

Two claims above are promises the product has to keep:

- **"Creators are reviewed before they appear in search."** True as of the approval lock in
  `20260830120100_lock_consultant_approval.sql`, and only because someone actually reviews
  and approves each one. If approvals get rubber-stamped, this line is false advertising.
- **"shipped to your door with a tracking number."** The dispatch screen collects a
  consignment number, so this holds as long as artists fill it in.

Do not add "escrow" anywhere in the listing. Money is held by Cashfree under a normal
payment gateway arrangement, not in an escrow account, and the word carries regulatory
weight in India that the current setup does not support.
