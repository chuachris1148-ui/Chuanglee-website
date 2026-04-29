/* ============================================================
   CHUANGLEE CAROUSEL ENGINE
   Handles landscape (20 images) and poster (5 images) carousels
   Images loaded from content JSON via content-loader
   ============================================================ */

/* ---- Generic landscape carousel ---- */
function initCarousel(wrapperId, images) {
  const track = document.getElementById(wrapperId + '-track');
  const dotsEl = document.getElementById(wrapperId + '-dots');
  if (!track || !images || images.length === 0) return;

  // Filter out empty slots
  const imgs = images.filter(Boolean);
  if (imgs.length === 0) return;

  let current = 0;

  // Build slides
  track.innerHTML = imgs.map((src, i) =>
    `<div class="carousel-slide" style="background-image:url('${src}')"></div>`
  ).join('');

  // Build dots
  if (dotsEl) {
    dotsEl.innerHTML = imgs.map((_, i) =>
      `<button class="c-dot ${i===0?'active':''}" onclick="goToSlide('${wrapperId}',${i})"></button>`
    ).join('');
  }

  // Store state
  track._imgs = imgs;
  track._current = 0;
  track._total = imgs.length;

  // Auto-advance every 4s
  track._timer = setInterval(() => carouselNext(wrapperId), 4000);

  updateCarousel(wrapperId);
}

function updateCarousel(wrapperId) {
  const track = document.getElementById(wrapperId + '-track');
  if (!track || !track._imgs) return;
  const i = track._current;
  track.style.transform = `translateX(-${i * 100}%)`;
  // Update dots
  const dots = document.querySelectorAll(`#${wrapperId}-dots .c-dot`);
  dots.forEach((d, idx) => d.classList.toggle('active', idx === i));
}

function carouselNext(wrapperId) {
  const track = document.getElementById(wrapperId + '-track');
  if (!track) return;
  track._current = (track._current + 1) % track._total;
  updateCarousel(wrapperId);
}

function carouselPrev(wrapperId) {
  const track = document.getElementById(wrapperId + '-track');
  if (!track) return;
  track._current = (track._current - 1 + track._total) % track._total;
  updateCarousel(wrapperId);
}

function goToSlide(wrapperId, index) {
  const track = document.getElementById(wrapperId + '-track');
  if (!track) return;
  track._current = index;
  updateCarousel(wrapperId);
}

/* ---- Poster carousel (5 vertical cards, shows 5 at once, loops) ---- */
function initPosterCarousel(wrapperId, images) {
  const track = document.getElementById(wrapperId + '-track');
  if (!track) return;

  const imgs = images ? images.filter(Boolean) : [];
  // Show 5 placeholder slots if no images yet
  if (imgs.length === 0) {
    track.innerHTML = Array(5).fill(0).map(() =>
      '<div class="poster-slide poster-empty"></div>'
    ).join('');
    return;
  }

  track.innerHTML = imgs.map(src =>
    `<div class="poster-slide" style="background-image:url('${src}')"></div>`
  ).join('');

  track._imgs = imgs;
  track._current = 0;
  track._total = imgs.length;
  track._visible = Math.min(5, imgs.length);

  // Auto-advance every 5s
  track._timer = setInterval(() => posterNext(wrapperId), 5000);

  updatePoster(wrapperId);
}

function updatePoster(wrapperId) {
  const track = document.getElementById(wrapperId + '-track');
  if (!track || !track._imgs) return;
  const slideW = 100 / track._visible;
  track.style.transform = `translateX(-${track._current * slideW}%)`;
}

function posterNext(wrapperId) {
  const track = document.getElementById(wrapperId + '-track');
  if (!track) return;
  track._current = (track._current + 1) % track._total;
  updatePoster(wrapperId);
}

function posterPrev(wrapperId) {
  const track = document.getElementById(wrapperId + '-track');
  if (!track) return;
  track._current = (track._current - 1 + track._total) % track._total;
  updatePoster(wrapperId);
}
