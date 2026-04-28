// Chuanglee Content Loader v2
// Targets existing HTML elements by their classes — no data attributes needed.

async function loadJSON(file) {
  try {
    const res = await fetch(`/content/${file}.json?v=${Date.now()}`);
    if (!res.ok) return {};
    return await res.json();
  } catch (e) {
    return {};
  }
}

function set(selector, value, attr) {
  if (!value) return;
  const el = document.querySelector(selector);
  if (!el) return;
  if (attr) { el[attr] = value; } else { el.textContent = value; }
}

function setAll(selector, value) {
  if (!value) return;
  document.querySelectorAll(selector).forEach(el => el.textContent = value);
}

function setHTML(selector, value) {
  if (!value) return;
  const el = document.querySelector(selector);
  if (el) el.innerHTML = value;
}

async function applyGlobal() {
  const g = await loadJSON('global');
  if (!g || !Object.keys(g).length) return;

  // Phone — all instances
  if (g.phone) {
    setAll('.phone', g.phone);
    document.querySelectorAll('a[href^="tel:"]').forEach(el => {
      el.href = `tel:${g.phone.replace(/\s/g, '')}`;
      el.textContent = g.phone;
    });
  }

  // Email
  if (g.email) {
    document.querySelectorAll('a[href^="mailto:"]').forEach(el => {
      el.href = `mailto:${g.email}`;
      el.textContent = g.email;
    });
  }

  // Address in footer
  if (g.address_1 || g.address_2) {
    document.querySelectorAll('.foot-col li').forEach(li => {
      if (li.textContent.includes('Meridian') || li.textContent.includes('Bugsby')) {
        if (li.textContent.includes('Meridian')) li.textContent = g.address_1 || li.textContent;
        if (li.textContent.includes('Bugsby') || li.textContent.includes('SE7')) li.textContent = g.address_2 || li.textContent;
      }
    });
    // Contact page address value
    document.querySelectorAll('.contact-meta .value').forEach(el => {
      if (el.innerHTML.includes('Meridian') || el.innerHTML.includes('Bugsby')) {
        el.innerHTML = `${g.address_1 || ''}<br />${g.address_2 || ''}`;
      }
    });
  }

  // Nav CTA
  if (g.nav_cta) setAll('.order-btn', g.nav_cta);

  // Copyright
  if (g.copyright) {
    document.querySelectorAll('.foot-bottom div').forEach(el => {
      if (el.textContent.includes('Chuanglee Limited')) {
        el.textContent = `© ${g.copyright} Chuanglee Limited. All rights reserved.`;
      }
    });
  }

  // Topbar marquee
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

  // Hero headline — reconstruct
  const headline = document.querySelector('h1.headline');
  if (headline && (d.hero_line1 || d.hero_line2_italic || d.hero_line3)) {
    headline.innerHTML = `${d.hero_line1 || 'The flavour'}<br />
      of <span class="ital">${d.hero_line2_italic || 'East Asia'}</span>,<br />
      from soil to <span class="ital">${d.hero_line3 || 'stove'}</span>.
      <span class="cjk">創立</span>`;
  }

  // Hero sub paragraph
  if (d.hero_lede) {
    const sub = document.querySelector('.hero-sub');
    if (sub) sub.textContent = d.hero_lede;
  }

  // Hero CTA buttons
  if (d.hero_cta_primary) {
    const btn = document.querySelector('.hero-actions .btn-primary');
    if (btn) btn.textContent = d.hero_cta_primary;
  }
  if (d.hero_cta_secondary) {
    const btn = document.querySelector('.hero-actions .btn-ghost');
    if (btn) btn.innerHTML = `${d.hero_cta_secondary} <span class="arrow">→</span>`;
  }

  // Stats
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
}

async function applyFarm() {
  const d = await loadJSON('farm');
  if (!d || !Object.keys(d).length) return;

  // Page hero
  const h1 = document.querySelector('.page-hero h1');
  if (h1 && d.hero_line1) {
    h1.innerHTML = `${d.hero_line1}<br /><em>${d.hero_italic || 'one hour'}</em> ${d.hero_line2 || 'from Bangkok.'}<span class="cjk-sm">農家</span>`;
  }
  if (d.hero_lede) set('.page-hero .lede', d.hero_lede);

  // Farm section
  if (d.eyebrow) set('.farm-text .eyebrow', d.eyebrow);
  if (d.para_1) {
    const paras = document.querySelectorAll('.farm-text > p');
    if (paras[0]) paras[0].textContent = d.para_1;
    if (paras[1] && d.para_2) paras[1].textContent = d.para_2;
  }

  // Pull quote
  if (d.quote) {
    const q = document.querySelector('.farm-quote');
    if (q) q.innerHTML = `"<span class="cjk-char">家</span> ${d.quote}"`;
  }

  // CTA banner
  if (d.cta_h3) {
    const h3 = document.querySelector('.promo-band h3');
    if (h3) h3.innerHTML = d.cta_h3;
  }
  if (d.cta_desc) {
    const p = document.querySelector('.promo-text p');
    if (p) p.textContent = d.cta_desc;
  }
  if (d.cta_btn) {
    const btn = document.querySelector('.promo-text .btn-primary');
    if (btn) btn.textContent = d.cta_btn;
  }
}

async function applyContact() {
  const d = await loadJSON('contact');
  if (!d || !Object.keys(d).length) return;

  if (d.eyebrow) set('.contact .eyebrow', d.eyebrow);
  if (d.headline) {
    const h2 = document.querySelector('.contact h2.title');
    if (h2) h2.innerHTML = d.headline.replace(/\*(.*?)\*/g, '<em>$1</em>');
  }
  if (d.lead) set('.contact .lead', d.lead);
  if (d.form_heading) set('.contact-form h3', d.form_heading);
  if (d.form_sub) set('.contact-form .sub', d.form_sub);
  if (d.form_submit) set('.form-submit', d.form_submit);

  // Contact meta items
  if (d.delivery) {
    document.querySelectorAll('.contact-meta .item').forEach(item => {
      if (item.querySelector('.label') && item.querySelector('.label').textContent.includes('Delivery')) {
        const val = item.querySelector('.value');
        if (val) val.textContent = d.delivery;
      }
    });
  }
  if (d.min_order) {
    document.querySelectorAll('.contact-meta .item').forEach(item => {
      if (item.querySelector('.label') && item.querySelector('.label').textContent.includes('Minimum')) {
        const val = item.querySelector('.value');
        if (val) val.textContent = d.min_order;
      }
    });
  }
}

// Run based on page
(async () => {
  const page = document.body.dataset.page || 'home';
  await applyGlobal();
  if (page === 'home') await applyHome();
  if (page === 'farm') await applyFarm();
  if (page === 'contact') await applyContact();
})();
