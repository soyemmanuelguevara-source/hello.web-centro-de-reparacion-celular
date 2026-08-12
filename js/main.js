(function () {
  'use strict';

  const WA_PHONE = '527352097070';
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  function initLoader() {
    const loader = $('#loader');
    const fill = $('.loader-bar-fill');
    const flash = $('#load-flash');
    if (!loader || !fill) return;

    const startedAt = Date.now();
    const minDuration = 2300;
    let progress = 0;

    const timer = window.setInterval(() => {
      progress = Math.min(progress + Math.random() * 12 + 5, 94);
      fill.style.width = `${progress}%`;
    }, 160);

    const finish = () => {
      const remaining = Math.max(0, minDuration - (Date.now() - startedAt));
      window.setTimeout(() => {
        window.clearInterval(timer);
        fill.style.width = '100%';
        flash?.classList.add('run');
        window.setTimeout(() => {
          loader.classList.add('loader-hide');
          document.body.classList.remove('lock');
          if (window.location.hash) {
            const target = document.querySelector(window.location.hash);
            target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 420);
      }, remaining);
    };

    if (document.readyState === 'complete') {
      finish();
    } else {
      window.addEventListener('load', finish, { once: true });
    }
  }

  function initNavbar() {
    const navbar = $('#navbar');
    const hamburger = $('#hamburger');
    const menu = $('#mob-menu');

    const syncScroll = () => {
      navbar?.classList.toggle('scrolled', window.scrollY > 24);
    };
    syncScroll();
    window.addEventListener('scroll', syncScroll, { passive: true });

    hamburger?.addEventListener('click', () => {
      const open = !menu.classList.contains('open');
      menu.classList.toggle('open', open);
      hamburger.classList.toggle('active', open);
      hamburger.setAttribute('aria-expanded', String(open));
    });

    $$('#mob-menu a').forEach((link) => {
      link.addEventListener('click', () => {
        menu?.classList.remove('open');
        hamburger?.classList.remove('active');
        hamburger?.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function initMarquee() {
    const marquee = $('#marquee');
    if (!marquee) return;

    const items = [
      'Reparacion profesional',
      'Servicio rapido y seguro',
      'Garantia en servicios',
      'Accesorios para celular',
      'Venta de equipos seminuevos',
      'Av. Morelos #23, Amayuca'
    ];

    marquee.innerHTML = [...items, ...items]
      .map((item) => `<span><i class="fa-solid fa-circle"></i>${item}</span>`)
      .join('');
  }

  function initReveal() {
    const elements = $$('.reveal');
    if (!('IntersectionObserver' in window)) {
      elements.forEach((el) => el.classList.add('in-view'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -40px 0px' });

    elements.forEach((el) => observer.observe(el));
  }

  function initCounters() {
    const counters = $$('.stat-num');
    if (!counters.length) return;

    const animateCounter = (el) => {
      const target = Number(el.dataset.count || 0);
      const suffix = el.dataset.suffix || '';
      const duration = 1300;
      const startedAt = performance.now();

      const tick = (now) => {
        const elapsed = Math.min((now - startedAt) / duration, 1);
        const eased = 1 - Math.pow(1 - elapsed, 3);
        const value = Math.round(target * eased);
        el.textContent = `${value.toLocaleString('es-MX')}${suffix}`;

        if (elapsed < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    };

    if (!('IntersectionObserver' in window)) {
      counters.forEach(animateCounter);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach((counter) => observer.observe(counter));
  }

  function initHeroTitle() {
    const accent = $('.hero-title .accent');
    if (!accent) return;

    const words = ['funcionar.', 'responder.', 'encender.', 'cargar.'];
    let index = 0;

    window.setInterval(() => {
      index = (index + 1) % words.length;
      accent.animate(
        [
          { opacity: 1, transform: 'translateY(0)' },
          { opacity: 0, transform: 'translateY(-10px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ],
        { duration: 520, easing: 'cubic-bezier(.22,1,.36,1)' }
      );
      window.setTimeout(() => {
        accent.textContent = words[index];
      }, 210);
    }, 3200);
  }

  function initParallax() {
    const heroBg = $('.hero-bg');
    const bannerBg = $('.promo-banner .banner-bg');
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      if (heroBg) heroBg.style.transform = `scale(1.12) translateY(${Math.min(y * 0.05, 38)}px)`;
      if (bannerBg) bannerBg.style.transform = `translateY(${Math.sin(y * 0.003) * 10}px) scale(1.04)`;
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
  }

  function createParticles(canvas, options = {}) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const settings = {
      count: options.count || 52,
      speed: options.speed || 0.35,
      maxRadius: options.maxRadius || 2.2,
      lineDistance: options.lineDistance || 130
    };
    const particles = [];
    let width = 0;
    let height = 0;
    let ratio = 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * ratio));
      canvas.height = Math.max(1, Math.floor(height * ratio));
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

      while (particles.length < settings.count) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * settings.speed,
          vy: (Math.random() - 0.5) * settings.speed,
          r: Math.random() * settings.maxRadius + 0.6
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = i % 3 === 0 ? 'rgba(46,107,255,.58)' : 'rgba(255,215,0,.66)';
        ctx.fill();

        for (let j = i + 1; j < particles.length; j += 1) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const distance = Math.hypot(dx, dy);
          if (distance < settings.lineDistance) {
            ctx.strokeStyle = `rgba(255,215,0,${(1 - distance / settings.lineDistance) * 0.13})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });
    draw();
  }

  function initParticles() {
    const heroCanvas = $('#hero-canvas');
    if (heroCanvas) createParticles(heroCanvas, { count: 70, speed: 0.42, lineDistance: 145 });
    $$('[data-particles]').forEach((canvas) => {
      createParticles(canvas, { count: 28, speed: 0.22, lineDistance: 120 });
    });
  }

  function initWhatsAppForm() {
    const form = $('#wa-form');
    if (!form) return;

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const name = $('#f-name')?.value.trim();
      const interest = $('#f-interest')?.value.trim();
      const message = $('#f-msg')?.value.trim();

      if (!name || !message) {
        form.reportValidity();
        return;
      }

      const text = [
        'Hola, vengo de la pagina web del Centro de Reparacion Celular Amayuca.',
        `Mi nombre es: ${name}.`,
        `Necesito: ${interest}.`,
        `Detalle: ${message}`
      ].join('\n');

      const url = `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  }

  function initYear() {
    const year = $('#year');
    if (year) year.textContent = new Date().getFullYear();
  }

  initLoader();
  initNavbar();
  initMarquee();
  initReveal();
  initCounters();
  initHeroTitle();
  initParallax();
  initParticles();
  initWhatsAppForm();
  initYear();
})();
