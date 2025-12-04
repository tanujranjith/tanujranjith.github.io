'use strict';



// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }



// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });

// ----- Theme toggle (light/dark) -----
(function initThemeToggle() {
  const root = document.documentElement;
  const getSaved = () => localStorage.getItem('theme');
  const systemPrefersLight = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  const applyTheme = (t) => {
    if (t === 'light') root.setAttribute('data-theme', 'light');
    else root.removeAttribute('data-theme'); // default is dark
    localStorage.setItem('theme', t);
    updateIcon();
  };
  const currentTheme = () => (root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

  // Create toggle UI
  const btn = document.createElement('button');
  btn.className = 'theme-toggle theme-toggle--global';
  btn.setAttribute('aria-label', 'Toggle theme');
  btn.innerHTML = '<ion-icon name="moon"></ion-icon>';
  document.body.appendChild(btn);

  function updateIcon() {
    const theme = currentTheme();
    const icon = btn.querySelector('ion-icon');
    if (icon) icon.setAttribute('name', theme === 'light' ? 'sunny' : 'moon');
  }

  // Smooth crossfade with blur for theme switching
  function crossfadeTo(nextTheme) {
    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
      position: 'fixed', inset: '0', zIndex: '9999', pointerEvents: 'none',
      background: nextTheme === 'light' ? 'rgba(244,247,255,0.90)' : 'rgba(10,12,18,0.90)',
      opacity: '0', transition: 'opacity 700ms ease',
      backdropFilter: 'blur(8px) saturate(120%)', WebkitBackdropFilter: 'blur(8px) saturate(120%)'
    });
    document.body.appendChild(overlay);
    document.documentElement.classList.add('is-theming');
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      setTimeout(() => {
        applyTheme(nextTheme);
        if (typeof window.__updateParticleColors === 'function') {
          try { window.__updateParticleColors(); } catch (_) {}
        }
        requestAnimationFrame(() => {
          overlay.style.opacity = '0';
          overlay.addEventListener('transitionend', () => {
            overlay.remove();
            document.documentElement.classList.remove('is-theming');
          }, { once: true });
        });
      }, 350);
    });
  }

  // Initialize theme
  const saved = getSaved();
  const initial = saved ? saved : (systemPrefersLight() ? 'light' : 'dark');
  applyTheme(initial);

  btn.addEventListener('click', () => {
    const next = currentTheme() === 'light' ? 'dark' : 'light';
    crossfadeTo(next);
  });

  // Sync with system preference if user hasn't chosen explicitly
  try {
    const mql = window.matchMedia('(prefers-color-scheme: light)');
    mql.addEventListener('change', () => {
      if (!getSaved()) applyTheme(systemPrefersLight() ? 'light' : 'dark');
    });
  } catch (_) {}
})();



// testimonials variables
const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");

// modal variable
const modalImg = document.querySelector("[data-modal-img]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalText = document.querySelector("[data-modal-text]");

// modal toggle function
const testimonialsModalFunc = function () {
  modalContainer.classList.toggle("active");
  overlay.classList.toggle("active");
}

// add click event to all modal items
for (let i = 0; i < testimonialsItem.length; i++) {

  testimonialsItem[i].addEventListener("click", function () {

    modalImg.src = this.querySelector("[data-testimonials-avatar]").src;
    modalImg.alt = this.querySelector("[data-testimonials-avatar]").alt;
    modalTitle.innerHTML = this.querySelector("[data-testimonials-title]").innerHTML;
    modalText.innerHTML = this.querySelector("[data-testimonials-text]").innerHTML;

    testimonialsModalFunc();

  });

}

// add click event to modal close button
modalCloseBtn.addEventListener("click", testimonialsModalFunc);
overlay.addEventListener("click", testimonialsModalFunc);



// custom select variables
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-selecct-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

select.addEventListener("click", function () { elementToggleFunc(this); });

// add event in all select items
for (let i = 0; i < selectItems.length; i++) {
  selectItems[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    elementToggleFunc(select);
    filterFunc(selectedValue);
    updateProjectGitHub(selectedValue);

  });

  //if(selectItems[i].innerText.toLowerCase() == "vets it guide")
  //{
  //  selectItems[i].click(); 
  //}
    
}


// Removed Material-style ripple effect per request

// filter variables
const filterItems = document.querySelectorAll("[data-filter-item]");

const filterFunc = function (selectedValue) {

  for (let i = 0; i < filterItems.length; i++) {

    
    if (selectedValue === "all") {
      filterItems[i].classList.add("active");
    } else if (selectedValue === filterItems[i].dataset.category) {
      filterItems[i].classList.add("active");
    } else {
      filterItems[i].classList.remove("active");
    }

  }

}

