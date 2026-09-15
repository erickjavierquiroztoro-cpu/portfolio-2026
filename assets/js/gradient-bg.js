(function initFogCanvas() {
  const canvas = document.getElementById("gradient-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  let width = 0;
  let height = 0;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

 const fogLayers = [
  { baseX: 0.18, baseY: 0.26, width: 0.78, height: 0.18, seed: 12, speed: 0.00015 },
  { baseX: 0.62, baseY: 0.48, width: 0.92, height: 0.22, seed: 46, speed: 0.00012 },
  { baseX: 0.34, baseY: 0.72, width: 0.70, height: 0.16, seed: 91, speed: 0.00018 },
];

  function noise(value) {
    return Math.sin(value) * 0.5 + Math.sin(value * 0.37) * 0.3;
  }

  function isDarkTheme() {
    return document.documentElement.dataset.theme === "dark";
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawFrame(time) {
    ctx.clearRect(0, 0, width, height);

    const dark = isDarkTheme();

    // En modo oscuro: neblina azul-gris profunda.
    // En modo claro: neblina blanca, más luminosa.
    const color = dark ? [10, 18, 28] : [255, 255, 255];
    const opacity = dark ? 0.62 : 0.72;

    fogLayers.forEach((layer, index) => {
      const driftX = noise(time * layer.speed + layer.seed) * width * 0.13;
      const driftY = noise(time * layer.speed + layer.seed * 2) * height * 0.06;
      const x = layer.baseX * width + driftX;
      const y = layer.baseY * height + driftY;
      const ellipseWidth = layer.width * width;
      const ellipseHeight = layer.height * height;

      const gradient = ctx.createRadialGradient(
        x, y, 0,
        x, y, ellipseWidth * 0.5
      );

      gradient.addColorStop(0, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${opacity})`);
      gradient.addColorStop(0.55, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${opacity * 0.42})`);
      gradient.addColorStop(1, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0)`);

      ctx.save();
      ctx.filter = "blur(34px)";
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(x, y, ellipseWidth * 0.5, ellipseHeight * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  let rafId = null;

  function loop(time) {
    drawFrame(time);
    rafId = requestAnimationFrame(loop);
  }

  resize();

  if (prefersReducedMotion) {
    drawFrame(0);
  } else {
    rafId = requestAnimationFrame(loop);
  }

  window.addEventListener("resize", () => {
    resize();
    if (prefersReducedMotion) drawFrame(0);
  });

  // Redibuja al cambiar entre modo claro y oscuro.
  new MutationObserver(() => drawFrame(performance.now())).observe(
    document.documentElement,
    { attributes: true, attributeFilter: ["data-theme"] }
  );
})();