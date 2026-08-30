# Public pages for dcreators.in

Three static pages Google Play requires before it will accept the listing, plus the
stylesheet they share. No build step, no dependencies.

| File | Must be reachable at | Why |
|---|---|---|
| `privacy.html` | `https://dcreators.in/privacy` | Play Console demands a privacy policy URL, and the Data Safety form is checked against it. |
| `delete-account.html` | `https://dcreators.in/delete-account` | Play requires account deletion to be startable without installing the app. |
| `terms.html` | `https://dcreators.in/terms` | Linked from Settings and from the booking flow. |

The app links to these three paths from `dcreators-mobile/src/lib/legal.ts`. If you host
them somewhere else, change that file too or the Settings links break.

## Deploying

Any static host works. On Netlify, Vercel or Cloudflare Pages, point the project at this
directory and the extensionless URLs above resolve to the `.html` files automatically. On
plain nginx or Apache you need a rewrite, or rename the files to directories with an
`index.html` inside each.

Check afterwards that `https://dcreators.in/privacy` opens in a private window with no
sign-in. Play's reviewer will fetch it unauthenticated, and a 404 is a rejection.

## Before you publish them

Both `privacy.html` and `terms.html` contain `TODO` comments and `____` placeholders that
have to be filled in:

- registered company name and address
- the Supabase hosting region
- the grievance officer's name and email, which the DPDP Act 2023 requires you to publish
- the platform fee percentage, the payout window, and the courts named in clause 12

`terms.html` is a working draft, not legal advice. DCreators takes a fee on transactions
between two other parties, which makes it an intermediary under Indian law, so have a
lawyer read it before relying on it.

`privacy.html` describes what the code actually does today. If you change what the app
collects, or add a fifth processor alongside Supabase, Cloudinary, Cashfree and Expo, the
page and the Data Safety form both have to change with it.
