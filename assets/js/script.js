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
        if (typeof window.__updateCanvasBlobColors === 'function') {
          try { window.__updateCanvasBlobColors(); } catch (_) {}
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
  const tileImgContainer = e.target.closest('.project-img, .blog-banner-box');
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

  // Floating glass blocks background
  if (!prefersReduced) {
    const floatingBlocksContainer = document.createElement('div');
    floatingBlocksContainer.setAttribute('aria-hidden', 'true');
    Object.assign(floatingBlocksContainer.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '0',
      pointerEvents: 'none',
      overflow: 'hidden'
    });
    document.body.prepend(floatingBlocksContainer);

    const blockCount = 14; // increased visible floating blobs
    const blocks = [];

    // Helper to generate organic blob border-radius
    const generateBlobRadius = () => {
      const values = [];
      for (let i = 0; i < 8; i++) {
        const base = 40 + Math.random() * 25; // 40-65% variation
        values.push(`${base}%`);
      }
      return `${values[0]} ${values[1]} ${values[2]} ${values[3]} / ${values[4]} ${values[5]} ${values[6]} ${values[7]}`;
    };

    for (let i = 0; i < blockCount; i++) {
      const block = document.createElement('div');
      const baseSize = 40 + Math.random() * 60; // Smaller: 40-100px
      const leftBias = i < Math.ceil(blockCount * 0.35);
      const startX = leftBias ? (2 + Math.random() * 28) : (Math.random() * 100);
      const startY = Math.random() * 100;
      const gradientX = 30 + Math.random() * 40;
      const gradientY = 30 + Math.random() * 40;
      let blobRadius = generateBlobRadius();
      
      // Store blob data using smooth random target wandering (no oscillation, no cursor)
      const now = performance.now();
      const ease = (t) => t * t * (3 - 2 * t);
      const dur = () => (prefersReduced ? 6000 : 9000) + Math.random() * (prefersReduced ? 4000 : 9000);
      const minX = leftBias ? 2 : 5;
      const maxX = leftBias ? 35 : 95;
      const minY = 5, maxY = 95;
      const target1 = { x: minX + Math.random() * (maxX - minX), y: minY + Math.random() * (maxY - minY) };
      const blobData = {
        element: block,
        size: baseSize,
        radius: baseSize / 2,
        sx: startX, sy: startY,
        tx: target1.x, ty: target1.y,
        start: now,
        dur: dur(),
        ease,
        minX, maxX, minY, maxY,
        ix: 0, iy: 0, ivx: 0, ivy: 0
      };

      Object.assign(block.style, {
        position: 'absolute',
        width: `${baseSize}px`,
        height: `${baseSize}px`,
        left: `${startX}%`,
        top: `${startY}%`,
        // Brighter, more vivid gradients
        background: i % 3 === 0 
          ? `radial-gradient(ellipse at ${gradientX}% ${gradientY}%, color-mix(in oklab, var(--blob-accent-1) 32%, transparent), color-mix(in oklab, var(--blob-accent-1) 18%, transparent))`
          : i % 3 === 1
          ? `radial-gradient(ellipse at ${gradientX}% ${gradientY}%, color-mix(in oklab, var(--blob-accent-2) 30%, transparent), color-mix(in oklab, var(--blob-accent-2) 16%, transparent))`
          : `radial-gradient(ellipse at ${gradientX}% ${gradientY}%, color-mix(in oklab, var(--blob-accent-1) 26%, transparent), color-mix(in oklab, var(--blob-accent-2) 16%, transparent))`,
        border: `none`,
        borderRadius: blobRadius,
        backdropFilter: 'blur(10px) saturate(180%)',
        WebkitBackdropFilter: 'blur(10px) saturate(180%)',
        mixBlendMode: 'screen',
        boxShadow: `
          0 8px 28px rgba(0, 0, 0, 0.25),
          inset 0 -10px 20px color-mix(in oklab, var(--blue) 10%, transparent),
          inset 10px 10px 30px color-mix(in oklab, white 8%, transparent)
        `,
        opacity: 'var(--blob-opacity, 0.30)',
        transform: `translate(-50%, -50%)`,
        transformOrigin: 'center center',
        transition: 'transform 0.2s ease-out, opacity 0.2s ease-out, border-radius 3s ease-in-out, filter 400ms ease'
      });

      floatingBlocksContainer.appendChild(block);

      // No keyframe animations needed - pure JavaScript physics

      blocks.push(blobData);
    }

    // Cursor blob (separate visual that follows pointer) — only on fine pointers
    const hasFinePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
    let cursorBlob = null;
    const cursor = { x: 50, y: 50, tx: 50, ty: 50, active: false };
    const toPct = (x, y) => ({ x: (x / window.innerWidth) * 100, y: (y / window.innerHeight) * 100 });
    if (hasFinePointer) {
      cursorBlob = document.createElement('div');
      cursorBlob.setAttribute('aria-hidden', 'true');
      Object.assign(cursorBlob.style, {
        position: 'fixed', left: '50%', top: '50%', width: '110px', height: '110px',
        borderRadius: '50%', pointerEvents: 'none', zIndex: '-1', mixBlendMode: 'screen',
        background: 'radial-gradient(circle at 50% 50%, rgba(43,106,255,0.18), rgba(43,106,255,0.0) 60%)',
        filter: 'blur(10px)', transform: 'translate(-50%, -50%)', transition: 'opacity 200ms ease', opacity: '0.45'
      });
      document.body.appendChild(cursorBlob);
      const onMove = (e) => {
        const p = e.touches ? e.touches[0] : e;
        const pct = toPct(p.clientX, p.clientY);
        cursor.tx = pct.x; cursor.ty = pct.y; cursor.active = true;
        cursorBlob.style.opacity = '0.9';
      };
      const onLeave = () => { cursor.active = false; cursorBlob.style.opacity = '0.45'; };
      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('pointerleave', onLeave);
    }

    // Smooth random wander loop
    const updateBlobWander = () => {
      const now = performance.now();
      // Update cursor blob position (only on fine pointers)
      if (hasFinePointer && cursorBlob) {
        cursor.x += (cursor.tx - cursor.x) * 0.12;
        cursor.y += (cursor.ty - cursor.y) * 0.12;
        cursorBlob.style.left = `${cursor.x}%`;
        cursorBlob.style.top = `${cursor.y}%`;
      } else {
        cursor.active = false; // disable interactions on coarse pointers to avoid glitches
      }

      blocks.forEach(blob => {
        let t = (now - blob.start) / blob.dur;
        if (t >= 1) {
          // advance to next random target
          blob.sx = blob.tx; blob.sy = blob.ty;
          const nx = blob.minX + Math.random() * (blob.maxX - blob.minX);
          const ny = blob.minY + Math.random() * (blob.maxY - blob.minY);
          blob.tx = nx; blob.ty = ny;
          blob.start = now;
          blob.dur = (prefersReduced ? 6000 : 9000) + Math.random() * (prefersReduced ? 4000 : 9000);
          t = 0;
        }
        const k = blob.ease(Math.max(0, Math.min(1, t)));
        let x = blob.sx + (blob.tx - blob.sx) * k;
        let y = blob.sy + (blob.ty - blob.sy) * k;

        // Organic shape morphing: occasionally morph border radius
        if (Math.random() < 0.015) {
          blob.element.style.borderRadius = generateBlobRadius();
        }

        // Graceful cursor interaction using spring-damped smooth forces
        // Parameters tuned for fluid, non-jittery behavior
        const interactionRadius = prefersReduced ? 8 : 10; // percent of viewport
        const maxAccel = prefersReduced ? 0.22 : 0.32;      // acceleration cap
        const damping = 0.86;                               // velocity damping
        const springK = 0.06;                               // restore-to-center

        // Compute acceleration from cursor repulsion (smoothstep kernel)
        let ax = (-blob.ix) * springK;
        let ay = (-blob.iy) * springK;

        if (cursor.active) {
          const dx = x - cursor.x;
          const dy = y - cursor.y;
          const dist = Math.hypot(dx, dy) || 0.0001;
          if (dist < interactionRadius) {
            const s = 1 - (dist / interactionRadius);
            const kernel = s * s * (3 - 2 * s); // smoothstep
            const ux = dx / dist;
            const uy = dy / dist;
            ax += ux * kernel * maxAccel;
            ay += uy * kernel * maxAccel;

            // Subtle visual "slime" effect: soften + brighten slightly near cursor
            const blurPx = 0.6 + kernel * 1.0;
            const sat = 1.15 + kernel * 0.25;
            const bri = 1.00 + kernel * 0.08;
            blob.element.style.filter = `blur(${blurPx}px) saturate(${sat}) brightness(${bri})`;
          } else {
            // Away from cursor: return to base look
            blob.element.style.filter = 'blur(0.6px) saturate(1.15) brightness(1.0)';
          }
        }
        else {
          blob.element.style.filter = 'blur(0.6px) saturate(1.15) brightness(1.0)';
        }

        // Integrate with damping
        blob.ivx = (blob.ivx + ax) * damping;
        blob.ivy = (blob.ivy + ay) * damping;
        blob.ix += blob.ivx;
        blob.iy += blob.ivy;

        // Clamp max interaction offset
        const maxOffset = 5; // percent
        const offMag = Math.hypot(blob.ix, blob.iy);
        if (offMag > maxOffset) {
          const s = maxOffset / offMag; blob.ix *= s; blob.iy *= s;
        }

        const fx = Math.max(0, Math.min(100, x + blob.ix));
        const fy = Math.max(0, Math.min(100, y + blob.iy));
        blob.element.style.left = `${fx}%`;
        blob.element.style.top = `${fy}%`;
      });
      requestAnimationFrame(updateBlobWander);
    };

    // Start wander loop
    updateBlobWander();
    
    // Update positions on resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        blocks.forEach(blob => {
          const cs = window.getComputedStyle(blob.element);
          const left = parseFloat(cs.left);
          const top = parseFloat(cs.top);
          const xPct = (left / window.innerWidth) * 100;
          const yPct = (top / window.innerHeight) * 100;
          blob.sx = blob.tx = Math.max(0, Math.min(100, xPct));
          blob.sy = blob.ty = Math.max(0, Math.min(100, yPct));
          blob.start = performance.now();
          blob.dur = prefersReduced ? 4000 : 6000;
        });
      }, 100);
    });
  }

  // Optional gradient field (very light) behind content
  if (!prefersReduced) {
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, { position: 'fixed', inset: '0', zIndex: '0', pointerEvents: 'none', opacity: '0.35' });
    const ctx = canvas.getContext('2d', { alpha: true });
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    document.body.prepend(canvas);
    const getCanvasColors = () => {
      const styles = getComputedStyle(document.documentElement);
      return {
        c1: (styles.getPropertyValue('--canvas-blob-1') || 'rgba(43,106,255,0.14)').trim(),
        c2: (styles.getPropertyValue('--canvas-blob-2') || 'rgba(200,168,87,0.12)').trim()
      };
    };
    let canvasColors = getCanvasColors();
    const blobs = new Array(14).fill(0).map(() => { // increased subtle canvas glows
      const baseRadius = 120 + Math.random() * 180;
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        // colors from CSS variables so theme can adjust
        c1: canvasColors.c1,
        c2: canvasColors.c2,
        baseR: baseRadius
      };
    });
    // Allow theme toggle to refresh canvas colors
    window.__updateCanvasBlobColors = () => {
      canvasColors = getCanvasColors();
      blobs.forEach(b => { b.c1 = canvasColors.c1; b.c2 = canvasColors.c2; });
    };
    let animId;
    const draw = () => {
      ctx.clearRect(0,0,canvas.width, canvas.height);
      
      blobs.forEach(b => {
        // Occasional tiny random changes to heading
        if (Math.random() < 0.03) {
          b.vx += (Math.random() - 0.5) * 0.06;
          b.vy += (Math.random() - 0.5) * 0.06;
        }
        // Friction + clamp
        b.vx *= 0.99; b.vy *= 0.99;
        const maxVel = 0.7;
        const speed = Math.hypot(b.vx, b.vy);
        if (speed > maxVel) { b.vx = (b.vx / speed) * maxVel; b.vy = (b.vy / speed) * maxVel; }

        // Move
        b.x += b.vx; b.y += b.vy;

        // Wrap around edges softly
        const maxR = b.baseR;
        if (b.x < -maxR) b.x = canvas.width + maxR;
        if (b.x > canvas.width + maxR) b.x = -maxR;
        if (b.y < -maxR) b.y = canvas.height + maxR;
        if (b.y > canvas.height + maxR) b.y = -maxR;

        // Draw blob
        const currentR = b.baseR;
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, currentR);
        g.addColorStop(0, b.c1);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(b.x, b.y, currentR, 0, Math.PI*2); ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    animId = requestAnimationFrame(draw);
    window.addEventListener('blur', () => animId && cancelAnimationFrame(animId));
    window.addEventListener('focus', () => animId = requestAnimationFrame(draw));
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
