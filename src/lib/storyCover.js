// Local optimized cover assets live in public/bookcovers and use the story code as filename.
// The display ratio matches a standard Kindle-style 1600x2560 cover, reduced 50% to 800x1280.
export const COVER_WIDTH = 800;
export const COVER_HEIGHT = 1280;

export function getOptimizedCover(story) {
  const code = story?.story_code;
  return code ? `/bookcovers/${encodeURIComponent(code)}.webp` : story?.cover_image || "";
}
