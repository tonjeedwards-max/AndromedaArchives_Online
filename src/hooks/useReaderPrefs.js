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
  Object.values(prefs.history || {}).forEach((entry) => {
    if (!entry?.storyId) return;
    const chapterNumber = Number(entry.chapterNumber ?? entry.chapterId);
    if (Number.isInteger(chapterNumber)) {
      read[getReadChapterKey(entry.storyId, chapterNumber)] = true;
    }
  });
  return read;
}

function normalizeHistory(prefs) {
  const normalized = {};
  Object.values(prefs.history || {}).forEach((entry) => {
    if (!entry?.storyId) return;
    const storyKey = getHistoryKey(entry.storyId);
    if (!storyKey) return;
    const chapterNumber = Number(entry.chapterNumber ?? entry.chapterId);
    if (!Number.isInteger(chapterNumber)) return;

    const existing = normalized[storyKey];
    const existingChapter = Number(existing?.chapterNumber);
    const isNewerChapter = !Number.isInteger(existingChapter) || chapterNumber > existingChapter;
    const existingReadAt = existing?.readAt ? new Date(existing.readAt).getTime() : 0;
    const entryReadAt = entry?.readAt ? new Date(entry.readAt).getTime() : 0;

    if (!existing || isNewerChapter || entryReadAt > existingReadAt) {
      normalized[storyKey] = {
        ...existing,
        ...entry,
        historyKey: storyKey,
        chapterNumber: isNewerChapter ? chapterNumber : existingChapter,
      };
    }
  });
  return normalized;
}

function normalizePrefs(prefs) {
  const history = normalizeHistory(prefs);
  const readChapters = normalizeReadChapters({ ...prefs, history });
  return { ...prefs, history, readChapters };
}

export function useReaderPrefs() {
  const [prefs, setPrefs] = useState(() => {
    const initial = load();
    const normalized = normalizePrefs(initial);
    if (JSON.stringify(normalized) !== JSON.stringify(initial)) save(normalized);
    return normalized;
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

  const history = prefs.history || {};
  const addToHistory = useCallback((entry) => {
    update((prev) => {
      const chapterNumber = Number(entry.chapterNumber ?? entry.chapterId);
      const storyKey = getHistoryKey(entry.storyId);
      if (!storyKey || !Number.isInteger(chapterNumber)) return prev;

      const existing = (prev.history || {})[storyKey] || {};
      const existingChapter = Number(existing.chapterNumber);
      const latestChapter = Number.isInteger(existingChapter)
        ? Math.max(existingChapter, chapterNumber)
        : chapterNumber;
      const readChapters = normalizeReadChapters(prev);
      readChapters[getReadChapterKey(storyKey, chapterNumber)] = true;

      const historyEntry = {
        ...existing,
        ...entry,
        storyId: storyKey,
        chapterNumber: latestChapter,
        historyKey: storyKey,
        readAt: new Date().toISOString(),
      };

      if (Number.isInteger(existingChapter) && chapterNumber < existingChapter) {
        historyEntry.chapterNumber = existingChapter;
        historyEntry.title = existing.title;
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
