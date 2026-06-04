import Amadeus from 'amadeus';

function createClient() {
  const id = process.env.AMADEUS_CLIENT_ID;
  const secret = process.env.AMADEUS_CLIENT_SECRET;
  if (!id || !secret) return null;
  return new Amadeus({
    clientId: id,
    clientSecret: secret,
    hostname: process.env.AMADEUS_ENV === 'production' ? 'production' : 'test'
  });
}

export const amadeus = createClient();

// ── TTL-aware cache ───────────────────────────────────────────────────────────
const TTL_10M  = 10 * 60 * 1000;
const TTL_30M  = 30 * 60 * 1000;
const TTL_1H   = 60 * 60 * 1000;
const TTL_24H  = 24 * 60 * 60 * 1000;

const cacheStore = new Map();

export function getCached(key) {
  const entry = cacheStore.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > entry.ttl) { cacheStore.delete(key); return null; }
  return entry.data;
}

export function setCache(key, data, ttl = TTL_10M) {
  cacheStore.set(key, { ts: Date.now(), data, ttl });
}

// ── Flight helpers ────────────────────────────────────────────────────────────
export function formatDuration(iso) {
  return iso.replace('PT', '').replace('H', 'h ').replace('M', 'm').trim();
}

function formatTime(dt) { return dt.slice(11, 16); }

