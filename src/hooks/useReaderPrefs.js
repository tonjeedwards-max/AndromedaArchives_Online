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

export function getHistoryKey(storyId, chapterNumber) {
  return `${storyId}:${chapterNumber}`;
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

  const nightMode = prefs.nightMode ?? false;
  const setNightMode = (val) => update({ nightMode: val });

  const history = prefs.history || {};
  const addToHistory = useCallback((entry) => {
    update((prev) => {
      const chapterNumber = entry.chapterNumber ?? entry.chapterId;
      const key = entry.historyKey || getHistoryKey(entry.storyId, chapterNumber);
      const existing = (prev.history || {})[key] || {};
      return {
        ...prev,
        history: {
          ...(prev.history || {}),
          [key]: {
            ...existing,
            ...entry,
            chapterNumber,
            historyKey: key,
            readAt: new Date().toISOString(),
          },
        },
      };
    });
  }, [update]);

  const updateHistoryPosition = useCallback((chapterOrKey, position, storyId = null) => {
    update((prev) => {
      const h = prev.history || {};
      const key = storyId
        ? getHistoryKey(storyId, chapterOrKey)
        : String(chapterOrKey);
      if (!h[key]) return prev;
      return { ...prev, history: { ...h, [key]: { ...h[key], ...position } } };
    });
  }, [update]);

  const bookmarks = prefs.bookmarks || {};
  const toggleBookmark = useCallback((entry) => {
    update((prev) => {
      const bm = { ...(prev.bookmarks || {}) };
      if (bm[entry.chapterId]) delete bm[entry.chapterId];
      else bm[entry.chapterId] = { ...entry, addedAt: new Date().toISOString() };
      return { ...prev, bookmarks: bm };
    });
  }, [update]);
  const isBookmarked = (chapterId) => !!bookmarks[chapterId];

  const favourites = prefs.favourites || {};
  const toggleFavourite = useCallback((entry) => {
    update((prev) => {
      const fav = { ...(prev.favourites || {}) };
      if (fav[entry.chapterId]) delete fav[entry.chapterId];
      else fav[entry.chapterId] = { ...entry, addedAt: new Date().toISOString() };
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
