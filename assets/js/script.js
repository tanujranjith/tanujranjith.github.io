'use strict';


/* ═══════════════════════════════════════════════════════════
   THEME TOGGLE
═══════════════════════════════════════════════════════════ */
(function initThemeToggle() {
  const root      = document.documentElement;
  const getSaved  = () => localStorage.getItem('theme');
  const prefersLight = () => window.matchMedia?.('(prefers-color-scheme: light)').matches;

  const applyTheme = (t) => {
    if (t === 'light') root.setAttribute('data-theme', 'light');
    else               root.removeAttribute('data-theme');
    localStorage.setItem('theme', t);
    updateIcons(t);
  };

  const currentTheme = () => (root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

  function updateIcons(t) {
    const name = t === 'light' ? 'moon-outline' : 'sunny-outline';
    document.querySelectorAll('[data-theme-icon]').forEach(el => el.setAttribute('name', name));
    // also update any ion-icon inside .nav-theme-btn and .theme-toggle--global
    document.querySelectorAll('.nav-theme-btn ion-icon, .theme-toggle--global ion-icon').forEach(el => {
      el.setAttribute('name', name);
    });
  }

  // Wire the nav button if present
  const navBtn = document.getElementById('nav-theme-toggle');

  // Also create a floating fallback button (only shown if nav btn absent)
  const floatBtn = document.createElement('button');
  floatBtn.className = 'theme-toggle theme-toggle--global';
  floatBtn.setAttribute('aria-label', 'Toggle theme');
  floatBtn.innerHTML = '<ion-icon name="moon-outline"></ion-icon>';
  if (!navBtn) {
    floatBtn.style.display = 'flex';
    document.body.appendChild(floatBtn);
  }

  function crossfadeTo(nextTheme) {
    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
      position: 'fixed', inset: '0', zIndex: '9999', pointerEvents: 'none',
      background: nextTheme === 'light' ? 'rgba(245,246,250,0.92)' : 'rgba(10,11,14,0.92)',
      opacity: '0', transition: 'opacity 600ms ease',
      backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)'
    });
    document.body.appendChild(overlay);
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      setTimeout(() => {
        applyTheme(nextTheme);
        if (typeof window.__updateParticleColors === 'function') {
          try { window.__updateParticleColors(); } catch (_) {}
        }
        requestAnimationFrame(() => {
          overlay.style.opacity = '0';
          overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
        });
      }, 300);
    });
  }

  const toggle = () => crossfadeTo(currentTheme() === 'light' ? 'dark' : 'light');

  if (navBtn)   navBtn.addEventListener('click', toggle);
  if (!navBtn)  floatBtn.addEventListener('click', toggle);

  // Initialise
  const initial = getSaved() ?? 'light';
  applyTheme(initial);

  // Sync system pref if user hasn't chosen
  try {
    window.matchMedia('(prefers-color-scheme: light)')
      .addEventListener('change', () => { if (!getSaved()) applyTheme(prefersLight() ? 'light' : 'dark'); });
  } catch (_) {}
})();


/* ═══════════════════════════════════════════════════════════
   MOBILE NAV HAMBURGER
═══════════════════════════════════════════════════════════ */
(function initMobileNav() {
  const hamburger = document.getElementById('nav-hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  if (!hamburger || !mobileNav) return;

  hamburger.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
    mobileNav.setAttribute('aria-hidden', String(!isOpen));
  });

  // Close on mobile nav link click
  mobileNav.querySelectorAll('[data-mobile-nav-link]').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileNav.setAttribute('aria-hidden', 'true');
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
      mobileNav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileNav.setAttribute('aria-hidden', 'true');
    }
  });
})();


/* ═══════════════════════════════════════════════════════════
   ACTIVE NAV LINK ON SCROLL
═══════════════════════════════════════════════════════════ */
(function initScrollSpy() {
  const sections = ['home', 'work', 'robotics', 'experience', 'about', 'contact'];
  const navLinks  = document.querySelectorAll('.nav-link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        link.classList.toggle('active', href === `#${id}`);
      });
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
})();


/* ═══════════════════════════════════════════════════════════
   PROJECT CARDS + DETAIL OVERLAY
═══════════════════════════════════════════════════════════ */
const projectGrid        = document.querySelector('[data-project-grid]');
const projectDetailShell = document.querySelector('[data-project-detail-shell]');

