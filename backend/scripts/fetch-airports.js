// Run once to download OurAirports data and save filtered airports to src/data/airports.json
// Usage: node scripts/fetch-airports.js

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '../src/data/airports.json');

function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  for (const ch of line) {
    if (ch === '"') { inQuotes = !inQuotes; }
    else if (ch === ',' && !inQuotes) { values.push(current); current = ''; }
    else { current += ch; }
  }
  values.push(current);
  return values.map((v) => v.trim());
}

console.log('Downloading OurAirports data...');

https.get('https://davidmegginson.github.io/ourairports-data/airports.csv', (res) => {
  let raw = '';
  res.on('data', (chunk) => (raw += chunk));
  res.on('end', () => {
    const lines = raw.trim().split('\n');
    const headers = parseCSVLine(lines[0]);

    const airports = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const row = Object.fromEntries(headers.map((h, j) => [h, values[j] ?? '']));

      if (
        ['large_airport', 'medium_airport'].includes(row.type) &&
        row.scheduled_service === 'yes' &&
        row.iata_code?.length === 3 &&
        row.latitude_deg &&
        row.longitude_deg
      ) {
        airports.push({
          iata: row.iata_code,
          name: row.name,
          city: row.municipality || row.name,
          country: row.iso_country,
          lat: parseFloat(row.latitude_deg),
          lng: parseFloat(row.longitude_deg),
          type: row.type
        });
      }
    }

    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify(airports, null, 2));
    console.log(`Done — saved ${airports.length} airports to ${OUT}`);
  });
}).on('error', (err) => {
  console.error('Download failed:', err.message);
  process.exit(1);
});
