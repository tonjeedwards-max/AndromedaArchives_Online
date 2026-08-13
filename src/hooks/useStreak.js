import React, { useState, useEffect } from "react";

const STORAGE_KEY = "streakData";

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function daysBetween(d1, d2) {
  const one = new Date(d1 + "T00:00:00");
  const two = new Date(d2 + "T00:00:00");
  return Math.round((two - one) / 86400000);
}

function loadData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getBadgeTier(count) {
  if (count >= 42) return "supernova";
  if (count >= 21) return "comet";
  if (count >= 7) return "asteroid";
  return null;
}

export function computeStreak() {
  const data = loadData();
  const today = todayStr();
  const lastActive = data.lastActiveDate;

  if (!lastActive) {
    saveData({ lastActiveDate: today, streak: 1, graceDays: 0 });
    return { count: 1, inGrace: false, graceDaysLeft: 0, badgeTier: null };
  }

  const gap = daysBetween(lastActive, today);

  if (gap <= 0) {
    return {
      count: data.streak || 0,
      inGrace: (data.graceDays || 0) > 0,
      graceDaysLeft: data.graceDays || 0,
      badgeTier: getBadgeTier(data.streak || 0),
    };
  }

  if (gap === 1) {
    const newStreak = (data.streak || 0) + 1;
    saveData({ lastActiveDate: today, streak: newStreak, graceDays: 0 });
    return { count: newStreak, inGrace: false, graceDaysLeft: 0, badgeTier: getBadgeTier(newStreak) };
  }

  if (gap <= 4) {
    const newStreak = (data.streak || 0) + 1;
    const graceUsed = gap - 1;
    saveData({ lastActiveDate: today, streak: newStreak, graceDays: 0 });
    return { count: newStreak, inGrace: false, graceDaysLeft: 3 - graceUsed, badgeTier: getBadgeTier(newStreak) };
  }

  saveData({ lastActiveDate: today, streak: 1, graceDays: 0 });
  return { count: 1, inGrace: false, graceDaysLeft: 0, badgeTier: null };
}

export function useStreak() {
  const [streak, setStreak] = useState(() => computeStreak());

  useEffect(() => {
    const handler = () => setStreak(computeStreak());
    window.addEventListener("focus", handler);
    return () => window.removeEventListener("focus", handler);
  }, []);

  return streak;
}
