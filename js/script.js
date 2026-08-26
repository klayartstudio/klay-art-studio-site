// ============================================================
// KLAY ART STUDIO
// ============================================================

// ---------- Smooth scrolling ----------
const lenis = new Lenis({
  autoRaf: true,
  autoToggle: true,
  anchors: true,
  allowNestedScroll: true,
  naiveDimensions: true,
  stopInertiaOnNavigate: true
});

// ---------- Custom cursor (desktop only) ----------
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

const cursor = document.createElement('div');
cursor.id = 'cursor';
document.body.appendChild(cursor);

document.addEventListener('mousemove', (e) => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
});

document.querySelectorAll('a').forEach(link => {
  link.addEventListener('mouseenter', () => cursor.classList.add('cursor-link'));
  link.addEventListener('mouseleave', () => cursor.classList.remove('cursor-link'));
});

// ---------- Reveal on scroll ----------
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ---------- Mobile navigation ----------
const menuToggle = document.getElementById('menu-toggle');
const nav = document.querySelector('nav');

const scrim = document.createElement('div');
scrim.id = 'nav-scrim';
document.body.appendChild(scrim);

function openNav() {
  menuToggle.classList.add('open');
  nav.classList.add('open');
  scrim.classList.add('open');
  document.body.classList.add('nav-open');
}

function closeNav() {
  menuToggle.classList.remove('open');
  nav.classList.remove('open');
  scrim.classList.remove('open');
  document.body.classList.remove('nav-open');
}

menuToggle.addEventListener('click', () => {
  if (nav.classList.contains('open')) closeNav();
  else openNav();
});

scrim.addEventListener('click', closeNav);

nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeNav);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeNav();
});

// ---------- Homepage cycling headline ----------
const words = [
  { word: 'Imagination', sub: 'Where hands shape what a photograph cannot hold.' },
  { word: 'Memory', sub: 'A print taken in clay outlasts the moment it was made from.' },
  { word: 'Legacy', sub: 'Made once, kept for longer than the maker.' },
  { word: 'Heritage', sub: 'Painted and fired the way Bengal always has.' },
  { word: 'Story', sub: 'Every piece leaves the studio already halfway to being remembered.' }
];

const cycleWord = document.getElementById('cycle-word');
const cycleSubcopy = document.getElementById('cycle-subcopy');

if (cycleWord) {
  let wordIndex = 0;
  setInterval(() => {
    cycleWord.classList.add('fade-out');
    setTimeout(() => {
      wordIndex = (wordIndex + 1) % words.length;
      cycleWord.textContent = words[wordIndex].word;
      cycleSubcopy.textContent = words[wordIndex].sub;
      cycleWord.classList.remove('fade-out');
    }, 400);
  }, 3200);
}

// ---------- Preloader ----------
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  setTimeout(() => preloader.classList.add('hidden'), 400);
});

// ---------- Image slideshows on cards ----------
const slideshows = document.querySelectorAll('[data-images]');

function startShow(el) {
  if (el.dataset.playing) return;
  const imgs = el.dataset.images.split(',');
  if (imgs.length < 2) return;
  const img = el.querySelector('img');
  let i = 0;
  el.dataset.playing = 'true';
  el.classList.add('active');
  el._timer = setInterval(() => {
    i = (i + 1) % imgs.length;
    img.src = imgs[i].trim();
  }, 900);
}

function stopShow(el) {
  clearInterval(el._timer);
  delete el.dataset.playing;
  el.classList.remove('active');
  const imgs = el.dataset.images.split(',');
  el.querySelector('img').src = imgs[0].trim();
}

if (canHover) {
  slideshows.forEach(el => {
    el.addEventListener('mouseenter', () => startShow(el));
    el.addEventListener('mouseleave', () => stopShow(el));
  });
} else {
  const showObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) startShow(entry.target);
      else stopShow(entry.target);
    });
  }, { threshold: 0.6 });
  slideshows.forEach(el => showObserver.observe(el));
}

// ---------- Contact form: prefill the piece being enquired about ----------
const pieceField = document.getElementById('piece');

if (pieceField) {
  const requested = new URLSearchParams(window.location.search).get('piece');
  if (requested) pieceField.value = requested;
}

// ---------- Keepsake pinned journey ----------
const route = document.querySelector('.route');

