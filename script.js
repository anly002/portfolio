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
    if (window.innerWidth > DESKTOP_BP && mobileMenu.classList.caontains("open")){
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

nextButton.onclick = function(){
    showSlider('next');
}
prevButton.onclick = function(){
    showSlider('prev');
}
let unAcceppClick;
const showSlider = (type) => {
    nextButton.style.pointerEvents = 'none';
    prevButton.style.pointerEvents = 'none';

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
        nextButton.style.pointerEvents = 'auto';
        prevButton.style.pointerEvents = 'auto';
    }, 900)
}
seeMoreButtons.forEach((button) => {
    button.onclick = function(){
        carousel.classList.remove('next', 'prev');
        carousel.classList.add('showDetail');
    }
});
backButton.onclick = function(){
    carousel.classList.remove('showDetail');
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
