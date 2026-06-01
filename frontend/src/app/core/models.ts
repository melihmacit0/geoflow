export interface CountrySummary {
  code: string;
  name: string;
  flag: string;
  tagline: string;
  continent: string;
  lat: number;
  lng: number;
  accent: string;
  cheapestFlight: number;
  interests: string[];
  image: string;
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
  tagline: string;
  continent: string;
  lat: number;
  lng: number;
  iata: string;
  accent: string;
  cheapestFlight: number;
  interests: string[];
  intro: string;
  didYouKnow: string;
  image: string;
  facts: CountryFacts;
  highlights: Highlight[];
  comparison: ComparisonMetrics;
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
  country: { code: string; name: string; flag: string; iata: string };
  from: string;
  flights: Flight[];
}

export interface SavedDestination {
  code: string;
  name: string;
  flag: string;
  tagline: string;
  accent: string;
  cheapestFlight: number;
  facts: CountryFacts;
  image: string;
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