if (projectGrid && projectDetailShell) {
  const projectDetailClose    = projectDetailShell.querySelector('[data-project-detail-close]');
  const projectDetailBackdrop = projectDetailShell.querySelector('[data-project-detail-backdrop]');
  const projectDetailEyebrow  = projectDetailShell.querySelector('[data-project-detail-eyebrow]');
  const projectDetailTitle    = projectDetailShell.querySelector('[data-project-detail-title]');
  const projectDetailSummary  = projectDetailShell.querySelector('[data-project-detail-summary]');
  const projectDetailLinks    = projectDetailShell.querySelector('[data-project-detail-links]');
  const projectDetailGallery  = projectDetailShell.querySelector('[data-project-detail-gallery]');
  const projectDetailPanel    = projectDetailShell.querySelector('.project-detail-panel');

  if (projectDetailShell.parentElement !== document.body) {
    document.body.appendChild(projectDetailShell);
  }

  const escapeHtml = (v) => String(v).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);

  const pluralize = (n, s, p = `${s}s`) => `${n} ${n === 1 ? s : p}`;
  const makeLink  = (label, href, icon = 'open-outline') => ({ label, href, icon });
  const makeImg   = (title, src, description, pageHref, pageLabel = 'Open page') => ({
    title, src, alt: title, description,
    links: pageHref
      ? [makeLink(pageLabel, pageHref), makeLink('Open image', src, 'image-outline')]
      : [makeLink('Open image', src, 'image-outline')]
  });
  const makeVideo = (title, src, description, poster) => ({
    title, src, alt: title, description, type: 'video', poster,
    links: [makeLink('Open video', src, 'play-circle-outline')]
  });

  /* ── PROJECT CATALOG ──────────────────────────────────── */
  const projectCatalog = [
    {
      slug: 'vehicle-perception-simulator',
      title: 'Vehicle Perception Simulator',
      filter: 'vehicle perception simulator',
      category: 'ai-ml',
      kicker: 'Computer Vision · Simulation',
      summary: 'A browser-based autonomous driving simulator that models what a vehicle might see from multiple sensors. It includes multi-view camera feeds, LiDAR/depth-style overlays, object-detection boxes, lane detection, traffic lights, sensor fusion visuals, and an AI decision log. Built with JavaScript.',
      accent: '#0891b2',
      cover: './assets/images/SD_sim_1.jpg',
      links: [makeLink('GitHub', 'https://github.com/tanujranjith', 'logo-github')],
      gallery: [
        makeVideo('Live Demo', './assets/images/SD_sim.mp4',
          'Full run-through of the Three.js perception simulator — multi-view cameras, sensor fusion overlays, object detection, lane following, and the AI decision log reacting to traffic in real time.',
          './assets/images/SD_sim_1.jpg'),
        makeImg('AV Stack Overview', './assets/images/SD_sim_1.jpg',
          'Planner / occupancy view above the forward camera feed, with the full control surface — target speed, scenario difficulty, environment, and weather — while cruising a clear route.'),
        makeImg('Stop-Sign Scenario', './assets/images/SD_sim_2.jpg',
          'Sensor-fusion view detecting a stop sign, pedestrian, and vehicles ahead; the controller reads the speed-limit sign and prepares a full stop.'),
        makeImg('Sensor Fusion HUD', './assets/images/SD_sim_3.jpg',
          'Camera + LiDAR fusion with projected depth, lane estimates, and a decision HUD — yielding at a detected yield sign while waiting for a safe gap.'),
        makeImg('Chase Camera Tracking', './assets/images/SD_sim_4.jpg',
          'Third-person chase view tracking the vehicle through an intersection, with red-light, pedestrian, car, and yield-sign detections projected onto the scene.'),
        makeImg('Intersection Approach', './assets/images/SD_sim_5.jpg',
          'AV-stack view approaching a crosswalk intersection, planned trajectory drawn through the lane graph as the controller cruises and adjusts for traffic lights.')
      ]
    },
    {
      slug: 'vets-it-guide',
      title: 'VetsITGuide',
      filter: 'vetsitguide',
      category: 'web',
      kicker: 'Founder & President',
      summary: 'A free AI-assisted platform helping U.S. military veterans transition into IT and cybersecurity careers through guided learning paths, role explanations, certification guidance, and job-search support. Built with Python, Django, JavaScript, and the Google Gemini API. Accepted into the U.S. Department of Veterans Affairs Innovation Repository.',
      accent: '#2b6aff',
      cover: './assets/images/VetsITGuide_Home.png',
      links: [
        makeLink('Live site', 'https://www.vetsitguide.com/'),
        makeLink('GitHub', 'https://github.com/tanujranjith/vets2tech', 'logo-github')
      ],
      gallery: [
        makeImg('Home Page', './assets/images/VetsITGuide_Home.png', 'Landing screen for the veteran transition platform.', 'https://www.vetsitguide.com/', 'Visit live site'),
        makeImg('Sign Up', './assets/images/VetsITGuide_Signup.png', 'Account creation and onboarding flow.', 'https://www.vetsitguide.com/', 'Visit live site'),
        makeImg('Vision & Mission', './assets/images/VetsITGuide_VisionAndMission.png', 'Mission and vision messaging.', 'https://www.vetsitguide.com/', 'Visit live site'),
        makeImg('Employment Page', './assets/images/VetsITGuide_Employement.png', 'Career and employment guidance.', 'https://www.vetsitguide.com/employment/', 'Open employment page'),
        makeImg('Education Page', './assets/images/VetsITGuide_Education1.png', 'Education overview and learning pathways.', 'https://www.vetsitguide.com/', 'Visit live site'),
        makeImg('Education Details', './assets/images/VetsITGuide_Education2.png', 'Expanded education content.', 'https://www.vetsitguide.com/education/', 'Open education page'),
        makeImg('Find a Job', './assets/images/VetsITGuide_FindAJob.png', 'Job search and support flow.', 'https://www.vetsitguide.com/jobfind/', 'Open job page')
      ]
    },
    {
      slug: 'sutra',
      title: 'Sutra',
      filter: 'sutra',
      category: 'web',
      kicker: 'Browser workspace',
      summary: 'A local-first productivity workspace for students. Sutra brings together notes, planning, focus tools, calendar-style organization, split-screen editing, exports, and a privacy-first browser workspace. I\'m building it around the idea that students should own their workflow and their data.',
      accent: '#c8a857',
      cover: './assets/images/NoteFlow is a local-first.png',
      links: [
        makeLink('Live demo', 'https://tanujranjith.github.io/Sutra/HomePage.html'),
        makeLink('GitHub', 'https://github.com/tanujranjith/Sutra', 'logo-github')
      ],
      gallery: [
        makeImg('Browser App', './assets/images/NoteFlow is a local-first.png',
          'Local-first workspace with notes, planning, and focus tools.',
          'https://tanujranjith.github.io/Sutra/HomePage.html', 'Open live demo')
      ]
    },
    {
      slug: 'dynamic-island-windows',
      title: 'Dynamic Island for Windows',
      filter: 'dynamic island for windows',
      category: 'tools',
      kicker: 'Desktop widget',
      summary: 'A lightweight Apple Dynamic Island-inspired desktop widget for Windows, built in Python with Tkinter. Shows media info, playback controls, time/date/battery, theme-aware visuals, and compact-to-expanded UI behavior.',
      accent: '#7b6cff',
      cover: './assets/images/icon-app.svg',
      links: [makeLink('GitHub', 'https://github.com/tanujranjith/Dynamic-Island-Python', 'logo-github')],
      gallery: [
        makeImg('Widget Concept', './assets/images/icon-app.svg', 'Compact desktop widget layout.', 'https://github.com/tanujranjith/Dynamic-Island-Python', 'Open GitHub'),
        makeImg('Utility UI', './assets/images/icon-dev.svg', 'Theme-aware compact and expanded states.', 'https://github.com/tanujranjith/Dynamic-Island-Python', 'Open GitHub')
      ]
    },
    {
      slug: 'pong-ai',
      title: 'Pong AI',
      filter: 'pong ai',
      category: 'ai-ml',
      kicker: 'AI demo',
      summary: 'An AI-vs-human Pong game built in Python featuring an AI-controlled opponent with trained game-playing behavior, real-time visual simulation, and a training/observation mode to watch the agent develop over time.',
      accent: '#22c1a2',
      cover: './assets/images/Pong_AITraining.png',
      links: [
        makeLink('Watch demo', 'https://www.youtube.com/watch?v=UKmkkb-I8TY', 'play-circle-outline'),
        makeLink('GitHub', 'https://github.com/tanujranjith/AI-Pong-Player', 'logo-github')
      ],
      gallery: [
        makeImg('AI Training', './assets/images/Pong_AITraining.png', 'Training view for the Pong agent.', 'https://www.youtube.com/watch?v=UKmkkb-I8TY', 'Watch demo'),
        makeImg('Playing Against AI', './assets/images/Pong_PlayingAgainstAI.png', 'Gameplay against the AI.', 'https://www.youtube.com/watch?v=UKmkkb-I8TY', 'Watch demo')
      ]
    },
    {
      slug: 'endangered-animals',
      title: 'Endangered Animals',
      filter: 'endangered animals',
      category: 'web',
      kicker: 'Gallery project',
      summary: 'A visual awareness project built around endangered wildlife, habitat views, and species highlights.',
      accent: '#66a86c',
      cover: './assets/images/animalendagerment1.png',
      links: [makeLink('GitHub', 'https://github.com/tanujranjith/Drexel-CCI-summer-camp-project', 'logo-github')],
      gallery: [
        makeImg('Home Page',       './assets/images/animalendagerment1.png', 'Landing screen and summary view.'),
        makeImg('Continental View','./assets/images/animalendagerment2.png', 'Regional overview.'),
        makeImg('Gallery View 3',  './assets/images/animalendagerment3.png', 'Wildlife artwork and content.'),
        makeImg('Canada Lynx',     './assets/images/animalendagerment4.png', 'Species spotlight page.')
      ]
    },
    {
      slug: 'ivoted',
      title: 'iVoted',
      filter: 'ivoted',
      category: 'web',
      kicker: 'Civic site',
      summary: 'A civic-engagement site with campaign highlights, organization pages, and voting flow visuals.',
      accent: '#e06b4f',
      cover: './assets/images/iVoted_Home.png',
      links: [makeLink('Live site', 'https://ivoted.us/')],
      gallery: [
        makeImg('Campaign Highlights', './assets/images/iVoted_CampingHighlights.png', 'Campaign highlight montage.', 'https://ivoted.us/', 'Visit live site'),
        makeImg('Home Page',           './assets/images/iVoted_Home.png', 'Landing screen.', 'https://ivoted.us/', 'Visit live site'),
        makeImg('Who Are We',          './assets/images/iVoted_WhoAreWe.png', 'About the organization.', 'https://ivoted.us/', 'Visit live site'),
        makeImg('Why Voting',          './assets/images/iVoted_WhyVoting.png', 'Why voting matters.', 'https://ivoted.us/', 'Visit live site'),
        makeImg('Voting Flow 1',       './assets/images/iVoted_Voting1.png', 'Voting interface.', 'https://ivoted.us/', 'Visit live site'),
        makeImg('Voting Flow 2',       './assets/images/iVoted_Voting2.png', 'Voting interface variation.', 'https://ivoted.us/', 'Visit live site'),
        makeImg('Voting Flow 3',       './assets/images/iVoted_Voting3.png', 'Voting interface variation.', 'https://ivoted.us/', 'Visit live site')
      ]
    }
  ];

  /* ── Render helpers ───────────────────────────────────── */
  const catalogMap = new Map(projectCatalog.map(p => [p.slug, p]));
  let lastTrigger = null, prevBodyOverflow = '';

  const renderLink = (link, compact = false) =>
    `<a class="project-link-pill${compact ? ' project-link-pill--compact' : ''}"
        href="${encodeURI(link.href)}" target="_blank" rel="noopener noreferrer">
      <ion-icon name="${escapeHtml(link.icon || 'open-outline')}"></ion-icon>
      <span>${escapeHtml(link.label)}</span>
    </a>`;

  const pickLinks = (p) => {
    const links   = Array.isArray(p.links) ? p.links : [];
    const isGH    = (h = '') => /github\.com/i.test(String(h));
    const source  = links.find(l => isGH(l.href)) || null;
    const primary = links.find(l => l?.href && !isGH(l.href)) || source;
    return { primary: primary || null, source };
  };

  const renderCard = (project) => {
    const { primary, source } = pickLinks(project);
    const pLabel = primary
      ? (source && primary.href === source.href ? 'Source'
        : /youtu\.be|youtube\.com/i.test(String(primary.href)) ? 'Watch demo'
        : 'Open project')
      : '';
    const pHref  = primary ? encodeURI(primary.href) : '';
    const sHref  = source  ? encodeURI(source.href)  : '';

    return `<li data-project-card data-category="${escapeHtml(project.category || 'web')}">
      <article class="project-card" style="--project-accent:${project.accent};"
               data-project-open="${escapeHtml(project.slug)}"
               role="button" tabindex="0"
               aria-label="Open ${escapeHtml(project.title)} details">
        <div class="project-card-media">
          <img src="${encodeURI(project.cover)}" alt="${escapeHtml(project.title)} preview"
               loading="lazy" data-no-zoom>
          <span class="project-card-badge"
                aria-label="${escapeHtml(pluralize(project.gallery.length, 'visual'))}">
            ${escapeHtml(String(project.gallery.length))}
          </span>
        </div>
        <div class="project-card-body">
          <div class="project-card-header">
            <h4 class="project-card-title">${escapeHtml(project.title)}</h4>
            <p class="project-card-summary">${escapeHtml(project.summary)}</p>
          </div>
          <div class="project-card-meta">
            <span class="project-card-kicker">${escapeHtml(project.kicker)}</span>
          </div>
          <div class="project-card-actions">
            ${pHref ? `<a class="project-card-action project-card-action--primary"
                          href="${pHref}" target="_blank" rel="noopener noreferrer"
                          aria-label="${escapeHtml(pLabel)} for ${escapeHtml(project.title)}">
                          ${escapeHtml(pLabel)}</a>` : ''}
            ${sHref && (!primary || sHref !== pHref)
              ? `<a class="project-card-action" href="${sHref}"
                    target="_blank" rel="noopener noreferrer"
                    aria-label="Source code for ${escapeHtml(project.title)}">Source</a>` : ''}
            <button class="project-card-action project-card-action--ghost"
                    type="button" data-project-open="${escapeHtml(project.slug)}"
                    aria-label="Open details for ${escapeHtml(project.title)}">Details</button>
          </div>
        </div>
      </article>
    </li>`;
  };

  const renderDetail = (project) => {
    projectDetailPanel.style.setProperty('--project-accent', project.accent);
    projectDetailEyebrow.textContent = project.kicker;
    projectDetailTitle.textContent   = project.title;
    projectDetailSummary.textContent = project.summary;
    projectDetailLinks.innerHTML     = project.links.map(l => renderLink(l)).join('');
    projectDetailGallery.innerHTML   = project.gallery.map(item => `
      <article class="project-detail-card${item.type === 'video' ? ' project-detail-card--video' : ''}">
        <div class="project-detail-card-media">
          ${item.type === 'video'
            ? `<video class="project-detail-video" src="${encodeURI(item.src)}"
                      ${item.poster ? `poster="${encodeURI(item.poster)}"` : ''}
                      controls preload="metadata" playsinline data-no-zoom></video>`
            : `<img src="${encodeURI(item.src)}" alt="${escapeHtml(item.alt)}" loading="lazy" data-no-zoom>`}
        </div>
        <div class="project-detail-card-body">
          <h4 class="project-detail-card-title">${escapeHtml(item.title)}</h4>
          <p class="project-detail-card-description">${escapeHtml(item.description)}</p>
          <div class="project-detail-card-links">
            ${item.links.map(l => renderLink(l, true)).join('')}
          </div>
        </div>
      </article>`).join('');
  };

  const openDetail = (slug, trigger) => {
    const project = catalogMap.get(slug);
    if (!project) return;
    lastTrigger       = trigger || null;
    prevBodyOverflow  = document.body.style.overflow;
    renderDetail(project);
    projectDetailShell.classList.add('active');
    projectDetailShell.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => projectDetailClose?.focus());
  };

  const closeDetail = () => {
    if (!projectDetailShell.classList.contains('active')) return;
    projectDetailShell.classList.remove('active');
    projectDetailShell.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = prevBodyOverflow;
    lastTrigger?.focus();
    lastTrigger = null;
  };

  // Render cards
  projectGrid.innerHTML = projectCatalog.map(renderCard).join('');

  // Event delegation: open detail
  projectGrid.addEventListener('click', (e) => {
    if (e.target.closest('a')) return;
    const trigger = e.target.closest('[data-project-open]');
    if (trigger) openDetail(trigger.dataset.projectOpen, trigger);
  });
  projectGrid.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const trigger = e.target.closest('[data-project-open]');
    if (!trigger || trigger.tagName === 'BUTTON') return;
    e.preventDefault();
    openDetail(trigger.dataset.projectOpen, trigger);
  });

  projectDetailClose?.addEventListener('click', closeDetail);
  projectDetailBackdrop?.addEventListener('click', closeDetail);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDetail();
  });

  window.closeProjectDetail = closeDetail;
}


