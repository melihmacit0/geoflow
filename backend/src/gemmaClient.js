// Gemini cultural-content generator with file-based caching.
// Cities are keyed by IATA; countries by "C:<code>". Each entry is generated
// once on first request and stored in src/data/city-culture-cache.json —
// subsequent requests are instant.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_PATH = path.join(__dirname, 'data/city-culture-cache.json');

let cache = {};
try {
  cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
} catch { /* file doesn't exist yet — start with empty cache */ }

function saveCache() {
  // On Vercel the bundle filesystem is read-only; only /tmp is writable. Writing
  // is a best-effort optimisation, so never let a failed write break generation.
  try {
    const target = process.env.VERCEL ? path.join('/tmp', 'city-culture-cache.json') : CACHE_PATH;
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, JSON.stringify(cache, null, 2));
  } catch (err) {
    console.warn('gemmaClient: could not persist culture cache:', err.message);
  }
}

function isComplete(entry) {
  return entry && entry.food && entry.history && typeof entry.history === 'object' && entry.tips && entry.phrases;
}

// Shared JSON schema the model must return (identical for cities and countries).
const SCHEMA = `Return ONLY valid JSON with no markdown, no backticks, no extra text:
{
  "tagline": "a short evocative phrase (5-8 words)",
  "intro": "2-3 sentences about what makes this place special for travelers",
  "didYouKnow": "one surprising or fascinating fact",
  "highlights": [
    { "title": "Well-known landmark or experience", "note": "very short description" },
    { "title": "Well-known landmark or experience", "note": "very short description" },
    { "title": "Well-known landmark or experience", "note": "very short description" },
    { "title": "Well-known landmark or experience", "note": "very short description" }
  ],
  "bestTime": "best months to visit, e.g. Apr – Oct",
  "food": {
    "intro": "1-2 sentences about the local food scene",
    "dishes": [
      { "name": "dish name", "note": "brief description, max 10 words" },
      { "name": "dish name", "note": "brief description, max 10 words" },
      { "name": "dish name", "note": "brief description, max 10 words" },
      { "name": "dish name", "note": "brief description, max 10 words" }
    ]
  },
  "history": {
    "overview": "3-4 sentences summarising the overall historical arc and significance",
    "periods": [
      { "era": "short era label, e.g. 'Ancient Origins'", "description": "2 sentences about this period" },
      { "era": "short era label, e.g. 'Medieval Era'",    "description": "2 sentences about this period" },
      { "era": "short era label, e.g. 'Modern Age'",      "description": "2 sentences about this period" }
    ],
    "figures": [
      { "name": "Notable historical figure", "role": "brief role, max 8 words" },
      { "name": "Notable historical figure", "role": "brief role, max 8 words" }
    ]
  },
  "tips": [
    { "title": "tip title", "note": "practical advice in one sentence" },
    { "title": "tip title", "note": "practical advice in one sentence" },
    { "title": "tip title", "note": "practical advice in one sentence" },
    { "title": "tip title", "note": "practical advice in one sentence" }
  ],
  "phrases": [
    { "phrase": "local phrase", "meaning": "English meaning", "pronunciation": "phonetic guide" },
    { "phrase": "local phrase", "meaning": "English meaning", "pronunciation": "phonetic guide" },
    { "phrase": "local phrase", "meaning": "English meaning", "pronunciation": "phonetic guide" },
    { "phrase": "local phrase", "meaning": "English meaning", "pronunciation": "phonetic guide" }
  ]
}`;

async function generate(subject) {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const model = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    .getGenerativeModel({ model: 'gemini-flash-lite-latest' });

  const prompt = `You are a travel guide writer. Write detailed cultural content about ${subject} for a travel app aimed at students.\n\n${SCHEMA}`;
  const result = await model.generateContent(prompt);
  const text = result.response.text().trim()
    .replace(/^```json?\s*/i, '').replace(/\s*```$/, '');
  return JSON.parse(text);
}

export async function getCityCulture(iata, cityName, countryName) {
  if (cache[iata] && isComplete(cache[iata])) return cache[iata];
  if (!process.env.GEMINI_API_KEY) return cache[iata] ?? null;
  try {
    const data = await generate(`${cityName}, ${countryName}`);
    cache[iata] = data;
    saveCache();
    return data;
  } catch (err) {
    console.error(`Gemini error for ${iata} (${cityName}):`, err.message);
    return null;
  }
}

export async function getCountryCulture(code, countryName) {
  const key = `C:${code}`;
  if (cache[key] && isComplete(cache[key])) return cache[key];
  if (!process.env.GEMINI_API_KEY) return cache[key] ?? null;
  try {
    const data = await generate(`the country of ${countryName}`);
    cache[key] = data;
    saveCache();
    return data;
  } catch (err) {
    console.error(`Gemini error for country ${code} (${countryName}):`, err.message);
    return null;
  }
}
