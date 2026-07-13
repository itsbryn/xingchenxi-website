const list = document.querySelector("[data-brief-list]");
const morningList = document.querySelector("[data-morning-list]");
const updated = document.querySelector("[data-updated]");
const signal = document.querySelector("[data-signal]");
const entryCount = document.querySelector("[data-entry-count]");
const morningCount = document.querySelector("[data-morning-count]");
const termOrb = document.querySelector("[data-term-orb]");
const yearLabel = document.querySelector("[data-year]");
const tickerTrack = document.querySelector("[data-ticker-track]");
const latestDate = document.querySelector("[data-latest-date]");
const latestCity = document.querySelector("[data-latest-city]");
const latestTemp = document.querySelector("[data-latest-temp]");
const latestSummary = document.querySelector("[data-latest-summary]");

const goldenAngle = Math.PI * (3 - Math.sqrt(5));

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderList(items = [], className = "") {
  if (!items.length) return "";
  return `<ul class="${className}">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function renderTags(tags = []) {
  if (!tags.length) return "";
  return `<div class="brief-tags">${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>`;
}

function renderLinks(links = []) {
  if (!links.length) return "";
  return `
    <div class="brief-links">
      ${links
        .map((link) => `<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`)
        .join("")}
    </div>
  `;
}

function renderSource(source = {}) {
  if (!source.href || !source.label) return "";
  return `<a href="${escapeHtml(source.href)}">${escapeHtml(source.label)}</a>`;
}

function renderTerms(terms = []) {
  if (!termOrb || !terms.length) return;

  const visibleTerms = terms.slice(0, 28);
  const maxIndex = Math.max(1, visibleTerms.length - 1);
  const html = terms
    .slice(0, 28)
    .map((term, index) => {
      const y = 1 - (index / maxIndex) * 2;
      const radius = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = index * goldenAngle;
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;
      const weight = Math.max(1, Math.min(5, Number(term.weight) || 1));
      return `
        <span
          class="orb-term orb-term-weight-${weight}"
          data-x="${x.toFixed(5)}"
          data-y="${y.toFixed(5)}"
          data-z="${z.toFixed(5)}"
        >${escapeHtml(term.label)}</span>
      `;
    })
    .join("");

  termOrb.insertAdjacentHTML("beforeend", html);
  startTermOrbit();
}

function startTermOrbit() {
  const terms = [...document.querySelectorAll(".orb-term")];
  if (!terms.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let previous = performance.now();
  let rotation = -18;
  const tilt = (-12 * Math.PI) / 180;
  const spinSpeed = 9.5;

  function frame(now) {
    const delta = Math.min(40, now - previous) / 1000;
    previous = now;
    rotation = (rotation + spinSpeed * delta) % 360;
    const rotateY = (rotation * Math.PI) / 180;
    const cosY = Math.cos(rotateY);
    const sinY = Math.sin(rotateY);
    const cosTilt = Math.cos(tilt);
    const sinTilt = Math.sin(tilt);

    terms.forEach((term, index) => {
      const orbitScale = Math.max(0.58, Math.min(1.06, termOrb.clientWidth / 680));
      const sphereRadius = 255 * orbitScale;
      const sourceX = Number(term.dataset.x);
      const sourceY = Number(term.dataset.y);
      const sourceZ = Number(term.dataset.z);
      const rotatedX = sourceX * cosY + sourceZ * sinY;
      const rotatedZ = sourceZ * cosY - sourceX * sinY;
      const tiltedY = sourceY * cosTilt - rotatedZ * sinTilt;
      const tiltedZ = sourceY * sinTilt + rotatedZ * cosTilt;
      const depth = (tiltedZ + 1) / 2;
      const perspective = 1.18 + depth * 0.36;
      const x = rotatedX * sphereRadius * perspective;
      const y = tiltedY * sphereRadius * 0.78 * perspective;
      const scale = 0.58 + depth * 0.62;
      const opacity = 0.16 + depth * 0.84;
      const blur = Math.max(0, 1.8 - depth * 2.2);

      term.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, 0) scale(${scale})`;
      term.style.opacity = opacity.toFixed(3);
      term.style.filter = `blur(${blur.toFixed(2)}px)`;
      term.style.zIndex = String(3 + Math.round(depth * 100));
    });

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

function renderTicker(entries = []) {
  if (!tickerTrack || !entries.length) return;

  const items = entries.flatMap((entry) => [
    `${entry.date} / ${entry.title}`,
    ...(entry.tags || []).map((tag) => `Signal: ${tag}`),
  ]);
  const duplicated = [...items, ...items, ...items];

  tickerTrack.innerHTML = duplicated
    .map((item) => `<span>${escapeHtml(item)}</span>`)
    .join("");
}

