// Chuanglee Content Loader v5 — full home page support

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

function setHTML(selector, value) {
  if (!value) return;
  const el = document.querySelector(selector);
  if (el) el.innerHTML = value;
}

function setBg(id, url) {
  if (!url) return;
  const el = document.getElementById(id);
  if (el) el.style.backgroundImage = `url('${url}')`;
}

function setBgClass(selector, url) {
  if (!url) return;
  const el = document.querySelector(selector);
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

  // HERO
  if (d.hero_meta) set('.hero-meta', d.hero_meta);
  const headline = document.querySelector('h1.headline');
  if (headline) {
    headline.innerHTML = '';
    if (d.hero_line1) {
      headline.innerHTML = `${d.hero_line1}<br />of <span class="ital">${d.hero_line2_italic || 'East Asia'}</span>,<br />from soil to <span class="ital">${d.hero_line3 || 'stove'}</span>.<span class="cjk">創立</span>`;
    }
  }
  if (d.hero_lede) set('.hero-sub', d.hero_lede);
  if (d.hero_cta_primary) set('.hero-actions .btn-primary', d.hero_cta_primary);
  if (d.hero_cta_secondary) {
    const btn = document.querySelector('.hero-actions .btn-ghost');
    if (btn) btn.innerHTML = `${d.hero_cta_secondary} <span class="arrow">→</span>`;
  }
  if (d.hero_stamp_num || d.hero_stamp_label) {
    const stamp = document.querySelector('.hero-stamp');
    if (stamp) stamp.innerHTML = `<div><span class="yr">${d.hero_stamp_num || '36'}</span>${d.hero_stamp_label || 'Years of Trade'}</div>`;
  }
  setBg('hero-img-main', d.hero_img_main);
  setBg('hero-img-sub', d.hero_img_sub);

  // STATS
  const statFields = [
    { num: d.stat_1_num, label: d.stat_1_label },
    { num: d.stat_2_num, label: d.stat_2_label },
    { num: d.stat_3_num, label: d.stat_3_label },
    { num: d.stat_4_num, label: d.stat_4_label },
    { num: d.stat_5_num, label: d.stat_5_label },
  ].filter(s => s.num);
  if (statFields.length) {
    const statsInner = document.querySelector('.stats-inner');
    if (statsInner) {
      statsInner.innerHTML = statFields.map(s =>
        `<div class="stat reveal"><div class="stat-num">${s.num}</div><div class="stat-label">${s.label}</div></div>`
      ).join('');
    }
  }

  // STORY
  if (d.story_eyebrow) set('#story .eyebrow', d.story_eyebrow);
  if (d.story_h2 && d.story_h2_italic) {
    const h2 = document.querySelector('#story h2.title');
    if (h2) h2.innerHTML = d.story_h2.replace(d.story_h2_italic, `<em>${d.story_h2_italic}</em>`);
  }
  if (d.story_lead) set('#story .lead', d.story_lead);
  if (d.story_p2 || d.story_p3) {
    const paras = document.querySelectorAll('#story .story-text > p:not(.lead)');
    if (paras[0] && d.story_p2) paras[0].textContent = d.story_p2;
    if (paras[1] && d.story_p3) paras[1].textContent = d.story_p3;
  }
  if (d.story_quote) set('#story .pull-quote', d.story_quote);
  if (d.story_quote_cite) {
    const pq = document.querySelector('#story .pull-quote');
    if (pq && d.story_quote) pq.innerHTML = `${d.story_quote}<cite>${d.story_quote_cite}</cite>`;
  }
  if (d.story_tag) set('#story .tag', d.story_tag);
  setBg('story-img-1', d.story_img_1);
  setBg('story-img-2', d.story_img_2);

  // CAPABILITIES
  if (d.cap_eyebrow) set('.capabilities .eyebrow', d.cap_eyebrow);
  if (d.cap_h2 && d.cap_h2_italic) {
    const h2 = document.querySelector('.capabilities h2.title');
    if (h2) h2.innerHTML = d.cap_h2.replace(d.cap_h2_italic, `<em>${d.cap_h2_italic}</em>`);
  }
  if (d.cap_intro) set('.cap-head > p', d.cap_intro);
  if (d.capabilities && d.capabilities.length) {
    const grid = document.querySelector('.cap-grid');
    if (grid) {
      const classes = ['cap-1', 'cap-2', 'cap-3', 'cap-4'];
      const cards = d.capabilities.slice(0, 4).map((c, i) =>
        `<div class="cap-card ${classes[i]} reveal">
          <span class="num">${c.num}</span>
          <h3>${c.title}</h3>
          <p>${c.desc}</p>
          <div class="icon">↗</div>
        </div>`
      ).join('');
      const farm = d.capabilities[4];
      const cap5 = farm ? `<div class="cap-card cap-5 reveal">
        <div class="text-side">
          <span class="num">${farm.num}</span>
          <h3>${farm.title}</h3>
          <p style="margin-top:14px;max-width:38ch;">${farm.desc}</p>
          <div class="icon" style="margin-top:auto;">↗</div>
        </div>
        <div class="img-side" id="cap-img"></div>
      </div>` : '';
      grid.innerHTML = cards + cap5;
      setBg('cap-img', d.cap_img);
    }
  }

  // ECOSYSTEM
  if (d.eco_eyebrow) set('.ecosystem .eyebrow', d.eco_eyebrow);
  if (d.eco_h2) {
    const h2 = document.querySelector('.ecosystem h2.title');
    if (h2) h2.innerHTML = d.eco_h2
      .replace('manufacturer', '<em>manufacturer</em>')
      .replace('menu', '<em>menu</em>');
  }
  if (d.ecosystem && d.ecosystem.length) {
    const flow = document.querySelector('.eco-flow');
    if (flow) {
      flow.innerHTML = d.ecosystem.map(e =>
        `<div class="eco-node reveal">
          <div class="step">${e.step}</div>
          <h4>${e.title}</h4>
          <p>${e.desc}</p>
        </div>`
      ).join('');
    }
  }

  // FARM SECTION (homepage version)
  if (d.farm_eyebrow) set('#farm .eyebrow', d.farm_eyebrow);
  if (d.farm_h2 && d.farm_h2_italic) {
    const h2 = document.querySelector('#farm h2.title');
    if (h2) h2.innerHTML = d.farm_h2.replace(d.farm_h2_italic, `<em>${d.farm_h2_italic}</em>`);
  }
  if (d.farm_p) {
    const p = document.querySelector('#farm .farm-text > p');
    if (p) p.textContent = d.farm_p;
  }
  if (d.farm_herbs && d.farm_herbs.length) {
    const list = document.querySelector('#farm .farm-list');
    if (list) {
      list.innerHTML = d.farm_herbs.map(h =>
        `<li><strong>${h.name}</strong> — ${h.desc}</li>`
      ).join('');
    }
  }
  if (d.farm_quote) {
    const q = document.querySelector('#farm .farm-quote');
    if (q) q.innerHTML = `"<span class="cjk-char">家</span> ${d.farm_quote}"`;
  }
  setBgClass('#farm .farm-img-main', d.farm_img_main);

  // CUSTOMERS
  if (d.cust_eyebrow) set('#customers .eyebrow', d.cust_eyebrow);
  if (d.cust_h2 && d.cust_h2_italic) {
    const h2 = document.querySelector('#customers h2.title');
    if (h2) h2.innerHTML = d.cust_h2.replace(d.cust_h2_italic, `<em>${d.cust_h2_italic}</em>`);
  }
  if (d.cust_intro) {
    const p = document.querySelector('.cust-head > p');
    if (p) p.textContent = d.cust_intro;
  }
  if (d.channels && d.channels.length) {
    const channels = document.querySelector('.cust-channels');
    if (channels) {
      channels.innerHTML = d.channels.map(ch =>
        `<div class="cust-channel reveal">
          <span class="ch-num">${ch.num}</span>
          <h4>${ch.title}</h4>
          <p class="cnt">${ch.subtitle}</p>
          <ul class="cust-list">
            ${ch.clients.map(c => `<li>${c}</li>`).join('')}
          </ul>
        </div>`
      ).join('');
    }
  }

  // HERITAGE / TIMELINE
  if (d.heritage_eyebrow) set('#heritage .eyebrow', d.heritage_eyebrow);
  if (d.heritage_h2 && d.heritage_h2_italic) {
    const h2 = document.querySelector('#heritage h2.title');
    if (h2) h2.innerHTML = d.heritage_h2.replace(d.heritage_h2_italic, `<em>${d.heritage_h2_italic}</em>`);
  }
  if (d.heritage_intro) {
    const p = document.querySelector('.heritage-head > p');
    if (p) p.textContent = d.heritage_intro;
  }
  if (d.timeline && d.timeline.length) {
    const tl = document.querySelector('.timeline');
    if (tl) {
      tl.innerHTML = d.timeline.map(t =>
        `<div class="tl-item reveal">
          <div class="tl-year">${t.year}</div>
          <div class="tl-event">${t.event}</div>
        </div>`
      ).join('');
    }
  }

  // APP SECTION
  if (d.app_eyebrow) set('.app-section .eyebrow', d.app_eyebrow);
  if (d.app_h2 && d.app_h2_italic) {
    const h2 = document.querySelector('.app-section h2.title');
    if (h2) h2.innerHTML = d.app_h2.replace(d.app_h2_italic, `<em>${d.app_h2_italic}</em>`);
  }
  if (d.app_desc) set('.app-section > .app-inner > div > p', d.app_desc);
  if (d.app_features && d.app_features.length) {
    const features = document.querySelector('.app-features');
    if (features) {
      features.innerHTML = d.app_features.map((f, i) =>
        `<div><span>0${i + 1}</span> ${f}</div>`
      ).join('');
    }
  }
  if (d.app_store_url) {
    const btn = document.querySelector('.app-btn');
    if (btn) btn.href = d.app_store_url;
  }
  if (d.play_store_url) {
    const btns = document.querySelectorAll('.app-btn');
    if (btns[1]) btns[1].href = d.play_store_url;
  }

  // PROMO IMAGES
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
  setBg('farm-img-main', d.farm_img_main);
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
