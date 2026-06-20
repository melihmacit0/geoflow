// Run once to download REST Countries data and save to src/data/countries-raw.json
// Usage: node scripts/fetch-countries.js

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '../src/data/countries-raw.json');

// mledoze/countries on jsDelivr — same structure as restcountries v3.1, no rate limits
const URL = 'https://cdn.jsdelivr.net/npm/world-countries@5/countries.json';

console.log('Downloading REST Countries data...');

https.get(URL, (res) => {
  let raw = '';
  res.on('data', (chunk) => (raw += chunk));
  res.on('end', () => {
    try {
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) throw new Error('Unexpected response format');
      fs.mkdirSync(path.dirname(OUT), { recursive: true });
      fs.writeFileSync(OUT, JSON.stringify(data));
      console.log(`Done — saved ${data.length} countries to ${OUT}`);
    } catch (err) {
      console.error('Failed:', err.message);
      process.exit(1);
    }
  });
}).on('error', (err) => {
  console.error('Download failed:', err.message);
  process.exit(1);
});
