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

export function getHistoryKey(storyId) {
  return String(storyId || "");
}

export function getReadChapterKey(storyId, chapterNumber) {
  return `${storyId}:${chapterNumber}`;
}

function normalizeReadChapters(prefs) {
  const read = { ...(prefs.readChapters || {}) };
  // Migrate the previous per-chapter history entries into the read-chapter set.
  Object.values(prefs.history || {}).forEach((entry) => {
    if (!entry?.storyId) return;
    const chapterNumber = Number(entry.chapterNumber ?? entry.chapterId);
    if (Number.isInteger(chapterNumber)) {
      read[getReadChapterKey(entry.storyId, chapterNumber)] = true;
    }
  });
  return read;
}

export function useReaderPrefs() {
  const [prefs, setPrefs] = useState(() => {
    const initial = load();
    const readChapters = normalizeReadChapters(initial);
    if (Object.keys(readChapters).length !== Object.keys(initial.readChapters || {}).length) {
      const migrated = { ...initial, readChapters };
      save(migrated);
      return migrated;
    }
    return initial;
  });

  const update = useCallback((updater) => {
    setPrefs((prev) => {
      const next = typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
      save(next);
      return next;
    });
  }, []);

  const nightMode = prefs.nightMode ?? false;
  const setNightMode = (val) => update({ nightMode: val });

  // History is one entry per story. Reading a newer chapter updates that story's
  // entry to the furthest chapter reached; reading an older chapter never moves it backwards.
  const history = prefs.history || {};
  const addToHistory = useCallback((entry) => {
    update((prev) => {
      const chapterNumber = Number(entry.chapterNumber ?? entry.chapterId);
      const storyKey = getHistoryKey(entry.storyId);
      const existing = (prev.history || {})[storyKey] || {};
      const existingChapter = Number(existing.chapterNumber);
      const latestChapter = Number.isInteger(existingChapter) && Number.isInteger(chapterNumber)
        ? Math.max(existingChapter, chapterNumber)
        : chapterNumber;
      const readChapters = normalizeReadChapters(prev);

      if (entry.storyId && Number.isInteger(chapterNumber)) {
        readChapters[getReadChapterKey(entry.storyId, chapterNumber)] = true;
      }

      const historyEntry = {
        ...existing,
        ...entry,
        chapterNumber: latestChapter,
        historyKey: storyKey,
        readAt: new Date().toISOString(),
      };

      // Keep the timestamp tied to the latest chapter reached, while rereading an
      // older chapter can still refresh the entry without changing its destination.
      if (Number.isInteger(existingChapter) && Number.isInteger(chapterNumber) && chapterNumber < existingChapter) {
        historyEntry.chapterNumber = existingChapter;
      }

      return {
        ...prev,
        history: { ...(prev.history || {}), [storyKey]: historyEntry },
        readChapters,
      };
    });
  }, [update]);

  const updateHistoryPosition = useCallback((chapterOrKey, position, storyId = null) => {
    update((prev) => {
      const h = prev.history || {};
      const key = storyId ? getHistoryKey(storyId) : String(chapterOrKey);
      if (!h[key]) return prev;
      return { ...prev, history: { ...h, [key]: { ...h[key], ...position } } };
    });
  }, [update]);

  const readChapters = prefs.readChapters || {};
  const isChapterRead = useCallback((storyId, chapterNumber) => {
    return Boolean(readChapters[getReadChapterKey(storyId, chapterNumber)]);
  }, [readChapters]);

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
    readChapters, isChapterRead,
    bookmarks, isBookmarked, toggleBookmark,
    favourites, isFavourited, toggleFavourite,
  };
}
