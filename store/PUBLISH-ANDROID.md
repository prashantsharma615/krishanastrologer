# Publishing Krishan Astrologer on Google Play

The app is a PWA. For Google Play it is wrapped as a **Trusted Web Activity (TWA)**: a small Android app that opens
https://krishanastrologer.netlify.app full-screen. Every update you push to GitHub/Netlify appears in the Play app
automatically — you only rebuild the Android package if you change the app name, icon or colours.

## 1. Google Play developer account (one time)
- Go to https://play.google.com/console and sign up (one-time fee US$25; identity verification can take a few days).

## 2. Generate the Android package with PWABuilder
1. Open https://www.pwabuilder.com and enter `https://krishanastrologer.netlify.app`.
2. Click **Package for stores → Android → Generate package**. Suggested settings:
   - Package ID: `app.netlify.krishanastrologer` (cannot be changed after the first upload)
   - App name: `Krishan Astrologer` · Launcher name: `Krishan Astro`
   - Signing key: **Create new** — download the zip and **keep the `signing.keystore` and its passwords safe forever**
     (without them you can never update the app).
3. The zip contains `app-release-bundle.aab` (upload this to Play) and `assetlinks.json`.

## 3. Prove you own the website (removes the browser address bar)
1. Put the `assetlinks.json` from the zip into this repo at `.well-known/assetlinks.json` and push to GitHub.
2. After creating the app in Play Console, open **Setup → App signing**, copy the **SHA-256 certificate fingerprint**
   of the *App signing key* and add it to the `sha256_cert_fingerprints` list in `.well-known/assetlinks.json` too. Push again.
3. Check it opens: https://krishanastrologer.netlify.app/.well-known/assetlinks.json

## 4. Create the Play listing
- **Main store listing:** copy the texts from `store/play-store-listing.md`.
- **Graphics:** icon `icons/icon-512.png`, feature graphic `store/feature-graphic-1024x500.png`,
  phone screenshots `store/screenshots/01…08` (extra ones are in `store/screenshots/extra/`).
- **Privacy policy URL:** https://krishanastrologer.netlify.app/privacy.html
- **App content:** Data safety → the app does not collect or share data (birth details stay on the phone);
  Ads → No ads; Target audience → 18+; Category → Lifestyle.

## 5. Release
- Upload `app-release-bundle.aab` under **Testing → Internal testing** first, install it on your phone, then
  promote to **Production**. New personal developer accounts must first run a closed test with at least
  12 testers for 14 days before production access is granted.

## iPhone
- Users can already install it from Safari (Share → Add to Home Screen); the app shows these steps.
- An App Store version needs an Apple Developer account (US$99/year) and a Mac with Xcode; PWABuilder's
  **iOS** package can be used for that later.
