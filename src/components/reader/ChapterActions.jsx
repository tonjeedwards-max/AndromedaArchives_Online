import React from "react";
import { Bookmark, Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function ChapterActions({ chapterId, storyId, chapterTitle, storyTitle, nightMode, readerPrefs }) {
  const { isBookmarked, toggleBookmark, isFavourited, toggleFavourite } = readerPrefs;

  const entry = { chapterId, storyId, title: chapterTitle, storyTitle };

  const bookmarked = isBookmarked(chapterId);
  const favourited = isFavourited(chapterId);

  return (
    <div className="flex items-center gap-2">
      {/* Bookmark */}
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={() => toggleBookmark(entry)}
        title={bookmarked ? "Remove bookmark" : "Bookmark chapter"}
        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
          bookmarked
            ? "border-primary/60 bg-primary/15 text-primary"
            : nightMode
            ? "border-white/15 text-gray-400 hover:border-white/30 hover:text-white"
            : "border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-700"
        }`}
      >
        <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? "fill-primary" : ""}`} />
        {bookmarked ? "Bookmarked" : "Bookmark"}
      </motion.button>

      {/* Favourite */}
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={() => toggleFavourite(entry)}
        title={favourited ? "Remove from favourites" : "Add to favourites"}
        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
          favourited
            ? "border-rose-400/60 bg-rose-400/15 text-rose-400"
            : nightMode
            ? "border-white/15 text-gray-400 hover:border-white/30 hover:text-white"
            : "border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-700"
        }`}
      >
        <Heart className={`w-3.5 h-3.5 ${favourited ? "fill-rose-400" : ""}`} />
        {favourited ? "Favourited" : "Favourite"}
      </motion.button>
    </div>
  );
}
