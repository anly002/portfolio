// mobilemenu

document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("menuBtn");
  const mobileMenu = document.getElementById("mobile-menu");

  if (!menuBtn || !mobileMenu){
    return;
  }
  
  const openMenu = () => {
    mobileMenu.classList.add("open");
    document.body.classList.add("menu-open");
    menuBtn.classList.remove("fa-bars");
    menuBtn.classList.add("fa-xmark");
    menuBtn.setAttribute("aria-expanded", "true");
    mobileMenu.setAttribute("aria-hidden", "false");
  };
  const closeMenu = () => {
    mobileMenu.classList.remove("open");
    document.body.classList.remove("menu-open");
    menuBtn.classList.remove("fa-xmark");
    menuBtn.classList.add("fa-bars");
    menuBtn.setAttribute("aria-expanded", "false");
    mobileMenu.setAttribute("aria-hidden", "true");
  };
  const toggleMenu = () => {
    if (mobileMenu.classList.contains("open")){
      closeMenu();
    }
    else{
      openMenu();
    }
  };

  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  mobileMenu.querySelectorAll("a[href]").forEach(a => {
    a.addEventListener("click", closeMenu);
  });

  const outsideHandler = (e) => {
    if (!mobileMenu.classList.contains("open")){
      return;
    }
    const clickedInsideMenu = mobileMenu.contains(e.target);
    const clickedButton = menuBtn.contains(e.target);
    if (!clickedInsideMenu && !clickedButton){
      closeMenu();
    }
  };
  document.addEventListener("click", outsideHandler, true);
  document.addEventListener("touchstart", outsideHandler, { passive: true, capture: true});

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobileMenu.classList.contains("open")) closeMenu();
  });

  const DESKTOP_BP = 950;
  window.addEventListener("resize", () => {
    if (window.innerWidth > DESKTOP_BP && mobileMenu.classList.contains("open")){
      closeMenu();
    }
  });
});

// button glow


const buttons = document.querySelectorAll('.btn, .btn-email');

buttons.forEach((btn) => {
  let currentX = btn.offsetWidth * 0.98;
  let targetX  = currentX;
  let rafId = null;

  const setX = (x) => btn.style.setProperty('--x', `${x}px`);

  const animate = () => {
    const ease = 0.2;
    currentX += (targetX - currentX) * ease;

    if (Math.abs(targetX - currentX) < 0.5) {
      currentX = targetX;
      setX(currentX);
      rafId = null;
      return;
    }
    setX(currentX);
    rafId = requestAnimationFrame(animate);
  };

  const kick = () => {
    if (rafId === null) rafId = requestAnimationFrame(animate);
  };

  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    targetX = e.clientX - rect.left;
    kick();
  });

  btn.addEventListener('mouseenter', kick);
  window.addEventListener('resize', () => {
    targetX = btn.offsetWidth * 0.98;
    kick();
  });

  setX(currentX);
});



// project slider


document.addEventListener("DOMContentLoaded", () => {
  const thumb    = document.querySelector(".slider-thumb");
  const host     = document.querySelector(".scroll-slider");
  const list     = document.querySelector(".slider-stops");
  const stops    = [...document.querySelectorAll(".slider-stops a")];
  const sections = [...document.querySelectorAll(".project")];

  if (!thumb || !host || !list || !stops.length || !sections.length) return;

  const idToLink = new Map(
    stops.map(a => [a.getAttribute("href").slice(1), a])
  );

  const yForLink = (link) => {
    const linkRect = link.getBoundingClientRect();
    const hostRect = host.getBoundingClientRect();
    return (linkRect.top - hostRect.top) + (linkRect.height / 2);
  };

  const clampY = (y) => {
    const tRect = list.getBoundingClientRect();
    const hRect = host.getBoundingClientRect();
    const topY = (tRect.top - hRect.top);
    const botY = (tRect.bottom - hRect.top);
    const r = 9;
    return Math.max(topY + r, Math.min(y, botY - r));
  };

  const snapToId = (id) => {
    const link = idToLink.get(id);
    if (!link) return;
    stops.forEach(a => a.classList.toggle("active", a === link));
    const y = clampY(yForLink(link));
    thumb.style.setProperty("--slider-y", `${y}px`);
    lastActiveId = id;
  };

  const viewportH = () => window.innerHeight || document.documentElement.clientHeight;
  const mostVisibleSectionId = () => {
    const vh = viewportH();
    let bestId = sections[0].id;
    let bestRatio = -1;
    for (const sec of sections) {
      const r = sec.getBoundingClientRect();
      const visible = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
      const ratio = visible / Math.max(1, r.height);
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestId = sec.id;
      }
    }
    return bestId;
  };

  let ticking = false;
  let lastActiveId = null;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const nextId = mostVisibleSectionId();
      if (nextId && nextId !== lastActiveId) snapToId(nextId);
      ticking = false;
    });
  };

  snapToId(mostVisibleSectionId());
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    snapToId(mostVisibleSectionId());
  });

  stops.forEach(a => {
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
});



