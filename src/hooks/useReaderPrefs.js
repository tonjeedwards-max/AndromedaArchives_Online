import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "andromeda_reader_prefs";

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useReaderPrefs() {
  const [prefs, setPrefs] = useState(load);

  const update = useCallback((updater) => {
    setPrefs((prev) => {
      const next = typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
      save(next);
      return next;
    });
  }, []);

  // ── Night mode ────────────────────────────────────────────────
  const nightMode = prefs.nightMode ?? false;
  const setNightMode = (val) => update({ nightMode: val });

  // ── Reading history  { chapterId: { storyId, title, storyTitle, readAt } }
  const history = prefs.history || {};
  const addToHistory = useCallback((entry) => {
    update((prev) => {
      const existing = (prev.history || {})[entry.chapterId] || {};
      return {
        ...prev,
        history: {
          ...(prev.history || {}),
          [entry.chapterId]: { ...existing, ...entry, readAt: new Date().toISOString() },
        },
      };
    });
  }, [update]);

  // Update saved reading position (scroll % or manga page) without resetting readAt
  const updateHistoryPosition = useCallback((chapterId, position) => {
    update((prev) => {
      const h = prev.history || {};
      if (!h[chapterId]) return prev;
      return { ...prev, history: { ...h, [chapterId]: { ...h[chapterId], ...position } } };
    });
  }, [update]);

  // ── Bookmarks  { chapterId: { storyId, title, storyTitle, addedAt } }
  const bookmarks = prefs.bookmarks || {};
  const toggleBookmark = useCallback((entry) => {
    update((prev) => {
      const bm = { ...(prev.bookmarks || {}) };
      if (bm[entry.chapterId]) {
        delete bm[entry.chapterId];
      } else {
        bm[entry.chapterId] = { ...entry, addedAt: new Date().toISOString() };
      }
      return { ...prev, bookmarks: bm };
    });
  }, [update]);
  const isBookmarked = (chapterId) => !!bookmarks[chapterId];

  // ── Favourites  { chapterId: { storyId, title, storyTitle, addedAt } }
  const favourites = prefs.favourites || {};
  const toggleFavourite = useCallback((entry) => {
    update((prev) => {
      const fav = { ...(prev.favourites || {}) };
      if (fav[entry.chapterId]) {
        delete fav[entry.chapterId];
      } else {
        fav[entry.chapterId] = { ...entry, addedAt: new Date().toISOString() };
      }
      return { ...prev, favourites: fav };
    });
  }, [update]);
  const isFavourited = (chapterId) => !!favourites[chapterId];

  return {
    nightMode, setNightMode,
    history, addToHistory, updateHistoryPosition,
    bookmarks, isBookmarked, toggleBookmark,
    favourites, isFavourited, toggleFavourite,
  };
}
