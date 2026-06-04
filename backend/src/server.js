import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { destinations, buildFlights, buildHotels, buildCars } from './data/destinations.js';
import { amadeus, getCached, setCache, mapOffer, fetchLiveHotels } from './amadeusClient.js';

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'geoflow-dev-secret';

app.use(cors());
app.use(express.json());

// ---- In-memory stores (stand-in for Firestore in the local prototype) ----
const users = new Map(); // email -> { id, name, email, password, homeAirport, currency, language }
const savedByUser = new Map(); // userId -> Set<countryCode>

// Seed a demo account so the UI works without registering first.
const demoId = 'u-demo';
users.set('explorer@geoflow.com', {
  id: demoId,
  name: 'Sıla Kırılmaz',
  email: 'explorer@geoflow.com',
  password: 'explorer',
  homeAirport: 'Istanbul — IST',
  currency: 'USD ($)',
  language: 'English'
});
savedByUser.set(demoId, new Set(['JP', 'FR', 'GR', 'TR', 'IS', 'TH', 'PE', 'IT', 'EG']));

function publicUser(u) {
  const { password, ...rest } = u;
  return rest;
}

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    req.userId = jwt.verify(token, JWT_SECRET).sub;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ---------------------------- Destinations ----------------------------
// Slim list for map markers, trending carousel and grids.
app.get('/api/countries', (req, res) => {
  const { continent, interest } = req.query;
  let list = destinations;
  if (continent) list = list.filter((d) => d.continent === continent);
  if (interest) list = list.filter((d) => d.interests.includes(interest));
  res.json(
    list.map((d) => ({
      code: d.code,
      name: d.name,
      flag: d.flag,
      tagline: d.tagline,
      continent: d.continent,
      lat: d.lat,
      lng: d.lng,
      accent: d.accent,
      cheapestFlight: d.cheapestFlight,
      interests: d.interests,
      image: d.image
    }))
  );
});

// Full cultural payload for the details panel.
app.get('/api/countries/:code', (req, res) => {
  const dest = destinations.find((d) => d.code === req.params.code.toUpperCase());
  if (!dest) return res.status(404).json({ error: 'Country not found' });
  res.json(dest);
});

