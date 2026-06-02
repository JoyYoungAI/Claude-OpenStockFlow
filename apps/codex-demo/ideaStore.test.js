const assert = require("node:assert/strict");
const { createIdeaStore } = require("./ideaStore");

const store = createIdeaStore([
  { id: 1, title: "Done item", done: true },
  { id: 2, title: "Active item", done: false }
]);

assert.deepEqual(store.stats(), {
  total: 2,
  active: 1,
  done: 1
});

assert.equal(store.add("  New idea  ").title, "New idea");
assert.equal(store.add("   "), null);
assert.equal(store.list("all").length, 3);
assert.equal(store.list("active").length, 2);

const active = store.list("active")[0];
store.toggle(active.id);
assert.equal(store.list("done").length, 2);

assert.equal(store.remove(999), false);
assert.equal(store.remove(active.id), true);
assert.equal(store.stats().total, 2);

console.log("ideaStore tests passed");

