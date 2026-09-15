// ==========================================================================
// CHROMA-KEY DEL VIDEO DEL HERO
// El archivo assets/video/hero-showcase.mp4 tiene el fondo en negro "quemado"
// en el propio video (no es transparencia real). Este script dibuja cada
// cuadro en un <canvas>, y vuelve transparentes los píxeles casi negros
// (con un degradé suave en el borde para evitar un recorte brusco), para que
// el video se vea igual de bien sobre fondo negro (modo oscuro) que sobre
// fondo blanco (modo claro), sin generar dos archivos de video distintos.
//
// Respeta prefers-reduced-motion (no reproduce nada, se queda con el texto
// "PORTAFOLIO" de respaldo) y pausa el procesamiento cuando la pestaña o el
// propio elemento no están visibles, para no gastar batería de más.
// ==========================================================================
(function initHeroVideoKey() {
  const video = document.getElementById("heroShowcaseVideo");
  const canvas = document.getElementById("heroShowcaseCanvas");
  const seal = canvas ? canvas.closest(".seal-video") : null;
  if (!video || !canvas || !seal) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (prefersReducedMotion) return; // se queda con el texto de respaldo

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const SIZE = 480; // resolución interna del canvas (de sobra para un sello de ~280-340px)
  canvas.width = SIZE;
  canvas.height = SIZE;

  // Umbrales de luminancia: por debajo de LOW es 100% transparente, por
  // encima de HIGH es 100% opaco, y en el medio hay un degradé para que el
  // borde de las tarjetas no se vea recortado con serrucho.
  const LOW = 20;
  const HIGH = 55;
  const RANGE = HIGH - LOW;

  let rafId = null;
  let isReady = false;
  let isVisible = true;

  function keyOutBlack() {
    ctx.drawImage(video, 0, 0, SIZE, SIZE);
    const frame = ctx.getImageData(0, 0, SIZE, SIZE);
    const data = frame.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const luminance = r * 0.299 + g * 0.587 + b * 0.114;

      if (luminance <= LOW) {
        data[i + 3] = 0;
      } else if (luminance < HIGH) {
        data[i + 3] = Math.round(((luminance - LOW) / RANGE) * 255);
      }
    }

    ctx.putImageData(frame, 0, 0);

    if (!isReady) {
      isReady = true;
      seal.classList.add("is-video-ready");
    }
  }

  function loop() {
    if (isVisible && video.readyState >= 2) {
      keyOutBlack();
    }
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    video
      .play()
      .then(() => {
        if (rafId === null) {
          rafId = requestAnimationFrame(loop);
        }
      })
      .catch(() => {
        // Autoplay bloqueado por el navegador: se queda con el texto de
        // respaldo en vez de forzar la reproducción.
      });
  }

  video.addEventListener("loadeddata", start, { once: true });
  if (video.readyState >= 2) start();

  // Pausa el video y el dibujo cuando la pestaña no está activa.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      video.pause();
    } else if (isVisible) {
      video.play().catch(() => {});
    }
  });

  // Pausa el video cuando el sello sale del viewport (por ejemplo, al hacer
  // scroll más allá del hero).
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
          if (isVisible && !document.hidden) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(seal);
  }
})();
