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

  setTimeout(() => {
    overlay.style.transition    = 'opacity 0.6s ease';
    overlay.style.opacity       = '0';
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
  const navbar    = document.getElementById('navbar');
  const hamburger = document.querySelector('.hamburger');
  const navLinks  = document.querySelector('.nav-links');

  if (!navbar || !hamburger || !navLinks) return;

  function onScroll() {
    if (window.scrollY > 10 && !navbar.classList.contains('menu-open')) {
      navbar.classList.add('scrolled');
    } else if (!navbar.classList.contains('menu-open')) {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.classList.toggle('open');
    navbar.classList.toggle('menu-open');

    if (navbar.classList.contains('menu-open')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      onScroll();
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
// Text animates in only on first visit per session
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
      sub:   'Expert lawn care and irrigation that keep your yard thriving every season.'
    }
  ];

  const badgeEl = document.querySelector('.hero-badge');
  const titleEl = document.querySelector('.hero-title');
  const subEl   = document.querySelector('.hero-subtitle');

  // If returning visit this session, remove the CSS entrance animations
  // so text is immediately visible instead of fading in from translateY
  if (sessionStorage.getItem('hero_played')) {
    const heroEls = document.querySelectorAll('.hero-badge, .hero-title, .hero-subtitle, .hero-buttons, .carousel-dots, .scroll-hint');
    heroEls.forEach(el => {
      el.style.animation = 'none';
      el.style.opacity   = '1';
      el.style.transform = 'none';
    });
  } else {
    sessionStorage.setItem('hero_played', '1');
  }

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

  const handle  = wrap.querySelector('.ba-handle');
  const reveal  = wrap.querySelector('.ba-after-reveal');
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
// ============================================

(function initMultiStepForm() {
  const steps          = document.querySelectorAll('.form-step');
  const stepIndicators = document.querySelectorAll('.step-indicator .step');
  if (!steps.length) return;

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

  const fileInput   = document.getElementById('fphoto');
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
// Only animates on first visit per session
// ============================================

(function initCounters() {
  const counters = document.querySelectorAll('.stat-number[data-count]');
  if (!counters.length) return;

  // If already played this session, show final values immediately and stop
  if (sessionStorage.getItem('counters_played')) {
    counters.forEach(el => {
      el.textContent = el.dataset.count + (el.dataset.suffix || '');
    });
    return;
  }

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

  // Mark as played so returning visits skip the animation
  sessionStorage.setItem('counters_played', '1');
})();


// ============================================
// FLORA — Advanced Local Garden Assistant
// No API. No rate limits. No CORS. Just fast.
// ============================================

(function initChat() {

  const bubble     = document.querySelector('.chat-bubble');
  const panel      = document.querySelector('.chat-panel');
  const closeBtn   = document.querySelector('.chat-close');
  const input      = document.querySelector('.chat-input');
  const sendBtn    = document.querySelector('.chat-send');
  const messagesEl = document.querySelector('.chat-messages');

  if (!bubble || !panel) return;

  // ── Knowledge base ─────────────────────────────────────────
  // Each entry: { patterns: [keywords], response, tags: [topic] }
  const knowledge = [

    // Greetings
    {
      patterns: ['hello','hi','hey','good morning','good afternoon','good evening','howdy','what\'s up','whats up','sup'],
      tags: ['greeting'],
      response: `Hey there! 👋 I'm Flora, Henriquez Landscaping's garden assistant. I'm here to help with anything lawn care, landscaping, or gardening in Northern Virginia!<br><br>You can ask me things like:<br>• <em>"When should I aerate my lawn?"</em><br>• <em>"How much does a patio cost?"</em><br>• <em>"Do you serve Ashburn?"</em><br><br>What can I help you with? 🌿`
    },
    {
      patterns: ['help','what can you do','what do you know','how does this work'],
      tags: ['help'],
      response: `Great question! 🌱 I can help you with:<br><br>🌿 <strong>Lawn care advice</strong> — mowing, fertilizing, aeration, weeds<br>🏡 <strong>Our services</strong> — what we offer and what to expect<br>📍 <strong>Service areas</strong> — cities we cover in Northern VA<br>💰 <strong>Estimates</strong> — how to get a free quote<br>📞 <strong>Contact info</strong> — phone, WhatsApp, email<br>📅 <strong>Seasonal tips</strong> — what to do in spring, summer, fall, winter<br><br>Just ask away!`
    },

    // Services — General
    {
      patterns: ['services','what do you offer','what do you do','offerings','service list'],
      tags: ['services'],
      response: `Here's what Henriquez Landscaping offers 🌿:<br><br>🌱 <strong>Lawn Care & Maintenance</strong> — mowing, edging, fertilization, aeration, overseeding, weed control<br>🏗️ <strong>Hardscaping</strong> — patios, walkways, retaining walls, fire pits<br>💧 <strong>Irrigation</strong> — manual irrigation design and installation<br>🍂 <strong>Seasonal Cleanup</strong> — spring and fall cleanups<br>🌸 <strong>Planting & Mulching</strong> — flower beds, shrubs, trees, mulch<br>🎨 <strong>Landscape Design</strong> — full custom design services<br><br>Want details on any specific service? Just ask! Or <a href="pages/estimate.html">get a free estimate here</a>.`
    },

    // Lawn Care
    {
      patterns: ['lawn','mow','mowing','cut grass','grass','turf'],
      tags: ['lawn'],
      response: `We offer full lawn care services including mowing, edging, and trimming to keep your yard looking sharp year-round! 🌿<br><br>For Northern Virginia's climate, cool-season grasses like tall fescue thrive here. We tailor our mowing schedule and height to your specific grass type — never cutting more than ⅓ of the blade at once.<br><br>Interested in regular maintenance? <a href="pages/estimate.html">Get a free estimate</a> or WhatsApp us at <a href="https://wa.me/15716912176" target="_blank">571-691-2176</a>!`
    },

    // Fertilization
    {
      patterns: ['fertilize','fertilizer','fertilization','feed lawn','lawn food','nutrients'],
      tags: ['lawn', 'fertilize'],
      response: `Great timing to ask! 🌱 For Northern Virginia lawns:<br><br>• <strong>Spring (April)</strong> — light feeding to kick-start growth<br>• <strong>Early Fall (September)</strong> — most important application of the year<br>• <strong>Late Fall (November)</strong> — winterizer for root strength<br><br>We use slow-release nitrogen fertilizers — avoid fertilizing in summer heat as it stresses cool-season grasses. We handle all of this as part of our lawn care programs!`
    },

    // Aeration
    {
      patterns: ['aerat','core aerat','aeration','compaction','compact soil'],
      tags: ['lawn', 'aeration'],
      response: `Core aeration is one of the best things you can do for a Northern Virginia lawn! 🌿<br><br><strong>Best time:</strong> Early fall (September–October) for cool-season grasses like fescue.<br><br><strong>Why it matters:</strong> Relieves soil compaction, improves drainage, lets nutrients and water reach the roots more effectively.<br><br><strong>Pro tip:</strong> Overseed immediately after aeration for the best germination results — the holes act as perfect seed beds.<br><br>We offer aeration + overseeding packages! <a href="pages/estimate.html">Get a quote</a>.`
    },

    // Overseeding
    {
      patterns: ['overseed','overseeding','seed','thin lawn','bare spots','patchy'],
      tags: ['lawn', 'overseeding'],
      response: `Overseeding fills in thin, bare, or patchy areas for a thick, lush lawn! 🌱<br><br><strong>Best time in Northern VA:</strong> Late August to mid-October — soil is warm, air is cool, perfect for germination.<br><br><strong>Our process:</strong> We aerate first, then spread high-quality fescue seed, followed by starter fertilizer. Keep the seed moist for 2–3 weeks and you'll see results!<br><br>Want us to assess your lawn? <a href="pages/estimate.html">Book a free estimate</a>.`
    },

    // Weeds
    {
      patterns: ['weed','weeds','dandelion','crabgrass','clover','thistle','broadleaf'],
      tags: ['lawn', 'weeds'],
      response: `Weeds are a battle every Northern Virginia homeowner knows! Here's the game plan 🌿:<br><br>🛡️ <strong>Prevention (spring)</strong> — pre-emergent herbicide when forsythia blooms (late Feb–March) stops crabgrass before it starts<br>🎯 <strong>Treatment (fall)</strong> — post-emergent for broadleaf weeds like dandelions and clover<br>💪 <strong>Best defense</strong> — a thick, healthy lawn naturally crowds out weeds<br><br>We include weed control in our lawn care programs. <a href="pages/estimate.html">Get a free estimate</a>!`
    },

    // Mulching
    {
      patterns: ['mulch','mulching','wood chip','bark','flower bed'],
      tags: ['mulch'],
      response: `Mulching is one of the easiest ways to make your beds look sharp and protect your plants! 🍂<br><br><strong>How much:</strong> 2–3 inches is ideal — enough to suppress weeds and retain moisture<br><strong>Keep away:</strong> Leave 3 inches of space around tree trunks to prevent rot<br><strong>Best type:</strong> Shredded hardwood mulch works great for the Sterling, VA climate<br><strong>When:</strong> Spring and fall are the best times to refresh your mulch<br><br>We offer mulching as a standalone service or as part of a full cleanup package!`
    },

    // Hardscaping
    {
      patterns: ['patio','hardscape','hardscaping','walkway','pathway','retaining wall','wall','fire pit','outdoor living','pavers','flagstone','stone'],
      tags: ['hardscaping'],
      response: `Hardscaping is where we really shine! 🏗️ We design and build:<br><br>• <strong>Patios</strong> — pavers, flagstone, stamped concrete<br>• <strong>Walkways & paths</strong> — connecting your spaces beautifully<br>• <strong>Retaining walls</strong> — functional and decorative<br>• <strong>Fire pit areas</strong> — perfect for Northern VA evenings<br>• <strong>Outdoor living spaces</strong> — complete entertaining areas<br><br>Every hardscaping project gets a custom design consultation. <a href="pages/work.html">See our project gallery</a> or <a href="pages/estimate.html">book a free consultation</a> and we'll come assess your space!`
    },

    // Irrigation
    {
      patterns: ['irrigation','water','watering','sprinkler','drip','hose','dry lawn'],
      tags: ['irrigation'],
      response: `Keeping your lawn properly watered is crucial in Northern Virginia's summers! 💧<br><br><strong>General rule:</strong> 1 inch of water per week, applied deeply 2–3 times a week rather than daily shallow watering.<br><strong>Best time to water:</strong> Early morning (before 10am) to minimize evaporation and prevent fungal disease.<br><br>We offer manual irrigation design and installation — perfectly sized and positioned for your yard's unique needs. <a href="pages/estimate.html">Get a free estimate</a>!`
    },

    // Pruning / Trimming
    {
      patterns: ['prune','pruning','trim','trimming','shrub','bush','hedge','rose','tree'],
      tags: ['pruning'],
      response: `Pruning at the right time makes all the difference! ✂️<br><br>🌹 <strong>Roses:</strong> Prune in late February–March when forsythia blooms. Cut at 45° above an outward-facing bud. Deadhead throughout summer.<br>🌳 <strong>Trees & shrubs:</strong> Most are best pruned in late winter before new growth, or right after flowering for spring bloomers.<br>🌿 <strong>Ornamental grasses:</strong> Cut back hard in late February before new growth emerges.<br><br>We include shrub trimming in our maintenance programs — always done at the right time for each plant!`
    },

    // Seasonal — Spring
    {
      patterns: ['spring','spring cleanup','spring prep','march','april','may'],
      tags: ['seasonal', 'spring'],
      response: `Spring is the busiest time for Northern Virginia lawns! 🌸 Here's your checklist:<br><br>✅ Apply pre-emergent herbicide (when forsythia blooms)<br>✅ Light fertilization to wake up your lawn<br>✅ Clean up winter debris and dead plant material<br>✅ Edge all beds and walkways<br>✅ Refresh mulch in beds<br>✅ Prune roses and ornamental grasses<br>✅ Service your irrigation system<br><br>Book your spring cleanup early — our schedule fills up fast! <a href="pages/estimate.html">Get a quote</a>.`
    },

    // Seasonal — Summer
    {
      patterns: ['summer','june','july','august','heat','drought','dry'],
      tags: ['seasonal', 'summer'],
      response: `Northern Virginia summers can be tough on lawns! ☀️ Here's how to protect yours:<br><br>💧 <strong>Water deeply</strong> — 1 inch per week, early morning<br>✂️ <strong>Mow high</strong> — raise your blade to 3.5–4 inches to shade roots<br>🚫 <strong>Skip fertilizer</strong> — don't feed cool-season grass in summer heat<br>🌿 <strong>Leave clippings</strong> — they return moisture and nutrients<br>👀 <strong>Watch for grubs</strong> — treat in July if you see brown patches that roll up like carpet<br><br>Need help keeping your lawn healthy through summer? <a href="pages/estimate.html">Let's talk</a>!`
    },

    // Seasonal — Fall
    {
      patterns: ['fall','autumn','september','october','november','leaves','leaf'],
      tags: ['seasonal', 'fall'],
      response: `Fall is actually the MOST important season for your Northern Virginia lawn! 🍂<br><br>🌱 <strong>Aerate + overseed</strong> — September is prime time<br>🌿 <strong>Fertilize</strong> — apply your most important feeding of the year<br>🍂 <strong>Leaf removal</strong> — don't let leaves smother your grass<br>🌸 <strong>Plant bulbs</strong> — spring tulips and daffodils go in now<br>🌳 <strong>Trim and mulch</strong> — protect roots heading into winter<br><br>Our fall cleanup packages are incredibly popular — book early! <a href="pages/estimate.html">Get a quote</a>.`
    },

    // Seasonal — Winter
    {
      patterns: ['winter','december','january','february','snow','frost','cold'],
      tags: ['seasonal', 'winter'],
      response: `Winter is the quiet season, but there's still work to do! ❄️<br><br>🌿 <strong>Late Feb:</strong> Prune ornamental grasses and roses before new growth<br>🌱 <strong>Late Feb–March:</strong> Apply pre-emergent when forsythia blooms<br>🏡 <strong>Now:</strong> Great time to plan spring hardscaping projects — we can design over winter for a spring installation!<br>📋 <strong>Now:</strong> Book your spring maintenance schedule early before spots fill up<br><br>Want to plan ahead? <a href="pages/estimate.html">Reach out anytime</a>!`
    },

    // Pricing / Cost / Estimate
    {
      patterns: ['price','pricing','cost','how much','quote','estimate','fee','charge','rate','affordable','cheap','expensive'],
      tags: ['pricing'],
      response: `Every yard is unique, so we give personalized estimates rather than one-size-fits-all pricing! 💰<br><br>What we can promise:<br>✅ <strong>Competitive, honest pricing</strong> — no hidden fees<br>✅ <strong>Free estimates</strong> — no obligation<br>✅ <strong>Transparent quotes</strong> — you know exactly what you're paying for<br><br>The fastest way to get a number is to:<br>📋 <a href="pages/estimate.html">Fill out our estimate form</a><br>💬 <a href="https://wa.me/15716912176" target="_blank">WhatsApp us at 571-691-2176</a> — we usually respond within hours!`
    },

    // Service Areas
    {
      patterns: ['area','areas','serve','service area','location','where','city','cities','county','loudoun','fairfax','ashburn','leesburg','herndon','reston','great falls','mclean','centreville','manassas','chantilly','dulles','south riding'],
      tags: ['areas'],
      response: `We serve all of Northern Virginia! 📍 Our coverage includes:<br><br>Sterling • Ashburn • Leesburg • Herndon • Reston • Great Falls • McLean • Centreville • Manassas • Chantilly • Dulles • South Riding<br><br>...and surrounding Loudoun and Fairfax County areas. Don't see your city? Give us a call — we may still be able to help!<br><br>📞 <a href="tel:+15716912176">571-691-2176</a> or <a href="https://wa.me/15716912176" target="_blank">WhatsApp us</a>.`
    },

    // Contact
    {
      patterns: ['contact','phone','call','email','reach','whatsapp','message','get in touch','talk'],
      tags: ['contact'],
      response: `Here's how to reach the Henriquez Landscaping team! 📞<br><br>📱 <strong>Call or WhatsApp:</strong> <a href="https://wa.me/15716912176" target="_blank">571-691-2176</a><br>✉️ <strong>Email:</strong> <a href="mailto:henriquezlandscaping5@gmail.com">henriquezlandscaping5@gmail.com</a><br>📋 <strong>Free Estimate Form:</strong> <a href="pages/estimate.html">Click here</a><br><br>We respond within 24 hours — usually much faster! WhatsApp is the quickest way to reach us.`
    },

    // About / Company
    {
      patterns: ['about','who are you','company','history','founded','how long','experience','years','team','owner','henriquez','certified','eco','licensed','insured'],
      tags: ['about'],
      response: `Henriquez Landscaping was founded right here in Sterling, Virginia! 🌿<br><br>📅 <strong>Founded:</strong> 2013 — 5+ years of serving Northern Virginia<br>📍 <strong>Based in:</strong> Sterling, VA<br>🌱 <strong>Eco-Certified:</strong> Since 2022 — committed to 100% environmentally responsible practices<br>🏆 <strong>Licensed & Insured:</strong> Full coverage for your peace of mind<br>🏙️ <strong>Service Area:</strong> 12+ cities across Loudoun and Fairfax County<br><br>We combine old-world craftsmanship with modern horticultural science. Every project is treated like our own yard! <a href="pages/about.html">Read our full story</a>.`
    },

    // Gallery / Work
    {
      patterns: ['gallery','portfolio','work','projects','examples','photos','pictures','see','show me','before after','transformation'],
      tags: ['gallery'],
      response: `We love showing off our work! 📸 Check out our project gallery to see real transformations across Northern Virginia — lawns, patios, retaining walls, planting beds, and more.<br><br>👉 <a href="pages/work.html">View Our Full Gallery</a><br><br>You can filter by service type — lawn care, hardscaping, irrigation, planting, and seasonal cleanup. If you see something you love, we can do the same for your yard!`
    },

    // Pests / Grubs
    {
      patterns: ['pest','grub','grubs','insect','bug','beetle','chinch','armyworm','sod webworm'],
      tags: ['pests'],
      response: `Lawn pests are a real issue in Northern Virginia! 🐛 Here's what to watch for:<br><br>🦗 <strong>Grubs (June bugs/Japanese beetles):</strong> Treat in June–July before they hatch. Signs: brown patches that peel back like carpet, birds pecking at lawn.<br>🌿 <strong>Chinch bugs:</strong> Active in hot, dry July–August. Look for yellow patches in sunny areas.<br>🐛 <strong>Armyworms:</strong> Late summer, fast damage. Check by soaking a patch — worms will surface.<br><br>If you're seeing damage, contact us quickly — some pests move fast! <a href="https://wa.me/15716912176" target="_blank">WhatsApp 571-691-2176</a>.`
    },

    // Soil / pH
    {
      patterns: ['soil','ph','soil test','clay','sandy','compacted','drainage','amendment'],
      tags: ['soil'],
      response: `Soil health is the foundation of a beautiful lawn! 🌱<br><br>Northern Virginia soils tend to be heavy clay — great for water retention but can compact easily and drain poorly.<br><br>🧪 <strong>Soil test:</strong> We recommend testing every 2–3 years. Virginia Cooperative Extension offers affordable testing.<br>🪨 <strong>Clay soil fixes:</strong> Core aeration + compost topdressing dramatically improves structure over time.<br>⚖️ <strong>pH:</strong> Most lawns prefer 6.0–7.0. Low pH (acidic) is common here — lime applications can correct it.<br><br>We factor soil conditions into all our lawn care recommendations!`
    },

    // Native Plants
    {
      patterns: ['native','native plant','pollinator','butterfly','bee','wildlife','habitat','sustainable','eco','environment','green'],
      tags: ['eco', 'plants'],
      response: `Love that you're thinking eco-friendly! 🌸 We're eco-certified and passionate about sustainable landscaping.<br><br>Great native plants for Northern Virginia:<br>🌸 <strong>Eastern Redbud</strong> — beautiful spring color<br>🦋 <strong>Butterfly Weed</strong> — monarch magnet<br>🌿 <strong>Native grasses</strong> — low maintenance, wildlife habitat<br>🍂 <strong>Inkberry & Viburnum</strong> — berries for birds all winter<br><br>We can design entire pollinator gardens or incorporate natives into any landscape project. <a href="pages/estimate.html">Let's talk</a>!`
    },

    // Compliments
    {
      patterns: ['thanks','thank you','great','awesome','helpful','good job','nice','love it','perfect','excellent'],
      tags: ['compliment'],
      response: `You're so welcome! 🌿 Happy to help. If you have more questions — about your lawn, our services, or anything gardening-related — just ask. And when you're ready to transform your outdoor space, we're just a message away! <a href="pages/estimate.html">Get your free estimate</a> anytime. 😊`
    },

    // Negative / Complaint
    {
      patterns: ['bad','terrible','worst','disappointed','unhappy','problem','issue','complaint'],
      tags: ['complaint'],
      response: `I'm sorry to hear you're having an issue! 😟 Please reach out to our team directly so we can make it right:<br><br>📱 <strong>WhatsApp:</strong> <a href="https://wa.me/15716912176" target="_blank">571-691-2176</a><br>✉️ <strong>Email:</strong> <a href="mailto:henriquezlandscaping5@gmail.com">henriquezlandscaping5@gmail.com</a><br><br>We take every concern seriously and will respond as quickly as possible. Your satisfaction is our priority!`
    },
  ];

  // Fallback responses — rotated randomly so it doesn't feel repetitive
  const fallbacks = [
    `That's a great question! 🌿 For the most accurate advice for your specific yard, our experts would love to help. <a href="pages/estimate.html">Get a free estimate</a> or <a href="https://wa.me/15716912176" target="_blank">WhatsApp us at 571-691-2176</a> — we typically respond within hours!`,
    `Hmm, I want to make sure you get the right answer on that one! 🌱 Our team would be happy to help — <a href="https://wa.me/15716912176" target="_blank">send us a WhatsApp</a> or <a href="pages/estimate.html">fill out our quick form</a> and we'll get back to you fast.`,
    `Great question — every yard is different, so the best answer depends on your specific situation! 🏡 <a href="pages/estimate.html">Book a free consultation</a> and our team will assess your yard and give you expert advice tailored to your property.`,
  ];

  let fallbackIdx = 0;

  // ── Matching engine ─────────────────────────────────────────
  function getBotResponse(msg) {
    const lower = msg.toLowerCase().replace(/[^a-z0-9\s']/g, '');
    const words = lower.split(/\s+/);

    let bestMatch = null;
    let bestScore = 0;

    for (const entry of knowledge) {
      let score = 0;
      for (const pattern of entry.patterns) {
        // Exact word match scores higher than substring match
        if (words.some(w => w === pattern)) {
          score += 3;
        } else if (lower.includes(pattern)) {
          score += 1;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatch = entry;
      }
    }

    // Require at least a score of 1 to match
    if (bestMatch && bestScore >= 1) {
      return bestMatch.response;
    }

    // Rotate fallbacks
    const reply = fallbacks[fallbackIdx % fallbacks.length];
    fallbackIdx++;
    return reply;
  }

  // ── UI helpers ──────────────────────────────────────────────
  function addMessage(text, isUser = false) {
    const msg = document.createElement('div');
    msg.className = `chat-msg ${isUser ? 'user' : 'bot'}`;
    msg.innerHTML = text;
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

  // ── Open / close ────────────────────────────────────────────
  bubble.addEventListener('click', () => {
    panel.classList.toggle('open');
    if (panel.classList.contains('open') && input) input.focus();
  });

  if (closeBtn) closeBtn.addEventListener('click', () => panel.classList.remove('open'));

  // ── Send message ────────────────────────────────────────────
  function handleSend() {
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    addMessage(text, true);

    const typing = showTyping();

    // Small delay so it feels natural, not instant
    setTimeout(() => {
      typing.remove();
      addMessage(getBotResponse(text));
    }, 600 + Math.random() * 400);
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