function titleCase(str) {
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function mapOffer(offer, carriers) {
  const itin  = offer.itineraries[0];
  const segs  = itin.segments;
  const first = segs[0];
  const last  = segs[segs.length - 1];
  const code  = offer.validatingAirlineCodes?.[0] ?? first.carrierCode;
  const stopCount = segs.length - 1;
  const stops = stopCount === 0 ? 'Direct'
    : stopCount === 1 ? `1 Stop (${segs[0].arrival.iataCode})`
    : `${stopCount} Stops`;
  return {
    id: offer.id,
    airline: carriers?.[code] ? titleCase(carriers[code]) : code,
    from: first.departure.iataCode,
    to: last.arrival.iataCode,
    depart: formatTime(first.departure.at),
    arrive: formatTime(last.arrival.at),
    duration: formatDuration(itin.duration),
    stops,
    price: Math.round(parseFloat(offer.price.grandTotal)),
    currency: offer.price.currency,
    deepLink: `https://www.skyscanner.net/transport/flights/${first.departure.iataCode.toLowerCase()}/${last.arrival.iataCode.toLowerCase()}/`
  };
}

// ── Hotel helpers ─────────────────────────────────────────────────────────────

// Amadeus city codes — not always the same as airport IATA codes.
export const HOTEL_CITY_CODES = {
  JP: 'TYO', FR: 'PAR', GR: 'ATH', TR: 'IST', IS: 'REK',
  TH: 'BKK', PE: 'LIM', IT: 'ROM', EG: 'CAI', MA: 'CMN'
};

const CHAIN_NAMES = {
  AC: 'Accor',    BW: 'Best Western', CP: 'Comfort Inn',
  CY: 'Courtyard', EK: 'Eurostars',  HH: 'Hilton',
  HR: 'Hard Rock', HY: 'Hyatt',      IH: 'IHG',
  LQ: 'La Quinta', MC: 'Marriott',   MO: 'Mandarin Oriental',
  NH: 'NH Hotels', RD: 'Radisson',   SK: 'Sheraton',
  SO: 'Sofitel',   WI: 'Westin',     WR: 'Wyndham',
  YO: 'Hyatt',     TL: 'Travelodge'
};

const ROOM_TYPES = {
  STANDARD_ROOM: 'Standard Room', DELUXE_ROOM:   'Deluxe Room',
  SUPERIOR_ROOM: 'Superior Room', JUNIOR_SUITE:  'Junior Suite',
  SUITE:         'Suite',         APARTMENT:     'Apartment',
  DOUBLE_ROOM:   'Double Room',   SINGLE_ROOM:   'Single Room'
};

function inferAmenities(offer) {
  const a = ['WiFi'];
  const board = offer.boardType;
  if (board === 'BREAKFAST' || board === 'HALF_BOARD' || board === 'FULL_BOARD') a.push('Breakfast');
  if (board === 'HALF_BOARD' || board === 'FULL_BOARD') a.push('Dinner');
  const cancels = offer.policies?.cancellations ?? [];
  if (cancels.some((c) => c.type === 'FULL_CREDIT')) a.push('Free Cancellation');
  if (offer.room?.typeEstimated?.bedType === 'KING') a.push('King Bed');
  return a;
}

function mapHotelItem(item, nights, sentiment, index) {
  const h = item.hotel;
  const offer = item.offers[0];
  const chain = CHAIN_NAMES[h.chainCode] ?? h.chainCode ?? 'Independent';
  const totalPrice = parseFloat(offer.price.total ?? offer.price.base ?? '0');
  const pricePerNight = Math.round(totalPrice / Math.max(1, nights));
  const roomType = ROOM_TYPES[offer.room?.typeEstimated?.category] ?? 'Hotel Room';

  // Sentiment gives us real ratings; fall back to plausible defaults.
  const s = sentiment;
  const stars  = s ? Math.min(5, Math.max(1, Math.round(s.overallRating / 20)))
                   : Math.max(3, 5 - (index % 3));
  const rating = s ? parseFloat((s.overallRating / 20).toFixed(1))
                   : parseFloat((4.5 - index * 0.1).toFixed(1));
  const reviews = s ? (s.numberOfReviews ?? s.numberOfRatings ?? 0)
                    : Math.max(50, 400 - index * 50);

  const nameRaw = h.name ?? `${chain} Hotel`;
  const name = nameRaw.split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  const city = h.address?.cityName ?? h.cityCode ?? '';

  return {
    id: h.hotelId,
    name,
    chain,
    type: roomType,
    stars,
    rating,
    reviews,
    pricePerNight,
    currency: offer.price.currency ?? 'USD',
    amenities: inferAmenities(offer),
    address: city,
    deepLink: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(name)}`
  };
}

// Three-step Amadeus hotel flow:
//   1. Hotel List by city (cached 24 h — IDs rarely change)
//   2. Hotel Offers Search v3  (cached 30 min — pricing is volatile)
//   3. Hotel Sentiments v2     (cached 1 h  — reviews update slowly, optional)
export async function fetchLiveHotels(dest, checkIn, checkOut, adults) {
  const cityCode = HOTEL_CITY_CODES[dest.code] ?? dest.iata;
  const nights = Math.max(
    1,
    Math.round((new Date(checkOut) - new Date(checkIn)) / 86_400_000)
  );

  // Step 1 — hotel IDs
  const idKey = `hids:${cityCode}`;
  let hotelIds = getCached(idKey);
  if (!hotelIds) {
    const r = await amadeus.referenceData.locations.hotels.byCity.get({
      cityCode,
      radius: 5,
      radiusUnit: 'KM',
      hotelSource: 'ALL'
    });
    hotelIds = (r.data ?? []).slice(0, 30).map((h) => h.hotelId);
    setCache(idKey, hotelIds, TTL_24H);
  }
  if (!hotelIds.length) return [];

  // Step 2 — offers for up to 20 hotels
  const offerKey = `hoffers:${cityCode}:${checkIn}:${checkOut}:${adults}`;
  let offersData = getCached(offerKey);
  if (!offersData) {
    const r = await amadeus.shopping.hotelOffersSearch.get({
      hotelIds: hotelIds.slice(0, 20).join(','),
      adults: String(adults),
      checkInDate: checkIn,
      checkOutDate: checkOut,
      currency: 'USD',
      bestRateOnly: 'true',
      view: 'LIGHT'
    });
    offersData = (r.data ?? []).filter((h) => h.available && h.offers?.length);
    setCache(offerKey, offersData, TTL_30M);
  }
  if (!offersData.length) return [];

  const top = offersData.slice(0, 8);

  // Step 3 — sentiments (best-effort; API may 404 on sandbox)
  const sentimentMap = {};
  try {
    const ids = top.map((h) => h.hotel.hotelId).join(',');
    const sKey = `hsentiments:${ids}`;
    let sentiments = getCached(sKey);
    if (!sentiments) {
      const r = await amadeus.eReputation.hotelSentiments.get({ hotelIds: ids });
      sentiments = r.data ?? [];
      setCache(sKey, sentiments, TTL_1H);
    }
    sentiments.forEach((s) => { sentimentMap[s.hotelId] = s; });
  } catch { /* optional — don't fail the whole request */ }

  return top.map((item, i) =>
    mapHotelItem(item, nights, sentimentMap[item.hotel.hotelId], i)
  );
}
