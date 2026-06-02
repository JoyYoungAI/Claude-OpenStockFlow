const store = createIdeaStore([
  { id: 1, title: "整理專案入口文件", done: true },
  { id: 2, title: "替示範專案加上檢查腳本", done: false },
  { id: 3, title: "把常用流程抽成 Codex 規範", done: false }
]);

const form = document.querySelector("#idea-form");
const input = document.querySelector("#idea-input");
const list = document.querySelector("#idea-list");
const filters = document.querySelectorAll(".filter");
const totalCount = document.querySelector("#total-count");
const activeCount = document.querySelector("#active-count");
const doneCount = document.querySelector("#done-count");

let activeFilter = "all";

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const idea = store.add(input.value);

  if (idea) {
    input.value = "";
    render();
  }
});

filters.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    render();
  });
});

list.addEventListener("change", (event) => {
  const checkbox = event.target.closest("[data-toggle-id]");

  if (!checkbox) {
    return;
  }

  store.toggle(Number(checkbox.dataset.toggleId));
  render();
});

list.addEventListener("click", (event) => {
  const removeButton = event.target.closest("[data-remove-id]");

  if (!removeButton) {
    return;
  }

  store.remove(Number(removeButton.dataset.removeId));
  render();
});

function render() {
  renderStats();
  renderFilters();
  renderList();
}

function renderStats() {
  const counts = store.stats();
  totalCount.textContent = counts.total;
  activeCount.textContent = counts.active;
  doneCount.textContent = counts.done;
}

function renderFilters() {
  filters.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.filter === activeFilter);
  });
}

function renderList() {
  const ideas = store.list(activeFilter);

  if (!ideas.length) {
    list.innerHTML = '<li class="empty">目前沒有符合條件的點子。</li>';
    return;
  }

  list.innerHTML = ideas.map((idea) => {
    const checked = idea.done ? "checked" : "";
    const className = idea.done ? "idea-item is-done" : "idea-item";

    return `
      <li class="${className}">
        <input class="idea-check" type="checkbox" data-toggle-id="${idea.id}" ${checked} aria-label="切換狀態">
        <span class="idea-title">${escapeHtml(idea.title)}</span>
        <button class="idea-action" type="button" data-remove-id="${idea.id}">刪除</button>
      </li>
    `;
  }).join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

render();

