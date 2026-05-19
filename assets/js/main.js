import { renderProjectCard } from "./components/project-card.js";

const DATA_INDEX_URL = new URL("../../src/data/projects/index.json", import.meta.url);

const state = {
  category: "all",
  skill: "all"
};

async function loadProjectData() {
  const indexResponse = await fetch(DATA_INDEX_URL);

  if (!indexResponse.ok) {
    throw new Error(`Failed to load project index: ${indexResponse.status}`);
  }

  const { projects } = await indexResponse.json();
  const projectResponses = await Promise.all(
    projects.map(async (path) => {
      const response = await fetch(path);

      if (!response.ok) {
        throw new Error(`Failed to load project data: ${path}`);
      }

      return response.json();
    })
  );

  return projectResponses;
}

function renderProjects(projects) {
//   const featuredRoot = document.querySelector("[data-featured-projects]");
  const libraryRoot = document.querySelector("[data-project-library-grid]");

  if (!libraryRoot) {
    return;
  }

  const featuredProjects = projects.filter((project) => project.display?.featured);

//   featuredRoot.innerHTML = featuredProjects
//     .map((project) => renderProjectCard(project, "featured"))
//     .join("");

  libraryRoot.innerHTML = projects
    .map((project) => renderProjectCard(project, "library"))
    .join("");
}

function applyFilters() {
  const cards = document.querySelectorAll(".library-card");
  const countNode = document.querySelector("[data-project-count]");
  let visibleCount = 0;

  cards.forEach((card) => {
    const category = card.dataset.category;
    const skills = (card.dataset.skills || "").split(" ").filter(Boolean);
    const categoryMatch = state.category === "all" || category === state.category;
    const skillMatch = state.skill === "all" || skills.includes(state.skill);
    const shouldShow = categoryMatch && skillMatch;

    card.hidden = !shouldShow;
    if (shouldShow) {
      visibleCount += 1;
    }
  });

  if (countNode) {
    countNode.textContent = `${visibleCount} project${visibleCount === 1 ? "" : "s"} shown`;
  }
}

function setupFilters() {
  const buttons = document.querySelectorAll("[data-filter-group]");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const group = button.dataset.filterGroup;
      const value = button.dataset.filterValue;

      state[group] = value;

      buttons.forEach((candidate) => {
        if (candidate.dataset.filterGroup === group) {
          const isActive = candidate === button;
          candidate.classList.toggle("is-active", isActive);
          candidate.setAttribute("aria-pressed", String(isActive));
        }
      });

      applyFilters();
    });
  });

  applyFilters();
}

function showProjectError() {
  const featuredRoot = document.querySelector("[data-featured-projects]");
  const libraryRoot = document.querySelector("[data-project-library-grid]");
  const message = `
    <article class="project-card">
      <div class="project-body">
        <div class="card-topline">
          <h3>Projects are loading incorrectly</h3>
        </div>
        <p class="project-summary">The project data could not be loaded right now. Please refresh the page or try again shortly.</p>
      </div>
    </article>
  `;

  if (featuredRoot) {
    featuredRoot.innerHTML = message;
  }

  if (libraryRoot) {
    libraryRoot.innerHTML = "";
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const projects = await loadProjectData();
    renderProjects(projects);
    setupFilters();
  } catch (error) {
    console.error(error);
    showProjectError();
  }
});
