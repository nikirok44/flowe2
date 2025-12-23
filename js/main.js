// js/main.js
console.log("Project flower loaded");

(function () {
  const section = document.querySelector(".parallax");
  if (!section) return;

  const bg = section.querySelector(".parallax__bg");
  const title = section.querySelector("[data-parallax-title]");
  if (!bg || !title) return;

  // Настройки
  const BG_AMPLITUDE = 140;     // амплитуда движения фона (px)
  const BG_SPEED = 0.25;        // скорость параллакса фона
  const TITLE_START_TOP = 1500; // стартовая позиция заголовка (как тебе подходит)
  const TITLE_END_TOP = 240;    // конечная позиция (подгони под макет)

  const clamp01 = (v) => Math.max(0, Math.min(1, v));

  function update() {
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;

    // секция вне экрана — ничего не делаем
    if (rect.bottom < 0 || rect.top > vh) return;

    // progress: 0..1 пока секция входит на экран
    const progress = clamp01((vh - rect.top) / vh);

    // 1) параллакс фона
    const bgShift = (progress - 0.5) * BG_AMPLITUDE * BG_SPEED;
    bg.style.transform = `translate3d(0, ${bgShift}px, 0)`;

    // 2) движение заголовка (снизу вверх)
    const titleTop = TITLE_START_TOP + (TITLE_END_TOP - TITLE_START_TOP) * progress;
    title.style.top = `${titleTop}px`;

    // 3) “строгая” смена цвета по зоне картинки, но НЕ весь текст сразу:
    // белым становится только та часть строк, которая попала на фон-картинку
    const bgRect = bg.getBoundingClientRect();
    const titleRect = title.getBoundingClientRect();

    // Если заголовок пересекается с картинкой по Y:
    // белая часть = от верха заголовка до нижней границы пересечения
    const overlapBottom = Math.min(titleRect.bottom, bgRect.bottom);

    let cutPx = 0; // сколько сверху будет белым
    if (overlapBottom > titleRect.top) {
      cutPx = overlapBottom - titleRect.top; // строго пиксели
      // ограничим высотой заголовка
      cutPx = Math.max(0, Math.min(cutPx, titleRect.height));
    }

    title.style.setProperty("--cut", `${cutPx}px`);
  }

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
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

