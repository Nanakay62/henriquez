/* ============================================
   HENRIQUEZ LANDSCAPING - Main JavaScript
   ============================================ */

// ============================================
// STARDUST ANIMATION
// Only plays once per browser session
// ============================================

(function initStardust() {
  const overlay = document.getElementById('stardust-overlay');
  const canvas  = document.getElementById('stardust-canvas');
  if (!canvas || !overlay) return;

  // If already played this session, remove immediately and bail
  if (sessionStorage.getItem('stardust_played')) {
    overlay.remove();
    return;
  }

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animId;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  function createParticle() {
    const isGrass = Math.random() > 0.4;
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -Math.random() * 1.2 - 0.3,
      life: 1,
      decay: Math.random() * 0.008 + 0.003,
      size: isGrass ? Math.random() * 3 + 1 : Math.random() * 4 + 2,
      isGrass,
      color: isGrass
        ? `hsl(${120 + Math.random() * 40}, ${60 + Math.random() * 30}%, ${40 + Math.random() * 30}%)`
        : `hsl(${40 + Math.random() * 30}, ${70 + Math.random() * 20}%, ${60 + Math.random() * 20}%)`,
      rotation:      Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.05,
      length:        Math.random() * 20 + 8,
      wobble:        Math.random() * 0.02,
      wobbleOffset:  Math.random() * Math.PI * 2,
    };
  }

  for (let i = 0; i < 200; i++) {
    const p = createParticle();
    p.life = Math.random();
    particles.push(p);
  }

  let frame = 0;

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frame++;

    if (frame < 180 && particles.length < 400) {
      for (let i = 0; i < 4; i++) particles.push(createParticle());
    }

    const windStart    = 150;
    const windStrength = frame > windStart ? Math.min((frame - windStart) * 0.04, 3) : 0;

    particles = particles.filter(p => p.life > 0);

    particles.forEach(p => {
      p.life -= p.decay;
      p.x    += p.vx + windStrength * (0.5 + Math.random() * 0.5);
      p.y    += p.vy;
      p.vy   -= 0.005;
      p.rotation += p.rotationSpeed + (windStrength * 0.05);
      p.vx   += (Math.random() - 0.5) * p.wobble + windStrength * 0.02;

      ctx.save();
      ctx.globalAlpha = p.life * 0.9;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      if (p.isGrass) {
        ctx.strokeStyle = p.color;
        ctx.lineWidth   = p.size * 0.5;
        ctx.lineCap     = 'round';
        ctx.beginPath();
        ctx.moveTo(0, p.length * 0.5);
        ctx.quadraticCurveTo(p.size * 2, 0, 0, -p.length * 0.5);
        ctx.stroke();
      } else {
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
        grad.addColorStop(0, p.color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });

    if (particles.length > 0 || frame < 200) {
      animId = requestAnimationFrame(animate);
    }
  }

  animate();

  // Remove overlay after 5 seconds and mark as played
  setTimeout(() => {
    overlay.style.transition  = 'opacity 0.6s ease';
    overlay.style.opacity     = '0';
    overlay.style.pointerEvents = 'none';
    setTimeout(() => overlay.remove(), 700);
    cancelAnimationFrame(animId);
    sessionStorage.setItem('stardust_played', '1');
  }, 5000);
})();


// ============================================
// NAVBAR SCROLL BEHAVIOR
// ============================================

(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (!navbar || !hamburger || !navLinks) return;

  function onScroll() {
    // Only apply scrolled background if the menu isn't open
    if (window.scrollY > 10 && !navbar.classList.contains('menu-open')) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.classList.toggle('open');
    navbar.classList.toggle('menu-open');

    // Prevent body scroll when green menu is covering screen
    if (navbar.classList.contains('menu-open')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      onScroll(); // Re-check scroll position when closing
    }
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      navbar.classList.remove('menu-open');
      document.body.style.overflow = '';
    });
  });
})();
// ============================================
// HERO CAROUSEL
// ============================================

