// Chuanglee Content Loader v6 — direct ID targeting, no array rebuilding

async function loadJSON(file) {
  try {
    const res = await fetch(`/content/${file}.json?v=${Date.now()}`);
    if (!res.ok) return {};
    return await res.json();
  } catch (e) { return {}; }
}

function id(elId, value) {
  if (!value) return;
  const el = document.getElementById(elId);
  if (el) el.textContent = value;
}

function sel(selector, value) {
  if (!value) return;
  const el = document.querySelector(selector);
  if (el) el.textContent = value;
}

function selAll(selector, value) {
  if (!value) return;
  document.querySelectorAll(selector).forEach(el => el.textContent = value);
}

function bg(elId, url) {
  if (!url) return;
  const el = document.getElementById(elId);
  if (el) el.style.backgroundImage = `url('${url}')`;
}

function btn(elemId, label, url) {
  const el = document.getElementById(elemId);
  if (!el) return;
  if (label) el.textContent = label;
  if (url) el.href = url;
}

function bgSel(selector, url) {
  if (!url) return;
  const el = document.querySelector(selector);
  if (el) el.style.backgroundImage = `url('${url}')`;
}

async function applyGlobal() {
  const g = await loadJSON('global');
  if (!g || !Object.keys(g).length) return;
  if (g.phone) {
    selAll('.phone', g.phone);
    document.querySelectorAll('a[href^="tel:"]').forEach(el => {
      el.href = `tel:${g.phone.replace(/\s/g, '')}`;
      el.textContent = g.phone;
    });
  }
  if (g.email) {
    document.querySelectorAll('a[href^="mailto:"]').forEach(el => {
      el.href = `mailto:${g.email}`;
      el.textContent = g.email;
    });
  }
  if (g.address_1 || g.address_2) {
    document.querySelectorAll('.foot-col li').forEach(li => {
      if (li.textContent.includes('Meridian')) li.textContent = g.address_1 || li.textContent;
      if (li.textContent.includes('Bugsby') || li.textContent.includes('SE7')) li.textContent = g.address_2 || li.textContent;
    });
    document.querySelectorAll('.contact-meta .value').forEach(el => {
      if (el.innerHTML.includes('Meridian') || el.innerHTML.includes('Bugsby')) {
        el.innerHTML = `${g.address_1 || ''}<br />${g.address_2 || ''}`;
      }
    });
  }
  if (g.nav_cta) selAll('.order-btn', g.nav_cta);
  if (g.copyright) {
    document.querySelectorAll('.foot-bottom div').forEach(el => {
      if (el.textContent.includes('Chuanglee Limited')) {
        el.textContent = `© ${g.copyright} Chuanglee Limited. All rights reserved.`;
      }
    });
  }
  if (g.topbar_messages && g.topbar_messages.length) {
    const marquee = document.querySelector('.marquee');
    if (marquee) {
      const msgs = [...g.topbar_messages, ...g.topbar_messages];
      marquee.innerHTML = msgs.map(m => `<span><span class="dot"></span> ${m}</span>`).join('');
    }
  }
}

