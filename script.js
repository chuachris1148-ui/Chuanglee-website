// Reveal on scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal, h2.title, .cap-card, .eco-node, .tl-item, .cust-channel, .stat, .prod-card, .brand-card, .cat-tile, .promo-band').forEach(el => {
  el.classList.add('reveal');
  io.observe(el);
});

// Catalogue filter
const pills = document.querySelectorAll('.cat-pill');
const cards = document.querySelectorAll('.prod-card');
const sections = document.querySelectorAll('.prod-section');
const searchEl = document.querySelector('.cat-search input');

if (pills.length) {
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const f = pill.dataset.filter;
      cards.forEach(c => {
        const show = f === 'all' || (c.dataset.cat || '').includes(f);
        c.style.display = show ? '' : 'none';
      });
      sections.forEach(s => {
        const visible = [...s.querySelectorAll('.prod-card')].some(c => c.style.display !== 'none');
        s.style.display = (f === 'all' || visible) ? '' : 'none';
      });
    });
  });
}

if (searchEl) {
  searchEl.addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    cards.forEach(c => {
      c.style.display = (!q || c.textContent.toLowerCase().includes(q)) ? '' : 'none';
    });
  });
}
