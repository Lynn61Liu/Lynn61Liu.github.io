const SECTION_LABELS = {
  featured: "Featured summary",
  library: "Project library card"
};

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function collectTags(project) {
  const groups = project.technologyTags || {};

  return [
    ...(groups.frontend || []),
    ...(groups.backend || []),
    ...(groups.database || []),
    ...(groups.cloudAndDevOps || []),
    ...(groups.architecture || []),
    ...(groups.testingAndQuality || []),
    ...(groups.integrations || [])
  ];
}

function uniqueTags(tags) {
  return [...new Set((tags || []).filter(Boolean))];
}

function normaliseFilterToken(tag) {
  const value = String(tag || "").toLowerCase();

  if (value.includes("react")) return "react";
  if (value.includes("typescript")) return "typescript";
  if (value.includes(".net") || value.includes("asp.net") || value.includes("dotnet")) return "dotnet";
  if (value.includes("node")) return "node";
  if (value.includes("docker")) return "docker";
  if (value.includes("accessibility")) return "accessibility";
  if (
    value.includes("ux") ||
    value.includes("user research") ||
    value.includes("interface design") ||
    value.includes("service design") ||
    value.includes("learning experience")
  ) {
    return "ux";
  }

  return "";
}

function collectFilterTokens(project) {
  return uniqueTags([
    ...collectTags(project).map(normaliseFilterToken),
    ...((project.display?.skillFilters || []).map(normaliseFilterToken))
  ]).filter(Boolean);
}

function selectDisplayTags(project, variant) {
  const configuredTags = project.display?.cardTags?.[variant];

  if (configuredTags?.length) {
    return uniqueTags(configuredTags);
  }

  return uniqueTags(collectTags(project)).slice(0, variant === "featured" ? 8 : 6);
}

function renderTagList(tags, maxTags) {
  return tags
    .slice(0, maxTags)
    .map((tag) => `<span>${escapeHtml(tag)}</span>`)
    .join("");
}

function getActionPresentation(action) {
  const label = String(action?.label || "").toLowerCase();

  if (label.includes("live demo")) {
    return {
      className: "project-link project-link-demo",
      icon: `
        <span class="project-link-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M8 7.14v9.72a1 1 0 0 0 1.53.85l7.3-4.86a1 1 0 0 0 0-1.7l-7.3-4.86A1 1 0 0 0 8 7.14Z"></path>
          </svg>
        </span>
      `
    };
  }

  return {
    className: "project-link project-link-summary",
    icon: `
      <span class="project-link-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <path d="M6 7.75A1.75 1.75 0 0 1 7.75 6h8.5A1.75 1.75 0 0 1 18 7.75v8.5A1.75 1.75 0 0 1 16.25 18h-8.5A1.75 1.75 0 0 1 6 16.25Zm2.25-.25a.75.75 0 0 0-.75.75v8a.75.75 0 0 0 .75.75h7.5a.75.75 0 0 0 .75-.75v-8a.75.75 0 0 0-.75-.75Zm1 2a.75.75 0 0 1 .75-.75h4a.75.75 0 0 1 0 1.5h-4a.75.75 0 0 1-.75-.75Zm0 3a.75.75 0 0 1 .75-.75h4a.75.75 0 0 1 0 1.5h-4a.75.75 0 0 1-.75-.75Z"></path>
        </svg>
      </span>
    `
  };
}

function renderAction(link, fallbackHref) {
  const action = link || {
    label: "View featured summary",
    href: fallbackHref,
    type: "anchor"
  };
  const opensInNewTab = action.type === "external" || String(action.label || "").toLowerCase().includes("live demo");
  const target = opensInNewTab ? ' target="_blank" rel="noreferrer"' : "";
  const presentation = getActionPresentation(action);

  return `
    <a class="${presentation.className}" href="${escapeHtml(action.href)}"${target}>
      ${presentation.icon}
      <span class="project-link-label">${escapeHtml(action.label)}</span>
    </a>
  `;
}

