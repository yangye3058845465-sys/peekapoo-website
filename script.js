// Sticky nav border + mobile menu
const nav = document.querySelector('.nav');
const burger = document.querySelector('.nav__burger');
const mobile = document.querySelector('.nav__mobile');

addEventListener('scroll', () => nav.classList.toggle('is-scrolled', scrollY > 8), { passive: true });

burger.addEventListener('click', () => {
  const open = burger.getAttribute('aria-expanded') === 'true';
  burger.setAttribute('aria-expanded', String(!open));
  mobile.hidden = open;
});
mobile.addEventListener('click', e => {
  if (e.target.tagName === 'A') { mobile.hidden = true; burger.setAttribute('aria-expanded', 'false'); }
});

// Reveal on scroll; rings fill and numbers count up when their card appears
const animateRing = ring => {
  ring.style.setProperty('--p', Number(ring.dataset.value) / 100);
  const num = ring.querySelector('.ring__num');
  if (!num) return;
  const target = Number(num.dataset.count);
  const t0 = performance.now();
  const tick = t => {
    const k = Math.min(1, (t - t0) / 1600);
    num.textContent = Math.round(target * (1 - Math.pow(1 - k, 3)));
    if (k < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

const io = new IntersectionObserver(entries => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    e.target.classList.add('is-in');
    e.target.querySelectorAll('.ring').forEach(animateRing);
    io.unobserve(e.target);
  }
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// App showcase tabs
const screens = {
  home:    ['assets/app-home.png', 'PeekaPoo homescreen'],
  chat:    ['assets/app-chat.png', 'PeekaPoo AI chat assistant'],
  dash:    ['assets/app-dashboard.png', 'Gut health index dashboard with Bristol type chart'],
  stool:   ['assets/app-stool.png', 'Stool type detail card'],
  signals: ['assets/app-signals.png', 'Urine colour and gas signal charts'],
};
const showImg = document.getElementById('showcase-img');
const tabs = document.querySelectorAll('.showcase__tabs [role="tab"]');
if (showImg) {
  tabs.forEach(tab => tab.addEventListener('click', () => {
    const key = tab.dataset.tab;
    tabs.forEach(t => t.setAttribute('aria-selected', String(t === tab)));
    document.querySelectorAll('.showcase__panel').forEach(p => p.classList.toggle('is-active', p.dataset.panel === key));
    showImg.classList.add('is-fading');
    setTimeout(() => {
      [showImg.src, showImg.alt] = screens[key];
      showImg.onload = () => showImg.classList.remove('is-fading');
    }, 180);
  }));
  Object.values(screens).forEach(([src]) => { new Image().src = src; });
}

// Questions band: arrows + dots
const track = document.getElementById('quotes-track');
const dots = document.getElementById('quotes-dots');
if (track) {
  const pages = () => Math.max(1, Math.ceil(track.scrollWidth / track.clientWidth));
  const renderDots = () => {
    const n = pages();
    const cur = Math.round(track.scrollLeft / track.clientWidth);
    dots.innerHTML = Array.from({ length: n }, (_, i) => `<i class="${i === cur ? 'is-on' : ''}"></i>`).join('');
  };
  document.querySelectorAll('.quotes__btn').forEach(btn => btn.addEventListener('click', () => {
    track.scrollBy({ left: Number(btn.dataset.dir) * track.clientWidth * 0.9, behavior: 'smooth' });
  }));
  track.addEventListener('scroll', renderDots, { passive: true });
  addEventListener('resize', renderDots);
  renderDots();
}

// How it works: accordion drives the photo stage; the progress bar's animationend advances to the next step
const how = document.querySelector('.how');
if (how) {
  const howItems = [...how.querySelectorAll('.how__item')];
  const howPhotos = [...how.querySelectorAll('.how__photo')];
  const setStep = i => {
    howItems.forEach((item, k) => {
      item.classList.toggle('is-active', k === i);
      item.querySelector('.how__head').setAttribute('aria-expanded', String(k === i));
    });
    howPhotos.forEach((ph, k) => ph.classList.toggle('is-active', k === i));
  };
  howItems.forEach((item, i) => {
    item.querySelector('.how__head').addEventListener('click', () => setStep(i));
    item.querySelector('.how__bar i').addEventListener('animationend', () => setStep((i + 1) % howItems.length));
  });
  const howGrid = how.querySelector('.how__grid');
  howGrid.addEventListener('mouseenter', () => how.classList.add('is-paused'));
  howGrid.addEventListener('mouseleave', () => how.classList.remove('is-paused'));
  howGrid.addEventListener('focusin', () => how.classList.add('is-paused'));
  howGrid.addEventListener('focusout', () => how.classList.remove('is-paused'));
  // Only run the timer while the section is on screen
  new IntersectionObserver(([e]) => how.classList.toggle('is-offscreen', !e.isIntersecting)).observe(how);
}

// "No more guessing" tiles: the hovered / focused / tapped tile widens and shows its copy
const tiles = [...document.querySelectorAll('.tile')];
const openTile = t => tiles.forEach(x => x.classList.toggle('is-open', x === t));
tiles.forEach(t => {
  t.addEventListener('mouseenter', () => openTile(t));
  t.addEventListener('focus', () => openTile(t));
  t.addEventListener('click', () => openTile(t));
});

// Hero film: pause/play control, respects reduced motion, and stops decoding while off screen
const heroVideo = document.querySelector('.hero__video');
if (heroVideo) {
  const toggle = document.querySelector('.hero__toggle');
  let userPaused = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sync = () => {
    toggle.setAttribute('aria-pressed', String(userPaused));
    toggle.setAttribute('aria-label', userPaused ? 'Play background video' : 'Pause background video');
  };
  if (userPaused) heroVideo.pause();
  sync();
  toggle.addEventListener('click', () => {
    userPaused = !userPaused;
    userPaused ? heroVideo.pause() : heroVideo.play().catch(() => {});
    sync();
  });
  new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) heroVideo.pause();
    else if (!userPaused) heroVideo.play().catch(() => {});
  }).observe(heroVideo);
}
