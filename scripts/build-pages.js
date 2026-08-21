/*
 * Generates crawlable category and brand pages from content/products.json.
 *
 * Why this exists: the catalogue grid is built client-side from a 210KB JSON
 * file, so none of the 2,652 product names appear in any HTML Google can read,
 * and no product has a URL of its own.
 *
 * One page per product would be ~40 words of unique text each — thin content
 * at 2,652x scale. Grouping instead gives pages with real listings on them:
 *
 *   /catalogue/<slug>   by category, for "thai curry paste wholesale"
 *   /brands/<slug>      by brand, for "nittaya curry paste"
 *
 * Brand pages are the ones that answer a branded product search, because the
 * title pairs the brand with what it makes.
 *
 * Run after products.json or brand-map.json changes:
 *   node scripts/build-pages.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ORIGIN = 'https://chuanglee.co.uk';
const OUT_DIR = path.join(ROOT, 'catalogue');
const BRAND_DIR = path.join(ROOT, 'brands');
const MIN_PRODUCTS = 3;   // below this a page is too thin to be worth indexing

// products.json rows: [code, category, storageFlag, singleUnitName, caseName]
const COL = { code: 0, category: 1, single: 3, name: 4 };

const esc = s => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

function slugify(s) {
  return String(s).toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function loadCategories() {
  const rows = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/products.json'), 'utf8'));
  const groups = new Map();
  for (const r of rows) {
    const cat = String(r[COL.category] || '').trim();
    if (!cat) continue;

    // 181 rows are sold as singles only: the case-size column is blank and the
    // name lives in the single-unit column instead. Fall back to it rather than
    // rendering a nameless row.
    const caseName = String(r[COL.name] || '').trim();
    const singleName = String(r[COL.single] || '').trim();
    const name = caseName || singleName;
    if (!name) continue;

    // Group case-insensitively: the data carries "Busaba"/"busaba" and
    // "Coconut product"/"Coconut Product", which would otherwise split one
    // category across two pages and strand the smaller half below the
    // minimum. Display name is whichever casing is most common.
    const key = cat.toLowerCase();
    if (!groups.has(key)) groups.set(key, { items: [], casings: new Map() });
    const g = groups.get(key);
    g.casings.set(cat, (g.casings.get(cat) || 0) + 1);
    g.items.push({
      code: String(r[COL.code] || '').trim(),
      name,
      single: caseName && singleName ? singleName : '',
    });
  }

  const kept = [...groups.values()]
    .filter(g => g.items.length >= MIN_PRODUCTS)
    .map(g => {
      const label = [...g.casings.entries()].sort((a, b) => b[1] - a[1])[0][0];
      return [label, g.items];
    })
    .sort((a, b) => a[0].localeCompare(b[0]));

  // Guard against two category names slugging to the same file.
  const seen = new Set();
  return kept.map(([name, items]) => {
    let slug = slugify(name);
    if (!slug) slug = 'other';
    let s = slug, n = 2;
    while (seen.has(s)) s = `${slug}-${n++}`;
    seen.add(s);
    items.sort((a, b) => a.name.localeCompare(b.name));
    return { name, slug, items };
  });
}

/* ---------- shared chrome ---------- */
// Root-relative throughout: these pages live at /catalogue/<slug>, so the
// relative hrefs used elsewhere on the site would resolve inside /catalogue/.

const NAV = (slug) => `
<nav class="main">
  <div class="nav-inner">
    <a href="/" class="brand"><img src="/images/logo.png" alt="Chuanglee" /><div class="brand-name">Chuanglee<span>Est. 1989</span></div></a>
    <button class="nav-hamburger" onclick="toggleNav()" aria-label="Menu">☰</button>
    <div class="nav-links">
      <button class="nav-close" onclick="toggleNav()">✕</button>
      <a href="/">Home</a>
      <a href="/catalogue" class="active">Catalogue</a>
      <a href="/brands">Brands</a>
      <a href="/farm">The Farm</a>
      <a href="/delivery">Delivery</a>
      <a href="/contact">Contact</a>
    </div>
    <div class="nav-cta">
      <span class="phone">0845 388 1688</span>
      <a href="https://chuanglee.choco.com/" class="order-btn" target="_blank" rel="noopener">Order Online ↗</a>
      <a href="/bookings" class="supplier-btn">Supplier Bookings</a>
    </div>
  </div>
</nav>`;

