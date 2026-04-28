// Chuanglee Content Loader v3 — text + image support

async function loadJSON(file) {
  try {
    const res = await fetch(`/content/${file}.json?v=${Date.now()}`);
    if (!res.ok) return {};
    return await res.json();
  } catch (e) { return {}; }
}

function set(selector, value) {
  if (!value) return;
  const el = document.querySelector(selector);
  if (el) el.textContent = value;
}

function setAll(selector, value) {
  if (!value) return;
  document.querySelectorAll(selector).forEach(el => el.textContent = value);
}

function setBg(id, url) {
  if (!url) return;
  const el = document.getElementById(id);
  if (el) el.style.backgroundImage = `url('${url}')`;
}

async function applyGlobal() {
  const g = await loadJSON('global');
  if (!g || !Object.keys(g).length) return;
  if (g.phone) {
    setAll('.phone', g.phone);
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
  if (g.nav_cta) setAll('.order-btn', g.nav_cta);
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
  const headline = document.querySelector('h1.headline');
  if (headline && d.hero_line1) {
    headline.innerHTML = `${d.hero_line1}<br />of <span class="ital">${d.hero_line2_italic || 'East Asia'}</span>,<br />from soil to <span class="ital">${d.hero_line3 || 'stove'}</span>.<span class="cjk">創立</span>`;
  }
  if (d.hero_lede) set('.hero-sub', d.hero_lede);
  if (d.hero_cta_primary) set('.hero-actions .btn-primary', d.hero_cta_primary);
  if (d.hero_cta_secondary) {
    const btn = document.querySelector('.hero-actions .btn-ghost');
    if (btn) btn.innerHTML = `${d.hero_cta_secondary} <span class="arrow">→</span>`;
  }
  if (d.stats && d.stats.length) {
    const statEls = document.querySelectorAll('.stat');
    d.stats.forEach((s, i) => {
      if (statEls[i]) {
        const numEl = statEls[i].querySelector('.stat-num');
        const labelEl = statEls[i].querySelector('.stat-label');
        if (numEl) numEl.textContent = s.num;
        if (labelEl) labelEl.textContent = s.label;
      }
    });
  }
  setBg('hero-img-main', d.hero_img_main);
  setBg('hero-img-sub', d.hero_img_sub);
  setBg('promo-img-1', d.promo_img_1);
  setBg('promo-img-2', d.promo_img_2);
}

async function applyBrands() {
  const d = await loadJSON('brands');
  if (!d || !Object.keys(d).length) return;
  setBg('brands-promo-img-1', d.promo_img_1);
  setBg('brands-promo-img-2', d.promo_img_2);
  if (d.brands && d.brands.length) {
    const grid = document.querySelector('.brands-grid');
    if (grid) {
      grid.innerHTML = d.brands.map(b => {
        const styleClass = b.style === 'dark' ? 'dark' : b.style === 'red' ? 'red' : b.style === 'gold' ? 'gold-bg' : '';
        return `<div class="brand-card ${styleClass}"><span class="bc-num">${b.num}</span><div class="bc-cjk">${b.cjk}</div><h3>${b.name}</h3><div class="bc-origin">${b.origin}</div><p>${b.desc}</p><div class="bc-foot"><span>${b.tags}</span><span class="arr">→</span></div></div>`;
      }).join('');
    }
  }
}

async function applyFarm() {
  const d = await loadJSON('farm');
  if (!d || !Object.keys(d).length) return;
  const h1 = document.querySelector('.page-hero h1');
  if (h1 && d.hero_line1) {
    h1.innerHTML = `${d.hero_line1}<br /><em>${d.hero_italic || 'one hour'}</em> ${d.hero_line2 || 'from Bangkok.'}<span class="cjk-sm">農家</span>`;
  }
  if (d.hero_lede) set('.page-hero .lede', d.hero_lede);
  if (d.eyebrow) set('.farm-text .eyebrow', d.eyebrow);
  const paras = document.querySelectorAll('.farm-text > p');
  if (paras[0] && d.para_1) paras[0].textContent = d.para_1;
  if (paras[1] && d.para_2) paras[1].textContent = d.para_2;
  if (d.quote) {
    const q = document.querySelector('.farm-quote');
    if (q) q.innerHTML = `"<span class="cjk-char">家</span> ${d.quote}"`;
  }
  if (d.cta_h3) { const h3 = document.querySelector('.promo-band h3'); if (h3) h3.innerHTML = d.cta_h3; }
  if (d.cta_desc) set('.promo-text p', d.cta_desc);
  if (d.cta_btn) set('.promo-text .btn-primary', d.cta_btn);
  setBg('farm-promo-img', d.promo_img);
}

async function applyContact() {
  const d = await loadJSON('contact');
  if (!d || !Object.keys(d).length) return;
  if (d.eyebrow) set('.contact .eyebrow', d.eyebrow);
  if (d.headline) { const h2 = document.querySelector('.contact h2.title'); if (h2) h2.innerHTML = d.headline; }
  if (d.lead) set('.contact .lead', d.lead);
  if (d.form_heading) set('.contact-form h3', d.form_heading);
  if (d.form_sub) set('.contact-form .sub', d.form_sub);
  if (d.form_submit) set('.form-submit', d.form_submit);
  document.querySelectorAll('.contact-meta .item').forEach(item => {
    const label = item.querySelector('.label');
    const val = item.querySelector('.value');
    if (!label || !val) return;
    if (label.textContent.includes('Delivery') && d.delivery) val.textContent = d.delivery;
    if (label.textContent.includes('Minimum') && d.min_order) val.textContent = d.min_order;
  });
}

async function applyCatalogue() {
  const d = await loadJSON('catalogue');
  if (!d || !Object.keys(d).length) return;
  setBg('cat-img-sauces', d.cat_img_sauces);
  setBg('cat-img-rice', d.cat_img_rice);
  setBg('cat-img-herbs', d.cat_img_herbs);
  setBg('cat-img-coconut', d.cat_img_coconut);
  setBg('cat-img-snacks', d.cat_img_snacks);
  setBg('cat-promo-img-1', d.promo_img_1);
  setBg('cat-promo-img-2', d.promo_img_2);
  setBg('cat-promo-img-3', d.promo_img_3);
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