if (route) {
  const stops = route.querySelectorAll('.stop');
  const ticks = route.querySelectorAll('.route-tick');
  const pinned = window.matchMedia('(min-width: 901px)').matches;
  let shown = -1;

  function celebrate() {
    const badge = stops[stops.length - 1].querySelector('.stop-badge').getBoundingClientRect();
    const cx = badge.left + badge.width / 2;
    const cy = badge.top + badge.height / 2;

    for (let i = 0; i < 28; i++) {
      const dot = document.createElement('div');
      dot.className = 'spark';
      dot.style.left = cx + 'px';
      dot.style.top = cy + 'px';
      document.body.appendChild(dot);

      const angle = Math.random() * Math.PI * 2;
      const distance = 70 + Math.random() * 150;

      dot.animate([
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        {
          transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`,
          opacity: 0
        }
      ], {
        duration: 900 + Math.random() * 700,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
      }).onfinish = () => dot.remove();
    }
  }

  if (pinned) {
    const updatePinned = () => {
      const box = route.getBoundingClientRect();
      const travel = route.offsetHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(-box.top / travel, 1));
      const index = Math.min(Math.floor(progress * stops.length), stops.length - 1);

      if (index === shown) return;
      shown = index;

      stops.forEach((s, n) => s.classList.toggle('current', n === index));
      ticks.forEach((t, n) => t.classList.toggle('done', n <= index));

      if (index === stops.length - 1) setTimeout(celebrate, 500);
    };

    window.addEventListener('scroll', updatePinned, { passive: true });
    updatePinned();
  } else {
    const mobileObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        if (entry.target === stops[stops.length - 1]) setTimeout(celebrate, 500);
      });
    }, { threshold: 0.4 });

    stops.forEach(stop => mobileObserver.observe(stop));
  }
}

// ---------- Draggable marquee ----------
const track = document.querySelector('.marquee-track');

if (track) {
  const width = track.scrollWidth / 2;
  const drift = -0.45;
  let offset = 0;
  let velocity = 0;
  let dragging = false;
  let hovering = false;
  let lastX = 0;
  let startX = 0;

  function tick() {
    if (!dragging) {
      if (Math.abs(velocity) > 0.05) {
        offset += velocity;
        velocity *= 0.95;
      } else if (!hovering) {
        offset += drift;
      }
    }

    if (offset <= -width) offset += width;
    if (offset > 0) offset -= width;

    track.style.transform = `translateX(${offset}px)`;
    requestAnimationFrame(tick);
  }

  function grab(x) {
    dragging = true;
    velocity = 0;
    startX = x;
    lastX = x;
    track.classList.add('dragging');
  }

  function move(x) {
    if (!dragging) return;
    const delta = x - lastX;
    offset += delta;
    velocity = delta;
    lastX = x;
  }

  function release() {
    if (!dragging) return;
    dragging = false;
    track.classList.remove('dragging');
  }

  track.addEventListener('mouseenter', () => { hovering = true; });
  track.addEventListener('mouseleave', () => { hovering = false; release(); });

  track.addEventListener('mousedown', (e) => { e.preventDefault(); grab(e.clientX); });
  window.addEventListener('mousemove', (e) => move(e.clientX));
  window.addEventListener('mouseup', release);

  track.addEventListener('touchstart', (e) => grab(e.touches[0].clientX), { passive: true });
  track.addEventListener('touchmove', (e) => move(e.touches[0].clientX), { passive: true });
  track.addEventListener('touchend', release);

  track.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
      if (Math.abs(lastX - startX) > 5) e.preventDefault();
    });
  });

  tick();
}

// ---------- Idle auto-scroll ----------
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasPinnedSection = !!document.querySelector('.route');
let idleTimer;
let drifting = false;

function startDrift() {
  if (reduceMotion || hasPinnedSection) return;
  const remaining = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
  if (remaining < 60) return;
  drifting = true;
  lenis.scrollTo(document.documentElement.scrollHeight, {
    duration: remaining / 20,
    easing: (t) => t
  });
}

function stopDrift() {
  if (!drifting) return;
  lenis.scrollTo(window.scrollY, { immediate: true });
  drifting = false;
}

function resetIdle() {
  stopDrift();
  clearTimeout(idleTimer);
  idleTimer = setTimeout(startDrift, 12000);
}

['wheel', 'touchstart', 'keydown', 'mousedown', 'mousemove'].forEach(evt => {
  window.addEventListener(evt, resetIdle, { passive: true });
});

resetIdle();