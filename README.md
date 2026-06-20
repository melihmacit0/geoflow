# GeoFlow — Travel Discovery Platform

A unified, map-based travel discovery website that bridges **cultural education**,
**geographic discovery** and **flight logistics** in a single spatial interface —
the CENG318 HCI project prototype.

- **Frontend:** Angular 19 (standalone components) + Tailwind CSS + Leaflet (interactive world map)
- **Backend:** Node.js + Express (orchestration layer for cultural data + flight logistics)
- **Design system:** "Modern Globalist" — deep navy / warm gold / off-white editorial palette

Runs entirely **locally**. No payment processing — flight cards deep-link out to partners,
exactly as described in the proposal.

---

## Project structure

```
geoflow/
├── backend/          Express API (countries, flights, auth, saved destinations)
│   └── src/
│       ├── server.js
│       └── data/destinations.js   # curated cultural + logistics seed data
└── frontend/         Angular SPA
    └── src/app/
        ├── core/     services (api, auth), models, guard, interceptor
        ├── shared/   TopNav, Footer
        └── pages/    landing, signin, discover, country-detail, saved, compare, profile
```

## Prerequisites

- Node.js 20+
- npm 10+

## Running locally (two terminals)

**1. Backend** (port 4000)

```bash
# Terminal 1
cd backend
npm install
npm run dev
```

**2. Frontend** (port 4200)

```bash
# Terminal 2
cd frontend
npm install
npm start
```

Open **http://localhost:4200**.

### Demo account

The sign-in form is pre-filled with a seeded account:

- **Email:** `explorer@geoflow.com`
- **Password:** `explorer`

You can also register a new account from the **Sign Up** tab.

## Pages

| Route             | Description                                                            |
| ----------------- | ---------------------------------------------------------------------- |
| `/`                      | Landing page — hero, feature cards, editorial section, CTA            |
| `/signin`                | Sign in / Sign up (split brand layout)                               |
| `/discover`              | **Core** interactive Leaflet map + trending carousel                 |
| `/country/:code`         | Country detail + city picker (map of airports)                       |
| `/country/:code/city/:iata` | City detail — AI Culture tab + Book wizard (flight → hotel → car → summary) |
| `/saved`                 | Saved trips + compare mode (select 2–3 trips); `?compare=1` auto-opens it (requires sign-in) |
| `/compare`               | Redirects to `/saved` (compare lives there)                          |
| `/profile`               | Account settings + travel preferences (requires sign-in)             |

## API endpoints (backend)

```
GET    /api/countries                 list (filter by ?continent= &interest=)
GET    /api/countries/:code           full cultural detail
GET    /api/countries/:code/flights   flight offers from IST (mock aggregator)
POST   /api/auth/register | login     auth → JWT
GET/PUT /api/auth/me                  current user / update preferences
GET    /api/saved                     saved destinations (auth)
POST   /api/saved/:code               save (auth)
DELETE /api/saved/:code               remove (auth)
```

## Deploy to Vercel

The whole app (Angular static site **+** the Express API as a serverless function)
ships as **one** Vercel project. Persistence uses **Vercel Blob**, so accounts,
saved destinations and trips survive across requests (the in-memory store only
works locally).

**1. Push this repo to GitHub.**

**2. Import it on Vercel** → *Add New… → Project* → pick the repo.
Framework preset: **Other**. Build/install/output are already wired in
[`vercel.json`](vercel.json) — leave them as detected.

**3. Create the Blob store** → project → *Storage → Create Database → Blob* →
connect it to the project. This auto-injects the `BLOB_READ_WRITE_TOKEN`
environment variable the backend reads.

**4. (Recommended) add a `JWT_SECRET`** env var (any long random string).
All travel-API keys are **optional** — without them the app serves built-in mock
flights/hotels/cars. Add any you have: `DUFFEL_TOKEN`, `TP_TOKEN`,
`AMADEUS_CLIENT_ID` / `AMADEUS_CLIENT_SECRET`, `RAPIDAPI_KEY`, `GEMINI_API_KEY`.

**5. Deploy.** After adding the Blob store / env vars, trigger a redeploy so the
function picks them up. Open the `*.vercel.app` URL — the demo account
(`explorer@geoflow.com` / `explorer`) is seeded automatically on first request.

> CLI alternative: `npm i -g vercel`, then `vercel` (preview) and `vercel --prod`.

A custom domain can be attached later under *Project → Settings → Domains*.

## Notes for production

- Storage uses **Vercel Blob** as a simple whole-document JSON store (one demo
  user). For real multi-user load, move to **Vercel KV / Postgres** or
  **Firebase Auth + Firestore** (proposal Stage 4) for atomic, concurrent writes.
- Passwords are hashed with Node's built-in `scrypt`; the Blob documents are
  technically public-URL objects, so don't store real secrets there.
- Replace mock flight data in `backend/src/data/destinations.js` with the
  **Amadeus / Skyscanner** API.
- Cultural data can be enriched live from the **RestCountries / Wikipedia** APIs.
