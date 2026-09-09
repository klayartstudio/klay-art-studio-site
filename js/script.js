// ============================================================
// KLAY ART STUDIO
// ============================================================

// ---------- Cookie consent + analytics ----------
(function () {
  const GA_ID = 'G-D7V2GVJXQY';
  const consent = localStorage.getItem('cookie-consent');
  const banner = document.getElementById('cookie-consent');

  function loadAnalytics() {
    if (window.gaLoaded) return;
    window.gaLoaded = true;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID);
  }

  if (consent === 'accepted') loadAnalytics();

  if (banner) {
    if (consent) {
      banner.remove();
    } else {
      banner.classList.add('visible');

      document.getElementById('cookie-accept')?.addEventListener('click', () => {
        localStorage.setItem('cookie-consent', 'accepted');
        banner.classList.remove('visible');
        loadAnalytics();
      });

      document.getElementById('cookie-decline')?.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.setItem('cookie-consent', 'declined');
        banner.classList.remove('visible');
      });
    }
  }
})();

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

let lastMouseX = 0;
let lastMouseY = 0;

document.addEventListener('mousemove', (e) => {
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
});

document.querySelectorAll('a, button').forEach(link => {
  link.addEventListener('mouseenter', () => cursor.classList.add('cursor-link'));
  link.addEventListener('mouseleave', () => cursor.classList.remove('cursor-link'));
});

// ---------- Magnifier on content images ----------
// The dot cursor's mix-blend-mode looks inconsistent over full-colour
// photos and artwork, so images swap it for a proper magnifying loupe
// instead — a zoomed circular preview centred on the pointer, so
// visitors can actually look closer at a detail rather than the cursor
// just trying (and failing) to stay visible against the image.
//
// Starts on a plain mouseenter (reliable, a single clean transition —
// a continuous per-frame "is a new image now under the cursor" check
// was tried here and reverted, because it could flicker between the
// dot and the loupe from one frame to the next when detection wasn't
// perfectly stable, and while both are transitioning the difference-
// blend dot ends up compositing on top of the magnified photo, which
// looks like broken/inverted colour). Once active, a per-frame check
// (rather than mouseleave alone) confirms the cursor is still actually
// over the image, since Lenis drives scrolling — including touchpad
// scroll — as its own animation rather than native scrolling and
// doesn't reliably fire the events an element-based approach would
// depend on for noticing the cursor scrolled past the image.
if (canHover) {
  const MAGNIFY_ZOOM = 2;
  const MIN_MAGNIFY_SIZE = 120; // skip small avatars/icons

  const magnifier = document.createElement('div');
  magnifier.id = 'magnifier';
  document.body.appendChild(magnifier);

  let magnifiedImg = null;

  function getContentRect(img) {
    const rect = img.getBoundingClientRect();
    if (getComputedStyle(img).objectFit !== 'contain' || !img.naturalWidth) return rect;

    const scale = Math.min(rect.width / img.naturalWidth, rect.height / img.naturalHeight);
    const width = img.naturalWidth * scale;
    const height = img.naturalHeight * scale;

    return {
      left: rect.left + (rect.width - width) / 2,
      top: rect.top + (rect.height - height) / 2,
      width,
      height
    };
  }

  function isWithin(x, y, rect) {
    // Computed from left/top/width/height rather than reading
    // rect.right/rect.bottom: getContentRect's own return value for a
    // letterboxed image is a plain object with only those four
    // properties, so .right/.bottom would be undefined there and this
    // would silently always evaluate false.
    return x >= rect.left && x <= rect.left + rect.width && y >= rect.top && y <= rect.top + rect.height;
  }

  function positionMagnifier(img, rect) {
    magnifier.style.backgroundImage = `url("${img.currentSrc || img.src}")`;

    const xPct = (lastMouseX - rect.left) / rect.width;
    const yPct = (lastMouseY - rect.top) / rect.height;
    const bgWidth = rect.width * MAGNIFY_ZOOM;
    const bgHeight = rect.height * MAGNIFY_ZOOM;
    const half = magnifier.offsetWidth / 2;

    magnifier.style.left = lastMouseX + 'px';
    magnifier.style.top = lastMouseY + 'px';
    magnifier.style.backgroundSize = `${bgWidth}px ${bgHeight}px`;
    magnifier.style.backgroundPosition =
      `${-(xPct * bgWidth - half)}px ${-(yPct * bgHeight - half)}px`;
  }

  function stopMagnify() {
    magnifiedImg = null;
    magnifier.classList.remove('visible');
    cursor.classList.remove('cursor-hidden');
  }

  document.querySelectorAll('img').forEach((img) => {
    img.addEventListener('mouseenter', (e) => {
      if (img.offsetWidth < MIN_MAGNIFY_SIZE || img.offsetHeight < MIN_MAGNIFY_SIZE) return;
      // Use this event's own coordinates, not the separately-tracked
      // lastMouseX/Y — a native mouseenter can fire before the mousemove
      // that would update those, so they may still hold the cursor's
      // previous position rather than where it just arrived.
      if (!isWithin(e.clientX, e.clientY, getContentRect(img))) return;
      magnifiedImg = img;
      magnifier.classList.add('visible');
      cursor.classList.add('cursor-hidden');
    });
  });

  (function tick() {
    // Lives inside a try/catch so a single unexpected frame (a
    // transient DOM/layout edge case mid-navigation, say) can never
    // silently kill the loop for the rest of the visit — the next
    // requestAnimationFrame is always scheduled regardless.
    try {
      if (magnifiedImg) {
        const rect = getContentRect(magnifiedImg);
        if (isWithin(lastMouseX, lastMouseY, rect)) {
          positionMagnifier(magnifiedImg, rect);
        } else {
          stopMagnify();
        }
      }
    } catch (err) {
      /* transient — the next frame retries */
    }

    requestAnimationFrame(tick);
  })();
}

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

