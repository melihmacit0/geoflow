export interface CountrySummary {
  code: string;
  name: string;
  flag: string;
  continent: string;
  lat: number;
  lng: number;
  accent: string;
  capital?: string;
  cheapestFlight?: number | null;
  interests?: string[];
  image?: string | null;
  tagline?: string | null;
}

export interface CountryFacts {
  capital: string;
  language: string;
  currency: string;
  bestTime: string;
}

export interface Highlight {
  title: string;
  note: string;
}

export interface ComparisonMetrics {
  flightDuration: string;
  bestSeason: string;
  culturalDraw: string;
  dailyBudget: number;
  visa: string;
}

export interface CountryDetail {
  code: string;
  name: string;
  flag: string;
  continent: string;
  lat: number;
  lng: number;
  accent: string;
  capital: string;
  currency: string;
  language: string;
  tagline?: string | null;
  image?: string | null;
  intro?: string | null;
  didYouKnow?: string | null;
  highlights?: Highlight[] | null;
  facts: CountryFacts;
  comparison?: ComparisonMetrics;
  cheapestFlight?: number | null;
}

export interface City {
  iata: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  type: 'large_airport' | 'medium_airport';
}

export interface CityDish {
  name: string;
  note: string;
}

export interface CityPhrase {
  phrase: string;
  meaning: string;
  pronunciation?: string;
}

export interface CityHistoryPeriod {
  era: string;
  description: string;
}

export interface CityHistoryFigure {
  name: string;
  role: string;
}

export interface CityHistory {
  overview: string;
  periods: CityHistoryPeriod[];
  figures?: CityHistoryFigure[] | null;
}

export interface CityCulture {
  tagline: string;
  intro: string;
  didYouKnow: string;
  highlights: Highlight[];
  bestTime: string;
  food?: { intro: string; dishes: CityDish[] } | null;
  history?: CityHistory | null;
  tips?: Highlight[] | null;
  phrases?: CityPhrase[] | null;
}

export interface CityDetail extends City {
  countryName: string;
  culture: CityCulture | null;
}

export interface Flight {
  id: string;
  airline: string;
  from: string;
  to: string;
  depart: string;
  arrive: string;
  duration: string;
  stops: string;
  price: number;
  deepLink: string;
}

export interface FlightResponse {
  iata: string;
  city: string;
  from: string;
  departureDate: string;
  source: 'live' | 'live-cached' | 'mock' | 'mock-fallback';
  flights: Flight[];
}

export interface Hotel {
  id: string;
  name: string;
  chain: string;
  type: string;
  stars: number;
  rating: number;
  reviews: number;
  pricePerNight: number;
  currency: string;
  amenities: string[];
  address: string;
  deepLink: string;
}

export interface HotelResponse {
  iata: string;
  city: string;
  checkIn: string | null;
  checkOut: string | null;
  adults: number;
  source: 'live' | 'live-cached' | 'mock' | 'mock-fallback';
  hotels: Hotel[];
}

export interface Car {
  id: string;
  agency: string;
  category: string;
  model: string;
  transmission: string;
  seats: number;
  pricePerDay: number;
  currency: string;
  features: string[];
  pickupLocation: string;
  deepLink: string;
}

export interface CarResponse {
  iata: string;
  city: string;
  pickupDate: string | null;
  dropoffDate: string | null;
  source: 'live' | 'mock';
  cars: Car[];
}

export interface SavedDestination {
  code: string;
  name: string;
  flag: string;
  accent: string;
  tagline?: string | null;
  cheapestFlight?: number | null;
  image?: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  homeAirport: string;
  currency: string;
  language: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