(function initCarousel() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots   = document.querySelectorAll('.dot');
  if (!slides.length) return;

  let current = 0;
  let timer;

  const slideContent = [
    {
      badge: '🌿 Sterling, Virginia\'s Finest',
      title: 'Transform Your <em>Outdoor Space</em> Into Paradise',
      sub:   'Premium landscaping services crafted with care, creativity, and over a decade of local expertise.'
    },
    {
      badge: '🏡 Hardscaping & Design',
      title: 'Beautiful <em>Hardscapes</em> Built to Last',
      sub:   'From patios to retaining walls — we design outdoor living spaces that become the heart of your home.'
    },
    {
      badge: '💧 Irrigation & Lawn Care',
      title: 'A Lush <em>Green Lawn</em> Year Round',
      sub:   'Smart irrigation systems and expert lawn care that keep your yard thriving every season.'
    }
  ];

  const badgeEl = document.querySelector('.hero-badge');
  const titleEl = document.querySelector('.hero-title');
  const subEl   = document.querySelector('.hero-subtitle');

  function goTo(idx) {
    slides[current].classList.remove('active');
    if (dots[current]) dots[current].classList.remove('active');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('active');
    if (dots[current]) dots[current].classList.add('active');

    if (badgeEl && slideContent[current]) {
      badgeEl.innerHTML  = slideContent[current].badge;
      titleEl.innerHTML  = slideContent[current].title;
      subEl.textContent  = slideContent[current].sub;
    }
  }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 5000);
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); startTimer(); });
  });

  startTimer();
})();


// ============================================
// BEFORE / AFTER SLIDER
// ============================================

(function initBASlider() {
  const wrap = document.querySelector('.ba-slider-wrap');
  if (!wrap) return;

  const handle = wrap.querySelector('.ba-handle');
  const reveal = wrap.querySelector('.ba-after-reveal');
  let dragging  = false;

  function setPos(clientX) {
    const rect = wrap.getBoundingClientRect();
    let pct = ((clientX - rect.left) / rect.width) * 100;
    pct = Math.max(5, Math.min(95, pct));
    reveal.style.width = pct + '%';
    handle.style.left  = pct + '%';
  }

  wrap.addEventListener('mousedown',  e => { dragging = true; setPos(e.clientX); });
  wrap.addEventListener('touchstart', e => { dragging = true; setPos(e.touches[0].clientX); }, { passive: true });

  document.addEventListener('mousemove', e => { if (dragging) setPos(e.clientX); });
  document.addEventListener('touchmove', e => { if (dragging) setPos(e.touches[0].clientX); }, { passive: true });

  document.addEventListener('mouseup',  () => { dragging = false; });
  document.addEventListener('touchend', () => { dragging = false; });
})();


// ============================================
// GALLERY FILTER (Work Page)
// ============================================

(function initGalleryFilter() {
  const tabs  = document.querySelectorAll('.filter-tab');
  const items = document.querySelectorAll('.gallery-item');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.dataset.filter;
      items.forEach(item => {
        if (filter === 'all' || item.dataset.cat === filter) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });
})();


// ============================================
// MULTI-STEP FORM
// NOTE: estimate.html manages its own submission
// via Web3Forms. This block only handles the
// step navigation and file upload for pages
// that still use the old inline form pattern.
// ============================================

(function initMultiStepForm() {
  const steps          = document.querySelectorAll('.form-step');
  const stepIndicators = document.querySelectorAll('.step-indicator .step');
  if (!steps.length) return;

  // If estimate-form exists (new Web3Forms page), skip — it handles itself
  if (document.getElementById('estimate-form')) return;

  const nextBtns  = document.querySelectorAll('.btn-form-next');
  const prevBtns  = document.querySelectorAll('.btn-form-prev');
  let currentStep = 0;

  function showStep(idx) {
    steps.forEach((s, i) => s.classList.toggle('active', i === idx));
    stepIndicators.forEach((s, i) => {
      s.classList.remove('active', 'done');
      if (i === idx) s.classList.add('active');
      else if (i < idx) s.classList.add('done');
    });
    currentStep = idx;
  }

  nextBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep < steps.length - 1) showStep(currentStep + 1);
    });
  });

  prevBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep > 0) showStep(currentStep - 1);
    });
  });

  // File upload display
  const fileInput  = document.getElementById('fphoto');
  const uploadTitle = document.querySelector('.upload-title');
  if (fileInput && uploadTitle) {
    fileInput.addEventListener('change', () => {
      if (fileInput.files.length > 0) {
        uploadTitle.textContent = `${fileInput.files.length} file(s) selected`;
      }
    });
    document.querySelector('.upload-zone')?.addEventListener('click', () => fileInput.click());
  }
})();


