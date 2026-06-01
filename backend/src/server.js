import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { destinations, buildFlights } from './data/destinations.js';

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

// Logistics — orchestration layer combining a destination with flight offers.
app.get('/api/countries/:code/flights', (req, res) => {
  const dest = destinations.find((d) => d.code === req.params.code.toUpperCase());
  if (!dest) return res.status(404).json({ error: 'Country not found' });
  res.json({
    country: { code: dest.code, name: dest.name, flag: dest.flag, iata: dest.iata },
    from: 'IST',
    flights: buildFlights(dest)
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