const FOOTER = `
<footer>
  <div class="foot-inner">
    <div class="foot-top">
      <div class="foot-brand"><div class="brand">
          <img src="/images/logo.png" alt="Chuanglee" />
          <div class="brand-name">Chuanglee<span>Est. 1989</span></div>
        </div><p>Family-run UK importer, manufacturing partner and foodservice distributor — bringing authentic East Asian ingredients from soil to stove since 1989.</p></div>
      <div class="foot-col"><h5>Explore</h5><ul><li><a href="/catalogue">Catalogue</a></li><li><a href="/brands">Our Brands</a></li><li><a href="/farm">Suree's Farm</a></li><li><a href="/#heritage">Heritage</a></li></ul></div>
      <div class="foot-col"><h5>Trade</h5><ul><li><a href="/catalogue">Order Online</a></li><li><a href="/contact">Open Account</a></li><li><a href="/contact">Bespoke Manufacturing</a></li></ul></div>
      <div class="foot-col"><h5>Contact</h5><ul><li><a href="mailto:sales@chuanglee.co.uk">sales@chuanglee.co.uk</a></li><li><a href="tel:08453881688">0845 388 1688</a></li><li>Unit 7-9 Meridian Trading Estate</li><li>Bugsby Way, London SE7 7SJ</li></ul></div>
    </div>
    <div class="foot-bottom">
      <div>© 1989–2025 Chuanglee Limited. All rights reserved.</div>
      <div class="center">創立 一九八九 &nbsp;·&nbsp; <span class="thai">ก่อตั้ง ๑๙๘๙</span></div>
      <div class="right"><a href="/docs/modern-slavery.pdf" target="_blank">Modern Slavery</a><a href="/docs/terms-and-conditions.pdf" target="_blank">Terms &amp; Conditions</a><a href="/docs/csr-policy.pdf" target="_blank">CSR Policy</a><a href="/docs/environmental-policy.pdf" target="_blank">Environmental Policy</a></div>
    </div>
  </div>
</footer>`;

const PAGE_CSS = `
.cat-hero{padding:140px 48px 40px;max-width:1200px;margin:0 auto}
.cat-hero .eyebrow{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--vermillion);font-weight:600;margin-bottom:12px}
.cat-hero h1{font-family:var(--display);font-weight:400;font-size:clamp(32px,4.5vw,56px);letter-spacing:-.03em;line-height:1.05;margin-bottom:14px}
.cat-hero p{font-size:16px;color:var(--ink-soft);max-width:60ch;line-height:1.6}
.cat-wrap{max-width:1200px;margin:0 auto;padding:0 48px 72px}
.cat-list{list-style:none;padding:0;margin:32px 0 0;border-top:1px solid var(--rule)}
.cat-list li{display:flex;justify-content:space-between;align-items:baseline;gap:20px;padding:13px 4px;border-bottom:1px solid var(--rule)}
.cat-list .pn{font-size:15px;line-height:1.4}
.cat-list .pv{font-size:12px;color:var(--ink-soft);display:block;margin-top:3px}
.cat-list .pc{font-size:12px;color:var(--ink-soft);font-variant-numeric:tabular-nums;white-space:nowrap}
.cat-other{margin-top:56px;padding-top:32px;border-top:1px solid var(--rule)}
.cat-other h2{font-family:var(--display);font-weight:500;font-size:22px;margin-bottom:16px}
.cat-other .links{display:flex;flex-wrap:wrap;gap:8px}
.cat-other a{font-size:13px;padding:7px 14px;border:1px solid var(--rule);border-radius:999px;color:var(--ink-soft);transition:all .2s;text-decoration:none}
.cat-other a:hover{border-color:var(--vermillion);color:var(--vermillion)}
.cat-cta{margin-top:40px;padding:28px 32px;background:var(--ink);color:var(--paper);border-radius:8px;display:flex;justify-content:space-between;align-items:center;gap:24px;flex-wrap:wrap}
.cat-cta p{margin:0;font-size:15px}
.cat-cta a{background:var(--vermillion);color:var(--paper);padding:12px 26px;border-radius:999px;font-size:13px;font-weight:600;white-space:nowrap;text-decoration:none}
@media(max-width:800px){.cat-hero{padding:110px 22px 30px}.cat-wrap{padding:0 22px 56px}}`;

/* ---------- page rendering ---------- */

function describe(cat, count) {
  return `Browse ${count} ${cat.toLowerCase()} products available for foodservice `
       + `wholesale from Chuanglee. UK importer and distributor of authentic East `
       + `Asian ingredients since 1989.`;
}

