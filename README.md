# Bees Pollination App

A minimal web app that uses Pollinations BYOP (Bring Your Own Pollen) to generate images.

## Setup

1. Deploy this folder as a static site.
2. Copy the final HTTPS URL, including the exact path to `index.html`.
3. In Pollinations, create a **publishable App Key** (`pk_...`) and register that exact URL as its Redirect URI.
4. Replace `REPLACE_WITH_YOUR_POLLINATIONS_APP_KEY` in `app.js`.
5. Redeploy.

The app uses OAuth Authorization Code + PKCE. It requests a 1-Pollen budget and only the `zimage` model for the demo.

## Important

Do not put a secret `sk_...` key in this repository. This app is designed for the Pollinations BYOP publishable App Key flow.

Pollinations documentation:
https://github.com/pollinations/pollinations/blob/main/BRING_YOUR_OWN_POLLEN.md
