// Chuanglee Content Loader
// Reads content/*.json files and injects values into the HTML.
// Add data-content="key" attributes to any element you want to be editable.

async function loadContent(files) {
  const data = {};
  await Promise.all(
    files.map(async (file) => {
      try {
        const res = await fetch(`/content/${file}.json`);
        const json = await res.json();
        Object.assign(data, json);
      } catch (e) {
        console.warn(`Could not load content/${file}.json`);
      }
    })
  );
  return data;
}

function applyContent(data) {
  // Text content
  document.querySelectorAll('[data-content]').forEach((el) => {
    const key = el.dataset.content;
    if (data[key] !== undefined) {
      el.textContent = data[key];
    }
  });

  // HTML content (for italic spans etc.)
  document.querySelectorAll('[data-content-html]').forEach((el) => {
    const key = el.dataset.contentHtml;
    if (data[key] !== undefined) {
      el.innerHTML = data[key];
    }
  });

  // Href attributes
  document.querySelectorAll('[data-content-href]').forEach((el) => {
    const key = el.dataset.contentHref;
    if (data[key] !== undefined) {
      el.href = data[key];
    }
  });

  // Topbar marquee
  if (data.topbar_messages && Array.isArray(data.topbar_messages)) {
    const marquee = document.querySelector('.marquee');
    if (marquee) {
      const msgs = [...data.topbar_messages, ...data.topbar_messages]; // doubled for seamless loop
      marquee.innerHTML = msgs
        .map((m) => `<span><span class="dot"></span> ${m}</span>`)
        .join('');
    }
  }

  // Phone number (multiple places)
  if (data.phone) {
    document.querySelectorAll('.phone').forEach((el) => (el.textContent = data.phone));
    document.querySelectorAll('a[href^="tel:"]').forEach((el) => {
      el.href = `tel:${data.phone.replace(/\s/g, '')}`;
      el.textContent = data.phone;
    });
  }

  // Email
  if (data.email) {
    document.querySelectorAll('a[href^="mailto:"]').forEach((el) => {
      el.href = `mailto:${data.email}`;
      el.textContent = data.email;
    });
  }

  // Address
  if (data.address_1 || data.address_2) {
    document.querySelectorAll('[data-content="address"]').forEach((el) => {
      el.innerHTML = `${data.address_1 || ''}<br>${data.address_2 || ''}`;
    });
  }

  // Nav CTA button
  if (data.nav_cta) {
    document.querySelectorAll('.order-btn').forEach((el) => (el.textContent = data.nav_cta));
  }

  // Footer copyright
  if (data.copyright) {
    document.querySelectorAll('[data-content="copyright"]').forEach((el) => {
      el.textContent = `© ${data.copyright} Chuanglee Limited. All rights reserved.`;
    });
  }

  // Brand cards (brands page)
  if (data.brands && Array.isArray(data.brands)) {
    const grid = document.querySelector('.brands-grid');
    if (grid) {
      grid.innerHTML = data.brands
        .map(
          (b) => `
        <div class="brand-card ${b.style !== 'default' ? b.style + '-bg' : ''} ${b.style === 'dark' ? 'dark' : ''} ${b.style === 'red' ? 'red' : ''}">
          <span class="bc-num">${b.num}</span>
          <div class="bc-cjk">${b.cjk}</div>
          <h3>${b.name}</h3>
          <div class="bc-origin">${b.origin}</div>
          <p>${b.desc}</p>
          <div class="bc-foot"><span>${b.tags}</span><span class="arr">→</span></div>
        </div>`
        )
        .join('');
    }
  }

  // Stats strip
  if (data.stats && Array.isArray(data.stats)) {
    const statsInner = document.querySelector('.stats-inner');
    if (statsInner) {
      statsInner.innerHTML = data.stats
        .map(
          (s) => `
        <div class="stat reveal">
          <div class="stat-num">${s.num}</div>
          <div class="stat-label">${s.label}</div>
          <div class="stat-sub">${s.sub || ''}</div>
        </div>`
        )
        .join('');
    }
  }
}

// Page detection — load global + page-specific content
(async () => {
  const page = document.body.dataset.page || 'home';
  const data = await loadContent(['global', page]);
  applyContent(data);
})();
