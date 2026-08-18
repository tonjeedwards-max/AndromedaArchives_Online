import React, { useEffect, useState } from "react";
import { Bookmark, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/api/supabaseClient";
import { getReaderToken } from "@/lib/readerIdentity";

export default function ChapterActions({ chapterId, storyId, chapterTitle, storyTitle, nightMode, readerPrefs }) {
  const { isBookmarked, toggleBookmark, isFavourited, toggleFavourite } = readerPrefs;
  const [syncedBookmark, setSyncedBookmark] = useState(false);
  const [syncedFavourite, setSyncedFavourite] = useState(false);
  const entry = { chapterId, storyId, title: chapterTitle, storyTitle };
  const bookmarked = isBookmarked(chapterId) || syncedBookmark;
  const favourited = isFavourited(chapterId) || syncedFavourite;
  const token = getReaderToken();

  useEffect(() => {
    if (!supabase || !chapterId) return;
    (async () => {
      const [{ data: bm }, { data: fav }] = await Promise.all([
        supabase.from("chapter_bookmarks").select("id").eq("chapter_id", Number(chapterId)).eq("reader_token", token).maybeSingle(),
        supabase.from("chapter_favorites").select("id").eq("chapter_id", Number(chapterId)).eq("reader_token", token).maybeSingle(),
      ]);
      setSyncedBookmark(Boolean(bm));
      setSyncedFavourite(Boolean(fav));
    })();
  }, [chapterId, token]);

  const toggleBackend = async (table, active, setter) => {
    if (!supabase || !chapterId) return;
    if (active) {
      await supabase.from(table).delete().eq("chapter_id", Number(chapterId)).eq("reader_token", token);
      setter(false);
    } else {
      const { error } = await supabase.from(table).insert({ chapter_id: Number(chapterId), reader_token: token });
      if (!error) setter(true);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <motion.button whileTap={{ scale: 0.85 }} onClick={() => { toggleBookmark(entry); toggleBackend("chapter_bookmarks", bookmarked, setSyncedBookmark); }} title={bookmarked ? "Remove bookmark" : "Bookmark chapter"} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${bookmarked ? "border-primary/60 bg-primary/15 text-primary" : nightMode ? "border-white/15 text-gray-400 hover:border-white/30 hover:text-white" : "border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-700"}`}>
        <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? "fill-primary" : ""}`} />{bookmarked ? "Bookmarked" : "Bookmark"}
      </motion.button>
      <motion.button whileTap={{ scale: 0.85 }} onClick={() => { toggleFavourite(entry); toggleBackend("chapter_favorites", favourited, setSyncedFavourite); }} title={favourited ? "Remove from favourites" : "Add to favourites"} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${favourited ? "border-rose-400/60 bg-rose-400/15 text-rose-400" : nightMode ? "border-white/15 text-gray-400 hover:border-white/30 hover:text-white" : "border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-700"}`}>
        <Heart className={`w-3.5 h-3.5 ${favourited ? "fill-rose-400" : ""}`} />{favourited ? "Favourited" : "Favourite"}
      </motion.button>
    </div>
  );
}
