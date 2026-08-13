import { useMemo } from "react";
import { useReaderPrefs } from "./useReaderPrefs";

export function useRecommendations(stories) {
  const { history, favourites } = useReaderPrefs();

  return useMemo(() => {
    // Collect story_codes the user has read or favourited
    const readCodes = new Set();
    Object.values(history || {}).forEach((entry) => {
      if (entry.storyId) readCodes.add(entry.storyId);
    });
    Object.values(favourites || {}).forEach((entry) => {
      if (entry.storyId) readCodes.add(entry.storyId);
    });

    // Need at least 1 read story to make recommendations
    if (readCodes.size === 0) return null;

    // Build tag frequency map from read stories (weighted: favourites count more)
    const tagFreq = {};
    stories.forEach((s) => {
      if (readCodes.has(s.story_code) && s.tags) {
        const weight = Object.values(favourites || {}).some((f) => f.storyId === s.story_code) ? 2 : 1;
        s.tags.forEach((tag) => {
          tagFreq[tag] = (tagFreq[tag] || 0) + weight;
        });
      }
    });

    // Score unread, non-hidden, non-hiatus stories by tag overlap
    // (prefer ongoing = in_production, then completed = in_orbit)
    const candidates = stories
      .filter((s) => !s.hidden && !readCodes.has(s.story_code) && s.status !== "lost_in_space")
      .map((s) => {
        const tagScore = (s.tags || []).reduce((sum, tag) => sum + (tagFreq[tag] || 0), 0);
        const statusBoost = s.status === "in_production" ? 0.5 : 0;
        return { ...s, _score: tagScore + statusBoost };
      })
      .sort((a, b) => b._score - a._score);

    return candidates.length > 0 ? candidates[0] : null;
  }, [stories, history, favourites]);
}
