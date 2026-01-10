// js/main.js
console.log("Project flower loaded");

// === PARALLAX (bg + title move + cut for white overlay) ===
(function () {
  const section = document.querySelector(".parallax");
  if (!section) return;

  const bg = section.querySelector(".parallax__bg");
  const title = section.querySelector("[data-parallax-title]");
  if (!bg || !title) return;

  const BG_AMPLITUDE = 140;
  const BG_SPEED = 0.25;
  const TITLE_START_TOP = 1500;
  const TITLE_END_TOP = 240;

  const clamp01 = (v) => Math.max(0, Math.min(1, v));

  let ticking = false;

  function update() {
    ticking = false;

    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;

    // если секция сильно вне экрана — не считаем
    if (rect.bottom < 0 || rect.top > vh) return;

    const progress = clamp01((vh - rect.top) / vh);

    // 1) фон — ТОЛЬКО Y через переменную
    const bgShift = (progress - 0.5) * BG_AMPLITUDE * BG_SPEED;
    bg.style.setProperty("--bg-y", `${bgShift}px`);

    // 2) заголовок
    const titleTop = TITLE_START_TOP + (TITLE_END_TOP - TITLE_START_TOP) * progress;
    title.style.top = `${titleTop}px`;

    // 3) cut
    const bgRect = bg.getBoundingClientRect();
    const titleRect = title.getBoundingClientRect();

    const overlapBottom = Math.min(titleRect.bottom, bgRect.bottom);

    let cutPx = 0;
    if (overlapBottom > titleRect.top) {
      cutPx = overlapBottom - titleRect.top;
      cutPx = Math.max(0, Math.min(cutPx, titleRect.height));
    }

    title.style.setProperty("--cut", `${cutPx}px`);
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  const scrollEl = document.scrollingElement || document.documentElement;

  // максимально надёжно:
  window.addEventListener("scroll", requestUpdate, { passive: true });
  document.addEventListener("scroll", requestUpdate, { passive: true, capture: true });
  scrollEl.addEventListener("scroll", requestUpdate, { passive: true });

  window.addEventListener("resize", requestUpdate);
  window.addEventListener("load", requestUpdate);

  // первый запуск
  requestUpdate();
})();



// ===== mini slider for bouquet cards =====
(function () {
  const sliders = document.querySelectorAll("[data-slider]");
  if (!sliders.length) return;

  sliders.forEach((slider) => {
    const slides = slider.querySelectorAll("[data-slide]");
    const dots = slider.querySelectorAll("[data-dot]");
    if (!slides.length || !dots.length) return;

    function setActive(index) {
      slides.forEach((img) => img.classList.remove("is-active"));
      dots.forEach((btn) => btn.classList.remove("is-active"));

      const activeSlide = slider.querySelector(`[data-slide="${index}"]`);
      const activeDot = slider.querySelector(`[data-dot="${index}"]`);
      if (activeSlide) activeSlide.classList.add("is-active");
      if (activeDot) activeDot.classList.add("is-active");
    }

    dots.forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = btn.getAttribute("data-dot");
        setActive(index);
      });
    });
  });
})();

// FAQ accordion
(function () {
  const items = document.querySelectorAll(".faq__item");
  if (!items.length) return;

  items.forEach((item) => {
    const btn = item.querySelector(".faq__question");
    const answer = item.querySelector(".faq__answer");
    if (!btn || !answer) return;

    btn.addEventListener("click", () => {
      const isOpen = btn.getAttribute("aria-expanded") === "true";

      // если хочешь чтобы открывался только один — раскомментируй:
      // items.forEach((i) => {
      //   const b = i.querySelector(".faq__question");
      //   const a = i.querySelector(".faq__answer");
      //   if (!b || !a) return;
      //   b.setAttribute("aria-expanded", "false");
      //   a.hidden = true;
      // });

      btn.setAttribute("aria-expanded", String(!isOpen));
      answer.hidden = isOpen;
    });
  });
})();
// ===== GLOBAL ANCHORS (single source of truth) =====
(function () {
  const navAnchor =
    document.querySelector(".nav__link--active") ||
    document.querySelector(".nav__link");

  const headerContainer =
    document.querySelector(".header__container.container") ||
    document.querySelector(".header__container");

  function update() {
    if (!navAnchor || !headerContainer) return;

    // ===== 1) GLOBAL --anchor-x (внутри КОНТЕНТА container, а не от border) =====
    const linkRect = navAnchor.getBoundingClientRect();
    const contRect = headerContainer.getBoundingClientRect();

    const csCont = getComputedStyle(headerContainer);
    const padLeft = parseFloat(csCont.paddingLeft) || 0;

    const contentLeft = contRect.left + padLeft;
    const anchorX = Math.round(linkRect.left - contentLeft);
    document.documentElement.style.setProperty("--anchor-x", `${anchorX}px`);

    // ===== 2) HERO images: привязка к правому краю "впечатления", но НЕ вылетать за сцену =====
    const heroStage = document.querySelector(".hero__stage");
    const impr = document.querySelector(".hero__line--impr");
    const images = document.querySelector(".hero__images");

    if (heroStage && impr && images) {
      const stageRect = heroStage.getBoundingClientRect();
      const imprRect = impr.getBoundingClientRect();

      // right("впечатления") внутри hero__stage
      const imprRightInsideStage = imprRect.right - stageRect.left;

      // небольшой зазор между словом и картинками (подгони 10-40)
      const GAP = 20;

      // ширина блока картинок (берём реальную)
      const imagesW = images.offsetWidth || 260;

      // желаемый left
      let left = Math.round(imprRightInsideStage + GAP);

      // clamp: не выходить за правую границу сцены
      const maxLeft = Math.round(stageRect.width - imagesW);
      if (left > maxLeft) left = maxLeft;

      // и не уходить в минус
      if (left < 0) left = 0;

      document.documentElement.style.setProperty("--hero-images-left", `${left}px`);
    }

    // ===== 3) CART: right(cart) == right("впечатления") без накопления transform =====
    const cart = document.querySelector(".cart");
    if (impr && cart) {
      const prevTransform = cart.style.transform;
      cart.style.transform = "translateX(0px)";

      const imprRect = impr.getBoundingClientRect();
      const cartRect0 = cart.getBoundingClientRect();

      const shift = Math.round(imprRect.right - cartRect0.right);
      document.documentElement.style.setProperty("--cart-shift", `${shift}px`);

      cart.style.transform = prevTransform;
    }
  }

  function schedule() {
    requestAnimationFrame(update);
  }

  window.addEventListener("load", schedule);
  window.addEventListener("resize", schedule);

  // пересчёт после загрузки шрифтов (ширины текста меняются)
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(schedule);
  }

  schedule();
})();
// ===== MOBILE MENU (open/close) =====
(function () {
  const burger = document.querySelector(".m-header__burger");
  const mnav = document.querySelector("#mnav");
  const closeBtn = document.querySelector(".mnav__close");

  if (!burger || !mnav || !closeBtn) return;

  function openMenu() {
    mnav.hidden = false;
    burger.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    mnav.hidden = true;
    burger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  burger.addEventListener("click", openMenu);
  closeBtn.addEventListener("click", closeMenu);

  // закрытие по клику на ссылку
  mnav.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (link) closeMenu();
  });

  // закрытие по Escape
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !mnav.hidden) closeMenu();
  });
})();



