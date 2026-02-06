(() => {
  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const root = document.documentElement;
  const body = document.body;
  const themeToggle = qs('[data-toggle="theme"]');
  const motionToggle = qs('[data-toggle="motion"]');
  const navLinks = qsa('.nav-link');
  const sections = qsa('[data-section]');
  const scrollProgress = qs('.scroll-progress');
  const revealItems = qsa('[data-reveal]');
  const pricingSwitch = qs('[data-pricing-switch]');
  const priceEls = qsa('.price');
  const chipButtons = qsa('[data-filter]');
  const galleryCards = qsa('.gallery-card');
  const toastContainer = qs('.toast-container');
  const copyButtons = qsa('[data-copy]');
  const toastButtons = qsa('[data-toast]');
  const form = qs('.contact-form');
  const commandTrigger = qs('[data-command-open]');
  const commandPalette = qs('.command-palette');
  const commandInput = qs('[data-command-input]');
  const commandList = qs('[data-command-list]');
  const commandItems = qsa('[role="option"]', commandList);
  const particleCanvas = qs('.particle-canvas');
  const magneticButtons = qsa('[data-magnetic]');
  const tiltCards = qsa('[data-tilt]');
  const faqItems = qsa('[data-faq]');

  const storage = {
    get(key, fallback) {
      try {
        return localStorage.getItem(key) ?? fallback;
      } catch (error) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        return null;
      }
    }
  };

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const storedTheme = storage.get('theme', 'dark');
  const storedMotion = storage.get('reduce-motion', prefersReduced.matches ? 'on' : 'off');

  const applyTheme = (theme) => {
    root.setAttribute('data-theme', theme);
    themeToggle?.setAttribute('aria-pressed', theme === 'dark');
  };

  const applyMotion = (state) => {
    const reduced = state === 'on';
    body.classList.toggle('reduce-motion', reduced);
    motionToggle?.setAttribute('aria-pressed', reduced);
  };

  applyTheme(storedTheme);
  applyMotion(storedMotion);

  themeToggle?.addEventListener('click', () => {
    body.classList.add('theme-transition');
    const nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    storage.set('theme', nextTheme);
    setTimeout(() => body.classList.remove('theme-transition'), 400);
  });

  motionToggle?.addEventListener('click', () => {
    const nextState = body.classList.contains('reduce-motion') ? 'off' : 'on';
    applyMotion(nextState);
    storage.set('reduce-motion', nextState);
  });

  const smoothScroll = (targetId) => {
    const target = qs(targetId);
    if (!target) return;
    target.scrollIntoView({ behavior: body.classList.contains('reduce-motion') ? 'auto' : 'smooth' });
  };

  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      smoothScroll(link.getAttribute('href'));
    });
  });

  const updateScroll = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = `${progress}%`;

    let current = sections[0];
    sections.forEach((section) => {
      if (scrollTop >= section.offsetTop - 200) {
        current = section;
      }
    });

    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current.id}`);
    });
  };

  window.addEventListener('scroll', updateScroll);
  updateScroll();

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.2 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));

  const createToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  toastButtons.forEach((button) => {
    button.addEventListener('click', () => createToast(button.dataset.toast));
  });

  copyButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copy);
        createToast('Link kopiert');
      } catch (error) {
        createToast('Kopieren fehlgeschlagen');
      }
    });
  });

  const animateNumber = (element, nextValue) => {
    const currentValue = Number(element.textContent);
    const diff = nextValue - currentValue;
    const duration = body.classList.contains('reduce-motion') ? 0 : 400;
    const start = performance.now();

    const tick = (time) => {
      const progress = Math.min((time - start) / duration, 1);
      element.textContent = Math.round(currentValue + diff * progress);
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    if (duration === 0) {
      element.textContent = nextValue;
      return;
    }

    requestAnimationFrame(tick);
  };

  pricingSwitch?.addEventListener('click', () => {
    pricingSwitch.classList.toggle('active');
    const yearly = pricingSwitch.classList.contains('active');
    pricingSwitch.setAttribute('aria-pressed', yearly);
    priceEls.forEach((price) => {
      const value = yearly ? Number(price.dataset.year) : Number(price.dataset.month);
      animateNumber(price, value);
    });
  });

  chipButtons.forEach((chip) => {
    chip.addEventListener('click', () => {
      chipButtons.forEach((btn) => btn.classList.remove('active'));
      chip.classList.add('active');
      const filter = chip.dataset.filter;
      galleryCards.forEach((card) => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('is-hidden', !match);
      });
    });
  });

  magneticButtons.forEach((button) => {
    button.addEventListener('mousemove', (event) => {
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      button.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'translate(0, 0)';
    });
  });

  qsa('.btn').forEach((button) => {
    button.addEventListener('pointerdown', () => {
      button.style.transform = 'scale(0.97)';
    });
    button.addEventListener('pointerup', () => {
      button.style.transform = 'scale(1)';
    });
  });

  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `rotateX(${y * -8}deg) rotateY(${x * 8}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'rotateX(0) rotateY(0)';
    });
  });

  const openPalette = () => {
    commandPalette.hidden = false;
    body.style.overflow = 'hidden';
    commandInput.focus();
    setActiveItem(0);
  };

  const closePalette = () => {
    commandPalette.hidden = true;
    body.style.overflow = '';
    commandTrigger.focus();
  };

  commandTrigger?.addEventListener('click', openPalette);

  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      commandPalette.hidden ? openPalette() : closePalette();
    }
    if (event.key === 'Escape' && !commandPalette.hidden) {
      closePalette();
    }
  });

  const setActiveItem = (index) => {
    commandItems.forEach((item, idx) => {
      item.classList.toggle('active', idx === index);
    });
    commandItems[index]?.scrollIntoView({ block: 'nearest' });
  };

  const findTarget = (label) => {
    const id = label.toLowerCase();
    smoothScroll(`#${id}`);
  };

  let activeIndex = 0;

  commandInput?.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      activeIndex = (activeIndex + 1) % commandItems.length;
      setActiveItem(activeIndex);
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      activeIndex = (activeIndex - 1 + commandItems.length) % commandItems.length;
      setActiveItem(activeIndex);
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      const target = commandItems[activeIndex];
      if (target) {
        findTarget(target.textContent);
        closePalette();
      }
    }
  });

  commandPalette?.addEventListener('click', (event) => {
    if (event.target === commandPalette) {
      closePalette();
    }
  });

  commandItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      activeIndex = index;
      findTarget(item.textContent);
      closePalette();
    });
  });

  commandPalette?.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const focusable = qsa('input, [tabindex="0"], button', commandPalette).filter(
      (el) => !el.hasAttribute('disabled')
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  faqItems.forEach((item) => {
    const button = qs('.faq-question', item);
    button.addEventListener('click', () => {
      const isOpen = item.classList.toggle('open');
      button.setAttribute('aria-expanded', isOpen);
    });
  });

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    let valid = true;
    qsa('input, textarea', form).forEach((field) => {
      const error = field.parentElement.querySelector('.error');
      if (!field.value.trim()) {
        error.textContent = 'Pflichtfeld';
        valid = false;
      } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
        error.textContent = 'Bitte gültige Email eingeben';
        valid = false;
      } else {
        error.textContent = '';
      }
    });

    const success = qs('.form-success', form);
    if (valid) {
      success.textContent = 'Danke! Wir melden uns in Kürze.';
      form.reset();
      createToast('Nachricht gesendet');
    } else {
      success.textContent = '';
    }
  });

  const initParticles = () => {
    if (!particleCanvas) return;
    const ctx = particleCanvas.getContext('2d');
    const particles = [];
    let animationFrame;

    const resize = () => {
      particleCanvas.width = particleCanvas.offsetWidth * window.devicePixelRatio;
      particleCanvas.height = particleCanvas.offsetHeight * window.devicePixelRatio;
    };

    const create = () => {
      particles.length = 0;
      for (let i = 0; i < 40; i += 1) {
        particles.push({
          x: Math.random() * particleCanvas.width,
          y: Math.random() * particleCanvas.height,
          r: 1 + Math.random() * 2,
          vx: -0.5 + Math.random(),
          vy: -0.5 + Math.random()
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > particleCanvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > particleCanvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      animationFrame = requestAnimationFrame(draw);
    };

    const start = () => {
      if (body.classList.contains('reduce-motion')) return;
      cancelAnimationFrame(animationFrame);
      resize();
      create();
      draw();
    };

    const stop = () => {
      cancelAnimationFrame(animationFrame);
    };

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    });

    window.addEventListener('resize', () => {
      resize();
      create();
    });

    start();
  };

  initParticles();

  const launchConfetti = () => {
    if (body.classList.contains('reduce-motion')) return;
    const canvas = document.createElement('canvas');
    canvas.className = 'confetti';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const pieces = Array.from({ length: 80 }, () => ({
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * 200,
      size: 4 + Math.random() * 6,
      color: `hsl(${Math.random() * 360}, 80%, 60%)`,
      vy: 2 + Math.random() * 3,
      vx: -1 + Math.random() * 2
    }));

    const resize = () => {
      canvas.width = window.innerWidth * devicePixelRatio;
      canvas.height = window.innerHeight * devicePixelRatio;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      ctx.scale(devicePixelRatio, devicePixelRatio);
    };

    resize();
    let startTime = performance.now();

    const animate = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((piece) => {
        piece.y += piece.vy;
        piece.x += piece.vx;
        ctx.fillStyle = piece.color;
        ctx.fillRect(piece.x, piece.y, piece.size, piece.size);
      });
      if (time - startTime < 2200) {
        requestAnimationFrame(animate);
      } else {
        canvas.remove();
      }
    };

    requestAnimationFrame(animate);
  };

  let easterEgg = '';
  document.addEventListener('keydown', (event) => {
    easterEgg += event.key.toUpperCase();
    if (!'NEBULA'.startsWith(easterEgg)) {
      easterEgg = event.key.toUpperCase();
    }
    if (easterEgg === 'NEBULA') {
      launchConfetti();
      createToast('Nebula aktiviert ✨');
      easterEgg = '';
    }
  });
})();