/* ═══════════════════════════════════════════════════════════
   ROBOTICS HORIZONTAL SCROLL (driven by vertical scroll)
═══════════════════════════════════════════════════════════ */
(function initRoboticsScroll() {
  const section = document.getElementById('robotics');
  const wrapper = section?.querySelector('.robotics-sticky-wrapper');
  const sticky  = section?.querySelector('.robotics-sticky');
  const track   = section?.querySelector('.robotics-track');
  if (!section || !wrapper || !sticky || !track) return;

  const NAV_H = 60;
  const MOBILE = () => window.innerWidth <= 768;
  let setupPending = false;

  function setup() {
    if (MOBILE()) {
      wrapper.style.height = '';
      return;
    }
    setupPending = false;
    const stickyH = window.innerHeight - NAV_H;
    const travel  = Math.max(0, track.scrollWidth - sticky.offsetWidth);
    wrapper.style.height = (stickyH + travel) + 'px';
  }

  function update() {
    if (MOBILE()) {
      track.style.transform = '';
      return;
    }
    const wrapRect = wrapper.getBoundingClientRect();
    const travel   = wrapper.offsetHeight - (window.innerHeight - NAV_H);
    if (travel <= 0) return;
    const scrolled = -(wrapRect.top - NAV_H);
    const progress = Math.max(0, Math.min(1, scrolled / travel));
    const maxX     = -(track.scrollWidth - sticky.offsetWidth);
    track.style.transform = `translateX(${(progress * maxX).toFixed(2)}px)`;
  }

  function scheduleSetup() {
    if (setupPending) return;
    setupPending = true;
    requestAnimationFrame(() => {
      setup();
      update();
    });
  }

  // Wait for images to load
  const images = track.querySelectorAll('img');
  let loadedCount = 0;
  const checkAllLoaded = () => {
    loadedCount++;
    if (loadedCount === images.length) {
      setup();
      update();
    }
  };

  if (images.length === 0) {
    setup();
    update();
  } else {
    images.forEach(img => {
      if (img.complete) {
        checkAllLoaded();
      } else {
        img.addEventListener('load', checkAllLoaded, { once: true });
        img.addEventListener('error', checkAllLoaded, { once: true });
      }
    });
  }

  // Watch for size changes
  const resizeObserver = new ResizeObserver(() => scheduleSetup());
  resizeObserver.observe(track);

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', scheduleSetup, { passive: true });
})();


