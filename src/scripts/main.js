/* Headturner landing page interactions
   - Lenis smooth scroll, synced with GSAP ScrollTrigger
   - Hero visual load animation
   - Logo marquee (CSS animation, track duplicated here for a seamless loop)
   - Scroll-scrubbed text reveal in "What I believe"
   - Scroll-triggered card stack in the CTA section
   - FAQ accordion
   - Fixed nav state + mobile menu */

(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (!reduceMotion && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    if (hasGsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  // In-page links: smooth scroll with room for the fixed nav
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const id = link.getAttribute('href');
      if (id === '#') { event.preventDefault(); return; }
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      closeMenu();
      if (lenis) lenis.scrollTo(target, { offset: id === '#top' ? 0 : -96, duration: 1.2 });
      else target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  /* ---------- Nav ---------- */
  const nav = document.querySelector('[data-nav]');
  const toggle = document.querySelector('[data-nav-toggle]');
  const links = document.getElementById('nav-links');

  const setScrolled = (y) => nav.classList.toggle('is-scrolled', y > 24);
  setScrolled(window.scrollY);
  if (lenis) lenis.on('scroll', ({ scroll }) => setScrolled(scroll));
  else window.addEventListener('scroll', () => setScrolled(window.scrollY), { passive: true });

  function closeMenu() {
    if (!toggle) return;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    links.classList.remove('is-open');
  }
  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    links.classList.toggle('is-open', open);
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  /* ---------- Logo marquee ---------- */
  document.querySelectorAll('[data-marquee] .marquee__track').forEach((track) => {
    [...track.children].forEach((logo) => {
      const copy = logo.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      copy.alt = '';
      track.appendChild(copy);
    });
  });

  /* ---------- FAQ ---------- */
  document.querySelectorAll('[data-faq] .faq-item').forEach((item) => {
    const button = item.querySelector('.faq-item__q');
    button.addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      item.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', String(open));
      // Layout below changes height; let pinned sections recalculate
      if (hasGsap) setTimeout(() => ScrollTrigger.refresh(), 500);
    });
  });

  /* ---------- Ads carousel: continuous, seamless auto-scroll + arrows, dots and pause ----------
     The ad set is cloned once after itself, so the track can glide forever: when it has moved
     one full set, it jumps back by exactly that width, which is invisible.
     Glides at SPEED px/s; holds while hovered, focused, off-screen, for a moment after the
     visitor uses it, or when paused (pause button: WCAG 2.2.2). Starts paused for reduced motion. */
  document.querySelectorAll('[data-carousel]').forEach((carousel) => {
    const SPEED = 85;
    const track = carousel.querySelector('[data-carousel-track]');
    const items = [...track.children];
    const n = items.length;
    const prev = carousel.querySelector('[data-carousel-prev]');
    const next = carousel.querySelector('[data-carousel-next]');
    const dotsWrap = carousel.querySelector('[data-carousel-dots]');
    const toggle = carousel.querySelector('[data-carousel-toggle]');
    const behavior = reduceMotion ? 'auto' : 'smooth';

    items.forEach((item) => {
      const copy = item.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      copy.removeAttribute('role'); copy.removeAttribute('aria-label');
      copy.querySelectorAll('img').forEach((img) => { img.alt = ''; });
      track.appendChild(copy);
    });
    track.style.scrollSnapType = 'none';

    const step = () => items[1].offsetLeft - items[0].offsetLeft;
    const setWidth = () => n * step();
    const index = () => Math.round(track.scrollLeft / step());

    const dots = items.map((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel__dot';
      dot.setAttribute('aria-label', `Go to ad ${i + 1} of ${n}`);
      dot.addEventListener('click', () => {
        touched();
        const W = setWidth(), here = track.scrollLeft;
        const a = i * step(), b = a + W;
        track.scrollTo({ left: Math.abs(a - here) <= Math.abs(b - here) ? a : b, behavior });
      });
      dotsWrap.appendChild(dot);
      return dot;
    });
    const update = () => {
      const i = ((index() % n) + n) % n;
      dots.forEach((d, j) => { d.classList.toggle('is-active', j === i); d.setAttribute('aria-current', j === i ? 'true' : 'false'); });
    };

    const go = (dir) => {
      touched();
      let i = index() + dir;
      if (i < 0) { track.scrollLeft += setWidth(); i += n; }
      track.scrollTo({ left: i * step(), behavior });
    };
    prev.addEventListener('click', () => go(-1));
    next.addEventListener('click', () => go(1));
    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    });
    track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });

    let paused = reduceMotion, hovered = false, focused = false, visible = false, lastTouch = 0;
    function touched() { lastTouch = performance.now(); }
    const setPaused = (p) => {
      paused = p;
      toggle.setAttribute('aria-pressed', String(p));
      toggle.setAttribute('aria-label', p ? 'Play auto-scroll' : 'Pause auto-scroll');
    };
    setPaused(paused);
    toggle.addEventListener('click', () => setPaused(!paused));
    carousel.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') hovered = true; });
    carousel.addEventListener('pointerleave', () => { hovered = false; });
    carousel.addEventListener('focusin', (e) => { if (e.target !== toggle && e.target.matches(':focus-visible')) focused = true; });
    carousel.addEventListener('focusout', () => { focused = false; });
    ['pointerdown', 'wheel', 'touchstart'].forEach((t) => track.addEventListener(t, touched, { passive: true }));
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0.2 }).observe(track);

    let pos = 0, last = performance.now();
    const loop = (now) => {
      const dt = Math.min(64, now - last); last = now;
      const W = setWidth();
      const running = !paused && !hovered && !focused && visible && now - lastTouch > 2500;
      if (running) {
        pos += SPEED * dt / 1000;
        if (pos >= W) pos -= W;
        track.scrollLeft = pos;
      } else {
        // Follow manual scrolling, and keep the position inside the first set
        if (track.scrollLeft >= W && now - lastTouch > 800) track.scrollLeft -= W;
        pos = track.scrollLeft;
      }
      requestAnimationFrame(loop);
    };
    update();
    requestAnimationFrame(loop);
  });

  /* ---------- Hero feed: scale to fit narrow screens ----------
     The feed is 343px wide and the chips stick out ~19px left and ~30px right,
     so it needs ~400px plus breathing room. Below that, shrink it proportionally. */
  const heroVisual = document.querySelector('.hero__visual');
  if (heroVisual) {
    const fitFeed = () => heroVisual.style.setProperty('--feed-scale', Math.min(1, (heroVisual.clientWidth - 32) / 400).toFixed(3));
    new ResizeObserver(fitFeed).observe(heroVisual);
    fitFeed();
  }

  /* ---------- Upcoming event: filled from data-event-date / data-event-place ---------- */
  document.querySelectorAll('[data-event]').forEach((section) => {
    const iso = section.dataset.eventDate;
    const place = section.dataset.eventPlace || '';
    const date = iso ? new Date(`${iso}T00:00:00`) : null;
    if (!date || isNaN(date)) return;
    // Hide the block from the day after the event (brief: "Hide the block when there's no active initiative")
    const dayAfter = new Date(date); dayAfter.setDate(dayAfter.getDate() + 1);
    if (new Date() >= dayAfter) { section.hidden = true; return; }
    const day = String(date.getDate());
    const month = date.toLocaleDateString('en-GB', { month: 'long' });
    section.querySelector('[data-event-day]').textContent = day;
    section.querySelector('[data-event-month]').textContent = month;
    section.querySelector('[data-event-place-text]').textContent = place;
    const when = section.querySelector('[data-event-when]');
    if (when) when.textContent = [`${day} ${month}`, place].filter(Boolean).join(', ');
  });

  if (!hasGsap || reduceMotion) return;

  /* ---------- Founder card: subtle 3D tilt on hover ----------
     Based on the vanilla-tilt "Example 2" setup (plain tilt, no glare, no scale),
     with the angle cut from 25° to 6° to keep it quiet. Mouse devices only. Starts
     after the hero intro so it doesn't fight GSAP for the card's transform. */
  function tilt(el, max) {
    if (!el || el.vanillaTilt || typeof window.VanillaTilt === 'undefined') return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    VanillaTilt.init(el, {
      max,
      perspective: 1000,
      speed: 600,
      scale: 1,
      glare: false,
      gyroscope: false,
      easing: 'cubic-bezier(.03,.98,.52,.99)',
    });
  }
  function initTilt() { tilt(document.querySelector('.founder-card'), 6); }
  /* ---------- Playbook book: 3D object ----------
     - idle: floats gently, its shadow breathing underneath
     - pointer anywhere on the card: the book turns towards the cursor (stronger over the book itself),
       the shadow slides the opposite way and a glare, masked to the book's shape, follows the light
     - click: focuses the email field with a small hop, since the book is what people are signing up for
     Layers: [data-book] position > .book__float (float) > [data-book-tilt] (rotation) > [data-stack-media] (scroll zoom) */
  (() => {
    const book = document.querySelector('[data-book]');
    if (!book) return;
    const card = book.closest('.playbook-card');
    const float = book.querySelector('.book__float');
    const tiltEl = book.querySelector('[data-book-tilt]');
    const shadow = book.querySelector('.book__shadow');
    const glare = book.querySelector('.book__glare');

    gsap.to(float, { y: -12, rotation: 1.2, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    gsap.to(shadow, { scaleX: 0.86, opacity: 0.6, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });

    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      gsap.set(tiltEl, { transformPerspective: 900, transformOrigin: '50% 50%' });
      const rotY = gsap.quickTo(tiltEl, 'rotationY', { duration: 0.7, ease: 'power3.out' });
      const rotX = gsap.quickTo(tiltEl, 'rotationX', { duration: 0.7, ease: 'power3.out' });
      const scale = gsap.quickTo(tiltEl, 'scale', { duration: 0.5, ease: 'power3.out' });
      const shadowX = gsap.quickTo(shadow, 'x', { duration: 0.7, ease: 'power3.out' });

      card.addEventListener('pointermove', (e) => {
        const r = book.getBoundingClientRect();
        const over = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
        // -1…1 relative to the book, clamped so far-away cursors don't over-rotate
        const dx = gsap.utils.clamp(-1, 1, (e.clientX - (r.left + r.width / 2)) / (r.width * 0.7));
        const dy = gsap.utils.clamp(-1, 1, (e.clientY - (r.top + r.height / 2)) / (r.height * 0.6));
        const strength = over ? 1 : 0.45;
        rotY(dx * 22 * strength);
        rotX(-dy * 14 * strength);
        scale(over ? 1.05 : 1);
        shadowX(-dx * 18 * strength);
        glare.style.setProperty('--gx', `${50 + dx * 50}%`);
        glare.style.setProperty('--gy', `${50 + dy * 50}%`);
        glare.classList.toggle('is-on', over);
      });
      card.addEventListener('pointerleave', () => { rotY(0); rotX(0); scale(1); shadowX(0); glare.classList.remove('is-on'); });
    }

    book.addEventListener('click', () => {
      gsap.fromTo(float, { scale: 1 }, { scale: 1.06, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out' });
      card.querySelector('input[type="email"]')?.focus({ preventScroll: true });
    });
  })();

  /* ---------- Hero visual: load animation ---------- */
  const posts = gsap.utils.toArray('[data-hero-post]');
  const marks = gsap.utils.toArray('[data-mark-grid] img');
  const coral = document.querySelector('[data-mark-coral]');
  const chips = gsap.utils.toArray('[data-hero-chip]');
  const tagline = document.querySelector('[data-hero-tagline]');

  const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.15 });
  intro
    .from('.hero__copy > *', { y: 24, opacity: 0, duration: 0.9, stagger: 0.12, clearProps: 'transform', onComplete: initTilt }, 0)
    .from(posts, { y: 60, opacity: 0, duration: 1, stagger: 0.12 }, 0.1)
    .from(posts[1], { scale: 0.94, duration: 1.1, ease: 'power2.out' }, 0.2)
    .from(marks, { scale: 0, opacity: 0, duration: 0.45, ease: 'back.out(2)', stagger: { each: 0.025, from: 'random' } }, 0.55)
    .fromTo(coral, { scale: 1 }, { scale: 1.35, duration: 0.25, yoyo: true, repeat: 1, ease: 'power2.inOut' }, '>-0.05')
    .from(tagline, { y: 12, opacity: 0, duration: 0.6 }, '<')
    .from(chips, { scale: 0, opacity: 0, duration: 0.6, ease: 'back.out(2.2)', stagger: 0.18 }, '<0.1')
    .add(() => {
      // Gentle idle float on the two chips once the intro has finished
      chips.forEach((chip, i) => {
        gsap.to(chip, { y: i ? 6 : -6, duration: 2.4 + i * 0.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      });
    });

  /* ---------- What I believe: scroll-scrubbed word reveal ---------- */
  const words = [];
  document.querySelectorAll('[data-reveal-text]').forEach((p) => {
    const parts = p.textContent.trim().split(/(\s+)/);
    p.textContent = '';
    parts.forEach((part) => {
      if (/^\s+$/.test(part)) { p.appendChild(document.createTextNode(part)); return; }
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = part;
      p.appendChild(span);
      words.push(span);
    });
  });

  const believe = gsap.timeline({
    scrollTrigger: { trigger: '.believe__body', start: 'top 75%', end: 'bottom 35%', scrub: 0.6 },
  });
  believe
    .to(words, { color: '#1b1a20', stagger: 0.1, ease: 'none' })
    .fromTo('[data-reveal-line]', { opacity: 0.2 }, { opacity: 1, duration: 1.5, ease: 'none' });

  /* ---------- CTA stacking cards ----------
     Same model as ui-layouts "Stacking Card": stack progress runs 0→1 from the
     stack's top hitting the viewport top to its bottom hitting the viewport bottom.
     Card i scales 1 → 1 - (n - i) * 0.05 over the progress range [i * 0.25, 1];
     media inside a card zooms 2 → 1 while that card scrolls into place.
     The last card stays at full width so its resting state lines up with the page gutters. */
  const stack = document.querySelector('[data-stack-inner]');
  const cards = gsap.utils.toArray('[data-stack-card]');
  cards.forEach((card, i) => {
    const isLast = i === cards.length - 1;
    const targetScale = isLast ? 1 : 1 - (cards.length - i) * 0.05;
    const from = i * 0.25;
    gsap.fromTo(card, { scale: 1 }, {
      scale: targetScale, ease: 'none',
      scrollTrigger: {
        trigger: stack,
        start: () => `top+=${from * (stack.offsetHeight - window.innerHeight)} top`,
        end: 'bottom bottom',
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
    const media = card.querySelector('[data-stack-media]');
    if (media) {
      gsap.fromTo(media, { scale: 2 }, {
        scale: 1, ease: 'none',
        scrollTrigger: { trigger: card.parentElement, start: 'top bottom', end: 'top top', scrub: true },
      });
    }
  });

  /* ---------- Section entrances ---------- */
  gsap.utils.toArray('.section-header, .tilt-grid, .steps, .plans, .gallery, .pipeline, .quotes, .event, .about, .fit, .faq__list').forEach((el) => {
    gsap.from(el, {
      y: 40, opacity: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
