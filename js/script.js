new Lenis({
  autoRaf: true,
  autoToggle: true,
  anchors: true,
  allowNestedScroll: true,
  naiveDimensions: true,
  stopInertiaOnNavigate: true
});

const cursor = document.createElement('div');
cursor.id = 'cursor';
document.body.appendChild(cursor);

document.addEventListener('mousemove', (e) => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
});

const links = document.querySelectorAll('a');
links.forEach(link => {
  link.addEventListener('mouseenter', () => cursor.classList.add('cursor-link'));
  link.addEventListener('mouseleave', () => cursor.classList.remove('cursor-link'));
});

const revealElements = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.15 });

revealElements.forEach(el => observer.observe(el));

const menuToggle = document.getElementById('menu-toggle');
const nav = document.querySelector('nav');

menuToggle.addEventListener('click', () => {
  menuToggle.classList.toggle('open');
  nav.classList.toggle('open');
});

const words = [
  { word: 'Imagination', sub: 'Where hands shape what a photograph cannot hold.' },
  { word: 'Memory', sub: 'A print taken in clay outlasts the moment it was made from.' },
  { word: 'Legacy', sub: 'Made once, kept for longer than the maker.' },
  { word: 'Heritage', sub: 'Painted and fired the way Bengal always has.' },
  { word: 'Story', sub: 'Every piece leaves the studio already halfway to being remembered.' }
];

let wordIndex = 0;
const cycleWord = document.getElementById('cycle-word');
const cycleSubcopy = document.getElementById('cycle-subcopy');

if (cycleWord) {
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

window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  setTimeout(() => {
    preloader.classList.add('hidden');
  }, 400);
});

const slideshows = document.querySelectorAll('[data-images]');

function startShow(el) {
  if (el.dataset.playing) return;
  const imgs = el.dataset.images.split(',');
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

const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

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