function renderActions(links, fallbackHref) {
  const actions = Array.isArray(links) && links.length
    ? links
    : [{
        label: "View featured summary",
        href: fallbackHref,
        type: "anchor"
      }];

  return actions
    .map((link) => renderAction(link, fallbackHref))
    .join("");
}

function renderFeaturedCard(project) {
  const tags = selectDisplayTags(project, "featured");
  const highlights = (project.engineeringHighlights || []).slice(0, 3);
  const badges = (project.projectTypeBadges || []).slice(0, 2);
  const filterTokens = collectFilterTokens(project);
  const bodyCopy = [
    project.oneLineSummary,
    project.summary?.engineeringValue || project.summary?.businessOrOperationalImpact
  ]
    .filter(Boolean)
    .join(" ");

  return `
    <article
      class="project-card project-featured"
      id="${escapeHtml(project.id)}"
      data-category="${escapeHtml(project.display?.category || "all")}"
      data-skills="${escapeHtml(filterTokens.join(" "))}"
      aria-label="${escapeHtml(project.projectName)} ${SECTION_LABELS.featured}"
    >
      <div class="project-media">
        <img src="${escapeHtml(project.display?.heroImage || "")}" alt="${escapeHtml(project.display?.heroImageAlt || project.projectName)}" />
      </div>
      <div class="project-body">
        <div class="card-topline">
          <h3>${escapeHtml(project.projectName)}</h3>
          <span class="status-pill">${escapeHtml(project.status || badges[0] || "")}</span>
        </div>
        <div class="project-badge-row">
          ${badges.map((badge) => `<span class="meta-tag">${escapeHtml(badge)}</span>`).join("")}
        </div>
        <p class="project-summary">${escapeHtml(bodyCopy)}</p>
        <div class="project-detail-grid">
          <div>
            <h4>Highlights</h4>
            <ul class="project-mini-list">
              ${highlights.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
            </ul>
          </div>
          <div>
            <h4>Reflection</h4>
            <p>${escapeHtml(project.reflection?.tradeoffs || "")}</p>
          </div>
        </div>
        <div class="tag-list">${renderTagList(tags, 20)}</div>
        <div class="project-actions">
          ${renderActions(project.display?.links, `#${project.id}`)}
        </div>
      </div>
    </article>
  `;
}

function renderLibraryCard(project) {
  const tags = selectDisplayTags(project, "library");
  const fallbackAnchor = `#${project.id}`;
  const filterTokens = collectFilterTokens(project);
  const note = project.display?.libraryFocus
    ? `Focus: ${project.display.libraryFocus}.`
    : "";

  return `
    <article
      class="library-card"
      data-category="${escapeHtml(project.display?.category || "all")}"
      data-skills="${escapeHtml(filterTokens.join(" "))}"
      aria-label="${escapeHtml(project.projectName)} ${SECTION_LABELS.library}"
    >
      <div class="library-card-media">
        <img src="${escapeHtml(project.display?.heroImage || "")}" alt="${escapeHtml(project.display?.heroImageAlt || project.projectName)}" />
      </div>
      <div class="library-card-body">
        <div class="card-topline">
          <h3>${escapeHtml(project.projectName)}</h3>
          <span class="meta-tag">${escapeHtml(project.display?.libraryMetaTag || project.projectTypeBadges?.[0] || "Project")}</span>
        </div>
        <p>${escapeHtml(project.oneLineSummary || "")}</p>
        <div class="tag-list">${renderTagList(tags,20)}</div>
        <p class="library-card-note">${escapeHtml(note)}</p>
        <div class="library-card-actions">
          ${renderActions(project.display?.links, fallbackAnchor)}
        </div>
      </div>
    </article>
  `;
}

export function renderProjectCard(project, variant = "featured") {
  return variant === "library"
    ? renderLibraryCard(project)
    : renderFeaturedCard(project);
}