/* ═══════════════════════════════════════════════════════════
   ROBOTICS PHOTO ZOOM (click to open in new tab)
═══════════════════════════════════════════════════════════ */
document.querySelectorAll('.robotics-track img').forEach(img => {
  img.addEventListener('click', () => {
    const src = img.currentSrc || img.src;
    if (src) window.open(src, '_blank', 'noopener,noreferrer,resizable=yes,scrollbars=yes,width=1200,height=900');
  });
});




/* ═══════════════════════════════════════════════════════════
   NAV BACKGROUND on scroll
═══════════════════════════════════════════════════════════ */
(function () {
  const nav = document.querySelector('.site-nav');
  if (!nav) return;
  const update = () => nav.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', update, { passive: true });
  update();
})();






/* ═══════════════════════════════════════════════════════════
   EXPANDABLE TABS — PROJECT FILTER
═══════════════════════════════════════════════════════════ */
(function initProjectTabs() {
  const tabs = document.querySelectorAll('.exp-tab');
  const grid = document.querySelector('[data-project-grid]');
  if (!tabs.length || !grid) return;

  function filterCards(tab) {
    const category = tab.dataset.tab;
    tabs.forEach(t => {
      t.classList.toggle('active', t === tab);
      t.setAttribute('aria-selected', String(t === tab));
    });
    grid.querySelectorAll('[data-project-card]').forEach(card => {
      const match = category === 'all' || card.dataset.category === category;
      card.toggleAttribute('data-hidden', !match);
    });
  }

  tabs.forEach(tab => tab.addEventListener('click', () => filterCards(tab)));
})();