// Update single GitHub button under Projects based on current filter
function updateProjectGitHub(selectedValue) {
  const gh = document.getElementById('project-gh-global');
  if (!gh) return;
  const map = {
    'vets it guide': 'https://github.com/tanujranjith/vets2tech',
    'noteflow': 'https://github.com/tanujranjith/Notion-local-saving-clone',
    'netflow': 'https://github.com/tanujranjith/Notion-local-saving-clone',
    'pong (ai vs human)': 'https://github.com/tanujranjith/AI-Pong-Player',
    'endangered animals': 'https://github.com/tanujranjith/Drexel-CCI-summer-camp-project'
  };
  const url = map[selectedValue];
  if (url) {
    gh.style.display = 'block';
    const a = gh.querySelector('a');
    if (a) a.href = url;
  } else {
    gh.style.display = 'none';
  }
}

// add event in all filter button items for large screen
let lastClickedBtn = filterBtn[1];

for (let i = 0; i < filterBtn.length; i++) {

  filterBtn[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    filterFunc(selectedValue);
    updateProjectGitHub(selectedValue);

    lastClickedBtn.classList.remove("active");
    this.classList.add("active");
    lastClickedBtn = this;

  });

}

// Initialize GitHub button on load with default selection
try {
  const activeFilter = document.querySelector('.filter-item button.active');
  const initial = activeFilter ? activeFilter.innerText.toLowerCase() : 'vets it guide';
  updateProjectGitHub(initial);
} catch (_) {}



// contact form variables
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

// add event to all form input field
for (let i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener("input", function () {

    // check form validation
    if (form.checkValidity()) {
      formBtn.removeAttribute("disabled");
    } else {
      formBtn.setAttribute("disabled", "");
    }

  });
}



// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// add event to all nav link
for (let n = 0; n < navigationLinks.length; n++) {
  navigationLinks[n].addEventListener("click", function () {
    const target = this.textContent.trim().toLowerCase();

    // Deactivate all pages first
    for (let p = 0; p < pages.length; p++) {
      const isTarget = pages[p].dataset.page === target;
      pages[p].classList.toggle("active", isTarget);
      if (isTarget) {
        // Special handling for achievements page: reveal eagerly
        window.scrollTo(0, 0);
        if (target === 'achievements') {
          const achRoot = pages[p];
          achRoot.querySelectorAll('.blog-post-item').forEach(el => {
            el.setAttribute('data-reveal', '');
            el.classList.add('is-visible');
          });
          achRoot.querySelectorAll('.blog-post-item img').forEach(img => {
            try { img.loading = 'eager'; } catch (_) {}
            img.decoding = 'async';
            const src = img.getAttribute('src');
            if (src) { const pre = new Image(); pre.src = src; }
          });
        }
      }
    }

    // Update nav link states separately to avoid index mismatches
    for (let k = 0; k < navigationLinks.length; k++) {
      navigationLinks[k].classList.toggle('active', navigationLinks[k] === this);
    }
  });
}


// Open image links in a new window
const imgLinkElems = document.querySelectorAll("[img-link]");
for (let i = 0; i < imgLinkElems.length; i++) {
  imgLinkElems[i].addEventListener("click", function (e) {
    // If this is an image container, open its image in a new tab
    const img = this.querySelector('img');
    if (img && (img.currentSrc || img.src)) {
      e.preventDefault();
      const src = img.currentSrc || img.src;
      try { window.open(src, 'image-viewer-' + Date.now(), 'noopener,noreferrer,resizable=yes,scrollbars=yes,width=1200,height=800'); } catch (_) {}
    }
  });
}

// Also make clicking any image open it in a new tab
document.querySelectorAll('img').forEach(img => {
  img.style.cursor = img.style.cursor || 'zoom-in';
  img.addEventListener('click', (e) => {
    // Skip zoom for profile/any explicitly disabled images
    if (img.hasAttribute('data-no-zoom') || img.closest('.sidebar')) {
      return;
    }
    // If this image is inside a clickable project/blog link, let the link navigate
    const enclosingAnchor = img.closest('a[href]');
    if (enclosingAnchor && (enclosingAnchor.closest('.project-item') || enclosingAnchor.closest('.blog-post-item'))) {
      return; // allow normal link behavior
    }
    const src = img.currentSrc || img.src;
    if (src) {
      // Prevent parent anchors from hijacking when intent is to view the image
      e.preventDefault();
      e.stopPropagation();
      try { window.open(src, 'image-viewer-' + Date.now(), 'noopener,noreferrer,resizable=yes,scrollbars=yes,width=1200,height=800'); } catch (_) {}
    }
  });
});

