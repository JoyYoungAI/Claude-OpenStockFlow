(function (global) {
  function createLedgerStore(initialTransactions) {
    let transactions = Array.isArray(initialTransactions)
      ? initialTransactions.map(copyTransaction)
      : [];
    let nextId = transactions.reduce((max, item) => Math.max(max, item.id), 0) + 1;

    function add(input) {
      const amount = Math.round(Number(input.amount));
      const type = input.type === "income" ? "income" : "expense";
      const category = String(input.category || "其他").trim() || "其他";
      const date = normalizeDate(input.date);
      const note = String(input.note || "").trim() || category;

      if (!Number.isFinite(amount) || amount <= 0 || !date) {
        return null;
      }

      const transaction = {
        id: nextId,
        type,
        amount,
        category,
        date,
        note
      };

      nextId += 1;
      transactions = [transaction].concat(transactions);
      return copyTransaction(transaction);
    }

    function remove(id) {
      const before = transactions.length;
      transactions = transactions.filter((item) => item.id !== id);
      return transactions.length !== before;
    }

    function list(options) {
      const filter = Object.assign({ month: "", type: "all" }, options);

      return transactions
        .filter((item) => !filter.month || item.date.slice(0, 7) === filter.month)
        .filter((item) => filter.type === "all" || item.type === filter.type)
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
        .map(copyTransaction);
    }

    function summary(month) {
      const monthly = list({ month, type: "all" });
      const income = sum(monthly.filter((item) => item.type === "income"));
      const expenseItems = monthly.filter((item) => item.type === "expense");
      const expense = sum(expenseItems);
      const categories = categoryTotals(expenseItems);

      return {
        income,
        expense,
        balance: income - expense,
        categories
      };
    }

    function exportRows(month) {
      return list({ month, type: "all" }).map((item) => ({
        date: item.date,
        type: item.type,
        category: item.category,
        note: item.note,
        amount: item.amount
      }));
    }

    return {
      add,
      exportRows,
      list,
      remove,
      summary
    };
  }

  function sum(items) {
    return items.reduce((total, item) => total + item.amount, 0);
  }

  function categoryTotals(items) {
    const totals = new Map();

    items.forEach((item) => {
      totals.set(item.category, (totals.get(item.category) || 0) + item.amount);
    });

    return Array.from(totals.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount || a.category.localeCompare(b.category));
  }

  function normalizeDate(value) {
    const date = String(value || "").trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "";
  }

  function copyTransaction(item) {
    return {
      id: item.id,
      type: item.type === "income" ? "income" : "expense",
      amount: Math.round(Number(item.amount)),
      category: String(item.category || "其他"),
      date: String(item.date || ""),
      note: String(item.note || "")
    };
  }

  global.createLedgerStore = createLedgerStore;

  if (typeof module !== "undefined") {
    module.exports = { createLedgerStore };
  }
})(typeof window !== "undefined" ? window : globalThis);

