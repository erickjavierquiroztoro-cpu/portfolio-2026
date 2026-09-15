(() => {
  const loader = document.getElementById("pageLoader");
  const mark = document.getElementById("loaderMark");
  const percent = document.getElementById("loaderPercent");
  const brand = document.getElementById("siteBrand");

  if (!loader || !mark || !percent || !brand) return;

  let progress = 1;
  let pageIsReady = false;

  const timer = setInterval(() => {
    if (progress < 92) {
      progress += Math.ceil(Math.random() * 4);
      progress = Math.min(progress, 92);
      percent.textContent = `${progress}%`;
    }

    if (pageIsReady) {
      clearInterval(timer);
      finishLoader();
    }
  }, 70);

  window.addEventListener("load", () => {
    pageIsReady = true;
  });

  function finishLoader() {
    const complete = () => {
      progress = Math.min(progress + 2, 100);
      percent.textContent = `${progress}%`;

      if (progress < 100) {
        setTimeout(complete, 22);
        return;
      }

      setTimeout(moveInitialToNavbar, 220);
    };

    complete();
  }

  function moveInitialToNavbar() {
    const markRect = mark.getBoundingClientRect();
    const brandRect = brand.getBoundingClientRect();

    const moveX =
      brandRect.left + brandRect.width / 2 - (markRect.left + markRect.width / 2);
    const moveY =
      brandRect.top + brandRect.height / 2 - (markRect.top + markRect.height / 2);

    percent.animate(
      [{ opacity: 1 }, { opacity: 0 }],
      { duration: 220, fill: "forwards", easing: "ease-out" }
    );

    mark.animate(
      [
        { transform: "translate(-50%, -50%) translate(0, 0)" },
        {
          transform: `translate(-50%, -50%) translate(${moveX}px, ${moveY}px)`,
        },
      ],
      {
        duration: 850,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        fill: "forwards",
      }
    ).finished.then(() => {
      document.body.classList.add("is-loaded");
      loader.classList.add("is-leaving");

      setTimeout(() => loader.remove(), 380);
    });
  }
})();