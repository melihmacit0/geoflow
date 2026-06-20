// Persistence abstraction for users / saved / trips.
//
//  • Production (Vercel): Vercel Blob — set BLOB_READ_WRITE_TOKEN (auto-injected
//    once you create a Blob store in the Vercel dashboard). Each collection is a
//    single JSON document at geoflow/<key>.json.
//  • Local dev: plain JSON files under backend/src/data/.store/ (gitignored), so
//    data survives `npm run dev` restarts without any cloud setup.
//
// Note: this is a whole-document read-modify-write store sized for a single-user
// demo. It is not safe under heavy concurrent writes (last write wins).

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCAL_DIR = path.join(__dirname, 'data', '.store');
const PREFIX = 'geoflow/';

const useBlob = !!process.env.BLOB_READ_WRITE_TOKEN;

let blobMod;
async function blob() {
  return (blobMod ??= await import('@vercel/blob'));
}

// Cache the resolved public URL per key (stable across overwrites because we use
// addRandomSuffix:false) so we only pay the list() lookup once per warm instance.
const urlCache = new Map();

function clone(v) {
  return v == null ? v : JSON.parse(JSON.stringify(v));
}

export async function readDoc(key, fallback) {
  if (useBlob) {
    try {
      const pathname = `${PREFIX}${key}.json`;
      let url = urlCache.get(key);
      if (!url) {
        const { list } = await blob();
        const { blobs } = await list({ prefix: pathname });
        const found = blobs.find((b) => b.pathname === pathname);
        if (!found) return clone(fallback);
        url = found.url;
        urlCache.set(key, url);
      }
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) return clone(fallback);
      return await res.json();
    } catch (err) {
      console.error(`store.readDoc(${key}) error:`, err.message);
      return clone(fallback);
    }
  }

  try {
    const raw = fs.readFileSync(path.join(LOCAL_DIR, `${key}.json`), 'utf8');
    return JSON.parse(raw);
  } catch {
    return clone(fallback);
  }
}

export async function writeDoc(key, data) {
  if (useBlob) {
    const { put } = await blob();
    const result = await put(`${PREFIX}${key}.json`, JSON.stringify(data), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
      cacheControlMaxAge: 0
    });
    urlCache.set(key, result.url);
    return;
  }

  fs.mkdirSync(LOCAL_DIR, { recursive: true });
  fs.writeFileSync(path.join(LOCAL_DIR, `${key}.json`), JSON.stringify(data, null, 2));
}