// Delegated handler: ensure project/blog tiles also open their image when clicking the visual area
document.addEventListener('click', (e) => {
  // Only trigger for project tiles and blog list items, not sidebar avatar
  const tileImgContainer = e.target.closest('.project-img, .blog-post-item .blog-banner-box');
  if (!tileImgContainer) return;
  // If container is inside an anchor with href (project/blog tiles), let anchor navigate
  if (tileImgContainer.closest('a[href]')) return;
  const img = tileImgContainer.querySelector('img');
  if (!img) return;
  const src = img.currentSrc || img.src;
  if (!src) return;
  e.preventDefault();
  e.stopPropagation();
  try { window.open(src, 'image-viewer-' + Date.now(), 'noopener,noreferrer,resizable=yes,scrollbars=yes,width=1200,height=800'); } catch (_) {}
}, true);

// Explicitly open image when clicking the eye icon overlay on tiles
document.addEventListener('click', (e) => {
  const eye = e.target.closest('.project-item-icon-box, .blog-post-item-icon-box');
  if (!eye) return;
  const link = eye.closest('.project-item > a, .blog-post-item > a');
  const fig = eye.closest('figure');
  const img = fig && fig.querySelector('img');
  if (!img) return;
  const src = img.currentSrc || img.src;
  if (!src) return;

  // Determine if this project/blog tile should open the image instead of following the link
  let shouldOpenImage = true;
  if (link && link.getAttribute('href')) {
    const categoryEl = link.parentElement && link.parentElement.querySelector('.project-category');
    const category = (categoryEl && categoryEl.textContent || '').trim().toLowerCase();
    if (category && !category.includes('endangered animals')) {
      shouldOpenImage = false; // normal linked project: let link navigate
    }
  }

  if (!shouldOpenImage) return;

  e.preventDefault();
  e.stopPropagation();
  try { window.open(src, 'image-viewer-' + Date.now(), 'noopener,noreferrer,resizable=yes,scrollbars=yes,width=1200,height=800'); } catch (_) {}
}, true);

// Special case: Endangered Animals projects should open the image instead of the link
document.addEventListener('click', (e) => {
  const projectLink = e.target.closest('.project-item > a');
  if (!projectLink) return;
  const categoryEl = projectLink.parentElement && projectLink.parentElement.querySelector('.project-category');
  if (!categoryEl) return;
  const category = (categoryEl.textContent || '').trim().toLowerCase();
  if (category.includes('endangered') && category.includes('animals')) {
    const img = projectLink.querySelector('.project-img img');
    if (!img) return;
    const src = img.currentSrc || img.src;
    if (!src) return;
    e.preventDefault();
    e.stopPropagation();
    try { window.open(src, 'image-viewer-' + Date.now(), 'noopener,noreferrer,resizable=yes,scrollbars=yes,width=1200,height=800'); } catch (_) {}
  }
}, true);