function renderWeather(weather = {}) {
  const details = [
    weather.temperature,
    weather.feels_like,
    weather.precipitation,
    weather.wind,
    weather.air_quality,
  ].filter(Boolean);

  if (!details.length && !weather.advice) return "";

  return `
    <div class="morning-weather">
      <h4>${escapeHtml(weather.city || "Weather")}</h4>
      ${details.length ? renderList(details) : ""}
      ${weather.advice ? `<p>${escapeHtml(weather.advice)}</p>` : ""}
    </div>
  `;
}

function renderMorningCategory(category = {}) {
  const items = Array.isArray(category.items) ? category.items : [];
  if (!items.length) return "";

  return `
    <section class="morning-category">
      <h4>${escapeHtml(category.name || "Signal")}</h4>
      <div class="morning-items">
        ${items
          .map(
            (item) => `
              <article>
                <time datetime="${escapeHtml(item.date || "")}">${escapeHtml(item.date || "")}</time>
                <h5>${escapeHtml(item.title || "")}</h5>
                ${item.why ? `<p><strong>为什么重要：</strong>${escapeHtml(item.why)}</p>` : ""}
                ${item.impact ? `<p><strong>可能影响：</strong>${escapeHtml(item.impact)}</p>` : ""}
                ${item.source ? `<div class="morning-source">${renderSource(item.source)}</div>` : ""}
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderMorningBrief(entry) {
  const categories = Array.isArray(entry.categories) ? entry.categories : [];
  const followups = Array.isArray(entry.followups) ? entry.followups : [];

  return `
    <article class="morning-card">
      <div class="morning-card-head">
        <div>
          <time datetime="${escapeHtml(entry.date)}">${escapeHtml(entry.date)}</time>
          <h3>${escapeHtml(entry.title)}</h3>
          <p>${escapeHtml(entry.summary)}</p>
        </div>
        ${renderTags(entry.tags)}
      </div>
      ${renderWeather(entry.weather)}
      <div class="morning-categories">
        ${categories.map(renderMorningCategory).join("")}
      </div>
      ${
        followups.length
          ? `<div class="morning-followups"><h4>可深入了解</h4>${renderList(followups)}</div>`
          : ""
      }
    </article>
  `;
}

function renderEntry(entry) {
  return `
    <article class="brief-card">
      <div>
        <time datetime="${escapeHtml(entry.date)}">${escapeHtml(entry.date)}</time>
        <h3>${escapeHtml(entry.title)}</h3>
        <p>${escapeHtml(entry.summary)}</p>
        ${renderTags(entry.tags)}
      </div>
      <div class="brief-side">
        <div>
          <h4>Shipped</h4>
          ${renderList(entry.shipped)}
        </div>
        <div>
          <h4>Next</h4>
          ${renderList(entry.next)}
        </div>
        ${renderLinks(entry.links)}
      </div>
    </article>
  `;
}

async function loadBriefs() {
  if (!list) return;

  try {
    const response = await fetch("../data/daily-brief.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`Daily Brief data failed: ${response.status}`);
    const data = await response.json();
    const entries = Array.isArray(data.entries) ? data.entries : [];
    const morningBriefs = Array.isArray(data.morning_briefs) ? data.morning_briefs : [];
    const latest = morningBriefs[0];

    if (updated) updated.textContent = data.updated || "Unknown";
    if (updated && data.updated) updated.dateTime = data.updated;
    if (signal) signal.textContent = data.signal || "No signal recorded yet.";
    if (entryCount) entryCount.textContent = String(entries.length);
    if (morningCount) morningCount.textContent = String(morningBriefs.length);
    if (yearLabel) yearLabel.textContent = data.year || "2026";
    if (latestDate && latest) latestDate.textContent = `${latest.date} · ${latest.weather?.city || "今日"}`;
    if (latestCity && latest?.weather?.city) latestCity.textContent = latest.weather.city;
    if (latestTemp && latest?.weather?.temperature) latestTemp.textContent = latest.weather.temperature;
    if (latestSummary && latest?.summary) latestSummary.textContent = latest.summary;

    renderTerms(Array.isArray(data.year_terms) ? data.year_terms : []);
    renderTicker([...morningBriefs, ...entries]);

    list.innerHTML = entries.length
      ? entries.map(renderEntry).join("")
      : '<article class="brief-card"><p class="brief-loading">No Daily Brief entries yet.</p></article>';

    if (morningList) {
      morningList.innerHTML = morningBriefs.length
        ? morningBriefs.map(renderMorningBrief).join("")
        : '<article class="brief-card"><p class="brief-loading">No Morning Brief entries yet.</p></article>';
    }
  } catch (error) {
    list.innerHTML =
      '<article class="brief-card"><p class="brief-loading">Daily Brief data is temporarily unavailable.</p></article>';
    if (morningList) {
      morningList.innerHTML =
        '<article class="brief-card"><p class="brief-loading">Morning Brief data is temporarily unavailable.</p></article>';
    }
  }
}

loadBriefs();
