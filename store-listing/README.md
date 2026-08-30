# Play Console listing

Everything here is pasted or uploaded into Play Console by hand. Nothing in this folder
ships inside the app.

| File | Where it goes |
|---|---|
| `play-icon-512.png` | Main store listing → App icon (512x512) |
| `play-feature-graphic-1024x500.png` | Main store listing → Feature graphic |
| `listing-copy.md` | Main store listing → title, short and full description |
| `data-safety.md` | App content → Data safety |

Still needed, and only you can produce them:

- **Phone screenshots**, 2 minimum, 8 maximum, at least 1080px on the short side. Take
  them from a `preview` build on a real device. Good set: the client dashboard, a creator
  profile, the booking screen, the shop, and a work order.
- **Content rating questionnaire**, answered live in the console.
- **Target audience**: 18 and over. The terms say so, so the console must too.
- **Ads declaration**: no ads.

## Building and submitting

```bash
cd dcreators-mobile
npx eas-cli build --platform android --profile production
```

That produces the `.aab` Play requires. Play has not accepted `.apk` for new apps since
2021; the `preview` profile still builds an `.apk`, which is only for sideloading to
testers outside Play.

To submit, create a service account in Google Cloud, grant it access in Play Console under
Users and permissions, download the JSON key to `dcreators-mobile/play-service-account.json`
(gitignored), then:

```bash
npx eas-cli submit --platform android --profile production
```

It uploads to the `internal` track as a draft, so nothing goes live without you promoting
it in the console.

## Before the first build

The privacy policy and account deletion pages at `web/` must be live at
`https://dcreators.in/privacy` and `https://dcreators.in/delete-account`. Play's reviewer
fetches both without signing in, and a 404 is a rejection.