/* -------------------------------------------------------
   Enhancements: Mac dark theme motion & a11y improvements
-------------------------------------------------------- */
(function () {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  // Ambient shimmer: decoupled from pointer (no event listeners)

  // Gentle autonomous shimmer using smooth random targets
  (function autoShimmer() {
    const ease = (t) => t * t * (3 - 2 * t);
    const minDur = prefersReduced ? 4000 : 3000;
    const maxDur = prefersReduced ? 8000 : 11000;
    const min = 15, max = 85; // keep away from edges
    let mx = 50, my = 50, sx = 50, sy = 50, tx = 50, ty = 50;
    let start = performance.now();
    let dur = minDur + Math.random() * (maxDur - minDur);

    const pick = () => {
      sx = mx; sy = my;
      tx = min + Math.random() * (max - min);
      ty = min + Math.random() * (max - min);
      start = performance.now();
      dur = minDur + Math.random() * (maxDur - minDur);
    };

    function frame() {
      const now = performance.now();
      let t = (now - start) / dur;
      if (t >= 1) { pick(); t = 0; }
      const k = ease(Math.max(0, Math.min(1, t)));
      mx = sx + (tx - sx) * k;
      my = sy + (ty - sy) * k;
      root.style.setProperty('--mx', mx.toFixed(2) + '%');
      root.style.setProperty('--my', my.toFixed(2) + '%');
      requestAnimationFrame(frame);
    }

    pick();
    requestAnimationFrame(frame);
  })();

  // Reveal-on-scroll using IntersectionObserver
  const markReveal = (selector) => {
    document.querySelectorAll(selector).forEach(el => el.setAttribute('data-reveal', ''));
  };
  markReveal('.service-item, .content-card, .project-item, .blog-post-item, .timeline-item, .clients-item, .contact-form, .mapbox');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });
    document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-visible'));
  }

  // Parallax disabled - tiles stay still

  // Particle Network Animation Background
  if (!prefersReduced) {
    const canvas = document.createElement('canvas');
    canvas.id = 'particle-network';
    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '0',
      pointerEvents: 'none',
      opacity: '1'
    });
    document.body.prepend(canvas);
    
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let mouse = { x: null, y: null, radius: 150 };
    let animationId;
    
    // Get theme colors
    const getColors = () => {
      const isDark = !document.documentElement.getAttribute('data-theme') || 
                     document.documentElement.getAttribute('data-theme') !== 'light';
      return {
        particle: isDark ? 'rgba(43, 106, 255, 0.6)' : 'rgba(43, 106, 255, 0.5)',
        particleAlt: isDark ? 'rgba(200, 168, 87, 0.5)' : 'rgba(180, 148, 67, 0.4)',
        line: isDark ? 'rgba(43, 106, 255, 0.15)' : 'rgba(43, 106, 255, 0.12)',
        lineHover: isDark ? 'rgba(200, 168, 87, 0.35)' : 'rgba(180, 148, 67, 0.3)'
      };
    };
    
    let colors = getColors();
    
    // Expose function for theme toggle
    window.__updateParticleColors = () => {
      colors = getColors();
    };
    
    // Resize handler
    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };
    
    // Particle class
    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 1;
        this.baseSize = this.size;
        this.speedX = (Math.random() - 0.5) * 0.8;
        this.speedY = (Math.random() - 0.5) * 0.8;
        this.color = Math.random() > 0.7 ? colors.particleAlt : colors.particle;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.02 + Math.random() * 0.02;
      }
      
      update() {
        // Pulse effect
        this.pulsePhase += this.pulseSpeed;
        this.size = this.baseSize + Math.sin(this.pulsePhase) * 0.5;
        
        // Movement
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Mouse interaction - particles gently attracted/repelled
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            const angle = Math.atan2(dy, dx);
            // Gentle push away from cursor
            this.x -= Math.cos(angle) * force * 1.5;
            this.y -= Math.sin(angle) * force * 1.5;
          }
        }
        
        // Boundary wrapping
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }
      
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        // Glow effect
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.size * 2
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    }
    
    // Initialize particles
    const initParticles = () => {
      particles = [];
      const particleCount = Math.min(80, Math.floor((width * height) / 15000));
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };
    
    // Draw connecting lines between nearby particles
    const drawConnections = () => {
      const maxDist = 150;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < maxDist) {
            const opacity = 1 - (dist / maxDist);
            
            // Check if near mouse for highlight effect
            let lineColor = colors.line;
            if (mouse.x !== null && mouse.y !== null) {
              const midX = (particles[i].x + particles[j].x) / 2;
              const midY = (particles[i].y + particles[j].y) / 2;
              const mouseDist = Math.sqrt(
                Math.pow(mouse.x - midX, 2) + Math.pow(mouse.y - midY, 2)
              );
              if (mouseDist < mouse.radius) {
                lineColor = colors.lineHover;
              }
            }
            
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = lineColor.replace(/[\d.]+\)$/, (opacity * 0.5) + ')');
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    };
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Update and draw particles
      particles.forEach(p => {
        p.color = Math.random() > 0.995 
          ? (Math.random() > 0.5 ? colors.particleAlt : colors.particle)
          : p.color;
        p.update();
        p.draw();
      });
      
      // Draw connections
      drawConnections();
      
      animationId = requestAnimationFrame(animate);
    };
    
    // Mouse tracking
    const hasFinePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
    if (hasFinePointer) {
      window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      }, { passive: true });
      
      window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
      });
    }
    
    // Initialize
    resize();
    window.addEventListener('resize', resize);
    animate();
    
    // Pause when tab not visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(animationId);
      } else {
        animate();
      }
    });
  }

  // Image performance: lazy/async + sizes
  document.querySelectorAll('.project-img img, .blog-banner-box img').forEach(img => {
    img.setAttribute('loading', img.getAttribute('loading') || 'lazy');
    img.setAttribute('decoding', 'async');
    if (!img.hasAttribute('sizes')) img.setAttribute('sizes', '(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw');
  });

  // A11y: label social icons
  document.querySelectorAll('.social-list a.social-link[href]').forEach(a => {
    if (!a.getAttribute('aria-label')) {
      try { a.setAttribute('aria-label', new URL(a.href).hostname.replace('www.','')); } catch (_) {}
    }
  });

  // Remove preview modal - direct links only
  document.querySelectorAll('.project-item > a .project-item-icon-box').forEach(iconBox => {
    iconBox.style.cursor = 'pointer';
    iconBox.addEventListener('click', (e) => {
      const link = iconBox.closest('a');
      if (link && link.href) {
        e.preventDefault();
        window.open(link.href, '_blank');
      }
    });
  });
})();
