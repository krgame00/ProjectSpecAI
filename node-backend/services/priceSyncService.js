// ============================================================
// PCSpec — Price Sync Service (Phase 4.3)
// Lightweight price refresh from ihavecpu.com product pages.
// Avoids heavy Python/scrapling — plain fetch + JSON-LD parse.
// Falls back gracefully when the site is unreachable.
// ============================================================

const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// Lookup map built from previous scrape outputs: image_url -> product page url
let urlLookupCache = null;
function loadUrlLookup() {
  if (urlLookupCache) return urlLookupCache;
  urlLookupCache = new Map();
  const candidates = [
    'scraped_ihavecpu_real_all.json',
    'scraped_ihavecpu_real_fast.json',
    'scraped_advice_ssd_real.json'
  ];
  for (const fname of candidates) {
    const fp = path.join(__dirname, '..', fname);
    if (!fs.existsSync(fp)) continue;
    try {
      const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
      const items = Array.isArray(data) ? data : Object.values(data).flat();
      for (const it of items) {
        if (it && it.image_url && it.url && it.url.startsWith('http')) {
          urlLookupCache.set(it.image_url, it.url);
        }
      }
    } catch (e) { /* skip */ }
  }
  return urlLookupCache;
}

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const TIMEOUT_MS = 8000;

function extractPriceFromJsonLd(html) {
  // Find all <script type="application/ld+json"> blocks
  const blocks = [];
  const re = /<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = re.exec(html)) !== null) {
    try { blocks.push(JSON.parse(match[1])); } catch (e) { /* skip malformed */ }
  }

  for (const block of blocks) {
    const offers = block.offers;
    if (!offers) continue;
    // Some stores nest offers as array; some as single object
    if (Array.isArray(offers)) {
      for (const o of offers) {
        if (o && typeof o.price === 'number' && o.price > 0) return o.price;
      }
    } else if (typeof offers.price === 'number' && offers.price > 0) {
      return offers.price;
    }
  }
  return null;
}

function extractPriceFromBody(html) {
  // Fallback: look for typical Thai price patterns like ฿12,990 or "12,990"
  const patterns = [
    /฿\s?([\d,]+(?:\.\d+)?)/i,
    /price(?:-|_|\s)?(?:sale|now|current)?["']?\s*[:=]\s*["']?([\d,]+(?:\.\d+)?)/i,
    /item-price-sale[^>]*>\s*([\d,]+(?:\.\d+)?)/i
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m) {
      const num = parseFloat(m[1].replace(/,/g, ''));
      if (num > 0) return num;
    }
  }
  return null;
}

async function fetchProductPage(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'th-TH,th;q=0.9' },
      signal: controller.signal
    });
    if (!res.ok) return { ok: false, status: res.status };
    const html = await res.text();
    return { ok: true, html };
  } finally {
    clearTimeout(timer);
  }
}

async function syncPrice({ url, currentPrice, maxProducts = 500 }) {
  if (!url || !url.startsWith('http')) return { status: 'skipped', reason: 'no_url' };

  let html;
  try {
    const r = await fetchProductPage(url);
    if (!r.ok) return { status: 'failed', reason: `http_${r.status}` };
    html = r.html;
  } catch (e) {
    return { status: 'failed', reason: 'fetch_error' };
  }

  const price = extractPriceFromJsonLd(html) || extractPriceFromBody(html);
  if (!price) return { status: 'no_price' };

  const oldPrice = Number(currentPrice) || 0;
  const changed = oldPrice > 0 && Math.abs(price - oldPrice) > 1;
  return { status: changed ? 'updated' : 'unchanged', price };
}

async function syncPrices(categorySlug = null, limit = 200) {
  const results = { checked: 0, updated: 0, unchanged: 0, failed: 0, skipped: 0, errors: [] };

  // Fetch candidate products that have a known product page URL
  let sql = `SELECT p.id, p.brand, p.model, p.price, p.image_url, p.product_url,
                    c.slug as category_slug
             FROM products p
             JOIN categories c ON p.category_id = c.id
             WHERE p.product_url IS NOT NULL AND p.product_url != ''`;
  const params = [];
  if (categorySlug) {
    sql += ' AND c.slug = ?';
    params.push(categorySlug);
  }
  sql += ' LIMIT ?';
  params.push(limit);

  let products = [];
  try {
    const [rows] = await db.query(sql, params);
    products = rows;
  } catch (e) {
    return { ...results, errors: [`db_error: ${e.message}`] };
  }

  const updatedPrices = [];
  for (const p of products) {
    if (results.checked >= limit) break;

    // There's no stored product URL in current schema; use image host heuristic.
    // If we can't locate a URL, skip silently (no noisy failures).
    const productUrl = extractProductUrl(p);
    if (!productUrl) { results.skipped += 1; continue; }

    const outcome = await syncPrice({ url: productUrl, currentPrice: p.price });
    // Map statuses: 'updated'/'unchanged'/'no_price' are "ok", others failed
    if (outcome.status === 'updated') {
      results.updated += 1;
      updatedPrices.push({ id: p.id, name: p.name, old: p.price, new: outcome.price });
      try {
        await db.query('UPDATE products SET price = ? WHERE id = ?', [outcome.price, p.id]);
      } catch (e) {
        results.errors.push(`${p.id} (${p.name}): db_update_failed`);
      }
    } else if (outcome.status === 'no_price' || outcome.status === 'unchanged') {
      results.unchanged += 1;
    } else {
      results.failed += 1;
      results.errors.push(`${p.id} (${p.name}): ${outcome.reason}`);
    }
    results.checked += 1;
  }

  return { ...results, updatedPrices, durationMs: 0 };
}

function extractProductUrl(product) {
  // Primary: explicit product_url column (populated from scrape outputs)
  if (product.product_url && product.product_url.startsWith('http')) return product.product_url;
  // Fallback: match DB image_url against the scrape-output lookup map (image -> product page)
  if (product.image_url) {
    const lookup = loadUrlLookup();
    const exact = lookup.get(product.image_url);
    if (exact) return exact;
    // Some image URLs get re-hosted/cached; try a suffix match on filename
    const base = String(product.image_url).split('/').pop();
    for (const [img, url] of lookup) {
      if (String(img).split('/').pop() === base) return url;
    }
  }
  return null;
}

module.exports = { syncPrices, extractProductUrl };