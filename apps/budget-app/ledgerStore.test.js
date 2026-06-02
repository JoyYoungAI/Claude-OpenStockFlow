const assert = require("node:assert/strict");
const { createLedgerStore } = require("./ledgerStore");

const store = createLedgerStore([
  { id: 1, type: "income", amount: 50000, category: "薪資", date: "2026-05-01", note: "薪水" },
  { id: 2, type: "expense", amount: 1200, category: "餐飲", date: "2026-05-02", note: "午餐" },
  { id: 3, type: "expense", amount: 800, category: "交通", date: "2026-05-03", note: "捷運" },
  { id: 4, type: "expense", amount: 400, category: "餐飲", date: "2026-04-28", note: "咖啡" }
]);

assert.deepEqual(store.summary("2026-05"), {
  income: 50000,
  expense: 2000,
  balance: 48000,
  categories: [
    { category: "餐飲", amount: 1200 },
    { category: "交通", amount: 800 }
  ]
});

assert.equal(store.add({ type: "expense", amount: "99", category: "其他", date: "2026-05-04", note: "fee" }).amount, 99);
assert.equal(store.add({ type: "expense", amount: "0", category: "其他", date: "2026-05-04" }), null);
assert.equal(store.add({ type: "expense", amount: "99", category: "其他", date: "bad-date" }), null);
assert.equal(store.list({ month: "2026-05", type: "expense" }).length, 3);

const first = store.list({ month: "2026-05", type: "all" })[0];
assert.equal(store.remove(first.id), true);
assert.equal(store.remove(999), false);
assert.equal(store.exportRows("2026-05").every((row) => row.date.startsWith("2026-05")), true);

console.log("ledgerStore tests passed");

