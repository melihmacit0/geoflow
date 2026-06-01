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
cd backend
npm install
npm start
```

**2. Frontend** (port 4200)

```bash
cd frontend
npm install
npm start          # → http://localhost:4200
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
| `/`               | Landing page — hero, feature cards, editorial section, CTA             |
| `/signin`         | Sign in / Sign up (split brand layout)                                 |
| `/discover`       | **Core** interactive Leaflet map + filter sidebar + trending carousel  |
| `/country/:code`  | Destination detail — Culture & History + Flights & Logistics tabs      |
| `/saved`          | Saved destinations grid (requires sign-in)                             |
| `/compare`        | Multi-country comparison — map + metrics table with best-value flags   |
| `/profile`        | Account settings, travel preferences, saved footprint (requires sign-in) |

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

## Notes for production

- Swap the in-memory user/saved stores for **Firebase Auth + Firestore** (proposal Stage 4).
- Replace mock flight data in `backend/src/data/destinations.js` with the **Amadeus / Skyscanner** API.
- Cultural data can be enriched live from the **RestCountries / Wikipedia** APIs.
