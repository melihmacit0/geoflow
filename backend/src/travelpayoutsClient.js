// Travelpayouts Data API client — flights via Aviasales cache, hotels via Hotellook cache.
// Both use the same TP_TOKEN. Data is refreshed every ~48h on Travelpayouts' side.
// Docs: https://travelpayouts.github.io/slate/

import { getCached, setCache } from './amadeusClient.js';

const TP_BASE  = 'https://api.travelpayouts.com';
const HL_BASE  = 'https://engine.hotellook.com/api/v2';

// Airline IATA code → readable name (common carriers from Istanbul)
const AIRLINE_NAMES = {
  TK: 'Turkish Airlines', PC: 'Pegasus', LH: 'Lufthansa',
  EK: 'Emirates',         QR: 'Qatar Airways', W6: 'Wizz Air',
  FR: 'Ryanair',          BA: 'British Airways', AF: 'Air France',
  KL: 'KLM',              AY: 'Finnair', SK: 'SAS', OS: 'Austrian',
  SU: 'Aeroflot',         MS: 'EgyptAir', ET: 'Ethiopian Airlines',
  TG: 'Thai Airways',     NH: 'ANA', JL: 'Japan Airlines',
  SQ: 'Singapore Airlines', CX: 'Cathay Pacific', UA: 'United',
  AA: 'American Airlines', DL: 'Delta', AC: 'Air Canada'
};

function airlineName(code) {
  return AIRLINE_NAMES[code] ?? code;
}

function formatDuration(minutes) {
  if (!minutes) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m > 0 ? m + 'm' : ''}`.trim();
}

// ── Flights ───────────────────────────────────────────────────────────────────

export async function fetchLiveFlights(origin, iata, departureDate) {
  const token = process.env.TP_TOKEN;
  if (!token) return null;

  const cacheKey = `tp-flights:${origin}:${iata}:${departureDate?.slice(0, 7) ?? 'any'}`;
  const cached = getCached(cacheKey);
  if (cached) return { flights: cached, source: 'live-cached' };

  try {
    const url = new URL(`${TP_BASE}/v2/prices/latest`);
    url.searchParams.set('origin',      origin);
    url.searchParams.set('destination', iata);
    url.searchParams.set('currency',    'USD');
    url.searchParams.set('period_type', 'month');
    url.searchParams.set('sorting',     'price');
    url.searchParams.set('limit',       '10');
    url.searchParams.set('show_to_affiliates', 'true');

    // Filter to the requested departure month if provided
    if (departureDate) {
      url.searchParams.set('beginning_of_period', departureDate.slice(0, 7) + '-01');
    }

    const res = await fetch(url.toString(), {
      headers: { 'X-Access-Token': token }
    });

    if (!res.ok) {
      console.error(`Travelpayouts flights API error: ${res.status}`);
      return null;
    }

    const json = await res.json();
    if (!json.success || !json.data?.length) return null;

    const flights = json.data.slice(0, 8).map((d, i) => ({
      id: `tp-${i}`,
      airline: airlineName(d.airline),
      from: d.origin,
      to: d.destination,
      depart: d.departure_at ? d.departure_at.slice(11, 16) || '—' : '—',
      arrive: '—',
      duration: formatDuration(d.duration),
      stops: d.number_of_changes === 0 ? 'Direct' : `${d.number_of_changes} Stop${d.number_of_changes > 1 ? 's' : ''}`,
      price: d.price,
      currency: 'USD',
      deepLink: `https://www.aviasales.com${d.link}`
    }));

    setCache(cacheKey, flights);
    return { flights, source: 'live' };
  } catch (err) {
    console.error('Travelpayouts flights error:', err.message);
    return null;
  }
}

// ── Hotels ────────────────────────────────────────────────────────────────────

export async function fetchLiveHotelsTP(cityName, checkIn, checkOut, adults) {
  const token = process.env.TP_TOKEN;
  if (!token) return null;

  const cacheKey = `tp-hotels:${cityName}:${checkIn}:${checkOut}:${adults}`;
  const cached = getCached(cacheKey);
  if (cached) return { hotels: cached, source: 'live-cached' };

  try {
    const url = new URL(`${HL_BASE}/cache.json`);
    url.searchParams.set('location',     cityName);
    url.searchParams.set('checkIn',      checkIn);
    url.searchParams.set('checkOut',     checkOut);
    url.searchParams.set('adults',       String(adults));
    url.searchParams.set('currency',     'USD');
    url.searchParams.set('token',        token);
    url.searchParams.set('limit',        '10');
    url.searchParams.set('languageCode', 'en');

    const res = await fetch(url.toString());

    if (!res.ok) {
      console.error(`Hotellook API error: ${res.status}`);
      return null;
    }

    const json = await res.json();
    const items = Array.isArray(json) ? json : (json.results ?? []);
    if (!items.length) return null;

    const hotels = items.slice(0, 8).map((h, i) => ({
      id: `hl-${h.hotelId ?? i}`,
      name: h.hotelName ?? `Hotel ${i + 1}`,
      chain: 'Independent',
      type: h.stars ? `${h.stars}-Star Hotel` : 'Hotel',
      stars: h.stars ?? 3,
      rating: h.rating ?? parseFloat((4.5 - i * 0.1).toFixed(1)),
      reviews: h.reviewsCount ?? Math.max(50, 300 - i * 30),
      pricePerNight: Math.round(h.priceFrom ?? 0),
      currency: 'USD',
      amenities: ['WiFi'],
      address: h.locationName ?? cityName,
      deepLink: h.link
        ? `https://hotellook.com${h.link}`
        : `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(cityName)}`
    }));

    setCache(cacheKey, hotels);
    return { hotels, source: 'live' };
  } catch (err) {
    console.error('Hotellook error:', err.message);
    return null;
  }
}
