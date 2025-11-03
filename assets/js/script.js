'use strict';



// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }



// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });



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

  });

  //if(selectItems[i].innerText.toLowerCase() == "vets it guide")
  //{
  //  selectItems[i].click(); 
  //}
    
}


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

// add event in all filter button items for large screen
let lastClickedBtn = filterBtn[1];

for (let i = 0; i < filterBtn.length; i++) {

  filterBtn[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    filterFunc(selectedValue);

    lastClickedBtn.classList.remove("active");
    this.classList.add("active");
    lastClickedBtn = this;

  });

}



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
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {

    for (let i = 0; i < pages.length; i++) {
      if (this.innerHTML.toLowerCase() === pages[i].dataset.page) {
        pages[i].classList.add("active");
        navigationLinks[i].classList.add("active");
        window.scrollTo(0, 0);
      } else {
        pages[i].classList.remove("active");
        navigationLinks[i].classList.remove("active");
      }
    }

  });
}


const imgLinkElems = document.querySelectorAll("[img-link]");
for (let i = 0; i < imgLinkElems.length; i++) {
  imgLinkElems[i].addEventListener("click", function (e) {
    e.preventDefault();
    // Do nothing - image preview disabled
  });
}

/* -------------------------------------------------------
   Enhancements: Mac dark theme motion & a11y improvements
-------------------------------------------------------- */
(function () {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Ambient shimmer following pointer (updates CSS vars)
  if (!prefersReduced) {
    let raf = null;
    const root = document.documentElement;
    // Store cursor position globally for blob interaction
    window.cursorPosition = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    
    const updateCursorPosition = (e) => {
      const { clientX:x, clientY:y } = e.touches ? e.touches[0] : e;
      window.cursorPosition.x = x;
      window.cursorPosition.y = y;
      
      // Calculate percentage for gradient positioning
      // The pseudo-element has inset: -20%, so it's 140% of viewport size
      // We need to account for the extended bounds
      const pseudoWidth = window.innerWidth * 1.4;
      const pseudoHeight = window.innerHeight * 1.4;
      const offsetX = window.innerWidth * 0.2;
      const offsetY = window.innerHeight * 0.2;
      
      // Position relative to pseudo-element (which extends 20% beyond viewport)
      const mx = ((x + offsetX) / pseudoWidth) * 100;
      const my = ((y + offsetY) / pseudoHeight) * 100;
      
      if (!raf) {
        raf = requestAnimationFrame(() => {
          root.style.setProperty('--mx', mx.toFixed(2) + '%');
          root.style.setProperty('--my', my.toFixed(2) + '%');
          raf = null;
        });
      }
    };
    
    window.addEventListener('pointermove', updateCursorPosition, { passive: true });
    window.addEventListener('touchmove', updateCursorPosition, { passive: true });
  }

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
      zIndex: '-2',
      pointerEvents: 'none',
      overflow: 'hidden'
    });
    document.body.prepend(floatingBlocksContainer);

    const blockCount = 8;
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
      const startX = Math.random() * 100;
      const startY = Math.random() * 100;
      const gradientX = 30 + Math.random() * 40;
      const gradientY = 30 + Math.random() * 40;
      const blobRadius = generateBlobRadius();
      
      // Give blobs initial random velocity for natural floating
      const initialVx = (Math.random() - 0.5) * 0.3;
      const initialVy = (Math.random() - 0.5) * 0.3;
      
      // Store blob data
      const blobData = {
        element: block,
        x: startX,
        y: startY,
        size: baseSize,
        vx: initialVx,
        vy: initialVy,
        radius: baseSize / 2
      };

      Object.assign(block.style, {
        position: 'absolute',
        width: `${baseSize}px`,
        height: `${baseSize}px`,
        left: `${startX}%`,
        top: `${startY}%`,
        background: i % 3 === 0 
          ? `radial-gradient(ellipse at ${gradientX}% ${gradientY}%, color-mix(in oklab, var(--blue) 12%, transparent), color-mix(in oklab, var(--blue) 4%, transparent))`
          : i % 3 === 1
          ? `radial-gradient(ellipse at ${gradientX}% ${gradientY}%, color-mix(in oklab, var(--gold) 10%, transparent), color-mix(in oklab, var(--gold) 3%, transparent))`
          : `radial-gradient(ellipse at ${gradientX}% ${gradientY}%, color-mix(in oklab, var(--blue) 9%, transparent), color-mix(in oklab, var(--gold) 4%, transparent))`,
        border: `none`,
        borderRadius: blobRadius,
        backdropFilter: 'blur(12px) saturate(140%)',
        WebkitBackdropFilter: 'blur(12px) saturate(140%)',
        boxShadow: `
          0 4px 16px rgba(0, 0, 0, 0.2),
          inset 0 -8px 16px color-mix(in oklab, var(--blue) 6%, transparent),
          inset 8px 8px 20px color-mix(in oklab, white 5%, transparent)
        `,
        opacity: '0.25',
        transform: `translate(-50%, -50%)`,
        transformOrigin: 'center center',
        transition: 'transform 0.2s ease-out, opacity 0.2s ease-out'
      });

      floatingBlocksContainer.appendChild(block);

      // No keyframe animations needed - pure JavaScript physics

      blocks.push(blobData);
    }

    // Natural floating blobs
    let interactionRaf = null;
    const updateBlobInteractions = () => {
      blocks.forEach(blob => {
        // Add gentle random drift for natural floating motion
        if (Math.random() < 0.1) { // 10% chance each frame
          blob.vx += (Math.random() - 0.5) * 0.03;
          blob.vy += (Math.random() - 0.5) * 0.03;
        }
        
        // Apply natural friction (slightly less for smoother movement)
        blob.vx *= 0.95;
        blob.vy *= 0.95;
        
        // Limit velocity (more relaxed for natural floating)
        const maxVel = 2.5;
        const currentSpeed = Math.sqrt(blob.vx * blob.vx + blob.vy * blob.vy);
        if (currentSpeed > maxVel) {
          blob.vx = (blob.vx / currentSpeed) * maxVel;
          blob.vy = (blob.vy / currentSpeed) * maxVel;
        }
        
        // Update position
        blob.x += blob.vx;
        blob.y += blob.vy;
        
        // Keep within viewport bounds (soft boundaries)
        const margin = (blob.radius / window.innerWidth) * 100;
        if (blob.x < margin) {
          blob.x = margin;
          blob.vx *= -0.8; // Gentle bounce off edge
        }
        if (blob.x > 100 - margin) {
          blob.x = 100 - margin;
          blob.vx *= -0.8;
        }
        if (blob.y < margin) {
          blob.y = margin;
          blob.vy *= -0.8;
        }
        if (blob.y > 100 - margin) {
          blob.y = 100 - margin;
          blob.vy *= -0.8;
        }
        
        // Apply position
        blob.element.style.left = `${blob.x}%`;
        blob.element.style.top = `${blob.y}%`;
      });
      
      interactionRaf = requestAnimationFrame(updateBlobInteractions);
    };
    
    // Start interaction loop
    updateBlobInteractions();
    
    // Update positions on resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        blocks.forEach(blob => {
          // Maintain position relative to viewport
          const computedStyle = window.getComputedStyle(blob.element);
          const left = parseFloat(computedStyle.left);
          const top = parseFloat(computedStyle.top);
          blob.x = (left / window.innerWidth) * 100;
          blob.y = (top / window.innerHeight) * 100;
          // Keep within bounds
          blob.x = Math.max(0, Math.min(100, blob.x));
          blob.y = Math.max(0, Math.min(100, blob.y));
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
    const blobs = new Array(10).fill(0).map((_, i) => {
      const baseRadius = 120 + Math.random() * 180;
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        c1: 'rgba(43,106,255,0.08)',
        c2: 'rgba(200,168,87,0.06)',
        baseR: baseRadius, // Store base radius for interaction
        interactionDistance: 200 // Distance threshold for cursor interaction
      };
    });
    let animId;
    const draw = () => {
      ctx.clearRect(0,0,canvas.width, canvas.height);
      const cursor = window.cursorPosition || { x: canvas.width / 2, y: canvas.height / 2 };
      
      blobs.forEach(b => {
        // Calculate distance from cursor to blob center
        const dx = cursor.x - b.x;
        const dy = cursor.y - b.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // If cursor is near, apply repulsion effect
        let interactionFactor = 1;
        if (distance < b.interactionDistance) {
          // Calculate repulsion force (stronger when closer)
          const repulsionStrength = (b.interactionDistance - distance) / b.interactionDistance;
          const angle = Math.atan2(dy, dx);
          const force = repulsionStrength * 0.5;
          b.vx += Math.cos(angle) * force;
          b.vy += Math.sin(angle) * force;
          // Slightly grow when near cursor
          interactionFactor = 1 + repulsionStrength * 0.3;
        }
        
        // Apply friction to slow down interaction velocity
        b.vx *= 0.98;
        b.vy *= 0.98;
        
        // Limit maximum velocity
        const maxVel = 1;
        const currentSpeed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        if (currentSpeed > maxVel) {
          b.vx = (b.vx / currentSpeed) * maxVel;
          b.vy = (b.vy / currentSpeed) * maxVel;
        }
        
        // Continue autonomous movement
        b.x += b.vx;
        b.y += b.vy;
        
        // Bounce off edges
        const maxR = b.baseR * 1.3; // Account for max interaction size
        if (b.x < -maxR) b.x = canvas.width + maxR;
        if (b.x > canvas.width + maxR) b.x = -maxR;
        if (b.y < -maxR) b.y = canvas.height + maxR;
        if (b.y > canvas.height + maxR) b.y = -maxR;
        
        // Draw blob with interaction size
        const currentR = b.baseR * interactionFactor;
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
