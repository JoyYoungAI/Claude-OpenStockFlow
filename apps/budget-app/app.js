const storageKey = "ledger-lite-transactions";
const budgetKey = "ledger-lite-budget";
const today = new Date();
const currentMonth = today.toISOString().slice(0, 7);
const currentDate = today.toISOString().slice(0, 10);

const seedTransactions = [
  { id: 1, type: "income", amount: 60000, category: "薪資", date: `${currentMonth}-01`, note: "本月薪資" },
  { id: 2, type: "expense", amount: 1600, category: "餐飲", date: `${currentMonth}-03`, note: "週末聚餐" },
  { id: 3, type: "expense", amount: 1280, category: "交通", date: `${currentMonth}-05`, note: "通勤與加油" },
  { id: 4, type: "expense", amount: 2490, category: "居家", date: `${currentMonth}-08`, note: "生活用品" }
];

let store = createLedgerStore(loadTransactions());
let activeMonth = currentMonth;
let activeFilter = "all";
let monthlyBudget = loadBudget();

const form = document.querySelector("#entry-form");
const monthInput = document.querySelector("#month-input");
const amountInput = document.querySelector("#amount-input");
const categoryInput = document.querySelector("#category-input");
const dateInput = document.querySelector("#date-input");
const noteInput = document.querySelector("#note-input");
const budgetInput = document.querySelector("#budget-input");
const filterInput = document.querySelector("#filter-input");
const exportButton = document.querySelector("#export-button");
const transactionList = document.querySelector("#transaction-list");
const categoryBars = document.querySelector("#category-bars");
const topCategory = document.querySelector("#top-category");
const incomeTotal = document.querySelector("#income-total");
const expenseTotal = document.querySelector("#expense-total");
const balanceTotal = document.querySelector("#balance-total");
const budgetPercent = document.querySelector("#budget-percent");

monthInput.value = activeMonth;
dateInput.value = currentDate;
budgetInput.value = monthlyBudget || "";

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const created = store.add({
    type: new FormData(form).get("type"),
    amount: amountInput.value,
    category: categoryInput.value,
    date: dateInput.value,
    note: noteInput.value
  });

  if (!created) {
    amountInput.focus();
    return;
  }

  saveTransactions();
  amountInput.value = "";
  noteInput.value = "";
  render();
});

monthInput.addEventListener("change", () => {
  activeMonth = monthInput.value || currentMonth;
  render();
});

filterInput.addEventListener("change", () => {
  activeFilter = filterInput.value;
  render();
});

budgetInput.addEventListener("change", () => {
  monthlyBudget = Math.max(0, Math.round(Number(budgetInput.value) || 0));
  localStorage.setItem(budgetKey, String(monthlyBudget));
  render();
});

transactionList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-id]");

  if (!button) {
    return;
  }

  store.remove(Number(button.dataset.removeId));
  saveTransactions();
  render();
});

exportButton.addEventListener("click", () => {
  const rows = store.exportRows(activeMonth);
  const csv = toCsv(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ledger-${activeMonth}.csv`;
  link.click();
  URL.revokeObjectURL(url);
});

function render() {
  const summary = store.summary(activeMonth);
  const budgetUse = monthlyBudget > 0 ? Math.round((summary.expense / monthlyBudget) * 100) : 0;

  incomeTotal.textContent = formatMoney(summary.income);
  expenseTotal.textContent = formatMoney(summary.expense);
  balanceTotal.textContent = formatMoney(summary.balance);
  balanceTotal.classList.toggle("is-negative", summary.balance < 0);
  budgetPercent.textContent = `${budgetUse}%`;

  renderCategories(summary.categories);
  renderTransactions(store.list({ month: activeMonth, type: activeFilter }));
}

function renderCategories(categories) {
  if (!categories.length) {
    topCategory.textContent = "尚無支出";
    categoryBars.innerHTML = '<div class="empty">本月還沒有支出。</div>';
    return;
  }

  const max = categories[0].amount;
  topCategory.textContent = `最高：${categories[0].category}`;
  categoryBars.innerHTML = categories.map((item) => {
    const width = Math.max(8, Math.round((item.amount / max) * 100));

    return `
      <div class="category-row">
        <span>${escapeHtml(item.category)}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${width}%"></div></div>
        <strong>${formatMoney(item.amount)}</strong>
      </div>
    `;
  }).join("");
}

function renderTransactions(items) {
  if (!items.length) {
    transactionList.innerHTML = '<li class="empty">這個月份沒有符合條件的紀錄。</li>';
    return;
  }

  transactionList.innerHTML = items.map((item) => {
    const sign = item.type === "income" ? "+" : "-";
    const typeLabel = item.type === "income" ? "收入" : "支出";

    return `
      <li class="transaction-item">
        <span class="transaction-date">${item.date}</span>
        <div class="transaction-main">
          <p class="transaction-note">${escapeHtml(item.note)}</p>
          <span class="transaction-category">${typeLabel} / ${escapeHtml(item.category)}</span>
        </div>
        <strong class="transaction-amount ${item.type}">${sign}${formatMoney(item.amount)}</strong>
        <button class="transaction-action" type="button" data-remove-id="${item.id}" aria-label="刪除紀錄">×</button>
      </li>
    `;
  }).join("");
}

function loadTransactions() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
    return Array.isArray(saved) ? saved : seedTransactions;
  } catch (error) {
    return seedTransactions;
  }
}

function saveTransactions() {
  localStorage.setItem(storageKey, JSON.stringify(store.exportRows("").map((row, index) => ({
    id: index + 1,
    type: row.type,
    amount: row.amount,
    category: row.category,
    date: row.date,
    note: row.note
  }))));
}

function loadBudget() {
  return Math.max(0, Math.round(Number(localStorage.getItem(budgetKey)) || 30000));
}

function formatMoney(value) {
  return new Intl.NumberFormat("zh-Hant-TW", {
    style: "currency",
    currency: "TWD",
    maximumFractionDigits: 0
  }).format(value);
}

function toCsv(rows) {
  const header = ["date", "type", "category", "note", "amount"];
  const lines = rows.map((row) => header.map((key) => csvCell(row[key])).join(","));
  return [header.join(","), ...lines].join("\n");
}

function csvCell(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
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

