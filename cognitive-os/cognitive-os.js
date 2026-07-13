(() => {
  const list = document.querySelector("[data-interview-list]");
  const count = document.querySelector("[data-entry-count]");
  if (!list) return;

  const escapeHtml = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const listItems = (items = []) =>
    items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");

  const tags = (items = []) =>
    items.map((item) => `<span>${escapeHtml(item)}</span>`).join("");

  function render(entries) {
    if (count) count.textContent = entries.length;

    list.innerHTML = entries
      .map((entry) => {
        const source = entry.sourceUrl
          ? `<a class="cos-link" href="${escapeHtml(entry.sourceUrl)}" rel="noopener noreferrer" target="_blank">Open Source</a>`
          : `<p class="source-note">${escapeHtml(entry.sourceStatus)}</p>`;

        return `
          <article class="interview-card">
            <div>
              <p class="interview-meta">${escapeHtml(entry.dateWatched)} / ${escapeHtml(entry.program)}</p>
              <h3>${escapeHtml(entry.displayTitle || entry.title)}</h3>
              <p><strong>${escapeHtml(entry.oneSentence)}</strong></p>
              <p>${escapeHtml(entry.summary)}</p>
              <ul>${listItems(entry.takeaways)}</ul>
              <div class="tag-list">${tags(entry.categories)}</div>
            </div>
            <aside class="impact-panel" aria-label="Decision impact">
              <div>
                <p class="interview-meta">Decision Impact</p>
                <strong>${escapeHtml(entry.xingchenxiImpact)}</strong>
              </div>
              <div>
                <p class="interview-meta">Mental Models</p>
                <ul>${listItems(entry.mentalModels)}</ul>
              </div>
              <div>
                <p class="interview-meta">Source</p>
                ${source}
              </div>
            </aside>
          </article>
        `;
      })
      .join("");
  }

  fetch("../data/interviews.json")
    .then((response) => {
      if (!response.ok) throw new Error("Unable to load interview data.");
      return response.json();
    })
    .then(render)
    .catch(() => {
      list.innerHTML = `
        <article class="interview-card">
          <p class="card-status">Interview data could not be loaded. Open this page through the site server.</p>
        </article>
      `;
    });
})();