async function applyHome() {
  const d = await loadJSON('home');
  if (!d || !Object.keys(d).length) return;

  // HERO
  sel('.hero-meta', d.hero_meta);
  const headline = document.querySelector('h1.headline');
  if (headline) {
    headline.innerHTML = '';
    if (d.hero_line1) headline.innerHTML = `${d.hero_line1}<br />of <span class="ital">${d.hero_line2_italic || 'East Asia'}</span>,<br />from soil to <span class="ital">${d.hero_line3 || 'stove'}</span>.<span class="cjk">創立</span>`;
  }
  sel('.hero-sub', d.hero_lede);
  sel('.hero-actions .btn-primary', d.hero_cta_primary);
  if (d.hero_cta_secondary) {
    const btn = document.querySelector('.hero-actions .btn-ghost');
    if (btn) btn.innerHTML = `${d.hero_cta_secondary} <span class="arrow">→</span>`;
  }
  if (d.hero_stamp_num || d.hero_stamp_label) {
    const stamp = document.querySelector('.hero-stamp');
    if (stamp) stamp.innerHTML = `<div><span class="yr">${d.hero_stamp_num || '36'}</span>${(d.hero_stamp_label || 'Years of Trade').replace(' ', '<br />')}</div>`;
  }
  bg('hero-img-main', d.hero_img_main);
  bg('hero-img-sub', d.hero_img_sub);

  // STATS — direct ID targeting
  id('stat-1-num', d.stat_1_num); id('stat-1-label', d.stat_1_label);
  id('stat-2-num', d.stat_2_num); id('stat-2-label', d.stat_2_label);
  id('stat-3-num', d.stat_3_num); id('stat-3-label', d.stat_3_label);
  id('stat-4-num', d.stat_4_num); id('stat-4-label', d.stat_4_label);
  id('stat-5-num', d.stat_5_num); id('stat-5-label', d.stat_5_label);

  // STORY
  id('story-eyebrow', d.story_eyebrow);
  id('story-lead', d.story_lead);
  id('story-quote', d.story_quote);
  id('story-cite', d.story_cite);
  id('story-tag', d.story_tag);
  bg('story-img-1', d.story_img_1);
  bg('story-img-2', d.story_img_2);

  // CAPABILITIES
  id('cap-eyebrow', d.cap_eyebrow);
  bg('cap-img', d.cap_img);
  for (let i = 1; i <= 5; i++) {
    id(`cap-${i}-num`, d[`cap_${i}_num`]);
    id(`cap-${i}-title`, d[`cap_${i}_title`]);
  }

  // ECOSYSTEM
  id('eco-eyebrow', d.eco_eyebrow);
  for (let i = 1; i <= 5; i++) {
    id(`eco-${i}-title`, d[`eco_${i}_title`]);
    id(`eco-${i}-desc`, d[`eco_${i}_desc`]);
  }

  // FARM (homepage)
  id('farm-home-eyebrow', d.farm_home_eyebrow);
  id('farm-home-p', d.farm_home_p);
  id('farm-home-quote', d.farm_home_quote);
  const farmQuote = document.querySelector('#farm .farm-quote');
  if (farmQuote && d.farm_home_quote) farmQuote.innerHTML = `"<span class="cjk-char">家</span> ${d.farm_home_quote}"`;
  bgSel('#farm .farm-img-main', d.farm_img_main);
  for (let i = 1; i <= 4; i++) {
    id(`herb-${i}-name`, d[`herb_${i}_name`]);
    id(`herb-${i}-desc`, d[`herb_${i}_desc`]);
  }

  // CUSTOMERS
  id('cust-eyebrow', d.cust_eyebrow);

  // HERITAGE / TIMELINE
  id('heritage-eyebrow', d.heritage_eyebrow);
  for (let i = 1; i <= 6; i++) {
    id(`tl-${i}-year`, d[`tl_${i}_year`]);
    id(`tl-${i}-event`, d[`tl_${i}_event`]);
  }

  // APP
  id('app-eyebrow', d.app_eyebrow);
  id('app-desc', d.app_desc);
  for (let i = 1; i <= 4; i++) {
    id(`app-feat-${i}`, d[`app_feat_${i}`]);
  }
  if (d.app_store_url && d.app_store_url !== '#') {
    const btn = document.querySelector('.app-btn');
    if (btn) btn.href = d.app_store_url;
  }
  if (d.play_store_url && d.play_store_url !== '#') {
    const btns = document.querySelectorAll('.app-btn');
    if (btns[1]) btns[1].href = d.play_store_url;
  }

  // PROMO IMAGES
  bg('promo-img-1', d.promo_img_1);
  bg('promo-img-2', d.promo_img_2);
}

  // Button URLs (from brands.json — shared config file)
  const b = await loadJSON('brands');
  if (b) {
    btn('hero-cta-primary', b.hero_cta_primary_label, b.hero_cta_primary_url);
    btn('hero-cta-secondary', b.hero_cta_secondary_label, b.hero_cta_secondary_url);
    btn('farm-cta', b.farm_cta_label, b.farm_cta_url);
    id('contact-cta-heading', b.contact_cta_heading);
    id('contact-cta-sub', b.contact_cta_sub);
    btn('contact-cta-btn', b.contact_cta_label, b.contact_cta_url);
  }
}

async function applyBrands() {
  const d = await loadJSON('brands');
  if (!d || !Object.keys(d).length) return;

  // Spotlight image
  bg('spotlight-img', d.spotlight_img);

  // Spotlight CTA button
  btn('brands-spotlight-cta', d.brands_spotlight_cta_label, d.brands_spotlight_cta_url);

  // Sourcing CTA button
  btn('brands-sourcing-cta', d.brands_sourcing_cta_label, d.brands_sourcing_cta_url);
}

