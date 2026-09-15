// ==========================================================================
// TEMA (claro/oscuro)
// Se guarda la preferencia en localStorage con try/catch: si el navegador
// bloquea el storage (modo incógnito estricto, iframes, etc.) el sitio
// sigue funcionando, solo que no recuerda la preferencia entre visitas.
// ==========================================================================
(function initTheme() {
  const root = document.documentElement;
  const stored = safeGet("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initial = stored || (prefersDark ? "dark" : "light");
  root.setAttribute("data-theme", initial);
  updateToggleIcon(initial);

  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const current = root.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      updateToggleIcon(next);
      safeSet("theme", next);
    });
  });

  function updateToggleIcon(theme) {
    document.querySelectorAll("[data-theme-icon]").forEach((icon) => {
      icon.className = theme === "dark" ? "bi bi-sun" : "bi bi-moon-stars";
    });
  }

  function safeGet(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function safeSet(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* noop: preferencia no persiste, pero el sitio sigue funcionando */
    }
  }
})();

// ==========================================================================
// NAVBAR: fondo sólido al hacer scroll
// ==========================================================================
(function initNavbarScroll() {
  const navbar = document.querySelector(".navbar-custom");
  if (!navbar) return;

  function onScroll() {
    navbar.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
})();

// ==========================================================================
// CERRAR EL OFFCANVAS AL HACER CLICK EN UN LINK
// Bootstrap no hace esto solo: el menú móvil quedaría abierto después
// de navegar a la sección.
// ==========================================================================
(function initOffcanvasAutoClose() {
  const offcanvasEl = document.getElementById("mobileMenu");
  if (!offcanvasEl || !window.bootstrap) return;

  const bsOffcanvas = window.bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl);
  offcanvasEl.querySelectorAll("a[href^='#']").forEach((link) => {
    link.addEventListener("click", () => bsOffcanvas.hide());
  });
})();

// ==========================================================================
// SCROLL REVEAL
// Anima .reveal y .mask-line cuando entran en el viewport, una sola vez.
// ==========================================================================
(function initScrollReveal() {
  const targets = document.querySelectorAll(".reveal, .mask-line");
  if (!targets.length) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "-40px" },
  );

  targets.forEach((el) => observer.observe(el));
})();

// ==========================================================================
// SCROLL GALLERY (imagen fija que cambia según el bloque de texto activo)
// Se usa en Proyectos, Experiencia y Sobre mí. Mismo mecanismo que el
// scroll-spy del navbar: un IntersectionObserver con rootMargin negativo
// arriba y abajo detecta qué item cruza la línea central de la pantalla.
// ==========================================================================
(function initScrollGalleries() {
  const galleries = document.querySelectorAll(".scroll-gallery");
  if (!galleries.length) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  galleries.forEach((gallery) => {
    const items = gallery.querySelectorAll(".scroll-gallery__item");
    const mediaItems = gallery.querySelectorAll(".scroll-gallery__media-item");
    if (!items.length || !mediaItems.length) return;

    // Con reduced-motion, o si el layout todavía no tiene columna sticky
    // (mobile, donde el CSS oculta .scroll-gallery__media-wrap), no hace
    // falta observar nada: cada item ya muestra su propia imagen inline.
    if (prefersReducedMotion) return;

    const setActive = (index) => {
      mediaItems.forEach((el) => {
        el.classList.toggle("is-active", el.dataset.galleryIndex === String(index));
      });
    };

    setActive(0); // estado inicial: el primer item activo antes de scrollear

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.dataset.galleryIndex);
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }, // se activa al cruzar el centro vertical
    );

    items.forEach((item) => observer.observe(item));
  });
})();

// ==========================================================================
// BOTONES MAGNÉTICOS
// El botón se desplaza levemente hacia el cursor mientras lo sobrevuela,
// y vuelve a su lugar con un pequeño rebote al salir. Solo en dispositivos
// con mouse (pointer: fine) y sin prefers-reduced-motion, para no interferir
// con touch ni con quienes prefieren menos movimiento.
// ==========================================================================
(function initMagneticButtons() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
  if (prefersReducedMotion || !hasFinePointer) return;

  const targets = document.querySelectorAll(".btn-primary-custom, .btn-ghost-custom");
  const STRENGTH = 0.25; // qué tanto sigue al cursor (0-1)
  const MAX_OFFSET = 10; // px máximos de desplazamiento

  targets.forEach((el) => {
    let x = 0;
    let y = 0;

    const applyTransform = (scale) => {
      el.style.transform = `translate(${x}px, ${y}px)${scale ? ` scale(${scale})` : ""}`;
    };

    el.addEventListener("mousemove", (event) => {
      const rect = el.getBoundingClientRect();
      const relX = event.clientX - (rect.left + rect.width / 2);
      const relY = event.clientY - (rect.top + rect.height / 2);
      x = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, relX * STRENGTH));
      y = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, relY * STRENGTH));
      applyTransform();
    });

    el.addEventListener("mousedown", () => applyTransform(0.96));
    el.addEventListener("mouseup", () => applyTransform());

    el.addEventListener("mouseleave", () => {
      x = 0;
      y = 0;
      el.style.transform = "";
    });
  });
})();

// Validación en el cliente + punto único de integración con un backend real.
// ==========================================================================
(function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const successBox = document.getElementById("contactSuccess");
  const errorBox = document.getElementById("contactError");
  const submitBtn = form.querySelector("[type='submit']");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    const originalLabel = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = "Enviando...";
    errorBox.classList.add("d-none");

    const data = Object.fromEntries(new FormData(form).entries());

    try {
      await submitContactForm(data);
      form.reset();
      form.classList.remove("was-validated");
      form.classList.add("d-none");
      successBox.classList.remove("d-none");
    } catch {
      errorBox.classList.remove("d-none");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalLabel;
    }
  });

  /**
   * TODO: reemplazar esta simulación por la llamada real a tu backend.
   * Ejemplo con un endpoint propio (Spring Boot u otro):
   *
   *   const res = await fetch("https://tu-api.com/api/contact", {
   *     method: "POST",
   *     headers: { "Content-Type": "application/json" },
   *     body: JSON.stringify(data),
   *   });
   *   if (!res.ok) throw new Error("request failed");
   *
   * Al estar aislado en esta única función, el resto del formulario no
   * necesita cambiar nada cuando conectes el backend real.
   */
  function submitContactForm(data) {
    return new Promise((resolve) => {
      console.log("Formulario de contacto (simulado):", data);
      setTimeout(resolve, 900);
    });
  }
})();