function categoryPage(cat, all) {
  const url = `${ORIGIN}/catalogue/${cat.slug}`;
  const title = `${cat.name} — Wholesale Foodservice | Chuanglee`;
  const desc = describe(cat.name, cat.items.length);

  const items = cat.items.map(p => `      <li>
        <span class="pn">${esc(p.name)}${p.single ? `<span class="pv">Also single: ${esc(p.single)}</span>` : ''}</span>
        <span class="pc">#${esc(p.code)}</span>
      </li>`).join('\n');

  const others = all.filter(c => c.slug !== cat.slug)
    .map(c => `<a href="/catalogue/${c.slug}">${esc(c.name)}</a>`).join('');

  // ItemList tells Google this is a product listing rather than prose.
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${cat.name} — Chuanglee`,
    description: desc,
    url,
    isPartOf: { '@type': 'WebSite', name: 'Chuanglee', url: `${ORIGIN}/` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: cat.items.length,
      itemListElement: cat.items.slice(0, 100).map((p, i) => ({
        '@type': 'ListItem', position: i + 1, name: p.name,
      })),
    },
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}" />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="${url}" />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(desc)}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${ORIGIN}/images/logo.png" />
<meta property="og:site_name" content="Chuanglee" />
<meta property="og:locale" content="en_GB" />

<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;0,9..144,900;1,9..144,400&family=Instrument+Sans:wght@400;500;600&family=Noto+Serif+TC:wght@400;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/styles.css" />
<style>${PAGE_CSS}</style>
<script type="application/ld+json">
${JSON.stringify(ld, null, 2)}
</script>
</head>
<body data-page="category">
${NAV(cat.slug)}

<section class="cat-hero">
  <div class="eyebrow"><a href="/catalogue" style="color:inherit">Catalogue</a> → ${esc(cat.name)}</div>
  <h1>${esc(cat.name)}</h1>
  <p>${cat.items.length} products in this category, available for foodservice wholesale across London and nationwide. Product codes shown are case codes unless noted.</p>
</section>

<div class="cat-wrap">
  <ul class="cat-list">
${items}
  </ul>

  <div class="cat-cta">
    <p>Need pricing or availability on any of these?</p>
    <a href="/contact">Open a trade account →</a>
  </div>

  <div class="cat-other">
    <h2>Other categories</h2>
    <div class="links">${others}</div>
  </div>
</div>

${FOOTER}
<script src="/script.js"></script>
<script src="/content-loader.js"></script>
</body>
</html>
`;
}

/* ---------- catalogue.html index block ---------- */

const START = '<!-- CATEGORY-INDEX:START (generated by scripts/build-catalogue.js) -->';
const END = '<!-- CATEGORY-INDEX:END -->';

function indexBlock(cats) {
  const links = cats.map(c =>
    `      <li><a href="/catalogue/${c.slug}">${esc(c.name)}</a> <span>${c.items.length}</span></li>`
  ).join('\n');

  return `${START}
<section class="cat-index">
  <div class="ci-inner">
    <h2>Browse by category</h2>
    <p>Every product listed, grouped by category — no search required.</p>
    <ul class="ci-list">
${links}
    </ul>
  </div>
</section>
<style>
.cat-index{max-width:1200px;margin:0 auto;padding:56px 48px}
.cat-index h2{font-family:var(--display);font-weight:400;font-size:clamp(24px,3vw,36px);letter-spacing:-.02em;margin-bottom:8px}
.cat-index > .ci-inner > p{color:var(--ink-soft);font-size:15px;margin-bottom:24px}
.ci-list{list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:2px 24px}
.ci-list li{display:flex;justify-content:space-between;gap:12px;padding:9px 2px;border-bottom:1px solid var(--rule);font-size:14px}
.ci-list a{color:var(--ink);text-decoration:none}
.ci-list a:hover{color:var(--vermillion)}
.ci-list span{color:var(--ink-soft);font-size:12px;font-variant-numeric:tabular-nums}
@media(max-width:800px){.cat-index{padding:40px 22px}}
</style>
${END}`;
}

function injectIndex(cats) {
  const p = path.join(ROOT, 'catalogue.html');
  let s = fs.readFileSync(p, 'utf8');
  const block = indexBlock(cats);

  const from = s.indexOf(START);
  const to = s.indexOf(END);
  if (from !== -1 && to !== -1 && to > from) {
    // Plain slicing rather than a regex: the markers contain characters that
    // would need escaping, and there is only ever one block to replace.
    s = s.slice(0, from) + block + s.slice(to + END.length);
  } else {
    const at = s.lastIndexOf('<footer');
    if (at === -1) throw new Error('catalogue.html: no <footer> to insert before');
    s = s.slice(0, at) + block + '\n\n' + s.slice(at);
  }
  fs.writeFileSync(p, s);
}

/* ---------- sitemap ---------- */