// ============================================
// STATS COUNTER ANIMATION
// ============================================

(function initCounters() {
  const counters = document.querySelectorAll('.stat-number[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      let start    = 0;
      const step   = target / (1800 / 16);

      const timer = setInterval(() => {
        start = Math.min(start + step, target);
        el.textContent = Math.floor(start) + suffix;
        if (start >= target) clearInterval(timer);
      }, 16);

      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();


// ============================================
// SMART GARDEN ASSISTANT CHAT — via Cloudflare Worker
// ============================================

(function initChat() {

  // 🔗 Paste your deployed Cloudflare Worker URL here
  // e.g. 'https://henriquez-chat.yoursubdomain.workers.dev'
  const WORKER_URL = 'https://henriquez.nanakwamedickson62.workers.dev';

  const conversationHistory = []; // multi-turn memory

  const bubble     = document.querySelector('.chat-bubble');
  const panel      = document.querySelector('.chat-panel');
  const closeBtn   = document.querySelector('.chat-close');
  const input      = document.querySelector('.chat-input');
  const sendBtn    = document.querySelector('.chat-send');
  const messagesEl = document.querySelector('.chat-messages');

  if (!bubble || !panel) return;

  bubble.addEventListener('click', () => {
    panel.classList.toggle('open');
    if (panel.classList.contains('open') && input) input.focus();
  });

  if (closeBtn) closeBtn.addEventListener('click', () => panel.classList.remove('open'));

  async function getBotResponse(userMessage) {
    // Add user message to history
    conversationHistory.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history: conversationHistory })
    });

    if (!response.ok) {
      throw new Error(`Worker responded with ${response.status}`);
    }

    const data = await response.json();
    const reply = data.reply || "I'm sorry, I didn't get a response. Please try again!";

    // Save assistant reply to history for next turn
    conversationHistory.push({
      role: 'model',
      parts: [{ text: reply }]
    });

    return reply;
  }

  function addMessage(text, isUser = false) {
    const msg = document.createElement('div');
    msg.className = `chat-msg ${isUser ? 'user' : 'bot'}`;
    msg.innerHTML = text.replace(/\n/g, '<br>');
    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return msg;
  }

  function showTyping() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    messagesEl.appendChild(indicator);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return indicator;
  }

  function disableInput(disabled) {
    input.disabled = disabled;
    sendBtn.disabled = disabled;
  }

  async function handleSend() {
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    addMessage(text, true);
    disableInput(true);

    const typing = showTyping();

    try {
      const reply = await getBotResponse(text);
      typing.remove();
      addMessage(reply);
    } catch (error) {
      console.error('Chat error:', error);
      typing.remove();
      addMessage("Sorry, I'm having trouble connecting right now. 🌿 Please reach us directly at <a href='https://wa.me/15716912176' target='_blank'>571-691-2176</a>!");
    } finally {
      disableInput(false);
      input.focus();
    }
  }

  sendBtn?.addEventListener('click', handleSend);
  input?.addEventListener('keydown', e => { if (e.key === 'Enter') handleSend(); });

})();

// ============================================
// REVEAL ANIMATIONS ON SCROLL
// ============================================

(function initReveal() {
  const els = document.querySelectorAll('.service-card, .review-card, .area-tag, .edge-feature, .gallery-item, .value-card');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach((el, i) => {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(20px)';
    el.style.transition = `opacity 0.5s ease ${(i % 6) * 0.08}s, transform 0.5s ease ${(i % 6) * 0.08}s`;
    observer.observe(el);
  });
})();