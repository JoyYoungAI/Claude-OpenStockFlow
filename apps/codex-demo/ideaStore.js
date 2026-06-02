(function (global) {
  function createIdeaStore(initialIdeas) {
    let ideas = Array.isArray(initialIdeas) ? initialIdeas.map(copyIdea) : [];
    let nextId = ideas.reduce((max, idea) => Math.max(max, idea.id), 0) + 1;

    function list(filter) {
      if (filter === "active") {
        return ideas.filter((idea) => !idea.done).map(copyIdea);
      }

      if (filter === "done") {
        return ideas.filter((idea) => idea.done).map(copyIdea);
      }

      return ideas.map(copyIdea);
    }

    function add(title) {
      const normalizedTitle = String(title || "").trim();

      if (!normalizedTitle) {
        return null;
      }

      const idea = {
        id: nextId,
        title: normalizedTitle,
        done: false
      };

      nextId += 1;
      ideas = [idea].concat(ideas);
      return copyIdea(idea);
    }

    function toggle(id) {
      let updated = null;

      ideas = ideas.map((idea) => {
        if (idea.id !== id) {
          return idea;
        }

        updated = Object.assign({}, idea, { done: !idea.done });
        return updated;
      });

      return updated ? copyIdea(updated) : null;
    }

    function remove(id) {
      const before = ideas.length;
      ideas = ideas.filter((idea) => idea.id !== id);
      return ideas.length !== before;
    }

    function stats() {
      const done = ideas.filter((idea) => idea.done).length;

      return {
        total: ideas.length,
        active: ideas.length - done,
        done
      };
    }

    return {
      add,
      list,
      remove,
      stats,
      toggle
    };
  }

  function copyIdea(idea) {
    return {
      id: idea.id,
      title: idea.title,
      done: Boolean(idea.done)
    };
  }

  global.createIdeaStore = createIdeaStore;

  if (typeof module !== "undefined") {
    module.exports = { createIdeaStore };
  }
})(typeof window !== "undefined" ? window : globalThis);