async function applyHome() {
  const d = await loadJSON('home');
  if (!d || !Object.keys(d).length) return;

async function applyFarm() {
  const d = await loadJSON('farm');
  if (!d || !Object.keys(d).length) return;
  const h1 = document.querySelector('.page-hero h1');
  if (h1 && d.hero_line1) h1.innerHTML = `${d.hero_line1}<br /><em>${d.hero_italic || 'one hour'}</em> ${d.hero_line2 || 'from Bangkok.'}<span class="cjk-sm">農家</span>`;
  sel('.page-hero .lede', d.hero_lede);
  sel('.farm-text .eyebrow', d.eyebrow);
  const paras = document.querySelectorAll('.farm-text > p');
  if (paras[0] && d.para_1) paras[0].textContent = d.para_1;
  if (paras[1] && d.para_2) paras[1].textContent = d.para_2;
  if (d.quote) {
    const q = document.querySelector('.farm-quote');
    if (q) q.innerHTML = `"<span class="cjk-char">家</span> ${d.quote}"`;
  }
  if (d.cta_h3) { const h3 = document.querySelector('.promo-band h3'); if (h3) h3.innerHTML = d.cta_h3; }
  sel('.promo-text p', d.cta_desc);
  sel('.promo-text .btn-primary', d.cta_btn);
  bg('farm-img-main', d.farm_img_main);
  bg('farm-promo-img', d.promo_img);
}

async function applyContact() {
  const d = await loadJSON('contact');
  if (!d || !Object.keys(d).length) return;
  sel('.contact .eyebrow', d.eyebrow);
  if (d.headline) { const h2 = document.querySelector('.contact h2.title'); if (h2) h2.innerHTML = d.headline; }
  sel('.contact .lead', d.lead);
  sel('.contact-form h3', d.form_heading);
  sel('.contact-form .sub', d.form_sub);
  sel('.form-submit', d.form_submit);
  document.querySelectorAll('.contact-meta .item').forEach(item => {
    const label = item.querySelector('.label');
    const val = item.querySelector('.value');
    if (!label || !val) return;
    if (label.textContent.includes('Delivery') && d.delivery) val.textContent = d.delivery;
    if (label.textContent.includes('Minimum') && d.min_order) val.textContent = d.min_order;
  });
}

  const b2 = await loadJSON('brands');
  if (b2) {
    btn('farm-sourcing-cta', b2.farm_sourcing_cta_label, b2.farm_sourcing_cta_url);
  }
}

async function applyCatalogue() {
  const d = await loadJSON('catalogue');
  if (!d || !Object.keys(d).length) return;

  // Hero
  if (d.cat_lede) id('cat-lede', d.cat_lede);

  // Flipbook cards
  id('flipbook-1-title', d.flipbook_1_title);
  id('flipbook-1-sub', d.flipbook_1_sub);
  id('flipbook-2-title', d.flipbook_2_title);
  id('flipbook-2-sub', d.flipbook_2_sub);

  // Flipbook URLs
  const fc1 = document.querySelector('.flip-card.fc-rest');
  if (fc1 && d.flipbook_1_url) fc1.href = d.flipbook_1_url;
  const fc2 = document.querySelector('.flip-card.fc-whole');
  if (fc2 && d.flipbook_2_url) fc2.href = d.flipbook_2_url;

  // Category banner images
  bg('cat-img-sauces', d.cat_img_sauces);
  bg('cat-img-fresh', d.cat_img_fresh);
  bg('cat-img-frozen', d.cat_img_frozen);
  bg('cat-img-pantry', d.cat_img_pantry);
  bg('cat-img-drinks', d.cat_img_drinks);

  // Category banner headings
  id('cat-ban-1-h3', d.cat_ban_1_h3);
  id('cat-ban-2-h3', d.cat_ban_2_h3);
  id('cat-ban-3-h3', d.cat_ban_3_h3);
  id('cat-ban-4-h3', d.cat_ban_4_h3);
  id('cat-ban-5-h3', d.cat_ban_5_h3);

  // Promo band
  id('cat-promo-h3', d.cat_promo_h3);
  id('cat-promo-p', d.cat_promo_p);
}

(async () => {
  const page = document.body.dataset.page || 'home';
  await applyGlobal();
  if (page === 'home') await applyHome();
  if (page === 'brands') await applyBrands();
  if (page === 'farm') await applyFarm();
  if (page === 'contact') await applyContact();
  if (page === 'catalogue') await applyCatalogue();
})();