/* ═══════════════════════════════════════════════════════════
   BEAMS CANVAS — FOOTER BACKGROUND
═══════════════════════════════════════════════════════════ */
(function initBeamsBackground() {
  const canvas = document.getElementById('beams-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const BEAM_COUNT = 6;
  const HUES = [220, 230, 210, 240, 215, 225];

  function makeBeam(index) {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      angle: (Math.random() * Math.PI * 2),
      speed: 0.3 + Math.random() * 0.5,
      length: 120 + Math.random() * 180,
      width: 2 + Math.random() * 3,
      hue: HUES[index % HUES.length],
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.02 + Math.random() * 0.02,
      opacity: 0.4 + Math.random() * 0.5,
    };
  }

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width  = rect.width  || window.innerWidth;
    canvas.height = rect.height || 300;
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });

  const beams = Array.from({ length: BEAM_COUNT }, (_, i) => makeBeam(i));

  function drawBeam(b) {
    const alpha = b.opacity * (0.7 + 0.3 * Math.sin(b.pulse));
    const dx = Math.cos(b.angle) * b.length;
    const dy = Math.sin(b.angle) * b.length;
    const grad = ctx.createLinearGradient(b.x, b.y, b.x + dx, b.y + dy);
    grad.addColorStop(0,   `hsla(${b.hue}, 70%, 60%, 0)`);
    grad.addColorStop(0.4, `hsla(${b.hue}, 70%, 60%, ${alpha})`);
    grad.addColorStop(1,   `hsla(${b.hue}, 70%, 60%, 0)`);
    ctx.save();
    ctx.strokeStyle = grad;
    ctx.lineWidth   = b.width;
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(b.x + dx, b.y + dy);
    ctx.stroke();
    ctx.restore();
  }

  function tickBeam(b) {
    b.x     += Math.cos(b.angle) * b.speed;
    b.y     += Math.sin(b.angle) * b.speed;
    b.pulse += b.pulseSpeed;
    const w = canvas.width, h = canvas.height;
    const margin = b.length;
    if (b.x < -margin || b.x > w + margin || b.y < -margin || b.y > h + margin) {
      const side = Math.floor(Math.random() * 4);
      if (side === 0)      { b.x = Math.random() * w; b.y = -margin; }
      else if (side === 1) { b.x = w + margin;         b.y = Math.random() * h; }
      else if (side === 2) { b.x = Math.random() * w; b.y = h + margin; }
      else                 { b.x = -margin;             b.y = Math.random() * h; }
      b.angle = Math.atan2(h / 2 - b.y, w / 2 - b.x) + (Math.random() - 0.5) * 1.2;
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    beams.forEach(b => { tickBeam(b); drawBeam(b); });
  }
  animate();
})();


