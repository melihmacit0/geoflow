// Booking.com hotel search via RapidAPI (DataCrawler — booking-com15).
// Sign up free at: rapidapi.com → search "Booking.com" by DataCrawler → Subscribe (free tier)
// Copy your RapidAPI key to .env as RAPIDAPI_KEY.

import { getCached, setCache } from './amadeusClient.js';

const HOST = 'booking-com15.p.rapidapi.com';
const BASE = `https://${HOST}`;
const TTL_24H = 24 * 60 * 60 * 1000;
const TTL_30M = 30 * 60 * 1000;

function headers() {
  return {
    'x-rapidapi-host': HOST,
    'x-rapidapi-key':  process.env.RAPIDAPI_KEY
  };
}

// Strip airport-dataset noise like "Paris (Roissy-en-France, Val-d'Oise)" → "Paris"
function cleanCityName(raw) {
  return raw.replace(/\s*\(.*?\)/g, '').trim();
}

// Step 1 — resolve city name to a Booking.com destination ID (cached 24h)
async function resolveDestId(rawCityName) {
  const cityName = cleanCityName(rawCityName);
  const cacheKey = `bcom-dest:${cityName.toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const url = `${BASE}/api/v1/hotels/searchDestination?query=${encodeURIComponent(cityName)}`;
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) throw new Error(`Destination search failed: ${res.status}`);

  const json = await res.json();
  const results = json.data ?? [];

  // Prefer city-level result over hotel or region
  const city = results.find((r) => r.search_type === 'city') ?? results[0];
  if (!city) return null;

  const destId = { id: city.dest_id, type: city.search_type ?? 'city' };
  setCache(cacheKey, destId, TTL_24H);
  return destId;
}

// Step 2 — search hotel offers (cached 30 min)
export async function fetchLiveHotelsRapidAPI(rawCityName, checkIn, checkOut, adults) {
  if (!process.env.RAPIDAPI_KEY) return null;
  const cityName = cleanCityName(rawCityName);

  try {
    // Resolve destination
    const dest = await resolveDestId(cityName);
    if (!dest) return null;

    const cacheKey = `bcom-hotels:${dest.id}:${checkIn}:${checkOut}:${adults}`;
    const cached = getCached(cacheKey);
    if (cached) return { hotels: cached, source: 'live-cached' };

    const params = new URLSearchParams({
      dest_id:        dest.id,
      search_type:    'CITY',
      arrival_date:   checkIn,
      departure_date: checkOut,
      adults:         String(adults),
      room_qty:       '1',
      currency_code:  'USD',
      languagecode:   'en-us'
    });

    const res = await fetch(`${BASE}/api/v1/hotels/searchHotels?${params}`, {
      headers: headers()
    });

    if (!res.ok) {
      console.error(`Booking.com RapidAPI error: ${res.status}`);
      return null;
    }

    const json = await res.json();
    const items = json.data?.hotels ?? [];
    if (!items.length) return null;

    const hotels = items.slice(0, 8).map((h, i) => {
      const p     = h.property ?? h;
      const name  = p.name ?? `Hotel ${i + 1}`;
      const stars = p.accuratePropertyClass ?? p.propertyClass ?? 3;
      // Booking uses 0-10 rating; convert to 0-5
      const rating  = p.reviewScore ? parseFloat((p.reviewScore / 2).toFixed(1)) : 4.0;
      const reviews = p.reviewCount ?? 0;
      const price   = Math.round(p.priceBreakdown?.grossPrice?.value ?? 0);
      const currency = p.priceBreakdown?.grossPrice?.currency ?? 'USD';

      return {
        id:            `bcom-${p.id ?? i}`,
        name,
        chain:         'Independent',
        type:          stars >= 4 ? 'Luxury Hotel' : stars >= 3 ? 'City Hotel' : 'Budget Hotel',
        stars:         stars > 0 ? stars : 3,
        rating,
        reviews,
        pricePerNight: price,
        currency,
        amenities:     ['WiFi'],
        address:       p.wishlistName ?? cityName,
        deepLink:      `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(cityName)}`
      };
    });

    setCache(cacheKey, hotels, TTL_30M);
    return { hotels, source: 'live' };
  } catch (err) {
    console.error('Booking.com RapidAPI error:', err.message);
    return null;
  }
}