// ---------- Offline / repeat-visit caching ----------
if ('serviceWorker' in navigator) {
  // If this page load was already controlled by a service worker, a
  // later 'controllerchange' means a newer one just took over — reload
  // once so the page actually picks up the new files immediately,
  // instead of leaving stale cached CSS/JS in place until the visitor
  // happens to hard-refresh. Skipped on a visitor's very first-ever
  // visit, since there's no older version to be stuck on yet.
  const hadController = !!navigator.serviceWorker.controller;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });

  if (hadController) {
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    });
  }
}

// ---------- Preloader ----------
// Hides as soon as the page's own markup is ready, rather than waiting for
// every image on the page to finish downloading (which, on a slow mobile
// connection with a gallery of large photos, could otherwise leave the
// preloader stuck on screen for a long time). A hard timeout is also set
// as a safety net so it can never hang indefinitely.
(() => {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  let hidden = false;
  function hidePreloader() {
    if (hidden) return;
    hidden = true;
    preloader.classList.add('hidden');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(hidePreloader, 300));
  } else {
    setTimeout(hidePreloader, 300);
  }

  setTimeout(hidePreloader, 2000);
})();

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
  }, 2200);
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

// ---------- Contact form: continue to WhatsApp with the filled-in message ----------
const whatsappBtn = document.getElementById('whatsapp-send');

if (whatsappBtn) {
  whatsappBtn.addEventListener('click', () => {
    const name = document.getElementById('name')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const piece = document.getElementById('piece')?.value.trim();
    const message = document.getElementById('message')?.value.trim();

    const lines = [];
    if (name) lines.push(`Name: ${name}`);
    if (email) lines.push(`Email: ${email}`);
    if (piece) lines.push(`Piece of interest: ${piece}`);
    if (message) lines.push(`Message: ${message}`);

    const text = lines.length
      ? lines.join('\n')
      : 'Hello, I have a question for Klay Art Studio.';

    window.open(`https://wa.me/8801717882222?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  });
}

// ---------- Keepsake pinned journey ----------
const route = document.querySelector('.route');

if (route) {
  const stops = route.querySelectorAll('.stop');
  const ticks = route.querySelectorAll('.route-tick');
  // Re-checked live via a matchMedia listener rather than read once, so
  // crossing the 901px breakpoint mid-session (resizing the window,
  // opening/closing a browser extension's side panel, rotating a
  // tablet) switches modes cleanly instead of leaving the JS running
  // the wrong logic for the CSS layout that's actually showing.
  const mql = window.matchMedia('(min-width: 901px)');
  let shown = -1;
  let celebrated = false;
  let teardown = null;

  function celebrate() {
    if (celebrated) return;
    celebrated = true;

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

  function resetStops() {
    shown = -1;
    celebrated = false;
    stops.forEach(s => s.classList.remove('current', 'visible'));
    ticks.forEach(t => t.classList.remove('done'));
  }

  function setupPinned() {
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

    return () => window.removeEventListener('scroll', updatePinned);
  }

  function setupMobile() {
    const mobileObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        if (entry.target === stops[stops.length - 1]) setTimeout(celebrate, 500);
      });
    }, { threshold: 0.4 });

    stops.forEach(stop => mobileObserver.observe(stop));

    return () => mobileObserver.disconnect();
  }

  function applyMode(pinned) {
    if (teardown) teardown();
    resetStops();
    teardown = pinned ? setupPinned() : setupMobile();
  }

  applyMode(mql.matches);
  mql.addEventListener('change', (e) => applyMode(e.matches));
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