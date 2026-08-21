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
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  setTimeout(() => {
    preloader.classList.add('hidden');
  }, 400);
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