// Logistics — real Amadeus Flight Offers Search when credentials are set,
// otherwise falls back to seeded mock data so the app works out of the box.
app.get('/api/countries/:code/flights', async (req, res) => {
  const dest = destinations.find((d) => d.code === req.params.code.toUpperCase());
  if (!dest) return res.status(404).json({ error: 'Country not found' });

  // Default departure: 30 days from today
  const defaultDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const departureDate = req.query.departureDate || defaultDate;
  const adults = parseInt(req.query.adults) || 1;
  const origin = req.query.origin || 'IST';

  const base = {
    country: { code: dest.code, name: dest.name, flag: dest.flag, iata: dest.iata },
    from: origin,
    departureDate,
    source: 'live'
  };

  if (!amadeus) {
    // No credentials configured — serve mock data and signal the source.
    return res.json({ ...base, source: 'mock', flights: buildFlights(dest) });
  }

  const cacheKey = `flights:${origin}:${dest.iata}:${departureDate}:${adults}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json({ ...base, source: 'live-cached', flights: cached });

  try {
    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: origin,
      destinationLocationCode: dest.iata,
      departureDate,
      adults: String(adults),
      max: '10',
      currencyCode: 'USD'
    });

    const carriers = response.result?.dictionaries?.carriers ?? {};
    const flights = response.data.map((offer) => mapOffer(offer, carriers));
    setCache(cacheKey, flights);
    res.json({ ...base, flights });
  } catch (err) {
    console.error('Amadeus flight search error:', err.description ?? err.message ?? err);
    // Degrade gracefully to mock data on API error.
    res.json({ ...base, source: 'mock-fallback', flights: buildFlights(dest) });
  }
});

// Hotel offers — real Amadeus Hotel List + Hotel Offers Search v3 + Hotel Sentiments v2
// when credentials are present; falls back to seeded mock data otherwise.
app.get('/api/countries/:code/hotels', async (req, res) => {
  const dest = destinations.find((d) => d.code === req.params.code.toUpperCase());
  if (!dest) return res.status(404).json({ error: 'Country not found' });

  const defaultCheckIn  = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);
  const defaultCheckOut = new Date(Date.now() + 33 * 86_400_000).toISOString().slice(0, 10);
  const checkIn  = req.query.checkIn  || defaultCheckIn;
  const checkOut = req.query.checkOut || defaultCheckOut;
  const adults   = parseInt(req.query.adults) || 1;

  const base = {
    country: { code: dest.code, name: dest.name, flag: dest.flag },
    checkIn, checkOut, adults, source: 'live'
  };

  if (!amadeus) {
    return res.json({ ...base, source: 'mock', hotels: buildHotels(dest) });
  }

  try {
    const hotels = await fetchLiveHotels(dest, checkIn, checkOut, adults);
    if (!hotels.length) {
      return res.json({ ...base, source: 'mock-fallback', hotels: buildHotels(dest) });
    }
    res.json({ ...base, hotels });
  } catch (err) {
    console.error('Amadeus hotel search error:', err.description ?? err.message ?? err);
    res.json({ ...base, source: 'mock-fallback', hotels: buildHotels(dest) });
  }
});

// Car rental offers — NOTE: Amadeus car rental is an Enterprise-tier API not included
// in the free self-service sandbox. Options for real data:
//   • Rentalcars Connect API (rentalcarsconnect.com) — requires partner agreement
//   • RapidAPI "Car Rental" by Booking.com — free tier available, set RAPIDAPI_KEY env var
// Until a real API is wired up this route serves curated mock data with source:'mock'.
app.get('/api/countries/:code/cars', (req, res) => {
  const dest = destinations.find((d) => d.code === req.params.code.toUpperCase());
  if (!dest) return res.status(404).json({ error: 'Country not found' });
  const { pickupDate, dropoffDate, drivers } = req.query;
  res.json({
    country: { code: dest.code, name: dest.name, flag: dest.flag },
    pickupDate: pickupDate || null,
    dropoffDate: dropoffDate || null,
    drivers: parseInt(drivers) || 1,
    source: 'mock',
    cars: buildCars(dest)
  });
});

// ------------------------------- Auth ---------------------------------
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  if (users.has(email)) return res.status(409).json({ error: 'Email already registered' });
  const user = {
    id: `u-${Date.now()}`,
    name,
    email,
    password,
    homeAirport: 'Istanbul — IST',
    currency: 'USD ($)',
    language: 'English'
  };
  users.set(email, user);
  savedByUser.set(user.id, new Set());
  const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: publicUser(user) });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = users.get(email);
  if (!user || user.password !== password)
    return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: publicUser(user) });
});

app.get('/api/auth/me', auth, (req, res) => {
  const user = [...users.values()].find((u) => u.id === req.userId);
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json(publicUser(user));
});

app.put('/api/auth/me', auth, (req, res) => {
  const user = [...users.values()].find((u) => u.id === req.userId);
  if (!user) return res.status(404).json({ error: 'Not found' });
  const { name, homeAirport, currency, language } = req.body || {};
  if (name) user.name = name;
  if (homeAirport) user.homeAirport = homeAirport;
  if (currency) user.currency = currency;
  if (language) user.language = language;
  res.json(publicUser(user));
});

// -------------------------- Saved destinations ------------------------
app.get('/api/saved', auth, (req, res) => {
  const codes = savedByUser.get(req.userId) || new Set();
  const saved = destinations
    .filter((d) => codes.has(d.code))
    .map((d) => ({
      code: d.code,
      name: d.name,
      flag: d.flag,
      tagline: d.tagline,
      accent: d.accent,
      cheapestFlight: d.cheapestFlight,
      facts: d.facts,
      image: d.image
    }));
  res.json(saved);
});

app.post('/api/saved/:code', auth, (req, res) => {
  const code = req.params.code.toUpperCase();
  if (!destinations.some((d) => d.code === code))
    return res.status(404).json({ error: 'Country not found' });
  if (!savedByUser.has(req.userId)) savedByUser.set(req.userId, new Set());
  savedByUser.get(req.userId).add(code);
  res.json({ saved: [...savedByUser.get(req.userId)] });
});

app.delete('/api/saved/:code', auth, (req, res) => {
  const set = savedByUser.get(req.userId);
  if (set) set.delete(req.params.code.toUpperCase());
  res.json({ saved: set ? [...set] : [] });
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`GeoFlow backend running on http://localhost:${PORT}`);
});