function writeSitemap(cats, brands) {
  const main = [
    ['/', 'weekly', '1.0'], ['/catalogue', 'weekly', '0.9'], ['/brands', 'monthly', '0.8'],
    ['/farm', 'monthly', '0.7'], ['/delivery', 'monthly', '0.7'],
    ['/contact', 'monthly', '0.7'], ['/bookings', 'monthly', '0.5'],
  ];
  const urls = [
    ...main.map(([p, f, pr]) => ({ loc: ORIGIN + p, f, pr })),
    ...cats.map(c => ({ loc: `${ORIGIN}/catalogue/${c.slug}`, f: 'monthly', pr: '0.6' })),
    // Brand pages carry the branded-search intent, so they rank above
    // categories in priority.
    ...brands.map(b => ({ loc: `${ORIGIN}/brands/${b.slug}`, f: 'monthly', pr: '0.7' })),
  ];
  const body = urls.map(u =>
    `  <url>\n    <loc>${u.loc}</loc>\n    <changefreq>${u.f}</changefreq>\n    <priority>${u.pr}</priority>\n  </url>`
  ).join('\n');
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`);
  return urls.length;
}

/* main lives at the end of this file */

/* ---------- brand pages ---------- */

const MIN_BRAND_PRODUCTS = 3;

// Whole-token comparison without regex escaping: both sides collapse every
// non-alphanumeric run to a single space, so "AROY-D" matches "AROY D" and
// alias "PA" can never match inside "PANANG".
function tokens(s) {
  return ' ' + String(s).toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim() + ' ';
}

function loadBrands(cats) {
  const map = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/brand-map.json'), 'utf8'));

  // Longest alias first: "LEE KUM KEE" must win before a shorter alias could
  // claim the same product.
  const pairs = Object.entries(map)
    .flatMap(([brand, aliases]) => aliases.map(a => [tokens(a).trim(), brand]))
    .sort((x, y) => y[0].length - x[0].length);

  const groups = new Map();
  for (const cat of cats) {
    for (const item of cat.items) {
      const hay = tokens(item.name);
      const hit = pairs.find(([alias]) => hay.includes(' ' + alias + ' '));
      if (!hit) continue;
      const brand = hit[1];
      if (!groups.has(brand)) groups.set(brand, { items: [], cats: new Map() });
      const g = groups.get(brand);
      g.items.push(item);
      g.cats.set(cat.name, (g.cats.get(cat.name) || 0) + 1);
    }
  }

  const seen = new Set();
  return [...groups.entries()]
    .filter(([, g]) => g.items.length >= MIN_BRAND_PRODUCTS)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([name, g]) => {
      let slug = slugify(name), s = slug, n = 2;
      while (seen.has(s)) s = `${slug}-${n++}`;
      seen.add(s);
      g.items.sort((a, b) => a.name.localeCompare(b.name));
      // The category the brand is best known for, used in the page title so it
      // targets "<brand> <product type>" rather than the bare brand name.
      const topCat = [...g.cats.entries()].sort((a, b) => b[1] - a[1])[0][0];
      return { name, slug, items: g.items, topCat };
    });
}

function brandPage(brand, all) {
  const url = `${ORIGIN}/brands/${brand.slug}`;
  // Titles read "Nittaya Thai Curry Paste — Wholesale UK", so the page targets
  // the way people actually search: brand plus what the brand makes. Category
  // names like "Thai curry paste/powder" keep only the part before the slash —
  // "Thai Curry Paste" is the phrase someone types, "paste powder" is not.
  const kind = brand.topCat
    .split('/')[0]
    .trim()
    .replace(/\b[a-z]/g, c => c.toUpperCase());
  const title = `${brand.name} ${kind} — Wholesale UK | Chuanglee`;
  const desc = `${brand.name} ${kind} for foodservice — ${brand.items.length} lines `
             + `stocked and delivered across London and nationwide by Chuanglee, `
             + `East Asian importer and distributor since 1989.`;

  const items = brand.items.map(p => `      <li>
        <span class="pn">${esc(p.name)}${p.single ? `<span class="pv">Also single: ${esc(p.single)}</span>` : ''}</span>
        <span class="pc">#${esc(p.code)}</span>
      </li>`).join('\n');

  const others = all.filter(b => b.slug !== brand.slug)
    .map(b => `<a href="/brands/${b.slug}">${esc(b.name)}</a>`).join('');

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${brand.name} — wholesale from Chuanglee`,
    description: desc,
    url,
    about: { '@type': 'Brand', name: brand.name },
    isPartOf: { '@type': 'WebSite', name: 'Chuanglee', url: `${ORIGIN}/` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: brand.items.length,
      itemListElement: brand.items.slice(0, 100).map((p, i) => ({
        '@type': 'ListItem', position: i + 1, name: p.name,
      })),
    },
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}" />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="${url}" />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(desc)}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${ORIGIN}/images/logo.png" />
<meta property="og:site_name" content="Chuanglee" />
<meta property="og:locale" content="en_GB" />