// copyright year


document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year').textContent = new Date().getFullYear();
});



// fan spin

document.addEventListener('DOMContentLoaded', () => {
  const fans = document.querySelectorAll('.fan-spin');
  fans.forEach(setupFanSpin);
});

function setupFanSpin(node) {
  const slow = 360 / 1.0;
  const fast = 360 / 0.2;

  let angle = 0;
  let current = slow;
  let target = slow;

  const ease = 0.3;

  node.addEventListener('mouseenter', () => { target = fast; });
  node.addEventListener('mouseleave', () => { target = slow; });

  let last = performance.now();
  function tick(now) {
    const dt = (now - last) / 1000;
    last = now;
    current += (target - current) * Math.min(1, ease * dt);
    angle = (angle + current * dt) % 360;
    node.style.transform = `rotate(${angle}deg)`;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}


// carousel


let nextButton = document.getElementById('next');
let prevButton = document.getElementById('prev');
let carousel = document.querySelector('.carousel');
let listHTML = document.querySelector('.carousel .list');
let seeMoreButtons = document.querySelectorAll('.seeMore');
let backButton = document.getElementById('back');

if (carousel && listHTML) {
  if (nextButton) nextButton.onclick = function(){ showSlider('next'); };
  if (prevButton) prevButton.onclick = function(){ showSlider('prev'); };

  let unAcceppClick;
  const showSlider = (type) => {
  if (nextButton) nextButton.style.pointerEvents = 'none';
  if (prevButton) prevButton.style.pointerEvents = 'none';

  carousel.classList.remove('next', 'prev');
  let items = document.querySelectorAll('.carousel .list .item');
  if(type === 'next'){
    listHTML.appendChild(items[0]);
    carousel.classList.add('next');
  }else{
    listHTML.prepend(items[items.length - 1]);
    carousel.classList.add('prev');
  }
  clearTimeout(unAcceppClick);
  unAcceppClick = setTimeout(()=>{
    if (nextButton) nextButton.style.pointerEvents = 'auto';
    if (prevButton) prevButton.style.pointerEvents = 'auto';
  }, 900)
  }

  seeMoreButtons.forEach((button) => {
    button.onclick = function(){
      carousel.classList.remove('next', 'prev');
      carousel.classList.add('showDetail');
    }
  });
  if (backButton) backButton.onclick = function(){ carousel.classList.remove('showDetail'); }
}


// artprev play


document.addEventListener("DOMContentLoaded", () => {
  const videos = document.querySelectorAll(".project-preview-video");

  videos.forEach(video => {
    const parent = video.closest(".project-preview");

    parent.addEventListener("mouseenter", () => {
      video.play();
    });

    parent.addEventListener("mouseleave", () => {
      video.pause();
      video.currentTime = 0;
    });
  });
});


// slider1


(() => {
  const slider = document.querySelector('.banner .slider');
  if (!slider) return;
  let angle = 0;
  let velocity = 0;
  let autoSpin = true;
  let lastT = 0;
  let resumeTimer = null;
  const BASE_SPEED = -360 / 40;
  const DEGREES_PER_PX = 0.1;
  const FRICTION_PER_FRAME = 0.92; 

  function tick(t) {
    if (!lastT) lastT = t;
    const dt = (t - lastT) / 1000;
    if (autoSpin) angle += BASE_SPEED * dt;
    angle += velocity * dt;
    velocity *= Math.pow(FRICTION_PER_FRAME, dt * 60);
    slider.style.setProperty('--ry', `${angle}deg`);
    lastT = t;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  let dragging = false;
  let lastX = 0;
  let lastMoveTime = 0;

  const onPointerDown = (e) => {
    dragging = true;
    autoSpin = false;
    lastX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    lastMoveTime = performance.now();
    velocity = 0;
    slider.setPointerCapture?.(e.pointerId);
    e.preventDefault?.();
  };

  const onPointerMove = (e) => {
    if (!dragging) return;
    const x = e.clientX ?? e.touches?.[0]?.clientX ?? lastX;
    const dx = x - lastX;
    const now = performance.now();
    const dt = Math.max( (now - lastMoveTime) / 1000, 1/120 );
    angle += dx * DEGREES_PER_PX;
    velocity = (dx * DEGREES_PER_PX) / dt;
    lastX = x;
    lastMoveTime = now;
  };

  const endDrag = (e) => {
    if (!dragging) return;
    dragging = false;
    slider.releasePointerCapture?.(e.pointerId);
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => { autoSpin = true; }, 900);
  };

  slider.addEventListener('pointerdown', onPointerDown);
  slider.addEventListener('pointermove', onPointerMove);
  slider.addEventListener('pointerup', endDrag);
  slider.addEventListener('pointercancel', endDrag);
  slider.addEventListener('pointerleave', (e) => {
    if (dragging) endDrag(e);
  });

  slider.addEventListener('touchmove', (e) => {
    if (dragging) e.preventDefault();
  }, { passive: false });
})();


// slider 2

const slider2 = document.querySelector('.slider2');
if (slider2) {
  let isDown = false;
  let startX = 0;
  let startScroll = 0;

  slider2.addEventListener('mousedown', (e) => {
    isDown = true;
    slider2.classList.add('grabbing');
    startX = e.pageX;
    startScroll = slider2.scrollLeft;
    e.preventDefault();
  });

  document.addEventListener('mouseup', () => {
    isDown = false;
    slider2.classList.remove('grabbing');
  });

  slider2.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    const dx = e.pageX - startX;
    const speed = 1.2;
    slider2.scrollLeft = startScroll - dx * speed;
  });
}


