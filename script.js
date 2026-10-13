'use strict';
(() => {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const menu = document.getElementById('chapterMenu');
  const toggle = document.getElementById('menuToggle');
  const previous = document.getElementById('prevSlide');
  const next = document.getElementById('nextSlide');
  const count = document.getElementById('chapterCount');
  const name = document.getElementById('chapterName');
  const progress = document.getElementById('progressBar');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let active = 0;
  slides.forEach((slide, i) => {
    const link = document.createElement('a');
    link.href = '#' + slide.id;
    const number = document.createElement('span');
    number.textContent = String(i + 1).padStart(2, '0');
    link.append(number, document.createTextNode(slide.dataset.title));
    menu.append(link);
  });
  const chapterLinks = Array.from(menu.querySelectorAll('a'));
  const closeMenu = () => { menu.hidden = true; toggle.setAttribute('aria-expanded', 'false'); };
  toggle.addEventListener('click', () => {
    const open = menu.hidden;
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    if (open) chapterLinks[active].focus();
  });
  document.addEventListener('click', event => {
    if (!menu.hidden && !menu.contains(event.target) && !toggle.contains(event.target)) closeMenu();
  });
  menu.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  function renderPosition() {
    const line = window.innerHeight * 0.33;
    let index = 0;
    slides.forEach((slide, i) => { if (slide.getBoundingClientRect().top <= line) index = i; });
    active = index;
    count.textContent = String(index + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
    name.textContent = slides[index].dataset.title;
    previous.disabled = index === 0;
    next.disabled = index === slides.length - 1;
    progress.style.width = ((index + 1) / slides.length * 100) + '%';
    chapterLinks.forEach((link, i) => link.setAttribute('aria-current', String(i === index)));
  }
  let pending = false;
  window.addEventListener('scroll', () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { renderPosition(); pending = false; });
  }, { passive: true });
  window.addEventListener('resize', renderPosition);
  function go(index) {
    const target = slides[Math.max(0, Math.min(slides.length - 1, index))];
    history.replaceState(null, '', '#' + target.id);
    target.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
  }
  previous.addEventListener('click', () => go(active - 1));
  next.addEventListener('click', () => go(active + 1));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) { closeMenu(); toggle.focus(); return; }
    if (event.altKey || event.ctrlKey || event.metaKey || !menu.hidden) return;
    if (event.target.closest('input,textarea,select,button,a,summary,[role="tab"],[contenteditable="true"]')) return;
    if (event.key === 'ArrowRight') { event.preventDefault(); go(active + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); go(active - 1); }
  });
  const flip = document.getElementById('flipCard');
  flip.addEventListener('click', () => {
    const flipped = flip.classList.toggle('flipped');
    flip.setAttribute('aria-pressed', String(flipped));
    flip.setAttribute('aria-label', flipped ? 'Turn the sample reward card to its front' : 'Turn the sample reward card over');
  });
  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
  const panels = Array.from(document.querySelectorAll('[role="tabpanel"]'));
  function selectTab(index, focus) {
    tabs.forEach((tab, i) => { tab.setAttribute('aria-selected', String(i === index)); tab.tabIndex = i === index ? 0 : -1; });
    panels.forEach((panel, i) => { panel.hidden = i !== index; });
    if (focus) tabs[index].focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(index, false));
    tab.addEventListener('keydown', event => {
      let dest = index;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') dest = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') dest = (index + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') dest = 0;
      else if (event.key === 'End') dest = tabs.length - 1;
      else return;
      event.preventDefault(); selectTab(dest, true);
    });
  });
  const sources = document.querySelector('.sources');
  function revealSource(hash) {
    if (!hash.startsWith('#source-')) return;
    const target = document.getElementById(hash.slice(1));
    if (!target) return;
    sources.open = true;
    requestAnimationFrame(() => target.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth' }));
  }
  document.querySelectorAll('a[href^="#source-"]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    history.pushState(null, '', link.getAttribute('href'));
    revealSource(link.getAttribute('href'));
  }));
  window.addEventListener('hashchange', () => revealSource(location.hash));
  let sourceOpenBeforePrint = false;
  window.addEventListener('beforeprint', () => { sourceOpenBeforePrint = sources.open; sources.open = true; });
  window.addEventListener('afterprint', () => { sources.open = sourceOpenBeforePrint; });
  document.getElementById('printDeck').addEventListener('click', () => window.print());
  revealSource(location.hash);
  renderPosition();
})();