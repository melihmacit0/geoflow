// Duffel Flights API client — real-time airline inventory.
// Docs: https://duffel.com/docs/api/offer-requests
// Sign up at duffel.com → Developers → Access tokens → create a test token.
// Test tokens start with "duffel_test_" and return real airline data at no cost.

const BASE = 'https://api.duffel.com';

function duffelHeaders() {
  return {
    'Authorization':  `Bearer ${process.env.DUFFEL_TOKEN}`,
    'Duffel-Version': 'v2',
    'Content-Type':   'application/json',
    'Accept':         'application/json'
  };
}

// Parse ISO 8601 duration (PT10H30M) → "10h 30m"
function parseDuration(iso) {
  if (!iso) return '—';
  const h = iso.match(/(\d+)H/)?.[1] ?? '0';
  const m = iso.match(/(\d+)M/)?.[1] ?? '0';
  return parseInt(m) > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatTime(dt) {
  if (!dt) return '—';
  return dt.slice(11, 16); // "2026-07-05T09:40:00" → "09:40"
}

function mapOffer(offer, index) {
  const slice    = offer.slices?.[0];
  const segments = slice?.segments ?? [];
  const first    = segments[0];
  const last     = segments[segments.length - 1];
  const stops    = segments.length - 1;

  const airlineName =
    first?.operating_carrier?.name ??
    first?.marketing_carrier?.name ??
    offer.owner?.name ?? '—';

  const origin      = first?.origin?.iata_code      ?? '—';
  const destination = last?.destination?.iata_code  ?? '—';

  return {
    id:       offer.id ?? `duffel-${index}`,
    airline:  airlineName,
    from:     origin,
    to:       destination,
    depart:   formatTime(first?.departing_at),
    arrive:   formatTime(last?.arriving_at),
    duration: parseDuration(slice?.duration),
    stops:    stops === 0 ? 'Direct' : `${stops} Stop${stops > 1 ? 's' : ''}`,
    price:    Math.round(parseFloat(offer.total_amount ?? '0')),
    currency: offer.total_currency ?? 'USD',
    deepLink: `https://www.skyscanner.net/transport/flights/${origin.toLowerCase()}/${destination.toLowerCase()}/`
  };
}

export async function fetchDuffelFlights(origin, destination, departureDate, adults = 1) {
  const token = process.env.DUFFEL_TOKEN;
  if (!token) return null;

  try {
    const passengers = Array.from({ length: adults }, () => ({ type: 'adult' }));

    const res = await fetch(`${BASE}/air/offer_requests`, {
      method:  'POST',
      headers: duffelHeaders(),
      body: JSON.stringify({
        data: {
          slices:       [{ origin, destination, departure_date: departureDate }],
          passengers,
          cabin_class:   'economy',
          return_offers: true
        }
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('Duffel flights error:', res.status, JSON.stringify(err.errors ?? err));
      return null;
    }

    const json = await res.json();
    const offers = (json.data?.offers ?? [])
      .sort((a, b) => parseFloat(a.total_amount) - parseFloat(b.total_amount))
      .slice(0, 8);

    if (!offers.length) return null;

    return {
      flights: offers.map(mapOffer),
      source: 'live'
    };
  } catch (err) {
    console.error('Duffel fetch error:', err.message);
    return null;
  }
}
