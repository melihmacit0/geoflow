// Gemini 1.5 Flash cultural content generator with file-based caching.
// Each city's content is generated once on first request and stored in
// src/data/city-culture-cache.json — subsequent requests are instant.

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
  fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
}

export async function getCityCulture(iata, cityName, countryName) {
  if (cache[iata]) return cache[iata];

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: 'gemini-flash-lite-latest' });

    const prompt = `You are a travel guide writer. Write concise cultural content about ${cityName}, ${countryName} for a travel app aimed at students.

Return ONLY valid JSON with no markdown, no backticks, no extra text:
{
  "tagline": "a short evocative phrase (5-8 words)",
  "intro": "2-3 sentences about what makes this city special for travelers",
  "didYouKnow": "one surprising or fascinating fact about this city",
  "highlights": [
    { "title": "Well-known landmark or experience", "note": "very short description" },
    { "title": "Well-known landmark or experience", "note": "very short description" },
    { "title": "Well-known landmark or experience", "note": "very short description" },
    { "title": "Well-known landmark or experience", "note": "very short description" }
  ],
  "bestTime": "best months to visit, e.g. Apr – Oct"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim()
      .replace(/^```json?\s*/i, '').replace(/\s*```$/, '');

    const data = JSON.parse(text);
    cache[iata] = data;
    saveCache();
    return data;
  } catch (err) {
    console.error(`Gemini error for ${iata} (${cityName}):`, err.message);
    return null;
  }
}