/* ═══════════════════════════════════════════════════════════
   BACKGROUND SHADER — site-wide animated WebGL flow field
   Domain-warped fractal noise tinted with the navy accent.
   Sits behind all content; subtle enough to keep text readable.
═══════════════════════════════════════════════════════════ */
(function initBackgroundShader() {
  const canvas = document.getElementById('bg-shader');
  if (!canvas) return;

  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false })
          || canvas.getContext('experimental-webgl', { antialias: false, alpha: false, depth: false });
  if (!gl) return; // graceful fallback: body base color shows instead

  const VERT = `
    attribute vec2 a_pos;
    void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
  `;

  const FRAG = `
    precision highp float;
    uniform vec2  u_res;
    uniform float u_time;
    uniform vec3  u_accent;
    uniform float u_dark;   // 1.0 = dark theme, 0.0 = light

    // Smooth, clean height field — layered ridges, no grainy noise.
    float surface(vec2 p, float t) {
      float h = 0.0;
      h +=        sin(p.x * 1.20 + t * 0.55);
      h +=        sin(p.y * 1.55 - t * 0.45);
      h += 0.80 * sin((p.x + p.y) * 0.95 + t * 0.35);
      h += 0.60 * sin((p.x - p.y) * 1.85 - t * 0.65);
      h += 0.45 * sin(length(p - vec2(sin(t * 0.25) * 1.5, cos(t * 0.21) * 1.5)) * 2.4 - t * 0.9);
      return h;
    }

    // Faux studio environment that the glass reflects / refracts.
    vec3 env(vec2 dir, vec3 base, vec3 accent, float dark) {
      float g = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);
      vec3 c = mix(base, mix(base * 1.5, accent, 0.40), g);
      // soft light booth — a couple of bright reflections
      c += vec3(1.0) * exp(-3.2 * length(dir - vec2(0.35, 0.55))) * mix(0.18, 0.36, dark);
      c += accent    * exp(-4.0 * length(dir + vec2(0.45, 0.30))) * mix(0.08, 0.45, dark);
      return c;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_res.xy;
      vec2 p  = (uv - 0.5) * vec2(u_res.x / u_res.y, 1.0) * 4.2;
      float t = u_time * 0.35;

      // surface normal from the height-field gradient -> glassy lighting
      float e  = 0.045;
      float h  = surface(p, t);
      float hx = surface(p + vec2(e, 0.0), t);
      float hy = surface(p + vec2(0.0, e), t);
      vec3  n  = normalize(vec3(h - hx, h - hy, e * 5.0));

      vec3 viewDir = vec3(0.0, 0.0, 1.0);
      float fres = pow(1.0 - max(n.z, 0.0), 2.4);          // Fresnel: more reflective at edges

      vec3 darkBase  = vec3(0.012, 0.018, 0.038);
      vec3 lightBase = vec3(1.0, 1.0, 1.0);
      vec3 base = mix(lightBase, darkBase, u_dark);

      // Refraction through the glass, with chromatic dispersion (prismatic edges).
      vec2 d = uv * 2.0 - 1.0;
      vec2 bend = n.xy * 0.26;
      vec3 trans;
      trans.r = env(d + bend * 1.05, base, u_accent, u_dark).r;
      trans.g = env(d + bend * 1.00, base, u_accent, u_dark).g;
      trans.b = env(d + bend * 0.95, base, u_accent, u_dark).b;

      // Reflection of the environment off the glass surface.
      vec3 refl = env(reflect(-viewDir, n).xy, base, u_accent, u_dark);

      // Glass = Fresnel blend of transmission (face) and reflection (grazing edges).
      vec3 col = mix(trans, refl, clamp(fres * 0.85, 0.0, 1.0));

      // Sharp mirror glints on top — reduced so white flares stay subdued.
      vec3 lightDir = normalize(vec3(0.45, 0.65, 0.62));
      vec3 halfDir  = normalize(lightDir + viewDir);
      float spec = pow(max(dot(n, halfDir), 0.0), 140.0);
      col += vec3(1.0) * spec * mix(0.30, 0.48, u_dark);

      // Cool accent rim sheen.
      col += u_accent * fres * mix(0.10, 0.20, u_dark);

      // gentle vignette so the panel settles into the page edges
      float vig = smoothstep(1.35, 0.30, length(uv - 0.5));
      col *= mix(0.90, 1.0, vig);

      // Hard ceiling: no pixel exceeds this brightness, keeping text legible
      // without any CSS overlay or visible box anywhere on the page.
      col = min(col, vec3(0.74));

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  function compile(type, src) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.warn('bg-shader compile error:', gl.getShaderInfoLog(sh));
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  }

  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn('bg-shader link error:', gl.getProgramInfoLog(prog));
    return;
  }
  gl.useProgram(prog);

  // full-screen triangle
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uRes    = gl.getUniformLocation(prog, 'u_res');
  const uTime   = gl.getUniformLocation(prog, 'u_time');
  const uAccent = gl.getUniformLocation(prog, 'u_accent');
  const uDark   = gl.getUniformLocation(prog, 'u_dark');

  // Mobile / touch devices: render a single static frame instead of an
  // animation loop. An animated full-screen canvas behind backdrop-filter
  // panels re-blurs every frame and drains battery on phones.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lowPower = window.matchMedia('(max-width: 768px)').matches
                || window.matchMedia('(pointer: coarse)').matches;
  const staticOnly = reduceMotion || lowPower;

  // render at a reduced scale — it's a soft backdrop, not a sharp asset
  // (lower still on mobile, where the static frame is GPU-cheap)
  const SCALE = lowPower ? 0.45 : 0.6;
  const DPR_CAP = lowPower ? 1.0 : 1.5;
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    const w = Math.max(1, Math.floor(window.innerWidth  * dpr * SCALE));
    const h = Math.max(1, Math.floor(window.innerHeight * dpr * SCALE));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, w, h);
    gl.uniform2f(uRes, w, h);
    if (staticOnly) drawStatic();   // re-render the frozen frame at the new size
  }

  // theme-aware tint
  function hexToRgb(hex) {
    const m = hex.trim().replace('#', '');
    const n = parseInt(m.length === 3 ? m.replace(/(.)/g, '$1$1') : m, 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }
  function syncTheme() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const accent = getComputedStyle(document.documentElement)
      .getPropertyValue('--accent').trim() || '#4169e1';
    const rgb = accent.startsWith('#') ? hexToRgb(accent) : [0.255, 0.412, 0.882];
    gl.uniform3f(uAccent, rgb[0], rgb[1], rgb[2]);
    gl.uniform1f(uDark, isLight ? 0.0 : 1.0);
  }
  let raf = null;
  let start = null;
  function drawStatic() {
    gl.uniform1f(uTime, 9.0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function frame(now) {
    if (start === null) start = now;
    gl.uniform1f(uTime, (now - start) / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    raf = requestAnimationFrame(frame);
  }
  function play() {
    if (raf === null) raf = requestAnimationFrame(frame);
  }
  function stop() {
    if (raf !== null) { cancelAnimationFrame(raf); raf = null; }
  }

  // initial sizing + theme (drawStatic is now defined for resize() to call)
  resize();
  syncTheme();
  window.addEventListener('resize', resize, { passive: true });
  new MutationObserver(() => { syncTheme(); if (staticOnly) drawStatic(); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  if (staticOnly) {
    drawStatic();   // one frozen frame — no animation loop on mobile / reduced-motion
  } else {
    play();
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop(); else { start = null; play(); }
    });
  }
})();


/* ═══════════════════════════════════════════════════════════
   ENTRANCE ANIMATIONS
═══════════════════════════════════════════════════════════ */
(function initEntranceAnimations() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Split hero headline into per-line reveal spans
  const hl = document.querySelector('.hero-headline');
  if (hl) {
    const parts = hl.innerHTML.split(/<br\s*\/?>/i);
    hl.innerHTML = parts
      .map((p, i) => {
        const t = p.trim();
        if (!t) return '';
        return `<span class="hero-line-wrap"><span class="hero-line-inner" style="animation-delay:${(0.2 + i * 0.13).toFixed(2)}s">${t}</span></span>`;
      })
      .filter(Boolean)
      .join('');
  }

  // Scroll-triggered fade-up via IntersectionObserver
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-visible');
      io.unobserve(e.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

  document.querySelectorAll('.section-header').forEach(el => {
    el.classList.add('anim-enter');
    io.observe(el);
  });

  document.querySelectorAll('.role-card, .highlight-card').forEach((el, i) => {
    el.style.transitionDelay = `${(i * 0.06).toFixed(2)}s`;
    el.classList.add('anim-enter');
    io.observe(el);
  });
})();