<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;0,9..144,900;1,9..144,400&family=Instrument+Sans:wght@400;500;600&family=Noto+Serif+TC:wght@400;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/styles.css" />
<style>${PAGE_CSS}</style>
<script type="application/ld+json">
${JSON.stringify(ld, null, 2)}
</script>
</head>
<body data-page="brand">
${NAV(brand.slug)}

<section class="cat-hero">
  <div class="eyebrow"><a href="/brands" style="color:inherit">Brands</a> → ${esc(brand.name)}</div>
  <h1>${esc(brand.name)}</h1>
  <p>${brand.items.length} ${esc(brand.name)} lines stocked for foodservice wholesale, delivered across London and nationwide. Product codes shown are case codes unless noted.</p>
</section>

<div class="cat-wrap">
  <ul class="cat-list">
${items}
  </ul>

  <div class="cat-cta">
    <p>Need pricing or availability on ${esc(brand.name)}?</p>
    <a href="/contact">Open a trade account →</a>
  </div>

  <div class="cat-other">
    <h2>Other brands we stock</h2>
    <div class="links">${others}</div>
  </div>
</div>

${FOOTER}
<script src="/script.js"></script>
<script src="/content-loader.js"></script>
</body>
</html>
`;
}

/* ---------- brands.html index block ---------- */

const B_START = '<!-- BRAND-INDEX:START (generated by scripts/build-pages.js) -->';
const B_END = '<!-- BRAND-INDEX:END -->';

function injectBrandIndex(brands) {
  const p = path.join(ROOT, 'brands.html');
  let s = fs.readFileSync(p, 'utf8');

  const links = brands.map(b =>
    `      <li><a href="/brands/${b.slug}">${esc(b.name)}</a> <span>${b.items.length}</span></li>`
  ).join('\n');

  const block = `${B_START}
<section class="cat-index">
  <div class="ci-inner">
    <h2>Every brand we stock</h2>
    <p>Full product lists by brand, with case codes.</p>
    <ul class="ci-list">
${links}
    </ul>
  </div>
</section>
<style>
.cat-index{max-width:1200px;margin:0 auto;padding:56px 48px}
.cat-index h2{font-family:var(--display);font-weight:400;font-size:clamp(24px,3vw,36px);letter-spacing:-.02em;margin-bottom:8px}
.cat-index > .ci-inner > p{color:var(--ink-soft);font-size:15px;margin-bottom:24px}
.ci-list{list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:2px 24px}
.ci-list li{display:flex;justify-content:space-between;gap:12px;padding:9px 2px;border-bottom:1px solid var(--rule);font-size:14px}
.ci-list a{color:var(--ink);text-decoration:none}
.ci-list a:hover{color:var(--vermillion)}
.ci-list span{color:var(--ink-soft);font-size:12px;font-variant-numeric:tabular-nums}
@media(max-width:800px){.cat-index{padding:40px 22px}}
</style>
${B_END}`;

  const from = s.indexOf(B_START);
  const to = s.indexOf(B_END);
  if (from !== -1 && to !== -1 && to > from) {
    s = s.slice(0, from) + block + s.slice(to + B_END.length);
  } else {
    const at = s.lastIndexOf('<footer');
    if (at === -1) throw new Error('brands.html: no <footer> to insert before');
    s = s.slice(0, at) + block + '\n\n' + s.slice(at);
  }
  fs.writeFileSync(p, s);
}

/* ---------- main ---------- */

const cats = loadCategories();
const brands = loadBrands(cats);

for (const [dir, pages, render] of [
  [OUT_DIR, cats, c => categoryPage(c, cats)],
  [BRAND_DIR, brands, b => brandPage(b, brands)],
]) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  for (const p of pages) fs.writeFileSync(path.join(dir, `${p.slug}.html`), render(p));
}

injectIndex(cats);
injectBrandIndex(brands);
const urlCount = writeSitemap(cats, brands);

const catProducts = cats.reduce((a, c) => a + c.items.length, 0);
const brandProducts = brands.reduce((a, b) => a + b.items.length, 0);
console.log(`${cats.length} category pages -> catalogue/   (${catProducts} products)`);
console.log(`${brands.length} brand pages    -> brands/      (${brandProducts} products)`);
console.log(`sitemap.xml: ${urlCount} urls`);