// lightbox

const lightbox = document.getElementById('lightbox');
if (lightbox) {
  const lbImg = lightbox.querySelector('.lightbox-img');
  const lbBackdrop = lightbox.querySelector('.lightbox-backdrop');

  function openLightbox(src) {
    if (!lbImg) return;
    lbImg.src = src;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    if (lbImg) lbImg.src = '';
    document.body.style.overflow = '';
  }

  if (slider2) {
    slider2.addEventListener('click', (e) => {
      const img = e.target.closest('.item2 img');
      if (!img) return;
      const full = img.getAttribute('data-full') || img.src;
      openLightbox(full);
    });
  }

  if (lbBackdrop) lbBackdrop.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
}


// scroll reveal


document.addEventListener('DOMContentLoaded', () => {
  const inspElements = document.querySelectorAll('.art-inspiration-text');
  if (!inspElements.length) return;

  function splitIntoLines(el) {
    const text = el.textContent.replace(/\s+/g, ' ').trim();
    if (!text) return;
    el.innerHTML = '';
    const words = text.split(' ');
    const wordSpans = words.map(w => {
      const s = document.createElement('span');
      s.className = 'w';
      s.textContent = w + ' ';
      s.style.display = 'inline-block';
      el.appendChild(s);
      return s;
    });

    const lines = [];
    let lastTop = null;
    wordSpans.forEach(ws => {
      const top = ws.offsetTop;
      if (lastTop === null || Math.abs(top - lastTop) > 2) {
        lines.push([ws]);
        lastTop = top;
      } else {
        lines[lines.length - 1].push(ws);
      }
    });

    el.innerHTML = '';
    lines.forEach((group, idx) => {
      const lineWrap = document.createElement('span');
      lineWrap.className = 'line';
      lineWrap.style.setProperty('--delay', `${idx * 130}ms`);
      group.forEach(g => {
        g.style.display = '';
        lineWrap.appendChild(g);
      });
      el.appendChild(lineWrap);
    });
  }

  inspElements.forEach(el => splitIntoLines(el));

  let prevScrollY = window.scrollY;
  let scrollDir = 'down';
  window.addEventListener('scroll', () => {
    const current = window.scrollY;
    if (current > prevScrollY) scrollDir = 'down';
    else if (current < prevScrollY) scrollDir = 'up';
    prevScrollY = current;
  }, { passive: true });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;
      const isIntersecting = entry.isIntersecting;
      const scrollingDown = (scrollDir === 'down');

      const LINES = el.querySelectorAll('.line');
      const TOTAL = LINES.length;
      const DELAY_MS = 130;

      if (isIntersecting) {
        LINES.forEach((ln, i) => ln.style.setProperty('--delay', `${i * DELAY_MS}ms`));
        el.style.setProperty('--after-delay', `${TOTAL * DELAY_MS}ms`);
        el.classList.add('show');
      } else {
        if (!scrollingDown) {
          LINES.forEach((ln, i) => ln.style.setProperty('--delay', `${(TOTAL - 1 - i) * DELAY_MS}ms`));
          el.style.setProperty('--after-delay', `0ms`);
          void el.offsetHeight;
          el.classList.remove('show');
        }
      }
    });
  }, { threshold: 1, rootMargin: '0px 0px -10% 0px' });

  inspElements.forEach(el => observer.observe(el));
});