/* Krishan Astrologer — classical knowledge-base loader.
 * Reads data/books.json, then every book file listed there (same format as data/bphs.json).
 * Entries are indexed by id and by topic+match, so another book (e.g. Phaladeepika) can add
 * rules for the same topic/match and they will be shown alongside the primary book's rule.
 */
window.KB = (function () {
  const state = { ready: false, books: {}, byId: {}, byKey: {}, primary: null };
  const keyOf = (topic, match) => topic + "|" + Object.keys(match || {}).sort().map(k => k + "=" + match[k]).join("&");

  async function load() {
    try {
      const cfg = await (await fetch("data/books.json", { cache: "no-cache" })).json();
      for (const b of cfg.books) {
        const data = await (await fetch(b.file, { cache: "no-cache" })).json();
        const book = Object.assign({}, data.book, { primary: !!b.primary });
        state.books[book.id] = book;
        if (book.primary && !state.primary) state.primary = book.id;
        for (const e of data.entries) {
          e._book = book.id;
          state.byId[e.id] = e;
          const k = keyOf(e.topic, e.match);
          (state.byKey[k] = state.byKey[k] || []).push(e);
        }
      }
      // primary book first within every key
      for (const k in state.byKey) state.byKey[k].sort((a, b) => (state.books[b._book].primary ? 1 : 0) - (state.books[a._book].primary ? 1 : 0));
      state.ready = true;
      document.dispatchEvent(new Event("kb-ready"));
    } catch (err) {
      console.warn("Knowledge base could not be loaded:", err);
    }
  }

  return {
    load,
    get ready() { return state.ready; },
    book: id => state.books[id],
    primaryBook: () => state.books[state.primary],
    get: id => state.byId[id],
    /** all entries for a topic + match, primary book first */
    findAll: (topic, match) => state.byKey[keyOf(topic, match)] || [],
    /** the primary rule for a topic + match */
    find: (topic, match) => (state.byKey[keyOf(topic, match)] || [])[0],
  };
})();
