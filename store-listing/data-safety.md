# Data safety answers

Play Console → App content → Data safety. Google cross-checks these against the privacy
policy at `web/privacy.html` and against what the app actually does at runtime, so the three
have to agree. Every answer below is derived from the code, with the source noted.

## Overview answers

| Question | Answer |
|---|---|
| Does your app collect or share any of the required user data types? | **Yes** |
| Is all of the user data collected by your app encrypted in transit? | **Yes** (HTTPS to Supabase, Cloudinary and Cashfree) |
| Do you provide a way for users to request that their data be deleted? | **Yes** — `https://dcreators.in/delete-account` |

## Data types

For every row below: collected **yes**, shared **no**, processed **ephemerally no**,
required **yes** unless noted, and collection is not optional unless noted.

| Category | Type | Purpose | Where it comes from |
|---|---|---|---|
| Personal info | Name | Account management, App functionality | `profiles.name`, RegisterScreen |
| Personal info | Email address | Account management, App functionality | `profiles.email`, sign-in is email OTP |
| Personal info | Phone number | App functionality (contacting the other party in a booking) | `profiles.phone` |
| Personal info | Address | App functionality (artwork delivery). **Optional**, collected only when buying artwork | `profiles.address`, `artwork_orders.delivery_address` |
| Personal info | Other info — government ID | Account management (creator verification). **Creators only** | `consultant_kyc.aadhar_number`, `.pan_number` |
| Financial info | Other financial info — bank details | App functionality (creator payouts). **Creators only** | `consultant_kyc.bank_name`, `.ifsc_code`, `.bank_account_number` |
| Financial info | Purchase history | App functionality | `payments`, `artwork_payments` |
| Photos and videos | Photos | App functionality (profile picture, portfolio, artwork listings) | `expo-image-picker` → Cloudinary |
| Messages | Other in-app messages | App functionality | `messages` table |
| App activity | Other user-generated content | App functionality (project briefs, reviews, ratings) | `projects`, `reviews` |

## Answers that are easy to get wrong

**Payment card details: do not declare them.** Card, UPI and netbanking details are entered
on Cashfree's hosted page inside a WebView and never reach our code or database. The app
stores only the amount, the Cashfree order id, and the status. See
`supabase/functions/create-cashfree-order/index.ts`.

**Location: no.** Nothing in the app requests location, and no location permission is in the
manifest.

**Data shared with third parties: no.** Supabase, Cloudinary, Cashfree and Expo are service
providers processing data on our instructions, which Google's definition treats as
processing rather than sharing. Do not tick "shared" for them.

**Photo library permission: no longer requested.** `android.permission.READ_MEDIA_IMAGES` is
blocked in `app.json`, and the picker goes through the system photo picker, which returns
only the images the user selects. This means you should **not** get the Photo and Video
Permissions declaration form. If Play asks for it anyway, the manifest still contains the
permission and something reintroduced it; check `app.json` → `android.blockedPermissions`.

**"Government ID" is the row people miss.** The app collects Aadhaar and PAN from creators.
It sits under Personal info → Other info in Google's taxonomy, and omitting it is the kind
of mismatch that gets an app pulled after launch rather than at review.

## Deletion behaviour to declare

The deletion URL must describe what actually happens, and it does: account data is erased,
the login is closed permanently, and payment records survive for eight years with the name
removed because Indian company and tax law requires it. Google accepts retention for legal
reasons as long as it is disclosed, which `web/privacy.html` does.
