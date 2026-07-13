(() => {
  const canvas = document.getElementById("galaxy-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  let points = [];
  let width = 1;
  let height = 1;
  let dpr = 1;
  let radius = 1;
  let centerX = 1;
  let centerY = 1;
  let frameId = 0;

  function buildPoints(count) {
    points = Array.from({ length: count }, (_, index) => {
      const y = 1 - (index / Math.max(1, count - 1)) * 2;
      const ring = Math.sqrt(1 - y * y);
      const theta = index * goldenAngle;
      return {
        x: Math.cos(theta) * ring,
        y,
        z: Math.sin(theta) * ring,
        pulse: (index % 9) / 9,
      };
    });
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    radius = Math.min(width, height) * (width < 640 ? 0.42 : 0.39);
    centerX = width * (width < 640 ? 0.67 : 0.58);
    centerY = height * 0.52;

    const targetCount = width < 640 ? 68 : 96;
    if (points.length !== targetCount) buildPoints(targetCount);
    draw(performance.now());
  }

  function rotate(point, time) {
    const angleY = time * 0.00008;
    const angleX = -0.42;
    const angleZ = 0.1;

    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);
    const x1 = point.x * cosY - point.z * sinY;
    const z1 = point.x * sinY + point.z * cosY;

    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);
    const y2 = point.y * cosX - z1 * sinX;
    const z2 = point.y * sinX + z1 * cosX;

    const cosZ = Math.cos(angleZ);
    const sinZ = Math.sin(angleZ);
    const x3 = x1 * cosZ - y2 * sinZ;
    const y3 = x1 * sinZ + y2 * cosZ;

    const perspective = 1.62 / (2.22 - z2);
    const alpha = Math.min(1, Math.max(0.16, (z2 + 1.35) / 2.35));

    return {
      x: centerX + x3 * radius * perspective,
      y: centerY + y3 * radius * perspective,
      z: z2,
      alpha,
      pulse: point.pulse,
    };
  }

  function drawRings(time) {
    const shimmer = 0.03 + Math.sin(time * 0.0005) * 0.012;
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = `rgba(216, 232, 247, ${0.17 + shimmer})`;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radius * 0.86, radius * 0.36, -0.28, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "rgba(123, 199, 212, 0.2)";
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radius * 0.68, radius * 0.28, 0.72, 0, Math.PI * 2);
    ctx.stroke();
  }

  function draw(time) {
    const t = reduceMotion.matches ? 42000 : time;
    const projected = points.map((point) => rotate(point, t));
    const threshold = Math.max(62, radius * 0.34);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    drawRings(t);

    for (let i = 0; i < projected.length; i += 1) {
      for (let j = i + 1; j < projected.length; j += 1) {
        const a = projected[i];
        const b = projected[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > threshold) continue;

        const depth = (a.alpha + b.alpha) * 0.5;
        const alpha = (1 - distance / threshold) * depth * 0.34;
        ctx.strokeStyle = `rgba(123, 199, 212, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    for (let i = 0; i < projected.length; i += 1) {
      const point = projected[i];
      const pulse = 0.25 + Math.sin(t * 0.001 + point.pulse * Math.PI * 2) * 0.18;
      const size = 1.3 + point.alpha * 1.75 + (i % 23 === 0 ? pulse + 0.8 : 0);
      const alpha = Math.min(1, 0.46 + point.alpha * 0.62);

      ctx.shadowColor = i % 23 === 0 ? "rgba(123, 199, 212, 0.9)" : "rgba(216, 232, 247, 0.5)";
      ctx.shadowBlur = i % 23 === 0 ? 12 : 4;
      ctx.fillStyle = `rgba(245, 247, 250, ${alpha})`;
      ctx.beginPath();
      ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      if (i % 23 === 0) {
        ctx.strokeStyle = `rgba(216, 232, 247, ${0.46 + pulse})`;
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        ctx.arc(point.x, point.y, size + 4, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  function animate(time) {
    draw(time);
    if (!reduceMotion.matches) frameId = window.requestAnimationFrame(animate);
  }

  function start() {
    window.cancelAnimationFrame(frameId);
    if (reduceMotion.matches) {
      draw(performance.now());
      return;
    }
    frameId = window.requestAnimationFrame(animate);
  }

  window.addEventListener("resize", resize);
  if (typeof reduceMotion.addEventListener === "function") {
    reduceMotion.addEventListener("change", start);
  } else if (typeof reduceMotion.addListener === "function") {
    reduceMotion.addListener(start);
  }
  resize();
  start();
})();

(() => {
  const video = document.getElementById("trailer-video");
  const chapters = Array.from(document.querySelectorAll(".trailer-chapter"));
  if (!video || chapters.length === 0) return;

  chapters.forEach((chapter) => {
    chapter.addEventListener("click", () => {
      const src = chapter.dataset.videoSrc;
      const poster = chapter.dataset.videoPoster;
      if (!src) return;

      chapters.forEach((item) => {
        item.classList.remove("is-active");
        item.setAttribute("aria-pressed", "false");
      });
      chapter.classList.add("is-active");
      chapter.setAttribute("aria-pressed", "true");

      video.pause();
      const source = video.querySelector("source");
      if (source) {
        source.src = src;
      } else {
        video.src = src;
      }
      if (poster) video.poster = poster;
      video.load();
      const playAttempt = video.play();
      if (playAttempt && typeof playAttempt.catch === "function") {
        playAttempt.catch(() => {});
      }
    });
  });
})();
